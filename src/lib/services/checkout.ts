import type { PaymentMethod, DeliveryDate } from "@/lib/types";
import { paymentMethods, deliveryDates, deliveryTimeSlots } from "@/lib/mock-data";

/**
 * Checkout service. Returns mock data from lib/mock-data.
 * TODO(api): payment methods and delivery windows will come from the backend.
 */

export async function getPaymentMethods(): Promise<PaymentMethod[]> {
  return paymentMethods;
}

export async function getDeliveryDates(): Promise<DeliveryDate[]> {
  return deliveryDates;
}

export async function getDeliveryTimeSlots(): Promise<string[]> {
  return deliveryTimeSlots;
}
