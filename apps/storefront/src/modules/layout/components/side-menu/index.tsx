"use client"

import { Popover, PopoverPanel } from "@headlessui/react"
import { AnimatePresence, motion } from "framer-motion"
import { XMark } from "@medusajs/icons"
import { MenuIcon } from "@modules/layout/components/nav-icons"
import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { clx } from "@modules/common/components/ui"
import { useEffect, useState } from "react"
import { createPortal } from "react-dom"
import { useTheme } from "next-themes"
import LanguageSelect from "../language-select"
import { Locale } from "@lib/data/locales"

type SideMenuProps = {
  regions: HttpTypes.StoreRegion[] | null
  locales: Locale[] | null
  currentLocale: string | null
  collections?: HttpTypes.StoreCollection[]
  categories?: HttpTypes.StoreProductCategory[]
}

type ScrollGuardProps = {
  open: boolean
}

const SideMenuScrollGuard = ({ open }: ScrollGuardProps) => {
  useEffect(() => {
    if (!open) return

    const allowSelector = '[data-scroll-lock-allow="true"]'
    const isAllowedTarget = (target: EventTarget | null) =>
      target instanceof HTMLElement && !!target.closest(allowSelector)

    const onWheel = (e: WheelEvent) => {
      if (!isAllowedTarget(e.target)) e.preventDefault()
    }
    const onTouchMove = (e: TouchEvent) => {
      if (!isAllowedTarget(e.target)) e.preventDefault()
    }
    const onKeyDown = (e: KeyboardEvent) => {
      const scrollKeys = [
        "ArrowUp",
        "ArrowDown",
        "PageUp",
        "PageDown",
        "Home",
        "End",
        " ",
      ]
      if (
        scrollKeys.includes(e.key) &&
        !isAllowedTarget(document.activeElement)
      )
        e.preventDefault()
    }

    window.addEventListener("wheel", onWheel, { passive: false })
    window.addEventListener("touchmove", onTouchMove, { passive: false })
    window.addEventListener("keydown", onKeyDown)
    return () => {
      window.removeEventListener("wheel", onWheel)
      window.removeEventListener("touchmove", onTouchMove)
      window.removeEventListener("keydown", onKeyDown)
    }
  }, [open])

  return null
}

function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  if (!mounted) return null

  const isDark = resolvedTheme === "dark"

  return (
    <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.2em] text-[var(--theme-text-muted)]">
      <span>Temă</span>
      <div className="flex items-center gap-3">
        {(["light", "system", "dark"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTheme(t)}
            className={clx(
              "transition-colors capitalize",
              theme === t
                ? "text-hunter-gold"
                : "text-[var(--theme-text-muted)] hover:text-[var(--theme-text)]"
            )}
          >
            {t}
          </button>
        ))}
      </div>
    </div>
  )
}

const subLinkClass =
  "block py-3.5 font-display text-[22px] leading-[1] tracking-[0.02em] text-[var(--theme-text)] hover:text-hunter-gold transition-colors"

type SubmenuKey = "rtw" | "accesorii" | "equestrian" | "hunter"

const STYLE_GUIDES = [
  { label: "Wedding Season", href: "/world-of-the-hunter/wedding-season" },
  { label: "Shooting Wear", href: "/world-of-the-hunter/shooting-wear" },
]

function MenuTrigger({ label, onOpen }: { label: string; onOpen: () => void }) {
  return (
    <li>
      <button
        type="button"
        onClick={onOpen}
        className="w-full flex items-center justify-between py-3.5 font-display text-[22px] leading-[1] tracking-[0.02em] text-[var(--theme-text)] transition-colors duration-200 hover:text-hunter-gold"
      >
        <span>{label}</span>
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-[var(--theme-text-muted)]"
          aria-hidden="true"
        >
          <polyline points="9 6 15 12 9 18" />
        </svg>
      </button>
    </li>
  )
}

