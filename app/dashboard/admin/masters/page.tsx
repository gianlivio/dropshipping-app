import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export default async function AdminMastersPage() {
  const session = await auth()

  // 1) Solo SUPER_ADMIN può vedere questa pagina
  if (!session || session.user.role !== "SUPER_ADMIN") {
    redirect("/dashboard")
  }

  // 2) Recupero di tutti i Master + qualche relazione
  const masters = await prisma.master.findMany({
    include: {
      user: true,
      products: true,
      orders: true,
      basicUsers: true,
    },
    orderBy: { createdAt: "desc" },
  })

  return (
    <div className="max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-2">Negozi (Master)</h1>
      <p className="text-sm text-gray-600 mb-6">
        Panoramica dei negozi creati nell&apos;app.
      </p>

      {masters.length === 0 ? (
        <div className="bg-white border-2 border-black rounded p-6 text-sm">
          Nessun Master registrato al momento.
        </div>
      ) : (
        <div className="space-y-3">
          {masters.map((master) => (
            <div
              key={master.id}
              className="bg-white border-2 border-black rounded p-4 flex flex-col gap-2"
            >
              <div className="flex items-center justify-between gap-4">
                <div>
                  <div className="font-semibold text-sm">
                    {master.storeName}
                  </div>
                  <div className="text-xs text-gray-600">
                    Owner: {master.user.email}
                  </div>
                  <div className="text-xs text-gray-500">
                    Slug pubblico: <code>/s/{master.storeSlug}</code>
                  </div>
                </div>

                <div className="text-right text-xs">
                  <div>Prodotti: {master.products.length}</div>
                  <div>Clienti: {master.basicUsers.length}</div>
                  <div>Ordini: {master.orders.length}</div>
                </div>
              </div>

              {master.description && (
                <p className="text-xs text-gray-600 mt-1">
                  {master.description}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
