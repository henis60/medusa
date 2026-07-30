import L from "leaflet"

// Leaflet's default marker icon URLs are relative and break under Next/webpack
// bundling. Rather than patch the default icon path, we define explicit divIcons
// so pins render correctly and a selected locker can be styled distinctly.
function pinIcon(color: string) {
  return L.divIcon({
    className: "",
    html: `<svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
      <path d="M16 2C9.4 2 4 7.4 4 14c0 8.5 10.5 15.5 11 15.8.3.2.7.2 1 0 .5-.3 11-7.3 11-15.8 0-6.6-5.4-12-12-12z" fill="${color}" stroke="#FFFFFF" stroke-width="1"/>
      <circle cx="16" cy="14" r="4.5" fill="#FFFFFF"/>
    </svg>`,
    iconSize: [32, 32],
    iconAnchor: [16, 30],
    popupAnchor: [0, -28],
  })
}

export const lockerIcon = pinIcon("#C9A84C")
export const selectedLockerIcon = pinIcon("#1B4D3E")

// Marks the customer's geocoded street address, distinct from locker pins.
export const addressIcon = L.divIcon({
  className: "",
  html: `<svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
    <circle cx="10" cy="10" r="7" fill="#355E3B"/>
  </svg>`,
  iconSize: [20, 20],
  iconAnchor: [10, 10],
  popupAnchor: [0, -8],
})
