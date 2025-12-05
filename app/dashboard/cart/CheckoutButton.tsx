"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

export default function CheckoutButton() {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleCheckout = async () => {
    if (!confirm("Confermi di voler creare l'ordine?")) return

    setLoading(true)
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
      })

      const data = await res.json()

      if (!res.ok) {
        alert(data.error || "Errore durante il checkout")
        return
      }

      alert("Ordine creato con successo!")
      router.push("/dashboard/orders")
    } catch (error) {
      alert("Errore di connessione")
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleCheckout}
      disabled={loading}
      className="w-full bg-green-500 text-white py-2 rounded text-sm hover:bg-green-600 transition disabled:bg-gray-400"
    >
      {loading ? "Elaborazione..." : "Conferma ordine (checkout simulato)"}
    </button>
  )
}
