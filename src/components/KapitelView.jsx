import { useState, useMemo, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipContainer } from "@/components/ui/tooltip";
import OrgGroupedStatements from "@/components/custom/OrgGroupedStatements";

export default function KapitelView({ organisationen, kapitel, orgMap, selectedKapitel, onSelectKapitel, onNavigateToOrg, onNavigateToSchlagwort }) {
   const [expandedStatements, setExpandedStatements] = useState(new Set());
   const detailRef = useRef(null);
   const h2Ref = useRef(null);
   const ch4Ref = useRef(null);

   const scrollToSection = ref => ref.current?.scrollIntoView({ behavior: "smooth", block: "start" });

   const toggleStatement = id =>
      setExpandedStatements(prev => {
         const next = new Set(prev);
         if (next.has(id)) next.delete(id);
         else next.add(id);
         return next;
      });

   const sidebarData = useMemo(
      () => kapitel.map(k => ({ kapitel: k.kapitel, orgCount: k.organisationen.length })),
      [kapitel]
   );

   const currentKapitelEntry = useMemo(
      () => (selectedKapitel ? kapitel.find(k => k.kapitel === selectedKapitel) : null),
      [selectedKapitel, kapitel]
   );

   const inhaltlicheOrgs = useMemo(() => {
      if (!currentKapitelEntry) return [];
      return currentKapitelEntry.organisationen
         .map(nr => orgMap.get(String(nr)))
         .filter(Boolean)
         .sort((a, b) => a.abkürzung.localeCompare(b.abkürzung, "de"));
   }, [currentKapitelEntry, orgMap]);

   const groupedByOrg = useMemo(() => {
      if (!selectedKapitel) return [];
      const groups = [];
      for (const org of organisationen) {
         const matching = org.stellungnahmen.filter(s => s.kapitel === selectedKapitel);
         if (matching.length > 0) groups.push({ org, statements: matching });
      }
      return groups.sort((a, b) => a.org.abkürzung.localeCompare(b.org.abkürzung, "de"));
   }, [selectedKapitel, organisationen]);

   const formularStatementCount = groupedByOrg.reduce((sum, g) => sum + g.statements.length, 0);

   const hasInhaltlich = !!currentKapitelEntry && currentKapitelEntry.organisationen.length > 0;
   const hasH2CH4 = hasInhaltlich && currentKapitelEntry.zusammenfassung_H2 != null;

   // Reset expanded statements and scroll on chapter change
   useEffect(() => {
      setExpandedStatements(new Set());
      const viewport = detailRef.current?.querySelector('[data-slot="scroll-area-viewport"]');
      if (viewport) viewport.scrollTop = 0;
   }, [selectedKapitel]);

   // Auto-select first chapter if none selected
   useEffect(() => {
      if (selectedKapitel === null && sidebarData.length > 0) {
         onSelectKapitel(sidebarData[0].kapitel);
      }
   }, [selectedKapitel, sidebarData, onSelectKapitel]);

   return (
      <div className="flex h-full max-w-[1600px] mx-auto">
         {/* Sidebar */}
         <div className="w-80 lg:w-[420px] xl:w-[480px] border-r border-border flex flex-col shrink-0 overflow-hidden">
            <div className="flex-1 min-h-0">
               <ScrollArea className="h-full">
                  <div className="pt-2">
                     {sidebarData.map(c => (
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
                              {c.orgCount} Organisation{c.orgCount !== 1 && "en"} mit inhaltlicher Position
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

                  {hasInhaltlich && (
                     <>
                        {/* Organisationen mit inhaltlicher Position zu diesem Kapitel */}
                        <div className="mt-6">
                           <h2 className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-3">
                              Organisationen mit inhaltlicher Position ({inhaltlicheOrgs.length})
                           </h2>
                           <div className="flex flex-wrap gap-1.5">
                              {inhaltlicheOrgs.map(o => (
                                 <Tooltip key={o.nr}>
                                    <TooltipTrigger asChild>
                                       <button
                                          onClick={() => onNavigateToOrg(o.nr)}
                                          className="px-2 py-1 text-xs bg-accent hover:bg-primary/20 text-foreground/80 hover:text-foreground rounded transition-colors"
                                       >
                                          {o.abkürzung}
                                       </button>
                                    </TooltipTrigger>
                                    <TooltipContent side="top">
                                       <TooltipContainer>{o.organisation}</TooltipContainer>
                                    </TooltipContent>
                                 </Tooltip>
                              ))}
                           </div>
                        </div>

                        {/* Zusammenfassung der Stellungnahmen zu diesem Kapitel */}
                        <div className="mt-8">
                           <h2 className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-3">
                              Zusammenfassung der Stellungnahmen zu diesem Kapitel
                           </h2>
                           <div className="text-xs text-muted-foreground leading-relaxed border-l-4 border-primary/40 pl-4 mb-5 space-y-1">
                              <p>
                                 <strong className="text-foreground">Hinweis:</strong> Die nachfolgende Zusammenfassung ist eine inhaltlich basierte, neu zugeordnete Sicht auf die Konsultation. Sie wurde aus den ungekürzten Original-Stellungnahmen <em>aller</em> Organisationen über <em>alle</em> Kapitelfelder hinweg erzeugt — einschließlich der vier per PDF eingereichten Stellungnahmen, die kein Kapitelfeld haben. Jede Position erscheint in derjenigen Kapitelzusammenfassung, zu der sie inhaltlich passt, unabhängig davon, in welchem Formularfeld sie ursprünglich eingetragen wurde.
                              </p>
                              <p>
                                 Hintergrund: Die Selbstzuordnung im Konsultationsformular ist nicht trennscharf, weil viele Themen mehrere Kapitel berühren und die Textfelder pro Kapitel zeichenbegrenzt waren — Organisationen haben Inhalte deshalb häufig auf andere Kapitelfelder verteilt. Die vier per PDF eingereichten Stellungnahmen haben keine Selbstzuordnung und wurden deshalb pauschal dem Kapitel „Generelle Anmerkungen“ zugeschlagen, obwohl sie inhaltlich quer über alle Kapitel beitragen.
                              </p>
                              <p>
                                 Diese Zusammenfassung ist daher ausdrücklich nicht deckungsgleich mit den unten auf dieser Seite stehenden Stellungnahmen: Aussagen daraus können hier fehlen, wenn sie thematisch besser in ein anderes Kapitel passen — umgekehrt können hier Aussagen erscheinen, die im Formular einem anderen Kapitelfeld zugeordnet waren oder aus einer PDF-Einreichung stammen.
                              </p>
                           </div>
                           {hasH2CH4 && (
                              <div className="flex flex-wrap items-center gap-2 mb-5 text-xs text-muted-foreground">
                                 <span>Springe zu:</span>
                                 <button
                                    onClick={() => scrollToSection(h2Ref)}
                                    className="px-2 py-0.5 rounded bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                                 >
                                    Wasserstoff (H₂)
                                 </button>
                                 <button
                                    onClick={() => scrollToSection(ch4Ref)}
                                    className="px-2 py-0.5 rounded bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                                 >
                                    Methan (CH₄)
                                 </button>
                              </div>
                           )}
                           <p className="text-sm text-foreground/90 leading-relaxed whitespace-pre-line">
                              {currentKapitelEntry.zusammenfassung}
                           </p>
                           {hasH2CH4 && (
                              <>
                                 <h3 ref={h2Ref} className="scroll-mt-4 text-sm font-medium text-primary mt-6 mb-2">Wasserstoff (H₂)</h3>
                                 <p className="text-sm text-foreground/90 leading-relaxed whitespace-pre-line">
                                    {currentKapitelEntry.zusammenfassung_H2}
                                 </p>
                                 <h3 ref={ch4Ref} className="scroll-mt-4 text-sm font-medium text-primary mt-6 mb-2">Methan (CH₄)</h3>
                                 <p className="text-sm text-foreground/90 leading-relaxed whitespace-pre-line">
                                    {currentKapitelEntry.zusammenfassung_CH4}
                                 </p>
                              </>
                           )}
                        </div>

                     </>
                  )}

                  {/* Ungekürzte Einzelstellungnahmen aus dem Konsultationsformular */}
                  {groupedByOrg.length > 0 && (
                     <div className="mt-8">
                        <h2 className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-3">
                           Ungekürzte Einzelstellungnahmen zu diesem Kapitel ({formularStatementCount})
                        </h2>
                        <p className="text-xs text-muted-foreground leading-relaxed border-l-4 border-primary/40 pl-4 mb-5">
                           <strong className="text-foreground">Hinweis:</strong> Die nachfolgenden Stellungnahmen sind ungekürzte Originaltexte aus den Kapitelfeldern des Konsultationsformulars. Die Kapitelzuordnung basiert ausschließlich auf der Selbstzuordnung der einreichenden Organisation und ist nicht immer trennscharf: Da viele Themen mehrere Kapitel berühren und die Textfelder pro Kapitel zeichenbegrenzt waren, haben Organisationen Inhalte häufig auf andere Kapitelfelder verteilt. Vier Organisationen haben statt des Online-Formulars eine PDF eingereicht; diese Stellungnahmen haben keine kapitelweise Selbstzuordnung und sind hier pauschal dem Kapitel „Generelle Anmerkungen“ zugeordnet, unabhängig von ihrem tatsächlichen Inhalt. Die angezeigte Zuordnung kann daher vom tatsächlichen inhaltlichen Bezug abweichen{hasInhaltlich ? " — die obenstehende inhaltliche Zusammenfassung gleicht das aus" : ""}.
                        </p>
                        <OrgGroupedStatements
                           groups={groupedByOrg}
                           expandedStatements={expandedStatements}
                           onToggleStatement={toggleStatement}
                           onNavigateToOrg={onNavigateToOrg}
                           onNavigateToSchlagwort={onNavigateToSchlagwort}
                        />
                     </div>
                  )}

                  {!hasInhaltlich && groupedByOrg.length === 0 && (
                     <div className="mt-8 text-sm text-muted-foreground">Keine Beiträge zu diesem Kapitel.</div>
                  )}
               </div>
            ) : (
               <div className="flex items-center justify-center h-full text-muted-foreground text-sm">Kapitel aus der Liste auswählen</div>
            )}
         </ScrollArea>
      </div>
   );
}
