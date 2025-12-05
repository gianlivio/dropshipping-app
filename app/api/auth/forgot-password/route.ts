import { PrismaClient } from "@prisma/client"
import { NextResponse } from "next/server"
import { randomBytes } from "crypto"

const prisma = new PrismaClient()

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email } = body

    if (!email) {
      return NextResponse.json(
        { error: "Email obbligatoria" },
        { status: 400 }
      )
    }

    // Cerchiamo l'utente
    const user = await prisma.user.findUnique({
      where: { email },
    })

    // Per sicurezza: NON diciamo se l'utente esiste o no
    if (!user) {
      return NextResponse.json({
        message:
          "Se l'email esiste nel sistema, è stato generato un link di reset.",
      })
    }

    // Genera token
    const token = randomBytes(32).toString("hex")

    // Cancella eventuali token precedenti per questa email
    await prisma.verificationToken.deleteMany({
      where: {
        identifier: email,
      },
    })

    // Salva nuovo token con scadenza (es. 1 ora)
    const expires = new Date()
    expires.setHours(expires.getHours() + 1)

    await prisma.verificationToken.create({
      data: {
        identifier: email,
        token,
        expires,
      },
    })

    const baseUrl =
      process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"

    const resetUrl = `${baseUrl}/reset-password?token=${token}`

    // QUI in produzione manderesti una mail
    // Per sviluppo lo rimandiamo in risposta
    return NextResponse.json({
      success: true,
      resetUrl,
    })
  } catch (error) {
    console.error("Errore forgot-password:", error)
    return NextResponse.json(
      { error: "Errore interno" },
      { status: 500 }
    )
  }
}

