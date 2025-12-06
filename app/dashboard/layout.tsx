import type { ReactNode } from "react"
import Link from "next/link"
import { auth } from "@/auth"
import { redirect } from "next/navigation"

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode
}) {
  const session = await auth()

  if (!session) {
    redirect("/login")
  }

  const role = session.user.role

  const menuItems =
    role === "UTENTEMASTER"
      ? [
          { href: "/dashboard", label: "Dashboard" },
          { href: "/dashboard/products", label: "Prodotti" },
          { href: "/dashboard/orders", label: "Ordini" },
          { href: "/dashboard/invites", label: "Inviti" },
          // 👇 QUESTA È LA VOCE CHE TI MANCA
          { href: "/dashboard/store", label: "Negozio" },
        ]
      : role === "UTENTEBASIC"
      ? [
          { href: "/dashboard", label: "Dashboard" },
          { href: "/dashboard/cart", label: "Carrello" },
          { href: "/dashboard/orders", label: "Ordini" },
        ]
      : [
          // SUPER_ADMIN
          { href: "/dashboard", label: "Dashboard" },
          { href: "/dashboard/admin/masters", label: "Master" },
        ]

  return (
    <div className="min-h-screen flex bg-neutral-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r-4 border-black p-4 flex flex-col">
        <div className="mb-8">
          <h2 className="text-xl font-bold tracking-tight">Console</h2>
          <p className="text-sm text-neutral-600">
            Ruolo: <span className="font-semibold">{role}</span>
          </p>
          {session.user.email && (
            <p className="text-xs text-neutral-500 break-all mt-1">
              {session.user.email}
            </p>
          )}
        </div>

        <nav className="flex-1 space-y-2">
          {menuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="block px-3 py-2 rounded border-2 border-black bg-neutral-100 hover:bg-neutral-200 text-sm font-medium transition"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <form
          action="/api/auth/signout"
          method="POST"
          className="mt-6"
        >
          <button
            type="submit"
            className="w-full border-2 border-black bg-neutral-900 text-white py-2 rounded text-sm font-semibold hover:bg-neutral-700 transition"
          >
            Logout
          </button>
        </form>
      </aside>

      {/* Contenuto */}
      <main className="flex-1 p-6">{children}</main>
    </div>
  )
}
