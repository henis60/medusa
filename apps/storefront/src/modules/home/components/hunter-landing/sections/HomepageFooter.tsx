"use client"

import { useTranslations } from "next-intl"
import Image from "next/image"

import LocalizedClientLink from "@modules/common/components/localized-client-link"

const NAV_LINKS: { href: string; label: string }[] = [
  { href: "/ready-to-wear", label: "Ready to Wear" },
  { href: "/made-to-measure", label: "Made to Measure" },
  { href: "/faq", label: "Întrebări frecvente" },
  { href: "/contact", label: "Contact" },
]

const LEGAL_LINKS: { href: string; label: string }[] = [
  { href: "/relatii-clienti", label: "Relații cu clienții" },
  { href: "/terms-of-use", label: "Termeni și condiții" },
  { href: "/privacy-policy", label: "Politica de confidențialitate" },
  { href: "/cookie-policy", label: "Politica de cookies" },
]

function FooterColumn({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-3">
      <p className="font-sans text-[9px] uppercase tracking-[4px] text-hunter-gold/60">
        {title}
      </p>
      <nav className="flex flex-col gap-2">{children}</nav>
    </div>
  )
}

function FooterLink({
  href,
  children,
}: {
  href: string
  children: React.ReactNode
}) {
  return (
    <LocalizedClientLink
      href={href}
      className="font-serif text-[15px] leading-none text-[rgba(232,213,163,0.75)] hover:text-hunter-gold transition-colors w-fit"
    >
      {children}
    </LocalizedClientLink>
  )
}

export default function HomepageFooter() {
  const t = useTranslations("home")
  return (
    <footer className="w-full bg-[#0D0D0D] border-t border-[rgba(201,168,76,0.15)]">
      <div className="content-container flex flex-col gap-12 pt-14 pb-8">
        <div className="grid grid-cols-2 small:grid-cols-4 gap-x-8 gap-y-10">
          {/* Brand — spans the full row on mobile, first column on desktop */}
          <div className="col-span-2 small:col-span-1 flex flex-col gap-3">
            <LocalizedClientLink
              href="/"
              className="font-display text-lg tracking-[0.12em] flex items-baseline gap-1.5"
            >
              <span className="text-[#E8D5A3] uppercase">The Hunter</span>
              <span className="italic text-hunter-gold uppercase">house</span>
            </LocalizedClientLink>
            <p className="font-serif italic text-sm text-hunter-gold/70 leading-snug max-w-[220px]">
              {t("Return of the Elegant Gentleman")}
            </p>
          </div>

          <FooterColumn title={t("Navigare")}>
            {NAV_LINKS.map((link) => (
              <FooterLink key={link.href} href={link.href}>
                {t(link.label)}
              </FooterLink>
            ))}
          </FooterColumn>

          <FooterColumn title={t("Legal")}>
            {LEGAL_LINKS.map((link) => (
              <FooterLink key={link.href} href={link.href}>
                {t(link.label)}
              </FooterLink>
            ))}
          </FooterColumn>

          <FooterColumn title={t("Plăți & conformitate")}>
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
              className="w-fit"
            >
              <Image
                src="/payments/anpc-sal-pictograma.png"
                alt="ANPC - Soluționarea Alternativă a Litigiilor"
                width={201}
                height={50}
                className="h-9 w-auto"
              />
            </a>
          </FooterColumn>
        </div>

        <div className="flex flex-col-reverse small:flex-row items-center small:items-end justify-between gap-4 pt-6 border-t border-[rgba(201,168,76,0.1)]">
          <span className="font-sans text-[9px] uppercase tracking-[3px] text-[rgba(232,213,163,0.4)]">
            © {new Date().getFullYear()} {t("Toate drepturile rezervate")}
          </span>
          <span className="font-sans text-[9px] uppercase tracking-[3px] text-[rgba(232,213,163,0.3)]">
            Baia Mare, România
          </span>
        </div>
      </div>
    </footer>
  )
}
