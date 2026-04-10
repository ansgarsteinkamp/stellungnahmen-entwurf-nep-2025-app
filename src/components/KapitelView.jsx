import { useState, useMemo, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { KAPITEL_ORDER } from "@/lib/helpers";
import OrgGroupedStatements from "@/components/custom/OrgGroupedStatements";

export default function KapitelView({ organisationen, selectedKapitel, onSelectKapitel, onNavigateToOrg, onNavigateToSchlagwort }) {
   const [expandedStatements, setExpandedStatements] = useState(new Set());
   const detailRef = useRef(null);

   const toggleStatement = id =>
      setExpandedStatements(prev => {
         const next = new Set(prev);
         if (next.has(id)) next.delete(id);
         else next.add(id);
         return next;
      });

   const chapterData = useMemo(() => {
      const counts = {};
      for (const org of organisationen) {
         for (const s of org.stellungnahmen) {
            counts[s.kapitel] = (counts[s.kapitel] || 0) + 1;
         }
      }
      return KAPITEL_ORDER.map(k => ({ kapitel: k, count: counts[k] || 0 }));
   }, [organisationen]);

   const groupedByOrg = useMemo(() => {
      if (!selectedKapitel) return [];
      const groups = [];
      for (const org of organisationen) {
         const matching = org.stellungnahmen.filter(s => s.kapitel === selectedKapitel);
         if (matching.length > 0) groups.push({ org, statements: matching });
      }
      return groups.sort((a, b) => a.org.abkürzung.localeCompare(b.org.abkürzung, "de"));
   }, [selectedKapitel, organisationen]);

   const orgCount = groupedByOrg.length;
   const statementCount = groupedByOrg.reduce((sum, g) => sum + g.statements.length, 0);

   // Reset expanded statements and scroll on chapter change
   useEffect(() => {
      setExpandedStatements(new Set());
      const viewport = detailRef.current?.querySelector('[data-slot="scroll-area-viewport"]');
      if (viewport) viewport.scrollTop = 0;
   }, [selectedKapitel]);

   // Auto-select first chapter if none selected
   useEffect(() => {
      if (selectedKapitel === null && chapterData.length > 0) {
         onSelectKapitel(chapterData[0].kapitel);
      }
   }, [selectedKapitel, chapterData, onSelectKapitel]);

   return (
      <div className="flex h-full max-w-[1600px] mx-auto">
         {/* Sidebar */}
         <div className="w-80 lg:w-[420px] xl:w-[480px] border-r border-border flex flex-col shrink-0 overflow-hidden">
            <div className="flex-1 min-h-0">
               <ScrollArea className="h-full">
                  <div className="pt-2">
                  {chapterData.map(c => (
                     <button
                        key={c.kapitel}
                        onClick={() => onSelectKapitel(c.kapitel)}
                        className={cn(
                           "w-full text-left px-3 py-2.5 border-b border-border/40 transition-colors",
                           selectedKapitel === c.kapitel ? "bg-accent border-l-2 border-l-primary" : "hover:bg-accent/50"
                        )}
                     >
                        <div className="text-sm leading-snug">{c.kapitel}</div>
                        <div className="text-xs text-muted-foreground mt-1">
                           {c.count} Stellungnahme{c.count !== 1 && "n"}
                        </div>
                     </button>
                  ))}
                  </div>
               </ScrollArea>
            </div>
         </div>

         {/* Detail */}
         <ScrollArea className="flex-1" ref={detailRef}>
            {selectedKapitel ? (
               <div className="p-6 lg:p-8">
                  <h1 className="text-xl font-medium text-foreground leading-snug">{selectedKapitel}</h1>
                  <div className="mt-1 text-sm text-primary">
                     {statementCount} Stellungnahme{statementCount !== 1 && "n"}
                  </div>

                  <div className="mt-5">
                     <h2 className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-2">Hinweis zu den nachfolgenden Stellungnahmen zu diesem Kapitel</h2>
                     <p className="text-sm text-foreground/80 leading-relaxed">
                        Die Zuordnung der Stellungnahmen zu den Kapiteln des NEP-Entwurfs basiert auf der Angabe der einreichenden Organisation im Konsultationsformular. Da die Zuordnung zu einzelnen Kapiteln nicht immer trennscharf möglich ist, können die Kapitel-Stellungnahmen Inhalte enthalten, die auch andere Kapitel betreffen. Die Textfelder des Formulars waren zudem pro Kapitel zeichenbegrenzt, sodass manche Organisationen Inhalte auf Felder anderer Kapitel verteilt haben. Stellungnahmen, die als PDF statt über das Online-Formular eingereicht wurden, sind pauschal dem Kapitel „Generelle Anmerkungen" zugeordnet, unabhängig von ihrem tatsächlichen Inhalt. Die angezeigte Kapitelzuordnung kann daher vom tatsächlichen thematischen Bezug abweichen.
                     </p>
                  </div>

                  <div className="mt-5">
                     <OrgGroupedStatements
                        groups={groupedByOrg}
                        expandedStatements={expandedStatements}
                        onToggleStatement={toggleStatement}
                        onNavigateToOrg={onNavigateToOrg}
                        onNavigateToSchlagwort={onNavigateToSchlagwort}
                     />
                  </div>
               </div>
            ) : (
               <div className="flex items-center justify-center h-full text-muted-foreground text-sm">Kapitel aus der Liste auswählen</div>
            )}
         </ScrollArea>
      </div>
   );
}
