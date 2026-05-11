import type { ProcessorArgs, ProcessorResult } from "./types";
import {
  base64Decode,
  base64Encode,
  decodeUrl,
  encodeUrl,
  safeString,
  resultText,
  simpleMarkdownToHtml,
  n,
  clamp,
  parseColor,
  rgbToHsl,
} from "./shared";

function parseJsonSafely(input: string) {
  return JSON.parse(input);
}

export async function handleDevTool(key: string, args: ProcessorArgs): Promise<ProcessorResult> {
  const input = safeString(args.input, "");
  const secondary = safeString(args.secondary, "");
  const slug = safeString(args.toolSlug || args.slug || args.fileName || args.title, "").toLowerCase();

  switch (key) {
    case "jsonFormat": {
      const value = JSON.stringify(parseJsonSafely(input), null, 2);
      return resultText("JSON Formatter", value);
    }

    case "jsonMinify":
      return resultText("JSON Minifier", JSON.stringify(parseJsonSafely(input)));

    case "base64Codec":
      return resultText(
        "Base64 Codec",
        safeString(args.mode, "encode") === "decode" ? base64Decode(input) : base64Encode(input)
      );

    case "jwtDecode": {
      const token = input.trim();
      const [head, body, sig] = token.split(".");
      const decode = (part?: string) =>
        part ? JSON.parse(base64Decode(part.replace(/-/g, "+").replace(/_/g, "/"))) : null;

      return resultText(
        "JWT Decoder",
        JSON.stringify(
          {
            header: decode(head),
            payload: decode(body),
            signature: sig || "",
          },
          null,
          2
        )
      );
    }

    case "sqlFormat":
      return resultText(
        "SQL Formatter",
        input
          .replace(/\s+/g, " ")
          .replace(/\b(select|from|where|group by|order by|limit|insert into|values|update|set|delete from)\b/gi, "\n$1")
      );

    case "htmlMinify":
      return resultText("HTML Minifier", input.replace(/>\s+</g, "><").replace(/\s{2,}/g, " ").trim());

    case "cssMinify":
      return resultText(
        "CSS Minifier",
        input.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\s{2,}/g, " ").replace(/\s*([{}:;,])\s*/g, "$1").trim()
      );

    case "jsMinify":
      return resultText(
        "JS Minifier",
        input.replace(/\/\/.*$/gm, "").replace(/\/\*[\s\S]*?\*\//g, "").replace(/\s{2,}/g, " ").trim()
      );

    case "urlCodec":
      return resultText(
        "URL Codec",
        safeString(args.mode, "encode") === "decode" ? decodeUrl(input) : encodeUrl(input)
      );

    case "regexTester": {
      const pattern = safeString(args.pattern || args.secondary || input, input);
      const flags = safeString(args.flags, "g");
      const regex = new RegExp(pattern, flags.includes("g") ? flags : `${flags}g`);
      const matches = Array.from(safeString(args.input || "", "").matchAll(regex)).map((match) => match[0]);
      return resultText("Regex Tester", matches.length ? matches.join("\n") : "No matches");
    }

    case "uuidGenerator":
      return resultText(
        "UUID Generator",
        Array.from({ length: Math.max(1, n(args.count, 1)) }, () =>
          crypto?.randomUUID?.() || `uuid-${Date.now()}-${Math.random().toString(16).slice(2)}`
        ).join("\n")
      );

    case "hashGenerator": {
      const text = input || secondary;
      let hash = 2166136261;
      for (let i = 0; i < text.length; i += 1) {
        hash ^= text.charCodeAt(i);
        hash = Math.imul(hash, 16777619);
      }
      return resultText("Hash Generator", `hash_${(hash >>> 0).toString(16)}`);
    }

    case "timestampConverter": {
      const value = input.trim();
      const parsed = Number(value);
      const date = Number.isFinite(parsed) ? new Date(parsed < 1e12 ? parsed * 1000 : parsed) : new Date(value);
      return resultText("Timestamp Converter", [date.toISOString(), date.toLocaleString(), String(date.getTime())].join("\n"));
    }

    case "cronGenerator": {
      const schedule = safeString(args.schedule, "daily");
      const cron =
        schedule === "weekly"
          ? "0 9 * * 1"
          : schedule === "monthly"
            ? "0 9 1 * *"
            : schedule === "hourly"
              ? "0 * * * *"
              : "0 9 * * *";
      return resultText("Cron Generator", cron);
    }

    case "diffChecker": {
      const left = input;
      const right = secondary;
      const a = left.split(/\r?\n/);
      const b = right.split(/\r?\n/);
      const max = Math.max(a.length, b.length);
      const lines: string[] = [];
      for (let i = 0; i < max; i += 1) {
        const leftLine = a[i] ?? "";
        const rightLine = b[i] ?? "";
        if (leftLine === rightLine) {
          lines.push(`  ${leftLine}`);
        } else {
          if (leftLine) lines.push(`- ${leftLine}`);
          if (rightLine) lines.push(`+ ${rightLine}`);
        }
      }
      return resultText("Diff Checker", lines.join("\n"));
    }

    case "colorConverter": {
      const value = input || secondary;
      const color = parseColor(value);
      if (!color) return resultText("Color Converter", "Enter a hex or RGB color first.");
      const hsl = rgbToHsl(color.r, color.g, color.b);
      return resultText("Color Converter", `HEX ${color.hex}\nRGB ${color.r}, ${color.g}, ${color.b}\nHSL ${hsl.h}, ${hsl.s}%, ${hsl.l}%`);
    }

    case "markdownPreview": {
      const html = simpleMarkdownToHtml(input);
      return {
        title: "Markdown Preview",
        file: {
          name: "preview.html",
          blob: new Blob([html], { type: "text/html" }),
          mime: "text/html",
        },
        previewType: "text",
      };
    }

    case "yamlFormat":
      return resultText(
        "YAML Formatter",
        safeString(args.mode, "pretty") === "minify"
          ? input.replace(/\n+/g, "\n").trim()
          : input.split(/\r?\n/).map((line) => line.replace(/\t/g, "  ")).join("\n").trim()
      );

    case "xmlFormat":
      return resultText("XML Formatter", input.replace(/></g, ">\n<").replace(/\s{2,}/g, " ").trim());

    case "escapeUnescape":
      return resultText(
        "Escape / Unescape Tool",
        safeString(args.mode, "escape") === "unescape" ? decodeURIComponent(input) : encodeURIComponent(input)
      );

    case "codeSnippetFormatter":
      return resultText("Code Snippet Formatter", `\`\`\`${safeString(args.language, "txt")}\n${input.trim()}\n\`\`\``);

    case "apiRequestBuilder": {
      const url = safeString(args.url || secondary, "");
      const method = safeString(args.method, "GET").toUpperCase();
      const body = input.trim();
      const headers = safeString(args.headers, "").trim();
      return resultText(
        "API Request Builder",
        [
          `fetch(${JSON.stringify(url)}, {`,
          `  method: ${JSON.stringify(method)},`,
          headers ? `  headers: ${headers},` : "",
          body ? `  body: ${JSON.stringify(body)},` : "",
          `});`,
        ]
          .filter(Boolean)
          .join("\n")
      );
    }

    default:
      return resultText("Dev Tool", slug || input);
  }
}