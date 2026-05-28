"use client";

import { useRouter, useParams } from "next/navigation";
import { WikiNavSidebar } from "@/features/wiki/components/wiki-nav-sidebar";

export default function WikiLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const params = useParams();
  const activeSlug = (params.slug as string) ?? "overview";

  return (
    <div className="flex h-full">
      <WikiNavSidebar
        activePage={activeSlug}
        onPageSelect={(id) => router.push(`/wiki/${id}`)}
      />
      <div className="min-w-0 flex-1 overflow-y-auto">
        {children}
      </div>
    </div>
  );
}
