import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export default async function DashboardPage() {
  const session = await auth()

  if (!session) {
    redirect("/login")
  }

  const role = session.user.role
  const name = session.user.name || "Utente"

  // 🔹 DASHBOARD MASTER
  if (role === "UTENTEMASTER") {
    // recuperiamo il master per mostrare lo storeSlug
    const master = await prisma.master.findUnique({
      where: { userId: session.user.id },
    })

    const publicUrl = master
      ? `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/s/${
          master.storeSlug
        }`
      : null

    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Dashboard Master</h1>
        <p className="text-gray-600">
          Ciao <span className="font-semibold">{name}</span>, qui gestisci il tuo
          negozio: prodotti, inviti ai clienti e in futuro ordini e pagamenti.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <a
            href="/dashboard/products"
            className="bg-white p-4 rounded-lg shadow hover:shadow-md transition"
          >
            <h2 className="font-semibold mb-1">Prodotti</h2>
            <p className="text-sm text-gray-600">
              Crea, modifica e gestisci il catalogo del tuo marketplace.
            </p>
          </a>

          <a
            href="/dashboard/invites"
            className="bg-white p-4 rounded-lg shadow hover:shadow-md transition"
          >
            <h2 className="font-semibold mb-1">Inviti clienti</h2>
            <p className="text-sm text-gray-600">
              Genera link e QR code per far registrare i tuoi clienti.
            </p>
          </a>

          <div className="bg-white p-4 rounded-lg shadow opacity-60">
            <h2 className="font-semibold mb-1">Ordini (in arrivo)</h2>
            <p className="text-sm text-gray-600">
              Qui vedrai e gestirai gli ordini dei tuoi clienti.
            </p>
          </div>
        </div>

        {publicUrl && (
          <div className="bg-white p-4 rounded-lg shadow mt-4">
            <h2 className="font-semibold mb-2">Link pubblico del tuo shop</h2>
            <p className="text-sm text-gray-600 mb-2">
              Questo è l&apos;indirizzo che i tuoi clienti possono usare per
              vedere i tuoi prodotti:
            </p>
            <a
              href={publicUrl}
              className="text-blue-600 text-sm break-all hover:underline"
              target="_blank"
              rel="noreferrer"
            >
              {publicUrl}
            </a>
          </div>
        )}
      </div>
    )
  }

  // 🔹 DASHBOARD CLIENTE BASIC
  if (role === "UTENTEBASIC") {
    // troviamo il BasicProfile con il suo Master
    const basicProfile = await prisma.basicProfile.findUnique({
      where: { userId: session.user.id },
      include: {
        master: true,
      },
    })

    // se per qualche motivo non c'è profilo, messaggio di fallback
    if (!basicProfile || !basicProfile.master) {
      return (
        <div className="space-y-6">
          <h1 className="text-3xl font-bold">Dashboard Cliente</h1>
          <p className="text-gray-600">
            Ciao <span className="font-semibold">{name}</span>, il tuo account non
            risulta ancora collegato a un negozio.
          </p>
          <p className="text-sm text-gray-500">
            Questo non dovrebbe succedere se ti sei registrato tramite un link di
            invito. In caso contrario, contatta il supporto.
          </p>
        </div>
      )
    }

    const master = basicProfile.master

    const shopUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/s/${
      master.storeSlug
    }`

    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Dashboard Cliente</h1>
        <p className="text-gray-600">
          Ciao <span className="font-semibold">{name}</span>, sei cliente di{" "}
          <span className="font-semibold">{master.storeName}</span>.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white p-4 rounded-lg shadow">
            <h2 className="font-semibold mb-2">Vai al negozio</h2>
            <p className="text-sm text-gray-600 mb-3">
              Apri la vetrina prodotti del negozio a cui sei collegato.
            </p>
            <a
              href={shopUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-block bg-blue-500 text-white px-4 py-2 rounded text-sm hover:bg-blue-600 transition"
            >
              Apri il negozio
            </a>
            <p className="text-xs text-gray-400 mt-2 break-all">{shopUrl}</p>
          </div>

          <div className="bg-white p-4 rounded-lg shadow opacity-60">
            <h2 className="font-semibold mb-1">I miei ordini (in arrivo)</h2>
            <p className="text-sm text-gray-600">
              Qui vedrai la cronologia dei tuoi acquisti quando implementeremo
              gli ordini.
            </p>
          </div>
        </div>
      </div>
    )
  }

  // 🔹 DASHBOARD SUPER ADMIN
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Dashboard Super Admin</h1>
      <p className="text-gray-600">
        Ciao <span className="font-semibold">{name}</span>, qui in futuro potrai
        gestire i Master, controllare i dati globali, ecc.
      </p>

      <div className="bg-white p-4 rounded-lg shadow opacity-60">
        <h2 className="font-semibold mb-1">Gestione Master (in arrivo)</h2>
        <p className="text-sm text-gray-600">
          Qui potrai visualizzare e controllare tutti gli account Master.
        </p>
      </div>
    </div>
  )
}

