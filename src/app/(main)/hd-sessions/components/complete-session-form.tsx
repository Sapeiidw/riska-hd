"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const completeSessionSchema = z.object({
  postWeight: z.string().min(1, "BB Pasca-HD wajib diisi"),
  postSystolic: z.string().optional(),
  postDiastolic: z.string().optional(),
  postPulse: z.string().optional(),
  actualUf: z.string().optional(),
  postNotes: z.string().optional(),
});

type CompleteSessionFormData = z.infer<typeof completeSessionSchema>;

async function completeSession(sessionId: string, data: Record<string, unknown>) {
  const res = await fetch(`/api/hd-sessions/${sessionId}/complete`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error?.message || "Failed to complete session");
  }
  return res.json();
}

export function CompleteSessionForm({
  sessionId,
  preWeight,
  ufGoal,
  onSuccess,
}: {
  sessionId: string;
  preWeight: number | null;
  ufGoal: number | null;
  onSuccess: () => void;
}) {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<CompleteSessionFormData>({
    resolver: zodResolver(completeSessionSchema),
  });

  const completeMutation = useMutation({
    mutationFn: (data: Record<string, unknown>) => completeSession(sessionId, data),
    onSuccess,
    onError: (error: Error) => {
      alert(error.message || "Gagal menyelesaikan sesi");
    },
  });

  const watchPostWeight = watch("postWeight");
  const postWeightNum = watchPostWeight ? parseFloat(watchPostWeight) * 1000 : null;
  const calculatedUf = preWeight && postWeightNum ? preWeight - postWeightNum : null;

  const onSubmit = (data: CompleteSessionFormData) => {
    const sessionData = {
      postWeight: Math.round(parseFloat(data.postWeight) * 1000),
      postSystolic: data.postSystolic ? parseInt(data.postSystolic) : null,
      postDiastolic: data.postDiastolic ? parseInt(data.postDiastolic) : null,
      postPulse: data.postPulse ? parseInt(data.postPulse) : null,
      actualUf: data.actualUf
        ? Math.round(parseFloat(data.actualUf) * 1000)
        : calculatedUf,
      postNotes: data.postNotes || null,
      endTime: new Date().toISOString(),
    };

    completeMutation.mutate(sessionData);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Weight comparison */}
      {preWeight && (
        <div className="p-3 bg-muted rounded-lg text-sm">
          <div className="flex justify-between">
            <span>BB Pra-HD:</span>
            <span className="font-medium">{(preWeight / 1000).toFixed(1)} kg</span>
          </div>
          {ufGoal && (
            <div className="flex justify-between">
              <span>Target UF:</span>
              <span className="font-medium">{(ufGoal / 1000).toFixed(1)} L</span>
            </div>
          )}
          {calculatedUf !== null && (
            <div className="flex justify-between text-green-600 font-medium mt-2 pt-2 border-t">
              <span>UF Terhitung:</span>
              <span>{(calculatedUf / 1000).toFixed(1)} L</span>
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="postWeight">BB Pasca-HD (kg) *</Label>
          <Input
            id="postWeight"
            type="number"
            step="0.1"
            placeholder="Contoh: 62.5"
            {...register("postWeight")}
          />
          {errors.postWeight && (
            <p className="text-sm text-destructive">{errors.postWeight.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="actualUf">UF Aktual (L)</Label>
          <Input
            id="actualUf"
            type="number"
            step="0.1"
            placeholder={calculatedUf !== null ? (calculatedUf / 1000).toFixed(1) : "Contoh: 2.5"}
            {...register("actualUf")}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="postSystolic">TD Sistolik (mmHg)</Label>
          <Input
            id="postSystolic"
            type="number"
            placeholder="Contoh: 130"
            {...register("postSystolic")}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="postDiastolic">TD Diastolik (mmHg)</Label>
          <Input
            id="postDiastolic"
            type="number"
            placeholder="Contoh: 80"
            {...register("postDiastolic")}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="postPulse">Nadi (x/menit)</Label>
          <Input
            id="postPulse"
            type="number"
            placeholder="Contoh: 78"
            {...register("postPulse")}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="postNotes">Catatan</Label>
        <Textarea
          id="postNotes"
          placeholder="Catatan akhir sesi..."
          {...register("postNotes")}
        />
      </div>

      <div className="flex justify-end gap-2">
        <Button type="submit" disabled={completeMutation.isPending}>
          {completeMutation.isPending ? "Menyimpan..." : "Selesaikan Sesi"}
        </Button>
      </div>
    </form>
  );
}
