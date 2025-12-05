"use client"

import { useState } from "react"
import QRCode from "qrcode"

export default function InvitesClient() {
  const [inviteUrl, setInviteUrl] = useState("")
  const [qrCode, setQrCode] = useState("")
  const [loading, setLoading] = useState(false)

  const generateInvite = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/invite/create", {
        method: "POST",
      })

      const data = await response.json()

      if (data.success) {
        setInviteUrl(data.inviteUrl)
        const qr = await QRCode.toDataURL(data.inviteUrl)
        setQrCode(qr)
      } else {
        alert(data.error || "Errore nella creazione dell'invito")
      }
    } catch (error) {
      alert("Errore di connessione")
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = () => {
    if (!inviteUrl) return
    navigator.clipboard.writeText(inviteUrl)
    alert("Link copiato negli appunti!")
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h1 className="text-3xl font-bold mb-6">Invita Clienti</h1>

      <p className="text-gray-600 mb-6">
        Genera un link di invito per permettere ai tuoi clienti di registrarsi
        al tuo negozio.
      </p>

      <button
        onClick={generateInvite}
        disabled={loading}
        className="bg-blue-500 text-white px-6 py-3 rounded hover:bg-blue-600 transition disabled:bg-gray-400"
      >
        {loading ? "Generazione..." : "Genera Nuovo Invito"}
      </button>

      {inviteUrl && (
        <div className="mt-8 space-y-6">
          <div>
            <h2 className="text-xl font-semibold mb-3">Link di Invito</h2>
            <div className="flex gap-2">
              <input
                type="text"
                value={inviteUrl}
                readOnly
                className="flex-1 px-4 py-2 border rounded bg-gray-50"
              />
              <button
                onClick={copyToClipboard}
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition"
              >
                Copia
              </button>
            </div>
          </div>

          {qrCode && (
            <div>
              <h2 className="text-xl font-semibold mb-3">QR Code</h2>
              <div className="bg-white p-4 inline-block border rounded">
                <img
                  src={qrCode}
                  alt="QR Code Invito"
                  className="w-64 h-64"
                />
              </div>
              <p className="text-sm text-gray-600 mt-2">
                I clienti possono scansionare questo QR code per registrarsi
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
