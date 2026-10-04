import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { MahasiswaService } from './mahasiswa.service';
import { Mahasiswa } from './mahasiswa.model';
import { TodoComponent } from './todo';

@Component({
  selector: 'app-root',
  imports: [FormsModule, DatePipe, TodoComponent],
  template: `
    <!-- Menu tab -->
    <nav class="tabs">
      <button [class.active]="tab() === 'mhs'" (click)="tab.set('mhs')">
        Soal 1: Mahasiswa (API ASP.NET)
      </button>
      <button [class.active]="tab() === 'todo'" (click)="tab.set('todo')">
        Soal 2: Todos (JSONPlaceholder)
      </button>
    </nav>

    @if (tab() === 'mhs') {
      <div class="page">
        <h1>CRUD Data Mahasiswa</h1>
        <p class="sub">Frontend Angular - RESTful API ASP.NET Core</p>
        <p class="sub">Nama: Sheren Maybeline | NIM: 2024133001</p>

        <!-- Form -->
        <section class="card">
          <h2>{{ form.id ? 'Ubah Data' : 'Tambah Data' }}</h2>

          <div class="field">
            <label>Nama</label>
            <input [(ngModel)]="form.nama" placeholder="Nama" />
          </div>
          <div class="field">
            <label>Alamat</label>
            <input [(ngModel)]="form.alamat" placeholder="Alamat" />
          </div>
          <div class="field">
            <label>Pesan</label>
            <input [(ngModel)]="form.pesanpesan" placeholder="Pesan" />
          </div>

          <button class="btn primary" (click)="save()">
            {{ form.id ? 'Update' : 'Simpan' }}
          </button>
          @if (form.id) {
            <button class="btn" (click)="resetForm()">Batal</button>
          }

          @if (error()) {
            <p class="err">{{ error() }}</p>
          }
        </section>

        <!-- Tabel -->
        <section class="card">
          <h2>Daftar Mahasiswa</h2>
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Nama</th>
                <th>Alamat</th>
                <th>Pesan</th>
                <th>Tanggal</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              @for (m of items(); track m.id) {
                <tr>
                  <td>{{ m.id }}</td>
                  <td>{{ m.nama }}</td>
                  <td>{{ m.alamat }}</td>
                  <td>{{ m.pesanpesan }}</td>
                  <td>{{ m.dateTime | date:'dd/MM/yyyy' }}</td>
                  <td>
                    <button class="btn small warn" (click)="edit(m)">Edit</button>
                    <button class="btn small danger" (click)="remove(m.id)">Hapus</button>
                  </td>
                </tr>
              } @empty {
                <tr><td colspan="6" class="empty">Belum ada data.</td></tr>
              }
            </tbody>
          </table>
        </section>
      </div>
    } @else {
      <app-todo />
    }
  `,
  styles: [`
    :host {
      display: block;
      min-height: 100vh;
      background: #eef3fb;
      font-family: Arial, Helvetica, sans-serif;
      font-size: 14px;
      color: #222;
    }

    /* Tab */
    .tabs {
      display: flex; justify-content: center; gap: 8px;
      background: #1e40af; padding: 10px 16px 0;
    }
    .tabs button {
      border: 0; cursor: pointer; font-size: 14px;
      padding: 10px 20px; border-radius: 8px 8px 0 0;
      background: #3b5fc4; color: #dbe6ff;
    }
    .tabs button:hover { background: #4a6fd6; }
    .tabs button.active { background: #eef3fb; color: #1e40af; font-weight: bold; }

    .page { max-width: 850px; margin: 0 auto; padding: 24px 16px; }
    h1 { margin: 0 0 4px; font-size: 26px; color: #1e40af; }
    h2 { margin: 0 0 14px; font-size: 17px; color: #1e3a8a; }
    .sub { margin: 0 0 2px; color: #5b6b85; }
    h1, h2, .sub { text-align: center; }

    .card {
      background: #fff; border: 1px solid #d6e0f0; border-top: 4px solid #3b82f6;
      border-radius: 8px; padding: 18px; margin-top: 18px;
      box-shadow: 0 2px 8px rgba(30, 64, 175, .08);
    }

    .field { margin-bottom: 10px; }
    label { display: block; margin-bottom: 4px; font-weight: bold; color: #334155; }
    input {
      width: 100%; box-sizing: border-box; padding: 8px 10px;
      border: 1px solid #c3d0e6; border-radius: 6px; font-size: 14px;
    }
    input:focus {
      outline: none; border-color: #3b82f6;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, .18);
    }

    .btn {
      padding: 7px 16px; border: 0; border-radius: 6px;
      background: #94a3b8; color: #fff; cursor: pointer;
      font-size: 14px; margin-right: 6px;
    }
    .btn:hover { filter: brightness(1.1); }
    .btn.primary { background: #16a34a; }
    .btn.warn { background: #f59e0b; }
    .btn.danger { background: #dc2626; }
    .btn.small { padding: 4px 10px; font-size: 13px; }

    .err {
      margin: 12px 0 0; padding: 8px 12px; border-radius: 6px;
      background: #fee2e2; color: #b91c1c;
    }

    table { width: 100%; border-collapse: collapse; }
    th {
      background: #1e40af; color: #fff; text-align: left;
      padding: 9px 10px; border: 1px solid #1e40af;
    }
    td { border: 1px solid #d6e0f0; padding: 8px 10px; }
    tbody tr:nth-child(even) { background: #f3f7ff; }
    tbody tr:hover { background: #e0ebff; }
    .empty { text-align: center; color: #888; }
  `]
})
export class App implements OnInit {
  private api = inject(MahasiswaService);

  tab = signal<'mhs' | 'todo'>('mhs');
  items = signal<Mahasiswa[]>([]);
  error = signal('');
  form: any = this.emptyForm();

  ngOnInit() {
    this.load();
  }

  emptyForm() {
    return { id: 0, nama: '', alamat: '', pesanpesan: '' };
  }

  // READ
  load() {
    this.api.getAll().subscribe({
      next: data => {
        this.items.set(data);
        this.error.set('');
      },
      error: () => this.error.set('Gagal mengambil data dari API.')
    });
  }

  // CREATE + UPDATE
  save() {
    if (!this.form.nama?.trim()) {
      this.error.set('Nama wajib diisi.');
      return;
    }

    const body = {
      nama: this.form.nama,
      alamat: this.form.alamat,
      pesanpesan: this.form.pesanpesan,
      dateTime: null
    };

    const done = () => {
      this.resetForm();
      this.load();
    };
    const fail = () => this.error.set('Gagal menyimpan data.');

    if (this.form.id) {
      this.api.update(this.form.id, body).subscribe({ next: done, error: fail });
    } else {
      this.api.create(body).subscribe({ next: done, error: fail });
    }
  }

  // isi form untuk diedit
  edit(m: Mahasiswa) {
    this.form = {
      id: m.id,
      nama: m.nama,
      alamat: m.alamat,
      pesanpesan: m.pesanpesan
    };
    this.error.set('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // DELETE
  remove(id: number) {
    if (!confirm('Hapus data ini?')) return;
    this.api.delete(id).subscribe({
      next: () => this.load(),
      error: () => this.error.set('Gagal menghapus data.')
    });
  }

  resetForm() {
    this.form = this.emptyForm();
    this.error.set('');
  }
}