import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { PrismaClient } from "@prisma/client"
import CheckoutButton from "./CheckoutButton"


const prisma = new PrismaClient()

export default async function CartPage() {
  const session = await auth()

  if (!session) {
    redirect("/login")
  }

  if (session.user.role !== "UTENTEBASIC") {
    // solo i clienti possono vedere questa pagina
    redirect("/dashboard")
  }

  const basicProfile = await prisma.basicProfile.findUnique({
    where: { userId: session.user.id },
    include: {
      master: true,
      cart: {
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
      },
    },
  })

  const items =
    basicProfile?.cart?.items.map((item) => {
      const subtotal = item.quantity * item.product.price
      return {
        id: item.id,
        name: item.product.name,
        price: item.product.price,
        quantity: item.quantity,
        subtotal,
        image: item.product.images?.[0] ?? null,
      }
    }) ?? []

  const total = items.reduce((acc, item) => acc + item.subtotal, 0)

  const shopUrl = basicProfile?.master
    ? `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/s/${
        basicProfile.master.storeSlug
      }`
    : null

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Il mio carrello</h1>

      {items.length === 0 ? (
        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-gray-600 mb-3">Il tuo carrello è vuoto.</p>
          {shopUrl && (
            <a
              href={shopUrl}
              className="text-blue-600 text-sm hover:underline"
            >
              Vai al negozio per aggiungere prodotti
            </a>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Lista prodotti */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <div
                key={item.id}
                className="bg-white p-4 rounded-lg shadow flex gap-4"
              >
                {item.image ? (
                  <img
                    src={item.image}
                    alt={item.name}
                    className="h-20 w-20 rounded object-cover"
                  />
                ) : (
                  <div className="h-20 w-20 rounded bg-gray-100 flex items-center justify-center text-xs text-gray-400">
                    Nessuna immagine
                  </div>
                )}

                <div className="flex-1">
                  <h2 className="font-semibold">{item.name}</h2>
                  <p className="text-sm text-gray-600">
                    Prezzo: €{item.price.toFixed(2)}
                  </p>
                  <p className="text-sm text-gray-600">
                    Quantità: {item.quantity}
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-sm text-gray-500">Subtotale</p>
                  <p className="font-semibold">
                    €{item.subtotal.toFixed(2)}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Riepilogo */}
            <div className="bg-white p-4 rounded-lg shadow h-fit">
            <h2 className="font-semibold mb-3">Riepilogo</h2>
            <div className="flex justify-between mb-2">
                <span>Totale</span>
                <span className="font-bold">€{total.toFixed(2)}</span>
            </div>

            <div className="mt-4">
                <CheckoutButton />
            </div>

            <p className="text-xs text-gray-500 mt-2">
                Il pagamento è simulato: l&apos;ordine viene segnato come pagato
                automaticamente. In futuro collegheremo Stripe.
            </p>
            </div>

        </div>
      )}
    </div>
  )
}
