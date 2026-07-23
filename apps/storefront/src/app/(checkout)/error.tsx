"use client"

import ErrorContent from "@modules/common/components/error-content"
import { isConnectionError } from "@lib/util/is-connection-error"

// Error boundary pentru rutele de checkout (inclusiv return-ul Netopia).
// Fără acest boundary, orice eroare client necaptată (ex. o cursă între
// redirect-ul extern și un refresh RSC pe mobil) golea complet aplicația cu
// pagina generică "a client-side exception has occurred". Aici o transformăm
// într-o stare recuperabilă — plata în sine e procesată server-to-server (IPN).
export default function CheckoutError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  if (isConnectionError(error)) {
    return (
      <ErrorContent
        reset={reset}
        title="Magazin temporar indisponibil"
        description="Nu am putut contacta serverul chiar acum. Dacă ai finalizat deja plata, comanda ta este în siguranță. Te rugăm să revii peste câteva minute."
        homeHref="/cart"
        homeLabel="Înapoi la coș"
      />
    )
  }

  return (
    <ErrorContent
      reset={reset}
      description="Nu-ți face griji — dacă ai finalizat plata, comanda ta este în siguranță și vei primi un email de confirmare. Poți reîncerca sau reveni la coș."
      homeHref="/cart"
      homeLabel="Înapoi la coș"
    />
  )
}
