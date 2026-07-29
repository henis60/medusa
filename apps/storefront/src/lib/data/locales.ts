"use server"

export type Locale = {
  code: string
  name: string
}

/**
 * Available locales for the language switcher. Keep in sync with
 * routing.locales in src/i18n/routing.ts.
 */
const LOCALES: Locale[] = [
  { code: "ro", name: "Română" },
  { code: "en", name: "English" },
]

export const listLocales = async (): Promise<Locale[] | null> => {
  return LOCALES
}
