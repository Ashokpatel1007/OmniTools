import * as React from "react";
import { cn } from "@/lib/utils";

export function Badge({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border border-slate-200/80 bg-slate-100/80 px-3 py-1 text-xs font-medium text-slate-700 dark:border-slate-800 dark:bg-slate-900/70 dark:text-slate-300",
        className,
      )}
      {...props}
    />
  );
}
