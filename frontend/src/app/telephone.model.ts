export interface Telephone {
  id: number;
  namaUser: string;
  alamat: string;
  noTelp: number;
  kodePost: string;
  dateTime: string | null;
}

export interface TelephoneRequest {
  namaUser: string;
  alamat: string;
  noTelp: number;
  kodePost: string;
  dateTime: string | null;
}