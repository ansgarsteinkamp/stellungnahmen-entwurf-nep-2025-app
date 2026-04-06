import { Dialog as DialogPrimitive } from "radix-ui";
import { XIcon } from "lucide-react";

import { cn } from "@/lib/utils";

function Dialog({ ...props }) {
   return <DialogPrimitive.Root data-slot="dialog" {...props} />;
}

function DialogTrigger({ ...props }) {
   return <DialogPrimitive.Trigger data-slot="dialog-trigger" {...props} />;
}

function DialogPortal({ ...props }) {
   return <DialogPrimitive.Portal data-slot="dialog-portal" {...props} />;
}

function DialogClose({ ...props }) {
   return <DialogPrimitive.Close data-slot="dialog-close" {...props} />;
}

function DialogOverlay({ className, ...props }) {
   return (
      <DialogPrimitive.Overlay
         data-slot="dialog-overlay"
         className={cn("data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/50", className)}
         {...props}
      />
   );
}

function DialogContent({
   className,
   children,
   showCloseButton = true,
   closeButtonRef,
   ...props
}) {
   return (
      <DialogPortal data-slot="dialog-portal">
         <DialogOverlay className="p-4 grid place-items-center overflow-y-auto scrollbar-hide">
            <DialogPrimitive.Content
               data-slot="dialog-content"
               className={cn(
                  "relative",
                  "bg-background data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
                  "z-50 grid w-full",
                  "gap-4.5 xs:gap-6",
                  "rounded-lg border",
                  "py-4.5 xs:py-6 px-6 xs:px-8",
                  "shadow-lg duration-200",
                  "max-w-lg",
                  className
               )}
               {...props}
            >
               {children}
               {showCloseButton && (
                  <DialogPrimitive.Close
                     ref={closeButtonRef}
                     data-slot="dialog-close"
                     className={cn(
                        "ring-offset-background focus:ring-ring data-[state=open]:bg-accent data-[state=open]:text-muted-foreground absolute top-4 right-4",
                        "xs:top-6 xs:right-6",
                        "rounded-xs opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4"
                     )}
                  >
                     <XIcon />
                     <span className="sr-only">Close</span>
                  </DialogPrimitive.Close>
               )}
            </DialogPrimitive.Content>
         </DialogOverlay>
      </DialogPortal>
   );
}

function DialogHeader({ className, ...props }) {
   return (
      <div
         data-slot="dialog-header"
         className={cn(
            "flex flex-col gap-2 text-center",
            "xs:text-left",
            className
         )}
         {...props}
      />
   );
}

const DialogHeaderWithIcon = ({ icon: Icon, title, description, className, ...props }) => (
   <DialogHeader className={cn("min-w-0 text-left", className)} {...props}>
      <div className="min-w-0 flex items-center gap-4">
         <div className={cn("rounded-full bg-accent/75 shrink-0", description ? "p-3.5" : "p-3")}>
            <Icon aria-hidden="true" className={cn(description ? "size-5.5" : "size-5")} />
         </div>
         <div className="min-w-0 space-y-1 pr-5">
            <DialogTitle className="truncate">{title}</DialogTitle>
            <DialogDescription className="truncate">{description}</DialogDescription>
         </div>
      </div>
   </DialogHeader>
);

function DialogFooter({ className, ...props }) {
   return (
      <div
         data-slot="dialog-footer"
         className={cn(
            "flex flex-col-reverse gap-2",
            "xs:flex-row xs:justify-end",
            className
         )}
         {...props}
      />
   );
}

function DialogTitle({ className, ...props }) {
   return (
      <DialogPrimitive.Title
         data-slot="dialog-title"
         className={cn("font-semibold", className)}
         {...props}
      />
   );
}

function DialogDescription({ className, ...props }) {
   return <DialogPrimitive.Description data-slot="dialog-description" className={cn("text-muted-foreground text-sm", className)} {...props} />;
}

export {
   Dialog,
   DialogClose,
   DialogContent,
   DialogDescription,
   DialogFooter,
   DialogHeader,
   DialogHeaderWithIcon,
   DialogOverlay,
   DialogPortal,
   DialogTitle,
   DialogTrigger
};
