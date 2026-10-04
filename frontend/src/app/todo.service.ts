import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Todo, TodoRequest } from './todo.model';

@Injectable({ providedIn: 'root' })
export class TodoService {
  private http = inject(HttpClient);
  private url = 'https://jsonplaceholder.typicode.com/todos';

  getAll() {
    return this.http.get<Todo[]>(this.url);
  }

  getById(id: number) {
    return this.http.get<Todo>(`${this.url}/${id}`);
  }

  create(body: TodoRequest) {
    return this.http.post<Todo>(this.url, body);
  }

  update(id: number, body: TodoRequest) {
    return this.http.put<Todo>(`${this.url}/${id}`, { ...body, id });
  }

  delete(id: number) {
    return this.http.delete<unknown>(`${this.url}/${id}`);
  }
}
