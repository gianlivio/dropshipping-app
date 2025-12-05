import { auth } from "@/auth"
import { PrismaClient } from "@prisma/client"
import { NextResponse } from "next/server"

const prisma = new PrismaClient()

// GET: lista prodotti del Master
export async function GET() {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Non autenticato" }, { status: 401 })
    }

    const master = await prisma.master.findUnique({
      where: { userId: session.user.id },
    })

    if (!master) {
      return NextResponse.json(
        { error: "Solo i Master possono visualizzare prodotti" },
        { status: 403 },
      )
    }

    const products = await prisma.product.findMany({
      where: { masterId: master.id },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json({ products })
  } catch (error) {
    console.error("Errore recupero prodotti:", error)
    return NextResponse.json({ error: "Errore interno" }, { status: 500 })
  }
}

// POST: crea nuovo prodotto
export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Non autenticato" }, { status: 401 })
    }

    const master = await prisma.master.findUnique({
      where: { userId: session.user.id },
    })

    if (!master) {
      return NextResponse.json(
        { error: "Solo i Master possono creare prodotti" },
        { status: 403 },
      )
    }

    const body = await request.json()
    const { name, description, price, stock, images } = body

    if (!name || !price) {
      return NextResponse.json(
        { error: "Nome e prezzo sono obbligatori" },
        { status: 400 },
      )
    }

    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")

    const product = await prisma.product.create({
      data: {
        masterId: master.id,
        name,
        slug,
        description,
        price: parseFloat(price),
        stock: parseInt(stock || "0", 10),
        images: images || [],
      },
    })

    return NextResponse.json({ success: true, product })
  } catch (error: any) {
    console.error("Errore creazione prodotto:", error)
    return NextResponse.json({ error: "Errore interno" }, { status: 500 })
  }
}
