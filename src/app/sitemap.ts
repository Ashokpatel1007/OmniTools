import { siteConfig } from "@/lib/site";
import { categorySeeds } from "@/lib/tools/categories";
import { tools } from "@/lib/tools/registry";

export default function sitemap() {
  const pages = [
    "",
    "/categories",
    "/search",
    "/favorites",
    "/recent",
    "/premium",
    "/donate",
    "/about",
    "/privacy",
    "/terms",
    "/contact",
  ].map((path) => ({
    url: `${siteConfig.url}${path}`,
    lastModified: new Date(),
  }));

  const categoryPages = categorySeeds.map((category) => ({
    url: `${siteConfig.url}/${category.slug}`,
    lastModified: new Date(),
  }));

  const toolPages = tools.map((tool) => ({
    url: `${siteConfig.url}/${tool.category}/${tool.slug}`,
    lastModified: new Date(),
  }));

  return [...pages, ...categoryPages, ...toolPages];
}
