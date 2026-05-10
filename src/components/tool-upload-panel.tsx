"use client";

import { useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UploadCloud, X } from "lucide-react";

export function ToolUploadPanel({
  title = "Upload",
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
    <Card className="border border-slate-200/80 bg-white/90 shadow-soft dark:border-slate-800 dark:bg-slate-950/80">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <UploadCloud className="h-4 w-4" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <label className="upload-zone block">
          <div className="space-y-2">
            <p className="font-medium text-slate-950 dark:text-slate-50">Drop files here or click to browse</p>
            <p className="text-sm text-slate-600 dark:text-slate-400">Large jobs stay local unless a specific tool says otherwise.</p>
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
          <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
            <span>{files.length} file(s) selected</span>
            <span className="text-slate-400">•</span>
            <span className="truncate">{files[0]?.name}</span>
          </div>
        ) : null}

        <div className="flex justify-between gap-2">
          <Button type="button" variant="outline" size="sm" onClick={clear} disabled={!files.length}>
            <X className="h-4 w-4" />
            Clear
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
