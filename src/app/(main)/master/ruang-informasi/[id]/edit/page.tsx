"use client";

import { useRouter, useParams } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Newspaper, Loader2 } from "lucide-react";
import api from "@/lib/api/axios";

import { Button } from "@/components/ui/button";
import { RuangInformasiForm } from "../../ruang-informasi-form";

export default function EditRuangInformasiPage() {
  const router = useRouter();
  const params = useParams();
  const queryClient = useQueryClient();
  const id = params.id as string;

  const { data, isLoading, error } = useQuery({
    queryKey: ["ruang-informasi", id],
    queryFn: async () => {
      const res = await api.get(`/api/master/ruang-informasi/${id}`);
      return res.data;
    },
  });

  if (isLoading) {
    return (
      <div className="col-span-12 flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !data?.data) {
    return (
      <div className="col-span-12 space-y-6">
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.back()}
              className="shrink-0"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Konten tidak ditemukan</h1>
              <p className="text-sm text-muted-foreground">
                Konten yang Anda cari tidak ada atau telah dihapus
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="col-span-12 space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            className="shrink-0"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-sky-400 to-cyan-500 text-white shadow-lg shadow-sky-500/30">
              <Newspaper className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Edit Konten</h1>
              <p className="text-sm text-muted-foreground">
                {data.data.title}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Form Card */}
      <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
        <RuangInformasiForm
          data={data.data}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ["ruang-informasi"] });
            router.push("/master/ruang-informasi");
          }}
        />
      </div>
    </div>
  );
}
