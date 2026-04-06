import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { BarChart3, List, Building2, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { buildOrgMap } from "@/lib/helpers";
import Dashboard from "@/components/Dashboard";
import ThemenView from "@/components/ThemenView";
import OrgView from "@/components/OrgView";
import SucheView from "@/components/SucheView";

const TABS = [
   { key: "dashboard", label: "Übersicht", icon: BarChart3 },
   { key: "themen", label: "Themen", icon: List },
   { key: "organisationen", label: "Organisationen", icon: Building2 },
   { key: "suche", label: "Suche", icon: Search },
];

const NAV_KEY = "mainview";

function makeState(view, themaIdx = null, orgNr = null, searchQuery = null) {
   return { _nav: NAV_KEY, view, themaIdx, orgNr, searchQuery };
}

export default function MainView({ organisationen, themen }) {
   const [navState, setNavState] = useState(() => makeState("dashboard"));
   const skipPushRef = useRef(false);

   const orgMap = useMemo(() => buildOrgMap(organisationen), [organisationen]);

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
      window.history.replaceState(makeState("dashboard"), "");
      const onPopstate = (e) => {
         if (e.state?._nav === NAV_KEY) {
            skipPushRef.current = true;
            setNavState(e.state);
         }
      };
      window.addEventListener("popstate", onPopstate);
      return () => window.removeEventListener("popstate", onPopstate);
   }, []);

   // Navigation: pushState (major nav = cross-view)
   const navigateToOrg = useCallback((nr) => {
      setNavState((prev) => makeState("organisationen", prev.themaIdx, String(nr)));
   }, []);

   const navigateToThema = useCallback((idx) => {
      setNavState((prev) => makeState("themen", idx, prev.orgNr));
   }, []);

   // Tab switch: replaceState (no history pollution)
   const setView = useCallback((key) => {
      setNavState((prev) => {
         const next = makeState(key, prev.themaIdx, prev.orgNr, prev.searchQuery);
         window.history.replaceState(next, "");
         skipPushRef.current = true;
         return next;
      });
   }, []);

   // Navigate to search with pre-filled query
   const navigateToSearch = useCallback((query) => {
      setNavState((prev) => makeState("suche", prev.themaIdx, prev.orgNr, query));
   }, []);

   // In-view selection: replaceState (no new history entry)
   const selectThemaIdx = useCallback((idx) => {
      setNavState((prev) => {
         const next = makeState("themen", idx, prev.orgNr);
         window.history.replaceState(next, "");
         skipPushRef.current = true;
         return next;
      });
   }, []);

   const selectOrgNr = useCallback((nr) => {
      setNavState((prev) => {
         const next = makeState("organisationen", prev.themaIdx, nr);
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
                           "flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-5 py-3 sm:py-3.5 text-xs sm:text-sm transition-colors border-b-2 -mb-px",
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
                  onNavigateToThema={navigateToThema}
                  onNavigateToOrg={navigateToOrg}
                  onNavigateToSearch={navigateToSearch}
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
                  orgMap={orgMap}
                  selectedNr={navState.orgNr}
                  onSelectNr={selectOrgNr}
                  onNavigateToThema={navigateToThema}
                  onNavigateToSearch={navigateToSearch}
               />
            )}
            {navState.view === "suche" && (
               <SucheView
                  themen={themen}
                  organisationen={organisationen}
                  orgMap={orgMap}
                  onNavigateToThema={navigateToThema}
                  onNavigateToOrg={navigateToOrg}
                  initialQuery={navState.searchQuery}
               />
            )}
         </main>
      </div>
   );
}
