"use client";

import { useEffect, useMemo, useState } from "react";
import { Download, FileArchive, FileText, Info, Music2 } from "lucide-react";
import { ReactCompareSlider, ReactCompareSliderImage } from "react-compare-slider";
import type { ProcessorResult } from "@/lib/processors";

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

function isHtmlMime(mime: string) {
  return mime === "text/html" || mime === "application/xhtml+xml";
}

export function ToolOutputPanel({ result, originalFile, zoom = 100 }: Props) {
  const [objectUrl, setObjectUrl] = useState<string | null>(null);
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);

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

    return () => URL.revokeObjectURL(url);
  }, [result]);

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

    return () => URL.revokeObjectURL(url);
  }, [originalFile]);

  const downloadHref = useMemo(() => objectUrl, [objectUrl]);

  if (!result) return null;

  const mime = result.file?.mime || "";
  const size = result.file?.blob?.size ?? 0;

  const downloadSingle = () => {
    if (!result.file || !downloadHref) return;
    const a = document.createElement("a");
    a.href = downloadHref;
    a.download = result.file.name;
    a.click();
  };

  const downloadAny = (file: { name: string; blob: Blob }) => {
    const url = URL.createObjectURL(file.blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = file.name;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 0);
  };

  if (result.error) {
    return (
      <section className="rounded-[1.75rem] border border-red-200 bg-red-50 p-5 text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
        <div className="text-lg font-semibold">Processing failed</div>
        <div className="mt-2 text-sm leading-6">{result.error}</div>
      </section>
    );
  }

  return (
    <section className="overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
      <div className="border-b border-slate-200 px-5 py-4 dark:border-slate-800">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 rounded-full border border-violet-200/70 bg-violet-50 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.18em] text-violet-700 dark:border-violet-900 dark:bg-violet-950/40 dark:text-violet-300">
              <Info className="h-3.5 w-3.5" />
              Output ready
            </div>
            <h3 className="text-xl font-semibold tracking-tight text-slate-950 dark:text-slate-50">{result.title}</h3>
            {result.description ? (
              <p className="max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-400">{result.description}</p>
            ) : null}
          </div>

          {result.file ? (
            <button
              type="button"
              onClick={downloadSingle}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-950 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200"
            >
              <Download className="h-4 w-4" />
              Download
            </button>
          ) : null}
        </div>
      </div>

      <div className="space-y-5 p-4 sm:p-5">
        {result.text ? (
          <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/60">
            <div className="mb-3 flex items-center gap-2 text-sm font-medium text-slate-900 dark:text-slate-100">
              <FileText className="h-4 w-4" />
              Text result
            </div>
            <pre className="whitespace-pre-wrap break-words text-sm leading-6 text-slate-700 dark:text-slate-300">{result.text}</pre>
          </div>
        ) : null}

        {result.file && objectUrl ? (
          isImageMime(mime) ? (
            <div className={`overflow-hidden rounded-[1.5rem] ${transparentBg}`}>
              {originalUrl && originalFile?.type.startsWith("image/") ? (
                <ReactCompareSlider
                  itemOne={<ReactCompareSliderImage src={originalUrl} alt="Original" />}
                  itemTwo={<ReactCompareSliderImage src={objectUrl} alt="Processed" />}
                />
              ) : (
                <img src={objectUrl} alt={result.file.name} className="mx-auto max-h-[72vh] w-full object-contain p-4" />
              )}
            </div>
          ) : isPdfMime(mime) ? (
            <iframe src={`${objectUrl}#zoom=${zoom}`} title={result.file.name} className="h-[72vh] w-full rounded-[1.25rem] bg-white" />
          ) : isAudioMime(mime) ? (
            <div className="flex min-h-56 flex-col items-center justify-center gap-4 rounded-[1.5rem] border border-slate-200 bg-slate-50 p-8 dark:border-slate-800 dark:bg-slate-900/60">
              <Music2 className="h-10 w-10 text-slate-500" />
              <audio controls src={objectUrl} className="w-full max-w-2xl" />
            </div>
          ) : isVideoMime(mime) ? (
            <div className="rounded-[1.5rem] bg-black p-4">
              <video controls src={objectUrl} className="max-h-[72vh] w-full rounded-2xl bg-black" />
            </div>
          ) : isHtmlMime(mime) ? (
            <iframe src={objectUrl} title={result.file.name} className="h-[72vh] w-full rounded-[1.25rem] bg-white" />
          ) : (
            <div className="flex min-h-56 flex-col items-center justify-center gap-3 rounded-[1.5rem] border border-slate-200 bg-slate-50 p-8 text-center text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-400">
              <FileArchive className="h-6 w-6" />
              Preview not available for this file type.
              <div className="text-xs text-slate-400">{mime}</div>
            </div>
          )
        ) : null}

        {result.files?.length ? (
          <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/60">
            <div className="mb-3 text-sm font-medium text-slate-900 dark:text-slate-100">Downloads</div>
            <div className="space-y-2">
              {result.files.map((file) => (
                <div key={file.name} className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-800 dark:bg-slate-950">
                  <div className="min-w-0">
                    <div className="truncate font-medium text-slate-950 dark:text-slate-50">{file.name}</div>
                    <div className="text-xs text-slate-500">{(file.blob.size / 1024 / 1024).toFixed(2)} MB</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => downloadAny(file)}
                    className="inline-flex shrink-0 items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-xs font-medium text-slate-950 transition hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-50 dark:hover:bg-slate-900"
                  >
                    <Download className="h-4 w-4" />
                    Download
                  </button>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {result.stats ? (
          <div className="grid gap-3 sm:grid-cols-2">
            {Object.entries(result.stats).map(([label, value]) => (
              <div key={label} className="rounded-2xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-900/60">
                <div className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">{label}</div>
                <div className="mt-1 text-sm font-medium text-slate-950 dark:text-slate-50">{String(value)}</div>
              </div>
            ))}
          </div>
        ) : null}

        {result.file ? (
          <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-500 dark:border-slate-800 dark:bg-slate-900/60">
            <span>{result.file.name}</span>
            <span>{(size / 1024 / 1024).toFixed(2)} MB · {mime}</span>
          </div>
        ) : null}
      </div>
    </section>
  );
}
