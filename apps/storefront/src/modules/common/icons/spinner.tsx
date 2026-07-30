import React from "react"

import { IconProps } from "types/icon"

// A single thin arc rather than the previous bold two-tone (opacity-25 ring +
// opacity-75 solid wedge) spinner — quieter, more in line with the site's
// restrained editorial tone.
const Spinner: React.FC<IconProps> = ({
  size = "16",
  color = "currentColor",
  ...attributes
}) => {
  return (
    <svg
      className="animate-spin"
      width={size}
      height={size}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      {...attributes}
    >
      <circle cx="12" cy="12" r="10" stroke={color} strokeWidth="1.5" strokeOpacity="0.2" />
      <path
        d="M22 12a10 10 0 0 0-10-10"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  )
}

export default Spinner
