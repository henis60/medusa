export type EawbOptions = {
  api_key: string
  dry_run?: boolean
  from_contact?: string
  from_phone?: string
  from_locality?: string
  from_county?: string
  from_street?: string
  from_street_no?: string
  from_zip?: string
  from_country?: string
}

// ─── Europarcel API types ─────────────────────────────────────────────────────

export interface EpCarrier {
  id: string
  name: string
  is_active: boolean
}

export interface EpService {
  service_id: number
  service_name: string
  carrier_id: string
  carrier_name: string
  country_code: string
}

export interface EpBillingAddress {
  id: number
  contact: string
  address_type: "individual" | "business"
  [key: string]: unknown
}

export interface PaginatedResponse<T> {
  list: T[]
  meta?: { total: number; per_page: number; current_page: number; last_page: number }
}

export interface EpPriceAddress {
  address_from_id?: number
  address_to_id?: number
  contact?: string
  phone?: string
  email?: string
  company?: string
  country_code?: string
  county_name?: string
  locality_name?: string
  locality_id?: number
  street_name?: string
  street_number?: string
  street_details?: string
  postal_code?: string
  fixed_location_id?: number
}

export interface EpPriceContent {
  envelopes_count: number
  pallets_count: number
  parcels_count: number
  total_weight: number
  parcels?: Array<{
    size: { weight: number; width: number; height: number; length: number }
    sequence_no: number
  }>
}

export interface EpPriceExtra {
  parcel_content: string
  open_package?: boolean
  sms_recipient?: boolean
  sms_sender?: boolean
  insurance_amount?: number
  insurance_amount_currency?: string
  bank_repayment_amount?: number
  bank_repayment_currency?: string
  bank_holder?: string
  bank_iban?: string
}

export interface EpPriceRequest {
  carrier_id: number | string
  service_id: number
  billing_to: { billing_address_id: number }
  address_from: EpPriceAddress
  address_to: EpPriceAddress
  content: EpPriceContent
  extra: EpPriceExtra
}

export interface EpPriceOption {
  carrier_id: number
  carrier: string
  service_id: number
  service_name: string
  estimated_pickup_date: string
  estimated_delivery_date: string
  price: { amount: number; vat: number; total: number; currency: string }
}

export interface EpPriceResponse {
  data: EpPriceOption[]
}

export interface EpOrder {
  id: number
  awb: string
  carrier_id: number
  carrier_name: string
  service_id: number
  service_name: string
  total_amount: number
  currency: string
  track_url: string | null
  order_status: string
}

export interface EpLabelLinkResponse {
  download_url: string
  awb: string
  format: string
}

export interface EpCancelResponse {
  message?: string
}

export interface EpFixedLocation {
  id: number
  fixed_location_type: string
  carrier_id: number
  carrier_name: string
  locality_id?: number
  locality_name: string
  county_name: string
  name: string
  address: string
  is_active: boolean
  coordinates?: { lat: number; long: number }
}

export interface EpShippingAddress {
  id: number
  contact: string
  address_type?: "individual" | "business"
  company?: string
  county_name?: string
  locality_name?: string
  street_name?: string
  street_no?: string
  zipcode?: string
  phone?: string
  email?: string
  is_default?: boolean
  [key: string]: unknown
}
