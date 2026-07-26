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


export async function deleteProduct(formData: FormData) {
    const user = await getCurrentUser();
    if (!user) throw new Error("User not authenticated");
    const productId = String(formData.get("id") || "");
    await prisma.product.deleteMany({ where: { id: productId, userId: user.id }});
    revalidatePath("/inventory")
}

export async function createProduct(prevState: ActionResult, formData: FormData) {
    const user = await getCurrentUser();
    const parsed = ProductSchema.safeParse({
        name: formData.get('name'),
        price: formData.get('price'),
        quantity: formData.get('quantity'),
        sku: formData.get('sku') || undefined,
        lowStockAt: formData.get('lowStockAt') || undefined,
    });
    if(!parsed.success) return { success: false, message: "Validation failed" };
    try{
        await prisma.product.create({ data: { ...parsed.data, userId: String(user?.id) }});
        return { success: true, message: "Product added successfully" };
    } catch (error) {
       return { success: false, message: "Failed to create product" };
    }
}