import { NextResponse } from "next/server"
import { PrismaClient, OrderStatus } from "@prisma/client"
import { auth } from "@/auth"

const prisma = new PrismaClient()

export async function POST() {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json({ error: "Non autenticato" }, { status: 401 })
    }

    if (session.user.role !== "UTENTEBASIC") {
      return NextResponse.json(
        { error: "Solo gli utenti Basic possono fare il checkout" },
        { status: 403 }
      )
    }

    // Profilo cliente + carrello + prodotti
    const basicProfile = await prisma.basicProfile.findUnique({
      where: { userId: session.user.id },
      include: {
        master: true,
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

    if (!basicProfile) {
      return NextResponse.json(
        { error: "Profilo cliente non trovato" },
        { status: 400 }
      )
    }

    const cart = basicProfile.cart

    if (!cart || cart.items.length === 0) {
      return NextResponse.json(
        { error: "Il carrello è vuoto" },
        { status: 400 }
      )
    }

    // Calcolo totale
    const items = cart.items.map((item) => {
      return {
        productId: item.productId,
        quantity: item.quantity,
        price: item.product.price,
      }
    })

    const total = items.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0
    )

    // Creiamo l'ordine (per ora lo segniamo come già pagato: simulazione)
    const order = await prisma.order.create({
      data: {
        basicProfileId: basicProfile.id,
        masterId: basicProfile.masterId,
        total,
        status: OrderStatus.PAID, // simuliamo pagamento riuscito
      },
    })

    // Creiamo le righe ordine
    await prisma.orderItem.createMany({
      data: items.map((item) => ({
        orderId: order.id,
        productId: item.productId,
        quantity: item.quantity,
        price: item.price,
      })),
    })

    // Svuotiamo il carrello (cancelliamo solo le righe)
    await prisma.cartItem.deleteMany({
      where: { cartId: cart.id },
    })

    return NextResponse.json({
      success: true,
      orderId: order.id,
    })
  } catch (error) {
    console.error("Errore checkout:", error)
    return NextResponse.json(
      { error: "Errore interno durante il checkout" },
      { status: 500 }
    )
  }
}
