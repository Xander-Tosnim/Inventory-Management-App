import { getInventoryData } from "./actions";
import InventoryClient from "./InventoryClient";
import Sidebar from "@/components/sidebar";

export default async function InventoryPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; page?: string }>;
}) {
  const params = await searchParams;
  const initialData = await getInventoryData(params);
  const normalizedInitialData = {
    ...initialData,
    items: initialData.items.map((item) => ({
      ...item,
      price: item.price.toNumber(),
    })),
  };

  return (
    <>
      <Sidebar currentPath="/inventory" />
      <InventoryClient initialData={normalizedInitialData} />
    </>
  );
}
