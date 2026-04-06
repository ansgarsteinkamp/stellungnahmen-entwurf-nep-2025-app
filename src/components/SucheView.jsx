import { useState, useMemo, useDeferredValue, useEffect } from "react";
import { ArrowRight, ChevronDown, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import SearchInput from "@/components/custom/SearchInput";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getStatementText, highlightParts, highlightAll } from "@/lib/helpers";

function Highlight({ parts }) {
   if (!parts) return null;
   return (
      <span>
         {parts.map((p, i) => (
            <span key={i} className={p.hl ? "bg-primary/30 text-primary" : ""}>
               {p.text}
            </span>
         ))}
      </span>
   );
}

export default function SucheView({ themen, organisationen, orgMap, onNavigateToThema, onNavigateToOrg, initialQuery }) {
   const [query, setQuery] = useState("");
   const deferredQuery = useDeferredValue(query);
   const [expandedStatements, setExpandedStatements] = useState(new Set());

   // Sync initial query from navigation (e.g. Schlagwort click)
   useEffect(() => {
      if (initialQuery) {
         setQuery(initialQuery);
         setExpandedStatements(new Set());
      }
   }, [initialQuery]);

   const toggleStatement = (id) =>
      setExpandedStatements((prev) => {
         const next = new Set(prev);
         if (next.has(id)) next.delete(id);
         else next.add(id);
         return next;
      });

   const results = useMemo(() => {
      if (deferredQuery.length < 2) return null;
      const q = deferredQuery.toLowerCase();

      const matched = [];
      for (const org of organisationen) {
         for (const s of org.stellungnahmen) {
            const text = getStatementText(s);
            if (text && text.toLowerCase().includes(q)) {
               matched.push({
                  org,
                  statement: s,
                  text,
                  textParts: highlightParts(text, deferredQuery),
               });
            }
         }
      }

      return matched;
   }, [deferredQuery, organisationen]);

   const isStale = query !== deferredQuery;

   return (
      <div className="h-full flex flex-col">
         <div className="p-4 lg:p-6 border-b border-border shrink-0">
            <div className="max-w-4xl mx-auto">
            <SearchInput value={query} setValue={setQuery} placeholder="Ungekürzte Stellungnahmen durchsuchen..." />
            {results && (
               <div className="text-xs text-muted-foreground mt-2">
                  {results.length} Ergebnis{results.length !== 1 && "se"} für &ldquo;{deferredQuery}&rdquo;
                  {isStale && <span className="text-foreground/30 ml-2">Suche&hellip;</span>}
               </div>
            )}
            </div>
         </div>

         <div className="flex-1 min-h-0">
         <ScrollArea className="h-full">
            <div className={cn("p-4 lg:p-6 max-w-4xl mx-auto", isStale && "opacity-70 transition-opacity")}>
               {results && results.length === 0 && (
                  <div className="text-sm text-muted-foreground">Keine Ergebnisse gefunden.</div>
               )}

               {results && results.length > 0 && (
                  <div className="space-y-2">
                     {results.slice(0, 50).map((r) => {
                        const id = r.statement["#"];
                        const isExpanded = expandedStatements.has(id);
                        return (
                           <div key={`${r.org.nr}-${id}`} className="rounded-lg border border-border/60 overflow-hidden">
                              <button
                                 onClick={() => toggleStatement(id)}
                                 className="w-full text-left p-3 hover:bg-accent/50 transition-colors group"
                              >
                                 <div className="flex items-center gap-2 flex-wrap">
                                    {isExpanded ? (
                                       <ChevronDown className="size-3.5 text-muted-foreground shrink-0" />
                                    ) : (
                                       <ChevronRight className="size-3.5 text-muted-foreground shrink-0" />
                                    )}
                                    <span className="text-xs text-muted-foreground">{r.org.abkürzung}</span>
                                    <span className="text-xs text-foreground/40">{r.statement.kapitel}</span>
                                    <ArrowRight className="size-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity ml-auto shrink-0" />
                                 </div>
                                 {!isExpanded && r.textParts && (
                                    <div className="text-xs text-foreground/60 mt-1 line-clamp-3 ml-5">
                                       <Highlight parts={r.textParts} />
                                    </div>
                                 )}
                              </button>
                              {isExpanded && (
                                 <div className="px-3 pb-3 pt-2 border-t border-border/40">
                                    {r.statement.schlagworte.length > 0 && (
                                       <div className="flex flex-wrap gap-1 mb-3">
                                          {r.statement.schlagworte.map((sw) => (
                                             <button
                                                key={sw}
                                                onClick={() => setQuery(sw)}
                                                className="px-1.5 py-0.5 text-3xs bg-primary/10 text-primary rounded hover:bg-primary/20 transition-colors"
                                             >
                                                {sw}
                                             </button>
                                          ))}
                                       </div>
                                    )}
                                    {r.text && (
                                       <p className="text-xs text-foreground/70 leading-relaxed whitespace-pre-line">
                                          <Highlight parts={highlightAll(r.text, deferredQuery)} />
                                       </p>
                                    )}
                                    <button
                                       onClick={(e) => {
                                          e.stopPropagation();
                                          onNavigateToOrg(r.org.nr);
                                       }}
                                       className="flex items-center gap-1 text-xs text-primary hover:underline mt-2"
                                    >
                                       Zur Organisation
                                       <ArrowRight className="size-3" />
                                    </button>
                                 </div>
                              )}
                           </div>
                        );
                     })}
                     {results.length > 50 && (
                        <div className="text-xs text-muted-foreground">
                           &hellip; und {results.length - 50} weitere Treffer
                        </div>
                     )}
                  </div>
               )}
            </div>
         </ScrollArea>
         </div>
      </div>
   );
}
