"use client";

import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Newspaper } from "lucide-react";

import { Button } from "@/components/ui/button";
import { RuangInformasiForm } from "../ruang-informasi-form";

export default function TambahRuangInformasiPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

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
              <h1 className="text-2xl font-bold text-gray-900">Tambah Konten</h1>
              <p className="text-sm text-muted-foreground">
                Buat konten baru untuk ruang informasi
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Form Card */}
      <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
        <RuangInformasiForm
          data={null}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ["ruang-informasi"] });
            router.push("/master/ruang-informasi");
          }}
        />
      </div>
    </div>
  );
}
