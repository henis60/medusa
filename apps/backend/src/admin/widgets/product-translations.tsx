import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { DetailWidgetProps, HttpTypes } from "@medusajs/framework/types"
import { useMemo, useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Container, Heading, Text, Input, Textarea, Button, toast } from "@medusajs/ui"
import { sdk } from "../lib/client"

// Medusa's "Manage Translations" settings page deliberately hides
// product_option / product_option_value from its entity list (see
// dashboard's translatableEntities filter), even though the API and
// translation module fully support them — product_variant.title is the
// only product-related field it exposes. This widget fills that gap so
// color/size option values and variant titles can be translated without
// going through the AI product-generation flow (the only other place
// that writes these rows, via /admin/translations/batch).
const LOCALE = "en-GB"

type Row = {
  key: string
  label: string
  reference: string
  referenceId: string
  field: string
}

const ProductTranslationsWidget = ({
  data: product,
}: DetailWidgetProps<HttpTypes.AdminProduct>) => {
  const queryClient = useQueryClient()

  const { data: fullProduct, isLoading: loadingProduct } = useQuery({
    queryFn: () =>
      sdk.admin.product.retrieve(product.id, {
        fields:
          "id,title,subtitle,description,material,*options,*options.values,*variants",
      }),
    queryKey: ["product-translations-source", product.id],
  })

  const p = fullProduct?.product

  const rows: Row[] = useMemo(() => {
    if (!p) return []
    const out: Row[] = []
    out.push({ key: "product:title", label: "Titlu produs", reference: "product", referenceId: p.id, field: "title" })
    if (p.subtitle) out.push({ key: "product:subtitle", label: "Subtitlu", reference: "product", referenceId: p.id, field: "subtitle" })
    out.push({ key: "product:description", label: "Descriere", reference: "product", referenceId: p.id, field: "description" })
    if (p.material) out.push({ key: "product:material", label: "Material", reference: "product", referenceId: p.id, field: "material" })

    for (const opt of p.options ?? []) {
      for (const v of opt.values ?? []) {
        out.push({
          key: `product_option_value:${v.id}`,
          label: `${opt.title}: ${v.value}`,
          reference: "product_option_value",
          referenceId: v.id,
          field: "value",
        })
      }
    }

    for (const variant of p.variants ?? []) {
      out.push({
        key: `product_variant:${variant.id}`,
        label: `Variantă: ${variant.title}`,
        reference: "product_variant",
        referenceId: variant.id,
        field: "title",
      })
    }

    return out
  }, [p])

  const referenceIds = useMemo(
    () => Array.from(new Set(rows.map((r) => r.referenceId))),
    [rows]
  )

  const { data: translationsData, isLoading: loadingTranslations } = useQuery({
    queryFn: () =>
      sdk.admin.translation.list({
        reference_id: referenceIds,
        locale_code: LOCALE,
        limit: 1000,
      }),
    queryKey: ["product-translations-existing", product.id, referenceIds],
    enabled: referenceIds.length > 0,
  })

  // existing translation row per (reference, reference_id) — a row holds all
  // fields for that entity, so title/subtitle/description share one record.
  const existingByRef = useMemo(() => {
    const map = new Map<string, HttpTypes.AdminTranslation>()
    for (const t of translationsData?.translations ?? []) {
      map.set(`${t.reference}:${t.reference_id}`, t)
    }
    return map
  }, [translationsData])

  const [draft, setDraft] = useState<Record<string, string>>({})

  const valueFor = (row: Row) => {
    if (row.key in draft) return draft[row.key]
    const existing = existingByRef.get(`${row.reference}:${row.referenceId}`)
    return (existing?.translations?.[row.field] as string) ?? ""
  }

  const isDirty = rows.some((r) => r.key in draft)

  const saveMutation = useMutation({
    mutationFn: async () => {
      const create: Array<{
        reference: string
        reference_id: string
        locale_code: string
        translations: Record<string, string>
      }> = []
      const update: Array<{ id: string; translations: Record<string, string> }> = []

      // Group dirty rows by entity so multiple fields on the same entity
      // (e.g. product title + description) land in one translation record.
      const dirtyByEntity = new Map<string, Row[]>()
      for (const row of rows) {
        if (!(row.key in draft)) continue
        const entityKey = `${row.reference}:${row.referenceId}`
        const list = dirtyByEntity.get(entityKey) ?? []
        list.push(row)
        dirtyByEntity.set(entityKey, list)
      }

      for (const [entityKey, entityRows] of dirtyByEntity) {
        const existing = existingByRef.get(entityKey)
        const fields: Record<string, string> = { ...(existing?.translations as Record<string, string> ?? {}) }
        for (const row of entityRows) {
          fields[row.field] = draft[row.key]
        }
        if (existing) {
          update.push({ id: existing.id, translations: fields })
        } else {
          const [reference, referenceId] = [entityRows[0].reference, entityRows[0].referenceId]
          create.push({ reference, reference_id: referenceId, locale_code: LOCALE, translations: fields })
        }
      }

      return sdk.admin.translation.batch({ create, update })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["product-translations-existing", product.id] })
      setDraft({})
      toast.success("Traduceri salvate")
    },
    onError: (err: any) => {
      toast.error(err?.message || "Salvarea traducerilor a eșuat")
    },
  })

  if (loadingProduct || loadingTranslations) {
    return (
      <Container className="px-6 py-4">
        <Text size="small" className="text-ui-fg-subtle">
          Se încarcă traducerile…
        </Text>
      </Container>
    )
  }

  return (
    <Container className="divide-y p-0">
      <div className="flex items-center justify-between px-6 py-4">
        <Heading level="h2">Traduceri (English)</Heading>
        <Button
          size="small"
          onClick={() => saveMutation.mutate()}
          disabled={!isDirty || saveMutation.isPending}
          isLoading={saveMutation.isPending}
        >
          Salvează
        </Button>
      </div>
      <div className="flex flex-col gap-y-4 px-6 py-4">
        {rows.map((row) => (
          <div key={row.key} className="flex flex-col gap-y-1">
            <Text size="small" weight="plus">
              {row.label}
            </Text>
            {row.field === "description" ? (
              <Textarea
                value={valueFor(row)}
                onChange={(e) => setDraft((d) => ({ ...d, [row.key]: e.target.value }))}
                rows={3}
              />
            ) : (
              <Input
                value={valueFor(row)}
                onChange={(e) => setDraft((d) => ({ ...d, [row.key]: e.target.value }))}
              />
            )}
          </div>
        ))}
      </div>
    </Container>
  )
}

export const config = defineWidgetConfig({
  zone: "product.details.after",
})

export default ProductTranslationsWidget
