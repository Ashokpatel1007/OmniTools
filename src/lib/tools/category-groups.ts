import { toolSeeds } from "./catalog-data";
import type { CategorySlug } from "./types";

export type CategoryToolGroup = {
  title: string;
  description: string;
  slugs: string[];
};

type GroupDefinition = {
  title: string;
  description: string;
  match: (title: string, processorKey: string, slug: string) => boolean;
};

const definitions: Record<CategorySlug, GroupDefinition[]> = {
  image: [
    {
      title: "Core edits",
      description: "Resize, crop, rotate, flip, and optimize images fast.",
      match: (title) => /resize|crop|rotate|flip|compress|convert|blur|sharpen|aspect ratio/i.test(title),
    },
    {
      title: "AI cleanup",
      description: "Background, object, face, and transparent pixel workflows.",
      match: (title) => /background remover|face blur|object removal|transparent png|passport photo|profile picture|screenshot to text|metadata/i.test(title),
    },
    {
      title: "Creator graphics",
      description: "Meme, thumbnail, sticker, and social-ready image helpers.",
      match: (title) => /meme|thumbnail|sticker|photo editor|avatar|color picker/i.test(title),
    },
    {
      title: "Conversions",
      description: "Turn images into PDFs or export PDFs back to images.",
      match: (title) => /image to pdf|pdf to image/i.test(title),
    },
  ],
  pdf: [
    {
      title: "Edit & organize",
      description: "Merge, split, reorder, rotate, and stamp PDFs.",
      match: (title) => /merge|split|rotate|remove pages|reorder|page numbers|watermark|annotator|signer/i.test(title),
    },
    {
      title: "Protect & optimize",
      description: "Lock, unlock, compress, and inspect document files.",
      match: (title) => /compress|protect|unlock|metadata|reader|ocr/i.test(title),
    },
    {
      title: "Format conversions",
      description: "Move between image, office, and PDF formats.",
      match: (title) => /to pdf|pdf to|image to pdf|doc to pdf|sheet to pdf/i.test(title),
    },
  ],
  "video-audio": [
    {
      title: "Video edits",
      description: "Trim, merge, compress, reverse, and speed up clips.",
      match: (title) => /video.*trim|video.*merge|video.*compress|playback speed|reverse video|mute video|frame grabber|video to gif/i.test(title),
    },
    {
      title: "Audio tools",
      description: "Convert, compress, cut, normalize, and merge audio.",
      match: (title) => /audio|video to mp3|normalize|subtitle/i.test(title),
    },
    {
      title: "Creator exports",
      description: "GIFs, subtitles, and social video helpers.",
      match: (title) => /gif maker|subtitle|frame grabber/i.test(title),
    },
  ],
  social: [
    {
      title: "Content generation",
      description: "Captions, bios, hooks, titles, and post ideas.",
      match: (title) => /caption|bio|hook|title|content idea|script|post planner/i.test(title),
    },
    {
      title: "Design sizes",
      description: "Resize and adapt visuals for platform ratios.",
      match: (title) => /ratio|size|thumbnail|profile image|story|reel|aspect ratio/i.test(title),
    },
    {
      title: "Publishing helpers",
      description: "Plan and format social content for publishing.",
      match: (title) => /scheduler|formatter|hashtags/i.test(title),
    },
  ],
  dev: [
    {
      title: "Formatters",
      description: "JSON, SQL, HTML, CSS, JS, YAML, and XML cleanup.",
      match: (title) => /json|sql|html|minifier|css|minifier|js|minifier|yaml|xml|markdown/i.test(title),
    },
    {
      title: "Encoders & inspectors",
      description: "Base64, JWT, URL, color, regex, and checksum helpers.",
      match: (title) => /base64|jwt|url|regex|color|checksum|hash|uuid|timestamp/i.test(title),
    },
    {
      title: "Generators",
      description: "Cron, API, code snippets, and utility generators.",
      match: (title) => /cron|api request|code snippet|generator|request builder/i.test(title),
    },
    {
      title: "Compare & analyze",
      description: "Diffs, logs, and content analysis helpers.",
      match: (title) => /diff|compare/i.test(title),
    },
  ],
  text: [
    {
      title: "Transform",
      description: "Clean, rewrite, reformat, and normalize text.",
      match: (title) => /case|cleaner|slug|title case|paragraph|sentence|duplicate|sort/i.test(title),
    },
    {
      title: "Analyze",
      description: "Counts, reading time, keywords, and comparisons.",
      match: (title) => /word counter|character counter|reading time|text stats|keyword|compare/i.test(title),
    },
    {
      title: "Generate",
      description: "Lorem, random text, summaries, rewrites, and translation.",
      match: (title) => /lorem|random|summarizer|translator|rewriter/i.test(title),
    },
  ],
  "unit-money": [
    {
      title: "Converters",
      description: "Length, weight, temperature, speed, area, and currency.",
      match: (title) => /converter/i.test(title),
    },
    {
      title: "Calculators",
      description: "Percent, BMI, tip, loan, tax, discount, math, and dates.",
      match: (title) => /calculator|age/i.test(title),
    },
  ],
  file: [
    {
      title: "Organize",
      description: "Rename, slugify, folderize, split, and combine files.",
      match: (title) => /rename|slugifier|organizer|split|combine|archive/i.test(title),
    },
    {
      title: "Inspect",
      description: "Checksums, duplicates, page counts, and file information.",
      match: (title) => /checksum|duplicate|info|page counter/i.test(title),
    },
    {
      title: "Convert",
      description: "Move between document and export formats.",
      match: (title) => /converter|document/i.test(title),
    },
  ],
};

export function getCategoryGroups(category: CategorySlug): CategoryToolGroup[] {
  const defs = definitions[category];
  const items = toolSeeds.filter((tool) => tool.category === category);

  return defs
    .map((definition) => ({
      title: definition.title,
      description: definition.description,
      slugs: items
        .filter((tool) => definition.match(tool.title, tool.processorKey, tool.slug))
        .map((tool) => tool.slug),
    }))
    .filter((group) => group.slugs.length > 0);
}

export function getCategoryToolSlugs(category: CategorySlug) {
  return toolSeeds.filter((tool) => tool.category === category).map((tool) => tool.slug);
}
