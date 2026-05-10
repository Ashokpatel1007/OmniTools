import type {
  ToolEntry,
  ProcessingType,
} from "@/lib/tools/types";

import type {
  ProcessorResult,
} from "./index";

import {
  runProcessorDispatch,
} from "./dispatcher";

import {
  getToolUiConfig,
} from "@/lib/tools/ui/tool-ui-config";

export type ProcessorProgress = {
  stage:
    | "validating"
    | "preparing"
    | "processing"
    | "rendering-preview"
    | "finalizing"
    | "done"
    | "error";

  progress: number;

  message?: string;
};

export type ProcessorRunOptions = {
  onProgress?: (
    p: ProcessorProgress
  ) => void;
};

export type ToolInputValidation = {
  ok: boolean;
  error?: string;
};

function validateRequired(
  tool: ToolEntry,
  args: any
): ToolInputValidation {
  const ui =
    getToolUiConfig(tool);

  if (ui.requiresFile) {
    const hasSingleFile =
      !!args?.file;

    const hasManyFiles =
      Array.isArray(args?.files) &&
      args.files.length > 0;

    if (
      !hasSingleFile &&
      !hasManyFiles
    ) {
      return {
        ok: false,
        error:
          "Please upload a file to continue.",
      };
    }
  }

  if (ui.requiresText) {
    const hasText =
      typeof args?.input ===
        "string" &&
      args.input.trim().length >
        0;

    const hasSecondary =
      typeof args?.secondary ===
        "string" &&
      args.secondary.trim()
        .length > 0;

    if (
      !hasText &&
      !hasSecondary &&
      !args?.fileName
    ) {
      return {
        ok: false,
        error:
          "Please provide the required input.",
      };
    }
  }

  /*
    PDF unlock validation
  */
  if (
    tool.processorKey ===
      "pdfUnlocker" &&
    !args?.password
  ) {
    return {
      ok: false,
      error:
        "Please enter the PDF password.",
    };
  }

  /*
    PDF merge validation
  */
  if (
    tool.processorKey ===
      "pdfMerger"
  ) {
    if (
      !Array.isArray(args?.files) ||
      args.files.length < 2
    ) {
      return {
        ok: false,
        error:
          "Please upload at least 2 PDF files to merge.",
      };
    }
  }

  /*
    filename tool
  */
  if (
    tool.processorKey ===
      "filenameSlugifier" &&
    !args?.fileName
  ) {
    return {
      ok: false,
      error:
        "Please enter a filename to slugify.",
    };
  }

  return {
    ok: true,
  };
}

export async function runToolEngine(
  tool: ToolEntry,
  args: any,
  opts: ProcessorRunOptions = {}
): Promise<ProcessorResult> {
  const { onProgress } =
    opts;

  try {
    /*
      VALIDATION
    */
    onProgress?.({
      stage: "validating",
      progress: 0.05,
      message:
        "Validating input",
    });

    const validation =
      validateRequired(
        tool,
        args
      );

    if (!validation.ok) {
      throw new Error(
        validation.error ||
          "Invalid input"
      );
    }

    /*
      PREPARATION
    */
    onProgress?.({
      stage: "preparing",
      progress: 0.15,
      message:
        "Preparing processing engine",
    });

    /*
      MAIN PROCESSING
    */
    onProgress?.({
      stage: "processing",
      progress: 0.45,
      message:
        "Running tool operation",
    });

    const result =
      await runProcessorDispatch(
        tool.processorKey,
        args
      );

    /*
      PREVIEW RENDERING
    */
    onProgress?.({
      stage:
        "rendering-preview",
      progress: 0.75,
      message:
        "Generating live preview",
    });

    /*
      FINALIZATION
    */
    onProgress?.({
      stage: "finalizing",
      progress: 0.92,
      message:
        "Finalizing output",
    });

    /*
      DONE
    */
    onProgress?.({
      stage: "done",
      progress: 1,
      message:
        "Completed successfully",
    });

    return {
      ...result,

      stats: {
        ...(result.stats || {}),

        "Preview Ready":
          "Yes",

        "Live Rendering":
          "Enabled",

        "Processing Engine":
          "Advanced",
      },
    };
  } catch (e) {
    onProgress?.({
      stage: "error",
      progress: 1,
      message:
        e instanceof Error
          ? e.message
          : "Something went wrong",
    });

    return {
      title:
        "Processing failed",

      error:
        e instanceof Error
          ? e.message
          : "Something went wrong",
    };
  }
}

export type ToolProcessingProfile =
  {
    processingType: ProcessingType;
  };

export function getToolProcessingProfile(
  tool: ToolEntry
): ToolProcessingProfile {
  return {
    processingType:
      tool.processingType,
  };
}