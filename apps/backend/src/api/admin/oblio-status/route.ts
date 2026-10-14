import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"

/**
 * Starea integrării Oblio, pentru widget-ul din admin.
 *
 * Panoul de admin e un bundle Vite și nu poate citi variabilele de mediu ale
 * backend-ului, așa că eticheta „DRY RUN" se baza pe NODE_ENV-ul build-ului de
 * admin — fără nicio legătură cu Oblio. Afișa „DRY RUN" și când butonul emitea
 * facturi fiscale reale. Aici se citește exact variabila pe care o folosesc
 * pașii de facturare.
 *
 * Rută separată (nu /admin/oblio/[id]) ca să nu concureze cu segmentul dinamic.
 * Fiind sub /admin, e autentificată automat de Medusa.
 */
export async function GET(_req: MedusaRequest, res: MedusaResponse) {
  res.json({ dry_run: process.env.OBLIO_DRY_RUN === "true" })
}
