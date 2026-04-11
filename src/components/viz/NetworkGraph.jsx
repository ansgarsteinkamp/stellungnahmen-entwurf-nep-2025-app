import { useEffect, useMemo, useRef, useState } from "react";
import {
   forceSimulation,
   forceLink,
   forceManyBody,
   forceCenter,
   forceCollide,
   forceX,
   forceY,
   select,
   drag,
} from "d3";
import { computeSimilarityMatrix } from "@/lib/similarity";
import { Slider } from "@/components/ui/slider";

const VB_W = 900;
const VB_H = 500;
const PAD = 30;

export default function NetworkGraph({
   organisationen,
   themen,
   orgMap,
   onNavigateToOrg,
}) {
   const svgRef = useRef(null);
   const simRef = useRef(null);      // persistent simulation
   const nodesRef = useRef(null);     // persistent node positions
   const draggingRef = useRef(false);  // true while drag is active
   const onNavRef = useRef(onNavigateToOrg);
   onNavRef.current = onNavigateToOrg;
   const [threshold, setThreshold] = useState(0.15);
   const [hover, setHover] = useState(null);

   // Compute similarity data once (includes themeSets — no double computation)
   const { matrix, orgNrs, themeSets } = useMemo(
      () => computeSimilarityMatrix(organisationen, themen),
      [organisationen, themen],
   );

   // Stable node data — computed once, positions persist across threshold changes
   const { nodeData, maxThemeCount } = useMemo(() => {
      const data = orgNrs.map((nr, i) => {
         const org = orgMap.get(String(nr));
         const name = org?.abkürzung || org?.organisation || `Org ${nr}`;
         return {
            id: nr,
            label: name.length > 12 ? name.slice(0, 11) + "…" : name,
            fullName: org?.organisation || `Organisation ${nr}`,
            themeCount: themeSets.get(nr)?.size ?? 0,
         };
      });
      const max = Math.max(...data.map((d) => d.themeCount), 1);
      return { nodeData: data, maxThemeCount: max };
   }, [orgNrs, orgMap, themeSets]);

   const radius = (themeCount) => 2 + (themeCount / maxThemeCount) * 9;

   // Shared hover helpers (use refs so they work in both effects)
   const updateHoverPosition = (event) => {
      if (draggingRef.current) return;
      setHover((prev) =>
         prev ? { ...prev, x: event.clientX, y: event.clientY } : null,
      );
   };

   const resetHighlight = () => {
      const sim = simRef.current;
      if (!sim) return;
      sim._nodeGroup?.attr("opacity", 1);
      sim._linkLayer?.selectAll(".link-visible")
         .attr("stroke-opacity", (l) => 0.1 + l.similarity * 0.5);
      setHover(null);
   };

   // Links filtered by threshold (changes without destroying simulation)
   const links = useMemo(() => {
      const n = orgNrs.length;
      const list = [];
      for (let i = 0; i < n; i++) {
         for (let j = i + 1; j < n; j++) {
            const sim = matrix[i][j];
            if (sim >= threshold) {
               list.push({ source: orgNrs[i], target: orgNrs[j], similarity: sim });
            }
         }
      }
      return list;
   }, [orgNrs, matrix, threshold]);

   // One-time simulation setup
   useEffect(() => {
      const svg = select(svgRef.current);
      svg.selectAll("*").remove();

      const g = svg.append("g");

      const simNodes = nodeData.map((d) => ({ ...d }));
      nodesRef.current = simNodes;

      // Links layer (will be updated when threshold changes)
      const linkLayer = g.append("g");

      // Nodes
      const nodeGroup = g
         .append("g")
         .selectAll("g")
         .data(simNodes)
         .join("g")
         .style("cursor", "pointer");

      nodeGroup
         .append("circle")
         .attr("r", (d) => radius(d.themeCount))
         .attr("fill", "var(--primary)")
         .attr("stroke", "var(--border)")
         .attr("stroke-width", 1);

      // Labels with halo for readability over edges
      nodeGroup
         .append("text")
         .text((d) => d.label)
         .attr("dy", "0.35em")
         .attr("fill", "var(--foreground)")
         .attr("font-size", "7px")
         .attr("stroke", "var(--background)")
         .attr("stroke-width", 2.5)
         .attr("paint-order", "stroke")
         .style("pointer-events", "none")
         .style("user-select", "none");

      // Hover
      const getConnected = (nodeId) => {
         const connected = new Set();
         const currentLinks = simRef.current?._links ?? [];
         currentLinks.forEach((l) => {
            const sId = typeof l.source === "object" ? l.source.id : l.source;
            const tId = typeof l.target === "object" ? l.target.id : l.target;
            if (sId === nodeId) connected.add(tId);
            if (tId === nodeId) connected.add(sId);
         });
         return connected;
      };

      nodeGroup
         .on("mouseenter", (event, d) => {
            if (draggingRef.current) return;
            const connected = getConnected(d.id);

            nodeGroup.attr("opacity", (n) =>
               n.id === d.id || connected.has(n.id) ? 1 : 0.15,
            );
            linkLayer.selectAll(".link-visible")
               .attr("stroke-opacity", (l) => {
                  const sId = typeof l.source === "object" ? l.source.id : l.source;
                  const tId = typeof l.target === "object" ? l.target.id : l.target;
                  return sId === d.id || tId === d.id
                     ? 0.4 + l.similarity * 0.6
                     : 0.03;
               });

            setHover({
               node: d,
               x: event.clientX,
               y: event.clientY,
               connected,
            });
         })
         .on("mousemove", updateHoverPosition)
         .on("mouseleave", resetHighlight)
         .on("click", (_event, d) => {
            if (draggingRef.current) return;
            onNavRef.current(d.id);
         });

      // Drag
      nodeGroup.call(
         drag()
            .on("start", (event, d) => {
               setHover(null);
               if (!event.active) simulation.alphaTarget(0.3).restart();
               d.fx = d.x;
               d.fy = d.y;
            })
            .on("drag", (event, d) => {
               draggingRef.current = true;
               d.fx = event.x;
               d.fy = event.y;
            })
            .on("end", (event, d) => {
               if (!event.active) simulation.alphaTarget(0);
               // Keep draggingRef true briefly to suppress the click from mouseup
               setTimeout(() => { draggingRef.current = false; }, 0);
            }),
      );

      // Simulation
      const simulation = forceSimulation(simNodes)
         .force("charge", forceManyBody().strength(-120).distanceMax(300))
         .force("center", forceCenter(VB_W / 2, VB_H / 2))
         .force("x", forceX(VB_W / 2).strength(0.03))
         .force("y", forceY(VB_H / 2).strength(0.03))
         .force(
            "collide",
            forceCollide()
               .radius((d) => radius(d.themeCount) + 4)
               .iterations(3),
         )
         .on("tick", () => {
            for (const d of simNodes) {
               d.x = Math.max(PAD, Math.min(VB_W - PAD, d.x));
               d.y = Math.max(PAD, Math.min(VB_H - PAD, d.y));
            }

            linkLayer.selectAll("line")
               .attr("x1", (d) => d.source.x)
               .attr("y1", (d) => d.source.y)
               .attr("x2", (d) => d.target.x)
               .attr("y2", (d) => d.target.y);

            nodeGroup.attr("transform", (d) => `translate(${d.x},${d.y})`);

            // Flip labels for nodes near right edge
            nodeGroup.select("text").each(function (d) {
               const r = radius(d.themeCount) + 3;
               const onRight = d.x > VB_W * 0.7;
               select(this)
                  .attr("dx", onRight ? -r : r)
                  .attr("text-anchor", onRight ? "end" : "start");
            });
         });

      // Store references for link updates
      simulation._linkLayer = linkLayer;
      simulation._nodeGroup = nodeGroup;
      simulation._links = [];
      simRef.current = simulation;

      return () => {
         simulation.stop();
      };
   }, [nodeData]);

   // Update links when threshold changes — without rebuilding simulation
   useEffect(() => {
      const simulation = simRef.current;
      if (!simulation) return;

      resetHighlight(); // clear tooltip before destroying link DOM

      const simLinks = links.map((d) => ({ ...d }));
      simulation._links = simLinks;

      // Update link force
      simulation.force(
         "link",
         forceLink(simLinks)
            .id((d) => d.id)
            .distance((d) => 60 - d.similarity * 30)
            .strength((d) => 0.2 + d.similarity * 0.5),
      );

      // Redraw links
      const linkLayer = simulation._linkLayer;
      const nodeGroup = simulation._nodeGroup;
      linkLayer.selectAll("g").remove();

      const linkGroups = linkLayer
         .selectAll("g")
         .data(simLinks)
         .join("g");

      // Visible line
      linkGroups
         .append("line")
         .attr("class", "link-visible")
         .attr("stroke", "var(--muted-foreground)")
         .attr("stroke-opacity", (d) => 0.1 + d.similarity * 0.5)
         .attr("stroke-width", (d) => 0.5 + d.similarity * 2.5);

      // Invisible wider hit area
      linkGroups
         .append("line")
         .attr("class", "link-hit")
         .attr("stroke", "transparent")
         .attr("stroke-width", 8)
         .style("cursor", "default")
         .on("mouseenter", (event, d) => {
            if (draggingRef.current) return;
            const sId = typeof d.source === "object" ? d.source.id : d.source;
            const tId = typeof d.target === "object" ? d.target.id : d.target;

            // Compute shared themes
            const setA = themeSets.get(sId);
            const setB = themeSets.get(tId);
            const shared = [];
            if (setA && setB) {
               for (const idx of setA) {
                  if (setB.has(idx)) shared.push(themen[idx].thema);
               }
            }

            const sNode = nodesRef.current?.find((n) => n.id === sId);
            const tNode = nodesRef.current?.find((n) => n.id === tId);

            // Dim unrelated nodes and edges
            if (nodeGroup) {
               nodeGroup.attr("opacity", (n) =>
                  n.id === sId || n.id === tId ? 1 : 0.15,
               );
            }
            linkLayer.selectAll(".link-visible")
               .attr("stroke-opacity", (l) => {
                  const lsId = typeof l.source === "object" ? l.source.id : l.source;
                  const ltId = typeof l.target === "object" ? l.target.id : l.target;
                  return (lsId === sId && ltId === tId) || (lsId === tId && ltId === sId)
                     ? 0.4 + l.similarity * 0.6
                     : 0.03;
               });

            setHover({
               edge: {
                  sourceLabel: sNode?.label || `Org ${sId}`,
                  targetLabel: tNode?.label || `Org ${tId}`,
                  similarity: d.similarity,
                  sharedThemes: shared,
               },
               x: event.clientX,
               y: event.clientY,
            });
         })
         .on("mousemove", updateHoverPosition)
         .on("mouseleave", resetHighlight);

      // Brief reheat so layout adjusts to new links
      simulation.alpha(0.3).restart();
   }, [links, themeSets, themen]);

   const tooltipRef = useRef(null);
   const tooltipStyle = useMemo(() => {
      if (!hover) return {};
      const GAP = 14;
      const rect = tooltipRef.current?.getBoundingClientRect();
      const w = rect?.width ?? 200;
      const h = rect?.height ?? 60;
      let left = hover.x + GAP;
      let top = hover.y - 12;
      if (left + w > window.innerWidth - 8) left = hover.x - GAP - w;
      if (top + h > window.innerHeight - 8) top = hover.y - h;
      top = Math.max(8, top);
      return { position: "fixed", left, top };
   }, [hover]);

   return (
      <div className="relative">
         <div className="flex items-center gap-4 mb-4">
            <span className="text-xs text-muted-foreground whitespace-nowrap">
               Jaccard-Schwellenwert: {Math.round(threshold * 100)}%
            </span>
            <Slider
               min={5}
               max={50}
               step={5}
               value={[Math.round(threshold * 100)]}
               onValueChange={([v]) => setThreshold(v / 100)}
               aria-label="Jaccard-Schwellenwert"
               className="w-48"
            />
         </div>
         <svg
            ref={svgRef}
            viewBox={`0 0 ${VB_W} ${VB_H}`}
            className="w-full overflow-visible"
            style={{ aspectRatio: `${VB_W} / ${VB_H}` }}
            aria-label="Netzwerkgraph der Themen-Überlappung zwischen Organisationen"
         />
         {hover?.node && (
            <div
               ref={tooltipRef}
               className="pointer-events-none bg-popover border border-border rounded-md px-3 py-2 text-xs text-popover-foreground max-w-sm hyphens-auto z-50"
               style={tooltipStyle}
            >
               <div className="font-medium">{hover.node.fullName}</div>
               <div className="text-muted-foreground mt-0.5">
                  {hover.node.themeCount} {hover.node.themeCount !== 1 ? "Themen" : "Thema"} · {hover.connected.size} {hover.connected.size !== 1 ? "Verbindungen" : "Verbindung"}
               </div>
            </div>
         )}
         {hover?.edge && (
            <div
               ref={tooltipRef}
               className="pointer-events-none bg-popover border border-border rounded-md px-3 py-2 text-xs text-popover-foreground max-w-xl hyphens-auto z-50"
               style={tooltipStyle}
            >
               <div className="font-medium">{hover.edge.sourceLabel} — {hover.edge.targetLabel}</div>
               <div className="text-muted-foreground mt-0.5">
                  {hover.edge.sharedThemes.length} {hover.edge.sharedThemes.length !== 1 ? "gemeinsame Themen" : "gemeinsames Thema"} (Jaccard-Koeffizient: {Math.round(hover.edge.similarity * 100)}%)
               </div>
               {hover.edge.sharedThemes.length > 0 && (
                  <ul className="mt-1.5 space-y-0.5 text-muted-foreground">
                     {hover.edge.sharedThemes.map((t) => (
                        <li key={t} className="flex gap-1.5">
                           <span className="text-primary shrink-0">·</span>
                           <span>{t}</span>
                        </li>
                     ))}
                  </ul>
               )}
            </div>
         )}
      </div>
   );
}
