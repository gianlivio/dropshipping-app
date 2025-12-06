"use client"

import type { ReactNode } from "react"
import Link from "next/link"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html>
      <body className="min-h-screen bg-gray-200 flex items-center justify-center">
        <div className="bg-gray-100 border-4 border-black rounded-lg px-6 py-8 w-full max-w-md shadow-[6px_6px_0_0_#000]">
          <h1 className="text-2xl font-bold mb-2 text-gray-900">
            Qualcosa è andato storto
          </h1>

          <p className="text-sm text-gray-700 mb-4">
            Si è verificato un errore interno. Puoi riprovare oppure tornare alla pagina iniziale.
          </p>

          {/* Dettaglio errore in piccolo (utile per dev) */}
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
              href="/"
              className="flex-1 py-2 border-2 border-black rounded bg-gray-900 text-white hover:bg-black transition text-sm font-semibold text-center"
            >
              Torna alla home
            </Link>
          </div>
        </div>
      </body>
    </html>
  )
}
