import { auth } from "./auth/server";
import { redirect } from "next/navigation";

export async function getCurrentUser() {
    const { data } = await auth.getSession();
    if(!data) return null;
    return data.user;
}
