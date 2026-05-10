"use client";

import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";
import { ToolCard } from "@/components/tool-card";
import { useRecentTools } from "@/hooks/use-recent-tools";
import { toolBySlug } from "@/lib/tools/registry";

export default function RecentPage() {
  const { recent } = useRecentTools();
  const items = recent.map((slug) => toolBySlug.get(slug)).filter(Boolean);

  return (
    <div className="container-shell space-y-8">
      <PageHeader eyebrow="Recent" title="Recently used tools" description="Your last used tools appear here." />
      {items.length ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {items.map((tool) => tool ? <ToolCard key={tool.slug} tool={tool} /> : null)}
        </div>
      ) : (
        <EmptyState title="Nothing recent yet" description="Open a tool page to start building your history." />
      )}
    </div>
  );
}
