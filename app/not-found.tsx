"use client"

import { useEffect } from "react"
import Link from "next/link"

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error("Errore dashboard:", error)
  }, [error])

  return (
    <div className="min-h-screen bg-gray-200 flex items-center justify-center">
      <div className="bg-gray-100 border-4 border-black rounded-lg px-6 py-8 w-full max-w-lg shadow-[6px_6px_0_0_#000]">
        <h1 className="text-2xl font-bold mb-2 text-gray-900">
          Errore nella dashboard
        </h1>

        <p className="text-sm text-gray-700 mb-4">
          C&apos;è stato un problema nel caricamento dei dati. Puoi riprovare o
          tornare alla dashboard principale.
        </p>

        {error?.message && (
          <pre className="text-[11px] text-gray-500 bg-gray-200 border border-black/20 rounded p-2 mb-4 overflow-x-auto">
            {error.message}
          </pre>
        )}

        <div className="flex gap-3">
          <button
            type="button"
            onClick={reset}
            className="flex-1 py-2 border-2 border-black rounded bg-white hover:bg-gray-200 transition text-sm font-semibold"
          >
            Riprova
          </button>
          <Link
            href="/dashboard"
            className="flex-1 py-2 border-2 border-black rounded bg-gray-900 text-white hover:bg-black transition text-sm font-semibold text-center"
          >
            Vai alla dashboard
          </Link>
        </div>
      </div>
    </div>
  )
}
