export type { ProcessorResult } from "./types";

// New single dispatcher entrypoint (registry-driven).
export { runProcessorDispatch as runProcessor } from "./dispatcher";

// Legacy helpers still re-exported so existing imports keep working.
export * from "./image-runner";
export * from "./pdf";



