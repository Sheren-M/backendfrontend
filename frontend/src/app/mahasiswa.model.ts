export interface Mahasiswa {
  id: number;
  nama: string;
  alamat: string;
  pesanpesan: string;
  dateTime: string | null;
}

export interface MahasiswaRequest {
  nama: string;
  alamat: string;
  pesanpesan: string;
  dateTime: string | null;
}