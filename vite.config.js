import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
   plugins: [react(), tailwindcss()],
   base: "/stellungnahmen-entwurf-nep-2025-app/",
   server: { open: true },
   resolve: {
      alias: {
         "@": path.resolve(__dirname, "./src")
      }
   }
});
