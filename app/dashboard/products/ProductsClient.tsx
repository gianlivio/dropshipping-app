"use client"

import { useEffect, useState } from "react"
import Link from "next/link"

interface Product {
  id: string
  name: string
  price: number
  stock: number
  isActive: boolean
  images: string[]
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch("/api/products")
        const data = await response.json()
        if (data.products) {
          setProducts(data.products)
        }
      } catch (error) {
        console.error("Errore caricamento prodotti:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [])

  const deleteProduct = async (id: string) => {
    if (!confirm("Sei sicuro di voler eliminare questo prodotto?")) return

    try {
      const res = await fetch(`/api/products/${id}`, {
        method: "DELETE",
      })

      if (res.ok) {
        setProducts((prev) => prev.filter((p) => p.id !== id))
        alert("Prodotto eliminato")
      } else {
        alert("Errore durante l'eliminazione")
      }
    } catch (error) {
      alert("Errore di connessione")
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto" />
          <p className="mt-4 text-gray-600">Caricamento...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">I Miei Prodotti</h1>
          <Link
            href="/dashboard/products/new"
            className="bg-blue-500 text-white px-6 py-3 rounded hover:bg-blue-600 transition"
          >
            + Nuovo Prodotto
          </Link>
        </div>

        {products.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <p className="text-gray-600 mb-4">Nessun prodotto ancora</p>
            <Link
              href="/dashboard/products/new"
              className="text-blue-500 hover:underline"
            >
              Crea il tuo primo prodotto
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-lg shadow-md overflow-hidden"
              >
                <div className="h-48 bg-gray-200 flex items-center justify-center">
                  {product.images?.length > 0 ? (
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="text-gray-400">Nessuna immagine</span>
                  )}
                </div>

                <div className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-lg">{product.name}</h3>
                    <span
                      className={`px-2 py-1 text-xs rounded ${
                        product.isActive
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {product.isActive ? "Attivo" : "Inattivo"}
                    </span>
                  </div>

                  <p className="text-gray-600 mb-2">
                    €{product.price.toFixed(2)}
                  </p>
                  <p className="text-sm text-gray-500 mb-4">
                    Stock: {product.stock}
                  </p>

                  <div className="flex gap-2">
                    <Link
                      href={`/dashboard/products/${product.id}`}
                      className="flex-1 bg-blue-500 text-white px-4 py-2 rounded text-center hover:bg-blue-600 transition"
                    >
                      Modifica
                    </Link>
                    <button
                      onClick={() => deleteProduct(product.id)}
                      className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
                    >
                      Elimina
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
