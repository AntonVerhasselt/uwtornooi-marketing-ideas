import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SeoDraftPage } from "@/components/SeoDraftPage";
import { getSeoContent } from "@/lib/seo-content";
import { getSeoPage, seoPages } from "@/lib/seo-pages";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return seoPages.map((page) => ({ slug: page.slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const meta = getSeoPage(slug);
  if (!meta) return {};
  return {
    title: meta.shortTitle,
    description: meta.metaDescription,
  };
}

export default async function SeoContentSlugPage({ params }: PageProps) {
  const { slug } = await params;
  const meta = getSeoPage(slug);
  const content = getSeoContent(slug);
  if (!meta || !content) notFound();

  return <SeoDraftPage meta={meta} content={content} />;
}
