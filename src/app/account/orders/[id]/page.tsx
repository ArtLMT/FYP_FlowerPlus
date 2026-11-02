import OrderDetailView from "@/features/account/components/OrderDetailView";

/** Order details — /account/orders/[id] */
export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <OrderDetailView orderId={id} />;
}
