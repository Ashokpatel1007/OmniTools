import type { ProcessorArgs, ProcessorResult } from "./types";

export type ProcessorHandler = (args: ProcessorArgs) => Promise<ProcessorResult>;

export type ProcessorRegistry = Record<string, ProcessorHandler>;


