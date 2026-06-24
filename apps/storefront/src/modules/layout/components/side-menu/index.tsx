"use client"

import {
  Popover,
  PopoverPanel,
  Transition,
  TransitionChild,
} from "@headlessui/react"
import useToggleState from "@lib/hooks/use-toggle-state"
import { ArrowRightMini, XMark } from "@medusajs/icons"
import { MenuIcon } from "@modules/layout/components/nav-icons"
import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { clx } from "@modules/common/components/ui"
import { Fragment, useEffect, useState } from "react"
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
      <span>Theme</span>
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
  "font-sans text-[12px] uppercase tracking-[3px] text-[var(--theme-text-muted)] hover:text-hunter-gold transition-colors py-1 block"

function CollectionsMenuItem({
  collections,
  close,
}: {
  collections: HttpTypes.StoreCollection[]
  close: () => void
}) {
  return (
    <li>
      <span className="block py-2.5 font-display text-[26px] leading-[1] tracking-[0.02em] text-[var(--theme-text)]">
        Colecții
      </span>
      <ul className="flex flex-col gap-1 pl-3 pb-2">
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
    </li>
  )
}

function ShopMenuItem({
  categories,
  close,
}: {
  categories: HttpTypes.StoreProductCategory[]
  close: () => void
}) {
  return (
    <li>
      <LocalizedClientLink
        href="/store"
        className="block py-2.5 font-display text-[26px] leading-[1] tracking-[0.02em] text-[var(--theme-text)] hover:text-hunter-gold transition-colors"
        onClick={close}
      >
        Shop
      </LocalizedClientLink>
      <ul className="flex flex-col gap-1 pl-3 pb-2">
        {categories.map((c) => (
          <li key={c.id}>
            <LocalizedClientLink
              href={`/categories/${c.handle}`}
              className={subLinkClass}
              onClick={close}
            >
              {c.name}
            </LocalizedClientLink>
          </li>
        ))}
      </ul>
    </li>
  )
}

const SideMenu = ({
  regions,
  locales,
  currentLocale,
  collections,
  categories,
}: SideMenuProps) => {
  const languageToggleState = useToggleState()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <div className="h-full">
      <div className="flex items-center h-full">
        <Popover className="h-full flex">
          {({ open, close }) => (
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
                  <Transition show={open} as={Fragment}>
                    <TransitionChild
                      as={Fragment}
                      enter="transition ease-out duration-300"
                      enterFrom="opacity-0"
                      enterTo="opacity-100"
                      leave="transition ease-in duration-200"
                      leaveFrom="opacity-100"
                      leaveTo="opacity-0"
                    >
                      <div
                        className="fixed inset-0 z-[9010] bg-[rgba(6,10,8,0.55)] backdrop-blur-[2px] pointer-events-auto"
                        onClick={close}
                        data-testid="side-menu-backdrop"
                      />
                    </TransitionChild>

                    <TransitionChild
                      as={Fragment}
                      enter="transform transition ease-out duration-300"
                      enterFrom="opacity-0 -translate-x-full"
                      enterTo="opacity-100 translate-x-0"
                      leave="transform transition ease-in duration-200"
                      leaveFrom="opacity-100 translate-x-0"
                      leaveTo="opacity-0 -translate-x-full"
                    >
                      <PopoverPanel className="fixed inset-y-0 left-0 right-0 z-[9011] h-dvh sm:right-auto sm:w-[380px] will-change-transform">
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
                              onClick={close}
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
                                  className="flex items-center py-2.5 font-display text-[26px] leading-[1] tracking-[0.02em] text-[var(--theme-text)] transition-colors duration-200 hover:text-hunter-gold"
                                  onClick={close}
                                >
                                  Home
                                </LocalizedClientLink>
                              </li>

                              {/* Shop → categorii */}
                              {categories?.length ? (
                                <ShopMenuItem categories={categories} close={close} />
                              ) : (
                                <li>
                                  <LocalizedClientLink
                                    href="/store"
                                    className="flex items-center py-2.5 font-display text-[26px] leading-[1] tracking-[0.02em] text-[var(--theme-text)] transition-colors duration-200 hover:text-hunter-gold"
                                    onClick={close}
                                  >
                                    Shop
                                  </LocalizedClientLink>
                                </li>
                              )}

                              {/* Colecții */}
                              {!!collections?.length && (
                                <CollectionsMenuItem
                                  collections={collections}
                                  close={close}
                                />
                              )}
                            </ul>

                            {/* Secondary links — bottom */}
                            <ul className="flex flex-col mt-auto pt-10">
                              {[
                                { label: "Contact", href: "/contact" },
                                { label: "Contul meu", href: "/account" },
                                { label: "Relații cu clienții", href: "/relatii-clienti" },
                                { label: "Întrebări frecvente", href: "/faq" },
                              ].map(({ label, href }) => (
                                <li key={label}>
                                  <LocalizedClientLink
                                    href={href}
                                    className="flex items-center py-2 font-sans text-[13px] uppercase tracking-[3px] text-[var(--theme-text-muted)] transition-colors duration-200 hover:text-hunter-gold"
                                    onClick={close}
                                  >
                                    {label}
                                  </LocalizedClientLink>
                                </li>
                              ))}
                            </ul>
                          </nav>

                          {/* Footer */}
                          <div className="shrink-0 px-8 pb-8 pt-6 flex flex-col gap-y-4 border-t border-[var(--theme-border)]">
                            <ThemeToggle />
                            {!!locales?.length && (
                              <div
                                className="flex justify-between items-center text-[11px] uppercase tracking-[0.2em] text-[var(--theme-text-muted)]"
                                onMouseEnter={languageToggleState.open}
                                onMouseLeave={languageToggleState.close}
                              >
                                <LanguageSelect
                                  toggleState={languageToggleState}
                                  locales={locales}
                                  currentLocale={currentLocale}
                                />
                                <ArrowRightMini
                                  className={clx(
                                    "transition-transform duration-150",
                                    languageToggleState.state
                                      ? "-rotate-90"
                                      : ""
                                  )}
                                />
                              </div>
                            )}
                          </div>
                        </div>
                      </PopoverPanel>
                    </TransitionChild>
                  </Transition>,
                  document.body
                )}
            </>
          )}
        </Popover>
      </div>
    </div>
  )
}

export default SideMenu
