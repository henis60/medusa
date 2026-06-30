import {
  NetopiaOperationRequest,
  NetopiaOperationResponse,
  NetopiaOptions,
  NetopiaStartRequest,
  NetopiaStartResponse,
} from "./types"

const SANDBOX_BASE = "https://secure-sandbox.netopia-payments.com"
const LIVE_BASE = "https://secure.netopia-payments.com/api"

export class NetopiaClient {
  private readonly baseUrl: string
  private readonly apiKey: string
  private readonly posSignature: string

  constructor(options: NetopiaOptions) {
    this.baseUrl = options.sandbox ? SANDBOX_BASE : LIVE_BASE
    this.apiKey = options.apiKey
    this.posSignature = options.posSignature
  }

  private async request<T>(path: string, body: unknown): Promise<T> {
    const res = await fetch(`${this.baseUrl}${path}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: this.apiKey,
      },
      body: JSON.stringify(body),
    })

    if (!res.ok) {
      const text = await res.text().catch(() => "")
      throw new Error(`Netopia ${path} failed [${res.status}]: ${text.slice(0, 300)}`)
    }

    return res.json() as Promise<T>
  }

  async startPayment(req: NetopiaStartRequest): Promise<NetopiaStartResponse> {
    return this.request<NetopiaStartResponse>("/payment/card/start", req)
  }

  async getStatus(ntpID: string): Promise<NetopiaOperationResponse> {
    const body: NetopiaOperationRequest = { ntpID, posSignature: this.posSignature }
    return this.request<NetopiaOperationResponse>("/operation/status", body)
  }

  async capture(ntpID: string, amount: number, currency = "RON"): Promise<NetopiaOperationResponse> {
    const body: NetopiaOperationRequest = { ntpID, posSignature: this.posSignature, amount, currency }
    return this.request<NetopiaOperationResponse>("/operation/capture", body)
  }

  async void(ntpID: string): Promise<NetopiaOperationResponse> {
    const body: NetopiaOperationRequest = { ntpID, posSignature: this.posSignature }
    return this.request<NetopiaOperationResponse>("/operation/void", body)
  }

  async refund(ntpID: string, amount: number, currency = "RON"): Promise<NetopiaOperationResponse> {
    const body: NetopiaOperationRequest = { ntpID, posSignature: this.posSignature, amount, currency }
    return this.request<NetopiaOperationResponse>("/operation/credit", body)
  }
}
