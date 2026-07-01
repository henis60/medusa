import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import Anthropic from "@anthropic-ai/sdk"

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

type GenerateProductBody = {
  imageUrl: string
  imageUrls?: string[]  // all images — used to detect multiple color variants
  material?: string
  colors?: string[]
  sizes?: string[]
  price_ron?: number
  extraInstructions?: string
}

type AIProductResult = {
  title: string
  subtitle?: string
  description: string
  handle: string
  seo_title: string
  seo_description: string
  category: string | null
  collection: string | null
  tags: string[]
  material: string | null
  price_ron: number | null
  colors: string[]
  colors_hex: string[]
  sizes: string[]
  image_order: number[]
  variant_images: Record<string, number[]>
}

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const { imageUrl, imageUrls: allImageUrls, material, colors, sizes, price_ron, extraInstructions } = req.body as GenerateProductBody
  const priceHint = price_ron ?? null

  if (!imageUrl) {
    return res.status(400).json({ error: "imageUrl is required" })
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return res.status(500).json({ error: "ANTHROPIC_API_KEY not configured" })
  }

  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)

  const [{ data: categoriesData }, { data: tagsData }, { data: collectionsData }] = await Promise.all([
    query.graph({ entity: "product_category", fields: ["id", "name"] }),
    query.graph({ entity: "product_tag", fields: ["id", "value"] }),
    query.graph({ entity: "product_collection", fields: ["id", "title"] }),
  ])

  const categoryNames = categoriesData.map((c: any) => c.name)
  const tagValues = tagsData.map((t: any) => t.value)
  const collectionTitles = collectionsData.map((c: any) => c.title)

  const materialNote = material
    ? `Materialul principal al produsului este: ${material}. Menționează-l în descriere și returnează-l în câmpul "material".`
    : `Dacă poți identifica materialul din imagine, returnează-l în câmpul "material" (ex: "Lână merinos", "Argint 925", "Tweed", "Bumbac piqué"). Dacă nu poți determina, returnează null.`

  const tagsNote = tagValues.length
    ? `- "tags": array cu 2-5 taguri relevante alese exclusiv din această listă: ${JSON.stringify(tagValues)}. Array gol [] dacă niciunul nu se potrivește.`
    : `- "tags": array gol []`

  // ── Fetch all images ───────────────────────────────────────────────────────
  const urlsToFetch = (allImageUrls?.length ?? 0) > 1 ? allImageUrls! : [imageUrl]
  const fetchedImages: Anthropic.ImageBlockParam[] = []
  for (const url of urlsToFetch) {
    const resp = await fetch(url)
    if (!resp.ok) continue
    const buffer = await resp.arrayBuffer()
    const base64 = Buffer.from(buffer).toString("base64")
    const ct = resp.headers.get("content-type") || "image/webp"
    fetchedImages.push({ type: "image", source: { type: "base64", media_type: ct as any, data: base64 } })
  }
  if (!fetchedImages.length) {
    return res.status(400).json({ error: "Could not fetch image from URL" })
  }

  const n = fetchedImages.length
  const needColorDetection = !colors?.length
  const colorOrderHint = (colors?.length ?? 0) > 1
    ? ` Ordinea grupelor: ${JSON.stringify(colors)}.`
    : needColorDetection
    ? " Grupează grupele în ordinea în care apar culorile în câmpul \"colors\" returnat."
    : ""

  const colorsField = needColorDetection
    ? `- "colors": culorile PRODUSULUI (ignoră ambalaj/suport/fundal). Butoniere → culoarea pietrei centrale (dacă există), altfel culoarea generală; cravate → culoarea de fundal a modelului; orice alt produs → culoarea dominantă. EXCLUSIV culori de bază simple: Negru, Alb, Gri, Maro, Bej, Crem, Roșu, Albastru, Navy, Verde, Galben, Portocaliu, Mov, Roz, Auriu, Argintiu — fără modificatori. O singură culoare dacă toate imaginile sunt același colorway; mai multe DOAR dacă există colorway-uri cu adevărat diferite. Fiecare culoare o singură dată, fără duplicate.
- "colors_hex": array paralel cu "colors" — codul hex dominant din imagine per culoare`
    : `- "colors": ${JSON.stringify(colors)} (furnizate — returnează exact)
- "colors_hex": array paralel cu "colors" — estimează hex-ul dominant din imagine per culoare`

  const imageFields = n > 1
    ? `- "image_order": toți ${n} indici (0-${n - 1}) reordonați — 1) grupare pe culoare,${colorOrderHint} 2) față/principal întâi în fiecare grup, apoi spate, detalii. Exact ${n} indici unici.
- "variant_images": obiect care mapează FIECARE culoare din "colors" la indicii imaginilor (0-${n - 1}) care arată acea culoare. Folosește exact numele culorilor din "colors". Indici în ordinea ORIGINALĂ. Ex pentru 4 imagini și ["Negru","Maro"]: {"Negru": [0, 2], "Maro": [1, 3]}. Dacă e o singură culoare, pune toate imaginile la ea.`
    : `- "image_order": [0]
- "variant_images": mapează culoarea la [0]`

  // ── Single Sonnet call — sees all images, does everything ──────────────────
  const colorsNote = needColorDetection
    ? "Nu menționa culori specifice în text — sunt gestionate ca variante separate."
    : `Culorile produsului sunt: ${JSON.stringify(colors)}. NU le menționa în text — sunt gestionate ca variante separate.`

  const prompt = `Ești un copywriter de lux pentru The Hunter House, un brand premium de modă masculină din România (stil elegant, inspirat din tradițiile vânătorești britanice). Folosești română literară corectă: articole hotărâte corecte (gulerul, nu "guleru"; mâneca, nu "mâneca"; nasturele, nu "nasturel"), fără forme colocviale sau greșeli gramaticale.

${n > 1 ? `Ai ${n} imagini ale aceluiași produs (indexate 0-${n - 1}).` : "Imaginea conține produsul de analizat."}
${colorsNote}
NU menționa mărimile (S, M, L, XL etc.) sau disponibilitatea pe mărimi în niciun text — sunt gestionate ca variante separate.
${materialNote}

Analizează produsul și returnează JSON cu exact aceste câmpuri:
- "title": titlu comercial scurt și elegant (max 60 caractere, în română, fără culori; termenii de modă internaționali sunt permisi: "business", "casual", "slim fit", "tweed" etc., ex: "Jachetă Tweed Business", "Costum Lână Slim Fit", "Butoni Medalion Argint")
- "subtitle": 1-2 propoziții, max 160 caractere, ton elegant, material și ocazie, fără culori. Ex: "Confecționat din lână merinos fină, alegerea perfectă pentru ocazii formale."
- "description": două părți într-un singur string (fără culori — sunt variante separate):
  1. paragraf narativ 2-3 propoziții, material/design/ocazie
  2. linie goală + bullet points cu specificații tehnice (material, finisaj, mecanism, ocazie), fiecare cu "• "
  NU menționa brand, etichetă, ambalaj, suport, suprafață, culori sau mărimi. Descrie exclusiv produsul.
  Format: "Descriere...\n\n• Specificație 1\n• Specificație 2"
- "handle": slug URL (lowercase, litere/cifre/cratimă, fără diacritice, ex: "jacheta-tweed-business")
- "seo_title": max 60 caractere, include brand sau categorie
- "seo_description": max 160 caractere, în română, atractiv
- "category": una din ${JSON.stringify(categoryNames)}, sau null
- "collection": ${collectionTitles.length ? `una din ${JSON.stringify(collectionTitles)}, sau null` : "null"}
${tagsNote}
- "material": ${material ? `"${material}" (furnizat, returnează exact)` : 'materialul detectat (ex: "Lână merinos", "Argint 925", "Tweed") sau null'}
- "price_ron": ${priceHint ? `${priceHint} (furnizat, returnează exact)` : "preț estimat RON pentru brand de lux: butoni 300-800, cravate 200-500, cămăși 600-1200, jachete 1500-4000, costume 2000-6000. Returnează număr întreg."}
- "sizes": ${sizes?.length ? `${JSON.stringify(sizes)} (furnizate, returnează exact)` : 'mărimile tipice dacă sunt relevante (ex: ["S","M","L","XL"] pentru haine, [] pentru accesorii universale)'}
${colorsField}
${imageFields}

Răspunde DOAR cu JSON valid, fără text suplimentar, fără markdown, fără backticks.${extraInstructions ? `\n\nInstrucțiuni suplimentare (prioritate maximă): ${extraInstructions}` : ""}`

  try {
    const message = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 2048,
      messages: [{ role: "user", content: [...fetchedImages, { type: "text", text: prompt }] }],
    })

    if (message.stop_reason === "max_tokens") {
      console.error("[AI] Response truncated at max_tokens — output incomplete")
    }

    const rawText = message.content[0]?.type === "text" ? message.content[0].text : ""
    let result: AIProductResult
    try {
      result = JSON.parse(rawText)
    } catch {
      const match = rawText.match(/\{[\s\S]*\}/)
      if (!match) {
        return res.status(500).json({ error: "AI returned invalid JSON", raw: rawText.slice(0, 500) })
      }
      try {
        result = JSON.parse(match[0])
      } catch {
        const truncated = message.stop_reason === "max_tokens"
        return res.status(500).json({
          error: truncated
            ? "Răspuns AI trunchiat (prea lung) — încearcă din nou sau cu mai puține imagini"
            : "AI returned malformed JSON",
          raw: rawText.slice(0, 500),
        })
      }
    }

    if (result.category && !categoryNames.includes(result.category)) result.category = null
    if (result.collection && !collectionTitles.includes(result.collection)) result.collection = null
    if (!Array.isArray(result.tags)) result.tags = []
    result.tags = result.tags.filter((t: string) => tagValues.includes(t))
    if (!Array.isArray(result.sizes)) result.sizes = []
    if (typeof result.price_ron !== "number" || result.price_ron <= 0) result.price_ron = null

    // Colors: provided values override, else dedupe AI output
    if (colors?.length) {
      result.colors = colors
    } else {
      result.colors = Array.isArray(result.colors)
        ? [...new Set(result.colors.map((c: string) => c.trim()).filter(Boolean))]
        : []
    }
    if (!Array.isArray(result.colors_hex)) result.colors_hex = []
    result.colors_hex = result.colors.map((_: string, i: number) => result.colors_hex[i] ?? "")

    // image_order: validate it's a permutation of [0..n-1]
    if (!Array.isArray(result.image_order) || result.image_order.length !== n) {
      result.image_order = Array.from({ length: n }, (_, i) => i)
    } else {
      const seen = new Set<number>()
      const ok = result.image_order.every((i: number) => typeof i === "number" && i >= 0 && i < n && !seen.has(i) && (seen.add(i), true))
      if (!ok) result.image_order = Array.from({ length: n }, (_, i) => i)
    }

    // variant_images: validate indices
    const cleanVariantImages: Record<string, number[]> = {}
    if (result.variant_images && typeof result.variant_images === "object" && !Array.isArray(result.variant_images)) {
      for (const [color, idxs] of Object.entries(result.variant_images)) {
        if (Array.isArray(idxs)) {
          const valid = (idxs as any[]).filter((i) => typeof i === "number" && i >= 0 && i < n)
          if (valid.length) cleanVariantImages[color] = [...new Set(valid)]
        }
      }
    }
    result.variant_images = cleanVariantImages

    console.log("[AI] result:", JSON.stringify({ colors: result.colors, sizes: result.sizes, price_ron: result.price_ron, images: n }, null, 2))
    return res.json({ result })
  } catch (error: any) {
    console.error("Anthropic API error:", error)
    return res.status(500).json({ error: error.message || "AI generation failed" })
  }
}
