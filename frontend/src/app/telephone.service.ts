import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Telephone, TelephoneRequest } from './telephone.model';

@Injectable({ providedIn: 'root' })
export class TelephoneService {
  private http = inject(HttpClient);
  private url = 'https://localhost:7180/api/Telephone';

  getAll() {
    return this.http.get<Telephone[]>(this.url);
  }

  getById(id: number) {
    return this.http.get<Telephone>(`${this.url}/${id}`);
  }

  create(body: TelephoneRequest) {
    return this.http.post<Telephone>(this.url, body);
  }

  update(id: number, body: TelephoneRequest) {
    return this.http.put<void>(`${this.url}/${id}`, body);
  }

  delete(id: number) {
    return this.http.delete<void>(`${this.url}/${id}`);
  }
}
