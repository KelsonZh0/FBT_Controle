import { colors } from '@/theme/colors';
import type { OrderStatus } from '@/types/api';

const LABELS: Record<OrderStatus, string> = {
  PENDING: 'Aguardando pagamento',
  PAID: 'Pago',
  CANCELLED: 'Cancelado',
  FULFILLED: 'Preparando envio',
  SHIPPED: 'Enviado',
  DELIVERED: 'Entregue',
};

const COLORS: Record<OrderStatus, string> = {
  PENDING: colors.gray,
  PAID: colors.primary,
  CANCELLED: colors.danger,
  FULFILLED: colors.accent,
  SHIPPED: colors.accent,
  DELIVERED: colors.primaryDark,
};

export function statusLabel(status: OrderStatus): string {
  return LABELS[status] ?? status;
}

export function statusColor(status: OrderStatus): string {
  return COLORS[status] ?? colors.gray;
}
