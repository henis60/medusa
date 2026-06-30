import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const cookieStore = await cookies()
  const token = cookieStore.get("_medusa_jwt")?.value

  if (!token) {
    return NextResponse.json({ error: "Neautentificat" }, { status: 401 })
  }

  const backendUrl =
    process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL ?? "http://localhost:9000"
  const publishableKey =
    process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY ?? ""

  const response = await fetch(`${backendUrl}/store/orders/${id}/invoice`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "x-publishable-api-key": publishableKey,
    },
  })

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ message: "Eroare la descărcarea facturii" }))
    return NextResponse.json(error, { status: response.status })
  }

  const pdfBuffer = await response.arrayBuffer()

  return new NextResponse(pdfBuffer, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="factura-${id}.pdf"`,
    },
  })
}
