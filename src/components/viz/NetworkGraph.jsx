import { useEffect, useMemo, useRef, useState } from "react";
import {
   forceSimulation,
   forceLink,
   forceManyBody,
   forceCenter,
   forceCollide,
   select,
   drag,
} from "d3";
import { computeSimilarityMatrix } from "@/lib/similarity";

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
   const wrapperRef = useRef(null);
   const draggingRef = useRef(false);
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
         return {
            id: nr,
            index: i,
            label: org?.abkürzung || org?.organisation || `Org ${nr}`,
            fullName: org?.organisation || `Organisation ${nr}`,
            themeCount: themeSets.get(nr)?.size ?? 0,
         };
      });
      const max = Math.max(...data.map((d) => d.themeCount), 1);
      return { nodeData: data, maxThemeCount: max };
   }, [orgNrs, orgMap, themeSets]);

   const radius = (themeCount) => 2 + (themeCount / maxThemeCount) * 9;

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

      // Copy nodes, preserve positions from previous run if available
      const prevPositions = nodesRef.current;
      const simNodes = nodeData.map((d) => {
         const prev = prevPositions?.find((p) => p.id === d.id);
         return prev ? { ...d, x: prev.x, y: prev.y } : { ...d };
      });
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
         .attr("fill", "#d97757")
         .attr("stroke", "#3e3e38")
         .attr("stroke-width", 1);

      // Labels with halo for readability over edges
      nodeGroup
         .append("text")
         .text((d) => d.label)
         .attr("dy", "0.35em")
         .attr("fill", "#c3c0b6")
         .attr("font-size", "7px")
         .attr("stroke", "#262624")
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
            linkLayer.selectAll("line")
               .attr("stroke-opacity", (l) => {
                  const sId = typeof l.source === "object" ? l.source.id : l.source;
                  const tId = typeof l.target === "object" ? l.target.id : l.target;
                  return sId === d.id || tId === d.id
                     ? 0.4 + l.similarity * 0.6
                     : 0.03;
               });

            const rect = wrapperRef.current?.getBoundingClientRect();
            if (rect) {
               setHover({
                  node: d,
                  x: event.clientX - rect.left,
                  y: event.clientY - rect.top,
                  wrapperW: rect.width,
                  wrapperH: rect.height,
                  connected,
               });
            }
         })
         .on("mousemove", (event) => {
            if (draggingRef.current) return;
            const rect = wrapperRef.current?.getBoundingClientRect();
            if (rect) {
               setHover((prev) =>
                  prev
                     ? { ...prev, x: event.clientX - rect.left, y: event.clientY - rect.top, wrapperW: rect.width, wrapperH: rect.height }
                     : null,
               );
            }
         })
         .on("mouseleave", () => {
            nodeGroup.attr("opacity", 1);
            linkLayer.selectAll("line")
               .attr("stroke-opacity", (l) => 0.1 + l.similarity * 0.5);
            setHover(null);
         })
         .on("click", (_event, d) => {
            if (!draggingRef.current) onNavRef.current(d.id);
         });

      // Drag
      nodeGroup.call(
         drag()
            .on("start", (event, d) => {
               draggingRef.current = true;
               setHover(null);
               if (!event.active) simulation.alphaTarget(0.3).restart();
               d.fx = d.x;
               d.fy = d.y;
            })
            .on("drag", (event, d) => {
               d.fx = event.x;
               d.fy = event.y;
            })
            .on("end", (event, d) => {
               if (!event.active) simulation.alphaTarget(0);
               d.fx = null;
               d.fy = null;
               // Delay reset so click doesn't fire
               setTimeout(() => { draggingRef.current = false; }, 50);
            }),
      );

      // Simulation
      const simulation = forceSimulation(simNodes)
         .force("charge", forceManyBody().strength(-120).distanceMax(300))
         .force("center", forceCenter(VB_W / 2, VB_H / 2))
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
      simulation._links = [];
      simRef.current = simulation;

      return () => {
         simulation.stop();
      };
   }, [nodeData, maxThemeCount]);

   // Update links when threshold changes — without rebuilding simulation
   useEffect(() => {
      const simulation = simRef.current;
      if (!simulation) return;

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
      linkLayer.selectAll("line").remove();
      linkLayer
         .selectAll("line")
         .data(simLinks)
         .join("line")
         .attr("stroke", "#b7b5a9")
         .attr("stroke-opacity", (d) => 0.1 + d.similarity * 0.5)
         .attr("stroke-width", (d) => 0.5 + d.similarity * 2.5);

      // Brief reheat so layout adjusts to new links
      simulation.alpha(0.3).restart();
   }, [links]);

   // Clamp tooltip to stay within container
   const tooltipStyle = useMemo(() => {
      if (!hover) return {};

      let left = hover.x + 14;
      let top = hover.y - 12;
      // Push left if near right edge (estimate tooltip ~220px wide)
      if (hover.wrapperW && left + 220 > hover.wrapperW) left = hover.x - 230;
      // Push up if near bottom
      if (hover.wrapperH && top + 60 > hover.wrapperH) top = hover.y - 60;

      return { left, top };
   }, [hover]);

   return (
      <div ref={wrapperRef} className="relative">
         <div className="flex items-center gap-4 mb-4">
            <label htmlFor="similarity-threshold" className="text-xs text-muted-foreground whitespace-nowrap">
               Schwellenwert (Jaccard): {Math.round(threshold * 100)}%
            </label>
            <input
               id="similarity-threshold"
               type="range"
               min={0.05}
               max={0.5}
               step={0.05}
               value={threshold}
               onChange={(e) => setThreshold(parseFloat(e.target.value))}
               className="w-48 accent-primary"
            />
            <span className="text-xs text-muted-foreground">
               {links.length} {links.length !== 1 ? "Verbindungen" : "Verbindung"}
            </span>
         </div>
         <svg
            ref={svgRef}
            viewBox={`0 0 ${VB_W} ${VB_H}`}
            className="w-full overflow-visible"
            style={{ aspectRatio: `${VB_W} / ${VB_H}` }}
            role="img"
            aria-label="Netzwerkgraph der thematischen Ähnlichkeit zwischen Organisationen"
         />
         {hover && (
            <div
               className="absolute pointer-events-none bg-popover border border-border rounded-md px-3 py-2 text-xs text-popover-foreground z-50"
               style={tooltipStyle}
            >
               <div className="font-medium">{hover.node.fullName}</div>
               <div className="text-muted-foreground mt-0.5">
                  {hover.node.themeCount} {hover.node.themeCount !== 1 ? "Themen" : "Thema"} · {hover.connected.size} {hover.connected.size !== 1 ? "Verbindungen" : "Verbindung"}
               </div>
            </div>
         )}
      </div>
   );
}
