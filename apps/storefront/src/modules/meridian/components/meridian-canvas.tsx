"use client"

import { useEffect, useRef } from "react"

/**
 * Globe with the meridian through Baia Mare. The orthographic view is
 * centered well south of the whole cluster (VIEW_CENTER_LAT) so all 4
 * cities read in the globe's northern half instead of clustering near the
 * equator. Bucharest is not drawn — it's only a reference point for scale,
 * chosen because it's further from the view center than any labeled city.
 */
export default function MeridianCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const cvs = canvasRef.current
    if (!cvs) return
    const ctx = cvs.getContext("2d")
    if (!ctx) return

    // next/font exposes the loaded family through a CSS var, and canvas
    // ctx.font cannot resolve var() itself.
    const raleway =
      getComputedStyle(document.documentElement)
        .getPropertyValue("--font-raleway")
        .trim() || "Raleway"

    let stopped = false
    let visible = false
    let last = performance.now()
    let phase = 0
    let raf = 0

    const resize = () => {
      const dpr = window.devicePixelRatio || 1
      cvs.width = cvs.offsetWidth * dpr
      cvs.height = cvs.offsetHeight * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    const ro = new ResizeObserver(resize)
    ro.observe(cvs)
    resize()

    const BAIA_MARE = { lat: 47.6567, lon: 23.5847 }
    const BUCURESTI_REF = { lat: 44.4268, lon: 26.1025 }

    function frame(now: number) {
      if (stopped || !visible) return
      raf = requestAnimationFrame(frame)
      const dt = Math.min(now - last, 40)
      last = now
      phase += dt * 0.00035

      const W = cvs!.offsetWidth
      const H = cvs!.offsetHeight
      ctx!.clearRect(0, 0, W, H)
      const cx = W / 2
      const cy = H / 2
      const R = Math.min(W, H) * 0.4
      const drift = Math.sin(phase * 0.4) * 0.04

      ctx!.strokeStyle = "rgba(201,168,76,0.5)"
      ctx!.lineWidth = 1.2
      ctx!.beginPath()
      ctx!.arc(cx, cy, R, 0, Math.PI * 2)
      ctx!.stroke()

      ctx!.strokeStyle = "rgba(201,168,76,0.1)"
      ctx!.lineWidth = 1
      ctx!.setLineDash([2, 4])
      ctx!.beginPath()
      ctx!.arc(cx, cy, R + 10, 0, Math.PI * 2)
      ctx!.stroke()
      ctx!.setLineDash([])

      ctx!.strokeStyle = "rgba(201,168,76,0.07)"
      ;[0.18, 0.5, 0.82].forEach((f, i) => {
        ctx!.beginPath()
        ctx!.ellipse(
          cx,
          cy,
          Math.max(R * (f + drift * (i - 1)), 2),
          R,
          0,
          0,
          Math.PI * 2
        )
        ctx!.stroke()
      })
      ;[-0.4, 0.4].forEach((f) => {
        ctx!.beginPath()
        ctx!.ellipse(
          cx,
          cy + f * R,
          R * Math.sqrt(Math.max(1 - f * f, 0)),
          R * 0.22 * Math.sqrt(Math.max(1 - f * f, 0)),
          0,
          0,
          Math.PI * 2
        )
        ctx!.stroke()
      })
      ctx!.strokeStyle = "rgba(201,168,76,0.1)"
      ctx!.beginPath()
      ctx!.moveTo(cx - R, cy)
      ctx!.lineTo(cx + R, cy)
      ctx!.stroke()

      const cities = [
        { lat: 51.5072, lon: -0.1276, label: "LONDRA", ly: -12, hub: false },
        { lat: 48.8566, lon: 2.3522, label: "PARIS", ly: -12, hub: false },
        { lat: 48.2082, lon: 16.3738, label: "VIENA", ly: 12, hub: false },
        {
          lat: BAIA_MARE.lat,
          lon: BAIA_MARE.lon,
          label: "BAIA MARE",
          ly: 0,
          hub: true,
        },
      ].map((c) => ({ ...c, ox: 0, oy: 0, ex: 0, ey: 0 }))

      // Orthographic projection (view of the sphere from directly above the
      // center point) — matches the meridian/parallel ellipses already drawn
      // for the globe, so cities land where they'd actually appear on a
      // globe centered here instead of a flat lat/lon grid stretched to fit.
      // The camera's latitude sits well south of the whole cluster (roughly
      // the Mediterranean) so all 4 cities — Baia Mare included — read
      // clearly in the globe's northern half, rather than centering on the
      // cluster itself, which put Baia Mare (its southernmost point)
      // ambiguously close to dead-center.
      const VIEW_CENTER_LAT = 44
      const lons = cities.map((c) => c.lon)
      const lonMid = (Math.max(...lons) + Math.min(...lons)) / 2
      const lat0 = (VIEW_CENTER_LAT * Math.PI) / 180
      const lon0 = (lonMid * Math.PI) / 180

      const project = (latDeg: number, lonDeg: number) => {
        const lat = (latDeg * Math.PI) / 180
        const lon = (lonDeg * Math.PI) / 180
        const dLon = lon - lon0
        return {
          x: Math.cos(lat) * Math.sin(dLon),
          y: -(
            Math.cos(lat0) * Math.sin(lat) -
            Math.sin(lat0) * Math.cos(lat) * Math.cos(dLon)
          ),
        }
      }

      cities.forEach((c) => {
        const p = project(c.lat, c.lon)
        c.ox = p.x
        c.oy = p.y
      })
      const refP = project(BUCURESTI_REF.lat, BUCURESTI_REF.lon)
      const maxMag = Math.max(
        ...cities.map((c) => Math.max(Math.abs(c.ox), Math.abs(c.oy))),
        Math.abs(refP.x),
        Math.abs(refP.y)
      )
      const scale = (R * 0.78) / maxMag
      cities.forEach((c) => {
        c.ex = cx + c.ox * scale
        c.ey = cy + c.oy * scale
      })
      const hub = cities.find((c) => c.hub)!

      // Decorative meridian arc, matching the same style as the faded
      // background meridian lines below (an ellipse spanning the full
      // pole-to-pole height, semi-height R) — solved so it actually passes
      // through Baia Mare's real, off-center position instead of assuming
      // the hub sits at the vertical middle.
      const side = hub.ex >= cx ? 1 : -1
      const vFrac = Math.min(Math.max((hub.ey - cy) / R, -0.999), 0.999)
      const meridianHalfW =
        Math.abs(hub.ex - cx) / Math.sqrt(Math.max(1 - vFrac * vFrac, 0.0001))
      const onMeridian = (t: number) => {
        const theta = -Math.PI / 2 + t * Math.PI
        return {
          x: cx + side * meridianHalfW * Math.cos(theta),
          y: cy + R * Math.sin(theta),
        }
      }

      const grad = ctx!.createLinearGradient(cx, cy - R, cx, cy + R)
      grad.addColorStop(0, "rgba(201,168,76,0.15)")
      grad.addColorStop(0.5, "rgba(201,168,76,0.9)")
      grad.addColorStop(1, "rgba(201,168,76,0.15)")
      ctx!.strokeStyle = grad
      ctx!.lineWidth = 1.8
      ctx!.beginPath()
      ctx!.ellipse(
        cx,
        cy,
        meridianHalfW,
        R,
        0,
        side >= 0 ? -Math.PI / 2 : Math.PI / 2,
        side >= 0 ? Math.PI / 2 : (3 * Math.PI) / 2
      )
      ctx!.stroke()

      cities
        .filter((c) => !c.hub)
        .forEach((c) => {
          ctx!.strokeStyle = "rgba(201,168,76,0.3)"
          ctx!.lineWidth = 1
          ctx!.beginPath()
          ctx!.moveTo(c.ex, c.ey)
          ctx!.quadraticCurveTo(
            (c.ex + hub.ex) / 2,
            (c.ey + hub.ey) / 2 - R * 0.1,
            hub.ex,
            hub.ey
          )
          ctx!.stroke()
          ctx!.beginPath()
          ctx!.arc(c.ex, c.ey, 3, 0, Math.PI * 2)
          ctx!.fillStyle = "rgba(232,213,163,0.75)"
          ctx!.fill()
          ctx!.font = `8px ${raleway}, sans-serif`
          ctx!.textAlign = "center"
          ctx!.fillStyle = "rgba(232,213,163,0.55)"
          ctx!.fillText(c.label, c.ex, c.ey + c.ly)
        })

      const rx = cx + R * 0.98
      const ry = cy - R * 0.98
      const rr = 13
      ctx!.strokeStyle = "rgba(201,168,76,0.4)"
      ctx!.lineWidth = 1
      ctx!.beginPath()
      ctx!.arc(rx, ry, rr, 0, Math.PI * 2)
      ctx!.stroke()
      ctx!.beginPath()
      ctx!.moveTo(rx, ry - rr)
      ctx!.lineTo(rx + 3, ry - 2)
      ctx!.lineTo(rx, ry - 5)
      ctx!.lineTo(rx - 3, ry - 2)
      ctx!.closePath()
      ctx!.fillStyle = "rgba(201,168,76,0.85)"
      ctx!.fill()
      ctx!.beginPath()
      ctx!.moveTo(rx, ry - rr + 2)
      ctx!.lineTo(rx, ry + rr - 2)
      ctx!.moveTo(rx - rr + 2, ry)
      ctx!.lineTo(rx + rr - 2, ry)
      ctx!.strokeStyle = "rgba(201,168,76,0.3)"
      ctx!.stroke()
      ctx!.font = `7px ${raleway}, sans-serif`
      ctx!.textAlign = "center"
      ctx!.fillStyle = "rgba(201,168,76,0.75)"
      ctx!.fillText("N", rx, ry - rr - 4)
      ctx!.fillText("S", rx, ry + rr + 8)
      ctx!.textAlign = "right"
      ctx!.fillText("V", rx - rr - 4, ry + 3)
      ctx!.textAlign = "left"
      ctx!.fillText("E", rx + rr + 4, ry + 3)

      const t = (Math.sin(phase) + 1) / 2
      const sunPoint = onMeridian(t)
      const sunX = sunPoint.x
      const sunY = sunPoint.y
      const glow = ctx!.createRadialGradient(sunX, sunY, 0, sunX, sunY, 11)
      glow.addColorStop(0, "rgba(232,213,163,0.95)")
      glow.addColorStop(1, "rgba(232,213,163,0)")
      ctx!.fillStyle = glow
      ctx!.beginPath()
      ctx!.arc(sunX, sunY, 11, 0, Math.PI * 2)
      ctx!.fill()
      ctx!.fillStyle = "rgba(245,240,232,0.95)"
      ctx!.beginPath()
      ctx!.arc(sunX, sunY, 2.2, 0, Math.PI * 2)
      ctx!.fill()

      const pulse = (Math.sin(phase * 3) + 1) / 2
      ctx!.beginPath()
      ctx!.arc(hub.ex, hub.ey, 9 + pulse * 6, 0, Math.PI * 2)
      ctx!.strokeStyle = `rgba(201,168,76,${0.35 - pulse * 0.2})`
      ctx!.lineWidth = 1
      ctx!.stroke()

      ctx!.beginPath()
      ctx!.arc(hub.ex, hub.ey, 4.5, 0, Math.PI * 2)
      ctx!.fillStyle = "#c9a84c"
      ctx!.fill()
      ctx!.beginPath()
      ctx!.arc(hub.ex, hub.ey, 8.5, 0, Math.PI * 2)
      ctx!.strokeStyle = "rgba(201,168,76,0.4)"
      ctx!.lineWidth = 1
      ctx!.stroke()

      ctx!.font = `10px ${raleway}, sans-serif`
      ctx!.textAlign = "center"
      ctx!.fillStyle = "rgba(201,168,76,0.8)"
      ctx!.fillText("BAIA MARE", hub.ex, hub.ey - 18)
    }

    const io = new IntersectionObserver(
      (entries) => {
        visible = entries[0].isIntersecting
        if (visible && !stopped) {
          last = performance.now()
          raf = requestAnimationFrame(frame)
        }
      },
      { threshold: 0.01 }
    )
    io.observe(cvs)

    return () => {
      stopped = true
      io.disconnect()
      ro.disconnect()
      if (raf) cancelAnimationFrame(raf)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{ width: "100%", height: "100%" }}
    />
  )
}
