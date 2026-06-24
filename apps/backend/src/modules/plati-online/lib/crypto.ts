import crypto from "crypto"

/**
 * Crypto layer mirroring the official PlatiOnline PHP kit (PlatiOnline/PO5.php).
 *
 * Outgoing request (we encrypt):
 *   - AES-256-CBC, PKCS7 padding, random 32-char key, IV = IV_AUTH
 *   - f_message      = bin2hex(base64(aes_encrypt(xml)))   // base64 THEN hex
 *   - f_crypt_message = base64(rsa_encrypt(aes_key))        // RSA PKCS#1 v1.5, PO public key
 *
 * Incoming ITSN / relay response (we decrypt):
 *   - aes_key = rsa_decrypt(base64_decode(f_crypt_message)) // merchant private key
 *   - xml     = aes_decrypt(base64_decode(hex2bin(f_message)), iv = IV_ITSN)
 *
 * Source: https://github.com/plationline/po-php/blob/master/PlatiOnline/PO5.php
 */

const AES_ALGORITHM = "aes-256-cbc"

/**
 * Loads an RSA key that may be supplied as PEM (with real or `\n`-escaped
 * newlines) or as bare base64-encoded DER (as PlatiOnline distributes them,
 * e.g. SPKI public keys and PKCS#1 private keys without armor).
 */
export function loadPublicKey(raw: string): crypto.KeyObject {
  const key = raw.replace(/\\n/g, "\n").trim()
  if (key.includes("BEGIN")) {
    return crypto.createPublicKey(key)
  }
  const der = Buffer.from(key, "base64")
  for (const type of ["spki", "pkcs1"] as const) {
    try {
      return crypto.createPublicKey({ key: der, format: "der", type })
    } catch {
      // try next encoding
    }
  }
  throw new Error(
    "Unable to parse PlatiOnline public key (expected PEM or base64 DER spki/pkcs1)"
  )
}

export function loadPrivateKey(raw: string): crypto.KeyObject {
  const key = raw.replace(/\\n/g, "\n").trim()
  if (key.includes("BEGIN")) {
    return crypto.createPrivateKey(key)
  }
  const der = Buffer.from(key, "base64")
  for (const type of ["pkcs1", "pkcs8", "sec1"] as const) {
    try {
      return crypto.createPrivateKey({ key: der, format: "der", type })
    } catch {
      // try next encoding
    }
  }
  throw new Error(
    "Unable to parse PlatiOnline private key (expected PEM or base64 DER pkcs1/pkcs8)"
  )
}

/**
 * Generates a 32-character AES key, equivalent to the PHP kit's
 * `substr(hash('sha256', uniqid()), 0, 32)`. 32 ASCII chars = 32 bytes = AES-256.
 */
export function generateAesKey(): string {
  return crypto.randomBytes(16).toString("hex") // 16 bytes -> 32 hex chars
}

function assertIvLength(iv: string, name: string): Buffer {
  const buf = Buffer.from(iv, "utf8")
  if (buf.length !== 16) {
    throw new Error(
      `PlatiOnline ${name} must be exactly 16 bytes (got ${buf.length}). Check the value from the merchant panel.`
    )
  }
  return buf
}

/**
 * Decrypts an RSA block that was encrypted with PKCS#1 v1.5 padding.
 *
 * Node disabled `RSA_PKCS1_PADDING` for private decryption (CVE-2024-PEND,
 * Bleichenbacher/Marvin attack), so we decrypt with `RSA_NO_PADDING` and strip
 * the EME-PKCS1-v1_5 padding ourselves: `0x00 0x02 PS 0x00 M`.
 */
function rsaPrivateDecryptPkcs1(privateKey: string, data: Buffer): Buffer {
  const raw = crypto.privateDecrypt(
    { key: loadPrivateKey(privateKey), padding: crypto.constants.RSA_NO_PADDING },
    data
  )

  let i: number
  if (raw[0] === 0x00 && raw[1] === 0x02) {
    i = 2
  } else if (raw[0] === 0x02) {
    // Some implementations strip the leading zero byte.
    i = 1
  } else {
    throw new Error("Invalid PKCS#1 v1.5 padding in RSA block")
  }

  // Skip the non-zero padding string until the 0x00 separator.
  while (i < raw.length && raw[i] !== 0x00) {
    i++
  }
  if (i >= raw.length) {
    throw new Error("Invalid PKCS#1 v1.5 padding: missing separator")
  }

  return raw.subarray(i + 1)
}

export type EncryptedMessage = {
  /** Value for the `f_message` request field. */
  fMessage: string
  /** Value for the `f_crypt_message` request field. */
  fCryptMessage: string
}

/**
 * Encrypts an outgoing XML payload for PlatiOnline.
 */
export function encryptRequest(
  xml: string,
  params: { ivAuth: string; poPublicKey: string }
): EncryptedMessage {
  const aesKey = generateAesKey()
  const iv = assertIvLength(params.ivAuth, "IV_AUTH")

  const cipher = crypto.createCipheriv(AES_ALGORITHM, Buffer.from(aesKey, "utf8"), iv)
  const encrypted = Buffer.concat([cipher.update(xml, "utf8"), cipher.final()])

  // bin2hex(base64_encode(...)): base64 first, then hex-encode that base64 string.
  const fMessage = Buffer.from(encrypted.toString("base64"), "utf8").toString("hex")

  const encryptedKey = crypto.publicEncrypt(
    { key: loadPublicKey(params.poPublicKey), padding: crypto.constants.RSA_PKCS1_PADDING },
    Buffer.from(aesKey, "utf8")
  )
  const fCryptMessage = encryptedKey.toString("base64")

  return { fMessage, fCryptMessage }
}

/**
 * Decrypts an incoming message from PlatiOnline (ITSN notification or relay response).
 *
 * @param message       The encrypted payload (`f_message` / `f_relay_message`).
 * @param cryptMessage  The RSA-encrypted AES key (`f_crypt_message`).
 * @param params.iv     The relevant IV (IV_ITSN for ITSN, IV_AUTH for relay response).
 */
export function decryptMessage(
  message: string,
  cryptMessage: string,
  params: { iv: string; merchantPrivateKey: string }
): string {
  const aesKey = rsaPrivateDecryptPkcs1(
    params.merchantPrivateKey,
    Buffer.from(cryptMessage, "base64")
  )

  const iv = assertIvLength(params.iv, "IV")

  // Reverse of bin2hex(base64_encode(...)): hex2bin -> base64_decode -> ciphertext.
  const base64 = Buffer.from(message, "hex").toString("utf8")
  const ciphertext = Buffer.from(base64, "base64")

  const decipher = crypto.createDecipheriv(AES_ALGORITHM, aesKey, iv)
  const decrypted = Buffer.concat([decipher.update(ciphertext), decipher.final()])

  return decrypted.toString("utf8")
}
