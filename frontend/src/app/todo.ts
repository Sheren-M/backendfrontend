import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TodoService } from './todo.service';
import { Todo } from './todo.model';

@Component({
  selector: 'app-todo',
  imports: [FormsModule],
  template: `
    <div class="page">
      <h1>CRUD Data Todos</h1>
      <p class="sub">Frontend Angular - API JSONPlaceholder</p>
      <p class="sub">Nama: Sheren Maybeline | NIM: 2024133001</p>

      <!-- Form -->
      <section class="card">
        <h2>{{ form.id ? 'Ubah Todo' : 'Tambah Todo' }}</h2>

        <div class="field">
          <label>Judul (title)</label>
          <input [(ngModel)]="form.title" placeholder="Judul todo" />
        </div>
        <div class="field">
          <label>User ID</label>
          <input type="number" [(ngModel)]="form.userId" placeholder="User ID" />
        </div>
        <div class="field check">
          <input type="checkbox" id="done" [(ngModel)]="form.completed" />
          <label for="done">Selesai (completed)</label>
        </div>

        <button class="btn primary" (click)="save()">
          {{ form.id ? 'Update' : 'Simpan' }}
        </button>
        @if (form.id) {
          <button class="btn" (click)="resetForm()">Batal</button>
        }

        @if (info()) {
          <p class="info">{{ info() }}</p>
        }
        @if (error()) {
          <p class="err">{{ error() }}</p>
        }
      </section>

      <!-- Tabel -->
      <section class="card">
        <h2>Daftar Todos ({{ items().length }} data)</h2>
        <div class="scroll">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>User ID</th>
                <th>Judul</th>
                <th>Status</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              @for (t of items(); track t.id) {
                <tr>
                  <td>{{ t.id }}</td>
                  <td>{{ t.userId }}</td>
                  <td>{{ t.title }}</td>
                  <td>
                    <span class="badge" [class.ok]="t.completed">
                      {{ t.completed ? 'Selesai' : 'Belum' }}
                    </span>
                  </td>
                  <td class="nowrap">
                    <button class="btn small warn" (click)="edit(t)">Edit</button>
                    <button class="btn small danger" (click)="remove(t.id)">Hapus</button>
                  </td>
                </tr>
              } @empty {
                <tr><td colspan="5" class="empty">Belum ada data.</td></tr>
              }
            </tbody>
          </table>
        </div>
      </section>
    </div>
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
    input[type=text], input[type=number], input:not([type]) {
      width: 100%; box-sizing: border-box; padding: 8px 10px;
      border: 1px solid #c3d0e6; border-radius: 6px; font-size: 14px;
    }
    input:focus {
      outline: none; border-color: #3b82f6;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, .18);
    }
    .field.check { display: flex; align-items: center; gap: 8px; }
    .field.check label { margin: 0; }
    .field.check input { width: 18px; height: 18px; }

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
    .info {
      margin: 12px 0 0; padding: 8px 12px; border-radius: 6px;
      background: #dcfce7; color: #166534;
    }

    .scroll { max-height: 480px; overflow-y: auto; }
    table { width: 100%; border-collapse: collapse; }
    th {
      background: #1e40af; color: #fff; text-align: left;
      padding: 9px 10px; border: 1px solid #1e40af;
      position: sticky; top: 0;
    }
    td { border: 1px solid #d6e0f0; padding: 8px 10px; }
    tbody tr:nth-child(even) { background: #f3f7ff; }
    tbody tr:hover { background: #e0ebff; }
    .nowrap { white-space: nowrap; }
    .empty { text-align: center; color: #888; }

    .badge {
      display: inline-block; padding: 2px 10px; border-radius: 999px;
      background: #fee2e2; color: #b91c1c; font-size: 12px; font-weight: bold;
    }
    .badge.ok { background: #dcfce7; color: #166534; }
  `]
})
export class TodoComponent implements OnInit {
  private api = inject(TodoService);

  // JSONPlaceholder hanya punya todo dengan ID 1 sampai 200
  private readonly MAX_SERVER_ID = 200;

  items = signal<Todo[]>([]);
  error = signal('');
  info = signal('');
  form: any = this.emptyForm();

  ngOnInit() {
    this.load();
  }

  emptyForm() {
    return { id: 0, userId: 1, title: '', completed: false };
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
    this.info.set('');
    this.error.set('');

    if (!this.form.title?.trim()) {
      this.error.set('Judul wajib diisi.');
      return;
    }

    const body = {
      userId: Number(this.form.userId) || 1,
      title: this.form.title,
      completed: !!this.form.completed
    };

    if (this.form.id) {
      // UPDATE
      const id: number = this.form.id;

      const applyLocal = (pesan: string) => {
        this.items.update(list =>
          list.map(t => (t.id === id ? { ...t, ...body } : t))
        );
        this.info.set(pesan);
        this.resetForm();
      };

      if (id > this.MAX_SERVER_ID) {
        applyLocal(`Todo #${id} berhasil diubah (todo lokal, tidak dikirim ke server).`);
        return;
      }

      this.api.update(id, body).subscribe({
        next: () => applyLocal(`Todo #${id} berhasil diubah (simulasi API).`),
        error: () => this.error.set('Gagal mengubah data.')
      });
    } else {
      // CREATE
      this.api.create(body).subscribe({
        next: created => {
          const maxId = Math.max(0, ...this.items().map(t => t.id));
          const newTodo: Todo = { ...body, id: Math.max(maxId + 1, created.id ?? 0) };
          this.items.update(list => [newTodo, ...list]);
          this.info.set(`Todo baru berhasil ditambahkan (simulasi API, id respons: ${created.id}).`);
          this.resetForm();
        },
        error: () => this.error.set('Gagal menyimpan data.')
      });
    }
  }

  // isi form untuk diedit
  edit(t: Todo) {
    this.form = { id: t.id, userId: t.userId, title: t.title, completed: t.completed };
    this.error.set('');
    this.info.set('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // DELETE
  remove(id: number) {
    if (!confirm('Hapus todo ini?')) return;
    this.info.set('');
    this.error.set('');
    this.api.delete(id).subscribe({
      next: () => {
        this.items.update(list => list.filter(t => t.id !== id));
        this.info.set(`Todo #${id} berhasil dihapus (simulasi API).`);
        if (this.form.id === id) this.resetForm();
      },
      error: () => this.error.set('Gagal menghapus data.')
    });
  }

  resetForm() {
    this.form = this.emptyForm();
  }
}

