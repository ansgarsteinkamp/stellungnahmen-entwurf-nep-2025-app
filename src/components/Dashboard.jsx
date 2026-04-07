import { useMemo } from "react";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipContainer, TooltipProvider } from "@/components/ui/tooltip";
import { ScrollArea } from "@/components/ui/scroll-area";

function StatCard({ label, value, subtitle }) {
   return (
      <div className="rounded-lg border border-border bg-card p-5">
         <div className="text-3xl font-medium text-primary">{value}</div>
         <div className="text-xs text-muted-foreground mt-1">{label}</div>
         {subtitle && <div className="text-2xs text-muted-foreground/60 mt-0.5">{subtitle}</div>}
      </div>
   );
}

function BarRow({ label, value, max, onClick, suffix = "", labelTooltip, valueTooltip }) {
   const pct = max > 0 ? (value / max) * 100 : 0;
   const Tag = onClick ? "button" : "div";
   return (
      <Tag onClick={onClick} className={cn("w-full text-left group py-1.5 flex items-center gap-4", onClick ? "cursor-pointer hover:bg-accent/50 -mx-2 px-2 rounded" : "-mx-2 px-2")}>
         {labelTooltip !== false ? (
            <Tooltip>
               <TooltipTrigger asChild>
                  <span className={cn("text-xs truncate flex-1 min-w-0 transition-colors", onClick ? "text-foreground/80 group-hover:text-foreground" : "text-foreground/80")}>
                     {label}
                  </span>
               </TooltipTrigger>
               <TooltipContent side="top">
                  <TooltipContainer>{labelTooltip || label}</TooltipContainer>
               </TooltipContent>
            </Tooltip>
         ) : (
            <span className={cn("text-xs truncate flex-1 min-w-0 transition-colors", onClick ? "text-foreground/80 group-hover:text-foreground" : "text-foreground/80")}>
               {label}
            </span>
         )}
         <Tooltip>
            <TooltipTrigger asChild>
               <div className="w-24 sm:w-36 2xl:w-48 shrink-0 h-2.5 bg-accent rounded-full overflow-hidden">
                  <div className="h-full bg-primary/70 rounded-full transition-all duration-300" style={{ width: `${pct}%` }} />
               </div>
            </TooltipTrigger>
            <TooltipContent side="top">
               {valueTooltip || `${value}${suffix}`}
            </TooltipContent>
         </Tooltip>
         {onClick && <ArrowRight className="size-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />}
      </Tag>
   );
}

function ChartSection({ title, children }) {
   return (
      <section>
         <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-3">{title}</h3>
         {children}
      </section>
   );
}

const KAPITEL_ORDER = [
   "Executive Summary",
   "Kapitel 1: Einführung",
   "Kapitel 2: Genehmigter Szenariorahmen",
   "Kapitel 3: Rahmenbedingungen und Eingangsgrößen der Modellierung",
   "Kapitel 4: Stand der Umsetzung von Netzausbaumaßnahmen",
   "Kapitel 5: Versorgungssicherheitsbetrachtung für Methan 2030",
   "Kapitel 6: Szenarienbasierte Modellierungen für 2037 und 2045",
   "Kapitel 7: Netzausbauvorschlag",
   "Kapitel 8: Schlusswort und Ausblick",
   "Anhänge und Anlagen",
   "Generelle Anmerkungen",
   "NEP-Gas-Datenbank",
];

export default function Dashboard({ themen, organisationen, orgMap, onNavigateToThema, onNavigateToOrg, onNavigateToSearch }) {
   const stats = useMemo(() => {
      const avgOrgsPerThema = (themen.reduce((s, t) => s + t.organisationen.length, 0) / themen.length).toFixed(1);

      // Count themes per org
      const themesPerOrg = new Map();
      for (const t of themen) {
         for (const nr of t.organisationen) {
            themesPerOrg.set(nr, (themesPerOrg.get(nr) || 0) + 1);
         }
      }
      const avgThemesPerOrg = ([...themesPerOrg.values()].reduce((s, c) => s + c, 0) / organisationen.length).toFixed(1);

      const sortedThemen = themen.map((t, i) => ({ thema: t.thema, count: t.organisationen.length, idx: i })).sort((a, b) => b.count - a.count);
      const topThemen = sortedThemen.slice(0, 10);

      const topOrgs = [...themesPerOrg.entries()]
         .sort((a, b) => b[1] - a[1])
         .slice(0, 10)
         .map(([nr, count]) => {
            const org = orgMap.get(String(nr));
            return {
               nr,
               label: org?.abkürzung || `Org ${nr}`,
               fullName: org?.organisation || `Organisation ${nr}`,
               count
            };
         });

      const chapterCounts = {};
      for (const org of organisationen) {
         for (const s of org.stellungnahmen) {
            chapterCounts[s.kapitel] = (chapterCounts[s.kapitel] || 0) + 1;
         }
      }
      const chapters = Object.entries(chapterCounts)
         .sort((a, b) => {
            const ai = KAPITEL_ORDER.indexOf(a[0]);
            const bi = KAPITEL_ORDER.indexOf(b[0]);
            return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
         })
         .map(([kapitel, count]) => ({ kapitel, count }));
      const chaptersMax = Math.max(...chapters.map(c => c.count));

      const swCounts = {};
      for (const org of organisationen) {
         for (const s of org.stellungnahmen) {
            for (const sw of s.schlagworte) {
               swCounts[sw] = (swCounts[sw] || 0) + 1;
            }
         }
      }
      const topSchlagworte = Object.entries(swCounts)
         .sort((a, b) => b[1] - a[1])
         .slice(0, 10)
         .map(([sw, count]) => ({ sw, count }));

      return { avgThemesPerOrg, avgOrgsPerThema, topThemen, topOrgs, chapters, chaptersMax, topSchlagworte };
   }, [themen, organisationen, orgMap]);

   return (
      <TooltipProvider>
         <ScrollArea className="h-full">
         <div className="px-6 lg:px-8 py-10 lg:py-12">
            <div className="max-w-[1600px] mx-auto space-y-12">
               <div className="grid grid-cols-2 gap-4 max-w-lg mx-auto">
                  <StatCard label="Organisationen" value={organisationen.length} subtitle={`Ø ${stats.avgThemesPerOrg} Themen pro Organisation`} />
                  <StatCard label="Themen" value={themen.length} subtitle={`Ø ${stats.avgOrgsPerThema} Organisationen pro Thema`} />
               </div>

               <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-8">
                  <ChartSection title="Top 10 — Häufig angesprochene Themen">
                     {stats.topThemen.map(t => (
                        <BarRow key={t.idx} label={t.thema} value={t.count} max={stats.topThemen[0]?.count || 1} suffix=" Org." onClick={() => onNavigateToThema(t.idx)} valueTooltip={`${t.count} Organisation${t.count !== 1 ? "en" : ""}`} />
                     ))}
                  </ChartSection>

                  <ChartSection title="Top 10 — Organisationen mit den meisten Themen">
                     {stats.topOrgs.map(o => (
                        <BarRow key={o.nr} label={o.fullName} value={o.count} max={stats.topOrgs[0]?.count || 1} suffix=" Themen" onClick={() => onNavigateToOrg(o.nr)} valueTooltip={`${o.count} Themen`} />
                     ))}
                  </ChartSection>
               </div>

               <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-8">
                  <ChartSection title="Stellungnahmen pro Kapitel">
                     {stats.chapters.map(c => (
                        <BarRow key={c.kapitel} label={c.kapitel} value={c.count} max={stats.chaptersMax} suffix=" Einr." onClick={() => onNavigateToSearch(c.kapitel)} labelTooltip={false} valueTooltip={`${c.count} Stellungnahme${c.count !== 1 ? "n" : ""}`} />
                     ))}
                  </ChartSection>

                  <ChartSection title="Top 10 — Häufig verwendete Schlagworte">
                     {stats.topSchlagworte.map(s => (
                        <BarRow key={s.sw} label={s.sw} value={s.count} max={stats.topSchlagworte[0]?.count || 1} suffix=" Nenn." onClick={() => onNavigateToSearch(s.sw)} valueTooltip={`${s.count} Nennung${s.count !== 1 ? "en" : ""}`} />
                     ))}
                  </ChartSection>
               </div>
            </div>
         </div>
         </ScrollArea>
      </TooltipProvider>
   );
}
