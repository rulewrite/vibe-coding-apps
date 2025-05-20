export interface Todo {
  id: number;
  text: string;
  completed: boolean;
  dueDate: string | null; // ISO 문자열 형식의 날짜 (YYYY-MM-DD)
}
