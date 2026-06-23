"use client"

import Accordion from "./accordion"
import { HttpTypes } from "@medusajs/types"

type ProductTabsProps = {
  product: HttpTypes.StoreProduct
}

const ProductTabs = ({ product }: ProductTabsProps) => {
  const tabs = [
    ...(product.description ? [{
      label: "Descriere",
      component: <ProductDescriptionTab product={product} />,
    }] : []),
    {
      label: "Detalii produs",
      component: <ProductInfoTab product={product} />,
    },
    {
      label: "Livrare & Retururi",
      component: <ShippingInfoTab />,
    },
  ]

  return (
    <div className="w-full">
      <Accordion type="multiple">
        {tabs.map((tab, i) => (
          <Accordion.Item
            key={i}
            title={tab.label}
            headingSize="medium"
            value={tab.label}
          >
            {tab.component}
          </Accordion.Item>
        ))}
      </Accordion>
    </div>
  )
}

const ProductDescriptionTab = ({ product }: ProductTabsProps) => {
  return (
    <div className="py-4">
      <p className="font-serif text-base leading-relaxed text-[var(--theme-text-muted)] whitespace-pre-line">
        {product.description}
      </p>
    </div>
  )
}

const ProductInfoTab = ({ product }: ProductTabsProps) => {
  const rows = [
    { label: "Țară de origine", value: product.origin_country },
    { label: "Greutate", value: product.weight ? `${product.weight} g` : null },
    {
      label: "Dimensiuni",
      value:
        product.length && product.width && product.height
          ? `${product.length}L x ${product.width}W x ${product.height}H`
          : null,
    },
  ].filter((r) => !!r.value)

  if (rows.length === 0) return null

  return (
    <div className="py-4 flex flex-col gap-2.5">
      {rows.map((row) => (
        <div key={row.label} className="flex items-baseline justify-between gap-4">
          <span className="font-sans text-[9px] uppercase tracking-[3px] text-[var(--theme-text-muted)]">{row.label}</span>
          <span className="font-sans text-[10px] text-[var(--theme-text)]">{row.value}</span>
        </div>
      ))}
    </div>
  )
}

const ShippingInfoTab = () => {
  const items = [
    { label: "Livrare rapidă", desc: "Coletul ajunge în 3–5 zile lucrătoare la adresa ta sau la un punct de ridicare." },
    { label: "Schimburi simple", desc: "Nu se potrivește? Schimbăm produsul fără bătăi de cap." },
    { label: "Retururi ușoare", desc: "Returnează produsul și îți rambursăm banii — fără întrebări." },
  ]

  return (
    <div className="py-4 flex flex-col gap-4">
      {items.map((item) => (
        <div key={item.label}>
          <p className="font-sans text-[9px] uppercase tracking-[3px] text-[var(--theme-text-muted)] mb-1">{item.label}</p>
          <p className="font-sans text-[11px] leading-relaxed text-[var(--theme-text-muted)]">{item.desc}</p>
        </div>
      ))}
    </div>
  )
}

export default ProductTabs
