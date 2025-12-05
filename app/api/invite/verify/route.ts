import { PrismaClient } from "@prisma/client"
import { NextResponse } from "next/server"
import { NextRequest } from "next/server"

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const token = searchParams.get("token")

    if (!token) {
      return NextResponse.json({ valid: false }, { status: 400 })
    }

    const inviteLink = await prisma.inviteLink.findUnique({
      where: { token },
      include: {
        master: {
          select: {
            storeName: true,
            description: true
          }
        }
      }
    })

    if (!inviteLink || !inviteLink.isActive) {
      return NextResponse.json({ valid: false }, { status: 404 })
    }

    // Check scadenza (se impostata)
    if (inviteLink.expiresAt && inviteLink.expiresAt < new Date()) {
      return NextResponse.json({ valid: false, error: "Link scaduto" }, { status: 400 })
    }

    return NextResponse.json({
      valid: true,
      master: inviteLink.master
    })

  } catch (error) {
    console.error("Errore verifica invito:", error)
    return NextResponse.json({ valid: false }, { status: 500 })
  }
}