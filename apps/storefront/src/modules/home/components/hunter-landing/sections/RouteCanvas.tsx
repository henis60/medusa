"use client"

import { useEffect, useRef } from "react"

export default function RouteCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const cvs = canvasRef.current
    if (!cvs) return
    const ctx = cvs.getContext("2d")
    if (!ctx) return
    let stopped = false

    function resize() {
      cvs!.width = cvs!.offsetWidth
      cvs!.height = cvs!.offsetHeight
    }

    const ro = new ResizeObserver(() => resize())
    ro.observe(cvs)

    const CITIES = [
      { name: "The Hunter House", px: 0.65, py: 0.55, hub: true }, // Baia Mare 23.6°E 47.7°N
      { name: "Londra", px: 0.25, py: 0.4, hub: false }, // -0.1°E 51.5°N
      { name: "Edinburgh", px: 0.18, py: 0.23, hub: false }, // -3.2°E 56.0°N
      { name: "Milano", px: 0.44, py: 0.64, hub: false }, //  9.2°E 45.5°N
      { name: "Paris", px: 0.3, py: 0.51, hub: false }, //  2.4°E 48.9°N
      { name: "Viena", px: 0.59, py: 0.53, hub: false }, // 16.4°E 48.2°N
      { name: "Florenta", px: 0.49, py: 0.7, hub: false }, // 11.3°E 43.8°N
      { name: "Berlin", px: 0.53, py: 0.37, hub: false }, // 13.4°E 52.5°N
      { name: "Madrid", px: 0.17, py: 0.83, hub: false }, // -3.7°E 40.4°N
      { name: "Lisabona", px: 0.06, py: 0.89, hub: false }, // -9.1°E 38.7°N
      { name: "Zurich", px: 0.43, py: 0.56, hub: false }, //  8.5°E 47.4°N
      { name: "Praga", px: 0.55, py: 0.46, hub: false }, // 14.4°E 50.1°N
    ]
    const cxF = (c: { px: number }) => c.px * cvs.width
    const cyF = (c: { py: number }) => c.py * cvs.height

    type Arc = {
      from: (typeof CITIES)[0]
      to: (typeof CITIES)[0]
      t: number
      speed: number
      color: string
      trail: { x: number; y: number; age: number }[]
      particles: {
        x: number
        y: number
        vx: number
        vy: number
        life: number
        color: string
      }[]
      done: boolean
    }
    const arcs: Arc[] = []
    const MAX_ARCS = 7

    function spawnArc() {
      const src = CITIES[1 + Math.floor(Math.random() * (CITIES.length - 1))]
      const toHub = Math.random() > 0.35
      arcs.push({
        from: toHub ? src : CITIES[0],
        to: toHub ? CITIES[0] : src,
        t: 0,
        speed: 0.0025 + Math.random() * 0.0018,
        color: Math.random() > 0.45 ? "rgba(201,168,76," : "rgba(42,107,85,",
        trail: [],
        particles: [],
        done: false,
      })
    }

    const pulses = CITIES.map(() => ({ phase: Math.random() * Math.PI * 2 }))
    const bgDots = Array.from({ length: 55 }, () => ({
      x: Math.random(),
      y: Math.random(),
      r: 0.4 + Math.random() * 1.2,
      alpha: 0.04 + Math.random() * 0.08,
      speed: 0.00008 + Math.random() * 0.00015,
      dy: (Math.random() - 0.5) * 0.0003,
    }))

    function bezier(
      x1: number,
      y1: number,
      x2: number,
      y2: number,
      cpx: number,
      cpy: number,
      t: number
    ) {
      const mt = 1 - t
      return {
        x: mt * mt * x1 + 2 * mt * t * cpx + t * t * x2,
        y: mt * mt * y1 + 2 * mt * t * cpy + t * t * y2,
      }
    }

    function controlPt(from: (typeof CITIES)[0], to: (typeof CITIES)[0]) {
      const mx = (cxF(from) + cxF(to)) * 0.5
      const my = (cyF(from) + cyF(to)) * 0.5
      const dx = cxF(to) - cxF(from)
      const dy = cyF(to) - cyF(from)
      const len = Math.sqrt(dx * dx + dy * dy)
      return { x: mx - dy * 0.38, y: my + dx * 0.18 - len * 0.22 }
    }

    let _cvVisible = false
    const cvObs = new IntersectionObserver(
      (entries) => {
        _cvVisible = entries[0].isIntersecting
        if (_cvVisible && !stopped) {
          last = performance.now()
          requestAnimationFrame(frame)
        }
      },
      { threshold: 0.01 }
    )
    cvObs.observe(cvs)

    let last = performance.now()
    function frame(now: number) {
      if (stopped || !_cvVisible) return
      requestAnimationFrame(frame)
      const dt = Math.min(now - last, 40)
      last = now
      const W = cvs!.width,
        H = cvs!.height
      ctx!.clearRect(0, 0, W, H)
      ctx!.fillStyle = "#0b120e"
      ctx!.fillRect(0, 0, W, H)

      ctx!.strokeStyle = "rgba(201,168,76,.028)"
      ctx!.lineWidth = 1
      for (let x = 0; x < W; x += 48) {
        ctx!.beginPath()
        ctx!.moveTo(x, 0)
        ctx!.lineTo(x, H)
        ctx!.stroke()
      }
      for (let y = 0; y < H; y += 48) {
        ctx!.beginPath()
        ctx!.moveTo(0, y)
        ctx!.lineTo(W, y)
        ctx!.stroke()
      }

      bgDots.forEach((d) => {
        d.x = (d.x + d.speed + 1) % 1
        d.y = (d.y + d.dy + 1) % 1
        ctx!.beginPath()
        ctx!.arc(d.x * W, d.y * H, d.r, 0, Math.PI * 2)
        ctx!.fillStyle = `rgba(201,168,76,${d.alpha})`
        ctx!.fill()
      })

      if (
        arcs.filter((a) => !a.done).length < MAX_ARCS &&
        Math.random() < 0.025
      )
        spawnArc()

      arcs.forEach((arc) => {
        if (arc.done) return
        arc.t = Math.min(arc.t + arc.speed * dt, 1)
        const cp = controlPt(arc.from, arc.to)
        const x1 = cxF(arc.from),
          y1 = cyF(arc.from)
        const x2 = cxF(arc.to),
          y2 = cyF(arc.to)
        const pos = bezier(x1, y1, x2, y2, cp.x, cp.y, arc.t)
        arc.trail.push({ ...pos, age: 0 })
        arc.trail.forEach((p) => (p.age += dt))
        while (arc.trail.length > 1 && arc.trail[0].age > 420) arc.trail.shift()
        if (arc.trail.length > 1) {
          for (let i = 1; i < arc.trail.length; i++) {
            const p0 = arc.trail[i - 1],
              p1 = arc.trail[i]
            ctx!.beginPath()
            ctx!.moveTo(p0.x, p0.y)
            ctx!.lineTo(p1.x, p1.y)
            ctx!.strokeStyle = arc.color + (i / arc.trail.length) * 0.65 + ")"
            ctx!.lineWidth = 1.5
            ctx!.stroke()
          }
        }
        const grd = ctx!.createRadialGradient(pos.x, pos.y, 0, pos.x, pos.y, 7)
        grd.addColorStop(0, arc.color + ".9)")
        grd.addColorStop(1, arc.color + "0)")
        ctx!.beginPath()
        ctx!.arc(pos.x, pos.y, 7, 0, Math.PI * 2)
        ctx!.fillStyle = grd
        ctx!.fill()
        ctx!.beginPath()
        ctx!.arc(pos.x, pos.y, 1.8, 0, Math.PI * 2)
        ctx!.fillStyle = arc.color + "1)"
        ctx!.fill()
        if (arc.t >= 1) {
          arc.done = true
          for (let k = 0; k < 12; k++) {
            const ang = (k / 12) * Math.PI * 2
            const spd = 0.4 + Math.random() * 0.9
            arc.particles.push({
              x: pos.x,
              y: pos.y,
              vx: Math.cos(ang) * spd,
              vy: Math.sin(ang) * spd,
              life: 1,
              color: arc.color,
            })
          }
        }
      })

      arcs.forEach((arc) => {
        arc.particles = arc.particles.filter((p) => p.life > 0)
        arc.particles.forEach((p) => {
          p.x += p.vx
          p.y += p.vy
          p.vx *= 0.88
          p.vy *= 0.88
          p.life -= 0.04
          ctx!.beginPath()
          ctx!.arc(p.x, p.y, 1.2, 0, Math.PI * 2)
          ctx!.fillStyle = p.color + p.life + ")"
          ctx!.fill()
        })
      })
      for (let i = arcs.length - 1; i >= 0; i--) {
        if (arcs[i].done && arcs[i].particles.length === 0) arcs.splice(i, 1)
      }

      CITIES.forEach((c, i) => {
        pulses[i].phase += 0.018
        const px = cxF(c),
          py = cyF(c)
        const isHub = c.hub
        const baseR = isHub ? 4.5 : 2.8
        const pulse = Math.sin(pulses[i].phase) * 0.5 + 0.5
        const ringR = baseR + (isHub ? 14 : 9) * pulse
        const ringAlpha = (1 - pulse) * (isHub ? 0.35 : 0.2)
        ctx!.beginPath()
        ctx!.arc(px, py, ringR, 0, Math.PI * 2)
        ctx!.strokeStyle = isHub
          ? `rgba(201,168,76,${ringAlpha})`
          : `rgba(42,107,85,${ringAlpha})`
        ctx!.lineWidth = 1
        ctx!.stroke()
        if (isHub) {
          const r2 = baseR + 26 * pulse
          ctx!.beginPath()
          ctx!.arc(px, py, r2, 0, Math.PI * 2)
          ctx!.strokeStyle = `rgba(201,168,76,${(1 - pulse) * 0.12})`
          ctx!.lineWidth = 0.8
          ctx!.stroke()
        }
        const grd = ctx!.createRadialGradient(px, py, 0, px, py, baseR * 3)
        if (isHub) {
          grd.addColorStop(0, "rgba(201,168,76,.45)")
          grd.addColorStop(1, "rgba(201,168,76,0)")
        } else {
          grd.addColorStop(0, "rgba(42,107,85,.3)")
          grd.addColorStop(1, "rgba(42,107,85,0)")
        }
        ctx!.beginPath()
        ctx!.arc(px, py, baseR * 3, 0, Math.PI * 2)
        ctx!.fillStyle = grd
        ctx!.fill()
        ctx!.beginPath()
        ctx!.arc(px, py, baseR, 0, Math.PI * 2)
        ctx!.fillStyle = isHub ? "rgba(201,168,76,.95)" : "rgba(42,107,85,.8)"
        ctx!.fill()
        ctx!.beginPath()
        ctx!.arc(px, py, baseR * 0.45, 0, Math.PI * 2)
        ctx!.fillStyle = "rgba(245,240,232,.7)"
        ctx!.fill()
        const small = W < 480
        ctx!.font = isHub
          ? `400 ${small ? 8 : 11}px 'Raleway',sans-serif`
          : `300 ${small ? 7 : 9.5}px 'Raleway',sans-serif`
        ctx!.letterSpacing = isHub
          ? small
            ? "1.5px"
            : "3.5px"
          : small
          ? "1px"
          : "2.5px"
        const label = c.name.toUpperCase()
        const textW = ctx!.measureText(label).width
        // flip to left if placing right would overflow canvas edge
        const wouldOverflowRight = px + 10 + textW + 8 > W - 4
        const wouldOverflowLeft = px - textW - 12 < 4
        // on mobile, place city names (non-hub) above the dot, centered-right
        const mobileCity = small && !isHub
        const lxRaw = mobileCity
          ? px - textW * 0.35
          : wouldOverflowRight && !wouldOverflowLeft
          ? px - textW - 12
          : px + 10
        const lx = Math.max(4, Math.min(lxRaw, W - textW - 8))
        const ty = py - baseR - (mobileCity ? 12 : 6)

        ctx!.fillStyle = isHub ? "rgba(201,168,76,.95)" : "rgba(201,168,76,.82)"
        ctx!.fillText(label, lx, ty)
        ctx!.letterSpacing = "0px"
      })
    }

    return () => {
      stopped = true
      cvObs.disconnect()
      ro.disconnect()
    }
  }, [])

  return <canvas ref={canvasRef} id="dvizCanvas" aria-hidden="true" />
}
