import { auth } from "@/auth"
import { redirect } from "next/navigation"
import InvitesClient from "./InvitesClient"

export default async function InvitesPage() {
  const session = await auth()

  if (!session) {
    redirect("/login")
  }

  if (session.user.role !== "UTENTEMASTER") {
    // solo i Master possono vedere questa pagina
    redirect("/dashboard")
  }

  return (
    <div className="space-y-6">
      <InvitesClient />
    </div>
  )
}
