"use client"

import { useState, FormEvent } from "react"
import { useRouter } from "next/navigation"
import { signIn } from "next-auth/react"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    })

    if (result?.error) {
      setError("Credenziali non valide")
      setLoading(false)
      return
    }

    router.push("/dashboard")
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-100 to-gray-300">
      <div className="w-full max-w-sm">
        <div className="bg-gray-50 border-4 border-black rounded-2xl shadow-[6px_6px_0px_#000] p-6">
          {/* Header minimale */}
          <div className="mb-6">
            <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
              Accedi
            </h1>
            <p className="text-xs text-gray-600 mt-1 uppercase tracking-widest">
              Area riservata
            </p>
          </div>

          {/* Errore */}
          {error && (
            <div className="mb-4 border-2 border-black bg-red-100 text-red-800 text-xs px-3 py-2 rounded-lg">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
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

            <div>
              <label className="block text-xs font-semibold text-gray-800 mb-1 uppercase tracking-wide">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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
                  <span className="text-[10px]">LOADING</span>
                  <span className="flex gap-1">
                    <span className="w-2 h-2 bg-gray-50 animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-2 h-2 bg-gray-50 animate-bounce" style={{ animationDelay: "120ms" }} />
                    <span className="w-2 h-2 bg-gray-50 animate-bounce" style={{ animationDelay: "240ms" }} />
                  </span>
                </>
              ) : (
                "Accedi"
              )}
            </button>
          </form>

          {/* Link password dimenticata */}
          <div className="mt-4 text-center">
            <a
              href="/forgot-password"
              className="text-xs text-gray-700 underline underline-offset-2 hover:text-black"
            >
              Password dimenticata?
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
