import Sidebar from "@/components/sidebar";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/currentUser";
import { TrendingUp } from "lucide-react";
import ProductsChart from "@/components/productsChart";
import { redirect } from "next/navigation";
import ProgressCircleDemo from "./_components/ProgessCircle";

export const dynamic = "force-dynamic";


export default async function DashboardPage() {

    const user = await getCurrentUser();
    if (!user) redirect("/");
    const userId = user?.id;

    const totalProducts = await prisma.product.count({ where: { userId } });

    const lowStock = await prisma.product.count({
        where: {
            userId,
            lowStockAt: { not: null },
            quantity: { lte: 5 },
        },
    });

    const recent = await prisma.product.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: 5
    });

    const allProducts = await prisma.product.findMany({
        where: { userId },
        select: { price: true, quantity: true, createdAt: true }
    });

    const totalValue = allProducts.reduce((sum, product) => sum + Number(product.price) * Number(product.quantity), 0);

    const inStockCount = allProducts.filter((product) => Number(product.quantity) > 5).length;
    const lowStockCount = allProducts.filter((product) => Number(product.quantity) <= 5 && Number(product.quantity) >= 1).length;
    const outStockCount = allProducts.filter((product) => Number(product.quantity) === 0).length;

    const inStockPercentage = totalProducts > 0 ? Math.round((inStockCount / totalProducts) * 100) : 0;
    const lowStockPercentage = totalProducts > 0 ? Math.round((lowStockCount / totalProducts) * 100) : 0;
    const outStockPercentage = totalProducts > 0 ? Math.round((outStockCount / totalProducts) * 100) : 0;


    const now = new Date();
    const weeklyProductsData = [];
    for (let i = 11; i >= 0; i--) {
        const weekStart = new Date(now);
        weekStart.setDate(weekStart.getDate() - i * 7);
        weekStart.setHours(0, 0, 0, 0);

        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekEnd.getDate() + 6);
        weekEnd.setHours(23, 59, 59, 999);

        const weekLabel = `${String(weekStart.getMonth() + 1).padStart(2, "0")}/${String(weekStart.getDate() + 1).padStart(2, "0")}`;

        const weekProducts = allProducts.filter((product) => {
            const productDate = new Date(product.createdAt);
            return productDate >= weekStart && productDate <= weekEnd;
        });

        weeklyProductsData.push({
            week: weekLabel,
            products: weekProducts.length,
        });
    }



    return (
        <div className="min-h-screen bg-gray-50 text-black">
            <Sidebar currentPath="/dashboard" />
            <main className="ml-64 p-8">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-gray-900 font-semibold text-2xl">Dashboard</h1>
                            <p className="text-sm text-gray-500">Welcome. Here is an overview of your inventory.</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                    {/* Key Metrics */}
                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-6">
                            Key Metrics
                        </h2>
                        <div className="grid grid-cols-3 gap-6">
                            <div className="text-center">
                                <div className="text-3xl font-bold text-gray-900">{totalProducts}</div>
                                <div className="text-sm text-gray-600">Total Products</div>
                                <div className="flex items-center justify-center mt-1">
                                    <span className="text-xs text-green-600">+{totalProducts}</span>
                                    <TrendingUp className="w-3 h-3 text-green-600 ml-1" />
                                </div>
                            </div>

                            <div className="text-center">
                                <div className="text-3xl font-bold text-gray-900">${Number(totalValue).toFixed(0)}</div>
                                <div className="text-sm text-gray-600">Total Value</div>
                                <div className="flex items-center justify-center mt-1">
                                    <span className="text-xs text-green-600">+${Number(totalValue).toFixed(0)}</span>
                                    <TrendingUp className="w-3 h-3 text-green-600 ml-1" />
                                </div>
                            </div>

                            <div className="text-center">
                                <div className="text-3xl font-bold text-gray-900">{lowStock}</div>
                                <div className="text-sm text-gray-600">Low Stock</div>
                                <div className="flex items-center justify-center mt-1">
                                    <span className="text-xs text-green-600">+{lowStock}</span>
                                    <TrendingUp className="w-3 h-3 text-green-600 ml-1" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Inventory Over Time */}
                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2>New products per week</h2>
                        </div>
                        <div className="h-48">
                            <ProductsChart data={weeklyProductsData} />
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                    {/* Stock Levels */}
                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-semibold text-gray-900">Stock Levels</h2>
                        </div>
                        <div className="space-y-3">
                            {recent.map((product, key) => {
                                const stockLevel = product.quantity === 0 ? 0 : product.quantity <= (product.lowStockAt || 5) ? 1 : 2;
                                const bgColors = ["bg-red-600", "bg-yellow-600", "bg-green-600"]
                                const textColors = ["text-red-600", "text-yellow-600", "text-green-600"]
                                return (
                                    <div key={key} className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                                        <div className="flex items-center space-x-3">
                                            <div className={`w-3 h-3 rounded-full ${bgColors[stockLevel]}`} />
                                            <span className="text-sm font-medium text-gray-900">{product.name}</span>
                                        </div>
                                        <div className={`text-sm font-medium ${textColors[stockLevel]}`}>{product.quantity} units</div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Efficiency */}
                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-semiboldld text-gray-900">Efficiency</h2>
                        </div>
                        <div className="flex items-center justify-center">
                            <ProgressCircleDemo />
                        </div>
                        <div className="mt-6 space-y-2">
                            <div className="flex items-center justify-between text-sm text-gray-600">
                                <div className="flex items-center space-x-2">
                                    <div className="w-3 h-3 rounded-full bg-purple-200" />
                                    <span>In Stock ({inStockPercentage}%)</span>
                                </div>
                            </div>
                            <div className="flex items-center justify-between text-sm text-gray-600">
                                <div className="flex items-center space-x-2">
                                    <div className="w-3 h-3 rounded-full bg-purple-600" />
                                    <span>Low Stock ({lowStockPercentage}%)</span>
                                </div>
                            </div>
                            <div className="flex items-center justify-between text-sm text-gray-600">
                                <div className="flex items-center space-x-2">
                                    <div className="w-3 h-3 rounded-full bg-gray-200" />
                                    <span>Out Of Stock ({outStockPercentage}%)</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}