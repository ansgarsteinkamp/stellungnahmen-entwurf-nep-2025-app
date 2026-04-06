import { Tooltip as TooltipPrimitive } from "radix-ui";

import { cn } from "@/lib/utils";

function TooltipProvider({
   delayDuration = 200,
   skipDelayDuration = 0,
   ...props
}) {
   return (
      <TooltipPrimitive.Provider
         data-slot="tooltip-provider"
         delayDuration={delayDuration}
         skipDelayDuration={skipDelayDuration}
         {...props}
      />
   );
}

function Tooltip({ ...props }) {
   return <TooltipPrimitive.Root data-slot="tooltip" {...props} />;
}

function TooltipTrigger({ ...props }) {
   return <TooltipPrimitive.Trigger data-slot="tooltip-trigger" {...props} />;
}

const TooltipTriggerButton = ({ children, className, ...props }) => (
   <TooltipTrigger asChild>
      <button type="button" className={cn("cursor-default", className)} {...props}>
         {children}
      </button>
   </TooltipTrigger>
);

function TooltipContent({ className, sideOffset = 0, children, ...props }) {
   return (
      <TooltipPrimitive.Portal>
         <TooltipPrimitive.Content
            data-slot="tooltip-content"
            sideOffset={sideOffset}
            className={cn(
               "bg-primary text-primary-foreground animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 w-fit origin-(--radix-tooltip-content-transform-origin) rounded-md",
               "px-3 py-1.5",
               "xs:px-4 xs:py-2",
               "text-xs",
               className
            )}
            {...props}
         >
            {children}
            <TooltipPrimitive.Arrow className="bg-primary fill-primary z-50 size-2.5 translate-y-[calc(-50%-2px)] rotate-45 rounded-[2px]" />
         </TooltipPrimitive.Content>
      </TooltipPrimitive.Portal>
   );
}

const TooltipContainer = ({ className, children }) => (
   <div className="p-1 max-w-[calc(100vw-4rem)]">
      <div className={cn("space-y-1 xs:space-y-1.5 max-w-sm text-center hyphens-auto", className)}>{children}</div>
   </div>
);

export {
   Tooltip,
   TooltipTrigger,
   TooltipTriggerButton,
   TooltipContent,
   TooltipProvider,
   TooltipContainer
};
