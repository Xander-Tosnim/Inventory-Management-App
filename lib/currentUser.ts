import { auth } from "./auth/server";

export async function getCurrentUser() {
    const { data } = await auth.getSession();
    if(!data) return null;
    return data.user;
}
