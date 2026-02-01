"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { z } from "zod";
import { format } from "date-fns";

import api from "@/lib/api/axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

const startSessionSchema = z.object({
  preWeight: z.string().optional(),
  preSystolic: z.string().optional(),
  preDiastolic: z.string().optional(),
  prePulse: z.string().optional(),
  preTemperature: z.string().optional(),
  preComplaints: z.string().optional(),
  ufGoal: z.string().optional(),
  bloodFlow: z.string().optional(),
  dialysateFlow: z.string().optional(),
  duration: z.string().optional(),
  vascularAccess: z.string().optional(),
  dialyzerType: z.string().optional(),
  machineId: z.string().optional(),
  hdProtocolId: z.string().optional(),
});

type StartSessionFormData = z.infer<typeof startSessionSchema>;

type Schedule = {
  id: string;
  patientId: string;
  patientName: string;
  patientMrn: string;
  patientDryWeight: number | null;
  shiftName: string;
  scheduleDate: string;
  machineId?: string | null;
};

async function fetchMachines() {
  const { data } = await api.get("/api/master/machines?limit=100&status=available");
  return data;
}

async function fetchProtocols() {
  const { data } = await api.get("/api/master/protocols?limit=100");
  return data;
}

async function createSession(payload: Record<string, unknown>) {
  const { data } = await api.post("/api/hd-sessions", payload);
  return data;
}

