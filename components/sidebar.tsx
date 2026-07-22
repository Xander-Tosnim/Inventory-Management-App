import { auth } from "@/lib/auth/server";
import { getCurrentUser } from "@/lib/currentUser";
import { redirect } from "next/navigation";
import { BarChart3, Logs, Package, Plus, Settings } from "lucide-react";
import Link from "next/link";


export default async function Sidebar({ currentPath = '/dashboard' }: { currentPath: string }) {

    const user = await getCurrentUser();

    if(!user) redirect("/");

    async function handleLogout() {
        'use server'; // This is the secret sauce
        await auth.signOut();
        redirect("/");
    }

    const navigation = [
        { name: "Dashboard",    href: "/dashboard",     icon: BarChart3 },
        { name: "Inventory",    href: "/inventory",     icon: Package   },
        { name: "Add Product",  href: "/add-product",   icon: Plus      },
    ];

    return (
        <div className="fixed left-0 top-0 bg-gray-900 text-white w-64 min-h-screen p-6 z-10">
            <div className="mb-8">
                <div className="flex items-center space-x-2 mb-4">
                    <Logs className="w-8 h-8" />
                    <span className="text-lg font-semibold">Inventory App</span>
                </div>
            </div>

            <nav className="space-y-1">
                <div className="text-sm font-semibold text-gray-400 uppercase">
                    inventory
                </div>
                {navigation.map((item, key) => {
                    const IconComp = item.icon;
                    const isActive = currentPath === item.href;
                    return (
                        <Link
                            href={item.href}
                            key={key}
                            className={`flex items-center space-x-3 py-2 px-3 rounded-lg ${isActive ? "bg-purple-100 text-gray-800" : "text-gray-300 hover:bg-gray-800"}`}
                        >
                            <IconComp className="w-5 h-5" />
                            <span className="text-sm">{item.name}</span>
                        </Link>
                    )
                })}
            </nav>

            <div className="absolute bottom-0 left-0 right-0 py-3.5 border-t border-gray-700">
                <div className="flex flex-col gap-0.5 items-center justify-between">
                    <div className="flex flex-col items-center">
                        <span className="leading-none">{user?.name}</span>
                        <span className="text-sm opacity-60">{user?.email}</span>
                    </div>
                    <button className="bg-red-500 hover:bg-red-800 py-0.5 px-6 rounded-2xl transition-colors duration-300 cursor-pointer text-md" onClick={handleLogout}>Sign Out</button>
                </div>
            </div>
        </div>
    )
}