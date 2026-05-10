"use client";

import { useRef, useState } from "react";
import { UploadCloud, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ToolUploadPanel({
  title = "Upload files",
  multiple,
  accept,
  onFiles,
}: {
  title?: string;
  multiple?: boolean;
  accept?: string;
  onFiles?: (files: File[]) => void;
}) {
  const [files, setFiles] = useState<File[]>([]);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const clear = () => {
    setFiles([]);
    if (inputRef.current) inputRef.current.value = "";
    onFiles?.([]);
  };

  return (
    <div className="space-y-3">
      <label className="group block cursor-pointer rounded-[1.5rem] border border-dashed border-slate-300 bg-slate-50/80 p-5 transition hover:border-slate-400 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950/60 dark:hover:border-slate-700">
        <div className="flex items-start gap-3">
          <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-slate-950 text-white dark:bg-white dark:text-slate-950">
            <UploadCloud className="h-5 w-5" />
          </span>

          <div className="min-w-0 flex-1 space-y-1">
            <div className="text-sm font-medium text-slate-950 dark:text-slate-50">{title}</div>
            <p className="text-sm leading-6 text-slate-600 dark:text-slate-400">
              Drop files here or click to browse. The preview stays local to your browser.
            </p>
          </div>
        </div>

        <input
          ref={inputRef}
          type="file"
          className="sr-only"
          accept={accept}
          multiple={multiple}
          onChange={(e) => {
            const list = Array.from(e.target.files || []);
            setFiles(list);
            onFiles?.(list);
          }}
        />
      </label>

      {files.length ? (
        <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300">
          <span className="font-medium text-slate-950 dark:text-slate-50">{files.length} file(s)</span>
          <span className="text-slate-400">•</span>
          <span className="truncate">{files[0]?.name}</span>
        </div>
      ) : null}

      <div className="flex justify-end">
        <Button type="button" variant="outline" size="sm" onClick={clear} disabled={!files.length}>
          <X className="h-4 w-4" />
          Clear
        </Button>
      </div>
    </div>
  );
}
