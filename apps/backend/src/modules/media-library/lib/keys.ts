import { MedusaError } from "@medusajs/framework/utils"

// The media library shares one bucket with core Medusa. Core uploads go
// through uploadFilesWorkflow / the S3 file provider, which strips any
// directory from the filename and prefixes a ulid — so everything the core
// writes lands at the bucket ROOT. The media library is the only writer that
// produces folder'd keys ("folder/name.ext", see the POST route + r2-client's
// note on why it bypasses uploadFilesWorkflow).
//
// That asymmetry defines the media library's namespace: a destructive
// operation (permanent delete, or the delete half of a rename) is only allowed
// on a key inside a folder. Root-level keys — product images uploaded through
// the core admin, invoices, anything else sharing the bucket — are off limits,
// so a stray (or CSRF'd) admin request can't wipe them.
//
// Deployments that keep the whole library under one folder can narrow this
// further with MEDIA_LIBRARY_PREFIX (e.g. "media/"); unset, the folder rule
// alone applies so existing buckets keep working.
export const MEDIA_LIBRARY_PREFIX = (process.env.MEDIA_LIBRARY_PREFIX ?? "")
  .replace(/^\/+/, "")

// Where an upload goes when the user picks no folder. Root would put the file
// outside the deletable namespace above (and next to core uploads), leaving it
// impossible to delete or rename from the library afterwards.
export const MEDIA_LIBRARY_DEFAULT_FOLDER = MEDIA_LIBRARY_PREFIX || "media/"

/**
 * Structural validation applied to every caller-supplied key, destructive or
 * not: the key arrives base64url-decoded from the URL, so it is fully
 * attacker-controlled text before it reaches the S3 SDK.
 */
export function assertValidMediaKey(key: string): string {
  const invalid =
    !key ||
    key.length > 1024 ||
    key.startsWith("/") ||
    key.includes("\\") ||
    key.includes("//") ||
    key.split("/").some((segment) => segment === "." || segment === "..") ||
    // Control characters / DEL are never legitimate in a key and would make
    // logs and the admin UI misleading about what is actually being touched.
    [...key].some((ch) => {
      const code = ch.codePointAt(0)!
      return code < 32 || code === 127
    })

  if (invalid) {
    throw new MedusaError(MedusaError.Types.INVALID_DATA, "Cheie invalidă.")
  }

  return key
}

/**
 * Guard for operations that remove bytes from the bucket (permanent delete,
 * and rename — which is a copy followed by a delete of the source). Hiding an
 * asset only writes metadata, so it does not need this.
 */
export function assertDeletableMediaKey(key: string): string {
  assertValidMediaKey(key)

  const insideNamespace =
    key.startsWith(MEDIA_LIBRARY_PREFIX) &&
    key.slice(MEDIA_LIBRARY_PREFIX.length).includes("/")

  if (!insideNamespace) {
    throw new MedusaError(
      MedusaError.Types.NOT_ALLOWED,
      "Acest fișier nu aparține bibliotecii media și nu poate fi șters."
    )
  }

  return key
}
