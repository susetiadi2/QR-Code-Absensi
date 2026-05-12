export interface User {
  id: string;
  role: 'siswa' | 'guru' | 'admin';
  name: string;
  nis?: string;
  username?: string;
  sekolah: string;
}

export type AbsensiStatus = 'Hadir' | 'Sakit' | 'Izin' | 'Alpa';

export interface AbsensiRecord {
  id: string;
  date: string;
  nis: string;
  name: string;
  status: AbsensiStatus;
  time: string;
}
