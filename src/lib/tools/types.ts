export type CategorySlug =
  | "image"
  | "pdf"
  | "video-audio"
  | "social"
  | "dev"
  | "text"
  | "unit-money"
  | "file";

export type InputType = "text" | "file" | "number" | "mixed";
export type OutputType = "text" | "file" | "preview" | "result";
export type ProcessingType = "client" | "client-heavy" | "server" | "hybrid";

export type ToolFeatureFlag =
  | "ai-assisted"
  | "privacy-safe"
  | "premium"
  | "batch-ready"
  | "ocr"
  | "media"
  | "creator"
  | "seo";

export type ToolProcessorKey = string;
export type IconKey =
  | "image"
  | "pdf"
  | "video"
  | "social"
  | "dev"
  | "text"
  | "unit"
  | "file"
  | "spark"
  | "shield"
  | "search"
  | "grid";

export interface ToolSeed {
  slug: string;
  title: string;
  category: CategorySlug;
  shortDescription: string;
  processorKey: ToolProcessorKey;
  inputType: InputType;
  outputType: OutputType;
  processingType: ProcessingType;
  pro: boolean;
  featureFlags: ToolFeatureFlag[];
  featured?: boolean;
  icon?: IconKey;
}

export interface ToolFaqItem {
  question: string;
  answer: string;
}

export interface ToolHowToStep {
  title: string;
  description: string;
}

export interface ToolEntry extends ToolSeed {
  icon: IconKey;
  longDescription: string;
  seoTitle: string;
  seoDescription: string;
  keywords: string[];
  faq: ToolFaqItem[];
  howTo: ToolHowToStep[];
  related: string[];
  canonical: string;
}
