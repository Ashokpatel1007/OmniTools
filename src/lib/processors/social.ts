import type { ProcessorArgs, ProcessorResult } from "./types";
import { n, safeString, titleCase, resultText } from "./shared";

export async function handleSocialTool(key: string, args: ProcessorArgs): Promise<ProcessorResult> {
  const input = safeString(args.input, "");
  const secondary = safeString(args.secondary, "");
  const tone = safeString(args.tone, "clear");
  const platform = safeString(args.platform, "social");
  const count = Math.max(1, n(args.count, 5));

  switch (key) {
    case "socialThumbnail":
      return resultText("Thumbnail Generator", `Headline: ${input || "Your title here"}\nSubhead: ${secondary || "Short supporting line"}\nPlatform: ${platform}`);
    case "socialCaption":
      return resultText("Caption Generator", Array.from({ length: count }, (_, i) => `${i + 1}. ${tone} caption idea for ${input || secondary || "your post"}`).join("\n"));
    case "socialHashtags":
      return resultText("Hashtag Generator", Array.from(new Set((input || secondary || "").toLowerCase().match(/[a-z0-9]+/g) || [])).slice(0, 12).map((tag) => `#${tag}`).join(" "));
    case "postPlanner":
      return resultText("Post Planner", Array.from({ length: count }, (_, i) => `Day ${i + 1}: ${tone} post about ${input || "your topic"}`).join("\n"));
    case "socialBio":
      return resultText("Bio Generator", `${tone} creator focused on ${input || "useful work"}.\n${secondary || ""}`.trim());
    case "socialFormat":
      return resultText("Social Post Formatter", `Platform: ${platform}\n\n${input.trim()}`);
    case "socialRatios":
      return resultText("Aspect Ratio Presets", ["1:1", "4:5", "9:16", "16:9", "3:2"].join("\n"));
    case "profileResize":
      return resultText("Profile Image Resizer", `Target size: ${safeString(args.size, "1080x1080")}`);
    case "socialSizeConvert":
      return resultText("Size Converter", `Source: ${safeString(args.from, "1:1")}\nTarget: ${safeString(args.to, "9:16")}`);
    case "contentIdeas":
      return resultText("Content Idea Generator", Array.from({ length: count }, (_, i) => `${i + 1}. ${tone} idea for ${input || "your niche"}`).join("\n"));
    case "titleGenerator":
      return resultText("Title Generator", Array.from({ length: count }, (_, i) => `${i + 1}. ${titleCase(input || "your topic")} ${i + 1}`).join("\n"));
    case "hookGenerator":
      return resultText("Hook Generator", Array.from({ length: count }, (_, i) => `${i + 1}. ${tone} hook about ${input || "your subject"}`).join("\n"));
    case "scriptHelper":
      return resultText("Script Helper", `Hook: ${input || "Start strong"}\nBody: ${secondary || "Add steps, proof, and value"}\nCTA: Keep it short and specific.`);
    default:
      return resultText("Social Tool", input);
  }
}