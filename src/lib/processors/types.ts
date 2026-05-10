export interface ProcessorArgs {
  file?: File;
  files?: File[];

  width?: number;
  height?: number;

  quality?: number;
  format?: string;

  degrees?: number;
  amount?: number;

  x?: number;
  y?: number;

  bitrate?: number;

  direction?: string;
  ratio?: string;

  input?: string;
  secondary?: string;

  fileName?: string;

  password?: string;

  startPage?: number;
  endPage?: number;

  pageRanges?: string;

  pages?: number[];
  pagesToRemove?: number[];

  insertAfterPage?: number;

  order?: number[];

  outputName?: string;

  [key: string]: unknown;
}

export interface ProcessorFileResult {
  name: string;
  blob: Blob;
  mime: string;
}

export interface ProcessorResult {
  title: string;

  description?: string;

  text?: string;

  stats?: Record<string, string | number>;

  file?: ProcessorFileResult;

  files?: ProcessorFileResult[];

  previewType?:
    | "image"
    | "pdf"
    | "audio"
    | "video"
    | "text"
    | "json";

  error?: string;

  metadata?: Record<string, unknown>;
}

export type ProcessorHandler = (args: ProcessorArgs) => Promise<ProcessorResult>;

