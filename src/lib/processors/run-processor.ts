import type { ToolEntry } from "@/lib/tools/types";
import type { ProcessorArgs, ProcessorResult } from "./types";
import { processorRegistry } from "./processor-registry";
import { runProcessorDispatch } from "./dispatcher";

export async function runProcessor(tool: ToolEntry, args: ProcessorArgs): Promise<ProcessorResult> {
  const handler = processorRegistry[tool.processorKey];
  if (handler) return handler(args);

  // Backward compatibility fallback for keys not yet migrated into processorRegistry.
  return runProcessorDispatch(tool.processorKey, args);
}


