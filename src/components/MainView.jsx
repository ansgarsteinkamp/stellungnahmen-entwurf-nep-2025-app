import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { BarChart3, List, Building2, BookOpen, Tags, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { buildOrgMap } from "@/lib/helpers";
import Dashboard from "@/components/Dashboard";
import ThemenView from "@/components/ThemenView";
import OrgView from "@/components/OrgView";
import KapitelView from "@/components/KapitelView";
import SchlagworteView from "@/components/SchlagworteView";
import SucheView from "@/components/SucheView";

const TABS = [
   { key: "dashboard", label: "Übersicht", icon: BarChart3 },
   { key: "themen", label: "Themen", icon: List },
   { key: "organisationen", label: "Organisationen", icon: Building2 },
   { key: "kapitel", label: "Kapitel", icon: BookOpen },
   { key: "schlagworte", label: "Schlagworte", icon: Tags },
   { key: "suche", label: "Suche", icon: Search },
];

const NAV_KEY = "mainview";

function makeState({ view, themaIdx = null, orgNr = null, selectedKapitel = null, selectedSchlagwort = null } = {}) {
   return { _nav: NAV_KEY, view, themaIdx, orgNr, selectedKapitel, selectedSchlagwort };
}

export default function MainView({ organisationen, themen, kapitel }) {
   const [navState, setNavState] = useState(() => makeState({ view: "dashboard" }));
   const skipPushRef = useRef(false);

   const orgMap = useMemo(() => buildOrgMap(organisationen), [organisationen]);

   const uniqueSchlagworteCount = useMemo(() => {
      const set = new Set();
      for (const org of organisationen) {
         for (const s of org.stellungnahmen) {
            for (const sw of s.schlagworte) set.add(sw);
         }
      }
      return set.size;
   }, [organisationen]);

   // Push to browser history on state change (unless triggered by popstate)
   useEffect(() => {
      if (skipPushRef.current) {
         skipPushRef.current = false;
         return;
      }
      window.history.pushState(navState, "");
   }, [navState]);

   // Initialize + listen to browser back/forward
   useEffect(() => {
      window.history.replaceState(makeState({ view: "dashboard" }), "");
      const onPopstate = (e) => {
         if (e.state?._nav === NAV_KEY) {
            const s = e.state;
            skipPushRef.current = true;
            setNavState(makeState({ view: s.view, themaIdx: s.themaIdx, orgNr: s.orgNr, selectedKapitel: s.selectedKapitel, selectedSchlagwort: s.selectedSchlagwort }));
         }
      };
      window.addEventListener("popstate", onPopstate);
      return () => window.removeEventListener("popstate", onPopstate);
   }, []);

   // Navigation: pushState (major nav = cross-view)
   const navigateToOrg = useCallback((nr) => {
      setNavState(() => makeState({ view: "organisationen", orgNr: String(nr) }));
   }, []);

   const navigateToThema = useCallback((idx) => {
      setNavState(() => makeState({ view: "themen", themaIdx: idx }));
   }, []);

   const navigateToKapitel = useCallback((kapitel) => {
      setNavState(() => makeState({ view: "kapitel", selectedKapitel: kapitel }));
   }, []);

   const navigateToSchlagwort = useCallback((schlagwort) => {
      setNavState(() => makeState({ view: "schlagworte", selectedSchlagwort: schlagwort }));
   }, []);

   // Tab switch: replaceState (no history pollution)
   const setView = useCallback((key) => {
      setNavState((prev) => {
         const next = makeState({ view: key, themaIdx: prev.themaIdx, orgNr: prev.orgNr, selectedKapitel: prev.selectedKapitel, selectedSchlagwort: prev.selectedSchlagwort });
         window.history.replaceState(next, "");
         skipPushRef.current = true;
         return next;
      });
   }, []);

   // In-view selection: replaceState (no new history entry)
   const selectThemaIdx = useCallback((idx) => {
      setNavState((prev) => {
         const next = makeState({ view: "themen", themaIdx: idx, orgNr: prev.orgNr, selectedKapitel: prev.selectedKapitel, selectedSchlagwort: prev.selectedSchlagwort });
         window.history.replaceState(next, "");
         skipPushRef.current = true;
         return next;
      });
   }, []);

   const selectOrgNr = useCallback((nr) => {
      setNavState((prev) => {
         const next = makeState({ view: "organisationen", themaIdx: prev.themaIdx, orgNr: nr, selectedKapitel: prev.selectedKapitel, selectedSchlagwort: prev.selectedSchlagwort });
         window.history.replaceState(next, "");
         skipPushRef.current = true;
         return next;
      });
   }, []);

   const selectKapitel = useCallback((kapitel) => {
      setNavState((prev) => {
         const next = makeState({ view: "kapitel", themaIdx: prev.themaIdx, orgNr: prev.orgNr, selectedKapitel: kapitel, selectedSchlagwort: prev.selectedSchlagwort });
         window.history.replaceState(next, "");
         skipPushRef.current = true;
         return next;
      });
   }, []);

   const selectSchlagwort = useCallback((schlagwort) => {
      setNavState((prev) => {
         const next = makeState({ view: "schlagworte", themaIdx: prev.themaIdx, orgNr: prev.orgNr, selectedKapitel: prev.selectedKapitel, selectedSchlagwort: schlagwort });
         window.history.replaceState(next, "");
         skipPushRef.current = true;
         return next;
      });
   }, []);

   return (
      <div className="h-screen flex flex-col overflow-hidden">
         <nav className="flex items-center justify-center border-b border-border shrink-0 mb-2">
            <div className="flex items-center">
               {TABS.map((t) => {
                  const Icon = t.icon;
                  const isActive = navState.view === t.key;
                  return (
                     <button
                        key={t.key}
                        onClick={() => setView(t.key)}
                        className={cn(
                           "flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 lg:px-5 py-3 sm:py-3.5 text-xs sm:text-sm transition-colors border-b-2 -mb-px",
                           isActive
                              ? "text-primary border-primary"
                              : "text-muted-foreground border-transparent hover:text-foreground hover:border-border"
                        )}
                     >
                        <Icon className="size-3.5" />
                        <span className="hidden xs:inline">{t.label}</span>
                        {t.key === "themen" && (
                           <span className="text-2xs sm:text-xs text-muted-foreground ml-0.5">({themen.length})</span>
                        )}
                        {t.key === "organisationen" && (
                           <span className="text-2xs sm:text-xs text-muted-foreground ml-0.5">({organisationen.length})</span>
                        )}
                        {t.key === "kapitel" && (
                           <span className="text-2xs sm:text-xs text-muted-foreground ml-0.5">({kapitel.length})</span>
                        )}
                        {t.key === "schlagworte" && (
                           <span className="text-2xs sm:text-xs text-muted-foreground ml-0.5">({uniqueSchlagworteCount})</span>
                        )}
                     </button>
                  );
               })}
            </div>
         </nav>

         <main className="flex-1 min-h-0 overflow-hidden">
            {navState.view === "dashboard" && (
               <Dashboard
                  themen={themen}
                  organisationen={organisationen}
                  orgMap={orgMap}
                  kapitel={kapitel}
                  onNavigateToThema={navigateToThema}
                  onNavigateToOrg={navigateToOrg}
                  onNavigateToKapitel={navigateToKapitel}
                  onNavigateToSchlagwort={navigateToSchlagwort}
               />
            )}
            {navState.view === "themen" && (
               <ThemenView
                  themen={themen}
                  orgMap={orgMap}
                  selectedIdx={navState.themaIdx}
                  onSelectIdx={selectThemaIdx}
                  onNavigateToOrg={navigateToOrg}
               />
            )}
            {navState.view === "organisationen" && (
               <OrgView
                  organisationen={organisationen}
                  themen={themen}
                  kapitel={kapitel}
                  orgMap={orgMap}
                  selectedNr={navState.orgNr}
                  onSelectNr={selectOrgNr}
                  onNavigateToThema={navigateToThema}
                  onNavigateToKapitel={navigateToKapitel}
                  onNavigateToSchlagwort={navigateToSchlagwort}
               />
            )}
            {navState.view === "kapitel" && (
               <KapitelView
                  organisationen={organisationen}
                  kapitel={kapitel}
                  orgMap={orgMap}
                  selectedKapitel={navState.selectedKapitel}
                  onSelectKapitel={selectKapitel}
                  onNavigateToOrg={navigateToOrg}
                  onNavigateToSchlagwort={navigateToSchlagwort}
               />
            )}
            {navState.view === "schlagworte" && (
               <SchlagworteView
                  organisationen={organisationen}
                  selectedSchlagwort={navState.selectedSchlagwort}
                  onSelectSchlagwort={selectSchlagwort}
                  onNavigateToOrg={navigateToOrg}
               />
            )}
            {navState.view === "suche" && (
               <SucheView
                  organisationen={organisationen}
                  onNavigateToOrg={navigateToOrg}
                  onNavigateToSchlagwort={navigateToSchlagwort}
               />
            )}
         </main>
      </div>
   );
}
