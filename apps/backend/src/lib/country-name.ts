/**
 * Numele țării, în română și fără diacritice, pentru documentele fiscale.
 *
 * Medusa ține `country_code` cu litere mici („ro"), iar trimis ca atare ajungea
 * pe factură ca „ro". Exemplele din documentația Oblio folosesc nume fără
 * diacritice („Constanta"), așa că: „ro" → „Romania", „fr" → „Franta".
 */
export function countryNameRo(code: string | null | undefined): string {
  const iso = (code ?? "").trim().toUpperCase()
  if (!iso) return "Romania"

  try {
    const name = new Intl.DisplayNames(["ro"], { type: "region" }).of(iso)
    // `of` întoarce codul însuși când nu cunoaște țara.
    if (name && name !== iso) {
      return name.normalize("NFD").replace(/[̀-ͯ]/g, "")
    }
  } catch {
    // ICU indisponibil sau cod invalid — cădem pe cod, mai jos.
  }
  return iso
}
