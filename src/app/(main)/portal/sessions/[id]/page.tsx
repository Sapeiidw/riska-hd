"use client";

import { useQuery } from "@tanstack/react-query";
import { use } from "react";
import {
  Activity,
  AlertTriangle,
  ArrowLeft,
  Calendar,
  Clock,
  Droplets,
  Heart,
  Pill,
  Scale,
  Thermometer,
  User,
  Zap,
} from "lucide-react";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import Link from "next/link";
import api from "@/lib/api/axios";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/shared/empty-state";

type SessionDetail = {
  id: string;
  sessionDate: string;
  startTime: string | null;
  endTime: string | null;
  // Pra-HD
  preWeight: number | null;
  preSystolic: number | null;
  preDiastolic: number | null;
  prePulse: number | null;
  preTemperature: number | null;
  preComplaints: string | null;
  // Parameter HD
  ufGoal: number | null;
  bloodFlow: number | null;
  dialysateFlow: number | null;
  tmp: number | null;
  duration: number | null;
  vascularAccess: string | null;
  vascularAccessSite: string | null;
  dialyzerType: string | null;
  dialyzerReuse: number | null;
  anticoagulant: string | null;
  anticoagulantDose: string | null;
  dialysateType: string | null;
  dialysateTemperature: number | null;
  // Pasca-HD
  postWeight: number | null;
  postSystolic: number | null;
  postDiastolic: number | null;
  postPulse: number | null;
  actualUf: number | null;
  postNotes: string | null;
  // Status & Relations
  status: string;
  shiftName: string;
  roomName: string | null;
  machineBrand: string | null;
  machineModel: string | null;
  nurseName: string | null;
  // Nested
  complications: {
    id: string;
    occurredAt: string;
    action: string | null;
    notes: string | null;
    resolvedAt: string | null;
    complicationName: string;
    complicationCategory: string;
  }[];
  medications: {
    id: string;
    dosage: string;
    route: string;
    administeredAt: string;
    notes: string | null;
    medicationName: string;
    medicationUnit: string | null;
  }[];
};

async function fetchSessionDetail(id: string) {
  const res = await api.get(`/api/portal/sessions/${id}`);
  return res.data;
}

function StatItem({
  label,
  value,
  unit,
  subValue,
}: {
  label: string;
  value: string | number | null;
  unit?: string;
  subValue?: string;
}) {
  return (
    <div className="flex justify-between items-start py-2 border-b border-gray-50 last:border-0">
      <span className="text-sm text-gray-500">{label}</span>
      <div className="text-right">
        <span className="text-sm font-semibold text-gray-700">
          {value ?? "-"}
          {unit && value && <span className="text-gray-400 font-normal ml-1">{unit}</span>}
        </span>
        {subValue && <div className="text-xs text-gray-400">{subValue}</div>}
      </div>
    </div>
  );
}

function SectionCard({
  icon: Icon,
  title,
  children,
  iconColor = "text-sky-600",
  bgColor = "bg-sky-100",
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  children: React.ReactNode;
  iconColor?: string;
  bgColor?: string;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
      <div className="flex items-center gap-3 p-4 border-b border-gray-50 bg-gradient-to-r from-sky-50/50 to-cyan-50/50">
        <div className={`p-2 rounded-xl ${bgColor}`}>
          <Icon className={`h-4 w-4 ${iconColor}`} />
        </div>
        <h3 className="font-semibold text-gray-800">{title}</h3>
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}

function VitalComparison({
  label,
  preValue,
  postValue,
  unit,
}: {
  label: string;
  preValue: string | number | null;
  postValue: string | number | null;
  unit?: string;
}) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-gray-50 last:border-0">
      <span className="text-sm text-gray-500">{label}</span>
      <div className="flex items-center gap-3">
        <div className="text-center">
          <div className="text-xs text-gray-400 mb-0.5">Pra</div>
          <span className="text-sm font-semibold text-gray-700">
            {preValue ?? "-"}
            {unit && preValue && <span className="text-gray-400 font-normal ml-0.5">{unit}</span>}
          </span>
        </div>
        <div className="text-gray-300">→</div>
        <div className="text-center">
          <div className="text-xs text-gray-400 mb-0.5">Pasca</div>
          <span className="text-sm font-semibold text-gray-700">
            {postValue ?? "-"}
            {unit && postValue && <span className="text-gray-400 font-normal ml-0.5">{unit}</span>}
          </span>
        </div>
      </div>
    </div>
  );
}

