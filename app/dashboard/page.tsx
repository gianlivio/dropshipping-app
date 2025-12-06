import Link from "next/link"
import { auth } from "@/auth"

export default async function DashboardHomePage() {
  const session = await auth()

  if (!session?.user) {
    // In teoria il layout ha già fatto redirect,
    // qui è solo per sicurezza.
    return null
  }

  const role = session.user.role

  const isMaster = role === "UTENTEMASTER"
  const isBasic = role === "UTENTEBASIC"
  const isAdmin = role === "SUPER_ADMIN"

  return (
    <div className="flex flex-col h-full">
      {/* Titolo semplice */}
      <header className="mb-4 border-b-2 border-black pb-3">
        <h1 className="text-xl font-extrabold text-gray-900 tracking-tight">
          Panoramica
        </h1>
        <p className="text-xs text-gray-600 mt-1">
          Accesso rapido alle sezioni principali.
        </p>
      </header>

      {/* Griglia di azioni */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {isMaster && (
          <>
            <CardLink
              href="/dashboard/products"
              title="Prodotti"
              description="Gestisci il catalogo."
            />
            <CardLink
              href="/dashboard/invites"
              title="Inviti"
              description="Invita nuovi clienti."
            />
            <CardLink
              href="/s/elettricashop"
              title="Anteprima negozio"
              description="Vedi lo store pubblico."
            />
          </>
        )}

        {isBasic && (
          <>
            <CardLink
              href="/dashboard/cart"
              title="Carrello"
              description="Gestisci i prodotti nel carrello."
            />
            <CardLink
              href="/dashboard/orders"
              title="Ordini"
              description="Vedi i tuoi acquisti."
            />
            <CardLink
              href="/s/elettricashop"
              title="Vai al negozio"
              description="Sfoglia i prodotti."
            />
          </>
        )}

        {isAdmin && (
          <>
            <CardLink
              href="/dashboard/admin/masters"
              title="Master"
              description="Elenco negozi e stati."
            />
            <CardLink
              href="#"
              title="Utenti"
              description="Gestione utenti (presto)."
            />
            <CardLink
              href="#"
              title="Statistiche"
              description="Report globali (presto)."
            />
          </>
        )}
      </section>
    </div>
  )
}

type CardLinkProps = {
  href: string
  title: string
  description: string
}

function CardLink({ href, title, description }: CardLinkProps) {
  return (
    <Link href={href}>
      <div className="h-full border-2 border-black rounded-xl bg-gray-50 hover:bg-gray-900 hover:text-gray-50 transition p-3 flex flex-col justify-between cursor-pointer">
        <div>
          <h2 className="text-sm font-bold mb-1">{title}</h2>
          <p className="text-[11px] text-gray-700 group-hover:text-gray-200">
            {description}
          </p>
        </div>
        <p className="text-[10px] mt-3 uppercase tracking-widest">
          Apri
        </p>
      </div>
    </Link>
  )
}
