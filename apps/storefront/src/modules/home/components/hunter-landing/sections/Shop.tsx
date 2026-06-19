"use client"

import { useParams } from "next/navigation"
import Link from "next/link"

export default function Shop() {
  const params = useParams()
  const countryCode = (params?.countryCode as string) || "ro"

  const products = [
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
          {products.map((product, idx) => (
            <Link key={product.id} href={`/${countryCode}/products/${product.handle}`} className="sg-card" style={{ display: "block", textDecoration: "none" }}>
              <div className="sg-stage">
                {product.images.map((img, imgIdx) => (
                  <img
                    key={imgIdx}
                    className={`sg-img ${imgIdx === 0 ? "is-active" : ""}`}
                    src={img}
                    alt=""
                    width={product.hasStore ? "640" : "600"}
                    height="800"
                    loading="lazy"
                  />
                ))}
              </div>
              <div className="sg-dots">
                {product.images.map((_, imgIdx) => (
                  <button
                    key={imgIdx}
                    className={`sg-dot ${imgIdx === 0 ? "is-active" : ""}`}
                    type="button"
                    aria-label={`${product.label} ${imgIdx + 1}`}
                  ></button>
                ))}
              </div>
              <button
                className="sg-fav"
                type="button"
                aria-label="Adaugă la favorite"
                aria-pressed="false"
              >
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M12 20.5C7 17 3 13.6 3 9.6 3 7 5 5.2 7.4 5.2c1.6 0 3 .8 3.9 2.1.9-1.3 2.3-2.1 3.9-2.1C19 5.2 21 7 21 9.6c0 4-4 7.4-9 10.9z" />
                </svg>
              </button>
              <button
                className={`sg-btn ${product.hasStore ? "sg-btn--store" : ""}`}
                type="button"
              >
                {product.hasStore ? "Disponibil în magazin" : "În curând"}
              </button>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
