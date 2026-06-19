// Modern, lightweight line icons for the header — consistent 1.5 stroke,
// rounded caps, currentColor (so they inherit ivory/gold from the nav).
import * as React from "react"

type IconProps = {
  size?: number
  className?: string
}

const base = (size: number, className?: string): React.SVGProps<SVGSVGElement> => ({
  viewBox: "0 0 24 24",
  style: { width: size, height: size, flexShrink: 0 },
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
  className,
})

export const MenuIcon = ({ size = 26, className }: IconProps) => (
  <svg {...base(size, className)}>
    <path d="M4 9h16M4 15h16" />
  </svg>
)

export const BagIcon = ({ size = 26, className }: IconProps) => (
  <svg {...base(size, className)}>
    <rect x="2" y="8" width="20" height="14" rx="1" />
    <path d="M8 8V6a4 4 0 0 1 8 0v2" />
  </svg>
)

export const UserIcon = ({ size = 26, className }: IconProps) => (
  <svg {...base(size, className)}>
    <circle cx="12" cy="8.25" r="3.4" />
    <path d="M5.5 20a6.5 6.5 0 0 1 13 0" />
  </svg>
)

export const ShopIcon = ({ size = 26, className }: IconProps) => (
  <svg {...base(size, className)}>
    <path d="M3 9h18M9 9V5a3 3 0 0 1 6 0v4" />
    <rect x="3" y="9" width="18" height="12" rx="1" />
  </svg>
)

export const CartIcon = ({ size = 26, className }: IconProps) => (
  <svg {...base(size, className)}>
    <path d="M3 4h2.1l1.9 11.1a1.4 1.4 0 0 0 1.4 1.2h7.8a1.4 1.4 0 0 0 1.4-1.1L20.5 8H6.4" />
    <circle cx="9.5" cy="20" r="1.3" />
    <circle cx="16.5" cy="20" r="1.3" />
  </svg>
)
