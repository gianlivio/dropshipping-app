"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

interface MasterSettings {
  storeName: string
  storeSlug: string
  description: string
  primaryColor: string
  secondaryColor: string
}

export default function StoreSettingsPage() {
  const router = useRouter()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const [formData, setFormData] = useState<MasterSettings>({
    storeName: "",
    storeSlug: "",
    description: "",
    primaryColor: "#3B82F6",
    secondaryColor: "#1E40AF",
  })

  // 1) Carico i dati del negozio quando apro la pagina
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)

        const res = await fetch("/api/master/settings")

        if (!res.ok) {
          const data = await res.json().catch(() => ({}))
          setError(data.error || "Errore nel caricamento")
          return
        }

        const data = await res.json()
        const master = data.master

        setFormData({
          storeName: master.storeName || "",
          storeSlug: master.storeSlug || "",
          description: master.description || "",
          primaryColor: master.primaryColor || "#3B82F6",
          secondaryColor: master.secondaryColor || "#1E40AF",
        })
      } catch (err) {
        console.error("Errore fetch impostazioni:", err)
        setError("Errore di connessione")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // 2) Salvataggio impostazioni
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    setSuccess(null)

    try {
      const res = await fetch("/api/master/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          storeName: formData.storeName,
          description: formData.description,
          primaryColor: formData.primaryColor,
          secondaryColor: formData.secondaryColor,
        }),
      })

      const data = await res.json()

      if (!res.ok || !data.success) {
        setError(data.error || "Errore durante il salvataggio")
        return
      }

      setSuccess("Impostazioni salvate con successo!")
      // opzionale: ricarica i dati
      // router.refresh()
    } catch (err) {
      console.error("Errore salvataggio impostazioni:", err)
      setError("Errore di connessione")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Caricamento impostazioni negozio...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-md p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
          <div>
            <h1 className="text-2xl font-bold">Impostazioni negozio</h1>
            <p className="text-sm text-gray-500">
              Modifica nome, descrizione e colori del tuo storefront pubblico.
            </p>
          </div>

          {/* 👇 Bottone anteprima: visibile solo se esiste uno slug */}
          {formData.storeSlug && (
            <a
              href={`/s/${formData.storeSlug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center px-4 py-2 rounded-md text-sm font-medium bg-gray-900 text-white hover:bg-gray-700 transition"
            >
              Apri anteprima negozio
            </a>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          {/* Messaggi di errore/successo */}
          {error && (
            <div className="mb-4 bg-red-100 text-red-700 px-4 py-2 rounded text-sm">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-4 bg-green-100 text-green-700 px-4 py-2 rounded text-sm">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
           {/* Nome negozio */}
            <div className="mb-4">
              <label className="block text-gray-700 mb-1">Nome negozio *</label>
              <input
                type="text"
                value={formData.storeName}
                onChange={(e) => setFormData({ ...formData, storeName: e.target.value })}
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            {/* Slug negozio (solo display) */}
            <div className="mb-4">
              <label className="block text-gray-700 mb-1">Slug negozio</label>
              <input
                type="text"
                value={formData.storeSlug}
                disabled
                className="w-full px-3 py-2 border rounded bg-gray-50 text-sm font-mono text-gray-600"
              />
              <p className="text-xs text-gray-500 mt-1">
                URL pubblico:{" "}
                <span className="font-mono">
                  /s/{formData.storeSlug || "il-tuo-slug"}
                </span>
              </p>
            </div>


            {/* Descrizione */}
            <div>
              <label className="block text-gray-700 mb-1">
                Descrizione negozio
              </label>
              <textarea
                rows={4}
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Colori */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 mb-1">
                  Colore primario
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={formData.primaryColor}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        primaryColor: e.target.value,
                      })
                    }
                    className="w-12 h-10 border rounded"
                  />
                  <input
                    type="text"
                    value={formData.primaryColor}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        primaryColor: e.target.value,
                      })
                    }
                    className="flex-1 px-3 py-2 border rounded text-sm"
                    placeholder="#3B82F6"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-700 mb-1">
                  Colore secondario
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={formData.secondaryColor}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        secondaryColor: e.target.value,
                      })
                    }
                    className="w-12 h-10 border rounded"
                  />
                  <input
                    type="text"
                    value={formData.secondaryColor}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        secondaryColor: e.target.value,
                      })
                    }
                    className="flex-1 px-3 py-2 border rounded text-sm"
                    placeholder="#1E40AF"
                  />
                </div>
              </div>
            </div>

            {/* Pulsanti */}
            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={saving}
                className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 transition disabled:bg-gray-400"
              >
                {saving ? "Salvataggio..." : "Salva impostazioni"}
              </button>

              <button
                type="button"
                onClick={() => router.push("/dashboard")}
                className="px-6 py-2 border rounded hover:bg-gray-50 transition text-sm"
              >
                Torna alla dashboard
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
