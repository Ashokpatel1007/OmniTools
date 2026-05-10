import type { ToolEntry } from "@/lib/tools/types";
import type { ProcessorResult } from "./types";
import { runProcessorDispatch } from "./dispatcher";
import { getToolUiConfig } from "@/lib/tools/ui/tool-ui-config";

export type ProcessorProgress = {
  stage: "validating" | "preparing" | "processing" | "rendering-preview" | "finalizing" | "done" | "error";
  progress: number;
  message?: string;
};

export type ProcessorRunOptions = {
  onProgress?: (p: ProcessorProgress) => void;
};

export type ToolInputValidation = {
  ok: boolean;
  error?: string;
};

function validateRequired(tool: ToolEntry, args: any): ToolInputValidation {
  const ui = getToolUiConfig(tool);

  if (ui.requiresFile) {
    const hasSingleFile = !!args?.file;
    const hasManyFiles = Array.isArray(args?.files) && args.files.length > 0;
    if (!hasSingleFile && !hasManyFiles) {
      return { ok: false, error: "Please upload a file to continue." };
    }
  }

  if (ui.requiresText) {
    const hasText = typeof args?.input === "string" && args.input.trim().length > 0;
    const hasSecondary = typeof args?.secondary === "string" && args.secondary.trim().length > 0;
    if (!hasText && !hasSecondary) {
      return { ok: false, error: "Please provide the required input." };
    }
  }

  return { ok: true };
}

export async function runToolEngine(tool: ToolEntry, args: any, opts: ProcessorRunOptions = {}): Promise<ProcessorResult> {
  const { onProgress } = opts;

  try {
    onProgress?.({ stage: "validating", progress: 0.05, message: "Validating input" });
    const validation = validateRequired(tool, args);
    if (!validation.ok) throw new Error(validation.error || "Invalid input");

    onProgress?.({ stage: "preparing", progress: 0.15, message: "Preparing processing engine" });
    onProgress?.({ stage: "processing", progress: 0.45, message: "Running tool operation" });

    const result = await runProcessorDispatch(tool.processorKey, args);

    onProgress?.({ stage: "rendering-preview", progress: 0.75, message: "Preparing preview" });
    onProgress?.({ stage: "finalizing", progress: 0.92, message: "Finalizing output" });
    onProgress?.({ stage: "done", progress: 1, message: "Completed successfully" });

    return {
      ...result,
      stats: {
        ...(result.stats || {}),
        "Preview Ready": result.file || result.files ? "Yes" : "Text",
      },
    };
  } catch (error) {
    onProgress?.({ stage: "error", progress: 1, message: "Failed" });
    throw error;
  }
}
