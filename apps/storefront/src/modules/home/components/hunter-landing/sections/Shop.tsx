"use client"

import { useEffect, useRef, useState } from "react"
import { useParams } from "next/navigation"
import { Link } from "@i18n/navigation"
import { m as motion } from "framer-motion"
import { useTranslations } from "next-intl"

type Product = {
  id: number
  images: string[]
  label: string
  hasStore: boolean
  handle: string
}

function ShopCard({
  product,
  countryCode,
}: {
  product: Product
  countryCode: string
}) {
  const t = useTranslations("home")
  const [current, setCurrent] = useState(0)
  const [fav, setFav] = useState(false)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  function show(i: number) {
    setCurrent(
      ((i % product.images.length) + product.images.length) %
        product.images.length
    )
  }
  function startTimer(idx = current) {
    stopTimer()
    timerRef.current = setInterval(
      () => setCurrent((c) => (c + 1) % product.images.length),
      5500
    )
  }
  function stopTimer() {
    if (timerRef.current) clearInterval(timerRef.current)
    timerRef.current = null
  }

  useEffect(() => {
    startTimer()
    return stopTimer
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Link
      href={`/produs/${product.handle}`}
      className="sg-card"
      style={{ display: "block", textDecoration: "none" }}
      onMouseEnter={stopTimer}
      onMouseLeave={() => startTimer(current)}
    >
      <div className="sg-stage">
        {product.images.map((img, idx) => (
          <motion.img
            key={idx}
            className="sg-img"
            src={img}
            alt=""
            width={product.hasStore ? "640" : "600"}
            height="800"
            loading="lazy"
            animate={{ opacity: idx === current ? 1 : 0 }}
            transition={{ duration: 1.8, ease: "easeInOut" }}
          />
        ))}
      </div>
      <div className="sg-dots">
        {product.images.map((_, idx) => (
          <button
            key={idx}
            className={`sg-dot${idx === current ? " is-active" : ""}`}
            type="button"
            aria-label={`${t("Imagine")} ${idx + 1}`}
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              show(idx)
              startTimer(idx)
            }}
          ></button>
        ))}
      </div>
      <button
        className={`sg-fav${fav ? " is-on" : ""}`}
        type="button"
        aria-label={fav ? t("Elimină din wishlist") : t("Adaugă în wishlist")}
        aria-pressed={fav}
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          setFav((v) => !v)
        }}
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 20.5C7 17 3 13.6 3 9.6 3 7 5 5.2 7.4 5.2c1.6 0 3 .8 3.9 2.1.9-1.3 2.3-2.1 3.9-2.1C19 5.2 21 7 21 9.6c0 4-4 7.4-9 10.9z" />
        </svg>
      </button>
    </Link>
  )
}

export default function Shop() {
  const t = useTranslations("home")
  const params = useParams()
  const countryCode = (params?.countryCode as string) || "ro"

  const imageLabel = t("Imagine")

  const products: Product[] = [
    {
      id: 1,
      images: [
        "/landing/images/products/product-1a.webp",
        "/landing/images/products/product-1b.webp",
      ],
      label: imageLabel,
      hasStore: false,
      handle: "estate-hunting-jacket",
    },
    {
      id: 2,
      images: [
        "/landing/images/products/product-2a.webp",
        "/landing/images/products/product-2b.webp",
      ],
      label: imageLabel,
      hasStore: false,
      handle: "vanatoare-overcoat",
    },
    {
      id: 3,
      images: [
        "/landing/images/products/product-3a.webp",
        "/landing/images/products/product-3b.webp",
      ],
      label: imageLabel,
      hasStore: false,
      handle: "highland-tweed-trousers",
    },
    {
      id: 4,
      images: [
        "/landing/images/products/suit-1.webp",
        "/landing/images/products/suit-2.webp",
      ],
      label: imageLabel,
      hasStore: true,
      handle: "caledonian-suit",
    },
  ]

  const categories = t.raw("categories") as string[]

  return (
    <section className="section shop-sec" id="shop">
      <div className="section-inner">
        <div className="shop-header">
          <div className="kicker rv">
            {t("Online Shop")}
          </div>
          <h2 className="shop-hl rv">
            {t("Cămăși")} <br />
            {t("și")} <em>{t("accesorii")}</em>
          </h2>
          <p className="shop-sub rv">
            {t("Disponibile online începând cu 1 august 2026")}
          </p>
        </div>

        <div className="shop-cats rv" data-rv-delay="0.1">
          {categories.map((cat) => (
            <div key={cat} className="sc">
              {cat}
            </div>
          ))}
        </div>

        <div className="shop-grid rv" data-rv-delay="0.15">
          {products.map((product) => (
            <ShopCard
              key={product.id}
              product={product}
              countryCode={countryCode}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
