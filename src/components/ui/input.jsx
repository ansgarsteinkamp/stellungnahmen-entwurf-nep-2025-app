import * as React from "react";

import { cn } from "@/lib/utils";

function Input({ className, type, size = "default", autoComplete = "off", ...props }) {
   return (
      <input
         type={type}
         data-slot="input"
         className={cn(
            "file:text-foreground",
            "placeholder:text-muted-foreground/60",
            "selection:bg-primary selection:text-primary-foreground border-input flex",
            "w-full min-w-0 rounded-md border",
            "bg-field",
            "shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
            "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
            size === "default" && "h-9 px-3 py-1 text-sm",
            size === "sm" && "h-7 px-2 py-0.5 text-xs font-medium",
            className
         )}
         autoComplete={autoComplete}
         {...props}
      />
   );
}

export { Input };
