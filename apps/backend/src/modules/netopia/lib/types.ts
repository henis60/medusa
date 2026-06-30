export interface NetopiaOptions {
  apiKey: string        // NETOPIA_SECRET — folosit în Authorization header
  posSignature: string  // NETOPIA_ID — format XXXX-XXXX-XXXX-XXXX-XXXX
  publicKey: string     // NETOPIA_PUBLIC — certificatul Netopia pentru verificare IPN
  sandbox: boolean
  notifyUrl: string
  redirectUrl: string
  language: string
}

export interface NetopiaStartRequest {
  config: {
    notifyUrl: string
    redirectUrl: string
    language: string
  }
  order: {
    posSignature: string
    orderID: string
    dateTime: string
    description: string
    amount: number
    currency: string
    billing: {
      email: string
      phone: string
      firstName: string
      lastName: string
      city: string
      country: number
      countryName: string
      details: string
      postalCode: string
      state: string
    }
    products?: Array<{
      name: string
      code: string
      category: string
      price: number
      vat: number
    }>
  }
  payment: {
    options: {
      installments: number
      bonus: number
    }
    instrument: {
      type: string
      account: string
      expMonth: number
      expYear: number
      secretCode: string
    }
  }
}

export interface NetopiaStartResponse {
  error?: { code: string; message: string }
  payment?: {
    paymentURL?: string
    ntpID?: string
    status?: number
    amount?: number
    currency?: string
    token?: string
  }
  customerAction?: {
    authenticationToken?: string
    formData?: string
    type?: string
  }
}

export interface NetopiaIpnPayload {
  payment?: {
    ntpID?: string
    status?: number
    amount?: number
    currency?: string
    token?: string
  }
  order?: {
    orderID?: string
    amount?: number
    currency?: string
  }
}

export interface NetopiaOperationRequest {
  ntpID: string
  posSignature: string
  amount?: number
  currency?: string
}

export interface NetopiaOperationResponse {
  error?: { code: string; message: string }
  payment?: {
    ntpID?: string
    status?: number
    amount?: number
    currency?: string
  }
}
