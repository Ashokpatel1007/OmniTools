import {
  Code2,
  FileText,
  Folder,
  Image as ImageIcon,
  LayoutGrid,
  Megaphone,
  Search,
  Shield,
  Sparkles,
  Scale,
  Text,
  Video,
} from "lucide-react";
import type { IconKey } from "./tools/types";

export function toolIcon(key: IconKey) {
  const map = {
    image: ImageIcon,
    pdf: FileText,
    video: Video,
    social: Megaphone,
    dev: Code2,
    text: Text,
    unit: Scale,
    file: Folder,
    spark: Sparkles,
    shield: Shield,
    search: Search,
    grid: LayoutGrid,
  } as const;
  return map[key] ?? Sparkles;
}

export function categoryIcon(key: string) {
  switch (key) {
    case "image":
      return ImageIcon;
    case "pdf":
      return FileText;
    case "video-audio":
      return Video;
    case "social":
      return Megaphone;
    case "dev":
      return Code2;
    case "text":
      return Text;
    case "unit-money":
      return Scale;
    case "file":
      return Folder;
    default:
      return Sparkles;
  }
}
