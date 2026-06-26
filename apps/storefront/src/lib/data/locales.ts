"use server"

export type Locale = {
  code: string
  name: string
}

/**
 * Available locales for the language switcher.
 * Hardcoded for now — there is no backend i18n module, so switching only
 * sets the locale cookie/cart locale and does not translate content yet.
 */
const LOCALES: Locale[] = [
  { code: "ro", name: "Română" },
  { code: "en", name: "English" },
]

export const listLocales = async (): Promise<Locale[] | null> => {
  return LOCALES
}
