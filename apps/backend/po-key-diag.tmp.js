// Temporary diagnostic: inspect PO_PUBLIC_KEY / PO_PRIVATE_KEY from .env
// WITHOUT printing the secret material — only structural info.
const fs = require("fs")
const crypto = require("crypto")
const path = require("path")

const envRaw = fs.readFileSync(path.join(process.cwd(), ".env"), "utf8")

function extract(name) {
  // Capture value up to the next KEY= line or EOF (handles multi-line values).
  const re = new RegExp(`^${name}=([\\s\\S]*?)(?=\\r?\\n[A-Z0-9_]+=|\\r?\\n*$)`, "m")
  const m = envRaw.match(re)
  return m ? m[1] : undefined
}

function diag(name, kind) {
  const raw = extract(name)
  if (raw === undefined) {
    console.log(`${name}: NOT FOUND in .env`)
    return
  }
  const trimmed = raw.replace(/^["']|["']$/g, "").trim()
  const hasPem = trimmed.includes("BEGIN")
  const lines = raw.split(/\r?\n/).length
  console.log(`\n${name}:`)
  console.log(`  raw length: ${raw.length}, physical lines: ${lines}, hasPEM: ${hasPem}`)

  const b64 = trimmed.replace(/\s+/g, "")
  console.log(`  base64 (no whitespace) length: ${b64.length}`)
  let der
  try {
    der = Buffer.from(b64, "base64")
  } catch (e) {
    console.log(`  base64 decode failed: ${e.message}`)
    return
  }
  console.log(`  decoded bytes: ${der.length}, first8: ${der.subarray(0, 8).toString("hex")}`)
  if (der[0] === 0x30 && der[1] === 0x82) {
    const declared = (der[2] << 8) + der[3] + 4
    console.log(`  DER SEQUENCE declared total: ${declared} -> ${declared === der.length ? "MATCHES (complete)" : "MISMATCH (truncated/corrupt)"}`)
  }

  const types = kind === "public" ? ["spki", "pkcs1"] : ["pkcs1", "pkcs8", "sec1"]
  for (const type of types) {
    try {
      const ko = kind === "public"
        ? crypto.createPublicKey({ key: der, format: "der", type })
        : crypto.createPrivateKey({ key: der, format: "der", type })
      console.log(`  parse as ${type}: OK (${ko.asymmetricKeyType}, ${ko.asymmetricKeyDetails?.modulusLength} bits)`)
    } catch (e) {
      console.log(`  parse as ${type}: FAIL - ${e.message}`)
    }
  }
}

diag("PO_PUBLIC_KEY", "public")
diag("PO_PRIVATE_KEY", "private")
