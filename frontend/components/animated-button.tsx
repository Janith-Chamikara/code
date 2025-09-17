"use client"

import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"

export function AnimatedButton() {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: "spring", stiffness: 300, damping: 15 }}
    >
      <Button className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white shadow-lg hover:shadow-xl">
        Start an Event
      </Button>
    </motion.div>
  )
}