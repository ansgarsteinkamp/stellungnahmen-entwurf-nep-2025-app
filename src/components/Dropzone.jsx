import { useState } from "react";
import { useDropzone } from "react-dropzone";

import { Loader, Upload, TriangleAlert } from "lucide-react";

import { cn } from "@/lib/utils";

const Dropzone = ({ onDataLoaded }) => {
   const [error, setError] = useState(null);
   const [isParsing, setIsParsing] = useState(false);

   const handleDrop = (acceptedFiles, fileRejections) => {
      if (fileRejections.length > 0) {
         setError(
            {
               "file-invalid-type": "Der Dateityp muss .json sein.",
               "too-many-files": "Es darf nur eine Datei ausgewählt werden."
            }[fileRejections[0]?.errors[0]?.code] || "Fehler beim Verarbeiten der Datei"
         );
         return;
      }

      const file = acceptedFiles[0];
      setError(null);
      setIsParsing(true);

      const reader = new FileReader();
      reader.onload = e => {
         try {
            const parsed = JSON.parse(e.target.result);
            if (!Array.isArray(parsed?.organisationen) || !Array.isArray(parsed?.themen)) {
               setError("Die Datei enthält nicht die erwartete Struktur.");
               setIsParsing(false);
               return;
            }
            if (!Array.isArray(parsed.kapitel)) {
               setError("Die Datei quelldaten.json ist veraltet, bitte die neue Version quelldaten_v2.json verwenden.");
               setIsParsing(false);
               return;
            }
            onDataLoaded(parsed);
         } catch {
            setError("Die Datei enthält kein gültiges JSON.");
            setIsParsing(false);
         }
      };
      reader.onerror = () => {
         setError("Fehler beim Lesen der Datei.");
         setIsParsing(false);
      };
      reader.readAsText(file);
   };

   const { getRootProps, getInputProps, isDragActive } = useDropzone({
      onDrop: handleDrop,
      accept: { "application/json": [".json"] },
      multiple: false,
      disabled: isParsing
   });

   const Icon = error ? TriangleAlert : isParsing ? Loader : Upload;

   return (
      <div className="min-h-svh flex flex-col items-center justify-center gap-8 p-6">
         <div
            {...getRootProps()}
            className={cn(
               "flex flex-col items-center gap-2.5 bg-field border p-6 xs:p-8 rounded-md shadow-xs cursor-pointer transition-[color,box-shadow] outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50",
               isDragActive && "border-primary ring-2 ring-primary",
               !isDragActive && "border-input focus-visible:border-ring",
               isParsing && "cursor-not-allowed opacity-50"
            )}
         >
            <input {...getInputProps()} />

            <Icon className={cn("size-4 xs:size-4.5", !error && "text-muted-foreground/75", isParsing && "animate-spin")} />

            <div className="text-center space-y-1 xs:space-y-2">
               <p className="font-medium">{error || "quelldaten_v2.json hierher ziehen oder klicken"}</p>
               <p className="text-2xs xs:text-xs text-muted-foreground/60 mt-1">Die Daten werden lokal im Browser verarbeitet, es findet kein Upload statt.</p>
            </div>
         </div>

         <h1 className="text-xl xs:text-4xl text-muted-foreground/20 text-center select-none">Stellungnahmen zum NEP-Entwurf 2025</h1>
      </div>
   );
};

export default Dropzone;
