"use client"

import { useState } from "react"
import AppointmentButton from "@modules/layout/components/appointment-button"
import AppointmentModal from "@modules/layout/components/appointment-modal"

type Props = {
  transparent?: boolean
  hideOnTop?: boolean
}

export default function AppointmentWidget({ transparent, hideOnTop }: Props) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <AppointmentButton
        transparent={transparent}
        hideOnTop={hideOnTop}
        onClick={() => setOpen(true)}
      />
      <AppointmentModal open={open} onClose={() => setOpen(false)} />
    </>
  )
}
