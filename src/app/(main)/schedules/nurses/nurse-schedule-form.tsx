"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  createNurseScheduleSchema,
  CreateNurseScheduleInput,
} from "@/lib/validations/schedule";

interface NurseScheduleFormProps {
  schedule?: {
    id: string;
    nurseId: string;
    shiftId: string;
    scheduleDate: string;
    roomId: string | null;
    status: string;
    notes: string | null;
  } | null;
  defaultDate?: string | null;
  onSuccess: () => void;
}

type Nurse = {
  id: string;
  name: string;
  nip: string | null;
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

async function fetchNurses() {
  const res = await fetch("/api/master/nurses?limit=100");
  if (!res.ok) throw new Error("Failed to fetch nurses");
  return res.json();
}

async function fetchShifts() {
  const res = await fetch("/api/master/shifts?limit=100");
  if (!res.ok) throw new Error("Failed to fetch shifts");
  return res.json();
}

async function fetchRooms() {
  const res = await fetch("/api/master/rooms?limit=100");
  if (!res.ok) throw new Error("Failed to fetch rooms");
  return res.json();
}

async function createSchedule(data: CreateNurseScheduleInput) {
  const res = await fetch("/api/schedules/nurses", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error?.message || "Failed to create schedule");
  }
  return res.json();
}

async function updateSchedule(
  id: string,
  data: Partial<CreateNurseScheduleInput>
) {
  const res = await fetch(`/api/schedules/nurses/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error?.message || "Failed to update schedule");
  }
  return res.json();
}

const STATUS_OPTIONS = [
  { value: "scheduled", label: "Terjadwal" },
  { value: "present", label: "Hadir" },
  { value: "absent", label: "Tidak Hadir" },
  { value: "leave", label: "Cuti" },
];

export function NurseScheduleForm({
  schedule,
  defaultDate,
  onSuccess,
}: NurseScheduleFormProps) {
  const { data: nursesData } = useQuery({
    queryKey: ["nurses-all"],
    queryFn: fetchNurses,
  });

  const { data: shiftsData } = useQuery({
    queryKey: ["shifts-all"],
    queryFn: fetchShifts,
  });

  const { data: roomsData } = useQuery({
    queryKey: ["rooms-all"],
    queryFn: fetchRooms,
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

  const form = useForm<CreateNurseScheduleInput>({
    resolver: zodResolver(createNurseScheduleSchema),
    defaultValues: {
      nurseId: schedule?.nurseId || "",
      shiftId: schedule?.shiftId || "",
      scheduleDate: getDefaultDate(),
      roomId: schedule?.roomId || "",
      status: (schedule?.status as CreateNurseScheduleInput["status"]) || "scheduled",
      notes: schedule?.notes || "",
    },
  });

  const createMutation = useMutation({
    mutationFn: createSchedule,
    onSuccess: () => {
      toast.success("Jadwal perawat berhasil ditambahkan");
      onSuccess();
    },
    onError: (error: Error) => {
      toast.error(error.message || "Gagal menambahkan jadwal perawat");
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: Partial<CreateNurseScheduleInput>) =>
      updateSchedule(schedule!.id, data),
    onSuccess: () => {
      toast.success("Jadwal perawat berhasil diperbarui");
      onSuccess();
    },
    onError: (error: Error) => {
      toast.error(error.message || "Gagal memperbarui jadwal perawat");
    },
  });

  const onSubmit = (data: CreateNurseScheduleInput) => {
    const payload = {
      ...data,
      roomId: data.roomId === "_none" ? null : data.roomId || null,
      notes: data.notes || null,
    };

    if (schedule) {
      updateMutation.mutate(payload);
    } else {
      createMutation.mutate(payload);
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;
  const nurses: Nurse[] = nursesData?.data || [];
  const shifts: Shift[] = shiftsData?.data || [];
  const rooms: Room[] = roomsData?.data || [];

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="nurseId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Perawat</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih perawat" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
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
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="roomId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Ruangan (Opsional)</FormLabel>
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
