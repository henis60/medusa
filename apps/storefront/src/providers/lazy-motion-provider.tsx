"use client"

import { LazyMotion } from "framer-motion"
import { ReactNode } from "react"

// Every `m.div`/`m.span` etc. across the app (see individual component
// imports: `m as motion`) requires an ancestor LazyMotion provider — without
// one they throw at render. `features` is a loader function (not the
// imported `domAnimation` object directly) so the animation engine itself is
// fetched as a separate chunk after the initial bundle, instead of shipping
// synchronously with every page that renders an `m` component.
const loadFeatures = () =>
  import("framer-motion").then((mod) => mod.domAnimation)

export function LazyMotionProvider({ children }: { children: ReactNode }) {
  return (
    <LazyMotion features={loadFeatures} strict>
      {children}
    </LazyMotion>
  )
}
