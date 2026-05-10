
import { siteConfig } from "@/lib/site";
import { slugToLabel } from "@/lib/utils";
import { categorySeeds } from "./categories";
import { toolSeeds } from "./catalog-data";
import type { CategorySlug, ToolEntry, ToolFaqItem, ToolHowToStep, ToolSeed } from "./types";

const categoryMeta = Object.fromEntries(categorySeeds.map((item) => [item.slug, item]));

function makeLongDescription(tool: ToolSeed) {
  const category = categoryMeta[tool.category]?.title ?? slugToLabel(tool.category);
  const naturalPhrases = [
    "free online tool",
    "fast browser-based workflow",
    "privacy-safe experience",
    "clean interface",
    "instant results where possible",
  ];
  return `${tool.title} is a ${naturalPhrases.join(", ")} built for ${category.toLowerCase()}. It helps users complete a specific task quickly without extra noise.`;
}

function makeSeoTitle(tool: ToolSeed) {
  return `${tool.title} — free online ${slugToLabel(tool.category).toLowerCase()} tool | OmniTools`;
}

function makeSeoDescription(tool: ToolSeed) {
  return `${tool.shortDescription} Use this free online ${tool.title.toLowerCase()} for a fast, secure, privacy-safe workflow with a clean interface on desktop or mobile.`;
}

function makeKeywords(tool: ToolSeed) {
  const base = [
    tool.title.toLowerCase(),
    `${tool.title.toLowerCase()} online`,
    `free ${tool.title.toLowerCase()}`,
    `fast ${tool.title.toLowerCase()}`,
    `secure ${tool.title.toLowerCase()}`,
    `privacy-safe ${tool.title.toLowerCase()}`,
    `${slugToLabel(tool.category).toLowerCase()} tools`,
  ];
  if (tool.featureFlags.includes("ai-assisted")) base.push("assisted workflow");
  if (tool.featureFlags.includes("batch-ready")) base.push("batch workflow");
  return Array.from(new Set(base));
}

function makeFaq(tool: ToolSeed): ToolFaqItem[] {
  return [
    {
      question: `What does ${tool.title} do?`,
      answer: `${tool.title} helps you complete a focused ${slugToLabel(tool.category).toLowerCase()} task quickly in a clean browser workflow.`,
    },
    {
      question: `Is ${tool.title} free to use?`,
      answer: "Yes. Core actions are free and the workflow is designed to stay focused and privacy-friendly.",
    },
    {
      question: `Does OmniTools keep my files private?`,
      answer: "The UI is designed around privacy-safe, client-first processing wherever practical. Sensitive workflows can also be routed through your own Supabase-backed account rules.",
    },
  ];
}

function makeHowTo(tool: ToolSeed): ToolHowToStep[] {
  return [
    { title: "Add your input", description: `Paste text, upload files, or enter values depending on the tool.` },
    { title: "Adjust settings", description: `Pick the mode, format, or output options you need.` },
    { title: "Run the tool", description: `Process the content and preview the result instantly when supported.` },
    { title: "Export or download", description: "Save the result, copy it, or continue with a related tool." },
  ];
}

function relatedFor(index: number, items: ToolSeed[]) {
  const sameCategory = items.filter((t) => t.category === items[index].category);
  const others = sameCategory.filter((t) => t.slug !== items[index].slug);
  return others.slice(0, 4).map((t) => t.slug);
}

export const tools: ToolEntry[] = toolSeeds.map((tool, index, all) => ({
  ...tool,
  icon: tool.icon ?? "grid",
  longDescription: makeLongDescription(tool),
  seoTitle: makeSeoTitle(tool),
  seoDescription: makeSeoDescription(tool),
  keywords: makeKeywords(tool),
  faq: makeFaq(tool),
  howTo: makeHowTo(tool),
  related: relatedFor(index, all),
  canonical: `${siteConfig.url}/${tool.category}/${tool.slug}`,
}));

export const toolBySlug = new Map(tools.map((tool) => [tool.slug, tool]));

export const categoryStats = categorySeeds.map((category) => ({
  ...category,
  count: tools.filter((tool) => tool.category === category.slug).length,
}));

export const featuredTools = tools.filter((tool) => tool.featured);
export const popularTools = (() => {
  const grouped = categorySeeds.flatMap((category) =>
    tools.filter((tool) => tool.category === category.slug).slice(0, 2),
  );
  return grouped.slice(0, 18);
})();
export const premiumTools = tools.filter((tool) => tool.pro);

export function getToolsByCategory(category: CategorySlug) {
  return tools.filter((tool) => tool.category === category);
}

export function getTool(category: CategorySlug, slug: string) {
  return tools.find((tool) => tool.category === category && tool.slug === slug);
}

export function searchTools(query: string) {
  const q = query.trim().toLowerCase();
  if (!q) return tools;
  return tools.filter((tool) => {
    const haystack = [
      tool.title,
      tool.shortDescription,
      tool.longDescription,
      tool.category,
      tool.keywords.join(" "),
    ]
      .join(" ")
      .toLowerCase();
    return haystack.includes(q);
  });
}

export function relatedTools(tool: ToolEntry) {
  const categoryTools = getToolsByCategory(tool.category).filter((entry) => entry.slug !== tool.slug);

  const related = categoryTools.slice(0, 6);
  return related.length ? related : tools.filter((entry) => entry.slug !== tool.slug).slice(0, 6);
}
