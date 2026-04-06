import * as React from "react";
import { Search } from "lucide-react";

import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";

const SearchInput = ({ value, setValue, placeholder = "Suchen...", className, inputClassName, ...props }) => {
   const id = React.useId();

   return (
      <div className={cn("flex items-center gap-2", className)}>
         <label htmlFor={id} className="shrink-0 text-muted-foreground">
            <Search className="size-4" />
         </label>
         <Input id={id} type="search" value={value} onChange={e => setValue(e.target.value)} placeholder={placeholder} className={inputClassName} {...props} />
      </div>
   );
};

export default SearchInput;
