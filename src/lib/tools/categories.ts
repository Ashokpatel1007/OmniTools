import type { CategorySlug } from "./types";

export interface CategoryEntry {
  slug: CategorySlug;
  title: string;
  description: string;
}

export const categorySeeds: CategoryEntry[] = [
  {
    slug: "image",
    title: "Image Tools",
    description: "Fast browser-based image utilities for everyday edits, conversions, and exports.",
  },
  {
    slug: "pdf",
    title: "PDF Tools",
    description: "High-trust PDF helpers for merging, splitting, editing, and converting files.",
  },
  {
    slug: "video-audio",
    title: "Video & Audio Tools",
    description: "Simple media tools for lightweight editing and conversions.",
  },
  {
    slug: "social",
    title: "Social & Creator Tools",
    description: "Utility content tools for creators, marketers, and social publishing.",
  },
  {
    slug: "dev",
    title: "Developer Tools",
    description: "Practical utilities for formatting, encoding, testing, and debugging.",
  },
  {
    slug: "text",
    title: "Text & Writing Tools",
    description: "Copy-friendly text helpers for writing, cleanup, and analysis.",
  },
  {
    slug: "unit-money",
    title: "Unit & Money Tools",
    description: "Converters and calculators for everyday work.",
  },
  {
    slug: "file",
    title: "File & Productivity Tools",
    description: "Organize, inspect, rename, and manage files with less friction.",
  },
];
