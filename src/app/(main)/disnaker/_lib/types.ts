export interface BaseDinsnakerEntity {
  id: number | null;
  periode: Date;
  tahun: number;
  bulan: string;
  id_opd: number;
  nama_opd: string;
}

export interface StatusKenaikanPangkat extends BaseDinsnakerEntity {
  input_berkas: number;
  berkas_disimpan: number;
  bts: number;
  sudah_ttd_pertek: number;
  tms: number;
}

export interface StatusSKKenaikanPangkat extends BaseDinsnakerEntity {
  sudah_ttd_pertek: number;
  belum_ttd_pertek: number;
}

export interface StatusPegawai extends BaseDinsnakerEntity {
  nama: string;
  nip: string;
  golongan: string;
  status: string;
  keterangan: string;
}

export interface GolonganPegawai extends BaseDinsnakerEntity {
  golongan_i: number;
  golongan_ii: number;
  golongan_iii: number;
  golongan_iv: number;
}

export interface KenaikanPangkat extends BaseDinsnakerEntity {
  value: number;
}

export interface StatusDokumenWajib extends BaseDinsnakerEntity {
  berhasil: number;
  tidak_berhasil: number;
}

export const DISNAKER_OPD_ID = 10;
