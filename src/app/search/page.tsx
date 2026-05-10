import type { Metadata } from "next";
import { SearchBar } from "@/components/search-bar";
import { PageHeader } from "@/components/page-header";
import { ToolCard } from "@/components/tool-card";
import { searchTools } from "@/lib/tools/registry";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "Search tools",
  description: "Search the full OmniTools catalog.",
  alternates: { canonical: `${siteConfig.url}/search` },
};

type Props = {
  searchParams: Promise<{ q?: string }>;
};

export default async function SearchPage({ searchParams }: Props) {
  const { q } = await searchParams;
  const query = q || "";
  const results = searchTools(query);

  return (
    <div className="container-shell space-y-8">
      <PageHeader
        eyebrow="Search"
        title="Search the full catalog"
        description="Find the right utility page with one focused query."
      />
      <div className="max-w-2xl">
        <SearchBar placeholder="Search tools, tasks, and keywords" />
      </div>
      <div className="space-y-4">
        <p className="text-sm text-slate-600 dark:text-slate-400">{results.length} result(s){query ? ` for “${query}”` : ""}</p>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {results.map((tool) => <ToolCard key={tool.slug} tool={tool} />)}
        </div>
      </div>
    </div>
  );
}
