import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import { auth } from "@/auth"

const prisma = new PrismaClient()

// 🛒 GET /api/cart  → restituisce il carrello dell'utente Basic loggato
export async function GET() {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json({ error: "Non autenticato" }, { status: 401 })
    }

    if (session.user.role !== "UTENTEBASIC") {
      return NextResponse.json(
        { error: "Solo gli utenti Basic hanno un carrello" },
        { status: 403 }
      )
    }

    const basicProfile = await prisma.basicProfile.findUnique({
      where: { userId: session.user.id },
      include: {
        cart: {
          include: {
            items: {
              include: {
                product: true,
              },
            },
          },
        },
      },
    })

    if (!basicProfile || !basicProfile.cart) {
      return NextResponse.json({ items: [], total: 0 })
    }

    const items = basicProfile.cart.items.map((item) => {
      const subtotal = item.quantity * item.product.price

      return {
        id: item.id,
        productId: item.productId,
        name: item.product.name,
        price: item.product.price,
        quantity: item.quantity,
        subtotal,
        image: item.product.images?.[0] ?? null,
      }
    })

    const total = items.reduce((acc, item) => acc + item.subtotal, 0)

    return NextResponse.json({ items, total })
  } catch (error) {
    console.error("Errore GET cart:", error)
    return NextResponse.json(
      { error: "Errore interno" },
      { status: 500 }
    )
  }
}

// 🛒 POST /api/cart  → aggiunge un prodotto (o aumenta la quantità)
export async function POST(request: Request) {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json({ error: "Non autenticato" }, { status: 401 })
    }

    if (session.user.role !== "UTENTEBASIC") {
      return NextResponse.json(
        { error: "Solo gli utenti Basic possono usare il carrello" },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { productId, quantity } = body

    if (!productId) {
      return NextResponse.json(
        { error: "productId obbligatorio" },
        { status: 400 }
      )
    }

    const qty = !quantity || quantity <= 0 ? 1 : quantity

    // profilo Basic dell'utente loggato
    const basicProfile = await prisma.basicProfile.findUnique({
      where: { userId: session.user.id },
    })

    if (!basicProfile) {
      return NextResponse.json(
        { error: "Profilo cliente non trovato" },
        { status: 400 }
      )
    }

    // prodotto
    const product = await prisma.product.findUnique({
      where: { id: productId },
    })

    if (!product || !product.isActive) {
      return NextResponse.json(
        { error: "Prodotto non trovato o non attivo" },
        { status: 400 }
      )
    }

    // ⚠️ controllo importante:
    // il cliente può comprare solo dal Master a cui è collegato
    if (product.masterId !== basicProfile.masterId) {
      return NextResponse.json(
        { error: "Non puoi aggiungere prodotti di un altro negozio" },
        { status: 403 }
      )
    }

    // cart dell'utente (se non c'è lo creiamo)
    const cart = await prisma.cart.upsert({
      where: { basicProfileId: basicProfile.id },
      update: {},
      create: { basicProfileId: basicProfile.id },
    })

    // voce di carrello esistente?
    const existingItem = await prisma.cartItem.findUnique({
      where: {
        cartId_productId: {
          cartId: cart.id,
          productId: product.id,
        },
      },
    })

    if (existingItem) {
      // aumenta quantità
      await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: {
          quantity: existingItem.quantity + qty,
        },
      })
    } else {
      // crea nuova riga carrello
      await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId: product.id,
          quantity: qty,
        },
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Errore POST cart:", error)
    return NextResponse.json(
      { error: "Errore interno" },
      { status: 500 }
    )
  }
}
