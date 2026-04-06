import { useState } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { HomeIcon } from "@heroicons/react/24/solid";
import { Button } from "@/components/ui/button";
import registry from "@/apps/registry";

const AppAuswahl = ({ data }) => {
   const [activeApp, setActiveApp] = useState(null);

   if (activeApp) {
      const AppComponent = activeApp.component;
      return (
         <AppShell onBack={() => setActiveApp(null)}>
            <ErrorBoundary
               key={activeApp.id}
               FallbackComponent={({ error, resetErrorBoundary }) => {
                  console.error("App-Variante fehlgeschlagen:", error);
                  return (
                     <div className="min-h-svh flex flex-col items-center justify-center gap-4 p-6">
                        <p className="text-sm text-destructive">Diese App-Variante hat einen Fehler.</p>
                        <Button variant="link" onClick={resetErrorBoundary}>
                           Zurück zur Auswahl
                        </Button>
                     </div>
                  );
               }}
               onReset={() => setActiveApp(null)}
            >
               <AppComponent organisationen={structuredClone(data.organisationen)} themen={structuredClone(data.themen)} />
            </ErrorBoundary>
         </AppShell>
      );
   }

   if (registry.length === 0) {
      return (
         <div className="min-h-svh flex items-center justify-center p-6">
            <p className="text-sm text-muted-foreground">Noch keine App-Varianten registriert</p>
         </div>
      );
   }

   return (
      <div className="min-h-svh flex items-center justify-center p-6">
         <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {registry.map(app => (
               <Button key={app.id} variant="outline" onClick={() => setActiveApp(app)} className="h-auto rounded-xl px-8 py-6 text-center font-semibold">
                  {app.name}
               </Button>
            ))}
         </div>
      </div>
   );
};

const AppShell = ({ onBack, children }) => (
   <div className="min-h-svh">
      <div className="fixed top-3 left-3 z-50">
         <Button variant="ghost" size="icon-lg" onClick={onBack} className="bg-background/80 backdrop-blur-sm" aria-label="Zurück zur Auswahl">
            <HomeIcon className="size-5 xs:size-6" />
         </Button>
      </div>
      {children}
   </div>
);

export default AppAuswahl;
