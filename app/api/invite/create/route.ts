import { auth } from "@/auth"
import { PrismaClient } from "@prisma/client"
import { NextResponse } from "next/server"
import { randomBytes } from "crypto"

const prisma = new PrismaClient()

export async function POST() {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json({ error: "Non autenticato" }, { status: 401 })
    }

    // Trova il profilo Master dell'utente loggato
    const master = await prisma.master.findUnique({
      where: { userId: session.user.id }
    })

    if (!master) {
      return NextResponse.json(
        { error: "Solo i Master possono creare inviti" },
        { status: 403 }
      )
    }

    // Genera token univoco
    const token = randomBytes(32).toString("hex")

    // Crea link invito
    const inviteLink = await prisma.inviteLink.create({
      data: {
        masterId: master.id,
        token: token
      }
    })

    const inviteUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/signup?invite=${token}`

    return NextResponse.json({
      success: true,
      inviteUrl: inviteUrl,
      token: token
    })

  } catch (error) {
    console.error("Errore creazione invito:", error)
    return NextResponse.json(
      { error: "Errore interno del server" },
      { status: 500 }
    )
  }
}
