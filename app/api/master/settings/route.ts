import { auth } from "@/auth"
import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

// GET: restituisce i dati del negozio del Master loggato
export async function GET() {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json({ error: "Non autenticato" }, { status: 401 })
    }

    if (session.user.role !== "UTENTEMASTER") {
      return NextResponse.json(
        { error: "Solo i Master possono accedere alle impostazioni negozio" },
        { status: 403 }
      )
    }

    const master = await prisma.master.findUnique({
      where: { userId: session.user.id },
      select: {
        id: true,
        storeName: true,
        storeSlug: true,
        description: true,
        primaryColor: true,
        secondaryColor: true,
      },
    })

    if (!master) {
      return NextResponse.json(
        { error: "Profilo Master non trovato" },
        { status: 404 }
      )
    }

    return NextResponse.json({ master })
  } catch (error) {
    console.error("Errore GET impostazioni negozio:", error)
    return NextResponse.json({ error: "Errore interno" }, { status: 500 })
  }
}

// PUT: aggiorna i dati del negozio del Master loggato
export async function PUT(request: Request) {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json({ error: "Non autenticato" }, { status: 401 })
    }

    if (session.user.role !== "UTENTEMASTER") {
      return NextResponse.json(
        { error: "Solo i Master possono aggiornare le impostazioni negozio" },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { storeName, description, primaryColor, secondaryColor } = body

    if (!storeName || typeof storeName !== "string") {
      return NextResponse.json(
        { error: "Nome negozio obbligatorio" },
        { status: 400 }
      )
    }

    const master = await prisma.master.update({
      where: { userId: session.user.id },
      data: {
        storeName,
        description: description || null,
        primaryColor: primaryColor || "#3B82F6",
        secondaryColor: secondaryColor || "#1E40AF",
      },
      select: {
        id: true,
        storeName: true,
        storeSlug: true,
        description: true,
        primaryColor: true,
        secondaryColor: true,
      },
    })

    return NextResponse.json({ success: true, master })
  } catch (error) {
    console.error("Errore PUT impostazioni negozio:", error)
    return NextResponse.json({ error: "Errore interno" }, { status: 500 })
  }
}