function SubmenuHeader({
  title,
  onBack,
}: {
  title: string
  onBack: () => void
}) {
  return (
    <div className="flex items-center justify-between px-8 h-16 border-b border-[var(--theme-border)] shrink-0">
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-2 font-sans text-[10px] uppercase tracking-[0.3em] text-[var(--theme-text-muted)] hover:text-[var(--theme-text)] transition-colors"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <polyline points="15 6 9 12 15 18" />
        </svg>
        Înapoi
      </button>
      <span className="font-sans text-[10px] uppercase tracking-[0.3em] text-[var(--theme-text-muted)]">
        {title}
      </span>
    </div>
  )
}

function ReadyToWearSubmenu({
  categories,
  collections,
  onBack,
  close,
}: {
  categories: HttpTypes.StoreProductCategory[]
  collections: HttpTypes.StoreCollection[]
  onBack: () => void
  close: () => void
}) {
  return (
    <div className="flex flex-col h-full">
      <SubmenuHeader title="Ready to Wear" onBack={onBack} />
      <nav className="flex-1 px-8 pt-8 pb-6 overflow-y-auto">
        <ul className="flex flex-col">
          <li>
            <LocalizedClientLink
              href="/store"
              className="block py-2.5 font-sans text-[11px] uppercase tracking-[3px] text-[var(--theme-text-muted)] hover:text-hunter-gold transition-colors"
              onClick={close}
            >
              Toate produsele
            </LocalizedClientLink>
          </li>
          {categories
            .filter(
              (c) => !c.parent_category && c.name?.toLowerCase() !== "accesorii"
            )
            .map((c) => (
              <li key={c.id}>
                <LocalizedClientLink
                  href={`/store?category=${c.id}`}
                  className={subLinkClass}
                  onClick={close}
                >
                  {c.name}
                </LocalizedClientLink>
              </li>
            ))}
          {collections.map((c) => (
            <li key={c.id}>
              <LocalizedClientLink
                href={`/collections/${c.handle}`}
                className={subLinkClass}
                onClick={close}
              >
                {c.title}
              </LocalizedClientLink>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  )
}

function AccesoriiSubmenu({
  categories,
  onBack,
  close,
}: {
  categories: HttpTypes.StoreProductCategory[]
  onBack: () => void
  close: () => void
}) {
  const parent = categories.find((c) => c.name?.toLowerCase() === "accesorii")
  const subcategories = parent?.category_children ?? []

  return (
    <div className="flex flex-col h-full">
      <SubmenuHeader title="Accesorii" onBack={onBack} />
      <nav className="flex-1 px-8 pt-8 pb-6 overflow-y-auto">
        <ul className="flex flex-col">
          {parent && (
            <li>
              <LocalizedClientLink
                href={`/store?category=${parent.id}`}
                className="block py-2.5 font-sans text-[11px] uppercase tracking-[3px] text-[var(--theme-text-muted)] hover:text-hunter-gold transition-colors"
                onClick={close}
              >
                Toate accesoriile
              </LocalizedClientLink>
            </li>
          )}
          {subcategories.map((c) => (
            <li key={c.id}>
              <LocalizedClientLink
                href={`/store?category=${c.id}`}
                className={subLinkClass}
                onClick={close}
              >
                {c.name}
              </LocalizedClientLink>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  )
}

function EquestrianSubmenu({
  categories,
  onBack,
  close,
}: {
  categories: HttpTypes.StoreProductCategory[]
  onBack: () => void
  close: () => void
}) {
  const parent = categories.find((c) =>
    c.name?.toLowerCase().includes("equestrian")
  )
  const subcategories = parent?.category_children ?? []

  return (
    <div className="flex flex-col h-full">
      <SubmenuHeader title="Colecția Equestrian" onBack={onBack} />
      <nav className="flex-1 px-8 pt-8 pb-6 overflow-y-auto">
        <ul className="flex flex-col">
          {parent && (
            <li>
              <LocalizedClientLink
                href={`/store?category=${parent.id}`}
                className="block py-2.5 font-sans text-[11px] uppercase tracking-[3px] text-[var(--theme-text-muted)] hover:text-hunter-gold transition-colors"
                onClick={close}
              >
                Toate produsele
              </LocalizedClientLink>
            </li>
          )}
          {subcategories.map((c) => (
            <li key={c.id}>
              <LocalizedClientLink
                href={`/store?category=${c.id}`}
                className={subLinkClass}
                onClick={close}
              >
                {c.name}
              </LocalizedClientLink>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  )
}

function WorldOfTheHunterSubmenu({
  onBack,
  close,
}: {
  onBack: () => void
  close: () => void
}) {
  return (
    <div className="flex flex-col h-full">
      <SubmenuHeader title="World of the Hunter" onBack={onBack} />
      <nav className="flex-1 px-8 pt-8 pb-6 overflow-y-auto">
        <p className="font-sans text-[11px] uppercase tracking-[2.5px] text-[var(--theme-text-muted)] mb-3">
          Style Guides
        </p>
        <ul className="flex flex-col">
          {STYLE_GUIDES.map((g) => (
            <li key={g.href}>
              <LocalizedClientLink
                href={g.href}
                className={subLinkClass}
                onClick={close}
              >
                {g.label}
              </LocalizedClientLink>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  )
}

const SideMenu = ({
  regions,
  locales,
  currentLocale,
  collections,
  categories,
}: SideMenuProps) => {
  const [mounted, setMounted] = useState(false)
  const [activeSubmenu, setActiveSubmenu] = useState<SubmenuKey | null>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <div className="h-full">
      <div className="flex items-center h-full">
        <Popover className="h-full flex">
          {({ open, close }) => {
            const handleClose = () => {
              setActiveSubmenu(null)
              close()
            }
            return (
              <>
                <SideMenuScrollGuard open={open} />

                <div className="relative flex h-full">
                  <Popover.Button
                    data-testid="nav-menu-button"
                    aria-label="Menu"
                    className="relative h-full flex items-center transition-all ease-out duration-200 focus:outline-none hover:opacity-60"
                  >
                    <MenuIcon size={28} />
                  </Popover.Button>
                </div>

                {mounted &&
                  createPortal(
                    <AnimatePresence>
                      {open && (
                        <>
                          {/* Backdrop */}
                          <motion.div
                            key="backdrop"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.3, ease: "easeOut" }}
                            className="fixed inset-0 z-[9010] bg-[rgba(6,10,8,0.55)] backdrop-blur-[2px] pointer-events-auto"
                            onClick={handleClose}
                            data-testid="side-menu-backdrop"
                          />

                          {/* Panel */}
                          <motion.div
                            key="panel"
                            initial={{ x: "-100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "-100%" }}
                            transition={{
                              duration: 0.42,
                              ease: [0.22, 1, 0.36, 1],
                            }}
                            className="fixed inset-y-0 left-0 right-0 z-[9011] h-dvh sm:right-auto sm:w-[380px] will-change-transform"
                          >
                            <PopoverPanel
                              static
                              className="h-full relative overflow-hidden"
                            >
                              <div
                                data-scroll-lock-allow="true"
                                data-testid="nav-menu-popup"
                                className="flex flex-col h-full overflow-y-auto overscroll-contain bg-[var(--theme-bg)] shadow-2xl"
                              >
                                {/* Header */}
                                <div className="flex items-center justify-between px-8 h-16 border-b border-[var(--theme-border)] shrink-0">
                                  <span className="font-sans text-[10px] uppercase tracking-[0.3em] text-[var(--theme-text-muted)]">
                                    Menu
                                  </span>
                                  <button
                                    data-testid="close-menu-button"
                                    onClick={handleClose}
                                    aria-label="Close menu"
                                    className="inline-flex h-12 w-12 items-center justify-end text-[var(--theme-text-muted)] hover:text-[var(--theme-text)] transition-colors"
                                  >
                                    <XMark />
                                  </button>
                                </div>

                                {/* Navigation */}
                                <nav className="flex-1 px-8 pt-8 pb-6 flex flex-col">
                                  {/* Primary group */}
                                  <ul className="flex flex-col">
                                    <li>
                                      <LocalizedClientLink
                                        href="/"
                                        className="flex items-center py-3.5 font-display text-[22px] leading-[1] tracking-[0.02em] text-[var(--theme-text)] transition-colors duration-200 hover:text-hunter-gold"
                                        onClick={handleClose}
                                      >
                                        Home
                                      </LocalizedClientLink>
                                    </li>

                                    {/* Ready to Wear → submeniu */}
                                    <MenuTrigger
                                      label="Ready to Wear"
                                      onOpen={() => setActiveSubmenu("rtw")}
                                    />

                                    {/* Accesorii The Hunter → submeniu */}
                                    <MenuTrigger
                                      label="Accesorii The Hunter"
                                      onOpen={() =>
                                        setActiveSubmenu("accesorii")
                                      }
                                    />

                                    {/* Colecția Equestrian → submeniu */}
                                    <MenuTrigger
                                      label="Colecția Equestrian"
                                      onOpen={() =>
                                        setActiveSubmenu("equestrian")
                                      }
                                    />

                                    {/* World of The Hunter → submeniu */}
                                    <MenuTrigger
                                      label="World of The Hunter"
                                      onOpen={() => setActiveSubmenu("hunter")}
                                    />

                                    <li>
                                      <LocalizedClientLink
                                        href="/programare"
                                        className="flex items-center py-3.5 font-display text-[22px] leading-[1] tracking-[0.02em] text-[var(--theme-text)] transition-colors duration-200 hover:text-hunter-gold"
                                        onClick={handleClose}
                                      >
                                        Made to Measure
                                      </LocalizedClientLink>
                                    </li>
                                  </ul>

                                  {/* Secondary links — bottom */}
                                  <ul className="flex flex-col mt-auto pt-10">
                                    {[
                                      { label: "Profil", href: "/account" },
                                      { label: "Contact", href: "/contact" },
                                      {
                                        label: "Relații cu clienții",
                                        href: "/relatii-clienti",
                                      },
                                      {
                                        label: "Întrebări frecvente",
                                        href: "/faq",
                                      },
                                    ].map(({ label, href }) => (
                                      <li key={label}>
                                        <LocalizedClientLink
                                          href={href}
                                          className="flex items-center py-2 font-sans text-[13px] uppercase tracking-[3px] text-[var(--theme-text-muted)] transition-colors duration-200 hover:text-hunter-gold"
                                          onClick={handleClose}
                                        >
                                          {label}
                                        </LocalizedClientLink>
                                      </li>
                                    ))}
                                  </ul>
                                </nav>

                                {/* Footer */}
                                <div className="shrink-0 px-8 pb-8 pt-6 flex flex-col gap-y-4 border-t border-[var(--theme-border)]">
                                  {!!locales?.length && (
                                    <LanguageSelect
                                      locales={locales}
                                      currentLocale={currentLocale}
                                    />
                                  )}
                                  <ThemeToggle />
                                </div>
                              </div>

                              {/* Flyout submenu — slides in from the right */}
                              <AnimatePresence>
                                {activeSubmenu && (
                                  <motion.div
                                    key={activeSubmenu}
                                    initial={{ x: "100%" }}
                                    animate={{ x: 0 }}
                                    exit={{ x: "100%" }}
                                    transition={{
                                      duration: 0.38,
                                      ease: [0.22, 1, 0.36, 1],
                                    }}
                                    className="absolute inset-0 z-10 bg-[var(--theme-bg)] shadow-2xl will-change-transform"
                                  >
                                    {activeSubmenu === "rtw" ? (
                                      <ReadyToWearSubmenu
                                        categories={categories ?? []}
                                        collections={collections ?? []}
                                        onBack={() => setActiveSubmenu(null)}
                                        close={handleClose}
                                      />
                                    ) : activeSubmenu === "accesorii" ? (
                                      <AccesoriiSubmenu
                                        categories={categories ?? []}
                                        onBack={() => setActiveSubmenu(null)}
                                        close={handleClose}
                                      />
                                    ) : activeSubmenu === "equestrian" ? (
                                      <EquestrianSubmenu
                                        categories={categories ?? []}
                                        onBack={() => setActiveSubmenu(null)}
                                        close={handleClose}
                                      />
                                    ) : (
                                      <WorldOfTheHunterSubmenu
                                        onBack={() => setActiveSubmenu(null)}
                                        close={handleClose}
                                      />
                                    )}
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </PopoverPanel>
                          </motion.div>
                        </>
                      )}
                    </AnimatePresence>,
                    document.body
                  )}
              </>
            )
          }}
        </Popover>
      </div>
    </div>
  )
}

export default SideMenu
