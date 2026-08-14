import dns from "dns/promises"
import net from "net"

// The image URLs are caller-supplied. Even though this route is admin-only, an
// unrestricted fetch() turns the backend into a proxy for anything it can
// reach: cloud metadata (169.254.169.254), the Postgres/Redis ports on
// localhost, the private VPC. Everything below is that blast radius, closed.

const ALLOWED_PROTOCOLS = new Set(["https:"])

// http is tolerated only for the configured media origin (a local MinIO/R2
// dev endpoint is often plain http) — never for arbitrary hosts.
function configuredMediaHosts(): Set<string> {
  const hosts = new Set<string>()
  for (const raw of [process.env.S3_FILE_URL, process.env.S3_ENDPOINT]) {
    if (!raw) continue
    try {
      hosts.add(new URL(raw).hostname.toLowerCase())
    } catch {
      // Misconfigured env shouldn't take the route down; it just means that
      // origin gets no exemption.
    }
  }
  return hosts
}

function isPrivateAddress(address: string): boolean {
  const version = net.isIP(address)

  if (version === 4) {
    const [a, b] = address.split(".").map(Number)
    return (
      a === 0 || // "this network"
      a === 10 || // private
      a === 127 || // loopback
      (a === 100 && b >= 64 && b <= 127) || // CGNAT
      (a === 169 && b === 254) || // link-local, incl. cloud metadata
      (a === 172 && b >= 16 && b <= 31) || // private
      (a === 192 && b === 168) || // private
      (a === 192 && b === 0) || // IETF protocol assignments
      (a === 198 && (b === 18 || b === 19)) || // benchmarking
      a >= 224 // multicast + reserved
    )
  }

  if (version === 6) {
    const addr = address.toLowerCase()
    if (addr === "::" || addr === "::1") return true
    // IPv4-mapped (::ffff:127.0.0.1) — judge the embedded v4 address.
    const mapped = addr.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/)
    if (mapped) return isPrivateAddress(mapped[1])
    return (
      addr.startsWith("fe8") || // link-local
      addr.startsWith("fe9") ||
      addr.startsWith("fea") ||
      addr.startsWith("feb") ||
      addr.startsWith("fc") || // unique local
      addr.startsWith("fd") ||
      addr.startsWith("ff") // multicast
    )
  }

  // Not an IP literal — the caller resolves first, so this is unexpected.
  return true
}

async function assertSafeUrl(rawUrl: string): Promise<URL> {
  let url: URL
  try {
    url = new URL(rawUrl)
  } catch {
    throw new Error("URL invalid")
  }

  const mediaHosts = configuredMediaHosts()
  const host = url.hostname.toLowerCase()

  if (!ALLOWED_PROTOCOLS.has(url.protocol)) {
    if (!(url.protocol === "http:" && mediaHosts.has(host))) {
      throw new Error("Sunt permise doar URL-uri https")
    }
  }

  // An IP literal is checked directly; a name is resolved and EVERY address it
  // maps to must be public, so a DNS record pointing at 127.0.0.1 is rejected.
  const addresses = net.isIP(host)
    ? [host]
    : (await dns.lookup(host, { all: true })).map((a) => a.address)

  if (!addresses.length || addresses.some(isPrivateAddress)) {
    throw new Error("Adresă de rețea nepermisă")
  }

  return url
}

/**
 * fetch() restricted to public http(s) origins. Redirects are followed
 * manually so each hop is re-validated — otherwise a public URL could 302 to
 * 169.254.169.254 and defeat the check above.
 */
export async function safeFetchImage(
  rawUrl: string,
  maxRedirects = 3
): Promise<Response> {
  let target = await assertSafeUrl(rawUrl)

  for (let hop = 0; hop <= maxRedirects; hop++) {
    const resp = await fetch(target, { redirect: "manual" })

    if (resp.status < 300 || resp.status >= 400) return resp

    const location = resp.headers.get("location")
    if (!location) return resp

    target = await assertSafeUrl(new URL(location, target).toString())
  }

  throw new Error("Prea multe redirecționări")
}
