import { useState, useMemo, useEffect, useRef } from "react";
import { ArrowDownAZ, ArrowDownWideNarrow } from "lucide-react";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import SearchInput from "@/components/custom/SearchInput";
import OrgGroupedStatements from "@/components/custom/OrgGroupedStatements";

export default function SchlagworteView({ organisationen, selectedSchlagwort, onSelectSchlagwort, onNavigateToOrg }) {
   const [search, setSearch] = useState("");
   const [sortBy, setSortBy] = useState("count");
   const [expandedStatements, setExpandedStatements] = useState(new Set());
   const detailRef = useRef(null);

   const toggleStatement = id =>
      setExpandedStatements(prev => {
         const next = new Set(prev);
         if (next.has(id)) next.delete(id);
         else next.add(id);
         return next;
      });

   const allSchlagworte = useMemo(() => {
      const counts = new Map();
      for (const org of organisationen) {
         for (const s of org.stellungnahmen) {
            for (const sw of s.schlagworte) {
               counts.set(sw, (counts.get(sw) || 0) + 1);
            }
         }
      }
      return [...counts.entries()].map(([schlagwort, count]) => ({ schlagwort, count }));
   }, [organisationen]);

   const filtered = useMemo(() => {
      const q = search.toLowerCase();
      return allSchlagworte
         .filter(s => !q || s.schlagwort.toLowerCase().includes(q))
         .sort((a, b) => sortBy === "alpha"
            ? a.schlagwort.localeCompare(b.schlagwort, "de")
            : b.count - a.count
         );
   }, [allSchlagworte, search, sortBy]);

   const groupedByOrg = useMemo(() => {
      if (!selectedSchlagwort) return [];
      const groups = [];
      for (const org of organisationen) {
         const matching = org.stellungnahmen.filter(s => s.schlagworte.includes(selectedSchlagwort));
         if (matching.length > 0) groups.push({ org, statements: matching });
      }
      return groups.sort((a, b) => a.org.abkürzung.localeCompare(b.org.abkürzung, "de"));
   }, [selectedSchlagwort, organisationen]);

   const orgCount = groupedByOrg.length;
   const statementCount = groupedByOrg.reduce((sum, g) => sum + g.statements.length, 0);

   // Reset expanded statements and scroll on schlagwort change
   useEffect(() => {
      setExpandedStatements(new Set());
      const viewport = detailRef.current?.querySelector('[data-slot="scroll-area-viewport"]');
      if (viewport) viewport.scrollTop = 0;
   }, [selectedSchlagwort]);

   // Auto-select first schlagwort if none selected or no longer in filtered list
   useEffect(() => {
      if (filtered.length === 0) return;
      if (selectedSchlagwort === null || !filtered.some(s => s.schlagwort === selectedSchlagwort)) {
         onSelectSchlagwort(filtered[0].schlagwort);
      }
   }, [selectedSchlagwort, filtered, onSelectSchlagwort]);

   return (
      <div className="flex h-full max-w-[1600px] mx-auto">
         {/* Sidebar */}
         <div className="w-80 lg:w-[420px] xl:w-[480px] border-r border-border flex flex-col shrink-0 overflow-hidden">
            <div className="p-3 space-y-4 border-b border-border shrink-0">
               <SearchInput value={search} setValue={setSearch} placeholder="Schlagworte durchsuchen..." size="sm" />
               <div className="flex gap-1">
                  {[
                     { key: "count", label: "Anzahl", icon: ArrowDownWideNarrow },
                     { key: "alpha", label: "A\u2013Z", icon: ArrowDownAZ },
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
                  {filtered.map(s => (
                     <button
                        key={s.schlagwort}
                        onClick={() => onSelectSchlagwort(s.schlagwort)}
                        className={cn(
                           "w-full text-left px-3 py-2.5 border-b border-border/40 transition-colors",
                           selectedSchlagwort === s.schlagwort ? "bg-accent border-l-2 border-l-primary" : "hover:bg-accent/50"
                        )}
                     >
                        <div className="text-sm leading-snug">{s.schlagwort}</div>
                        <div className="text-xs text-muted-foreground mt-1">
                           {s.count} Stellungnahme{s.count !== 1 && "n"}
                        </div>
                     </button>
                  ))}
                  {filtered.length === 0 && <div className="p-4 text-sm text-muted-foreground">Keine Schlagworte gefunden.</div>}
               </ScrollArea>
            </div>
         </div>

         {/* Detail */}
         <ScrollArea className="flex-1" ref={detailRef}>
            {selectedSchlagwort ? (
               <div className="p-6 lg:p-8">
                  <h1 className="text-xl font-medium text-foreground leading-snug">{selectedSchlagwort}</h1>
                  <div className="mt-1 text-sm text-primary">
                     {statementCount} Stellungnahme{statementCount !== 1 && "n"}
                  </div>

                  <div className="mt-5">
                     <h2 className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-2">Hinweis zu den ungekürzten Stellungnahmen zu diesem Schlagwort</h2>
                     <p className="text-sm text-foreground/80 leading-relaxed">
                        Die Zuordnung der Schlagwörter zu Kapitel-Stellungnahmen basiert auf der Auswahl der einreichenden Organisation im Konsultationsformular. Pro Kapitel stand eine vordefinierte Liste von Schlagwörtern zur Verfügung, aus der frei gewählt werden konnte. Da die verfügbaren Schlagwörter kapitelabhängig waren, wirken sich Ungenauigkeiten in der Kapitelzuordnung auch auf die Schlagwortzuordnung aus. Stellungnahmen, die nachträglich als PDF eingereicht wurden, tragen zudem keine Schlagwörter. Die angezeigte Schlagwortzuordnung kann daher vom tatsächlichen thematischen Bezug abweichen.
                     </p>
                  </div>

                  <div className="mt-5">
                     <OrgGroupedStatements
                        groups={groupedByOrg}
                        expandedStatements={expandedStatements}
                        onToggleStatement={toggleStatement}
                        onNavigateToOrg={onNavigateToOrg}
                     />
                  </div>
               </div>
            ) : (
               <div className="flex items-center justify-center h-full text-muted-foreground text-sm">Schlagwort aus der Liste auswählen</div>
            )}
         </ScrollArea>
      </div>
   );
}
