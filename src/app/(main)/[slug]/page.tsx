"use client";

import { OpdDashboard, useOpdBySlug } from "@/lib/opd";
import { useParams } from "next/navigation";
import { notFound } from "next/navigation";

export default function Page() {
  const params = useParams();
  const slug = params.slug as string;
  const { data: opd, isLoading, notFound: opdNotFound } = useOpdBySlug(slug);

  if (isLoading) {
    return (
      <div className="col-span-12 flex items-center justify-center h-64">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  if (opdNotFound || !opd) {
    notFound();
  }

  return <OpdDashboard opdId={opd.id} />;
}
