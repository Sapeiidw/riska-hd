"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ChartRecord, OpdConfig, StatusPegawaiRow } from "./types";

const fetchApi = <T>(endpoint: string): Promise<T> =>
  fetch(endpoint).then((res) => res.json());

// OPD List hooks
export function useOpdList() {
  return useQuery({
    queryKey: ["opd-list"],
    queryFn: () => fetchApi<OpdConfig[]>("/api/opd"),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useCreateOpd() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Omit<OpdConfig, "id">) =>
      fetch("/api/opd", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }).then((res) => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["opd-list"] });
    },
  });
}

export function useUpdateOpd() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: OpdConfig) =>
      fetch(`/api/opd/${data.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }).then((res) => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["opd-list"] });
    },
  });
}

export function useDeleteOpd() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) =>
      fetch(`/api/opd/${id}`, {
        method: "DELETE",
      }).then((res) => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["opd-list"] });
    },
  });
}

export function useKenaikanPangkat(opdId: number, year: string) {
  return useQuery({
    queryKey: ["kenaikan-pangkat", opdId, year],
    queryFn: () =>
      fetchApi<ChartRecord[]>(
        `/api/kenaikan-pangkat?for=dashboard&id_opd=${opdId}&year=${year}`
      ),
  });
}

export function useStatusDokumen(opdId: number, year: string) {
  return useQuery({
    queryKey: ["status-dokumen-wajib", opdId, year],
    queryFn: () =>
      fetchApi<ChartRecord[]>(
        `/api/status-dokumen-wajib?for=dashboard&id_opd=${opdId}&year=${year}`
      ),
  });
}

export function useStatusKenaikanPangkat(
  opdId: number,
  year: string,
  month: string
) {
  return useQuery({
    queryKey: ["status-kenaikan-pangkat", opdId, year, month],
    queryFn: () =>
      fetchApi<ChartRecord[]>(
        `/api/status-kenaikan-pangkat?for=dashboard&id_opd=${opdId}&year=${year}&month=${month}`
      ),
  });
}

export function useStatusSKKenaikanPangkat(
  opdId: number,
  year: string,
  month: string
) {
  return useQuery({
    queryKey: ["status-sk-kenaikan-pangkat", opdId, year, month],
    queryFn: () =>
      fetchApi<ChartRecord[]>(
        `/api/status-sk-kenaikan-pangkat?for=dashboard&id_opd=${opdId}&year=${year}&month=${month}`
      ),
  });
}

export function useGolonganPegawai(opdId: number, year: string, month: string) {
  return useQuery({
    queryKey: ["golongan-pegawai", opdId, year, month],
    queryFn: () =>
      fetchApi<ChartRecord[]>(
        `/api/golongan-pegawai?for=dashboard&id_opd=${opdId}&year=${year}&month=${month}`
      ),
  });
}

export function useStatusPegawai(opdId: number, year: string, month: string) {
  return useQuery({
    queryKey: ["status-pegawai", opdId, year, month],
    queryFn: () =>
      fetchApi<StatusPegawaiRow[]>(
        `/api/status-pegawai?for=dashboard&id_opd=${opdId}&year=${year}&month=${month}`
      ),
  });
}
