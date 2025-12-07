export interface BaseDisporaparEntity {
  id: number | null;
  periode: Date;
  tahun: number;
  bulan: string;
  id_opd: number;
  nama_opd: string;
}

export interface StatusKenaikanPangkat extends BaseDisporaparEntity {
  input_berkas: number;
  berkas_disimpan: number;
  bts: number;
  sudah_ttd_pertek: number;
  tms: number;
}

export interface StatusSKKenaikanPangkat extends BaseDisporaparEntity {
  sudah_ttd_pertek: number;
  belum_ttd_pertek: number;
}

export interface StatusPegawai extends BaseDisporaparEntity {
  nama: string;
  nip: string;
  golongan: string;
  status: string;
  keterangan: string;
}

export interface GolonganPegawai extends BaseDisporaparEntity {
  golongan_i: number;
  golongan_ii: number;
  golongan_iii: number;
  golongan_iv: number;
}

export interface KenaikanPangkat extends BaseDisporaparEntity {
  value: number;
}

export interface StatusDokumenWajib extends BaseDisporaparEntity {
  berhasil: number;
  tidak_berhasil: number;
}

export const DISPORAPAR_OPD_ID = 17;