export function StartSessionForm({
  schedule,
  onSuccess,
}: {
  schedule: Schedule;
  onSuccess: () => void;
}) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<StartSessionFormData>({
    resolver: zodResolver(startSessionSchema),
    defaultValues: {
      bloodFlow: "250",
      dialysateFlow: "500",
      duration: "240",
      vascularAccess: "avf",
    },
  });

  const { data: machinesData } = useQuery({
    queryKey: ["machines-available"],
    queryFn: fetchMachines,
  });

  const { data: protocolsData } = useQuery({
    queryKey: ["protocols-all"],
    queryFn: fetchProtocols,
  });

  const createMutation = useMutation({
    mutationFn: createSession,
    onSuccess: () => {
      toast.success("Sesi HD berhasil dimulai");
      onSuccess();
    },
    onError: (error: Error) => {
      toast.error(error.message || "Gagal memulai sesi HD");
    },
  });

  const onSubmit = (data: StartSessionFormData) => {
    const sessionData = {
      patientScheduleId: schedule.id,
      patientId: schedule.patientId,
      sessionDate: schedule.scheduleDate,
      startTime: new Date().toISOString(),
      preWeight: data.preWeight ? Math.round(parseFloat(data.preWeight) * 1000) : null,
      preSystolic: data.preSystolic ? parseInt(data.preSystolic) : null,
      preDiastolic: data.preDiastolic ? parseInt(data.preDiastolic) : null,
      prePulse: data.prePulse ? parseInt(data.prePulse) : null,
      preTemperature: data.preTemperature
        ? Math.round(parseFloat(data.preTemperature) * 10)
        : null,
      preComplaints: data.preComplaints || null,
      ufGoal: data.ufGoal ? Math.round(parseFloat(data.ufGoal) * 1000) : null,
      bloodFlow: data.bloodFlow ? parseInt(data.bloodFlow) : null,
      dialysateFlow: data.dialysateFlow ? parseInt(data.dialysateFlow) : null,
      duration: data.duration ? parseInt(data.duration) : null,
      vascularAccess: data.vascularAccess || null,
      dialyzerType: data.dialyzerType || null,
      machineId: data.machineId || schedule.machineId || null,
      hdProtocolId: data.hdProtocolId || null,
    };

    createMutation.mutate(sessionData);
  };

  const handleProtocolSelect = (protocolId: string) => {
    const protocol = protocolsData?.data?.find(
      (p: { id: string }) => p.id === protocolId
    );
    if (protocol) {
      setValue("hdProtocolId", protocolId);
      if (protocol.bloodFlowRate) setValue("bloodFlow", String(protocol.bloodFlowRate));
      if (protocol.dialysateFlowRate)
        setValue("dialysateFlow", String(protocol.dialysateFlowRate));
      if (protocol.duration) setValue("duration", String(protocol.duration));
      if (protocol.ufGoal) setValue("ufGoal", String(protocol.ufGoal / 1000));
      if (protocol.dialyzerType) setValue("dialyzerType", protocol.dialyzerType);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Patient Info */}
      <div className="bg-muted/50 p-4 rounded-lg">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">Pasien:</span>{" "}
            <span className="font-medium">{schedule.patientName}</span>
          </div>
          <div>
            <span className="text-muted-foreground">MRN:</span>{" "}
            <span className="font-medium">{schedule.patientMrn}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Shift:</span>{" "}
            <span className="font-medium">{schedule.shiftName}</span>
          </div>
          <div>
            <span className="text-muted-foreground">BB Kering:</span>{" "}
            <span className="font-medium">
              {schedule.patientDryWeight
                ? `${(schedule.patientDryWeight / 1000).toFixed(1)} kg`
                : "-"}
            </span>
          </div>
        </div>
      </div>

      <Separator />

      {/* Pre-HD Assessment */}
      <div className="space-y-4">
        <h3 className="font-semibold">Penilaian Pra-HD</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="preWeight">BB Pra-HD (kg)</Label>
            <Input
              id="preWeight"
              type="number"
              step="0.1"
              placeholder="Contoh: 65.5"
              {...register("preWeight")}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="preSystolic">TD Sistolik (mmHg)</Label>
            <Input
              id="preSystolic"
              type="number"
              placeholder="Contoh: 140"
              {...register("preSystolic")}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="preDiastolic">TD Diastolik (mmHg)</Label>
            <Input
              id="preDiastolic"
              type="number"
              placeholder="Contoh: 90"
              {...register("preDiastolic")}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="prePulse">Nadi (x/menit)</Label>
            <Input
              id="prePulse"
              type="number"
              placeholder="Contoh: 80"
              {...register("prePulse")}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="preTemperature">Suhu (°C)</Label>
            <Input
              id="preTemperature"
              type="number"
              step="0.1"
              placeholder="Contoh: 36.5"
              {...register("preTemperature")}
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="preComplaints">Keluhan</Label>
          <Textarea
            id="preComplaints"
            placeholder="Keluhan pasien sebelum HD..."
            {...register("preComplaints")}
          />
        </div>
      </div>

      <Separator />

      {/* HD Parameters */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="font-semibold">Parameter HD</h3>
          <div className="w-64">
            <Select onValueChange={handleProtocolSelect}>
              <SelectTrigger>
                <SelectValue placeholder="Load dari protokol..." />
              </SelectTrigger>
              <SelectContent>
                {protocolsData?.data?.map(
                  (protocol: { id: string; name: string }) => (
                    <SelectItem key={protocol.id} value={protocol.id}>
                      {protocol.name}
                    </SelectItem>
                  )
                )}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="ufGoal">Target UF (L)</Label>
            <Input
              id="ufGoal"
              type="number"
              step="0.1"
              placeholder="Contoh: 2.5"
              {...register("ufGoal")}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="bloodFlow">QB (ml/min)</Label>
            <Input
              id="bloodFlow"
              type="number"
              placeholder="Contoh: 250"
              {...register("bloodFlow")}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="dialysateFlow">QD (ml/min)</Label>
            <Input
              id="dialysateFlow"
              type="number"
              placeholder="Contoh: 500"
              {...register("dialysateFlow")}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="duration">Durasi (menit)</Label>
            <Input
              id="duration"
              type="number"
              placeholder="Contoh: 240"
              {...register("duration")}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="vascularAccess">Akses Vaskular</Label>
            <Select
              value={watch("vascularAccess")}
              onValueChange={(v) => setValue("vascularAccess", v)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Pilih akses..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="avf">AVF</SelectItem>
                <SelectItem value="avg">AVG</SelectItem>
                <SelectItem value="cvc">CVC</SelectItem>
                <SelectItem value="permcath">Permcath</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="dialyzerType">Dialyzer</Label>
            <Input
              id="dialyzerType"
              placeholder="Contoh: F6HPS"
              {...register("dialyzerType")}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="machineId">Mesin HD</Label>
            <Select
              value={watch("machineId") || ""}
              onValueChange={(v) => setValue("machineId", v)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Pilih mesin..." />
              </SelectTrigger>
              <SelectContent>
                {machinesData?.data?.map(
                  (machine: {
                    id: string;
                    brand: string;
                    serialNumber: string;
                  }) => (
                    <SelectItem key={machine.id} value={machine.id}>
                      {machine.brand} - {machine.serialNumber}
                    </SelectItem>
                  )
                )}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <Separator />

      <div className="flex justify-end gap-2">
        <Button type="submit" disabled={createMutation.isPending}>
          {createMutation.isPending ? "Memulai..." : "Mulai Sesi HD"}
        </Button>
      </div>
    </form>
  );
}
