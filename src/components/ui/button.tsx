import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "secondary" | "ghost" | "outline" | "destructive";
  size?: "sm" | "default" | "lg";
}

const variants = {
  default: "bg-slate-950 text-white hover:bg-slate-800 shadow-soft dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200",
  secondary: "bg-slate-100 text-slate-950 hover:bg-slate-200 dark:bg-slate-900 dark:text-slate-50 dark:hover:bg-slate-800",
  ghost: "bg-transparent hover:bg-slate-100 text-slate-900 dark:text-slate-200 dark:hover:bg-slate-900",
  outline: "border border-slate-200 bg-white hover:bg-slate-50 text-slate-950 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-50 dark:hover:bg-slate-900",
  destructive: "bg-rose-600 text-white hover:bg-rose-700",
};

const sizes = {
  sm: "h-8 px-3 text-sm",
  default: "h-10 px-4 text-sm",
  lg: "h-11 px-5 text-base",
};

export function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-2xl font-medium transition-colors disabled:pointer-events-none disabled:opacity-50",
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    />
  );
}
