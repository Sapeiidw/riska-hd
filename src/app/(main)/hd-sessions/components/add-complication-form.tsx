"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { z } from "zod";
import api from "@/lib/api/axios";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const addComplicationSchema = z.object({
  complicationId: z.string().min(1, "Komplikasi wajib dipilih"),
  action: z.string().optional(),
  notes: z.string().optional(),
});

type AddComplicationFormData = z.infer<typeof addComplicationSchema>;

async function fetchComplications() {
  const res = await api.get("/api/master/complications?limit=100");
  return res.data;
}

async function addComplication(sessionId: string, data: Record<string, unknown>) {
  const res = await api.post(`/api/hd-sessions/${sessionId}/complications`, data);
  return res.data;
}

export function AddComplicationForm({
  sessionId,
  onSuccess,
}: {
  sessionId: string;
  onSuccess: () => void;
}) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<AddComplicationFormData>({
    resolver: zodResolver(addComplicationSchema),
  });

  const { data: complicationsData } = useQuery({
    queryKey: ["complications-all"],
    queryFn: fetchComplications,
  });

  const addMutation = useMutation({
    mutationFn: (data: Record<string, unknown>) => addComplication(sessionId, data),
    onSuccess,
    onError: (error: Error) => {
      alert(error.message || "Gagal menambahkan komplikasi");
    },
  });

  const selectedComplicationId = watch("complicationId");
  const selectedComplication = complicationsData?.data?.find(
    (c: { id: string }) => c.id === selectedComplicationId
  );

  const onSubmit = (data: AddComplicationFormData) => {
    const complicationData = {
      complicationId: data.complicationId,
      occurredAt: new Date().toISOString(),
      action: data.action || null,
      notes: data.notes || null,
    };

    addMutation.mutate(complicationData);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="complicationId">Komplikasi *</Label>
        <Select
          value={watch("complicationId") || ""}
          onValueChange={(v) => setValue("complicationId", v)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Pilih komplikasi..." />
          </SelectTrigger>
          <SelectContent>
            {complicationsData?.data?.map(
              (comp: {
                id: string;
                name: string;
                code: string;
                category: string;
                severity: string;
              }) => (
                <SelectItem key={comp.id} value={comp.id}>
                  [{comp.code}] {comp.name} ({comp.severity})
                </SelectItem>
              )
            )}
          </SelectContent>
        </Select>
        {errors.complicationId && (
          <p className="text-sm text-destructive">{errors.complicationId.message}</p>
        )}
      </div>

      {selectedComplication?.suggestedAction && (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm">
          <p className="font-medium text-amber-800">Tindakan yang disarankan:</p>
          <p className="text-amber-700">{selectedComplication.suggestedAction}</p>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="action">Tindakan yang Dilakukan</Label>
        <Textarea
          id="action"
          placeholder="Tindakan yang dilakukan untuk mengatasi komplikasi..."
          {...register("action")}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Catatan Tambahan</Label>
        <Textarea
          id="notes"
          placeholder="Catatan tambahan..."
          {...register("notes")}
        />
      </div>

      <div className="flex justify-end gap-2">
        <Button type="submit" disabled={addMutation.isPending}>
          {addMutation.isPending ? "Menyimpan..." : "Simpan Komplikasi"}
        </Button>
      </div>
    </form>
  );
}
