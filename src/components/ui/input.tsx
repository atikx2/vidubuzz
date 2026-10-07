import * as React from "react";

import { cn } from "@/lib/utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "flex h-9 w-full min-w-0 rounded-lg bg-secondary px-3 py-1 text-sm text-foreground shadow-xs ring-1 ring-input transition-[color,box-shadow] outline-none",
        "placeholder:text-muted-foreground",
        "focus-visible:ring-2 focus-visible:ring-ring/60",
        "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
        "file:inline-flex file:border-0 file:bg-transparent file:text-sm file:font-medium",
        className,
      )}
      {...props}
    />
  );
}

export { Input };