export default function SessionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  const { data, isLoading, error } = useQuery({
    queryKey: ["portal-session-detail", id],
    queryFn: () => fetchSessionDetail(id),
  });

  const session: SessionDetail | null = data?.data || null;

  if (isLoading) {
    return (
      <div className="col-span-12 space-y-6">
        {/* Hero Skeleton */}
        <div className="rounded-2xl border border-gray-100 bg-gradient-to-br from-sky-50 via-cyan-50 to-white p-6 sm:p-8">
          <div className="flex items-start gap-4">
            <div className="h-10 w-10 bg-gray-200 animate-pulse rounded-lg" />
            <div className="space-y-3 flex-1">
              <div className="h-8 w-64 bg-gray-200 animate-pulse rounded" />
              <div className="h-4 w-48 bg-gray-200 animate-pulse rounded" />
            </div>
          </div>
        </div>
        {/* Content Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="rounded-2xl border border-gray-100 bg-white p-4">
              <div className="h-6 w-32 bg-gray-200 animate-pulse rounded mb-4" />
              <div className="space-y-3">
                {[...Array(4)].map((_, j) => (
                  <div key={j} className="h-4 bg-gray-100 animate-pulse rounded" />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="col-span-12">
        <EmptyState
          title="Sesi tidak ditemukan"
          description="Data sesi yang Anda cari tidak tersedia"
        />
      </div>
    );
  }

  const weightLoss =
    session.preWeight && session.postWeight
      ? ((session.preWeight - session.postWeight) / 1000).toFixed(2)
      : null;

  const vascularAccessLabels: Record<string, string> = {
    avf: "AVF (Arteriovenous Fistula)",
    avg: "AVG (Arteriovenous Graft)",
    cvc: "CVC (Central Venous Catheter)",
    permcath: "Permcath",
  };

  return (
    <div className="col-span-12 space-y-6">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-sky-50 via-cyan-50 to-white border border-sky-100 shadow-sm">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0wIDBoNDB2NDBIMHoiLz48cGF0aCBkPSJNMjAgMjBjMC0xMS4wNDYgOC45NTQtMjAgMjAtMjB2NDBoLTQwYzExLjA0NiAwIDIwLTguOTU0IDIwLTIweiIgZmlsbD0iIzBFQTVFOSIgZmlsbC1vcGFjaXR5PSIuMDMiLz48L2c+PC9zdmc+')] opacity-50" />
        <div className="relative px-6 py-8 sm:px-8 sm:py-10">
          <div className="flex items-start gap-4">
            <Button
              variant="outline"
              size="icon"
              className="shrink-0 bg-white/80 backdrop-blur-sm border-sky-200 hover:bg-sky-50 hover:border-sky-300"
              asChild
            >
              <Link href="/portal/sessions">
                <ArrowLeft className="h-4 w-4 text-sky-600" />
              </Link>
            </Button>
            <div className="space-y-3 flex-1">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-gradient-to-br from-sky-500 to-cyan-500 shadow-lg shadow-sky-500/25">
                    <Calendar className="h-5 w-5 text-white" />
                  </div>
                  <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-gray-800">
                    {format(new Date(session.sessionDate), "EEEE, dd MMMM yyyy", {
                      locale: localeId,
                    })}
                  </h1>
                </div>
                <Badge
                  variant={session.status === "completed" ? "success" : "warning"}
                  className="w-fit"
                >
                  {session.status === "completed" ? "Selesai" : "Berlangsung"}
                </Badge>
              </div>

              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                <div className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4" />
                  <span>
                    {session.shiftName} •{" "}
                    {session.startTime
                      ? format(new Date(session.startTime), "HH:mm")
                      : "-"}{" "}
                    -{" "}
                    {session.endTime
                      ? format(new Date(session.endTime), "HH:mm")
                      : "-"}
                  </span>
                </div>
                {session.roomName && (
                  <div className="flex items-center gap-1.5">
                    <span>Ruang {session.roomName}</span>
                  </div>
                )}
                {session.nurseName && (
                  <div className="flex items-center gap-1.5">
                    <User className="h-4 w-4" />
                    <span>{session.nurseName}</span>
                  </div>
                )}
              </div>

              {/* Quick Stats */}
              <div className="flex flex-wrap gap-2 pt-2">
                {session.duration && (
                  <div className="inline-flex items-center gap-2 text-sm bg-white/60 backdrop-blur-sm px-3 py-1.5 rounded-full border border-sky-100">
                    <Clock className="h-3.5 w-3.5 text-sky-500" />
                    <span className="text-gray-600">
                      Durasi <span className="font-semibold text-sky-600">{session.duration}</span> menit
                    </span>
                  </div>
                )}
                {weightLoss && (
                  <div className="inline-flex items-center gap-2 text-sm bg-white/60 backdrop-blur-sm px-3 py-1.5 rounded-full border border-emerald-100">
                    <Scale className="h-3.5 w-3.5 text-emerald-500" />
                    <span className="text-gray-600">
                      BB turun <span className="font-semibold text-emerald-600">{weightLoss}</span> kg
                    </span>
                  </div>
                )}
                {session.actualUf && (
                  <div className="inline-flex items-center gap-2 text-sm bg-white/60 backdrop-blur-sm px-3 py-1.5 rounded-full border border-cyan-100">
                    <Droplets className="h-3.5 w-3.5 text-cyan-500" />
                    <span className="text-gray-600">
                      UF <span className="font-semibold text-cyan-600">{(session.actualUf / 1000).toFixed(1)}</span> L
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Vital Signs Comparison */}
        <SectionCard icon={Heart} title="Tanda Vital">
          <VitalComparison
            label="Berat Badan"
            preValue={session.preWeight ? (session.preWeight / 1000).toFixed(1) : null}
            postValue={session.postWeight ? (session.postWeight / 1000).toFixed(1) : null}
            unit="kg"
          />
          <VitalComparison
            label="Tekanan Darah"
            preValue={
              session.preSystolic && session.preDiastolic
                ? `${session.preSystolic}/${session.preDiastolic}`
                : null
            }
            postValue={
              session.postSystolic && session.postDiastolic
                ? `${session.postSystolic}/${session.postDiastolic}`
                : null
            }
            unit="mmHg"
          />
          <VitalComparison
            label="Nadi"
            preValue={session.prePulse}
            postValue={session.postPulse}
            unit="x/mnt"
          />
          {session.preTemperature && (
            <StatItem
              label="Suhu Pra-HD"
              value={(session.preTemperature / 10).toFixed(1)}
              unit="°C"
            />
          )}
        </SectionCard>

        {/* HD Parameters */}
        <SectionCard icon={Activity} title="Parameter HD">
          <StatItem
            label="Target UF"
            value={session.ufGoal ? (session.ufGoal / 1000).toFixed(1) : null}
            unit="L"
          />
          <StatItem
            label="Aktual UF"
            value={session.actualUf ? (session.actualUf / 1000).toFixed(1) : null}
            unit="L"
          />
          <StatItem label="Blood Flow (QB)" value={session.bloodFlow} unit="ml/min" />
          <StatItem label="Dialysate Flow (QD)" value={session.dialysateFlow} unit="ml/min" />
          {session.tmp && <StatItem label="TMP" value={session.tmp} unit="mmHg" />}
          <StatItem label="Durasi" value={session.duration} unit="menit" />
        </SectionCard>

        {/* Dialysis Equipment */}
        <SectionCard icon={Zap} title="Peralatan Dialisis" iconColor="text-amber-600" bgColor="bg-amber-100">
          <StatItem label="Dialyzer" value={session.dialyzerType} />
          {session.dialyzerReuse !== null && (
            <StatItem
              label="Reuse"
              value={session.dialyzerReuse === 0 ? "Baru" : `Ke-${session.dialyzerReuse}`}
            />
          )}
          <StatItem
            label="Akses Vaskular"
            value={
              session.vascularAccess
                ? vascularAccessLabels[session.vascularAccess] || session.vascularAccess
                : null
            }
            subValue={session.vascularAccessSite || undefined}
          />
          <StatItem label="Antikoagulan" value={session.anticoagulant} subValue={session.anticoagulantDose || undefined} />
          {session.machineBrand && (
            <StatItem
              label="Mesin HD"
              value={session.machineBrand}
              subValue={session.machineModel || undefined}
            />
          )}
          <StatItem label="Dialisat" value={session.dialysateType} />
          {session.dialysateTemperature && (
            <StatItem label="Suhu Dialisat" value={session.dialysateTemperature} unit="°C" />
          )}
        </SectionCard>

        {/* Pre-HD Notes */}
        {session.preComplaints && (
          <SectionCard icon={Thermometer} title="Keluhan Pra-HD" iconColor="text-orange-600" bgColor="bg-orange-100">
            <p className="text-sm text-gray-600 leading-relaxed">{session.preComplaints}</p>
          </SectionCard>
        )}

        {/* Post-HD Notes */}
        {session.postNotes && (
          <SectionCard icon={Thermometer} title="Catatan Pasca-HD" iconColor="text-purple-600" bgColor="bg-purple-100">
            <p className="text-sm text-gray-600 leading-relaxed">{session.postNotes}</p>
          </SectionCard>
        )}
      </div>

      {/* Complications */}
      {session.complications.length > 0 && (
        <SectionCard
          icon={AlertTriangle}
          title={`Komplikasi (${session.complications.length})`}
          iconColor="text-red-600"
          bgColor="bg-red-100"
        >
          <div className="space-y-3">
            {session.complications.map((comp) => (
              <div
                key={comp.id}
                className="p-3 bg-red-50 rounded-xl border border-red-100"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="font-medium text-gray-800">{comp.complicationName}</h4>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {comp.complicationCategory} • {format(new Date(comp.occurredAt), "HH:mm", { locale: localeId })}
                    </p>
                  </div>
                  {comp.resolvedAt ? (
                    <Badge variant="success" className="text-xs">Teratasi</Badge>
                  ) : (
                    <Badge variant="destructive" className="text-xs">Belum Teratasi</Badge>
                  )}
                </div>
                {comp.action && (
                  <div className="mt-2 pt-2 border-t border-red-100">
                    <p className="text-xs text-gray-500">Tindakan:</p>
                    <p className="text-sm text-gray-700">{comp.action}</p>
                  </div>
                )}
                {comp.notes && (
                  <p className="text-sm text-gray-600 mt-2">{comp.notes}</p>
                )}
              </div>
            ))}
          </div>
        </SectionCard>
      )}

      {/* Medications */}
      {session.medications.length > 0 && (
        <SectionCard
          icon={Pill}
          title={`Obat Diberikan (${session.medications.length})`}
          iconColor="text-green-600"
          bgColor="bg-green-100"
        >
          <div className="space-y-2">
            {session.medications.map((med) => (
              <div
                key={med.id}
                className="flex items-center justify-between p-3 bg-green-50 rounded-xl border border-green-100"
              >
                <div>
                  <h4 className="font-medium text-gray-800">{med.medicationName}</h4>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {med.dosage} {med.medicationUnit} • {med.route} •{" "}
                    {format(new Date(med.administeredAt), "HH:mm", { locale: localeId })}
                  </p>
                  {med.notes && <p className="text-xs text-gray-500 mt-1">{med.notes}</p>}
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      )}
    </div>
  );
}
