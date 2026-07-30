"use client"
import "leaflet/dist/leaflet.css"
import L from "leaflet"
import { useEffect, useRef } from "react"
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet"
import { EawbLocker } from "@lib/data/fulfillment"
import { lockerIcon, selectedLockerIcon } from "./leaflet-icons"

const ROMANIA_CENTER: [number, number] = [45.9432, 24.9668]
const ROMANIA_ZOOM = 6
const MAX_FIT_ZOOM = 15

type LockerMapProps = {
  lockers: EawbLocker[]
  selectedLocker: EawbLocker | null
  onSelect: (locker: EawbLocker) => void
}

function FitToLockers({
  lockers,
  selectedLocker,
}: {
  lockers: EawbLocker[]
  selectedLocker: EawbLocker | null
}) {
  const map = useMap()
  const hasFitOnce = useRef(false)

  useEffect(() => {
    if (selectedLocker?.lat != null && selectedLocker?.lng != null) {
      map.setView([selectedLocker.lat, selectedLocker.lng], Math.min(map.getZoom(), MAX_FIT_ZOOM))
      return
    }

    const withCoords = lockers.filter((l) => l.lat != null && l.lng != null)
    if (withCoords.length === 0) {
      if (!hasFitOnce.current) {
        map.setView(ROMANIA_CENTER, ROMANIA_ZOOM)
        hasFitOnce.current = true
      }
      return
    }

    const bounds = L.latLngBounds(
      withCoords.map((l) => [l.lat as number, l.lng as number])
    )
    map.fitBounds(bounds, { maxZoom: MAX_FIT_ZOOM, padding: [24, 24] })
    hasFitOnce.current = true
    // Only re-fit when the set of visible lockers changes (e.g. search filter),
    // not on every selection change (handled above via setView instead).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lockers])

  return null
}

export default function LockerMap({ lockers, selectedLocker, onSelect }: LockerMapProps) {
  const withCoords = lockers.filter((l) => l.lat != null && l.lng != null)

  return (
    <div className="h-56 sm:h-72 md:h-80 w-full">
      <MapContainer
        center={ROMANIA_CENTER}
        zoom={ROMANIA_ZOOM}
        scrollWheelZoom={false}
        className="h-full w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FitToLockers lockers={withCoords} selectedLocker={selectedLocker} />
        {withCoords.map((locker) => (
          <Marker
            key={locker.id}
            position={[locker.lat as number, locker.lng as number]}
            icon={selectedLocker?.id === locker.id ? selectedLockerIcon : lockerIcon}
            eventHandlers={{ click: () => onSelect(locker) }}
          >
            <Popup>
              <span className="font-sans text-[12px]">
                <strong>{locker.name}</strong>
                <br />
                {locker.address}
              </span>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  )
}
