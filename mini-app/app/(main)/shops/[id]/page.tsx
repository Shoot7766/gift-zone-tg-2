import ShopDetailClient from "@/components/pages/ShopDetailClient";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ShopDetailClient id={id} />;
}
