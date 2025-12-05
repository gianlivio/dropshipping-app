import { auth } from "@/auth"
import { PrismaClient } from "@prisma/client"
import { NextResponse } from "next/server"

const prisma = new PrismaClient()

function getIdFromRequest(req: Request) {
  const url = new URL(req.url)
  const segments = url.pathname.split("/").filter(Boolean)
  // .../api/products/:id  → l'ultimo segmento è l'id
  const id = segments[segments.length - 1]
  return id
}

// GET /api/products/:id
export async function GET(req: Request) {
  const id = getIdFromRequest(req)

  if (!id || id === "undefined") {
    return NextResponse.json(
      { error: "ID prodotto non valido" },
      { status: 400 }
    )
  }

  try {
    const product = await prisma.product.findUnique({
      where: { id },
    })

    if (!product) {
      return NextResponse.json(
        { error: "Prodotto non trovato" },
        { status: 404 }
      )
    }

    return NextResponse.json({ product })
  } catch (error: any) {
    console.error("Errore GET prodotto:", error)
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    )
  }
}

// PUT /api/products/:id
export async function PUT(req: Request) {
  const id = getIdFromRequest(req)

  if (!id || id === "undefined") {
    return NextResponse.json(
      { error: "ID prodotto non valido" },
      { status: 400 }
    )
  }

  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Non autenticato" }, { status: 401 })
  }

  const master = await prisma.master.findUnique({
    where: { userId: session.user.id },
  })
  if (!master) {
    return NextResponse.json(
      { error: "Non autorizzato" },
      { status: 403 }
    )
  }

  const body = await req.json()
  const { name, description, price, stock, images, isActive } = body

  try {
    const existing = await prisma.product.findUnique({ where: { id } })
    if (!existing || existing.masterId !== master.id) {
      return NextResponse.json(
        { error: "Prodotto non trovato o non tuo" },
        { status: 404 }
      )
    }

    const product = await prisma.product.update({
      where: { id },
      data: {
        name,
        description,
        price: parseFloat(price),
        stock: parseInt(stock || "0", 10),
        images: images || [],
        isActive: Boolean(isActive),
      },
    })

    return NextResponse.json({ success: true, product })
  } catch (error: any) {
    console.error("Errore PUT prodotto:", error)
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    )
  }
}

// DELETE /api/products/:id
export async function DELETE(req: Request) {
  const id = getIdFromRequest(req)

  if (!id || id === "undefined") {
    return NextResponse.json(
      { error: "ID prodotto non valido" },
      { status: 400 }
    )
  }

  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Non autenticato" }, { status: 401 })
  }

  const master = await prisma.master.findUnique({
    where: { userId: session.user.id },
  })
  if (!master) {
    return NextResponse.json(
      { error: "Non autorizzato" },
      { status: 403 }
    )
  }

  try {
    const existing = await prisma.product.findUnique({ where: { id } })
    if (!existing || existing.masterId !== master.id) {
      return NextResponse.json(
        { error: "Prodotto non trovato o non tuo" },
        { status: 404 }
      )
    }

    await prisma.product.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Errore DELETE prodotto:", error)
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    )
  }
}
