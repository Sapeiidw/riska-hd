export interface BaseDamkarEntity {
  id: number | null;
  periode: Date;
  tahun: number;
  bulan: string;
  id_opd: number;
  nama_opd: string;
}

export interface StatusKenaikanPangkat extends BaseDamkarEntity {
  input_berkas: number;
  berkas_disimpan: number;
  bts: number;
  sudah_ttd_pertek: number;
  tms: number;
}

export interface StatusSKKenaikanPangkat extends BaseDamkarEntity {
  sudah_ttd_pertek: number;
  belum_ttd_pertek: number;
}

export interface StatusPegawai extends BaseDamkarEntity {
  nama: string;
  nip: string;
  golongan: string;
  status: string;
  keterangan: string;
}

export interface GolonganPegawai extends BaseDamkarEntity {
  golongan_i: number;
  golongan_ii: number;
  golongan_iii: number;
  golongan_iv: number;
}

export interface KenaikanPangkat extends BaseDamkarEntity {
  value: number;
}

export interface StatusDokumenWajib extends BaseDamkarEntity {
  berhasil: number;
  tidak_berhasil: number;
}

export const DAMKAR_OPD_ID = 15;
