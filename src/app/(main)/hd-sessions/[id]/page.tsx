"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, use } from "react";
import {
  Activity,
  ArrowLeft,
  CheckCircle2,
  Clock,
  Droplets,
  Heart,
  AlertTriangle,
  Pill,
  User,
  Thermometer,
  Scale,
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import Link from "next/link";
import { useRouter } from "next/navigation";
import api from "@/lib/api/axios";

import { PageHeader } from "@/components/shared";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { CompleteSessionForm } from "../components/complete-session-form";
import { AddComplicationForm } from "../components/add-complication-form";
import { AddMedicationForm } from "../components/add-medication-form";

async function fetchSession(id: string) {
  const res = await api.get(`/api/hd-sessions/${id}`);
  return res.data;
}

export default function HdSessionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const queryClient = useQueryClient();

  const [isCompleteOpen, setIsCompleteOpen] = useState(false);
  const [isComplicationOpen, setIsComplicationOpen] = useState(false);
  const [isMedicationOpen, setIsMedicationOpen] = useState(false);

  const { data, isLoading, error } = useQuery({
    queryKey: ["hd-session", id],
    queryFn: () => fetchSession(id),
    refetchInterval: 30000,
  });

  const session = data?.data;

  if (isLoading) {
    return (
      <div className="col-span-12 p-6 space-y-6">
        <div className="h-12 w-64 bg-muted animate-pulse rounded" />
        <div className="h-96 bg-muted animate-pulse rounded-lg" />
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="col-span-12 p-6">
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground">Sesi tidak ditemukan</p>
            <Button className="mt-4" asChild>
              <Link href="/hd-sessions">Kembali</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isInProgress = session.status === "in_progress";

  return (
    <>
      <div className="col-span-12 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/hd-sessions">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl font-bold">{session.patientName}</h1>
              <p className="text-muted-foreground">
                MRN: {session.patientMrn} • {format(new Date(session.sessionDate), "EEEE, dd MMMM yyyy", { locale: localeId })}
              </p>
            </div>
          </div>
          <Badge variant={isInProgress ? "warning" : "success"} className="text-base px-4 py-1">
            {isInProgress ? "Berlangsung" : "Selesai"}
          </Badge>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Pre-HD Assessment */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Penilaian Pra-HD
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Scale className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">BB Pra-HD</p>
                      <p className="font-semibold">
                        {session.preWeight ? `${(session.preWeight / 1000).toFixed(1)} kg` : "-"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-red-100 rounded-lg">
                      <Heart className="h-5 w-5 text-red-600" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Tekanan Darah</p>
                      <p className="font-semibold">
                        {session.preSystolic || "-"}/{session.preDiastolic || "-"} mmHg
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-pink-100 rounded-lg">
                      <Activity className="h-5 w-5 text-pink-600" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Nadi</p>
                      <p className="font-semibold">{session.prePulse || "-"} x/menit</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-orange-100 rounded-lg">
                      <Thermometer className="h-5 w-5 text-orange-600" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Suhu</p>
                      <p className="font-semibold">
                        {session.preTemperature ? `${(session.preTemperature / 10).toFixed(1)} °C` : "-"}
                      </p>
                    </div>
                  </div>
                </div>
                {session.preComplaints && (
                  <div className="mt-4 p-3 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">Keluhan:</p>
                    <p>{session.preComplaints}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* HD Parameters */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Droplets className="h-5 w-5" />
                  Parameter HD
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Target UF</p>
                    <p className="font-semibold text-lg">
                      {session.ufGoal ? `${(session.ufGoal / 1000).toFixed(1)} L` : "-"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">QB</p>
                    <p className="font-semibold text-lg">{session.bloodFlow || "-"} ml/min</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">QD</p>
                    <p className="font-semibold text-lg">{session.dialysateFlow || "-"} ml/min</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Durasi</p>
                    <p className="font-semibold text-lg">{session.duration || "-"} menit</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Akses</p>
                    <p className="font-semibold">{session.vascularAccess?.toUpperCase() || "-"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Dialyzer</p>
                    <p className="font-semibold">{session.dialyzerType || "-"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Mesin</p>
                    <p className="font-semibold">
                      {session.machineBrand ? `${session.machineBrand} ${session.machineSerial}` : "-"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Protokol</p>
                    <p className="font-semibold">{session.protocolName || "-"}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Post-HD Assessment (if completed) */}
            {session.status === "completed" && (
              <Card className="border-green-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-green-700">
                    <CheckCircle2 className="h-5 w-5" />
                    Penilaian Pasca-HD
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <Scale className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">BB Pasca-HD</p>
                        <p className="font-semibold">
                          {session.postWeight ? `${(session.postWeight / 1000).toFixed(1)} kg` : "-"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <Heart className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Tekanan Darah</p>
                        <p className="font-semibold">
                          {session.postSystolic || "-"}/{session.postDiastolic || "-"} mmHg
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <Droplets className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">UF Aktual</p>
                        <p className="font-semibold">
                          {session.actualUf ? `${(session.actualUf / 1000).toFixed(1)} L` : "-"}
                        </p>
                      </div>
                    </div>
                  </div>
                  {session.postNotes && (
                    <div className="mt-4 p-3 bg-muted rounded-lg">
                      <p className="text-sm text-muted-foreground">Catatan:</p>
                      <p>{session.postNotes}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Complications */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-amber-500" />
                    Komplikasi ({session.complications?.length || 0})
                  </CardTitle>
                </div>
                {isInProgress && (
                  <Button variant="outline" size="sm" onClick={() => setIsComplicationOpen(true)}>
                    Tambah
                  </Button>
                )}
              </CardHeader>
              <CardContent>
                {session.complications?.length > 0 ? (
                  <div className="space-y-3">
                    {session.complications.map((comp: {
                      id: string;
                      complicationName: string;
                      complicationSeverity: string;
                      occurredAt: string;
                      action: string | null;
                      notes: string | null;
                    }) => (
                      <div key={comp.id} className="p-3 border rounded-lg">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium">{comp.complicationName}</p>
                            <p className="text-sm text-muted-foreground">
                              {format(new Date(comp.occurredAt), "HH:mm")} •{" "}
                              <Badge variant={
                                comp.complicationSeverity === "severe" ? "destructive" :
                                comp.complicationSeverity === "moderate" ? "warning" : "secondary"
                              }>
                                {comp.complicationSeverity}
                              </Badge>
                            </p>
                          </div>
                        </div>
                        {comp.action && (
                          <p className="text-sm mt-2">
                            <span className="text-muted-foreground">Tindakan:</span> {comp.action}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-4">
                    Tidak ada komplikasi tercatat
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Medications */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Pill className="h-5 w-5 text-blue-500" />
                    Obat Diberikan ({session.medications?.length || 0})
                  </CardTitle>
                </div>
                {isInProgress && (
                  <Button variant="outline" size="sm" onClick={() => setIsMedicationOpen(true)}>
                    Tambah
                  </Button>
                )}
              </CardHeader>
              <CardContent>
                {session.medications?.length > 0 ? (
                  <div className="space-y-3">
                    {session.medications.map((med: {
                      id: string;
                      medicationName: string;
                      dosage: string;
                      route: string;
                      administeredAt: string;
                      notes: string | null;
                    }) => (
                      <div key={med.id} className="p-3 border rounded-lg">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium">{med.medicationName}</p>
                            <p className="text-sm text-muted-foreground">
                              {med.dosage} • {med.route} • {format(new Date(med.administeredAt), "HH:mm")}
                            </p>
                          </div>
                        </div>
                        {med.notes && (
                          <p className="text-sm mt-2 text-muted-foreground">{med.notes}</p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-4">
                    Tidak ada obat tercatat
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Session Info */}
            <Card>
              <CardHeader>
                <CardTitle>Info Sesi</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Shift</p>
                  <p className="font-medium">{session.shiftName}</p>
                  <p className="text-sm">{session.shiftStartTime} - {session.shiftEndTime}</p>
                </div>
                <Separator />
                <div>
                  <p className="text-sm text-muted-foreground">Ruangan</p>
                  <p className="font-medium">{session.roomName || "-"}</p>
                </div>
                <Separator />
                <div>
                  <p className="text-sm text-muted-foreground">Waktu Mulai</p>
                  <p className="font-medium">
                    {session.startTime ? format(new Date(session.startTime), "HH:mm") : "-"}
                  </p>
                </div>
                {session.endTime && (
                  <>
                    <Separator />
                    <div>
                      <p className="text-sm text-muted-foreground">Waktu Selesai</p>
                      <p className="font-medium">
                        {format(new Date(session.endTime), "HH:mm")}
                      </p>
                    </div>
                  </>
                )}
                <Separator />
                <div>
                  <p className="text-sm text-muted-foreground">BB Kering Pasien</p>
                  <p className="font-medium">
                    {session.patientDryWeight ? `${(session.patientDryWeight / 1000).toFixed(1)} kg` : "-"}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            {isInProgress && (
              <Card>
                <CardHeader>
                  <CardTitle>Aksi</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button
                    className="w-full"
                    variant="default"
                    onClick={() => setIsCompleteOpen(true)}
                  >
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Selesaikan Sesi
                  </Button>
                  <Button
                    className="w-full"
                    variant="outline"
                    onClick={() => setIsComplicationOpen(true)}
                  >
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    Catat Komplikasi
                  </Button>
                  <Button
                    className="w-full"
                    variant="outline"
                    onClick={() => setIsMedicationOpen(true)}
                  >
                    <Pill className="h-4 w-4 mr-2" />
                    Catat Obat
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Complete Session Dialog */}
      <Dialog open={isCompleteOpen} onOpenChange={setIsCompleteOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Selesaikan Sesi HD</DialogTitle>
          </DialogHeader>
          <CompleteSessionForm
            sessionId={id}
            preWeight={session.preWeight}
            ufGoal={session.ufGoal}
            onSuccess={() => {
              setIsCompleteOpen(false);
              queryClient.invalidateQueries({ queryKey: ["hd-session", id] });
              queryClient.invalidateQueries({ queryKey: ["hd-sessions-active"] });
              toast.success("Sesi HD berhasil diselesaikan");
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Add Complication Dialog */}
      <Dialog open={isComplicationOpen} onOpenChange={setIsComplicationOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Catat Komplikasi</DialogTitle>
          </DialogHeader>
          <AddComplicationForm
            sessionId={id}
            onSuccess={() => {
              setIsComplicationOpen(false);
              queryClient.invalidateQueries({ queryKey: ["hd-session", id] });
              toast.success("Komplikasi berhasil dicatat");
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Add Medication Dialog */}
      <Dialog open={isMedicationOpen} onOpenChange={setIsMedicationOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Catat Pemberian Obat</DialogTitle>
          </DialogHeader>
          <AddMedicationForm
            sessionId={id}
            onSuccess={() => {
              setIsMedicationOpen(false);
              queryClient.invalidateQueries({ queryKey: ["hd-session", id] });
              toast.success("Obat berhasil dicatat");
            }}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
