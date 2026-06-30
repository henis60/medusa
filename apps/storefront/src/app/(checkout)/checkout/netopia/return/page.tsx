import { Suspense } from "react"
import NetopiaReturnClient from "./return-client"

export default function NetopiaReturnPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen text-sm">Se procesează plata…</div>}>
      <NetopiaReturnClient />
    </Suspense>
  )
}
