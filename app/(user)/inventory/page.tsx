import Sidebar from "@/components/sidebar";
import { getCurrentUser } from "@/lib/currentUser";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { deleteProduct } from "@/lib/actions/products";
import Pagination from "@/components/pagination";

export const dynamic = "force-dynamic";


export default async function InventoryPage({searchParams}: {searchParams: Promise<{ search?: string; page?: string; }>}) {
    const user = await getCurrentUser();
    if (!user) throw new Error("User not Authenticated");

    const params = await searchParams;
    const searchQuery = (params.search ?? "").trim();

    const userId = user.id;
    const pageSize = 5;
    const page = Math.max(1, Number(params.page ?? 1))
    
    const where: Prisma.ProductWhereInput = { 
        userId, 
        ...(searchQuery ? {name: { contains: searchQuery, mode: 'insensitive' }} : {}), 
    }
    
    const [totalCount, items] = await Promise.all([
        prisma.product.count({ where }),
        prisma.product.findMany({ where, orderBy: {createdAt: "desc"}, skip: (page - 1) * pageSize, take: pageSize })
    ]);
    
    
    const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
    return(
        <div className="min-h-screen bg-gray-50">
            <Sidebar currentPath="/inventory" />
            <main className="ml-64 p-8">
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-semibold text-gray-900">Inventory</h1>
                            <p className="text-sm text-gray-500">Mange your products and track inventory levels.</p>
                        </div>
                    </div>
                </div>

                <div className="space-y-6">

                    {/* Search Bar */}
                    <div className="bg-white rounded-lg border border-gray-200 py-3 px-4">
                        <form action="/inventory" method="GET" className="flex gap-2">
                            <input name="search" placeholder="Search products..." className="text-black flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:border-transparent" />
                            <button className="px-6 bg-purple-600 hover:bg-purple-700 text-white text-md rounded-xl cursor-pointer">Search</button>
                        </form>
                    </div>

                    {/* Products Table */}
                    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden text-black">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">SKU</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Low Stock At</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {items.map((product, key) => (
                                    <tr key={key} className="hover:bg-gray-200">
                                        <td className="px-6 py-4 text-sm text-gray-500">{product.name}</td>
                                        <td className="px-6 py-4 text-sm text-gray-500">{product.sku || "-"}</td>
                                        <td className="px-6 py-4 text-sm text-gray-500">{Number(product.price).toFixed(2)}</td>
                                        <td className="px-6 py-4 text-sm text-gray-500">{product.quantity}</td>
                                        <td className="px-6 py-4 text-sm text-gray-500">{product.lowStockAt || "-"}</td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            <form action={async (formData: FormData) => { "use server"; await deleteProduct(formData) }}>
                                                <input type="hidden" name="id" value={product.id} />
                                                <button className="px-3 py-0.5 rounded-lg bg-red-600 hover:bg-red-700 text-red-200 hover:text-red-100 cursor-pointer">Delete</button>
                                            </form>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {totalPages > 1 && (
                        <div className="bg-white rounded-lg border border-gray-200 p-6">
                            <Pagination 
                                currentPage={page}
                                totalPages={totalPages}
                                baseUrl="/inventory"
                                searchParams={{
                                    searchQuery,
                                    pageSize: String(pageSize),
                                }}
                            />
                        </div>
                    )}
                </div>
            </main>
        </div>
    )
}