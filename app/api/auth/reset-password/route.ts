import { PrismaClient } from "@prisma/client"
import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { token, password } = body

    if (!token || !password) {
      return NextResponse.json(
        { error: "Dati mancanti" },
        { status: 400 }
      )
    }

    // Cerchiamo il token
    const verificationToken = await prisma.verificationToken.findFirst({
      where: { token },
    })

    if (!verificationToken) {
      return NextResponse.json(
        { error: "Token non valido" },
        { status: 400 }
      )
    }

    if (verificationToken.expires < new Date()) {
      return NextResponse.json(
        { error: "Token scaduto" },
        { status: 400 }
      )
    }

    // Troviamo l'utente tramite identifier (email)
    const user = await prisma.user.findUnique({
      where: { email: verificationToken.identifier },
    })

    if (!user) {
      return NextResponse.json(
        { error: "Utente non trovato" },
        { status: 404 }
      )
    }

    // Hash password nuova
    const hashedPassword = await bcrypt.hash(password, 10)

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
      },
    })

    // Eliminiamo il token usato
    await prisma.verificationToken.delete({
      where: {
        identifier_token: {
          identifier: verificationToken.identifier,
          token: verificationToken.token,
        },
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Errore reset-password:", error)
    return NextResponse.json(
      { error: "Errore interno" },
      { status: 500 }
    )
  }
}
