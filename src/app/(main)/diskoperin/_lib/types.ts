export interface BaseDiskoperinEntity {
  id: number | null;
  periode: Date;
  tahun: number;
  bulan: string;
  id_opd: number;
  nama_opd: string;
}

export interface StatusKenaikanPangkat extends BaseDiskoperinEntity {
  input_berkas: number;
  berkas_disimpan: number;
  bts: number;
  sudah_ttd_pertek: number;
  tms: number;
}

export interface StatusSKKenaikanPangkat extends BaseDiskoperinEntity {
  sudah_ttd_pertek: number;
  belum_ttd_pertek: number;
}

export interface StatusPegawai extends BaseDiskoperinEntity {
  nama: string;
  nip: string;
  golongan: string;
  status: string;
  keterangan: string;
}

export interface GolonganPegawai extends BaseDiskoperinEntity {
  golongan_i: number;
  golongan_ii: number;
  golongan_iii: number;
  golongan_iv: number;
}

export interface KenaikanPangkat extends BaseDiskoperinEntity {
  value: number;
}

export interface StatusDokumenWajib extends BaseDiskoperinEntity {
  berhasil: number;
  tidak_berhasil: number;
}

export const DISKOPERIN_OPD_ID = 12;
