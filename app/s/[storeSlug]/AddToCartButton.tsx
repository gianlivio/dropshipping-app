"use client"

import { useState } from "react"

export default function AddToCartButton({ productId }: { productId: string }) {
  const [loading, setLoading] = useState(false)

  const handleClick = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, quantity: 1 }),
      })

      const data = await res.json()

      if (res.status === 401) {
        alert("Devi essere loggato come cliente per usare il carrello.")
        return
      }

      if (res.status === 403) {
        alert(data.error || "Non sei autorizzato ad aggiungere questo prodotto.")
        return
      }

      if (!res.ok) {
        alert(data.error || "Errore durante l'aggiunta al carrello")
        return
      }

      alert("Prodotto aggiunto al carrello!")
    } catch (error) {
      alert("Errore di connessione")
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className="mt-3 w-full bg-blue-500 text-white py-2 rounded text-sm hover:bg-blue-600 transition disabled:bg-gray-400"
    >
      {loading ? "Aggiungo..." : "Aggiungi al carrello"}
    </button>
  )
}
