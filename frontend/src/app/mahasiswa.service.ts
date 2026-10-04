import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Mahasiswa, MahasiswaRequest } from './mahasiswa.model';

@Injectable({ providedIn: 'root' })
export class MahasiswaService {
  private http = inject(HttpClient);
  private url = 'https://localhost:7180/api/Pertemuan6';

  getAll() {
    return this.http.get<Mahasiswa[]>(this.url);
  }

  getById(id: number) {
    return this.http.get<Mahasiswa>(`${this.url}/${id}`);
  }

  create(body: MahasiswaRequest) {
    return this.http.post<Mahasiswa>(this.url, body);
  }

  update(id: number, body: MahasiswaRequest) {
    return this.http.put<void>(`${this.url}/${id}`, body);
  }

  delete(id: number) {
    return this.http.delete<void>(`${this.url}/${id}`);
  }
}
