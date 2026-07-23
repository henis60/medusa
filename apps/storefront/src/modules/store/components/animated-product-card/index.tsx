"use client"

import { motion } from "framer-motion"

type Props = {
  index: number
  children: React.ReactNode
}

export default function AnimatedProductCard({ index, children }: Props) {
  return (
    <motion.li
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      // Bottom margin is expanded (not shrunk) so a row that's only
      // partially visible on load — e.g. row 2 on a short mobile
      // viewport — still counts as "in view" and animates in immediately,
      // instead of sitting invisible until the user scrolls further.
      viewport={{ once: true, margin: "0px 0px 200px 0px" }}
      transition={{
        duration: 0.55,
        delay: (index % 6) * 0.07,
        ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
      }}
      className="relative hover:z-10"
    >
      {children}
    </motion.li>
  )
}
