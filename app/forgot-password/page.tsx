"use client"

import { FormEvent, useState } from "react"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")

    try {
      setLoading(true)

      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || "Errore nella richiesta")
        return
      }

      setSuccess("Se l'email esiste, riceverai un link di reset.")
    } catch (err) {
      setError("Errore di connessione")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-100 to-gray-300">
      <div className="w-full max-w-sm">
        <div className="bg-gray-50 border-4 border-black rounded-2xl shadow-[6px_6px_0px_#000] p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
              Reset password
            </h1>
            <p className="text-xs text-gray-600 mt-1 uppercase tracking-widest">
              Inserisci la tua email
            </p>
          </div>

          {error && (
            <div className="mb-3 border-2 border-black bg-red-100 text-red-800 text-xs px-3 py-2 rounded-lg">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-3 border-2 border-black bg-green-100 text-green-800 text-xs px-3 py-2 rounded-lg">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-gray-800 mb-1 uppercase tracking-wide">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border-2 border-black rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-gray-700"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 border-2 border-black bg-gray-900 text-gray-50 py-2 rounded-lg text-sm font-semibold uppercase tracking-widest flex items-center justify-center gap-2 disabled:bg-gray-500 disabled:cursor-not-allowed transition"
            >
              {loading ? (
                <>
                  <span className="text-[10px]">INVIO</span>
                  <span className="flex gap-1">
                    <span className="w-2 h-2 bg-gray-50 animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-2 h-2 bg-gray-50 animate-bounce" style={{ animationDelay: "120ms" }} />
                    <span className="w-2 h-2 bg-gray-50 animate-bounce" style={{ animationDelay: "240ms" }} />
                  </span>
                </>
              ) : (
                "Invia link"
              )}
            </button>
          </form>

          <div className="mt-4 text-center">
            <a
              href="/login"
              className="text-xs text-gray-700 underline underline-offset-2 hover:text-black"
            >
              Torna al login
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
