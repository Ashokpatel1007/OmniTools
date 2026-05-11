import type { ProcessorArgs, ProcessorResult } from "./types";
import {
  countCharacters,
  countWords,
  diffLines,
  extractKeywords,
  loremText,
  normalizeWhitespace,
  randomText,
  readingTime,
  resultText,
  safeString,
  slugify,
  summarizeText,
  titleCase,
  n,
} from "./shared";

export async function handleTextTool(key: string, args: ProcessorArgs): Promise<ProcessorResult> {
  const input = normalizeWhitespace(safeString(args.input, ""));
  const secondary = safeString(args.secondary, "");
  const slug = safeString(args.toolSlug || args.slug || args.fileName || args.title, "").toLowerCase();

  switch (key) {
    case "textStats": {
      if (slug.includes("character")) {
        return resultText("Character Counter", `${countCharacters(safeString(args.input, ""))} characters`);
      }
      const words = countWords(safeString(args.input, ""));
      return resultText("Word Counter", `${words} words`);
    }

    case "caseConverter": {
      const mode = safeString(args.mode, "title");
      const source = safeString(args.input, "");
      const value =
        mode === "upper"
          ? source.toUpperCase()
          : mode === "lower"
            ? source.toLowerCase()
            : mode === "sentence"
              ? source.charAt(0).toUpperCase() + source.slice(1).toLowerCase()
              : mode === "camel"
                ? source
                    .toLowerCase()
                    .split(/\s+/)
                    .map((part, index) => (index === 0 ? part : part.charAt(0).toUpperCase() + part.slice(1)))
                    .join("")
                : mode === "pascal"
                  ? source
                      .toLowerCase()
                      .split(/\s+/)
                      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
                      .join("")
                  : mode === "snake"
                    ? slugify(source).replace(/-/g, "_")
                    : mode === "kebab"
                      ? slugify(source)
                      : titleCase(source);
      return resultText("Case Converter", value);
    }

    case "loremGenerator":
      return resultText("Lorem Ipsum Generator", loremText(Math.max(1, n(args.paragraphs, 2))));

    case "lineSorter":
      return resultText(
        "Line Sorter",
        safeString(args.input, "")
          .split(/\r?\n/)
          .map((line) => line.trim())
          .filter(Boolean)
          .sort((a, b) => a.localeCompare(b))
          .join("\n")
      );

    case "duplicateLines": {
      const seen = new Set<string>();
      const lines = safeString(args.input, "")
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter(Boolean);

      const output = lines.filter((line) => {
        const key = line.toLowerCase();
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });

      return resultText("Duplicate Line Remover", output.join("\n"));
    }

    case "sentenceSplitter":
      return resultText(
        "Sentence Splitter",
        safeString(args.input, "")
          .match(/[^.!?]+[.!?]*/g)
          ?.map((s) => s.trim())
          .filter(Boolean)
          .join("\n") || ""
      );

    case "paragraphRewriter":
      return resultText(
        "Paragraph Rewriter",
        safeString(args.input, "")
          .split(/\n{2,}/)
          .map((part) => normalizeWhitespace(part))
          .filter(Boolean)
          .join("\n\n")
      );

    case "readingTime": {
      const stats = readingTime(safeString(args.input, ""));
      return resultText("Reading Time", `${stats.words} words\n~${stats.minutes} min read`);
    }

    case "textCleaner":
      return resultText("Text Cleaner", normalizeWhitespace(safeString(args.input, "")).replace(/\s*\n\s*/g, "\n"));

    case "slugGenerator":
      return resultText("Slug Generator", slugify(safeString(args.input, "")));

    case "titleCase":
      return resultText("Title Case", titleCase(safeString(args.input, "")));

    case "textCompare":
      return resultText("Text Compare", diffLines(safeString(args.input, ""), secondary));

    case "randomText":
      return resultText("Random Text Generator", randomText(Math.max(6, n(args.words, 24))));

    case "summarizerAssist":
      return resultText("Summarizer Helper", summarizeText(safeString(args.input, "")));

    case "keywordExtractor":
      return resultText("Keyword Extractor", extractKeywords(safeString(args.input, "")));

    default:
      return resultText("Text Tool", safeString(args.input, ""));
  }
}