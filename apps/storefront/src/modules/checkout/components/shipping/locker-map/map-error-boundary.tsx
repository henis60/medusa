"use client"
import { Component, ReactNode } from "react"

// If the map fails to load/render, the combobox above stays fully functional —
// checkout must never be blocked by a Leaflet/tile failure.
export default class MapErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  render() {
    if (this.state.hasError) return null
    return this.props.children
  }
}
