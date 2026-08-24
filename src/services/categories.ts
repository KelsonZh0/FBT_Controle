import { http } from './http';

export interface Category {
  id: string;
  name: string;
}

export async function listCategories(): Promise<Category[]> {
  const { data } = await http.get<Category[]>('/categories');
  return data;
}
