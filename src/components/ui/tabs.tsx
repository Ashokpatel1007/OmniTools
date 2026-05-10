import * as React from "react";
import { cn } from "@/lib/utils";

export function Tabs({ children, className }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("space-y-4", className)}>{children}</div>;
}

export function TabsList({ children, className }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("inline-flex flex-wrap gap-2 rounded-full border border-slate-200/80 bg-slate-100/80 p-1 dark:border-slate-800 dark:bg-slate-900/70", className)}>{children}</div>;
}

export function TabsTrigger({
  active,
  className,
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { active?: boolean }) {
  return (
    <button
      className={cn(
        "rounded-full px-3 py-1.5 text-sm transition",
        active ? "bg-white text-slate-950 shadow-sm dark:bg-slate-950 dark:text-slate-50" : "text-slate-600 hover:text-slate-950 dark:text-slate-300 dark:hover:text-slate-50",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
