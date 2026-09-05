"use server"

import { sdk } from "@lib/config"
import medusaError from "@lib/util/medusa-error"
import { isRateLimitError } from "@lib/util/is-rate-limit-error"
import { HttpTypes } from "@medusajs/types"
import { revalidateTag } from "next/cache"
import { redirect } from "@i18n/navigation"
import { routing } from "@i18n/routing"
import { getLocale } from "./locale-actions"
import {
  getAuthHeaders,
  getCacheOptions,
  getCacheTag,
  getCartId,
  removeAuthToken,
  removeCartId,
  setAuthToken,
} from "./cookies"

export const retrieveCustomer =
  async (): Promise<HttpTypes.StoreCustomer | null> => {
    const authHeaders = await getAuthHeaders()

    // Anonymous visitor (no JWT cookie) — skip the API round-trip entirely.
    if (!("authorization" in authHeaders)) return null

    const headers = {
      ...authHeaders,
    }

    const next = {
      ...(await getCacheOptions("customers")),
    }

    return await sdk.client
      .fetch<{ customer: HttpTypes.StoreCustomer }>(`/store/customers/me`, {
        method: "GET",
        query: {
          fields: "*orders",
        },
        headers,
        next,
        cache: "force-cache",
      })
      .then(({ customer }) => customer)
      .catch(() => null)
  }

export const updateCustomer = async (body: HttpTypes.StoreUpdateCustomer) => {
  const headers = {
    ...(await getAuthHeaders()),
  }

  const updateRes = await sdk.store.customer
    .update(body, {}, headers)
    .then(({ customer }) => customer)
    .catch(medusaError)

  const cacheTag = await getCacheTag("customers")
  revalidateTag(cacheTag)

  return updateRes
}

async function verifyRecaptcha(token: string | null): Promise<boolean> {
  const secret = process.env.RECAPTCHA_SECRET_KEY
  if (!secret || !token) return false
  try {
    const res = await fetch("https://www.google.com/recaptcha/api/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ secret, response: token }).toString(),
    })
    const data = await res.json()
    return data.success === true && (data.score ?? 1) >= 0.5
  } catch {
    return false
  }
}

export async function signup(_currentState: unknown, formData: FormData) {
  const recaptchaOk = await verifyRecaptcha(formData.get("recaptchaToken") as string | null)
  if (!recaptchaOk) return "Verificare anti-spam eșuată. Încearcă din nou."

  const password = formData.get("password") as string
  const customerForm = {
    email: formData.get("email") as string,
    first_name: formData.get("first_name") as string,
    last_name: formData.get("last_name") as string,
    phone: formData.get("phone") as string,
  }

  try {
    const token = await sdk.auth.register("customer", "emailpass", {
      email: customerForm.email,
      password: password,
    })

    await setAuthToken(token as string)

    const headers = {
      ...(await getAuthHeaders()),
    }

    const { customer: createdCustomer } = await sdk.store.customer.create(
      customerForm,
      {},
      headers
    )

    const loginToken = await sdk.auth.login("customer", "emailpass", {
      email: customerForm.email,
      password,
    })

    await setAuthToken(loginToken as string)

    const customerCacheTag = await getCacheTag("customers")
    revalidateTag(customerCacheTag)

    await transferCart()

    return createdCustomer
  } catch (error) {
    if (isRateLimitError(error)) {
      return "Prea multe încercări. Te rugăm să revii peste câteva minute."
    }
    return String(error)
  }
}

/**
 * Only same-origin paths may be used as a post-login destination.
 *
 * `redirectTo` arrives from the query string, so without this an attacker can
 * send `?redirectTo=https://evil.tld/login`: the victim signs in on the real
 * site and is handed straight to a lookalike page, carrying a trusted referrer.
 * Protocol-relative URLs (`//evil.tld`) are rejected too — they look like paths
 * but resolve to a foreign origin.
 */
const isSafeRedirect = (href: string): boolean =>
  href.startsWith("/") && !href.startsWith("//") && !href.startsWith("/\\")

