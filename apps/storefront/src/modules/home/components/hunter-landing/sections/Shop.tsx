"use client"

import { useEffect, useRef, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { motion } from "framer-motion"

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
      href={`/products/${product.handle}`}
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
            aria-label={`${product.label} ${idx + 1}`}
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
        aria-label={fav ? "Elimină de la favorite" : "Adaugă la favorite"}
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
  const params = useParams()
  const countryCode = (params?.countryCode as string) || "ro"

  const products: Product[] = [
    {
      id: 1,
      images: [
        "/landing/images/products/product-1a.webp",
        "/landing/images/products/product-1b.webp",
      ],
      label: "Imagine",
      hasStore: false,
      handle: "estate-hunting-jacket",
    },
    {
      id: 2,
      images: [
        "/landing/images/products/product-2a.webp",
        "/landing/images/products/product-2b.webp",
      ],
      label: "Imagine",
      hasStore: false,
      handle: "vanatoare-overcoat",
    },
    {
      id: 3,
      images: [
        "/landing/images/products/product-3a.webp",
        "/landing/images/products/product-3b.webp",
      ],
      label: "Imagine",
      hasStore: false,
      handle: "highland-tweed-trousers",
    },
    {
      id: 4,
      images: [
        "/landing/images/products/suit-1.webp",
        "/landing/images/products/suit-2.webp",
      ],
      label: "Imagine",
      hasStore: true,
      handle: "caledonian-suit",
    },
  ]

  const categories = [
    "Plată securizată cu cardul",
    "Livrare în toată România",
    "Retur în termen de 14 zile",
    "Suport dedicat pentru comenzi",
  ]

  return (
    <section className="section shop-sec" id="shop">
      <div className="section-inner">
        <div className="shop-header">
          <div className="kicker rv">
            <span className="kicker-bar"></span>Online Shop
          </div>
          <h2 className="shop-hl rv">
            Cămăși <br />
            și <em>accesorii</em>
          </h2>
          <p className="shop-sub rv">
            Disponibile online începând cu 1 august 2026.
          </p>
        </div>

        <div className="shop-cats rv" style={{ transitionDelay: "0.1s" }}>
          {categories.map((cat) => (
            <div key={cat} className="sc">
              {cat}
            </div>
          ))}
        </div>

        <div className="shop-grid rv" style={{ transitionDelay: "0.15s" }}>
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
