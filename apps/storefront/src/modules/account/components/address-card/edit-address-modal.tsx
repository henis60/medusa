"use client"

import {
  deleteCustomerAddress,
  updateCustomerAddress,
} from "@lib/data/customer"
import useToggleState from "@lib/hooks/use-toggle-state"
import { Trash } from "@medusajs/icons"
import { HttpTypes } from "@medusajs/types"
import CountrySelect from "@modules/checkout/components/country-select"
import { SubmitButton } from "@modules/checkout/components/submit-button"
import Input from "@modules/common/components/input"
import Modal from "@modules/common/components/modal"
import { clx } from "@modules/common/components/ui"
import Spinner from "@modules/common/icons/spinner"
import React, { useActionState, useEffect, useState } from "react"

type EditAddressProps = {
  region: HttpTypes.StoreRegion
  address: HttpTypes.StoreCustomerAddress
  isActive?: boolean
}

const EditAddress: React.FC<EditAddressProps> = ({
  region,
  address,
  isActive = false,
}) => {
  const [removing, setRemoving] = useState(false)
  const [successState, setSuccessState] = useState(false)
  const { state, open, close: closeModal } = useToggleState(false)

  const [formState, formAction] = useActionState(updateCustomerAddress, {
    success: false,
    error: null,
  } as { success: boolean; error: string | null })

  const close = () => {
    setSuccessState(false)
    closeModal()
  }

  useEffect(() => {
    if (successState) close()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [successState])

  useEffect(() => {
    if (formState.success) setSuccessState(true)
  }, [formState])

  const removeAddress = async () => {
    setRemoving(true)
    await deleteCustomerAddress(address.id)
    setRemoving(false)
  }

  return (
    <>
      <div
        className={clx(
          "border p-6 min-h-[200px] flex flex-col justify-between transition-colors",
          isActive
            ? "border-hunter-gold"
            : "border-[var(--theme-border)] hover:border-[var(--theme-text-muted)]"
        )}
        data-testid="address-container"
      >
        <div className="flex flex-col gap-1">
          <p
            className="font-display text-[18px] leading-[1.1] text-[var(--theme-text)]"
            data-testid="address-name"
          >
            {address.first_name} {address.last_name}
          </p>
          {address.company && (
            <p
              className="font-sans text-[10px] uppercase tracking-[2px] text-[var(--theme-text-muted)]"
              data-testid="address-company"
            >
              {address.company}
            </p>
          )}
          <div className="flex flex-col font-sans text-[12px] text-[var(--theme-text-muted)] mt-2 gap-0.5">
            <span data-testid="address-address">
              {address.address_1}
              {address.address_2 && `, ${address.address_2}`}
            </span>
            <span data-testid="address-postal-city">
              {address.postal_code}, {address.city}
            </span>
            <span data-testid="address-province-country">
              {address.province && `${address.province}, `}
              {address.country_code?.toUpperCase()}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-5 mt-5 pt-4 border-t border-[var(--theme-border)]">
          <button
            className="font-sans text-[9px] uppercase tracking-[3px] text-[var(--theme-text-muted)] hover:text-hunter-gold transition-colors border-b border-current pb-0.5"
            onClick={open}
            data-testid="address-edit-button"
          >
            Edit
          </button>
          <button
            className="font-sans text-[9px] uppercase tracking-[3px] text-[var(--theme-text-muted)] hover:text-rose-500 transition-colors flex items-center gap-1.5"
            onClick={removeAddress}
            data-testid="address-delete-button"
          >
            {removing ? (
              <Spinner className="w-3 h-3 animate-spin" />
            ) : (
              <Trash className="w-3 h-3" />
            )}
            Remove
          </button>
        </div>
      </div>

      <Modal isOpen={state} close={close} data-testid="edit-address-modal">
        <Modal.Title>
          <span className="font-display text-[22px] leading-[1]">Edit address</span>
        </Modal.Title>
        <form action={formAction}>
          <input type="hidden" name="addressId" value={address.id} />
          <Modal.Body>
            <div className="grid grid-cols-1 gap-y-2 w-full">
              <div className="grid grid-cols-2 gap-x-2">
                <Input label="First name" name="first_name" required autoComplete="given-name" defaultValue={address.first_name || undefined} data-testid="first-name-input" />
                <Input label="Last name" name="last_name" required autoComplete="family-name" defaultValue={address.last_name || undefined} data-testid="last-name-input" />
              </div>
              <Input label="Company" name="company" autoComplete="organization" defaultValue={address.company || undefined} data-testid="company-input" />
              <Input label="Address" name="address_1" required autoComplete="address-line1" defaultValue={address.address_1 || undefined} data-testid="address-1-input" />
              <Input label="Apartment, suite, etc." name="address_2" autoComplete="address-line2" defaultValue={address.address_2 || undefined} data-testid="address-2-input" />
              <div className="grid grid-cols-[144px_1fr] gap-x-2">
                <Input label="Postal code" name="postal_code" required autoComplete="postal-code" defaultValue={address.postal_code || undefined} data-testid="postal-code-input" />
                <Input label="City" name="city" required autoComplete="locality" defaultValue={address.city || undefined} data-testid="city-input" />
              </div>
              <Input label="Province / State" name="province" autoComplete="address-level1" defaultValue={address.province || undefined} data-testid="state-input" />
              <CountrySelect name="country_code" region={region} required autoComplete="country" defaultValue={address.country_code || undefined} data-testid="country-select" />
              <Input label="Phone" name="phone" autoComplete="phone" defaultValue={address.phone || undefined} data-testid="phone-input" />
            </div>
            {formState.error && (
              <p className="font-sans text-[10px] text-rose-500 mt-2">{formState.error}</p>
            )}
          </Modal.Body>
          <Modal.Footer>
            <div className="flex gap-3 mt-6">
              <button
                type="reset"
                onClick={close}
                className="h-10 px-6 font-sans text-[10px] uppercase tracking-[3px] border border-[var(--theme-border)] text-[var(--theme-text-muted)] hover:border-[var(--theme-text-muted)] transition-colors"
                data-testid="cancel-button"
              >
                Cancel
              </button>
              <SubmitButton
                className="h-10 px-6 rounded-none !bg-hunter-gold !text-hunter-dark !border-transparent font-sans uppercase tracking-[3px] text-[10px]"
                data-testid="save-button"
              >
                Save
              </SubmitButton>
            </div>
          </Modal.Footer>
        </form>
      </Modal>
    </>
  )
}

export default EditAddress
