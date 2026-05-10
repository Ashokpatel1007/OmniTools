import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ToolLayout } from "@/components/tool-layout";
import { getTool, tools } from "@/lib/tools/registry";
import type { CategorySlug } from "@/lib/tools/types";

export function generateStaticParams() {
  return tools.map((tool) => ({
    category: tool.category,
    tool: tool.slug,
  }));
}

type Props = {
  params: Promise<{
    category: CategorySlug;
    tool: string;
  }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category, tool: toolSlug } = await params;
  const tool = getTool(category, toolSlug);

  if (!tool) return {};

  return {
    title: tool.seoTitle,
    description: tool.seoDescription,
    alternates: { canonical: tool.canonical },
    openGraph: {
      title: tool.seoTitle,
      description: tool.seoDescription,
      url: tool.canonical,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: tool.seoTitle,
      description: tool.seoDescription,
    },
  };
}

export default async function ToolPage({ params }: Props) {
  const { category, tool: toolSlug } = await params;
  const tool = getTool(category, toolSlug);

  if (!tool) notFound();

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: tool.faq.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };

  const howToSchema = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: tool.title,
    description: tool.shortDescription,
    step: tool.howTo.map((step, index) => ({
      "@type": "HowToStep",
      position: index + 1,
      name: step.title,
      text: step.description,
    })),
  };

  const softwareSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: tool.title,
    applicationCategory: "UtilitiesApplication",
    operatingSystem: "Web",
    url: tool.canonical,
    description: tool.seoDescription,
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <ToolLayout tool={tool} />
    </>
  );
}