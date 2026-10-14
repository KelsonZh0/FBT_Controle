import { http } from './http';
import type { UploadedMedia } from '@/types/api';

/**
 * O que o seletor de imagens devolve e o upload precisa saber.
 * Mantido mínimo de propósito: o service não conhece `expo-image-picker`.
 */
export interface LocalImage {
  uri: string;
  fileName?: string | null;
  mimeType?: string | null;
}

/**
 * Envia uma imagem para POST /uploads (multipart/form-data) e devolve o media
 * criado. O `id` da resposta é o que a avaliação referencia em `mediaIds` —
 * a API não devolve um campo chamado `mediaId` aqui, apesar do nome.
 *
 * Nenhum header de Content-Type é passado: o React Native precisa montá-lo com
 * o boundary do multipart. Ver o comentário em `services/http.ts`.
 */
export async function uploadImage(image: LocalImage, folder = 'reviews'): Promise<UploadedMedia> {
  const form = new FormData();

  // O FormData do React Native aceita este formato de arquivo, que não existe
  // na tipagem padrão do DOM — daí o cast, que é local e documentado.
  const file = {
    uri: image.uri,
    name: image.fileName ?? fileNameFromUri(image.uri),
    type: image.mimeType ?? 'image/jpeg',
  } as unknown as Blob;

  form.append('file', file);
  form.append('folder', folder);

  const { data } = await http.post<UploadedMedia>('/uploads', form);
  return data;
}

function fileNameFromUri(uri: string): string {
  const last = uri.split('/').pop();
  return last && last.includes('.') ? last : `foto-${Date.now()}.jpg`;
}
