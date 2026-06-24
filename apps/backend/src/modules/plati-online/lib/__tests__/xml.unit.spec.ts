import {
  buildAuthRequest,
  buildItsnResponse,
  buildOperationRequest,
  formatTimestamp,
  getStatusCode,
  getXmlTag,
  objectToXml,
} from "../xml"
import { PlatiOnlineAction } from "../types"

describe("plati-online xml", () => {
  it("serializes arrays as repeated <item> tags", () => {
    const xml = objectToXml({
      f_order_cart: [
        { prodid: "A", qty: 1 },
        { prodid: "B", qty: 2 },
      ] as any,
    })
    expect(xml).toBe(
      "<f_order_cart><item><prodid>A</prodid><qty>1</qty></item>" +
        "<item><prodid>B</prodid><qty>2</qty></item></f_order_cart>"
    )
  })

  it("renames keys containing 'coupon' to <coupon>", () => {
    const xml = objectToXml({ coupon_1: { code: "X" } as any })
    expect(xml).toBe("<coupon><code>X</code></coupon>")
  })

  it("escapes special characters and omits null/undefined/empty", () => {
    const xml = objectToXml({ a: "x & <y>", b: null, c: undefined, d: "" })
    expect(xml).toBe("<a>x &amp; &lt;y&gt;</a>")
  })

  it("omits empty optional fields inside nested objects (minLength constraint)", () => {
    const xml = buildAuthRequest({
      login: "L1",
      website: "shop.ro",
      testMode: true,
      orderNumber: "ORD-1",
      amount: 1,
      currency: "RON",
      orderString: "Order ORD-1",
      sequence: 42,
      timestamp: new Date(2026, 5, 23, 14, 30, 5),
      relayUrl: "https://shop.ro/return",
      relayMethod: "PTOR",
      customer: {
        email: "a@b.ro",
        firstName: "Ana",
        state: "", // empty province must NOT be emitted
        city: "Cluj",
      },
    })
    expect(xml).not.toContain("<f_state>")
    expect(xml).toContain("<f_city>Cluj</f_city>")
    expect(xml).toContain("<f_email>a@b.ro</f_email>")
  })

  it("formats timestamp as ISO 8601 with timezone offset", () => {
    // Local-time constructor; we only assert the shape, not the offset value.
    expect(formatTimestamp(new Date(2026, 5, 23, 14, 30, 5))).toMatch(
      /^2026-06-23T14:30:05[+-]\d{2}:\d{2}$/
    )
  })

  it("builds a po_auth_request with sorted keys and 2-decimal amount", () => {
    const xml = buildAuthRequest({
      login: "L1",
      website: "shop.ro",
      testMode: true,
      orderNumber: "ORD-1",
      amount: 1,
      currency: "RON",
      orderString: "Order ORD-1",
      sequence: 42,
      timestamp: new Date(2026, 5, 23, 14, 30, 5),
      relayUrl: "https://shop.ro/return",
      relayMethod: "PTOR",
    })

    expect(xml).toContain("<po_auth_request>")
    expect(xml).toContain("<f_amount>1.00</f_amount>")
    expect(xml).toContain("<f_test_request>1</f_test_request>")
    expect(xml).toContain("<f_order_number>ORD-1</f_order_number>")
    // relay fields must be nested under transaction_relay_response, not top-level
    expect(xml).toContain(
      "<transaction_relay_response><f_relay_response_url>https://shop.ro/return</f_relay_response_url>" +
        "<f_relay_method>PTOR</f_relay_method><f_post_declined>1</f_post_declined>" +
        "<f_relay_handshake>1</f_relay_handshake></transaction_relay_response>"
    )
    // ksort: f_action precedes f_login precedes f_website
    expect(xml.indexOf("<f_action>")).toBeLessThan(xml.indexOf("<f_login>"))
    expect(xml.indexOf("<f_login>")).toBeLessThan(xml.indexOf("<f_website>"))
  })

  it("builds a po_query with f_website and order number, without f_sequence/f_test_request", () => {
    const xml = buildOperationRequest({
      rootTag: "po_query",
      action: PlatiOnlineAction.Query,
      login: "L1",
      website: "shop.ro",
      timestamp: new Date(2026, 5, 23, 14, 30, 5),
      orderNumber: "payses_123",
    })
    expect(xml).toContain("<po_query>")
    expect(xml).toContain("<f_website>shop.ro</f_website>")
    expect(xml).toContain("<f_order_number>payses_123</f_order_number>")
    expect(xml).toContain("<f_action>0</f_action>")
    expect(xml).not.toContain("<f_sequence>")
    expect(xml).not.toContain("<f_test_request>")
  })

  it("builds the ITSN acknowledgement", () => {
    const xml = buildItsnResponse({
      responseCode: 1,
      merchServerStamp: "shop.ro",
      transactionId: "TX123",
    })
    expect(getXmlTag(xml, "f_response_code")).toBe("1")
    expect(getXmlTag(xml, "x_trans_id")).toBe("TX123")
  })

  it("extracts and unescapes tag content", () => {
    const xml = "<po_redirect_url>https://pay?a=1&amp;b=2</po_redirect_url>"
    expect(getXmlTag(xml, "po_redirect_url")).toBe("https://pay?a=1&b=2")
  })

  it("extracts the nested <code> from status_fin1/status_fin2", () => {
    const raw =
      "<po_query_response><order><tranzaction>" +
      "<status_fin1><code>2</code><timestamp>2026-06-23T23:58:14+03:00</timestamp></status_fin1>" +
      "<status_fin2><code>4</code><timestamp>2026-06-23T23:58:02+03:00</timestamp></status_fin2>" +
      "<x_trans_id>26952887</x_trans_id></tranzaction></order></po_query_response>"
    expect(getStatusCode(raw, "status_fin1")).toBe(2)
    expect(getStatusCode(raw, "status_fin2")).toBe(4)
    expect(getStatusCode(raw, "status_missing")).toBeUndefined()
  })

  it("strips CDATA wrappers (redirect URL, error reasons)", () => {
    const xml =
      "<po_redirect_url><![CDATA[https://cc6.plationline.ro?plationlinecartid=ABC123]]></po_redirect_url>"
    expect(getXmlTag(xml, "po_redirect_url")).toBe(
      "https://cc6.plationline.ro?plationlinecartid=ABC123"
    )
  })
})
