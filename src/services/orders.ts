import { http } from './http';
import type { Order, OrderTimelineEntry, PaymentMethod, PaymentSimulate } from '@/types/api';

/**
 * Fecha o pedido. Passando `pickupPointId`, o pedido é de retirada no ponto
 * escolhido e volta com esse ponto em `order.pickup` (RF-47); sem ele, segue
 * como entrega.
 */
export async function checkout(pickupPointId?: string): Promise<Order> {
  const { data } = await http.post<Order>('/orders/checkout', pickupPointId ? { pickupPointId } : {});
  return data;
}

export async function listOrders(): Promise<Order[]> {
  const { data } = await http.get<Order[]>('/orders');
  return data;
}

export async function getOrder(id: string): Promise<Order> {
  const { data } = await http.get<Order>(`/orders/${id}`);
  return data;
}

export async function getOrderTimeline(id: string): Promise<OrderTimelineEntry[]> {
  const { data } = await http.get<OrderTimelineEntry[]>(`/orders/${id}/timeline`);
  return data;
}

export async function payOrder(
  id: string,
  method: PaymentMethod,
  simulate: PaymentSimulate = 'approve',
): Promise<Order> {
  const { data } = await http.post<Order>(`/orders/${id}/pay`, { method, simulate });
  return data;
}

export async function cancelOrder(id: string): Promise<Order> {
  const { data } = await http.post<Order>(`/orders/${id}/cancel`);
  return data;
}
