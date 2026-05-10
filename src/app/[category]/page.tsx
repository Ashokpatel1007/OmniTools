import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SearchBar } from "@/components/search-bar";
import { PageHeader } from "@/components/page-header";
import { ToolCard } from "@/components/tool-card";
import { categorySeeds } from "@/lib/tools/categories";
import { getToolsByCategory } from "@/lib/tools/registry";
import type { CategorySlug } from "@/lib/tools/types";
import { siteConfig } from "@/lib/site";

export function generateStaticParams() {
  return categorySeeds.map((category) => ({ category: category.slug }));
}

type Props = {
  params: Promise<{
    category: CategorySlug;
  }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category: categorySlug } = await params;
  const category = categorySeeds.find((item) => item.slug === categorySlug);

  if (!category) return {};

  const url = `${siteConfig.url}/${categorySlug}`;

  return {
    title: `${category.title} — free online tools`,
    description: category.description,
    alternates: { canonical: url },
    openGraph: {
      title: category.title,
      description: category.description,
      url,
      images: [siteConfig.ogImage],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: category.title,
      description: category.description,
      images: [siteConfig.ogImage],
    },
  };
}

export default async function CategoryPage({ params }: Props) {
  const { category: categorySlug } = await params;
  const category = categorySeeds.find((item) => item.slug === categorySlug);

  if (!category) notFound();

  const tools = getToolsByCategory(categorySlug);

  return (
    <div className="container-shell space-y-8">
      <PageHeader
        eyebrow={category.title}
        title={category.title}
        description={category.description}
      />

      <div className="max-w-2xl">
        <SearchBar placeholder={`Search within ${category.title.toLowerCase()}`} />
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {tools.map((tool) => (
          <ToolCard key={tool.slug} tool={tool} />
        ))}
      </div>
    </div>
  );
}