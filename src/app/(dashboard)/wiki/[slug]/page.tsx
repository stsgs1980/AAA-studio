import { notFound } from "next/navigation";
import { wikiNavItems } from "@/features/wiki/data/wiki-nav-data";
import { WikiContent } from "@/features/wiki/components/wiki-content";

interface WikiSlugPageProps {
  params: Promise<{ slug: string }>;
}

export default async function WikiSlugPage({ params }: WikiSlugPageProps) {
  const { slug } = await params;
  const valid = wikiNavItems.some((item) => item.id === slug);

  if (!valid) {
    notFound();
  }

  return <WikiContent slug={slug} />;
}
