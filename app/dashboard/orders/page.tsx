import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

function formatDate(date: Date) {
  return new Date(date).toLocaleString("it-IT", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export default async function OrdersPage() {
  const session = await auth()

  if (!session) {
    redirect("/login")
  }

  const role = session.user.role

  // ─────────────────────────────────────────────
  // 1) VISTA MASTER → ordini del suo negozio
  // ─────────────────────────────────────────────
  if (role === "UTENTEMASTER") {
    const master = await prisma.master.findUnique({
      where: { userId: session.user.id },
      include: {
        orders: {
          include: {
            basicProfile: {
              include: { user: true },
            },
            items: {
              include: { product: true },
            },
          },
          orderBy: { createdAt: "desc" },
        },
      },
    })

    if (!master) {
      return (
        <div className="max-w-3xl mx-auto">
          <h1 className="text-2xl font-bold mb-4">Ordini</h1>
          <div className="bg-white border-2 border-black rounded p-4 text-sm">
            Non sei associato a nessun negozio.
          </div>
        </div>
      )
    }

    const orders = master.orders

    return (
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-2">Ordini negozio</h1>
        <p className="text-sm text-gray-600 mb-6">
          Vedi gli ordini ricevuti dal tuo negozio.
        </p>

        {orders.length === 0 ? (
          <div className="bg-white border-2 border-black rounded p-4 text-sm">
            Nessun ordine ancora.
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map((order) => {
              const itemsCount = order.items.reduce(
                (sum, item) => sum + item.quantity,
                0
              )

              return (
                <div
                  key={order.id}
                  className="bg-gray-50 border-2 border-black rounded p-4 text-sm flex flex-col gap-2"
                >
                  <div className="flex justify-between gap-4">
                    <div>
                      <div className="font-semibold">
                        Ordine #{order.id.slice(0, 6)}
                      </div>
                      <div className="text-xs text-gray-600">
                        Data: {formatDate(order.createdAt)}
                      </div>
                      <div className="text-xs text-gray-600 mt-1">
                        Cliente:{" "}
                        {order.basicProfile?.user?.email ?? "sconosciuto"}
                      </div>
                    </div>

                    <div className="text-right text-xs">
                      <div>Totale: €{order.total.toFixed(2)}</div>
                      <div>Articoli: {itemsCount}</div>
                      <div className="mt-1">
                        Stato:{" "}
                        <span className="inline-block border border-black px-2 py-0.5 rounded bg-white">
                          {order.status}
                        </span>
                      </div>
                    </div>
                  </div>

                  {order.items.length > 0 && (
                    <div className="mt-2 border-t border-black pt-2">
                      <div className="font-semibold text-xs mb-1">
                        Dettaglio articoli:
                      </div>
                      <ul className="text-xs list-disc list-inside space-y-0.5">
                        {order.items.map((item) => (
                          <li key={item.id}>
                            {item.product?.name ?? "Prodotto"} x{" "}
                            {item.quantity} &middot; €{item.price.toFixed(2)}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    )
  }

  // ─────────────────────────────────────────────
  // 2) VISTA BASIC → ordini dell'utente
  // ─────────────────────────────────────────────
  if (role === "UTENTEBASIC") {
    const basic = await prisma.basicProfile.findUnique({
      where: { userId: session.user.id },
      include: {
        orders: {
          include: {
            master: true,
            items: {
              include: { product: true },
            },
          },
          orderBy: { createdAt: "desc" },
        },
      },
    })

    if (!basic) {
      return (
        <div className="max-w-3xl mx-auto">
          <h1 className="text-2xl font-bold mb-4">I miei ordini</h1>
          <div className="bg-white border-2 border-black rounded p-4 text-sm">
            Non hai ancora un profilo cliente.
          </div>
        </div>
      )
    }

    const orders = basic.orders

    return (
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-2">I miei ordini</h1>
        <p className="text-sm text-gray-600 mb-6">
          Qui trovi gli ordini che hai fatto.
        </p>

        {orders.length === 0 ? (
          <div className="bg-white border-2 border-black rounded p-4 text-sm">
            Nessun ordine effettuato.
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map((order) => {
              const itemsCount = order.items.reduce(
                (sum, item) => sum + item.quantity,
                0
              )

              return (
                <div
                  key={order.id}
                  className="bg-gray-50 border-2 border-black rounded p-4 text-sm flex flex-col gap-2"
                >
                  <div className="flex justify-between gap-4">
                    <div>
                      <div className="font-semibold">
                        Ordine #{order.id.slice(0, 6)}
                      </div>
                      <div className="text-xs text-gray-600">
                        Data: {formatDate(order.createdAt)}
                      </div>
                      <div className="text-xs text-gray-600 mt-1">
                        Negozio: {order.master.storeName}
                      </div>
                    </div>

                    <div className="text-right text-xs">
                      <div>Totale: €{order.total.toFixed(2)}</div>
                      <div>Articoli: {itemsCount}</div>
                      <div className="mt-1">
                        Stato:{" "}
                        <span className="inline-block border border-black px-2 py-0.5 rounded bg-white">
                          {order.status}
                        </span>
                      </div>
                    </div>
                  </div>

                  {order.items.length > 0 && (
                    <div className="mt-2 border-t border-black pt-2">
                      <div className="font-semibold text-xs mb-1">
                        Dettaglio articoli:
                      </div>
                      <ul className="text-xs list-disc list-inside space-y-0.5">
                        {order.items.map((item) => (
                          <li key={item.id}>
                            {item.product?.name ?? "Prodotto"} x{" "}
                            {item.quantity} &middot; €{item.price.toFixed(2)}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    )
  }

  // ─────────────────────────────────────────────
  // 3) SUPER_ADMIN o altro → rimando
  // ─────────────────────────────────────────────
  redirect("/dashboard")
}
