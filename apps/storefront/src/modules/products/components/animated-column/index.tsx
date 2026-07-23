"use client"

import { motion } from "framer-motion"

type Props = {
  direction?: "left" | "right" | "up"
  delay?: number
  children: React.ReactNode
  className?: string
}

export default function AnimatedColumn({
  direction: _direction,
  delay = 0,
  children,
  className,
}: Props) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{
        duration: 0.6,
        delay,
        ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}
