import { Metadata } from "next";
import { Suspense } from "react";
import { InformasiList } from "./informasi-list";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata: Metadata = {
  title: "Ruang Informasi - Artikel & Panduan Hemodialisis | RISKA HD",
  description:
    "Temukan artikel, panduan, dan informasi terbaru seputar hemodialisis. Edukasi kesehatan untuk pasien cuci darah dan keluarga.",
  keywords: [
    "hemodialisis",
    "cuci darah",
    "gagal ginjal",
    "edukasi pasien",
    "diet hemodialisis",
    "akses vaskular",
    "RISKA HD",
  ],
  openGraph: {
    title: "Ruang Informasi - Artikel & Panduan Hemodialisis",
    description:
      "Temukan artikel, panduan, dan informasi terbaru seputar hemodialisis untuk membantu perjalanan kesehatan Anda.",
    type: "website",
    siteName: "RISKA HD",
  },
  twitter: {
    card: "summary_large_image",
    title: "Ruang Informasi - RISKA HD",
    description: "Artikel dan panduan hemodialisis untuk pasien dan keluarga",
  },
  alternates: {
    canonical: "/informasi",
  },
};

function InformasiListSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <Skeleton className="h-9 w-64 mx-auto mb-2" />
        <Skeleton className="h-5 w-96 mx-auto" />
      </div>
      <div className="bg-white rounded-xl p-4 shadow-sm border mb-8">
        <div className="flex flex-col sm:flex-row gap-4">
          <Skeleton className="h-10 flex-1" />
          <Skeleton className="h-10 w-[180px]" />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-white rounded-xl overflow-hidden shadow-sm border">
            <Skeleton className="aspect-video" />
            <div className="p-4 space-y-3">
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function InformasiPage() {
  return (
    <Suspense fallback={<InformasiListSkeleton />}>
      <InformasiList />
    </Suspense>
  );
}
