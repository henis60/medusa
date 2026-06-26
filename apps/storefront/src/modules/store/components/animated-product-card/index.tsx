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
      viewport={{ once: true, margin: "-60px" }}
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
