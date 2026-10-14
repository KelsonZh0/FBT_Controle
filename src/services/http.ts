import axios, { AxiosError } from 'axios';
import { env } from '@/env';
import { ApiError } from '@/types/api';

/**
 * Repare que `Content-Type` NÃO é fixado aqui de propósito.
 *
 * O axios já põe `application/json` sozinho quando o corpo é um objeto, e
 * quando o corpo é um FormData ele deixa o React Native definir o header — que
 * é o único jeito de o boundary do multipart ser gerado. Fixar o Content-Type
 * no cliente vaza para o POST /uploads e quebra o envio da foto sem mensagem
 * de erro clara (RF-39).
 */
export const http = axios.create({
  baseURL: `${env.apiUrl}/v1`,
  timeout: 15000,
  headers: {
    'X-API-Key': env.apiKey,
    'X-Student-RM': env.studentRm,
  },
});

let customerToken: string | null = null;
let onUnauthorizedCallback: (() => void) | null = null;

export function setCustomerToken(token: string | null) {
  customerToken = token;
}

export function setOnUnauthorized(callback: (() => void) | null) {
  onUnauthorizedCallback = callback;
}

http.interceptors.request.use((config) => {
  if (customerToken) {
    config.headers.set('Authorization', `Bearer ${customerToken}`);
  } else {
    config.headers.delete('Authorization');
  }
  return config;
});


http.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ error?: { code?: string; message?: string } }>) => {
    const status = error.response?.status ?? 0;
    const payload = error.response?.data?.error;

    if (status === 401 && onUnauthorizedCallback) {
      onUnauthorizedCallback();
    }

    if (payload) {
      return Promise.reject(new ApiError(payload.code ?? 'ERROR', payload.message ?? 'Erro na API', status));
    }
    if (error.code === 'ECONNABORTED') {
      return Promise.reject(new ApiError('TIMEOUT', 'A requisição demorou demais.', status));
    }
    return Promise.reject(
      new ApiError('NETWORK_ERROR', 'Sem conexão com o servidor. Confira a URL da API.', status),
    );
  },
);
