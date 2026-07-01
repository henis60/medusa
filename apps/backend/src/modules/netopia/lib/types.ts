export interface NetopiaOptions {
  apiKey: string        // NETOPIA_SECRET — folosit în Authorization header
  posSignature: string  // NETOPIA_ID — format XXXX-XXXX-XXXX-XXXX-XXXX
  publicKey: string     // NETOPIA_PUBLIC — certificatul Netopia pentru verificare IPN
  sandbox: boolean
  notifyUrl: string
  redirectUrl: string
  language: string
}

export interface NetopiaBillingInfo {
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

export interface NetopiaBrowserInfo {
  BROWSER_USER_AGENT?: string
  OS?: string
  OS_VERSION?: string
  MOBILE?: string
  SCREEN_POINT?: string
  SCREEN_PRINT?: string
  BROWSER_COLOR_DEPTH?: string
  BROWSER_SCREEN_HEIGHT?: string
  BROWSER_SCREEN_WIDTH?: string
  BROWSER_PLUGINS?: string
  BROWSER_JAVA_ENABLED?: string
  BROWSER_LANGUAGE?: string
  BROWSER_TZ?: string
  BROWSER_TZ_OFFSET?: string
  IP_ADDRESS?: string
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
    billing: NetopiaBillingInfo
    shipping?: NetopiaBillingInfo
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
    data?: NetopiaBrowserInfo
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