export async function login(_currentState: unknown, formData: FormData) {
  const recaptchaOk = await verifyRecaptcha(formData.get("recaptchaToken") as string | null)
  if (!recaptchaOk) return "Verificare anti-spam eșuată. Încearcă din nou."

  const email = formData.get("email") as string
  const password = formData.get("password") as string

  try {
    const token = await sdk.auth.login("customer", "emailpass", { email, password })

    // emailpass never actually resolves with a non-string result (that shape
    // only exists for SSO/MFA/verification providers, which this backend
    // doesn't use) — this is just a defensive guard against silently
    // "logging in" with no token and no error shown if that ever changes.
    // Not a credentials problem, so use the generic system-error message.
    if (typeof token !== "string") {
      return "A apărut o eroare. Te rugăm să încerci din nou mai târziu."
    }

    await setAuthToken(token)
    const customerCacheTag = await getCacheTag("customers")
    revalidateTag(customerCacheTag)
  } catch (error) {
    if (isRateLimitError(error)) {
      return "Prea multe încercări. Te rugăm să revii peste câteva minute."
    }
    // A 401 here always means bad credentials — including a guest-checkout
    // email, which has no password set and fails the exact same way as an
    // unknown email. Anything else (network failure, 5xx) is a real system
    // error and must say so, not blame the user's email/password.
    if ((error as { status?: number })?.status === 401) {
      return "Email sau parolă incorectă."
    }
    return "A apărut o eroare. Te rugăm să încerci din nou mai târziu."
  }

  // Cart transfer is best-effort: the cart-mismatch handler retries it silently
  // after login, so a failure here must never block sign-in.
  await transferCart().catch(() => {})

  const redirectTo = formData.get("redirectTo") as string | null
  if (redirectTo && isSafeRedirect(redirectTo)) {
    redirect({ href: redirectTo, locale: (await getLocale()) ?? routing.defaultLocale })
  }
}

export async function signout() {
  await sdk.auth.logout()

  await removeAuthToken()

  const customerCacheTag = await getCacheTag("customers")
  revalidateTag(customerCacheTag)

  await removeCartId()

  const cartCacheTag = await getCacheTag("carts")
  revalidateTag(cartCacheTag)

  redirect({ href: "/profil", locale: (await getLocale()) ?? routing.defaultLocale })
}

export async function resetPassword(
  token: string,
  _currentState: unknown,
  formData: FormData
) {
  const password = formData.get("password") as string
  const passwordConfirm = formData.get("password_confirm") as string

  if (password !== passwordConfirm) {
    return "Parolele nu coincid."
  }

  if (password.length < 8) {
    return "Parola trebuie să aibă cel puțin 8 caractere."
  }

  try {
    await sdk.auth.updateProvider(
      "customer",
      "emailpass",
      { password },
      token
    )
    return "success"
  } catch (error) {
    if (isRateLimitError(error)) {
      return "Prea multe încercări. Te rugăm să revii peste câteva minute."
    }
    return "Link-ul de resetare este invalid sau a expirat."
  }
}

export async function requestPasswordReset(
  _currentState: unknown,
  formData: FormData
) {
  const recaptchaOk = await verifyRecaptcha(formData.get("recaptchaToken") as string | null)
  if (!recaptchaOk) return "Verificare anti-spam eșuată. Încearcă din nou."

  const email = formData.get("email") as string

  try {
    await sdk.auth.resetPassword("customer", "emailpass", {
      identifier: email,
    })
    return "success"
  } catch (error) {
    if (isRateLimitError(error)) {
      return "Prea multe încercări. Te rugăm să revii peste câteva minute."
    }
    return "A apărut o eroare. Te rugăm să încerci din nou."
  }
}

export async function transferCart() {
  const cartId = await getCartId()

  if (!cartId) {
    return
  }

  const headers = await getAuthHeaders()

  await sdk.store.cart.transferCart(cartId, {}, headers)

  const cartCacheTag = await getCacheTag("carts")
  revalidateTag(cartCacheTag)
}

// A 401 on a write means the JWT expired while the cookie (and the
// force-cached account pages) were still alive. Drop the stale token and
// bust the customer cache so the next render lands on the login screen.
const handleUnauthorized = async (
  err: unknown
): Promise<{ success: boolean; error: string } | null> => {
  if (!/unauthorized/i.test(String(err))) {
    return null
  }
  await removeAuthToken()
  const customerCacheTag = await getCacheTag("customers")
  revalidateTag(customerCacheTag)
  return {
    success: false,
    error: "Sesiunea a expirat. Te rugăm să te autentifici din nou.",
  }
}

