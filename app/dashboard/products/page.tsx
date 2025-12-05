import { auth } from "@/auth"
import { redirect } from "next/navigation"
import ProductsClient from "./ProductsClient"

export default async function ProductsPage() {
  const session = await auth()

  if (!session) {
    redirect("/login")
  }

  if (session.user.role !== "UTENTEMASTER") {
    // se non è un Master → niente accesso
    redirect("/dashboard")
  }

  return <ProductsClient />
}
