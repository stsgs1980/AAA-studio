"use client";

import { Suspense } from "react";
import { getWikiPage } from "../data/page-registry";
import { PageSkeleton } from "@/components/ui/page-skeleton";

interface WikiContentProps {
  slug: string;
}

export function WikiContent({ slug }: WikiContentProps) {
  const Page = getWikiPage(slug);

  if (!Page) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
        <p className="text-lg font-medium text-foreground">Page not found</p>
        <p className="text-sm text-muted-foreground">
          The wiki page &quot;{slug}&quot; does not exist.
        </p>
      </div>
    );
  }

  return (
    <Suspense fallback={<PageSkeleton rows={8} />}>
      <div className="mx-auto max-w-3xl p-6">
        <Page />
      </div>
    </Suspense>
  );
}
