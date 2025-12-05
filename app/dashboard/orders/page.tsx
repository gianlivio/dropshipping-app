import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export default async function OrdersPage() {
  const session = await auth()

  if (!session) {
    redirect("/login")
  }

  if (session.user.role !== "UTENTEBASIC") {
    redirect("/dashboard")
  }

  const basicProfile = await prisma.basicProfile.findUnique({
    where: { userId: session.user.id },
    include: {
      orders: {
        orderBy: {
          createdAt: "desc",
        },
        include: {
          items: {
            include: {
              product: true,
            },
          },
          master: true,
        },
      },
    },
  })

  const orders = basicProfile?.orders ?? []

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">I miei ordini</h1>

      {orders.length === 0 ? (
        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-gray-600">
            Non hai ancora effettuato ordini.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="bg-white p-4 rounded-lg shadow">
              <div className="flex justify-between items-center mb-2">
                <div>
                  <p className="text-sm text-gray-500">
                    Ordine ID: <span className="font-mono">{order.id}</span>
                  </p>
                  <p className="text-sm text-gray-500">
                    Negozio:{" "}
                    <span className="font-semibold">
                      {order.master.storeName}
                    </span>
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">Stato</p>
                  <p className="font-semibold">{order.status}</p>
                </div>
              </div>

              <div className="border-t pt-2 mt-2 space-y-2">
                {order.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex justify-between text-sm"
                  >
                    <div>
                      <p className="font-medium">
                        {item.product.name}
                      </p>
                      <p className="text-gray-500">
                        Quantità: {item.quantity} · Prezzo: €
                        {item.price.toFixed(2)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-gray-500">Subtotale</p>
                      <p className="font-semibold">
                        €
                        {(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t mt-3 pt-2 flex justify-between">
                <span className="font-semibold">Totale</span>
                <span className="font-bold">
                  €{order.total.toFixed(2)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

