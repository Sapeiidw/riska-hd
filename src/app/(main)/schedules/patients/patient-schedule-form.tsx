"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import api from "@/lib/api/axios";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { DatePicker } from "@/components/ui/date-picker";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  createPatientScheduleSchema,
  CreatePatientScheduleInput,
} from "@/lib/validations/schedule";

interface PatientScheduleFormProps {
  schedule?: {
    id: string;
    patientId: string;
    shiftId: string;
    scheduleDate: string;
    roomId: string | null;
    machineId: string | null;
    nurseId: string | null;
    status: string;
    notes: string | null;
  } | null;
  defaultDate?: string | null;
  onSuccess: () => void;
}

type Patient = {
  id: string;
  name: string;
  medicalRecordNumber: string;
};

type Shift = {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
};

type Room = {
  id: string;
  name: string;
  code: string;
};

type Machine = {
  id: string;
  serialNumber: string;
  brand: string;
  model: string;
};

type Nurse = {
  id: string;
  name: string;
  nip: string | null;
};

async function fetchPatients() {
  const res = await api.get("/api/master/patients?limit=100");
  return res.data;
}

async function fetchShifts() {
  const res = await api.get("/api/master/shifts?limit=100");
  return res.data;
}

async function fetchRooms() {
  const res = await api.get("/api/master/rooms?limit=100");
  return res.data;
}

async function fetchMachines() {
  const res = await api.get("/api/master/machines?limit=100");
  return res.data;
}

async function fetchNurses() {
  const res = await api.get("/api/master/nurses?limit=100");
  return res.data;
}

async function createSchedule(data: CreatePatientScheduleInput) {
  const res = await api.post("/api/schedules/patients", data);
  return res.data;
}

async function updateSchedule(
  id: string,
  data: Partial<CreatePatientScheduleInput>
) {
  const res = await api.put(`/api/schedules/patients/${id}`, data);
  return res.data;
}

const STATUS_OPTIONS = [
  { value: "scheduled", label: "Terjadwal" },
  { value: "confirmed", label: "Dikonfirmasi" },
  { value: "in_progress", label: "Sedang Berlangsung" },
  { value: "completed", label: "Selesai" },
  { value: "cancelled", label: "Dibatalkan" },
  { value: "no_show", label: "Tidak Hadir" },
];

export function PatientScheduleForm({
  schedule,
  defaultDate,
  onSuccess,
}: PatientScheduleFormProps) {
  const { data: patientsData } = useQuery({
    queryKey: ["patients-all"],
    queryFn: fetchPatients,
  });

  const { data: shiftsData } = useQuery({
    queryKey: ["shifts-all"],
    queryFn: fetchShifts,
  });

  const { data: roomsData } = useQuery({
    queryKey: ["rooms-all"],
    queryFn: fetchRooms,
  });

  const { data: machinesData } = useQuery({
    queryKey: ["machines-all"],
    queryFn: fetchMachines,
  });

  const { data: nursesData } = useQuery({
    queryKey: ["nurses-all"],
    queryFn: fetchNurses,
  });

  const getDefaultDate = () => {
    if (schedule?.scheduleDate) {
      return new Date(schedule.scheduleDate).toISOString().split("T")[0];
    }
    if (defaultDate) {
      return defaultDate;
    }
    return "";
  };

  const form = useForm<CreatePatientScheduleInput>({
    resolver: zodResolver(createPatientScheduleSchema),
    defaultValues: {
      patientId: schedule?.patientId || "",
      shiftId: schedule?.shiftId || "",
      scheduleDate: getDefaultDate(),
      roomId: schedule?.roomId || "",
      machineId: schedule?.machineId || "",
      nurseId: schedule?.nurseId || "",
      status: (schedule?.status as CreatePatientScheduleInput["status"]) || "scheduled",
      notes: schedule?.notes || "",
    },
  });

  const createMutation = useMutation({
    mutationFn: createSchedule,
    onSuccess: () => {
      toast.success("Jadwal pasien berhasil ditambahkan");
      onSuccess();
    },
    onError: (error: Error) => {
      toast.error(error.message || "Gagal menambahkan jadwal pasien");
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: Partial<CreatePatientScheduleInput>) =>
      updateSchedule(schedule!.id, data),
    onSuccess: () => {
      toast.success("Jadwal pasien berhasil diperbarui");
      onSuccess();
    },
    onError: (error: Error) => {
      toast.error(error.message || "Gagal memperbarui jadwal pasien");
    },
  });

  const onSubmit = (data: CreatePatientScheduleInput) => {
    const payload = {
      ...data,
      roomId: data.roomId === "_none" ? null : data.roomId || null,
      machineId: data.machineId === "_none" ? null : data.machineId || null,
      nurseId: data.nurseId === "_none" ? null : data.nurseId || null,
      notes: data.notes || null,
    };

    if (schedule) {
      updateMutation.mutate(payload);
    } else {
      createMutation.mutate(payload);
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;
  const patients: Patient[] = patientsData?.data || [];
  const shifts: Shift[] = shiftsData?.data || [];
  const rooms: Room[] = roomsData?.data || [];
  const machines: Machine[] = machinesData?.data || [];
  const nurses: Nurse[] = nursesData?.data || [];

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="patientId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Pasien</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih pasien" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {patients.map((patient) => (
                    <SelectItem key={patient.id} value={patient.id}>
                      {patient.name} (MRN: {patient.medicalRecordNumber})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="shiftId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Shift</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih shift" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {shifts.map((shift) => (
                    <SelectItem key={shift.id} value={shift.id}>
                      {shift.name} ({shift.startTime} - {shift.endTime})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="scheduleDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tanggal</FormLabel>
              <FormControl>
                <DatePicker value={field.value} onChange={field.onChange} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="roomId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Ruangan</FormLabel>
                <Select
                  onValueChange={(value) => field.onChange(value === "_none" ? null : value)}
                  defaultValue={field.value || "_none"}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih ruangan" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="_none">Tidak Ditentukan</SelectItem>
                    {rooms.map((room) => (
                      <SelectItem key={room.id} value={room.id}>
                        {room.name} ({room.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="machineId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Mesin HD</FormLabel>
                <Select
                  onValueChange={(value) => field.onChange(value === "_none" ? null : value)}
                  defaultValue={field.value || "_none"}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih mesin" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="_none">Tidak Ditentukan</SelectItem>
                    {machines.map((machine) => (
                      <SelectItem key={machine.id} value={machine.id}>
                        {machine.brand} {machine.model} ({machine.serialNumber})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="nurseId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Perawat yang Ditugaskan</FormLabel>
              <Select
                onValueChange={(value) => field.onChange(value === "_none" ? null : value)}
                defaultValue={field.value || "_none"}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih perawat" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="_none">Tidak Ditentukan</SelectItem>
                  {nurses.map((nurse) => (
                    <SelectItem key={nurse.id} value={nurse.id}>
                      {nurse.name} {nurse.nip ? `(${nurse.nip})` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Status</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih status" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {STATUS_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Catatan (Opsional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Catatan tambahan..."
                  {...field}
                  value={field.value || ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Menyimpan..." : schedule ? "Perbarui" : "Simpan"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
