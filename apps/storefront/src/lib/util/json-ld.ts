/**
 * Serializes a JSON-LD object for injection into a <script type="application/ld+json">.
 *
 * `JSON.stringify` alone is NOT safe here: it does not escape `<`, so a value
 * containing `</script>` (e.g. a product title written in the admin or produced
 * by the AI product generator) closes the tag early and everything after it is
 * parsed as HTML - stored XSS on every page rendering that product.
 *
 * We escape the characters that can break out of a script element, plus
 * U+2028/U+2029, which are valid inside JSON strings but are line terminators
 * in JavaScript and would otherwise produce a syntax error.
 *
 * The replacements are JSON unicode escapes, so the emitted text stays valid
 * JSON-LD while being inert to the HTML parser. Both the special characters and
 * the backslash are built from char codes, keeping this source pure ASCII so no
 * tooling can silently mangle an escape sequence.
 */
const BACKSLASH = String.fromCharCode(92)
const LINE_SEPARATOR = String.fromCharCode(0x2028)
const PARAGRAPH_SEPARATOR = String.fromCharCode(0x2029)

const SCRIPT_UNSAFE = new RegExp(
  "[<>&" + LINE_SEPARATOR + PARAGRAPH_SEPARATOR + "]",
  "g"
)

const ESCAPES: Record<string, string> = {
  "<": BACKSLASH + "u003c",
  ">": BACKSLASH + "u003e",
  "&": BACKSLASH + "u0026",
  [LINE_SEPARATOR]: BACKSLASH + "u2028",
  [PARAGRAPH_SEPARATOR]: BACKSLASH + "u2029",
}

export const serializeJsonLd = (data: unknown): string =>
  JSON.stringify(data).replace(SCRIPT_UNSAFE, (char) => ESCAPES[char])
