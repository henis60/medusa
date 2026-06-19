/* eslint-disable */
// @ts-nocheck
/**
 * THE HUNTER HOUSE — landing-page runtime.
 *
 * Faithful port of the original index.html inline scripts (custom cursor,
 * countdown, scroll reveals, count-ups, canvas arc-network, zone carousel,
 * shop-card carousels, gift-card selector, back-to-top, dot-nav, email modal
 * and Brevo form). All listeners are registered with an AbortController signal,
 * intervals/observers are tracked, and a `stopped` flag halts every rAF loop —
 * so the returned cleanup fully tears the page down (StrictMode + client nav).
 */
export function initHunterLanding(): () => void {
  if (typeof window === "undefined" || typeof document === "undefined") {
    return () => {}
  }

  const ac = new AbortController()
  const signal = ac.signal
  const intervals: number[] = []
  const observers: IntersectionObserver[] = []
  let stopped = false
  const injectedStyles: HTMLStyleElement[] = []

  document.body.classList.add("hunter-landing-active")

  /* ═══════ CURSOR ═══════ */
  const cur = document.getElementById("cur"),
    curR = document.getElementById("curR")
  let mx = -200,
    my = -200,
    rx = -200,
    ry = -200
  document.addEventListener(
    "mousemove",
    (e) => {
      mx = e.clientX
      my = e.clientY
    },
    { signal }
  )
  ;(function loop() {
    if (stopped) return
    if (cur) cur.style.cssText = `left:${mx}px;top:${my}px`
    rx += (mx - rx) * 0.1
    ry += (my - ry) * 0.1
    if (curR) curR.style.cssText = `left:${rx}px;top:${ry}px`
    requestAnimationFrame(loop)
  })()
  document
    .querySelectorAll(
      "a,button,.tf-btn,.modal-submit,.modal-close,.pillar,.svc,.ev,.mem,.sw,.mc,.dot-nav a"
    )
    .forEach((el) => {
      el.addEventListener(
        "mouseenter",
        () => document.body.classList.add("hovering"),
        { signal }
      )
      el.addEventListener(
        "mouseleave",
        () => document.body.classList.remove("hovering"),
        { signal }
      )
    })

  /* ═══════ LOGO CHAR SPLIT ═══════ */
  function animateChars(el, text, delay) {
    if (!el) return
    const frag = document.createDocumentFragment()
    ;[...text].forEach((ch, i) => {
      const s = document.createElement("span")
      s.className = "char"
      s.style.animationDelay = `${delay + i * 0.032}s`
      s.textContent = ch === " " ? " " : ch
      frag.appendChild(s)
    })
    el.innerHTML = ""
    el.appendChild(frag)
  }
  animateChars(document.getElementById("logoL1"), "THE HUNTER", 0.3)
  animateChars(document.getElementById("logoL2"), "house", 0.4)

  /* ═══════ PARALLAX ═══════ */
  const heroBg = document.getElementById("heroBg")
  const canUseParallax =
    window.matchMedia("(min-width: 1101px)").matches &&
    !window.matchMedia("(prefers-reduced-motion: reduce)").matches

  function parallax() {
    const sy = window.scrollY
    if (heroBg) heroBg.style.transform = `translateY(${sy * 0.35}px)`
  }
  if (canUseParallax) {
    let parallaxTicking = false
    window.addEventListener(
      "scroll",
      () => {
        if (parallaxTicking) return
        parallaxTicking = true
        requestAnimationFrame(() => {
          parallax()
          parallaxTicking = false
        })
      },
      { passive: true, signal }
    )
    parallax()
  } else {
    if (heroBg) heroBg.style.transform = "none"
  }

  /* ═══════ COUNTDOWN ═══════ */
  const launch = new Date("2026-08-01T12:00:00")
  const cdD = document.getElementById("cdD"),
    cdH = document.getElementById("cdH"),
    cdM = document.getElementById("cdM"),
    cdS = document.getElementById("cdS")

  function pad(n) {
    return String(n).padStart(2, "0")
  }
  function tick(el, v) {
    if (!el) return
    if (el.textContent !== v) {
      el.parentElement.classList.add("tick")
      el.textContent = v
      setTimeout(() => {
        if (!stopped && el.parentElement) el.parentElement.classList.remove("tick")
      }, 200)
    }
  }
  function updateCD() {
    if (!cdD || !cdH || !cdM || !cdS) return
    const diff = launch.getTime() - Date.now()
    if (diff <= 0) {
      cdD.textContent = cdH.textContent = cdM.textContent = cdS.textContent = "00"
      return
    }
    const days = Math.floor(diff / 86400000)
    const hours = Math.floor((diff % 86400000) / 3600000)
    const mins = Math.floor((diff % 3600000) / 60000)
    const secs = Math.floor((diff % 60000) / 1000)
    tick(cdD, pad(days))
    tick(cdH, pad(hours))
    tick(cdM, pad(mins))
    tick(cdS, pad(secs))
  }
  updateCD()
  intervals.push(window.setInterval(updateCD, 1000))

  /* ═══════ SCROLL REVEAL ═══════ */
  const rvEls = document.querySelectorAll(".rv,.rv-group,.line-draw,.kicker")
  const obs = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          const delay = (e.target as HTMLElement).style.transitionDelay || "0s"
          setTimeout(() => {
            if (!stopped) e.target.classList.add("visible")
          }, parseFloat(delay) * 1000)
          if (e.target.classList.contains("kicker"))
            e.target.classList.add("visible")
          obs.unobserve(e.target)
        }
      })
    },
    { threshold: 0.25, rootMargin: "0px 0px -80px 0px" }
  )
  rvEls.forEach((el) => obs.observe(el))
  observers.push(obs)

  /* ═══════ COUNT-UP NUMBERS ═══════ */
  const counters = document.querySelectorAll(".count-num")
  counters.forEach((c) => {
    c.textContent = "0"
  })

  function animateCounter(el) {
    const target = +el.dataset.target
    const suffix = el.dataset.suffix || ""
    const dur = 1600
    const start = Date.now()
    ;(function run() {
      if (stopped) return
      const p = Math.min((Date.now() - start) / dur, 1)
      const progress = target <= 10 ? p : 1 - Math.pow(1 - p, 3)
      el.textContent = Math.floor(progress * target) + suffix
      if (p < 1) {
        requestAnimationFrame(run)
        return
      }
      el.textContent = target + suffix
    })()
  }

  let countersStarted = false
  const cObs = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting || countersStarted) return
        countersStarted = true
        counters.forEach((counter) => animateCounter(counter))
        counters.forEach((counter) => cObs.unobserve(counter))
      })
    },
    { threshold: 0.4 }
  )
  counters.forEach((c) => cObs.observe(c))
  observers.push(cObs)

  /* ═══════ EVENT CARD BAR TRIGGER ═══════ */
  const evObs = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("visible")
          evObs.unobserve(e.target)
        }
      })
    },
    { threshold: 0.25 }
  )
  document.querySelectorAll(".ev").forEach((el) => evObs.observe(el))
  observers.push(evObs)

  /* ═══════ SPACE CAROUSEL — tap to advance + active zone on mobile ═══════ */
  ;(function () {
    const zonesEl = document.querySelector(".zones")
    if (!zonesEl) return
    const zoneEls = [...zonesEl.querySelectorAll(".zone")]
    if (!zoneEls.length) return

    var _rafPending = false
    var _cw = 0,
      _zw = 0
    function _cacheWidths() {
      _cw = (zonesEl as HTMLElement).offsetWidth
      _zw = zoneEls[0] ? (zoneEls[0] as HTMLElement).offsetWidth : 0
    }
    function updateActive() {
      if (window.innerWidth > 768) return
      var cw = _cw
      var sl = (zonesEl as HTMLElement).scrollLeft
      var zw = _zw
      var bestRatio = -1,
        bestZone = null
      zoneEls.forEach(function (z, i) {
        var zStart = i * zw
        var zEnd = zStart + zw
        var vis = Math.max(0, Math.min(zEnd, sl + cw) - Math.max(zStart, sl))
        var ratio = vis / zw
        if (ratio > bestRatio) {
          bestRatio = ratio
          bestZone = z
        }
      })
      if (bestZone) {
        zoneEls.forEach(function (z) {
          z.classList.remove("is-active")
        })
        bestZone.classList.add("is-active")
      }
    }
    function onScroll() {
      if (_rafPending) return
      _rafPending = true
      requestAnimationFrame(function () {
        _rafPending = false
        updateActive()
      })
    }
    function initCarousel() {
      if (window.innerWidth <= 768) {
        _cacheWidths()
        zonesEl.addEventListener("scroll", onScroll, { passive: true, signal })
        updateActive()
      } else {
        zoneEls.forEach(function (z) {
          z.classList.remove("is-active")
        })
      }
    }
    initCarousel()
    window.addEventListener(
      "resize",
      function () {
        _cacheWidths()
        initCarousel()
      },
      { signal }
    )

    var _tapStartX = 0,
      _tapStartY = 0
    zonesEl.addEventListener(
      "pointerdown",
      function (e) {
        _tapStartX = e.clientX
        _tapStartY = e.clientY
      },
      { passive: true, signal }
    )
    zonesEl.addEventListener(
      "click",
      function (e) {
        if (window.innerWidth > 768) return
        if (
          Math.abs(e.clientX - _tapStartX) > 10 ||
          Math.abs(e.clientY - _tapStartY) > 10
        )
          return
        if ((e.target as HTMLElement).closest(".zone.is-active")) return
        const zoneWidth = (zoneEls[0] as HTMLElement).offsetWidth
        const currentIndex = Math.round(
          (zonesEl as HTMLElement).scrollLeft / zoneWidth
        )
        const nextIndex = (currentIndex + 1) % zoneEls.length
        ;(zonesEl as HTMLElement).scrollTo({
          left: nextIndex * zoneWidth,
          behavior: "smooth",
        })
      },
      { signal }
    )
  })()

  /* ═══════ DATA-VIZ CANVAS (Stripe-style arc network) ═══════ */
  ;(function () {
    const cvs = document.getElementById("dvizCanvas") as HTMLCanvasElement | null
    if (!cvs) return
    const ctx = cvs.getContext("2d")
    if (!ctx) return

    function resize() {
      cvs.width = cvs.offsetWidth
      cvs.height = cvs.offsetHeight
    }
    resize()
    window.addEventListener("resize", resize, { signal })

    const CITIES = [
      { name: "The Hunter House", px: 0.5, py: 0.52, hub: true },
      { name: "Londra", px: 0.14, py: 0.18, hub: false },
      { name: "Edinburgh", px: 0.12, py: 0.1, hub: false },
      { name: "Milano", px: 0.38, py: 0.64, hub: false },
      { name: "Paris", px: 0.24, py: 0.3, hub: false },
      { name: "Viena", px: 0.55, py: 0.38, hub: false },
      { name: "Florenta", px: 0.38, py: 0.72, hub: false },
      { name: "Berlin", px: 0.52, py: 0.22, hub: false },
      { name: "Madrid", px: 0.14, py: 0.7, hub: false },
      { name: "Lisabona", px: 0.08, py: 0.75, hub: false },
      { name: "Zurich", px: 0.37, py: 0.44, hub: false },
      { name: "Praga", px: 0.52, py: 0.3, hub: false },
    ]
    function cx(c) {
      return c.px * cvs.width
    }
    function cy(c) {
      return c.py * cvs.height
    }
    const arcs = []
    const MAX_ARCS = 7
    function spawnArc() {
      const hub = CITIES[0]
      const src = CITIES[1 + Math.floor(Math.random() * (CITIES.length - 1))]
      const toHub = Math.random() > 0.35
      const from = toHub ? src : hub
      const to = toHub ? hub : src
      const speed = 0.0025 + Math.random() * 0.0018
      const isGold = Math.random() > 0.45
      arcs.push({
        from,
        to,
        t: 0,
        speed,
        color: isGold ? "rgba(201,168,76," : "rgba(42,107,85,",
        trail: [],
        particles: [],
        done: false,
        toHub,
      })
    }
    const pulses = CITIES.map(() => ({ phase: Math.random() * Math.PI * 2, r: 0 }))
    const bgDots = []
    for (let i = 0; i < 55; i++) {
      bgDots.push({
        x: Math.random(),
        y: Math.random(),
        r: 0.4 + Math.random() * 1.2,
        alpha: 0.04 + Math.random() * 0.08,
        speed: 0.00008 + Math.random() * 0.00015,
        dy: (Math.random() - 0.5) * 0.0003,
      })
    }
    function bezier(x1, y1, x2, y2, cx_, cy_, t) {
      const mt = 1 - t
      return {
        x: mt * mt * x1 + 2 * mt * t * cx_ + t * t * x2,
        y: mt * mt * y1 + 2 * mt * t * cy_ + t * t * y2,
      }
    }
    function controlPt(from, to) {
      const mx2 = (cx(from) + cx(to)) * 0.5
      const my2 = (cy(from) + cy(to)) * 0.5
      const dx = cx(to) - cx(from)
      const dy = cy(to) - cy(from)
      const len = Math.sqrt(dx * dx + dy * dy)
      return { x: mx2 - dy * 0.38, y: my2 + dx * 0.18 - len * 0.22 }
    }

    let _cvVisible = false
    const cvObs = new IntersectionObserver(
      function (entries) {
        _cvVisible = entries[0].isIntersecting
        if (_cvVisible && !stopped) {
          last = performance.now()
          requestAnimationFrame(frame)
        }
      },
      { threshold: 0.01 }
    )
    cvObs.observe(cvs)
    observers.push(cvObs)

    let last = performance.now()
    function frame(now) {
      if (stopped || !_cvVisible) return
      requestAnimationFrame(frame)
      const dt = Math.min(now - last, 40)
      last = now
      const W = cvs.width,
        H = cvs.height
      ctx.clearRect(0, 0, W, H)
      ctx.fillStyle = "#0b120e"
      ctx.fillRect(0, 0, W, H)
      ctx.strokeStyle = "rgba(201,168,76,.028)"
      ctx.lineWidth = 1
      const gs = 48
      for (let x = 0; x < W; x += gs) {
        ctx.beginPath()
        ctx.moveTo(x, 0)
        ctx.lineTo(x, H)
        ctx.stroke()
      }
      for (let y = 0; y < H; y += gs) {
        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.lineTo(W, y)
        ctx.stroke()
      }
      bgDots.forEach((d) => {
        d.x = (d.x + d.speed + 1) % 1
        d.y = (d.y + d.dy + 1) % 1
        ctx.beginPath()
        ctx.arc(d.x * W, d.y * H, d.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(201,168,76,${d.alpha})`
        ctx.fill()
      })
      if (arcs.filter((a) => !a.done).length < MAX_ARCS && Math.random() < 0.025) {
        spawnArc()
      }
      arcs.forEach((arc) => {
        if (arc.done) return
        arc.t = Math.min(arc.t + arc.speed * dt, 1)
        const cp = controlPt(arc.from, arc.to)
        const x1 = cx(arc.from),
          y1 = cy(arc.from),
          x2 = cx(arc.to),
          y2 = cy(arc.to)
        const pos = bezier(x1, y1, x2, y2, cp.x, cp.y, arc.t)
        arc.trail.push({ ...pos, age: 0 })
        arc.trail.forEach((p) => (p.age += dt))
        while (arc.trail.length > 1 && arc.trail[0].age > 420) arc.trail.shift()
        if (arc.trail.length > 1) {
          for (let i = 1; i < arc.trail.length; i++) {
            const p0 = arc.trail[i - 1],
              p1 = arc.trail[i]
            const alpha = (i / arc.trail.length) * 0.65
            ctx.beginPath()
            ctx.moveTo(p0.x, p0.y)
            ctx.lineTo(p1.x, p1.y)
            ctx.strokeStyle = arc.color + alpha + ")"
            ctx.lineWidth = 1.5
            ctx.stroke()
          }
        }
        const grd = ctx.createRadialGradient(pos.x, pos.y, 0, pos.x, pos.y, 7)
        grd.addColorStop(0, arc.color + ".9)")
        grd.addColorStop(1, arc.color + "0)")
        ctx.beginPath()
        ctx.arc(pos.x, pos.y, 7, 0, Math.PI * 2)
        ctx.fillStyle = grd
        ctx.fill()
        ctx.beginPath()
        ctx.arc(pos.x, pos.y, 1.8, 0, Math.PI * 2)
        ctx.fillStyle = arc.color + "1)"
        ctx.fill()
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
          ctx.beginPath()
          ctx.arc(p.x, p.y, 1.2, 0, Math.PI * 2)
          ctx.fillStyle = p.color + p.life + ")"
          ctx.fill()
        })
      })
      for (let i = arcs.length - 1; i >= 0; i--) {
        if (arcs[i].done && arcs[i].particles.length === 0) arcs.splice(i, 1)
      }
      CITIES.forEach((c, i) => {
        pulses[i].phase += 0.018
        const px = cx(c),
          py = cy(c)
        const isHub = c.hub
        const baseR = isHub ? 4.5 : 2.8
        const pulse = Math.sin(pulses[i].phase) * 0.5 + 0.5
        const ringR = baseR + (isHub ? 14 : 9) * pulse
        const ringAlpha = (1 - pulse) * (isHub ? 0.35 : 0.2)
        ctx.beginPath()
        ctx.arc(px, py, ringR, 0, Math.PI * 2)
        ctx.strokeStyle = isHub
          ? `rgba(201,168,76,${ringAlpha})`
          : `rgba(42,107,85,${ringAlpha})`
        ctx.lineWidth = 1
        ctx.stroke()
        if (isHub) {
          const r2 = baseR + 26 * pulse
          const a2 = (1 - pulse) * 0.12
          ctx.beginPath()
          ctx.arc(px, py, r2, 0, Math.PI * 2)
          ctx.strokeStyle = `rgba(201,168,76,${a2})`
          ctx.lineWidth = 0.8
          ctx.stroke()
        }
        const grd = ctx.createRadialGradient(px, py, 0, px, py, baseR * 3)
        if (isHub) {
          grd.addColorStop(0, "rgba(201,168,76,.45)")
          grd.addColorStop(1, "rgba(201,168,76,0)")
        } else {
          grd.addColorStop(0, "rgba(42,107,85,.3)")
          grd.addColorStop(1, "rgba(42,107,85,0)")
        }
        ctx.beginPath()
        ctx.arc(px, py, baseR * 3, 0, Math.PI * 2)
        ctx.fillStyle = grd
        ctx.fill()
        ctx.beginPath()
        ctx.arc(px, py, baseR, 0, Math.PI * 2)
        ctx.fillStyle = isHub ? "rgba(201,168,76,.95)" : "rgba(42,107,85,.8)"
        ctx.fill()
        ctx.beginPath()
        ctx.arc(px, py, baseR * 0.45, 0, Math.PI * 2)
        ctx.fillStyle = "rgba(245,240,232,.7)"
        ctx.fill()
        const _f = isHub
          ? `600 9px 'Raleway',sans-serif`
          : `400 7.5px 'Raleway',sans-serif`
        if (ctx.font !== _f) ctx.font = _f
        ctx.fillStyle = isHub ? "rgba(201,168,76,.85)" : "rgba(201,168,76,.45)"
        ;(ctx as any).letterSpacing = "2px"
        const lx =
          px + (px < W * 0.3 ? -(ctx.measureText(c.name).width + 10) : 10)
        const ly = py - baseR - 5
        ctx.fillText(c.name.toUpperCase(), lx, ly)
      })
    }
  })()

  /* ═══════ SHOP PRODUCT GRID ═══════ */
  ;(function () {
    document.querySelectorAll(".sg-card").forEach((card) => {
      const imgs = [...card.querySelectorAll(".sg-img")]
      const dots = [...card.querySelectorAll(".sg-dot")]
      const btn = card.querySelector(".sg-btn")
      let current = 0,
        timer = null
      function show(i) {
        current = (i + imgs.length) % imgs.length
        imgs.forEach((im, k) => im.classList.toggle("is-active", k === current))
        dots.forEach((d, k) => d.classList.toggle("is-active", k === current))
      }
      function start() {
        stop()
        timer = window.setInterval(() => show(current + 1), 5500)
        intervals.push(timer)
      }
      function stop() {
        if (timer) clearInterval(timer)
        timer = null
      }
      dots.forEach((d, k) =>
        d.addEventListener(
          "click",
          () => {
            show(k)
            start()
          },
          { signal }
        )
      )
      card.addEventListener("mouseenter", stop, { signal })
      card.addEventListener("mouseleave", start, { signal })
      let tx = null,
        ty = null
      card.addEventListener(
        "touchstart",
        (e) => {
          tx = e.touches[0].clientX
          ty = e.touches[0].clientY
        },
        { passive: true, signal }
      )
      card.addEventListener(
        "touchend",
        (e) => {
          if (tx === null) return
          const dx = e.changedTouches[0].clientX - tx
          const dy = e.changedTouches[0].clientY - ty
          if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) {
            show(current + (dx < 0 ? 1 : -1))
            start()
          }
          tx = ty = null
        },
        { passive: true, signal }
      )
      let mdx = null,
        mdy = null,
        isDown = false
      card.addEventListener(
        "mousedown",
        (e) => {
          if (e.button !== 0) return
          isDown = true
          mdx = e.clientX
          mdy = e.clientY
          stop()
        },
        { signal }
      )
      card.addEventListener(
        "mouseup",
        (e) => {
          if (!isDown || mdx === null) return
          const dx = e.clientX - mdx,
            dy = e.clientY - mdy
          if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy))
            show(current + (dx < 0 ? 1 : -1))
          isDown = false
          mdx = mdy = null
          start()
        },
        { signal }
      )
      card.addEventListener(
        "mouseleave",
        () => {
          if (!isDown) return
          isDown = false
          mdx = mdy = null
          start()
        },
        { signal }
      )
      card.addEventListener("dragstart", (e) => e.preventDefault(), { signal })
      if (btn)
        btn.addEventListener(
          "click",
          () => {
            if (btn.classList.contains("sg-btn--store")) return
            if (typeof (window as any).openModal === "function")
              (window as any).openModal()
          },
          { signal }
        )
      const favBtn = card.querySelector(".sg-fav")
      if (favBtn) {
        favBtn.addEventListener(
          "click",
          () => {
            const on = favBtn.getAttribute("aria-pressed") === "true"
            favBtn.setAttribute("aria-pressed", !on ? "true" : "false")
            favBtn.classList.toggle("is-on", !on)
            favBtn.setAttribute(
              "aria-label",
              !on ? "Elimină de la favorite" : "Adaugă la favorite"
            )
          },
          { signal }
        )
      }
      show(0)
      start()
    })
  })()

  /* ═══════ GIFT CARD ═══════ */
  function selGc(el) {
    document.querySelectorAll(".gc-amt").forEach((a) => a.classList.remove("on"))
    el.classList.add("on")
    const amountEl = document.getElementById("gcCardAmount")
    if (!amountEl) return
    amountEl.classList.add("changing")
    setTimeout(() => {
      if (stopped) return
      amountEl.textContent = el.querySelector("span").textContent
      amountEl.classList.remove("changing")
    }, 200)
    const card = document.getElementById("gcCard")
    if (card) {
      card.classList.add("elevated")
      card.classList.remove("shining")
      void card.offsetWidth
      card.classList.add("shining")
    }
  }
  ;(window as any).selGc = selGc
  ;(function () {
    const wrap = document.querySelector(".gc-card-wrap")
    if (!wrap) return
    wrap.addEventListener(
      "mouseenter",
      () => document.body.classList.remove("hovering"),
      { capture: true, signal }
    )
    wrap.addEventListener(
      "mouseover",
      () => document.body.classList.remove("hovering"),
      { capture: true, signal }
    )
  })()

  /* ═══════ BACK TO TOP ═══════ */
  const bttBtn = document.getElementById("btt")
  window.addEventListener(
    "scroll",
    () => {
      if (bttBtn)
        bttBtn.classList.toggle("show", window.scrollY > window.innerHeight * 0.5)
    },
    { passive: true, signal }
  )
  document.body.addEventListener(
    "mouseenter",
    (e) => {
      if (bttBtn && (e.target === bttBtn || bttBtn.contains(e.target as Node))) {
        document.body.classList.add("hovering")
      }
    },
    { capture: true, signal }
  )

  /* ═══════ DOT NAV ═══════ */
  ;(function () {
    const dots = document.querySelectorAll(".dot-nav a")
    const sections = [
      "home",
      "about",
      "shop",
      "collections",
      "space",
      "events",
      "bar",
      "giftcard",
      "membership",
      "contact",
    ]
    dots.forEach((d) => {
      d.addEventListener(
        "click",
        (e) => {
          e.preventDefault()
          const target = document.getElementById((d as HTMLElement).dataset.section)
          if (target) target.scrollIntoView({ behavior: "smooth" })
        },
        { signal }
      )
    })
    function setActive() {
      const mid = window.innerHeight * 0.5
      const atBottom =
        window.innerHeight + window.scrollY >= document.body.scrollHeight - 8
      let current = sections[0]
      sections.forEach((id) => {
        const el = document.getElementById(id)
        if (!el) return
        const rect = el.getBoundingClientRect()
        if (rect.top <= mid) current = id
      })
      if (atBottom) current = sections[sections.length - 1]
      dots.forEach((d) => {
        d.classList.toggle("active", (d as HTMLElement).dataset.section === current)
      })
    }
    window.addEventListener("scroll", setActive, { passive: true, signal })
    setActive()
  })()

  document.querySelectorAll(".zone").forEach((z) => {
    z.addEventListener("mouseenter", () => document.body.classList.add("hovering"), {
      signal,
    })
    z.addEventListener(
      "mouseleave",
      () => document.body.classList.remove("hovering"),
      { signal }
    )
  })

  const shakeStyle = document.createElement("style")
  shakeStyle.textContent =
    "@keyframes shake{0%,100%{transform:translateX(0)}25%{transform:translateX(-6px)}75%{transform:translateX(6px)}}"
  document.head.appendChild(shakeStyle)
  injectedStyles.push(shakeStyle)

  /* ═══════ SUBSCRIBE FORM (inline, section#subscribe) ═══════ */
  // The Brevo form now lives inline before the contact section, so load its
  // enhancement scripts (reCAPTCHA + Brevo) on mount rather than on click.
  if (!(window as any)._rcLoaded) {
    ;(window as any)._rcLoaded = true
    var rc = document.createElement("script")
    rc.src =
      "https://www.google.com/recaptcha/api.js?render=6LdnohktAAAAAOnmNaDbJ1bBeKx3irV5qgeqoOI5&hl=ro"
    rc.async = true
    document.head.appendChild(rc)
  }
  if (!(window as any)._brevoLoaded) {
    ;(window as any)._brevoLoaded = true
    var bv = document.createElement("script")
    bv.src = "https://sibforms.com/forms/end-form/build/main.js"
    bv.async = true
    document.head.appendChild(bv)
  }
  // Shop "În curând" buttons used to open a modal — now smooth-scroll to the form.
  function openModal() {
    document
      .getElementById("subscribe")
      ?.scrollIntoView({ behavior: "smooth" })
  }
  ;(window as any).openModal = openModal
  ;(window as any).closeModal = () => {}
  ;(window as any).handleOverlayClick = () => {}

  /* ═══════ BREVO FORM — validation + mobile button patch ═══════ */
  ;(function () {
    const form = document.getElementById("sib-form")
    if (!form) return
    function clearError() {
      var errLabel = form.querySelector(".entry__error--primary")
      if (errLabel) errLabel.classList.remove("visible")
    }
    const emailInput = document.getElementById("EMAIL")
    if (emailInput) emailInput.addEventListener("input", clearError, { signal })
    form.addEventListener(
      "submit",
      function (e) {
        var emailVal = (
          (document.getElementById("EMAIL") as HTMLInputElement)?.value || ""
        ).trim()
        var errLabel = form.querySelector(".entry__error--primary")
        if (!emailVal) {
          e.preventDefault()
          e.stopImmediatePropagation()
          if (errLabel) {
            errLabel.textContent = "◆  Adresa de email este obligatorie"
            errLabel.classList.add("visible")
          }
          ;(document.getElementById("EMAIL") as HTMLElement)?.focus()
          return
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailVal)) {
          e.preventDefault()
          e.stopImmediatePropagation()
          if (errLabel) {
            errLabel.textContent = "◆  Adresa de email nu este validă"
            errLabel.classList.add("visible")
          }
          ;(document.getElementById("EMAIL") as HTMLElement)?.focus()
          return
        }
        clearError()
      },
      { signal }
    )
  })()
  ;(window as any).REQUIRED_CODE_ERROR_MESSAGE = "Please choose a country code"
  ;(window as any).LOCALE = "ro"
  ;(window as any).EMAIL_INVALID_MESSAGE = (window as any).SMS_INVALID_MESSAGE =
    "Adresa de email nu este validă."
  ;(window as any).REQUIRED_ERROR_MESSAGE = "Acest câmp nu poate fi gol."
  ;(window as any).GENERIC_INVALID_MESSAGE = "Informațiile introduse nu sunt valide."
  ;(window as any).INVALID_NUMBER = "Numărul introdus nu este valid."
  ;(window as any).INVALID_DATE = "Vă rugăm să introduceți o dată validă."
  ;(window as any).REQUIRED_MULTISELECT_MESSAGE = "Selectați cel puțin o opțiune."
  ;(window as any).translation = {
    common: {
      selectedList: "{quantity} list selected",
      selectedLists: "{quantity} lists selected",
      selectedOption: "{quantity} selected",
      selectedOptions: "{quantity} selected",
    },
  }
  ;(window as any).AUTOHIDE = Boolean(0)
  ;(function () {
    function patchSibBtn() {
      if (window.innerWidth > 768) return
      var btn = document.querySelector("#sib-container .sib-form-block__button")
      if (btn) {
        ;(btn as HTMLElement).style.setProperty("letter-spacing", "3px", "important")
        ;(btn as HTMLElement).style.setProperty("padding", "14px 6px", "important")
        ;(btn as HTMLElement).style.setProperty("margin-top", "4px", "important")
      }
      document.querySelectorAll("#sib-container input").forEach(function (inp) {
        ;(inp as HTMLElement).style.setProperty("font-size", "16px", "important")
      })
    }
    patchSibBtn()
    window.addEventListener("resize", patchSibBtn, { signal })
  })()

  /* ═══════ CLEANUP ═══════ */
  return () => {
    stopped = true
    ac.abort()
    intervals.forEach((id) => clearInterval(id))
    observers.forEach((o) => o.disconnect())
    injectedStyles.forEach((el) => el.remove())
    document.body.classList.remove("hunter-landing-active")
    document.body.classList.remove("hovering")
    // restore any modal scroll-lock styles
    document.body.style.position = ""
    document.body.style.top = ""
    document.body.style.width = ""
    document.body.style.paddingRight = ""
    delete (window as any).openModal
    delete (window as any).closeModal
    delete (window as any).handleOverlayClick
    delete (window as any).selGc
  }
}
