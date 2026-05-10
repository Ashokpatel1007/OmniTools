"use client";

import { useState } from "react";

import {
  Eye,
  FileText,
  Image as ImageIcon,
  Trash2,
  Video,
  Music2,
  MoveUp,
  MoveDown,
  Maximize2,
} from "lucide-react";

import type { ProcessorResult } from "@/lib/processors";

import {
  ReactCompareSlider,
  ReactCompareSliderImage,
} from "react-compare-slider";
const transparentBg =
  "bg-[linear-gradient(45deg,#e5e7eb_25%,transparent_25%),linear-gradient(-45deg,#e5e7eb_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#e5e7eb_75%),linear-gradient(-45deg,transparent_75%,#e5e7eb_75%)] dark:bg-[linear-gradient(45deg,#1e293b_25%,transparent_25%),linear-gradient(-45deg,#1e293b_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#1e293b_75%),linear-gradient(-45deg,transparent_75%,#1e293b_75%)] bg-[length:20px_20px] bg-[position:0_0,0_10px,10px_-10px,-10px_0px]";

type PreviewFile = {
  id: string;
  file: File;
  url: string;
};

type Props = {
  files: PreviewFile[];
  result?: ProcessorResult | null;
  onRemove: (id: string) => void;
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

export function ToolPreviewWorkspace({
  files,
  result,
  onRemove,
}: Props) {
  const [activeId, setActiveId] =
    useState<string | null>(
      files[0]?.id ?? null
    );

  const [fullscreenId, setFullscreenId] =
    useState<string | null>(null);

  if (!files.length) return null;

  const active =
    files.find(
      (item) => item.id === activeId
    ) ?? files[0];

  const renderPreview = (
    item: PreviewFile,
    fullscreen = false
  ) => {
    const previewHeight = fullscreen
      ? "h-[90vh]"
      : "h-[260px] sm:h-[360px] xl:h-[420px]";

    if (isImage(item.file)) {

        const processedImage =
          result?.file?.mime?.startsWith("image/")
            ? URL.createObjectURL(result.file.blob)
            : null;

        return (
          <div
  className={`flex h-full items-center justify-center p-4 ${transparentBg}`}
>

            {processedImage ? (

              <div className="w-full overflow-hidden rounded-3xl">
                <ReactCompareSlider
                  itemOne={
                    <ReactCompareSliderImage
                      src={item.url}
                      alt="Original"
                    />
                  }
                  itemTwo={
                    <ReactCompareSliderImage
                      src={processedImage}
                      alt="Processed"
                    />
                  }
                />
              </div>

            ) : (

              <img
                src={item.url}
                alt={item.file.name}
                className="max-h-[75vh] w-auto max-w-full rounded-2xl object-contain"
              />

            )}
          </div>
        );
      }

    if (isPdf(item.file)) {
      return (
        <iframe
          src={item.url}
          className={`w-full ${previewHeight} bg-white`}
        />
      );
    }

    if (isVideo(item.file)) {
      return (
        <div className="bg-black p-4">
          <video
            src={item.url}
            controls
            className={`${previewHeight} w-full rounded-2xl`}
          />
        </div>
      );
    }

    if (isAudio(item.file)) {
      return (
        <div className="flex h-[320px] flex-col items-center justify-center gap-5 p-8">
          <Music2 className="h-12 w-12 text-slate-400" />

          <audio
            controls
            src={item.url}
            className="w-full max-w-2xl"
          />

          <div className="text-sm text-slate-500">
            Audio Preview
          </div>
        </div>
      );
    }

    return (
      <div className="flex h-[320px] flex-col items-center justify-center gap-3 text-slate-500">
        <FileText className="h-10 w-10" />

        <div className="text-sm">
          Preview unavailable
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2">
        <Eye className="h-4 w-4" />

        <div className="text-sm font-semibold">
          Advanced Live Workspace
        </div>
      </div>

      <div className="flex flex-col gap-5 xl:grid xl:grid-cols-[260px_1fr]">

        {/* SIDEBAR */}
        <div className="space-y-3">
          {files.map((item, index) => {
            const activeItem =
              active?.id === item.id;

            return (
              <button
                key={item.id}
                onClick={() =>
                  setActiveId(item.id)
                }
                className={`w-full overflow-hidden rounded-2xl border text-left transition ${
                  activeItem
                    ? "border-violet-500 bg-violet-50 dark:bg-violet-950/30"
                    : "border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950"
                }`}
              >
                <div className="flex items-center justify-between border-b border-slate-200 px-3 py-2 dark:border-slate-800">

                  <div className="flex items-center gap-3 overflow-hidden">
                    {isImage(item.file) ? (
                      <img
                        src={item.url}
                        alt={item.file.name}
                        className="h-12 w-12 rounded-xl object-cover"
                      />
                    ) : (
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800">
                        <ImageIcon className="h-4 w-4 text-slate-500" />
                      </div>
                    )}

                    <div className="min-w-0">
                      <div className="truncate text-xs font-medium">
                        {index + 1}. {item.file.name}
                      </div>

                      <div className="mt-1 text-[11px] text-slate-500">
                        {(item.file.size / 1024 / 1024).toFixed(2)} MB
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">

                    <button
                      type="button"
                      className="rounded-lg p-1 text-slate-500 transition hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      <MoveUp className="h-4 w-4" />
                    </button>

                    <button
                      type="button"
                      className="rounded-lg p-1 text-slate-500 transition hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      <MoveDown className="h-4 w-4" />
                    </button>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setFullscreenId(item.id);
                      }}
                      className="rounded-lg p-1 text-slate-500 transition hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      <Maximize2 className="h-4 w-4" />
                    </button>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemove(item.id);
                      }}
                      className="rounded-lg p-1 text-slate-500 transition hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* MAIN PREVIEW */}
        <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
          <div className="border-b border-slate-200 px-5 py-4 dark:border-slate-800">
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="text-sm font-semibold">
                  {active.file.name}
                </div>

                <div className="mt-1 text-xs text-slate-500">
                  Live preview • Final export will match this output
                </div>
              </div>

              <div className="text-xs text-slate-500">
                {(active.file.size / 1024 / 1024).toFixed(2)} MB
              </div>
            </div>
          </div>

          {renderPreview(active)}
        </div>

      </div>

      {/* FULLSCREEN */}
      {fullscreenId ? (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-6">
          <div className="relative h-full w-full overflow-auto rounded-2xl bg-slate-950">
            <button
              onClick={() =>
                setFullscreenId(null)
              }
              className="sticky right-4 top-4 z-10 ml-auto block rounded-xl bg-white px-4 py-2 text-sm font-medium text-black"
            >
              Close
            </button>

            {renderPreview(
              files.find(
                (x) => x.id === fullscreenId
              )!,
              true
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}