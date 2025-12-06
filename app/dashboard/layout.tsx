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
          { href: "/dashboard/invites", label: "Inviti" },
        ]
      : role === "UTENTEBASIC"
      ? [
          { href: "/dashboard", label: "Dashboard" },
          { href: "/dashboard/cart", label: "Carrello" },
          { href: "/dashboard/orders", label: "I miei ordini (presto)" },
        ]
      : [
          // SUPER_ADMIN
          { href: "/dashboard", label: "Dashboard" },
          { href: "/dashboard/admin/masters", label: "Admin – Masters" },
        ]

  return (
    <div className="min-h-screen flex bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-md p-4 flex flex-col">
        <div className="mb-8">
          <h2 className="text-xl font-bold">Livio App</h2>
          <p className="text-sm text-gray-500">
            Ruolo: <span className="font-semibold">{role}</span>
          </p>
          {session.user.email && (
            <p className="text-xs text-gray-400 break-all mt-1">
              {session.user.email}
            </p>
          )}
        </div>

        <nav className="flex-1 space-y-2">
          {menuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="block px-3 py-2 rounded hover:bg-blue-50 text-gray-700 text-sm"
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
            className="w-full bg-red-500 text-white py-2 rounded text-sm hover:bg-red-600 transition"
          >
            Logout
          </button>
        </form>
      </aside>

      {/* Contenuto */}
      <main className="flex-1 p-8">{children}</main>
    </div>
  )
}
