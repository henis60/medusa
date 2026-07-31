"use client"

import { useTranslations } from "next-intl"
import Image from "next/image"

import LocalizedClientLink from "@modules/common/components/localized-client-link"

export default function HomepageFooter() {
  const t = useTranslations("home")
  return (
    <footer className="w-full bg-[#0D0D0D] border-t border-[rgba(201,168,76,0.15)]">
      <div
        className="flex flex-wrap items-center justify-between gap-x-6 gap-y-1 py-3"
        style={{ padding: "12px clamp(20px, 6vw, 80px)" }}
      >
        <LocalizedClientLink
          href="/"
          className="font-display text-sm tracking-[0.12em] flex items-baseline gap-1.5"
        >
          <span className="text-[#E8D5A3] uppercase">The Hunter</span>
          <span className="italic text-hunter-gold uppercase">house</span>
        </LocalizedClientLink>

        <span className="hidden medium:inline font-serif italic text-xs text-hunter-gold/70">
          {t("Return of the Elegant Gentleman")}
        </span>

        {/* Legally required (OUG/ANPC ADR regulation): SAL dispute-resolution
            pictogram on the homepage, linking externally to the ANPC SAL
            platform. */}
        <a
          href="https://reclamatiisal.anpc.ro"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Soluționarea Alternativă a Litigiilor - ANPC"
        >
          <Image
            src="/payments/anpc-sal-pictograma.png"
            alt="ANPC - Soluționarea Alternativă a Litigiilor"
            width={201}
            height={50}
            className="h-[38px] w-auto"
          />
        </a>

        <span className="font-sans text-[9px] uppercase tracking-[3px] text-[rgba(232,213,163,0.4)]">
          © {new Date().getFullYear()} {t("Toate drepturile rezervate")}
        </span>
      </div>
    </footer>
  )
}
