import type { ToolEntry } from "@/lib/tools/types";
import type { ProcessorResult } from "./types";
import { runProcessorDispatch } from "./dispatcher";

export type ProcessorProgress = {
  stage:
    | "validating"
    | "preparing"
    | "processing"
    | "finalizing"
    | "done"
    | "error";
  progress: number;
  message?: string;
};

export type ProcessorRunOptions = {
  onProgress?: (p: ProcessorProgress) => void;
};

function validateRequired(tool: ToolEntry, args: any): { ok: boolean; error?: string } {
  const inputType = tool.inputType;
  if (inputType === "file" || inputType === "mixed") {
    const hasSingleFile = !!args?.file;
    const hasManyFiles = Array.isArray(args?.files) && args.files.length > 0;
    const hasAny = hasSingleFile || hasManyFiles;
    if (!hasAny && tool.processorKey !== "filenameSlugifier") {
      if (!args?.fileName) return { ok: false, error: "Please upload a file to continue." };
    }
  }

  if (inputType === "text" && tool.processorKey !== "regexTester") {
    if (typeof args?.input !== "string" || args.input.trim().length === 0) {
      return { ok: false, error: "Please paste or enter the required input." };
    }
  }

  return { ok: true };
}

export async function runToolEngine2(
  tool: ToolEntry,
  args: any,
  opts: ProcessorRunOptions = {}
): Promise<ProcessorResult> {
  const { onProgress } = opts;

  onProgress?.({ stage: "validating", progress: 0.05, message: "Validating input" });
  const validation = validateRequired(tool, args);
  if (!validation.ok) throw new Error(validation.error || "Invalid input");

  onProgress?.({ stage: "preparing", progress: 0.15, message: "Preparing" });
  onProgress?.({ stage: "processing", progress: 0.35, message: "Processing" });

  const result = await runProcessorDispatch(tool.processorKey, args);

  onProgress?.({ stage: "finalizing", progress: 0.9, message: "Finalizing" });
  onProgress?.({ stage: "done", progress: 1 });

  return result;
}

