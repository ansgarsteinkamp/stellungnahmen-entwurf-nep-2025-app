import { useState, useMemo, useEffect, useRef } from "react";
import { ChevronRight, ChevronDown, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import SearchInput from "@/components/custom/SearchInput";

export default function ThemenView({ themen, orgMap, selectedIdx, onSelectIdx, onNavigateToOrg }) {
   const [search, setSearch] = useState("");
   const [expandedOrgs, setExpandedOrgs] = useState(new Set());

   const toggleOrg = nr =>
      setExpandedOrgs(prev => {
         const next = new Set(prev);
         if (next.has(nr)) next.delete(nr);
         else next.add(nr);
         return next;
      });

   const filtered = useMemo(() => {
      const q = search.toLowerCase();
      return themen.map((t, i) => ({ ...t, _idx: i })).filter(t => !q || t.thema.toLowerCase().includes(q) || t.beschreibung.toLowerCase().includes(q));
   }, [themen, search]);

   const sorted = useMemo(() => {
      return [...filtered].sort((a, b) => b.organisationen.length - a.organisationen.length);
   }, [filtered]);

   const selectedThema = selectedIdx !== null ? themen[selectedIdx] : null;
   const detailRef = useRef(null);

   // Reset expandedOrgs and scroll when selection changes (incl. history-back)
   useEffect(() => {
      setExpandedOrgs(new Set());
      const viewport = detailRef.current?.querySelector('[data-slot="scroll-area-viewport"]');
      if (viewport) viewport.scrollTop = 0;
   }, [selectedIdx]);

   // Auto-select first item if none selected
   useEffect(() => {
      if (selectedIdx === null && sorted.length > 0) {
         onSelectIdx(sorted[0]._idx);
      }
   }, [selectedIdx, sorted, onSelectIdx]);

   return (
      <div className="flex h-full max-w-[1600px] mx-auto">
         {/* Sidebar */}
         <div className="w-80 lg:w-[420px] xl:w-[480px] border-r border-border flex flex-col shrink-0 overflow-hidden">
            <div className="p-3 space-y-2 border-b border-border shrink-0">
               <SearchInput value={search} setValue={setSearch} placeholder="Titel und Kurzbeschreibung der Themen durchsuchen..." size="sm" />
            </div>
            <div className="flex-1 min-h-0">
               <ScrollArea className="h-full">
                  {sorted.map(t => (
                     <button
                        key={t._idx}
                        onClick={() => onSelectIdx(t._idx)}
                        className={cn(
                           "w-full text-left px-3 py-2.5 border-b border-border/40 transition-colors",
                           selectedIdx === t._idx ? "bg-accent border-l-2 border-l-primary" : "hover:bg-accent/50"
                        )}
                     >
                        <div className="text-sm leading-snug line-clamp-2">{t.thema}</div>
                        <div className="text-xs text-muted-foreground mt-1">
                           {t.organisationen.length} Organisation{t.organisationen.length !== 1 && "en"}
                        </div>
                     </button>
                  ))}
                  {sorted.length === 0 && <div className="p-4 text-sm text-muted-foreground">Keine Themen gefunden.</div>}
               </ScrollArea>
            </div>
         </div>

         {/* Detail */}
         <ScrollArea className="flex-1" ref={detailRef}>
            {selectedThema ? (
               <div className="p-6 lg:p-8">
                  <h1 className="text-xl font-medium text-foreground leading-snug">{selectedThema.thema}</h1>
                  <div className="mt-1 text-sm text-primary">
                     Angesprochen von {selectedThema.organisationen.length} Organisation{selectedThema.organisationen.length !== 1 && "en"}
                  </div>

                  <div className="mt-5">
                     <h2 className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-2">Worum es geht</h2>
                     <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-line">{selectedThema.beschreibung}</p>
                  </div>

                  <div className="mt-8">
                     <h2 className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-3">Angesprochen von</h2>
                     <div className="space-y-1.5">
                        {selectedThema.organisationen.map(nr => {
                           const org = orgMap.get(String(nr));
                           if (!org) return null;
                           const isExpanded = expandedOrgs.has(nr);
                           return (
                              <div key={nr} className="rounded-lg border border-border/60 overflow-hidden">
                                 <button onClick={() => toggleOrg(nr)} className="w-full flex items-center gap-2 px-3 py-2.5 text-left hover:bg-accent/50 transition-colors">
                                    {isExpanded ? <ChevronDown className="size-3.5 text-muted-foreground shrink-0" /> : <ChevronRight className="size-3.5 text-muted-foreground shrink-0" />}
                                    <span className="text-sm font-medium text-primary">{org.abkürzung}</span>
                                    <span className="text-xs text-muted-foreground truncate">{org.organisation}</span>
                                 </button>
                                 {isExpanded && (
                                    <div className="px-3 pb-3 pt-2 border-t border-border/40 space-y-2">
                                       <p className="text-3xs uppercase tracking-wider text-muted-foreground">Zusammenfassung der Stellungnahmen der Organisation</p>
                                       <p className="text-xs text-foreground/70 leading-relaxed whitespace-pre-line">{org.zusammenfassung}</p>
                                       <button
                                          onClick={e => {
                                             e.stopPropagation();
                                             onNavigateToOrg(org.nr);
                                          }}
                                          className="flex items-center gap-1 text-xs text-primary hover:underline"
                                       >
                                          Ungekürzte Stellungnahmen der Organisation ansehen
                                          <ArrowRight className="size-3" />
                                       </button>
                                    </div>
                                 )}
                              </div>
                           );
                        })}
                     </div>
                  </div>
               </div>
            ) : (
               <div className="flex items-center justify-center h-full text-muted-foreground text-sm">Thema aus der Liste auswählen</div>
            )}
         </ScrollArea>
      </div>
   );
}
