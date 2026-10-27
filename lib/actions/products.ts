'use server'

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "../currentUser";
import { prisma } from "../prisma";
import { z } from "zod";

type ActionResult = {
    success: boolean;
    message: string;
}

const ProductSchema = z.object({
    name: z.string().min(1, "Name is required"),
    price: z.coerce.number().nonnegative("Price must be non-negative"),
    quantity: z.coerce.number().int().min(0, "Quantity must be non-negative"),
    sku: z.string().optional(),
    lowStockAt: z.coerce.number().int().min(0).optional(),
});

// API functions --->>>

export async function deleteProduct(formData: FormData) {
    const user = await getCurrentUser();
    if (!user) throw new Error("User not authenticated");
    const productId = String(formData.get("id") || "");
    if(!productId) return { success: false, message: "product ID is required" };
    const result = await prisma.product.deleteMany({ where: { id: productId, userId: user.id }});
    if (!result.count) return { success: false, message: "Product not found" };
    revalidatePath("/inventory")
    return { success: true, message: "Product deleted successfully" };
}

export async function createProduct(prevState: ActionResult, formData: FormData) {
    const user = await getCurrentUser();
    if (!user) throw new Error("User not authenticated");
    const parsed = ProductSchema.safeParse({
        name: formData.get('name'),
        price: formData.get('price'),
        quantity: formData.get('quantity'),
        sku: formData.get('sku') || undefined,
        lowStockAt: formData.get('lowStockAt') || undefined,
    });
    if(!parsed.success) return { success: false, message: "Validation failed" };
    try{
        await prisma.product.create({ data: { ...parsed.data, userId: user.id }});
        return { success: true, message: "Product added successfully" };
    } catch (error) {
       return { success: false, message: "Failed to create product" };
    }
}

export async function updateProduct(prevState: ActionResult, formData: FormData) {
    const user = await getCurrentUser();
    if (!user) throw new Error("User not authenticated");
    const productId = String(formData.get("id") || "");
    if(!productId) return { success: false, message: "product ID is required" };
    const parsed = ProductSchema.safeParse({
        name: formData.get('name'),
        price: formData.get('price') ?? undefined,
        quantity: formData.get('quantity') ?? undefined,
        sku: String(formData.get('sku') ?? "").trim() || undefined,
        lowStockAt: formData.get('lowStockAt') || undefined,
    });
    if (!parsed.success) return { success: false, message: "Validation failed" };
    try {
        await prisma.product.update({
            where: { id: productId, userId: user.id },
            data: {
                name: parsed.data.name,
                sku: parsed.data.sku,
                price: parsed.data.price,
                quantity: parsed.data.quantity,
                lowStockAt: parsed.data.lowStockAt,
            }
        });
        revalidatePath("/inventory");
        return { success: true, message: "Product updated successfully" };
    } catch (error) {
        return { success: false, message: "Failed to update product" };
    }
}