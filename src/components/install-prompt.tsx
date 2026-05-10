
"use client";

import { useInstallPrompt } from "@/hooks/use-install-prompt";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { useEffect, useState } from "react";

export function InstallPrompt() {
  const { isInstallable, prompt } = useInstallPrompt();
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    const seen = window.localStorage.getItem("omnitool:install-dismissed");
    setDismissed(seen === "1");
  }, []);

  if (!isInstallable || dismissed) {
    return null;
  }

  return (
    <div className="fixed bottom-20 left-1/2 z-50 w-[calc(100%-1rem)] max-w-md -translate-x-1/2 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 dark:bg-white p-4 shadow-soft">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-medium text-slate-950 dark:text-slate-50">Install OmniTools</p>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400 dark:text-slate-500">Add it to your home screen for a faster, app-like experience.</p>
        </div>
        <Button size="sm" onClick={() => prompt()}>
          <Download className="h-4 w-4" />
          Install
        </Button>
      </div>
      <button
        className="mt-3 text-xs text-slate-500 dark:text-slate-400 dark:text-slate-500"
        onClick={() => {
          window.localStorage.setItem("omnitool:install-dismissed", "1");
          setDismissed(true);
        }}
      >
        Not now
      </button>
    </div>
  );
}
