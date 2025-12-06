import { auth } from "@/auth"
import { PrismaClient } from "@prisma/client"
import Link from "next/link"
import { AddToCartButton } from "./AddToCartButton"

const prisma = new PrismaClient()

// 👇 NOTA: params è una *Promise*
interface StorefrontPageProps {
  params: Promise<{ storeSlug: string }>
}

export default async function StorefrontPage({ params }: StorefrontPageProps) {
  // 👇 QUI facciamo l'await, altrimenti storeSlug è undefined
  const { storeSlug } = await params

  // Fallback extra di sicurezza
  if (!storeSlug || typeof storeSlug !== "string") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white shadow-md rounded-lg p-8 text-center max-w-md">
          <h1 className="text-2xl font-bold mb-4">URL negozio non valido</h1>
          <p className="text-gray-600 mb-6">
            Lo slug del negozio è mancante o non valido.
          </p>
          <a
            href="/"
            className="inline-block px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition text-sm"
          >
            Torna alla home
          </a>
        </div>
      </div>
    )
  }

  // 1) Recupero Master + prodotti attivi
  const master = await prisma.master.findUnique({
    where: { storeSlug },
    include: {
      products: {
        where: { isActive: true },
        orderBy: { createdAt: "desc" },
      },
    },
  })

  if (!master) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white shadow-md rounded-lg p-8 text-center max-w-md">
          <h1 className="text-2xl font-bold mb-4">Negozio non trovato</h1>
          <p className="text-gray-600 mb-6">
            Il negozio che stai cercando non esiste o non è più disponibile.
          </p>
          <a
            href="/"
            className="inline-block px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition text-sm"
          >
            Torna alla home
          </a>
        </div>
      </div>
    )
  }

  const session = await auth()
  const role = session?.user.role
  const userId = session?.user.id

  const isBasic = role === "UTENTEBASIC"
  const isMasterOwner = role === "UTENTEMASTER" && userId === master.userId

  const primaryColor = master.primaryColor || "#3B82F6"
  const secondaryColor = master.secondaryColor || "#1E40AF"

  return (
    <div className="min-h-screen bg-gray-100">
      {/* HEADER BRANDIZZATO */}
      <header
        className="mb-8"
        style={{
          background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`,
        }}
      >
        <div className="max-w-5xl mx-auto px-4 py-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-white">
              {master.storeName}
            </h1>
            {master.description && (
              <p className="mt-2 text-sm md:text-base text-blue-50 max-w-xl">
                {master.description}
              </p>
            )}
            <p className="mt-2 text-xs text-blue-100">
              URL negozio: <span className="font-mono">/s/{storeSlug}</span>
            </p>
          </div>

          <div className="flex flex-col items-start md:items-end gap-2">
            {isBasic && (
              <Link
                href="/dashboard/cart"
                className="px-4 py-2 rounded text-sm font-medium text-white border border-white/70 hover:bg-white/10 transition"
              >
                Vai al carrello
              </Link>
            )}

            {isMasterOwner && (
              <Link
                href="/dashboard/store"
                className="px-3 py-1 rounded text-xs font-medium bg-white/10 text-white border border-white/30 hover:bg-white/20 transition"
              >
                Sei il proprietario – vai alle impostazioni
              </Link>
            )}

            {!session && (
              <Link
                href="/login"
                className="px-4 py-2 rounded text-sm font-medium bg-white text-gray-800 hover:bg-gray-100 transition"
              >
                Accedi per acquistare
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* CONTENUTO */}
      <main className="max-w-5xl mx-auto px-4 pb-12">
        {/* Info ruolo utente */}
        <div className="mb-4">
          {isBasic && (
            <p className="text-sm text-gray-600">
              Stai acquistando come <span className="font-semibold">utente Basic</span>.
              Puoi aggiungere i prodotti al carrello e completare l’ordine dalla tua
              dashboard.
            </p>
          )}

          {isMasterOwner && (
            <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded px-3 py-2">
              Stai visualizzando il tuo stesso negozio come Master.{" "}
              Vai alla tua dashboard per gestire prodotti e ordini.
            </p>
          )}

          {!session && (
            <p className="text-sm text-gray-600">
              Non sei loggato. Puoi guardare i prodotti, ma devi{" "}
              <Link href="/login" className="text-blue-600 underline">
                accedere
              </Link>{" "}
              come utente Basic per acquistare.
            </p>
          )}
        </div>

        {/* Lista prodotti */}
        {master.products.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <p className="text-gray-600 mb-2">
              Non ci sono prodotti disponibili in questo negozio.
            </p>
            {isMasterOwner && (
              <Link
                href="/dashboard/products/new"
                className="text-sm text-blue-600 hover:underline"
              >
                Aggiungi il tuo primo prodotto dalla dashboard
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {master.products.map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-lg shadow-sm overflow-hidden flex flex-col"
                style={{ borderTop: `4px solid ${primaryColor}` }}
              >
                {/* Immagine */}
                <div className="h-40 bg-gray-100 flex items-center justify-center">
                  {product.images && product.images.length > 0 ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-gray-400 text-xs">
                      Nessuna immagine
                    </span>
                  )}
                </div>

                {/* Info prodotto */}
                <div className="p-4 flex flex-col gap-2 flex-1">
                  <h3 className="font-semibold text-base">{product.name}</h3>
                  {product.description && (
                    <p className="text-xs text-gray-600 line-clamp-3">
                      {product.description}
                    </p>
                  )}

                  <p className="text-sm font-bold mt-1">
                    € {product.price.toFixed(2)}
                  </p>
                  <p className="text-xs text-gray-500">
                    Stock: {product.stock}
                  </p>

                  <div className="mt-auto pt-2">
                    {isBasic ? (
                      <AddToCartButton
                        productId={product.id}
                        primaryColor={primaryColor}
                      />
                    ) : !session ? (
                      <p className="text-xs text-gray-500">
                        Accedi come utente Basic per acquistare.
                      </p>
                    ) : isMasterOwner ? (
                      <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded px-2 py-1">
                        Sei il Master di questo prodotto.
                      </p>
                    ) : (
                      <p className="text-xs text-gray-500">
                        Solo gli utenti Basic possono acquistare.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
