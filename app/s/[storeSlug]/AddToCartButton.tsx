"use client"

import { useState } from "react"

interface AddToCartButtonProps {
  productId: string
  primaryColor?: string
}

export function AddToCartButton({
  productId,
  primaryColor = "#3B82F6",
}: AddToCartButtonProps) {
  const [loading, setLoading] = useState(false)

  const handleAddToCart = async () => {
    try {
      setLoading(true)

      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId,
          quantity: 1,
        }),
      })

      const data = await res.json().catch(() => ({}))

      if (!res.ok) {
        alert(data.error || "Errore nell'aggiunta al carrello")
        return
      }

      alert("Prodotto aggiunto al carrello")
    } catch (error) {
      console.error("Errore AddToCart:", error)
      alert("Errore di connessione")
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleAddToCart}
      disabled={loading}
      style={{ backgroundColor: primaryColor }}
      className="w-full text-white px-4 py-2 rounded text-sm font-medium hover:opacity-90 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
    >
      {loading ? "Aggiunta..." : "Aggiungi al carrello"}
    </button>
  )
}
