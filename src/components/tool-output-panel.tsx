"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Download,
  FileText,
  Image as ImageIcon,
  Info,
  FileArchive,
  Music2,
} from "lucide-react";
import type { ProcessorResult } from "@/lib/processors";
import {
  ReactCompareSlider,
  ReactCompareSliderImage,
} from "react-compare-slider";

const transparentBg =
  "bg-[linear-gradient(45deg,#e5e7eb_25%,transparent_25%),linear-gradient(-45deg,#e5e7eb_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#e5e7eb_75%),linear-gradient(-45deg,transparent_75%,#e5e7eb_75%)] dark:bg-[linear-gradient(45deg,#1e293b_25%,transparent_25%),linear-gradient(-45deg,#1e293b_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#1e293b_75%),linear-gradient(-45deg,transparent_75%,#1e293b_75%)] bg-[length:20px_20px] bg-[position:0_0,0_10px,10px_-10px,-10px_0px]";

type Props = {
  result: ProcessorResult | null;
  originalFile?: File | null;
  zoom?: number;
};

function isImageMime(mime: string) {
  return mime.startsWith("image/");
}

function isPdfMime(mime: string) {
  return mime === "application/pdf";
}

function isAudioMime(mime: string) {
  return mime.startsWith("audio/");
}

function isVideoMime(mime: string) {
  return mime.startsWith("video/");
}

export function ToolOutputPanel({
  result,
  originalFile,
  zoom = 100,
}: Props) {
  const [objectUrl, setObjectUrl] = useState<string | null>(null);
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);


  useEffect(() => {
    if (!originalFile) {
      setOriginalUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return null;
      });

      return;
    }

    const url = URL.createObjectURL(originalFile);

    setOriginalUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return url;
    });

    return () => {
      URL.revokeObjectURL(url);
    };
  }, [originalFile]);


  useEffect(() => {
    if (!result?.file?.blob) {
      setObjectUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return null;
      });

      return;
    }

    const url = URL.createObjectURL(result.file.blob);

    setObjectUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return url;
    });

    return () => {
      URL.revokeObjectURL(url);
    };
  }, [result]);

  const downloadHref = useMemo(() => objectUrl, [objectUrl]);

  if (!result) return null;

if (result.error) {
  return (
    <section className="surface-panel p-6">
      <div className="rounded-3xl border border-red-200 bg-red-50 p-5 text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
        <div className="text-lg font-semibold">
          Processing failed
        </div>

        <div className="mt-2 text-sm leading-6">
          {result.error}
        </div>
      </div>
    </section>
  );
}

  const mime = result.file?.mime || "";
  const size = result.file?.blob?.size ?? 0;

  return (
    <section className="surface-panel overflow-hidden">
      <div className="border-b border-slate-200/70 px-5 py-4 dark:border-slate-800">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 rounded-full border border-violet-200/70 bg-violet-50 px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] text-violet-700 dark:border-violet-900 dark:bg-violet-950/40 dark:text-violet-300">
              <Info className="h-3.5 w-3.5" />
              Output ready
            </div>
            <h3 className="text-xl font-semibold tracking-tight text-slate-950 dark:text-slate-50">{result.title}</h3>
            {result.description ? (
              <p className="max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-400">{result.description}</p>
            ) : null}
          </div>

          {result.file && downloadHref ? (
            <a
              href={downloadHref}
              download={result.file.name}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-950 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200"
            >
              <Download className="h-4 w-4" />
              Download
            </a>
          ) : null}
        </div>
      </div>

      <div className="space-y-4 p-3 sm:p-5">
        {result.text ? (
          <div className="rounded-3xl border border-slate-200/80 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/70">
            <div className="mb-3 flex items-center gap-2 text-sm font-medium text-slate-900 dark:text-slate-100">
              <FileText className="h-4 w-4" />
              Text result
            </div>
            <pre className="whitespace-pre-wrap break-words text-sm leading-6 text-slate-700 dark:text-slate-300">{result.text}</pre>
          </div>
        ) : null}

        {result.file && objectUrl ? (
            <>
              {isPdfMime(mime) ? (
                <iframe
                  src={`${objectUrl}#zoom=${zoom}`}
                  title={result.file.name}
                  className="h-[85vh] w-full bg-white"
                />
              ) : isAudioMime(mime) ? (
                <div className="flex min-h-56 flex-col items-center justify-center gap-5 p-8">
                  <Music2 className="h-10 w-10 text-slate-500" />

                  <audio
                    controls
                    src={objectUrl ?? undefined}
                    className="w-full max-w-2xl"
                  />

                  <div className="text-xs text-slate-500">
                    Audio preview
                  </div>
                </div>
              ) : isVideoMime(mime) ? (
                <div className="bg-black p-4">
                  <video
                    controls
                    src={objectUrl ?? undefined}
                    className="max-h-[85vh] w-full rounded-2xl"
                  />
                </div>
              ) : (
                <div className="flex min-h-56 flex-col items-center justify-center gap-3 p-8 text-center text-sm text-slate-600 dark:text-slate-400">
                  <FileArchive className="h-6 w-6" />

                  Preview not available for this file type.

                  <div className="text-xs text-slate-400">
                    {mime}
                  </div>
                </div>
              )}
            </>
          ) : null}
      </div>
    </section>
  );
}