export const updateCustomerProfile = async (
  _currentState: Record<string, unknown>,
  formData: FormData
): Promise<{ success: boolean; error: string | null }> => {
  const update: HttpTypes.StoreUpdateCustomer = {
    first_name: formData.get("first_name") as string,
    last_name: formData.get("last_name") as string,
    phone: (formData.get("phone") as string) ?? "",
  }

  try {
    await updateCustomer(update)
    return { success: true, error: null }
  } catch (err) {
    return (
      (await handleUnauthorized(err)) ?? {
        success: false,
        error: String(err),
      }
    )
  }
}

export const addCustomerAddress = async (
  currentState: Record<string, unknown>,
  formData: FormData
): Promise<{ success: boolean; error: string | null }> => {
  const isDefaultBilling =
    formData.get("is_default_billing") === "on" ||
    (currentState.isDefaultBilling as boolean) ||
    false
  const isDefaultShipping = (currentState.isDefaultShipping as boolean) || false

  const address = {
    first_name: formData.get("first_name") as string,
    last_name: formData.get("last_name") as string,
    company: formData.get("company") as string,
    address_1: formData.get("address_1") as string,
    address_2: formData.get("address_2") as string,
    city: formData.get("city") as string,
    postal_code: formData.get("postal_code") as string,
    province: formData.get("province") as string,
    country_code: formData.get("country_code") as string,
    phone: formData.get("phone") as string,
    is_default_billing: isDefaultBilling,
    is_default_shipping: isDefaultShipping,
  }

  const headers = {
    ...(await getAuthHeaders()),
  }

  return sdk.store.customer
    .createAddress(address, {}, headers)
    .then(async () => {
      const customerCacheTag = await getCacheTag("customers")
      revalidateTag(customerCacheTag)
      return { success: true, error: null }
    })
    .catch(async (err) => {
      return (
        (await handleUnauthorized(err)) ?? {
          success: false,
          error: err.toString(),
        }
      )
    })
}

export const deleteCustomerAddress = async (
  addressId: string
): Promise<{ success: boolean; error: string | null }> => {
  const headers = {
    ...(await getAuthHeaders()),
  }

  return sdk.store.customer
    .deleteAddress(addressId, headers)
    .then(async () => {
      const customerCacheTag = await getCacheTag("customers")
      revalidateTag(customerCacheTag)
      return { success: true, error: null }
    })
    .catch(async (err) => {
      return (
        (await handleUnauthorized(err)) ?? {
          success: false,
          error: err.toString(),
        }
      )
    })
}

export const updateCustomerAddress = async (
  currentState: Record<string, unknown>,
  formData: FormData
): Promise<{ success: boolean; error: string | null }> => {
  const addressId =
    (currentState.addressId as string) || (formData.get("addressId") as string)

  if (!addressId) {
    return { success: false, error: "Address ID is required" }
  }

  const address = {
    first_name: formData.get("first_name") as string,
    last_name: formData.get("last_name") as string,
    company: formData.get("company") as string,
    address_1: formData.get("address_1") as string,
    address_2: formData.get("address_2") as string,
    city: formData.get("city") as string,
    postal_code: formData.get("postal_code") as string,
    province: formData.get("province") as string,
    country_code: formData.get("country_code") as string,
    is_default_billing: formData.get("is_default_billing") === "on",
  } as HttpTypes.StoreUpdateCustomerAddress

  const phone = formData.get("phone") as string

  if (phone) {
    address.phone = phone
  }

  const headers = {
    ...(await getAuthHeaders()),
  }

  return sdk.store.customer
    .updateAddress(addressId, address, {}, headers)
    .then(async () => {
      const customerCacheTag = await getCacheTag("customers")
      revalidateTag(customerCacheTag)
      return { success: true, error: null }
    })
    .catch(async (err) => {
      return (
        (await handleUnauthorized(err)) ?? {
          success: false,
          error: err.toString(),
        }
      )
    })
}
