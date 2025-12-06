// app/api/signup/route.ts
import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, email, password, confirmPassword, inviteToken } = body

    // 1) Validazioni base
    if (!email || !password || !confirmPassword) {
      return NextResponse.json(
        { error: "Email e password sono obbligatorie" },
        { status: 400 }
      )
    }

    if (password !== confirmPassword) {
      return NextResponse.json(
        { error: "Le password non coincidono" },
        { status: 400 }
      )
    }

    // 2) Verifica email già usata
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: "Email già registrata. Prova ad effettuare il login." },
        { status: 400 }
      )
    }

    // 3) Questo endpoint serve SOLO per utenti BASIC tramite invito
    if (!inviteToken) {
      return NextResponse.json(
        { error: "Link invito mancante o non valido." },
        { status: 400 }
      )
    }

    const invite = await prisma.inviteLink.findUnique({
      where: { token: inviteToken },
    })

    if (!invite || !invite.isActive) {
      return NextResponse.json(
        { error: "Link invito non valido o disattivato." },
        { status: 400 }
      )
    }

    if (invite.expiresAt && invite.expiresAt < new Date()) {
      return NextResponse.json(
        { error: "Questo link di invito è scaduto." },
        { status: 400 }
      )
    }

    // 4) Crea utente BASIC
    const hashedPassword = await bcrypt.hash(password, 10)

    const user = await prisma.user.create({
      data: {
        name: name || null,
        email,
        password: hashedPassword,
        role: "UTENTEBASIC",
      },
    })

    // 5) Crea profilo Basic collegato al Master dell'invito
    await prisma.basicProfile.create({
      data: {
        userId: user.id,
        masterId: invite.masterId,
      },
    })

    // 6) Incrementa contatore di utilizzi invito
    await prisma.inviteLink.update({
      where: { id: invite.id },
      data: {
        usageCount: { increment: 1 },
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Errore signup:", error)
    return NextResponse.json(
      { error: "Errore interno del server" },
      { status: 500 }
    )
  }
}
