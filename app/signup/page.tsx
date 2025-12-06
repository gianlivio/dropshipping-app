"use client"

import { Suspense, useState, FormEvent } from "react"
import { useRouter, useSearchParams } from "next/navigation"

function SignupForm() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [loading, setLoading] = useState(false)

  // Supporta sia ?token=... che ?invite=...
  const inviteToken =
    searchParams.get("token") || searchParams.get("invite") || ""

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")

    if (password.length < 6) {
      setError("La password deve avere almeno 6 caratteri.")
      return
    }

    if (password !== confirmPassword) {
      setError("Le password non coincidono.")
      return
    }

    try {
      setLoading(true)

      const res = await fetch("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          password,
          inviteToken,
        }),
      })

      const data = await res.json()

      if (!res.ok || data.error) {
        setError(data.error || "Errore durante la registrazione.")
        return
      }

      setSuccess("Registrazione completata. Ora puoi accedere.")
      setTimeout(() => {
        router.push("/login")
      }, 2000)
    } catch {
      setError("Errore di connessione.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md border-4 border-black">
        <h1 className="text-2xl font-bold mb-2 text-center">Registrazione</h1>
        <p className="text-sm text-gray-600 mb-4 text-center">
          Crea un account
        </p>

        {inviteToken && (
          <div className="bg-yellow-100 text-yellow-800 p-3 rounded mb-4 text-xs border border-yellow-300">
            Registrazione tramite invito
          </div>
        )}

        {error && (
          <div className="bg-red-100 text-red-700 p-3 rounded mb-4 text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-100 text-green-700 p-3 rounded mb-4 text-sm">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-700 mb-1 text-sm">
              Nome
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border-2 border-black rounded focus:outline-none focus:ring-2 focus:ring-black bg-gray-50"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-1 text-sm">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border-2 border-black rounded focus:outline-none focus:ring-2 focus:ring-black bg-gray-50"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-1 text-sm">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border-2 border-black rounded focus:outline-none focus:ring-2 focus:ring-black bg-gray-50"
              required
              minLength={6}
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-1 text-sm">
              Conferma password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-3 py-2 border-2 border-black rounded focus:outline-none focus:ring-2 focus:ring-black bg-gray-50"
              required
              minLength={6}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white py-2 rounded text-sm border-2 border-black hover:bg-gray-800 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {loading ? "Registrazione..." : "Registrati"}
          </button>
        </form>

        <p className="mt-4 text-center text-xs text-gray-600">
          Hai già un account?{" "}
          <a
            href="/login"
            className="text-blue-600 underline-offset-2 hover:underline"
          >
            Accedi
          </a>
        </p>
      </div>
    </div>
  )
}

export default function SignupPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
          <div className="bg-white p-4 rounded-lg shadow-md border-4 border-black">
            <p className="text-sm">Caricamento pagina registrazione...</p>
          </div>
        </div>
      }
    >
      <SignupForm />
    </Suspense>
  )
}
