import { useQuery } from "@tanstack/react-query";
import { DPMPTSP_OPD_ID } from "./types";

interface ChartRecord {
  label: string;
  [key: string]: string | number;
}

interface StatusPegawaiRow {
  periode: string;
  nama_opd: string;
  nama: string;
  nip: string;
  golongan: string;
  status: string;
  keterangan: string;
}

const fetchApi = <T>(endpoint: string): Promise<T> =>
  fetch(endpoint).then((res) => res.json());

export function useKenaikanPangkat(year: string) {
  return useQuery({
    queryKey: ["kenaikan-pangkat", year],
    queryFn: () =>
      fetchApi<ChartRecord[]>(`/api/kenaikan-pangkat?for=dashboard&id_opd=${DPMPTSP_OPD_ID}&year=${year}`),
  });
}

export function useStatusDokumen(year: string) {
  return useQuery({
    queryKey: ["status-dokumen-wajib", year],
    queryFn: () =>
      fetchApi<ChartRecord[]>(`/api/status-dokumen-wajib?for=dashboard&id_opd=${DPMPTSP_OPD_ID}&year=${year}`),
  });
}

export function useStatusKenaikanPangkat(year: string, month: string) {
  return useQuery({
    queryKey: ["status-kenaikan-pangkat", year, month],
    queryFn: () =>
      fetchApi<ChartRecord[]>(
        `/api/status-kenaikan-pangkat?for=dashboard&id_opd=${DPMPTSP_OPD_ID}&year=${year}&month=${month}`
      ),
  });
}

export function useStatusSKKenaikanPangkat(year: string, month: string) {
  return useQuery({
    queryKey: ["status-sk-kenaikan-pangkat", year, month],
    queryFn: () =>
      fetchApi<ChartRecord[]>(
        `/api/status-sk-kenaikan-pangkat?for=dashboard&id_opd=${DPMPTSP_OPD_ID}&year=${year}&month=${month}`
      ),
  });
}

export function useGolonganPegawai(year: string, month: string) {
  return useQuery({
    queryKey: ["golongan-pegawai", year, month],
    queryFn: () =>
      fetchApi<ChartRecord[]>(
        `/api/golongan-pegawai?for=dashboard&id_opd=${DPMPTSP_OPD_ID}&year=${year}&month=${month}`
      ),
  });
}

export function useStatusPegawai(year: string, month: string) {
  return useQuery({
    queryKey: ["status-pegawai", year, month],
    queryFn: () =>
      fetchApi<StatusPegawaiRow[]>(
        `/api/status-pegawai?for=dashboard&id_opd=${DPMPTSP_OPD_ID}&year=${year}&month=${month}`
      ),
  });
}
