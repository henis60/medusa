"use client"

import { useTranslations } from "next-intl"
import Image from "next/image"

import LocalizedClientLink from "@modules/common/components/localized-client-link"

const LINKS: { href: string; label: string }[] = [
  { href: "/ready-to-wear", label: "Ready to Wear" },
  { href: "/made-to-measure", label: "Made to Measure" },
  { href: "/faq", label: "Întrebări frecvente" },
  { href: "/contact", label: "Contact" },
  { href: "/relatii-clienti", label: "Relații cu clienții" },
  { href: "/terms-of-use", label: "Termeni și condiții" },
  { href: "/privacy-policy", label: "Politica de confidențialitate" },
  { href: "/cookie-policy", label: "Politica de cookies" },
]

export default function HomepageFooter() {
  const t = useTranslations("home")
  return (
    <footer className="w-full bg-[#0D0D0D] border-t border-[rgba(201,168,76,0.15)]">
      <div className="content-container flex flex-col gap-6 py-10">
        <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2">
          <LocalizedClientLink
            href="/"
            className="font-display text-sm tracking-[0.12em] flex items-baseline gap-1.5"
          >
            <span className="text-[#E8D5A3] uppercase">The Hunter</span>
            <span className="italic text-hunter-gold uppercase">house</span>
          </LocalizedClientLink>

          <span className="font-serif italic text-xs text-hunter-gold/70">
            {t("Return of the Elegant Gentleman")}
          </span>
        </div>

        <nav className="flex flex-wrap gap-x-6 gap-y-2">
          {LINKS.map((link) => (
            <LocalizedClientLink
              key={link.href}
              href={link.href}
              className="font-sans text-[10px] uppercase tracking-[2px] text-[rgba(232,213,163,0.6)] hover:text-hunter-gold transition-colors"
            >
              {t(link.label)}
            </LocalizedClientLink>
          ))}
        </nav>

        <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3 pt-2 border-t border-[rgba(201,168,76,0.1)]">
          <div className="flex flex-wrap items-center gap-4">
            {/* Netopia partner brand requirement: payment badge. Footer bg
                is fixed dark (#0D0D0D, not theme-aware), so always use the
                dark/white-text variant. */}
            <Image
              src="/payments/netopia-badge-dark.png"
              alt="Plăți securizate cu Netopia Payments"
              width={1852}
              height={349}
              className="h-7 w-auto"
            />

            {/* Legally required (OUG/ANPC ADR regulation): SAL
                dispute-resolution pictogram on the homepage, linking
                externally to the ANPC SAL platform. */}
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
          </div>

          <span className="font-sans text-[9px] uppercase tracking-[3px] text-[rgba(232,213,163,0.4)]">
            © {new Date().getFullYear()} {t("Toate drepturile rezervate")}
          </span>
        </div>
      </div>
    </footer>
  )
}
