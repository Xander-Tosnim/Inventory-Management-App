import Sidebar from "@/components/sidebar";
import AddProductForm from "./_components/add-product-form";

export const dynamic = "force-dynamic";

export default function AddProductPage() {
    return (
        <div className="min-h-screen bg-gray-50 text-black">
            <Sidebar currentPath="/add-product" />
            <main className="ml-64 p-8">
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-semibold text-gray-900">Add Product</h1>
                            <p className="text-sm text-gray-500">Add New Product To Your Inventory</p>
                        </div>
                    </div>
                </div>

                <div className="max-w-2xl">
                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                        <AddProductForm />
                    </div>
                </div>
            </main>
        </div>
    )
}