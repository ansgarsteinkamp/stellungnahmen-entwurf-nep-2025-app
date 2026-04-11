import { useState, useMemo, useEffect, useRef } from "react";
import { ChevronRight, ChevronDown, ArrowRight, ArrowDownAZ, ArrowDownWideNarrow, Tag, AtSign } from "lucide-react";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import SearchInput from "@/components/custom/SearchInput";
import { getStatementText } from "@/lib/helpers";

export default function OrgView({ organisationen, themen, orgMap, kapitelOrder, selectedNr, onSelectNr, onNavigateToThema }) {
   const [search, setSearch] = useState("");
   const [sortBy, setSortBy] = useState("alpha");
   const [expandedStatements, setExpandedStatements] = useState(new Set());
   const [showAllThemes, setShowAllThemes] = useState(false);
   const detailRef = useRef(null);

   // Count themes per org (more meaningful than statement count)
   const themeCountByOrg = useMemo(() => {
      const counts = new Map();
      for (const t of themen) {
         for (const nr of t.organisationen) {
            counts.set(nr, (counts.get(nr) || 0) + 1);
         }
      }
      return counts;
   }, [themen]);

   const toggleStatement = id =>
      setExpandedStatements(prev => {
         const next = new Set(prev);
         if (next.has(id)) next.delete(id);
         else next.add(id);
         return next;
      });

   const filtered = useMemo(() => {
      const q = search.toLowerCase();
      return organisationen.filter(o => !q || o.organisation.toLowerCase().includes(q) || o.abkürzung.toLowerCase().includes(q));
   }, [organisationen, search]);

   const sorted = useMemo(() => {
      return [...filtered].sort((a, b) => (sortBy === "alpha" ? a.abkürzung.localeCompare(b.abkürzung, "de") : (themeCountByOrg.get(Number(b.nr)) || 0) - (themeCountByOrg.get(Number(a.nr)) || 0)));
   }, [filtered, sortBy, themeCountByOrg]);

   const selectedOrg = selectedNr ? orgMap.get(selectedNr) : null;

   const orgThemes = useMemo(() => {
      if (!selectedOrg) return [];
      const nr = Number(selectedOrg.nr);
      return themen.map((t, i) => ({ ...t, _idx: i })).filter(t => t.organisationen.includes(nr));
   }, [selectedOrg, themen]);

   const sortedStatements = useMemo(() => {
      if (!selectedOrg) return [];
      return [...selectedOrg.stellungnahmen].sort((a, b) => {
         const ai = kapitelOrder.indexOf(a.kapitel);
         const bi = kapitelOrder.indexOf(b.kapitel);
         return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
      });
   }, [selectedOrg, kapitelOrder]);

   // Reset expanded statements, scroll, and theme collapse when selection changes
   useEffect(() => {
      setExpandedStatements(new Set());
      setShowAllThemes(false);
      const viewport = detailRef.current?.querySelector('[data-slot="scroll-area-viewport"]');
      if (viewport) viewport.scrollTop = 0;
   }, [selectedNr]);

   // Auto-select first item if none selected
   useEffect(() => {
      if (selectedNr === null && sorted.length > 0) {
         onSelectNr(sorted[0].nr);
      }
   }, [selectedNr, sorted, onSelectNr]);

   const THEME_LIMIT = 8;
   const visibleThemes = showAllThemes ? orgThemes : orgThemes.slice(0, THEME_LIMIT);
   const hiddenCount = orgThemes.length - THEME_LIMIT;

   return (
      <div className="flex h-full max-w-[1600px] mx-auto">
         {/* Sidebar */}
         <div className="w-80 lg:w-[420px] xl:w-[480px] border-r border-border flex flex-col shrink-0 overflow-hidden">
            <div className="p-3 space-y-4 border-b border-border shrink-0">
               <SearchInput value={search} setValue={setSearch} placeholder="Name und Abkürzung der Organisationen durchsuchen..." size="sm" />
               <div className="flex gap-1">
                  {[
                     { key: "alpha", label: "A\u2013Z", icon: ArrowDownAZ },
                     { key: "count", label: "Anzahl Themen", icon: ArrowDownWideNarrow }
                  ].map(s => (
                     <button
                        key={s.key}
                        onClick={() => setSortBy(s.key)}
                        className={cn("flex items-center gap-1.5 px-2 py-0.5 text-xs rounded transition-colors", sortBy === s.key ? "bg-primary/20 text-primary" : "text-muted-foreground hover:text-foreground")}
                     >
                        <s.icon className="size-3" />
                        {s.label}
                     </button>
                  ))}
               </div>
            </div>
            <div className="flex-1 min-h-0">
               <ScrollArea className="h-full">
                  {sorted.map(o => (
                     <button
                        key={o.nr}
                        onClick={() => onSelectNr(o.nr)}
                        className={cn("w-full text-left px-3 py-2.5 border-b border-border/40 transition-colors", selectedNr === o.nr ? "bg-accent border-l-2 border-l-primary" : "hover:bg-accent/50")}
                     >
                        <div className="flex items-center gap-2">
                           <span className="text-sm font-medium text-primary">{o.abkürzung}</span>
                           <span className="text-xs text-muted-foreground">{themeCountByOrg.get(Number(o.nr)) || 0} Themen</span>
                        </div>
                        <div className="text-xs text-foreground/60 truncate mt-0.5">{o.organisation}</div>
                     </button>
                  ))}
                  {sorted.length === 0 && <div className="p-4 text-sm text-muted-foreground">Keine Organisationen gefunden.</div>}
               </ScrollArea>
            </div>
         </div>

         {/* Detail */}
         <ScrollArea className="flex-1" ref={detailRef}>
            {selectedOrg ? (
               <div className="p-6 lg:p-8">
                  <h1 className="text-xl font-medium text-foreground leading-snug">{selectedOrg.organisation}</h1>
                  <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                     <span className="flex items-center gap-1 text-primary font-medium"><Tag className="size-3.5" />{selectedOrg.abkürzung}</span>
                     <span className="flex items-center gap-1"><AtSign className="size-3.5" />{selectedOrg.email_endung}</span>
                  </div>

                  {/* Stellungnahmen */}
                  <div className="mt-5">
                     <h2 className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-3">
                        Ungekürzte Stellungnahmen zu einzelnen Kapiteln ({selectedOrg.stellungnahmen.length})
                     </h2>
                     <div className="space-y-1.5">
                        {sortedStatements.map(s => {
                           const id = s["#"];
                           const isExpanded = expandedStatements.has(id);
                           const text = getStatementText(s);
                           return (
                              <div key={id} className="rounded-lg border border-border/60 overflow-hidden">
                                 <button onClick={() => toggleStatement(id)} className="w-full flex items-center gap-2 px-3 py-2.5 text-left hover:bg-accent/50 transition-colors">
                                    {isExpanded ? <ChevronDown className="size-3.5 text-muted-foreground shrink-0" /> : <ChevronRight className="size-3.5 text-muted-foreground shrink-0" />}
                                    <span className="text-xs font-medium text-primary truncate">{s.kapitel}</span>
                                    {s.schlagworte.length > 0 && <span className="text-xs text-foreground/40 truncate ml-auto shrink-0 max-w-48">{s.schlagworte.join(", ")}</span>}
                                    {"dokument" in s && <span className="text-3xs uppercase text-muted-foreground bg-accent px-1 py-0.5 rounded shrink-0">PDF</span>}
                                 </button>
                                 {isExpanded && text && (
                                    <div className="px-3 pb-3 pt-2 border-t border-border/40">
                                       {s.schlagworte.length > 0 && (
                                          <div className="flex flex-wrap gap-1 mb-3">
                                             {s.schlagworte.map(sw => (
                                                <span
                                                   key={sw}
                                                   className="px-1.5 py-0.5 text-3xs bg-primary/10 text-primary rounded"
                                                >
                                                   {sw}
                                                </span>
                                             ))}
                                          </div>
                                       )}
                                       <p className="text-xs text-foreground/70 leading-relaxed whitespace-pre-line">{text}</p>
                                    </div>
                                 )}
                              </div>
                           );
                        })}
                     </div>
                  </div>

                  {/* Zusammenfassung */}
                  <div className="mt-8">
                     <h2 className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-2">Zusammenfassung der Stellungnahmen</h2>
                     <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-line">{selectedOrg.zusammenfassung}</p>
                  </div>

                  {/* Zugehörige Themen */}
                  {orgThemes.length > 0 && (
                     <div className="mt-8">
                        <h2 className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-2">Zugeordnete Themen ({orgThemes.length})</h2>
                        <div className="flex flex-wrap gap-1.5">
                           {visibleThemes.map(t => (
                              <button
                                 key={t._idx}
                                 onClick={() => onNavigateToThema(t._idx)}
                                 className="px-2 py-1 text-xs bg-accent hover:bg-primary/20 text-foreground/80 hover:text-foreground rounded transition-colors"
                              >
                                 {t.thema}
                              </button>
                           ))}
                           {!showAllThemes && hiddenCount > 0 && (
                              <button onClick={() => setShowAllThemes(true)} className="px-2 py-1 text-xs text-primary hover:text-primary/80 transition-colors">
                                 +{hiddenCount} weitere
                              </button>
                           )}
                           {showAllThemes && hiddenCount > 0 && (
                              <button onClick={() => setShowAllThemes(false)} className="px-2 py-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
                                 weniger
                              </button>
                           )}
                        </div>
                     </div>
                  )}
               </div>
            ) : (
               <div className="flex items-center justify-center h-full text-muted-foreground text-sm">Organisation aus der Liste auswählen</div>
            )}
         </ScrollArea>
      </div>
   );
}
