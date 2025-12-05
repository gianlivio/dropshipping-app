import { PrismaClient } from "@prisma/client"
import { notFound } from "next/navigation"
import AddToCartButton from "./AddToCartButton"


const prisma = new PrismaClient()

export default async function StorefrontPage({
  params,
}: {
  params: Promise<{ storeSlug: string }>
}) {
  try {
    // 🔧 QUI LA DIFFERENZA IMPORTANTE
    const { storeSlug } = await params

    // Troviamo il Master con questo slug
    const master = await prisma.master.findUnique({
      where: { storeSlug },
    })

    if (!master) {
      notFound()
    }

    // Prodotti attivi di questo Master
    const products = await prisma.product.findMany({
      where: {
        masterId: master.id,
        isActive: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header negozio */}
        <header className="bg-white shadow-sm">
          <div className="max-w-5xl mx-auto px-4 py-4 flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold">{master.storeName}</h1>
              {master.description && (
                <p className="text-sm text-gray-600">{master.description}</p>
              )}
            </div>

            <div className="flex items-center gap-4">
              <a
                href="/dashboard/cart"
                className="text-sm text-blue-600 hover:underline"
              >
                Vai al carrello
              </a>
              {master.logo && (
                <img
                  src={master.logo}
                  alt={master.storeName}
                  className="h-10 w-10 rounded-full object-cover"
                />
              )}
            </div>
          </div>
        </header>


        {/* Contenuto */}
        <main className="max-w-5xl mx-auto px-4 py-8">
          {products.length === 0 ? (
            <div className="bg-white p-8 rounded-lg shadow text-center">
              <p className="text-gray-600">
                Nessun prodotto disponibile al momento.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <div
                  key={product.id}
                  className="bg-white rounded-lg shadow hover:shadow-md transition overflow-hidden"
                >
                  <div className="h-40 bg-gray-100 flex items-center justify-center">
                    {product.images && product.images.length > 0 ? (
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span className="text-gray-400 text-sm">Nessuna immagine</span>
                    )}
                  </div>

                  <div className="p-4">
                    <h2 className="font-semibold text-lg mb-1">{product.name}</h2>
                    {product.description && (
                      <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                        {product.description}
                      </p>
                    )}
                    <p className="text-blue-600 font-bold mb-1">
                      €{product.price.toFixed(2)}
                    </p>
                    <p className="text-xs text-gray-500">Stock: {product.stock}</p>

                    {/* 👇 QUI IL BOTTONE CARRELLO */}
                    <AddToCartButton productId={product.id} />
                  </div>
                </div>
              ))}

            </div>
          )}
        </main>
      </div>
    )
  } catch (error) {
    console.error("Errore storefront:", error)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-6 rounded shadow">
          <h1 className="text-xl font-bold mb-2">Errore</h1>
          <p className="text-gray-600">
            Si è verificato un errore nel caricamento del negozio.
          </p>
        </div>
      </div>
    )
  }
}
