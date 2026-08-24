import { http } from './http';

export interface Brand {
  id: string;
  name: string;
}

export async function listBrands(): Promise<Brand[]> {
  const { data } = await http.get<Brand[]>('/brands');
  return data;
}
