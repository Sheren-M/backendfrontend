export interface Todo {
  userId: number;
  id: number;
  title: string;
  completed: boolean;
}

export interface TodoRequest {
  userId: number;
  title: string;
  completed: boolean;
}