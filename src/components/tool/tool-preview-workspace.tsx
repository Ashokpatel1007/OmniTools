"use client";

import { useMemo } from "react";
import {
  FileText,
  Image as ImageIcon,
  Music2,
  MoveDown,
  MoveUp,
  Trash2,
  Video,
} from "lucide-react";

const transparentBg =
  "bg-[linear-gradient(45deg,#e5e7eb_25%,transparent_25%),linear-gradient(-45deg,#e5e7eb_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#e5e7eb_75%),linear-gradient(-45deg,transparent_75%,#e5e7eb_75%)] dark:bg-[linear-gradient(45deg,#1e293b_25%,transparent_25%),linear-gradient(-45deg,#1e293b_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#1e293b_75%),linear-gradient(-45deg,transparent_75%,#1e293b_75%)] bg-[length:20px_20px] bg-[position:0_0,0_10px,10px_-10px,-10px_0px]";

type PreviewFile = {
  id: string;
  file: File;
  url: string;
};

type Props = {
  files: PreviewFile[];
  activeId: string | null;
  onActiveChange: (id: string) => void;
  onRemove: (id: string) => void;
  onMove: (id: string, direction: -1 | 1) => void;
};

function isImage(file: File) {
  return file.type.startsWith("image/");
}

function isPdf(file: File) {
  return file.type === "application/pdf";
}

function isVideo(file: File) {
  return file.type.startsWith("video/");
}

function isAudio(file: File) {
  return file.type.startsWith("audio/");
}

function PreviewShell({ file, url }: { file: File; url: string }) {
  if (isImage(file)) {
    return (
      <div className={`flex min-h-[22rem] items-center justify-center p-4 ${transparentBg}`}>
        <img src={url} alt={file.name} className="max-h-[72vh] w-auto max-w-full rounded-2xl object-contain shadow-sm" />
      </div>
    );
  }

  if (isPdf(file)) {
    return <iframe src={url} title={file.name} className="h-[72vh] w-full bg-white" />;
  }

  if (isVideo(file)) {
    return (
      <div className="bg-black p-4">
        <video src={url} controls className="h-[72vh] w-full rounded-2xl bg-black" />
      </div>
    );
  }

  if (isAudio(file)) {
    return (
      <div className="flex min-h-[22rem] flex-col items-center justify-center gap-4 p-8">
        <Music2 className="h-10 w-10 text-slate-500" />
        <audio controls src={url} className="w-full max-w-2xl" />
        <div className="text-xs text-slate-500">Audio preview</div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[22rem] flex-col items-center justify-center gap-3 p-8 text-sm text-slate-600 dark:text-slate-400">
      <FileText className="h-6 w-6" />
      Preview unavailable
      <div className="text-xs text-slate-400">{file.type || "unknown"}</div>
    </div>
  );
}

export function ToolPreviewWorkspace({
  files,
  activeId,
  onActiveChange,
  onRemove,
  onMove,
}: Props) {
  const active = useMemo(
    () => files.find((item) => item.id === activeId) ?? files[0],
    [activeId, files],
  );

  if (!files.length || !active) return null;

  return (
    <div className="grid gap-4 xl:grid-cols-[240px_minmax(0,1fr)]">
      <div className="space-y-2">
        <div className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Files</div>
        <div className="space-y-2">
          {files.map((item, index) => {
            const selected = active.id === item.id;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onActiveChange(item.id)}
                className={`flex w-full items-center gap-3 rounded-2xl border p-2 text-left transition ${
                  selected
                    ? "border-slate-950 bg-slate-950 text-white dark:border-white dark:bg-white dark:text-slate-950"
                    : "border-slate-200 bg-white hover:border-slate-300 dark:border-slate-800 dark:bg-slate-950 dark:hover:border-slate-700"
                }`}
              >
                {isImage(item.file) ? (
                  <img src={item.url} alt={item.file.name} className="h-12 w-12 rounded-xl object-cover" />
                ) : (
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-900">
                    <ImageIcon className="h-4 w-4 text-slate-500" />
                  </div>
                )}

                <div className="min-w-0 flex-1">
                  <div className="truncate text-xs font-medium">{index + 1}. {item.file.name}</div>
                  <div className="mt-1 text-[11px] text-slate-500">{(item.file.size / 1024 / 1024).toFixed(2)} MB</div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onMove(item.id, -1);
                    }}
                    className="rounded-lg p-1 text-slate-500 transition hover:bg-slate-100 dark:hover:bg-slate-800"
                    aria-label="Move up"
                  >
                    <MoveUp className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onMove(item.id, 1);
                    }}
                    className="rounded-lg p-1 text-slate-500 transition hover:bg-slate-100 dark:hover:bg-slate-800"
                    aria-label="Move down"
                  >
                    <MoveDown className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemove(item.id);
                    }}
                    className="rounded-lg p-1 text-slate-500 transition hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40"
                    aria-label="Remove"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
        <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3 dark:border-slate-800">
          <div className="min-w-0">
            <div className="truncate text-sm font-medium text-slate-950 dark:text-slate-50">{active.file.name}</div>
            <div className="mt-1 text-xs text-slate-500">{(active.file.size / 1024 / 1024).toFixed(2)} MB</div>
          </div>
        </div>
        <PreviewShell file={active.file} url={active.url} />
      </div>
    </div>
  );
}
