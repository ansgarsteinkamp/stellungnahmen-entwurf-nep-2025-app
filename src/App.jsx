import { useState } from "react";
import { ErrorBoundary } from "react-error-boundary";

import Dropzone from "@/components/Dropzone";
import MainView from "@/components/MainView";
import { Button } from "@/components/ui/button";

const App = () => {
   const [data, setData] = useState(null);

   if (!data) return <Dropzone onDataLoaded={setData} />;

   return (
      <ErrorBoundary
         FallbackComponent={({ error }) => {
            console.error("App fehlgeschlagen:", error);
            return (
               <div className="min-h-svh flex flex-col items-center justify-center gap-4 p-6">
                  <p className="text-sm text-destructive">Ein Fehler ist aufgetreten.</p>
                  <Button variant="link" onClick={() => setData(null)}>
                     Zurück zur Dateiauswahl
                  </Button>
               </div>
            );
         }}
         onReset={() => setData(null)}
      >
         <MainView organisationen={data.organisationen} themen={data.themen} kapitel={data.kapitel} />
      </ErrorBoundary>
   );
};

export default App;
