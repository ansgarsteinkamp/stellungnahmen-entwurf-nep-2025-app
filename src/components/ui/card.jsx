import { cn } from "@/lib/utils";

function Card({ className, ...props }) {
   return (
      <div
         data-slot="card"
         className={cn(
            "bg-card text-card-foreground flex flex-col",
            "gap-2 xs:gap-3",
            "rounded-xl border",
            "py-5 xs:py-7",
            "shadow-sm",
            className
         )}
         {...props}
      />
   );
}

function CardHeader({ className, ...props }) {
   return (
      <div
         data-slot="card-header"
         className={cn("flex flex-col gap-0.5 xs:gap-1 px-7 xs:px-10", className)}
         {...props}
      />
   );
}

function CardTitle({ className, ...props }) {
   return (
      <div
         data-slot="card-title"
         className={cn("font-semibold", className)}
         {...props}
      />
   );
}

function CardDescription({ className, ...props }) {
   return <div data-slot="card-description" className={cn("text-muted-foreground text-sm", className)} {...props} />;
}

function CardContent({ className, ...props }) {
   return (
      <div
         data-slot="card-content"
         className={cn("px-7 xs:px-10", className)}
         {...props}
      />
   );
}

function CardContainer({ className, ...props }) {
   return <div data-slot="card-container" className={cn("flex flex-col gap-1", className)} {...props} />;
}

function CardActions({ className, ...props }) {
   return <div data-slot="card-actions" className={cn("flex items-center justify-end mx-1.5 xs:mx-2", className)} {...props} />;
}

export {
   Card,
   CardHeader,
   CardTitle,
   CardDescription,
   CardContent,
   CardContainer,
   CardActions
};
