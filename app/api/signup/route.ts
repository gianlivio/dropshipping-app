import { PrismaClient } from "@prisma/client"
import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, email, password, inviteToken } = body

    // Verifica che l'email non esista già
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: "Email già registrata" },
        { status: 400 }
      )
    }

    // Verifica token invito
    const inviteLink = await prisma.inviteLink.findUnique({
      where: { token: inviteToken }
    })

    if (!inviteLink || !inviteLink.isActive) {
      return NextResponse.json(
        { error: "Link di invito non valido" },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Crea utente Basic
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: "UTENTEBASIC"
      }
    })

    // Crea profilo Basic associato al Master
    await prisma.basicProfile.create({
      data: {
        userId: user.id,
        masterId: inviteLink.masterId
      }
    })

    // Incrementa contatore utilizzi link
    await prisma.inviteLink.update({
      where: { id: inviteLink.id },
      data: {
        usageCount: { increment: 1 }
      }
    })

    return NextResponse.json({
      success: true,
      userId: user.id
    })

  } catch (error) {
    console.error("Errore signup:", error)
    return NextResponse.json(
      { error: "Errore interno del server" },
      { status: 500 }
    )
  }
}