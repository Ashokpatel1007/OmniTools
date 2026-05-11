import type { ProcessorArgs, ProcessorResult } from "./types";
import {
  extensionFromMime,
  fileNameWithoutExt,
  resultText,
  safeString,
  slugify,
} from "./shared";

export async function handleFileTool(
  key: string,
  args: ProcessorArgs,
): Promise<ProcessorResult> {
  const file = args.file;

  switch (key) {
    case "fileInfo": {
      if (!file) {
        return resultText("File Info", "No file selected.");
      }

      return resultText(
        "File Info",
        [
          `Name: ${file.name}`,
          `Type: ${file.type || "unknown"}`,
          `Size: ${(file.size / 1024 / 1024).toFixed(2)} MB`,
          `Extension: ${extensionFromMime(file.type)}`,
        ].join("\n"),
      );
    }

    case "fileRenamer": {
      if (!file) {
        return resultText("File Renamer", "No file selected.");
      }

      const base = safeString(args.name, fileNameWithoutExt(file.name));
      const ext = file.name.includes(".")
        ? file.name.slice(file.name.lastIndexOf("."))
        : "";

      return resultText(
        "File Renamer",
        `${base}${ext}`,
      );
    }

    case "folderOrganizer": {
      const files = args.files || [];

      const groups = files.reduce<Record<string, number>>((acc, current) => {
        const type = current.type.split("/")[0] || "other";
        acc[type] = (acc[type] || 0) + 1;
        return acc;
      }, {});

      return resultText(
        "Folder Organizer",
        Object.entries(groups)
          .map(([group, total]) => `${group}: ${total}`)
          .join("\n"),
      );
    }

    case "checksumTool": {
      if (!file) {
        return resultText("Checksum Tool", "No file selected.");
      }

      const buffer = await file.arrayBuffer();
      const bytes = new Uint8Array(buffer);

      let hash = 2166136261;

      for (let i = 0; i < bytes.length; i += 1) {
        hash ^= bytes[i];
        hash = Math.imul(hash, 16777619);
      }

      return resultText(
        "Checksum Tool",
        `FNV-1a: ${(hash >>> 0).toString(16)}`,
      );
    }

    case "duplicateFinder": {
      const files = args.files || [];

      const seen = new Set<string>();
      const duplicates: string[] = [];

      for (const current of files) {
        const keyValue = `${current.name}-${current.size}`;

        if (seen.has(keyValue)) {
          duplicates.push(current.name);
        } else {
          seen.add(keyValue);
        }
      }

      return resultText(
        "Duplicate Finder",
        duplicates.length
          ? duplicates.join("\n")
          : "No duplicates found.",
      );
    }

    case "pageCounter": {
      const files = args.files || [];

      return resultText(
        "Page Counter",
        `${files.length} file(s) loaded.`,
      );
    }

    case "filenameSlugifier": {
      if (!file) {
        return resultText("Filename Slugifier", "No file selected.");
      }

      const ext = file.name.includes(".")
        ? file.name.slice(file.name.lastIndexOf("."))
        : "";

      return resultText(
        "Filename Slugifier",
        `${slugify(fileNameWithoutExt(file.name))}${ext}`,
      );
    }

    default:
      return resultText("File Tool", "Ready.");
  }
}