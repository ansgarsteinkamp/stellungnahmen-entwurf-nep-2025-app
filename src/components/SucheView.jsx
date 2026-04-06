import { useState, useMemo, useDeferredValue, useEffect } from "react";
import { ArrowRight, FileText, Building2, List, ChevronDown, ChevronRight } from "lucide-react";
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

function ResultSection({ icon: Icon, title, count, children }) {
   if (count === 0) return null;
   return (
      <section className="mb-8">
         <div className="flex items-center gap-2 mb-3">
            <Icon className="size-4 text-primary" />
            <h2 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
               {title}
            </h2>
            <span className="text-xs text-primary">{count}</span>
         </div>
         <div className="space-y-2">{children}</div>
      </section>
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

      const matchedThemen = themen
         .map((t, i) => ({
            ...t,
            _idx: i,
            titleParts: highlightParts(t.thema, deferredQuery, 200),
            descParts: highlightParts(t.beschreibung, deferredQuery),
         }))
         .filter((t) => t.thema.toLowerCase().includes(q) || t.beschreibung.toLowerCase().includes(q));

      const matchedOrgs = organisationen
         .map((o) => ({
            ...o,
            nameParts: highlightParts(o.organisation, deferredQuery, 200),
            summaryParts: highlightParts(o.zusammenfassung, deferredQuery),
         }))
         .filter(
            (o) =>
               o.organisation.toLowerCase().includes(q) ||
               o.abkürzung.toLowerCase().includes(q) ||
               (o.zusammenfassung || "").toLowerCase().includes(q)
         );

      const matchedStatements = [];
      for (const org of organisationen) {
         for (const s of org.stellungnahmen) {
            const text = getStatementText(s);
            const textMatch = text ? text.toLowerCase().includes(q) : false;
            const swMatch = s.schlagworte.some((sw) => sw.toLowerCase().includes(q));
            const kapitelMatch = s.kapitel.toLowerCase().includes(q);
            if (textMatch || swMatch || kapitelMatch) {
               matchedStatements.push({
                  org,
                  statement: s,
                  text,
                  textParts: textMatch ? highlightParts(text, deferredQuery) : null,
                  kapitelParts: kapitelMatch ? highlightAll(s.kapitel, deferredQuery) : null,
                  swMatch,
               });
            }
         }
      }

      return { matchedThemen, matchedOrgs, matchedStatements };
   }, [deferredQuery, themen, organisationen]);

   const totalResults = results
      ? results.matchedThemen.length + results.matchedOrgs.length + results.matchedStatements.length
      : 0;

   const isStale = query !== deferredQuery;

   return (
      <div className="h-full flex flex-col">
         <div className="p-4 lg:p-6 border-b border-border shrink-0">
            <div className="max-w-4xl mx-auto">
            <SearchInput value={query} setValue={setQuery} placeholder="Themen, Organisationen, Stellungnahmen durchsuchen..." />
            {results && (
               <div className="text-xs text-muted-foreground mt-2">
                  {totalResults} Ergebnis{totalResults !== 1 && "se"} für &ldquo;{deferredQuery}&rdquo;
                  {isStale && <span className="text-foreground/30 ml-2">Suche&hellip;</span>}
               </div>
            )}
            </div>
         </div>

         <div className="flex-1 min-h-0">
         <ScrollArea className="h-full">
            <div className={cn("p-4 lg:p-6 max-w-4xl mx-auto", isStale && "opacity-70 transition-opacity")}>
               {!results && (
                  <div className="text-sm text-muted-foreground">Mindestens 2 Zeichen eingeben&hellip;</div>
               )}

               {results && totalResults === 0 && (
                  <div className="text-sm text-muted-foreground">Keine Ergebnisse gefunden.</div>
               )}

               {results && (
                  <>
                     <ResultSection icon={List} title="Themen" count={results.matchedThemen.length}>
                        {results.matchedThemen.map((t) => (
                           <button
                              key={t._idx}
                              onClick={() => onNavigateToThema(t._idx)}
                              className="w-full text-left p-3 rounded-lg border border-border/60 hover:bg-accent/50 transition-colors group"
                           >
                              <div className="flex items-center gap-2">
                                 <span className="text-sm font-medium">
                                    {t.titleParts ? <Highlight parts={t.titleParts} /> : t.thema}
                                 </span>
                                 <ArrowRight className="size-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity ml-auto shrink-0" />
                              </div>
                              <div className="text-xs text-muted-foreground mt-1">
                                 {t.organisationen.length} Organisationen
                              </div>
                              {t.descParts && (
                                 <div className="text-xs text-foreground/60 mt-1 line-clamp-2">
                                    <Highlight parts={t.descParts} />
                                 </div>
                              )}
                           </button>
                        ))}
                     </ResultSection>

                     <ResultSection icon={Building2} title="Organisationen" count={results.matchedOrgs.length}>
                        {results.matchedOrgs.map((o) => (
                           <button
                              key={o.nr}
                              onClick={() => onNavigateToOrg(o.nr)}
                              className="w-full text-left p-3 rounded-lg border border-border/60 hover:bg-accent/50 transition-colors group"
                           >
                              <div className="flex items-center gap-2">
                                 <span className="text-sm text-primary font-medium">{o.abkürzung}</span>
                                 <span className="text-sm">
                                    {o.nameParts ? <Highlight parts={o.nameParts} /> : o.organisation}
                                 </span>
                                 <ArrowRight className="size-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity ml-auto shrink-0" />
                              </div>
                              {o.summaryParts && (
                                 <div className="text-xs text-foreground/60 mt-1 line-clamp-2">
                                    <Highlight parts={o.summaryParts} />
                                 </div>
                              )}
                           </button>
                        ))}
                     </ResultSection>

                     <ResultSection icon={FileText} title="Stellungnahmen" count={results.matchedStatements.length}>
                        {results.matchedStatements.slice(0, 50).map((r) => {
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
                                       <span className="text-xs text-primary font-medium">{id}</span>
                                       <span className="text-xs text-muted-foreground">{r.org.abkürzung}</span>
                                       <span className="text-xs text-foreground/40">
                                          {r.kapitelParts ? <Highlight parts={r.kapitelParts} /> : r.statement.kapitel}
                                       </span>
                                       <ArrowRight className="size-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity ml-auto shrink-0" />
                                    </div>
                                    {!isExpanded && r.textParts && (
                                       <div className="text-xs text-foreground/60 mt-1 line-clamp-3 ml-5">
                                          <Highlight parts={r.textParts} />
                                       </div>
                                    )}
                                    {!isExpanded && r.swMatch && !r.textParts && (
                                       <div className="text-xs text-foreground/40 mt-1 ml-5">
                                          Schlagworte: {r.statement.schlagworte.join(", ")}
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
                                          <ScrollArea className="max-h-[24rem]">
                                             <p className="text-xs text-foreground/70 leading-relaxed whitespace-pre-line">
                                                <Highlight parts={highlightAll(r.text, deferredQuery)} />
                                             </p>
                                          </ScrollArea>
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
                        {results.matchedStatements.length > 50 && (
                           <div className="text-xs text-muted-foreground">
                              &hellip; und {results.matchedStatements.length - 50} weitere Treffer
                           </div>
                        )}
                     </ResultSection>
                  </>
               )}
            </div>
         </ScrollArea>
         </div>
      </div>
   );
}
