import { http } from './http';
import { ApiError } from '@/types/api';
import type { AuthResponse, Customer } from '@/types/api';

interface OutboxItem {
  to?: string | string[];
  recipient?: string;
  recipients?: string[];
  subject?: string;
  text?: string;
  html?: string;
  body?: string;
  createdAt?: string;
  [key: string]: unknown;
}

function collectStrings(value: unknown, bucket: string[]) {
  if (typeof value === 'string') {
    bucket.push(value);
    return;
  }
  if (Array.isArray(value)) {
    for (const item of value) collectStrings(item, bucket);
    return;
  }
  if (value && typeof value === 'object') {
    for (const nested of Object.values(value)) collectStrings(nested, bucket);
  }
}

function extractResetCode(raw: string): string | null {
  const patterns = [
    /(?:codigo|c[óo]digo|code)\D{0,20}(\d{4,8})/i,
    /\b(\d{6})\b/,
    /\b(\d{4})\b/,
  ];

  for (const pattern of patterns) {
    const match = raw.match(pattern);
    if (match?.[1]) return match[1];
  }
  return null;
}

async function resolveResetCode(email: string): Promise<string> {
  const normalizedEmail = email.trim().toLowerCase();
  const { data } = await http.get<{ data?: OutboxItem[] }>('/email-outbox', {
    params: { page: 1, pageSize: 100 },
  });

  const outbox = data?.data ?? [];
  for (const item of outbox) {
    const recipients: string[] = [];
    collectStrings(item.to, recipients);
    collectStrings(item.recipient, recipients);
    collectStrings(item.recipients, recipients);

    const hasTargetRecipient = recipients.some((recipient) =>
      recipient.toLowerCase().includes(normalizedEmail),
    );

    if (!hasTargetRecipient) continue;

    const textParts: string[] = [];
    collectStrings(item.subject, textParts);
    collectStrings(item.text, textParts);
    collectStrings(item.html, textParts);
    collectStrings(item.body, textParts);
    collectStrings(item, textParts);

    const joined = textParts.join(' ');
    const code = extractResetCode(joined);
    if (code) return code;
  }

  throw new ApiError(
    'RESET_CODE_NOT_FOUND',
    'Nao foi possivel localizar o codigo de recuperacao. Solicite novamente.',
    400,
  );
}

export async function login(email: string, password: string): Promise<AuthResponse> {
  const { data } = await http.post<AuthResponse>('/auth/login', { email, password });
  return data;
}

export async function getMe(): Promise<Customer> {
  const { data } = await http.get<Customer>('/auth/me');
  return data;
}

export async function register(
  name: string,
  email: string,
  password: string,
  document?: string,
): Promise<AuthResponse> {
  const { data } = await http.post<AuthResponse>('/auth/register', { name, email, password, document });
  return data;
}

export async function validateRecoveryEmail(email: string): Promise<boolean> {
  const normalizedEmail = email.trim().toLowerCase();
  const { data } = await http.get<{ data?: Array<{ email?: string }> }>('/store/customers', {
    params: { search: normalizedEmail, page: 1, pageSize: 50 },
  });

  const customers = data?.data ?? [];
  const exists = customers.some((customer) => customer.email?.toLowerCase() === normalizedEmail);

  if (!exists) {
    throw new ApiError('EMAIL_NOT_FOUND', 'E-mail nao encontrado para esta loja.', 404);
  }

  await http.post('/auth/forgot-password', { email: normalizedEmail });
  return true;
}

export async function resetPassword(email: string, newPassword: string): Promise<void> {
  const normalizedEmail = email.trim().toLowerCase();
  const code = await resolveResetCode(normalizedEmail);
  await http.post('/auth/reset-password', { email: normalizedEmail, code, newPassword });
}
