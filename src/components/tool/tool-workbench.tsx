"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ToolUploadPanel } from "@/components/tool-upload-panel";
import { ToolPreviewWorkspace } from "@/components/tool/tool-preview-workspace";
import { ToolOutputPanel } from "@/components/tool-output-panel";
import { useRecentTools } from "@/hooks/use-recent-tools";
import type { ProcessorResult } from "@/lib/processors";
import { runToolEngine, type ProcessorProgress } from "@/lib/processors/engine";
import type { ToolEntry } from "@/lib/tools/types";
import { getToolUiConfig, type ToolControlConfig } from "@/lib/tools/ui/tool-ui-config";
import { Loader2, RotateCcw } from "lucide-react";
import { toast } from "sonner";

type PreviewFile = {
  id: string;
  file: File;
  url: string;
};

function makePreviewFiles(files: File[]): PreviewFile[] {
  return files.map((file, index) => ({
    id: `${file.name}-${file.size}-${index}-${Date.now()}`,
    file,
    url: URL.createObjectURL(file),
  }));
}

export function ToolWorkbench({ tool }: { tool: ToolEntry }) {
  const { addRecent } = useRecentTools();
  const ui = useMemo(() => getToolUiConfig(tool), [tool.slug]);

  const [values, setValues] = useState<Record<string, string>>({});
  const [file, setFile] = useState<File | null>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [previewFiles, setPreviewFiles] = useState<PreviewFile[]>([]);
  const [activePreviewId, setActivePreviewId] = useState<string | null>(null);
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [progress, setProgress] = useState<ProcessorProgress | null>(null);
  const [result, setResult] = useState<ProcessorResult | null>(null);
  const [error, setError] = useState("");
  const previewFilesRef = useRef<PreviewFile[]>([]);

  useEffect(() => {
    previewFilesRef.current = previewFiles;
  }, [previewFiles]);

  useEffect(() => {
    return () => {
      previewFilesRef.current.forEach((item) => URL.revokeObjectURL(item.url));
    };
  }, []);

  useEffect(() => {
    if (tool?.slug) addRecent(tool.slug);

    setValues({});
    setFile(null);
    setFiles([]);
    setState("idle");
    setProgress(null);
    setResult(null);
    setError("");
    setActivePreviewId(null);

    setPreviewFiles((prev) => {
      prev.forEach((item) => URL.revokeObjectURL(item.url));
      return [];
    });
  }, [tool.slug, addRecent]);

  const setField = (key: string, nextValue: string) => {
    setValues((prev) => ({ ...prev, [key]: nextValue }));
  };

  const loadFiles = (list: File[]) => {
    const preview = makePreviewFiles(list);
    setPreviewFiles((prev) => {
      prev.forEach((item) => URL.revokeObjectURL(item.url));
      return preview;
    });
    setFiles(list);
    setFile(list[0] ?? null);
    setActivePreviewId(preview[0]?.id ?? null);
    setResult(null);
    setError("");
  };

  const onRemovePreview = (id: string) => {
    setPreviewFiles((prev) => {
      const next = prev.filter((item) => item.id !== id);
      const removed = prev.find((item) => item.id === id);
      if (removed) URL.revokeObjectURL(removed.url);
      setFiles(next.map((item) => item.file));
      setFile(next[0]?.file ?? null);
      if (activePreviewId === id) setActivePreviewId(next[0]?.id ?? null);
      return next;
    });
  };

  const onMovePreview = (id: string, direction: -1 | 1) => {
    setPreviewFiles((prev) => {
      const index = prev.findIndex((item) => item.id === id);
      const nextIndex = index + direction;
      if (index < 0 || nextIndex < 0 || nextIndex >= prev.length) return prev;
      const next = [...prev];
      [next[index], next[nextIndex]] = [next[nextIndex], next[index]];
      setFiles(next.map((item) => item.file));
      setFile(next[0]?.file ?? null);
      return next;
    });
  };

  const run = async () => {
    try {
      if (ui.requiresFile && !file && files.length === 0) {
        setError("Please upload a file to continue.");
        return;
      }

      setState("loading");
      setError("");
      setProgress({ stage: "validating", progress: 0 });

      const data = await runToolEngine(
        tool,
        {
          ...values,
          input: values.input ?? "",
          secondary: values.secondary ?? "",
          password: values.password ?? "",
          file,
          files,
          fileName: values.fileName ?? "",
          toolSlug: tool.slug,
          toolTitle: tool.title,
          toolCategory: tool.category,
        },
        {
          onProgress: (p) => setProgress(p),
        },
      );

      setResult(data);
      setState("done");
      toast.success("Processing complete");
    } catch (err) {
      setState("error");
      setProgress(null);
      const message = err instanceof Error ? err.message : "Something went wrong";
      setError(message);
      toast.error(message);
    }
  };

  const renderControl = (control: ToolControlConfig) => {
    const commonValue = values[control.key] ?? "";

    if (control.kind === "textarea") {
      return (
        <div key={control.key} className="space-y-2">
          <label className="text-sm font-medium text-slate-950 dark:text-slate-50">{control.label}</label>
          <Textarea
            value={commonValue}
            onChange={(e) => setField(control.key, e.target.value)}
            placeholder={control.placeholder}
            rows={control.rows}
          />
          {control.helperText ? <p className="text-xs text-slate-500 dark:text-slate-400">{control.helperText}</p> : null}
        </div>
      );
    }

    if (control.kind === "select") {
      return (
        <div key={control.key} className="space-y-2">
          <label className="text-sm font-medium text-slate-950 dark:text-slate-50">{control.label}</label>
          <select
            value={commonValue}
            onChange={(e) => setField(control.key, e.target.value)}
            className="flex h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-slate-400 dark:border-slate-800 dark:bg-slate-950"
          >
            <option value="">Select an option</option>
            {control.options?.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {control.helperText ? <p className="text-xs text-slate-500 dark:text-slate-400">{control.helperText}</p> : null}
        </div>
      );
    }

    return (
      <div key={control.key} className="space-y-2">
        <label className="text-sm font-medium text-slate-950 dark:text-slate-50">{control.label}</label>
        <Input
          type={control.type ?? "text"}
          value={commonValue}
          onChange={(e) => setField(control.key, e.target.value)}
          placeholder={control.placeholder}
        />
        {control.helperText ? <p className="text-xs text-slate-500 dark:text-slate-400">{control.helperText}</p> : null}
      </div>
    );
  };

  const canUpload = ui.requiresFile || ui.multipleFiles || ui.accepts;

  return (
    <div className="grid gap-6 xl:grid-cols-[420px_minmax(0,1fr)]">
      <div className="space-y-6">
        <Card className="overflow-hidden border border-slate-200/80 bg-white shadow-soft dark:border-slate-800 dark:bg-slate-950">
          <CardHeader className="space-y-3">
            <CardTitle className="text-lg font-semibold tracking-tight text-slate-950 dark:text-slate-50">
              Tool workspace
            </CardTitle>
            <p className="text-sm leading-6 text-slate-600 dark:text-slate-400">{ui.hint}</p>
          </CardHeader>

          <CardContent className="space-y-5">
            {canUpload ? (
              <ToolUploadPanel
                title={ui.multipleFiles ? "Upload files" : "Upload file"}
                accept={ui.accepts}
                multiple={ui.multipleFiles}
                onFiles={loadFiles}
              />
            ) : null}

            {previewFiles.length ? (
              <ToolPreviewWorkspace
                files={previewFiles}
                activeId={activePreviewId ?? previewFiles[0]?.id ?? null}
                onActiveChange={setActivePreviewId}
                onRemove={onRemovePreview}
                onMove={onMovePreview}
              />
            ) : null}

            {ui.controls.length ? (
              <div className="grid gap-4 sm:grid-cols-2">
                {ui.controls.map(renderControl)}
              </div>
            ) : null}

            <div className="flex flex-col gap-3 sm:flex-row">
              <Button onClick={run} disabled={state === "loading"} className="rounded-2xl">
                {state === "loading" ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                {ui.submitLabel}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setValues({});
                  setResult(null);
                  setError("");
                  setProgress(null);
                }}
                className="rounded-2xl"
              >
                <RotateCcw className="h-4 w-4" />
                Reset
              </Button>
            </div>

            {progress ? (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 dark:border-slate-800 dark:bg-slate-900/60">
                <div className="mb-2 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                  <span>{progress.stage}</span>
                  <span>{Math.round(progress.progress * 100)}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
                  <div className="h-full rounded-full bg-slate-950 dark:bg-white" style={{ width: `${Math.round(progress.progress * 100)}%` }} />
                </div>
              </div>
            ) : null}

            {error ? <p className="text-sm text-red-600 dark:text-red-300">{error}</p> : null}
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        <ToolOutputPanel result={result} originalFile={file} zoom={100} />

        {!result ? (
          <Card className="border border-slate-200/80 bg-white shadow-soft dark:border-slate-800 dark:bg-slate-950">
            <CardContent className="py-8 text-sm leading-6 text-slate-600 dark:text-slate-400">
              Run the tool to generate a preview and downloadable result.
            </CardContent>
          </Card>
        ) : null}

        {state === "done" ? null : null}
      </div>
    </div>
  );
}
