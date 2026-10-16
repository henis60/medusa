import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { backendBaseUrl } from "@lib/config"

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

  // Adresa rezolvată din config (privată pe server), nu cea publică: pe cea
  // publică, Cloudflare Access întorcea pagina de sign-in cu status 200.
  const backendUrl = backendBaseUrl
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

  // Un 200 nu garantează un PDF: orice proxy sau pagină de login poate răspunde
  // cu succes și cu HTML. Fără verificare, clientul primea un fișier „.pdf" care
  // nu se deschide. Semnătura unui PDF e „%PDF-" la început.
  const head = Buffer.from(pdfBuffer.slice(0, 5)).toString("latin1")
  if (head !== "%PDF-") {
    console.error(
      `invoice route: răspuns care nu e PDF pentru ${id} (${pdfBuffer.byteLength} B, ` +
        `content-type=${response.headers.get("content-type") ?? "-"})`
    )
    return NextResponse.json(
      { message: "Factura nu a putut fi descărcată acum. Încearcă din nou mai târziu." },
      { status: 502 }
    )
  }

  return new NextResponse(pdfBuffer, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="factura-${id}.pdf"`,
    },
  })
}
