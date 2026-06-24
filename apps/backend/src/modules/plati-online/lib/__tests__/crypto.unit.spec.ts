import crypto from "crypto"
import { decryptMessage, encryptRequest, generateAesKey } from "../crypto"

/**
 * Roundtrip tests for the PlatiOnline crypto layer. They validate the full
 * encoding chain (AES-256-CBC + PKCS7 + base64->hex + RSA PKCS#1 v1.5) by
 * encrypting with a public key and decrypting with the matching private key.
 */
describe("plati-online crypto", () => {
  const { publicKey, privateKey } = crypto.generateKeyPairSync("rsa", {
    modulusLength: 2048,
    publicKeyEncoding: { type: "spki", format: "pem" },
    privateKeyEncoding: { type: "pkcs8", format: "pem" },
  })
  const iv = "1234567890123456" // 16 bytes

  it("generates a 32-character AES key", () => {
    expect(generateAesKey()).toHaveLength(32)
  })

  it("roundtrips a payload through encrypt -> decrypt", () => {
    const xml = "<po_auth_request><f_order_number>ORD-1</f_order_number></po_auth_request>"

    const { fMessage, fCryptMessage } = encryptRequest(xml, {
      ivAuth: iv,
      poPublicKey: publicKey,
    })

    // f_message must be hex (output of bin2hex)
    expect(fMessage).toMatch(/^[0-9a-f]+$/)

    const decrypted = decryptMessage(fMessage, fCryptMessage, {
      iv,
      merchantPrivateKey: privateKey,
    })

    expect(decrypted).toBe(xml)
  })

  it("roundtrips UTF-8 content (diacritics)", () => {
    const xml = "<x>Ștefan București — 1.00 RON</x>"
    const { fMessage, fCryptMessage } = encryptRequest(xml, {
      ivAuth: iv,
      poPublicKey: publicKey,
    })
    const decrypted = decryptMessage(fMessage, fCryptMessage, {
      iv,
      merchantPrivateKey: privateKey,
    })
    expect(decrypted).toBe(xml)
  })

  it("accepts bare base64 DER keys (PlatiOnline format: SPKI public, PKCS#1 private)", () => {
    const pubDer = crypto
      .createPublicKey(publicKey)
      .export({ type: "spki", format: "der" })
      .toString("base64")
    const privDer = crypto
      .createPrivateKey(privateKey)
      .export({ type: "pkcs1", format: "der" })
      .toString("base64")

    const xml = "<x>plati-online</x>"
    const { fMessage, fCryptMessage } = encryptRequest(xml, {
      ivAuth: iv,
      poPublicKey: pubDer,
    })
    const decrypted = decryptMessage(fMessage, fCryptMessage, {
      iv,
      merchantPrivateKey: privDer,
    })
    expect(decrypted).toBe(xml)
  })

  it("rejects an IV that is not 16 bytes", () => {
    expect(() =>
      encryptRequest("<x/>", { ivAuth: "short", poPublicKey: publicKey })
    ).toThrow(/16 bytes/)
  })
})
