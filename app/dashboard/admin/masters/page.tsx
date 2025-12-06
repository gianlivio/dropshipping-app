import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export default async function AdminMastersPage() {
  const session = await auth()

  // blocco chi non è loggato
  if (!session?.user) {
    redirect("/login")
  }

  // blocco chi NON è SUPER_ADMIN
  if (session.user.role !== "SUPER_ADMIN") {
    redirect("/dashboard")
  }

  // Query in parallelo
  const [
    totalMasters,
    totalUsers,
    totalProducts,
    totalOrders,
    revenueAgg,
    masters,
  ] = await Promise.all([
    prisma.master.count(),
    prisma.user.count(),
    prisma.product.count(),
    prisma.order.count(),
    prisma.order.aggregate({
      _sum: { total: true },
      where: {
        status: { in: ["PAID", "PROCESSING", "SHIPPED", "DELIVERED"] },
      },
    }),
    prisma.master.findMany({
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
        _count: {
          select: {
            products: true,
            orders: true,
            basicUsers: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
  ])

  const totalRevenue = revenueAgg._sum.total ?? 0

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Titolo */}
        <div>
          <h1 className="text-3xl font-bold mb-2">
            Pannello Super Admin – Masters
          </h1>
          <p className="text-gray-600">
            Panoramica globale della piattaforma e lista di tutti i negozi (Master).
          </p>
        </div>

        {/* Statistiche globali */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-500">Totale Masters</p>
            <p className="text-2xl font-bold">{totalMasters}</p>
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-500">Totale Utenti</p>
            <p className="text-2xl font-bold">{totalUsers}</p>
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-500">Prodotti totali</p>
            <p className="text-2xl font-bold">{totalProducts}</p>
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-500">Ordini totali</p>
            <p className="text-2xl font-bold">{totalOrders}</p>
          </div>
        </div>

        {/* Fatturato */}
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-500 mb-1">
            Fatturato (ordini pagati/spediti/consegnati)
          </p>
          <p className="text-3xl font-bold">€ {totalRevenue.toFixed(2)}</p>
        </div>

        {/* Lista Masters */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b flex justify-between items-center">
            <h2 className="text-xl font-semibold">Lista Masters</h2>
            <span className="text-sm text-gray-500">
              {masters.length} negozi
            </span>
          </div>

          {masters.length === 0 ? (
            <div className="p-6 text-gray-500">
              Nessun Master registrato al momento.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left font-semibold text-gray-600">
                      Negozio
                    </th>
                    <th className="px-4 py-2 text-left font-semibold text-gray-600">
                      Proprietario
                    </th>
                    <th className="px-4 py-2 text-left font-semibold text-gray-600">
                      Prodotti
                    </th>
                    <th className="px-4 py-2 text-left font-semibold text-gray-600">
                      Clienti
                    </th>
                    <th className="px-4 py-2 text-left font-semibold text-gray-600">
                      Ordini
                    </th>
                    <th className="px-4 py-2 text-left font-semibold text-gray-600">
                      Storefront
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {masters.map((master) => (
                    <tr key={master.id} className="border-t">
                      <td className="px-4 py-2">
                        <div className="font-medium">{master.storeName}</div>
                        <div className="text-xs text-gray-500">
                          slug: {master.storeSlug}
                        </div>
                      </td>
                      <td className="px-4 py-2">
                        <div className="font-medium">
                          {master.user?.name || "—"}
                        </div>
                        <div className="text-xs text-gray-500">
                          {master.user?.email}
                        </div>
                      </td>
                      <td className="px-4 py-2">
                        {master._count.products}
                      </td>
                      <td className="px-4 py-2">
                        {master._count.basicUsers}
                      </td>
                      <td className="px-4 py-2">
                        {master._count.orders}
                      </td>
                      <td className="px-4 py-2">
                        <a
                          href={`/s/${master.storeSlug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          Apri store
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
