"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"

export default function SignupPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  // prendiamo il token dall'URL ?invite=...
  const inviteToken = searchParams.get("invite") || ""

  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess(false)

    if (!inviteToken) {
      setError("Link invito mancante o non valido.")
      return
    }

    if (password !== confirmPassword) {
      setError("Le password non coincidono")
      return
    }

    setLoading(true)

    try {
      const response = await fetch("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          password,
          confirmPassword,
          inviteToken,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || "Errore durante la registrazione")
        return
      }

      setSuccess(true)

      // dopo un attimo, vai al login
      setTimeout(() => {
        router.push("/login")
      }, 1000)
    } catch (err) {
      console.error(err)
      setError("Errore di connessione")
    } finally {
      setLoading(false)
    }
  }

  // Se qualcuno apre /signup SENZA ?invite=..., lo blocchiamo subito
  if (!inviteToken) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-6 rounded-lg shadow-md w-96 text-center">
          <h1 className="text-lg font-bold mb-2">Registrazione non disponibile</h1>
          <p className="text-sm text-gray-600">
            Questa pagina è accessibile solo tramite link di invito.
          </p>
          <button
            onClick={() => router.push("/login")}
            className="mt-4 px-4 py-2 border border-black rounded text-sm hover:bg-gray-100"
          >
            Torna al login
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-96 border-2 border-black">
        <h1 className="text-2xl font-bold mb-1 text-center">Registrazione</h1>
        <p className="text-xs text-gray-600 mb-4 text-center">
          Crea un account collegato al negozio che ti ha invitato.
        </p>

        {error && (
          <div className="bg-red-100 text-red-700 border border-red-400 text-xs p-2 rounded mb-3">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-100 text-green-700 border border-green-400 text-xs p-2 rounded mb-3">
            Registrazione completata. Reindirizzamento al login...
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-sm text-gray-700 mb-1">Nome</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-black rounded text-sm"
              placeholder="Nome (opzionale)"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-black rounded text-sm"
              required
            />
          </div>

          <div>
            <label className="block text-sm text-gray-700 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-black rounded text-sm"
              required
            />
          </div>

          <div>
            <label className="block text-sm text-gray-700 mb-1">
              Conferma password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-3 py-2 border border-black rounded text-sm"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white py-2 rounded text-sm hover:bg-gray-800 transition disabled:bg-gray-400"
          >
            {loading ? "Registrazione..." : "Registrati"}
          </button>
        </form>

        <p className="mt-4 text-center text-xs text-gray-600">
          Hai già un account?{" "}
          <button
            type="button"
            onClick={() => router.push("/login")}
            className="underline"
          >
            Accedi
          </button>
        </p>
      </div>
    </div>
  )
}
