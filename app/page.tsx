import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/currentUser";
import HeroHome from "@/components/HomeHero";

export default async function Home () {

  const user = await getCurrentUser();
  if(user) redirect("/dashboard")

  return (
    <HeroHome />
  )
}