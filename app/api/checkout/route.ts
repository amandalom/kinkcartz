import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// STUB: records the order intent, does NOT capture payment.
// Wire a real processor here before going live — see README.
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { email, shipping, items } = body as {
    email: string;
    shipping: {
      name: string;
      address1: string;
      address2?: string;
      city: string;
      state: string;
      zip: string;
      country: string;
    };
    items: { productId: string; name: string; priceCents: number; quantity: number }[];
  };

  if (!email || !shipping?.name || !items?.length) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const totalCents = items.reduce((sum, i) => sum + i.priceCents * i.quantity, 0);

  const order = await prisma.order.create({
    data: {
      email,
      shippingName: shipping.name,
      shippingAddress1: shipping.address1,
      shippingAddress2: shipping.address2,
      shippingCity: shipping.city,
      shippingState: shipping.state,
      shippingZip: shipping.zip,
      shippingCountry: shipping.country,
      totalCents,
      items: {
        create: items.map((i) => ({
          productId: i.productId,
          name: i.name,
          priceCents: i.priceCents,
          quantity: i.quantity,
        })),
      },
    },
  });

  return NextResponse.json({ orderId: order.id });
}
