export interface BaseDisdukcapilEntity {
  id: number | null;
  periode: Date;
  tahun: number;
  bulan: string;
  id_opd: number;
  nama_opd: string;
}

export interface StatusKenaikanPangkat extends BaseDisdukcapilEntity {
  input_berkas: number;
  berkas_disimpan: number;
  bts: number;
  sudah_ttd_pertek: number;
  tms: number;
}

export interface StatusSKKenaikanPangkat extends BaseDisdukcapilEntity {
  sudah_ttd_pertek: number;
  belum_ttd_pertek: number;
}

export interface StatusPegawai extends BaseDisdukcapilEntity {
  nama: string;
  nip: string;
  golongan: string;
  status: string;
  keterangan: string;
}

export interface GolonganPegawai extends BaseDisdukcapilEntity {
  golongan_i: number;
  golongan_ii: number;
  golongan_iii: number;
  golongan_iv: number;
}

export interface KenaikanPangkat extends BaseDisdukcapilEntity {
  value: number;
}

export interface StatusDokumenWajib extends BaseDisdukcapilEntity {
  berhasil: number;
  tidak_berhasil: number;
}

export const DISDUKCAPIL_OPD_ID = 8;
