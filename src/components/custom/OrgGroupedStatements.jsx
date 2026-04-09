import { ChevronRight, ChevronDown, ArrowRight } from "lucide-react";
import { getStatementText } from "@/lib/helpers";

export default function OrgGroupedStatements({ groups, expandedStatements, onToggleStatement, onNavigateToOrg, onNavigateToKapitel, onNavigateToSchlagwort }) {
   return (
      <div className="space-y-6">
         {groups.map(({ org, statements }) => (
            <div key={org.nr}>
               <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm font-medium text-primary">{org.abkürzung}</span>
                  <span className="text-xs text-foreground/60 truncate">{org.organisation}</span>
                  <button
                     onClick={() => onNavigateToOrg(org.nr)}
                     className="flex items-center gap-1 text-xs text-primary hover:underline shrink-0 ml-auto"
                  >
                     Zur Organisation
                     <ArrowRight className="size-3" />
                  </button>
               </div>
               <div className="space-y-1.5">
                  {statements.map(s => {
                     const id = s["#"];
                     const isExpanded = expandedStatements.has(id);
                     const text = getStatementText(s);
                     return (
                        <div key={id} className="rounded-lg border border-border/60 overflow-hidden">
                           <button onClick={() => onToggleStatement(id)} className="w-full flex items-center gap-2 px-3 py-2.5 text-left hover:bg-accent/50 transition-colors">
                              {isExpanded ? <ChevronDown className="size-3.5 text-muted-foreground shrink-0" /> : <ChevronRight className="size-3.5 text-muted-foreground shrink-0" />}
                              {onNavigateToKapitel ? (
                                 <span onClick={(e) => { e.stopPropagation(); onNavigateToKapitel(s.kapitel); }} className="text-xs font-medium text-primary truncate hover:underline cursor-pointer">{s.kapitel}</span>
                              ) : (
                                 <span className="text-xs font-medium text-primary truncate">{s.kapitel}</span>
                              )}
                              {s.schlagworte.length > 0 && <span className="text-xs text-foreground/40 truncate ml-auto shrink-0 max-w-48">{s.schlagworte.join(", ")}</span>}
                              {"dokument" in s && <span className="text-3xs uppercase text-muted-foreground bg-accent px-1 py-0.5 rounded shrink-0">PDF</span>}
                           </button>
                           {isExpanded && text && (
                              <div className="px-3 pb-3 pt-2 border-t border-border/40">
                                 {s.schlagworte.length > 0 && (
                                    <div className="flex flex-wrap gap-1 mb-3">
                                       {s.schlagworte.map(sw => onNavigateToSchlagwort ? (
                                          <button
                                             key={sw}
                                             onClick={() => onNavigateToSchlagwort(sw)}
                                             className="px-1.5 py-0.5 text-3xs bg-primary/10 text-primary rounded hover:bg-primary/20 transition-colors"
                                          >
                                             {sw}
                                          </button>
                                       ) : (
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
         ))}
      </div>
   );
}
