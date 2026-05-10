"use client";

import { ToolPreviewWorkspace } from "@/components/tool/tool-preview-workspace";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ToolUploadPanel } from "@/components/tool-upload-panel";
import { ToolOutputPanel } from "@/components/tool-output-panel";
import { useRecentTools } from "@/hooks/use-recent-tools";
import type { ProcessorResult } from "@/lib/processors";
import {
  runToolEngine,
  type ProcessorProgress,
} from "@/lib/processors/engine";
import type { ToolEntry } from "@/lib/tools/types";
import {
  getToolUiConfig,
  type ToolControlConfig,
} from "@/lib/tools/ui/tool-ui-config";
import { Badge } from "@/components/ui/badge";
import {
  Loader2,
  Save,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";

import {
  ReactCompareSlider,
  ReactCompareSliderImage,
} from "react-compare-slider";



export function ToolWorkbench({
  tool,
}: {
  tool: ToolEntry;
}) {
  const { addRecent } = useRecentTools();

  const ui = useMemo(
    () => getToolUiConfig(tool),
    [tool.slug]
  );

  const [values, setValues] = useState<
    Record<string, string>
  >({});

  const [file, setFile] =
    useState<File | null>(null);

  const [files, setFiles] = useState<File[]>(
    []
  );

  const [previewFiles, setPreviewFiles] =
    useState<
      {
        id: string;
        file: File;
        url: string;
      }[]
    >([]);

  const [selectedPages, setSelectedPages] =
    useState<number[]>([]);

  const [zoom, setZoom] = useState(100);

  const [state, setState] = useState<
    "idle" | "loading" | "done" | "error"
  >("idle");

  const [progress, setProgress] =
    useState<ProcessorProgress | null>(
      null
    );

  const [result, setResult] =
    useState<ProcessorResult | null>(
      null
    );

  const [error, setError] =
    useState("");

  useEffect(() => {
    if (tool?.slug) {
      addRecent(tool.slug);
    }

    previewFiles.forEach((item) => {
      URL.revokeObjectURL(item.url);
    });

    setValues({});
    setFile(null);
    setFiles([]);
    setProgress(null);
    setResult(null);
    setError("");
    setState("idle");

    setSelectedPages([]);
    setZoom(100);
  }, [tool.slug, addRecent]);

  const setField = (
    key: string,
    nextValue: string
  ) => {
    setValues((prev) => ({
      ...prev,
      [key]: nextValue,
    }));
  };

  const download = () => {
    if (!result?.file) return;

    const url = URL.createObjectURL(
      result.file.blob
    );

    const a =
      document.createElement("a");

    a.href = url;
    a.download = result.file.name;
    a.click();
    toast.success("Download started");

    URL.revokeObjectURL(url);
  };

  const onRun = async () => {
    try {
      if (
        ui.requiresFile &&
        !file &&
        files.length === 0
      ) {
        setError(
          "Please provide the required input."
        );

        return;
      }

      setState("loading");

      setError("");

      setProgress({
        stage: "validating",
        progress: 0,
      });

      const data = await runToolEngine(
        tool,
        {
          ...values,

          input:
            values.input ?? "",

          secondary:
            values.secondary ?? "",

          password:
            values.password ?? "",

          pages: selectedPages,

          zoom,

          file,

          files,

          fileName:
            values.fileName ?? "",
        },
        {
          onProgress: (p) =>
            setProgress(p),
        }
      );

        setResult(data);

        setState("done");

        toast.success("Processing complete");
    } catch (err) {
      setState("error");

      setProgress(null);

      const message =
        err instanceof Error
          ? err.message
          : "Something went wrong";

      setError(message);

      toast.error(message);
    }
  };

  const renderControl = (
    control: ToolControlConfig
  ) => {
    const commonProps = {
      value:
        values[control.key] ?? "",

      onChange: (value: string) =>
        setField(control.key, value),
    };

    if (control.kind === "textarea") {
      return (
        <div
          key={control.key}
          className="space-y-2"
        >
          <label className="text-sm font-medium text-slate-900 dark:text-slate-100">
            {control.label}
          </label>

          <Textarea
            value={commonProps.value}
            onChange={(e) =>
              commonProps.onChange(
                e.target.value
              )
            }
            placeholder={
              control.placeholder
            }
            rows={control.rows}
          />

          {control.helperText ? (
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {control.helperText}
            </p>
          ) : null}
        </div>
      );
    }

    if (control.kind === "select") {
      return (
        <div
          key={control.key}
          className="space-y-2"
        >
          <label className="text-sm font-medium text-slate-900 dark:text-slate-100">
            {control.label}
          </label>

          <select
            value={commonProps.value}
            onChange={(e) =>
              commonProps.onChange(
                e.target.value
              )
            }
            className="flex h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm shadow-soft outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring dark:border-slate-800 dark:bg-slate-950"
          >
            <option value="">
              Select an option
            </option>

            {control.options?.map(
              (option) => (
                <option
                  key={option.value}
                  value={option.value}
                >
                  {option.label}
                </option>
              )
            )}
          </select>

          {control.helperText ? (
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {control.helperText}
            </p>
          ) : null}
        </div>
      );
    }

    return (
      <div
        key={control.key}
        className="space-y-2"
      >
        <label className="text-sm font-medium text-slate-900 dark:text-slate-100">
          {control.label}
        </label>

        <Input
          type={
            control.type ?? "text"
          }
          value={commonProps.value}
          onChange={(e) =>
            commonProps.onChange(
              e.target.value
            )
          }
          placeholder={
            control.placeholder
          }
        />

        {control.helperText ? (
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {control.helperText}
          </p>
        ) : null}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <Card className="border border-slate-200/80 bg-white/90 shadow-soft backdrop-blur dark:border-slate-800 dark:bg-slate-950/80">
        <CardHeader className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <Badge className="bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
              {tool.processingType}
            </Badge>

            <Badge className="bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
              {tool.inputType} input
            </Badge>

            <Badge className="bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
              {tool.outputType} output
            </Badge>
          </div>

          <div className="space-y-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <Sparkles className="h-4 w-4" />
              Tool workspace
            </CardTitle>

            <p className="text-sm leading-6 text-slate-600 dark:text-slate-400">
              {ui.hint}
            </p>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {ui.requiresFile ? (
            <ToolUploadPanel
              title="Upload file"
              accept={ui.accepts}
              multiple={
                ui.multipleFiles
              }
              onFiles={(list) => {
                setFiles(list);

                if (list.length > 0) {
                  setFile(list[0]);
                } else {
                  setFile(null);
                }

                setResult(null);

                setError("");

                const mapped =
                  list.map(
                    (f, index) => ({
                      id: `${f.name}-${index}-${Date.now()}`,
                      file: f,
                      url:
                        URL.createObjectURL(
                          f
                        ),
                    })
                  );

                setPreviewFiles(
                  (prev) => {
                    prev.forEach(
                      (item) => {
                        URL.revokeObjectURL(
                          item.url
                        );
                      }
                    );

                    return mapped;
                  }
                );
              }}
            />
          ) : null}

          {previewFiles.length ? (
            <ToolPreviewWorkspace
              files={previewFiles}
              result={result}
              onRemove={(id) => {
                const next = previewFiles.filter(
                  (item) => item.id !== id
                );

                previewFiles.forEach((item) => {
                  if (item.id === id) {
                    URL.revokeObjectURL(item.url);
                  }
                });

                setPreviewFiles(next);
                setFiles(next.map((x) => x.file));
                setFile(next[0]?.file ?? null);
              }}
            />
          ) : null}

          {progress ? (
            <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 dark:border-slate-800 dark:bg-slate-950">
              <div className="min-w-28 text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
                {progress.stage}
              </div>

              <div className="progress-bar flex-1">
                <div
                  className="progress-fill"
                  style={{
                    width: `${Math.round(
                      progress.progress *
                        100
                    )}%`,
                  }}
                />
              </div>

              <div className="text-xs tabular-nums text-slate-600 dark:text-slate-300">
                {Math.round(
                  progress.progress *
                    100
                )}
                %
              </div>
            </div>
          ) : null}

          {files.length > 1 ? (
            <div className="rounded-3xl border border-slate-200/80 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/70">
              <div className="mb-3 text-sm font-semibold">
                Selected files
              </div>

              <div className="space-y-2">
                {files.map(
                  (f, index) => (
                    <div
                      key={`${f.name}-${index}`}
                      className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-950"
                    >
                      <div className="truncate text-sm">
                        {index + 1}.{" "}
                        {f.name}
                      </div>

                      <div className="text-xs text-slate-500">
                        {(
                          f.size /
                          1024 /
                          1024
                        ).toFixed(2)}{" "}
                        MB
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>
          ) : null}

          <div className="grid gap-4 md:grid-cols-2">
            {ui.controls.map(
              (control) =>
                renderControl(
                  control
                )
            )}
          </div>

          <div className="flex flex-col gap-3 pt-2 sm:flex-row">
            <Button
              onClick={onRun}
              disabled={
                state === "loading"
              }
              className="rounded-2xl"
            >
              {state ===
              "loading" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : null}

              {ui.submitLabel}
            </Button>

            {result?.file ? (
              <Button
                variant="outline"
                onClick={download}
                className="rounded-2xl"
              >
                <Save className="h-4 w-4" />
                Download result
              </Button>
            ) : null}
          </div>

        </CardContent>
      </Card>

      {state === "error" ? (
        <Card className="border-rose-200 bg-rose-50 dark:border-rose-900 dark:bg-rose-950/30">
          <CardContent className="py-4 text-sm text-rose-900 dark:text-rose-200">
            {error}
          </CardContent>
        </Card>
      ) : null}

      <ToolOutputPanel
        result={result}
        originalFile={file}
        zoom={zoom}
      />

      {!result ? (
        <Card className="border border-slate-200/80 bg-white/90 shadow-soft dark:border-slate-800 dark:bg-slate-950/80">
          <CardContent className="py-6 text-sm text-slate-600 dark:text-slate-400">
            Use the tool controls
            above to generate a
            result.
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}