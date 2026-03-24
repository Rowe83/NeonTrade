"use client"

import { AnimatePresence, motion } from "framer-motion"
import { useMemo } from "react"
import { useTradeStore } from "@/lib/store/useTradeStore"

export const OrderBookDepth3D = () => {
  const orderBook = useTradeStore((state) => state.orderBook)

  const maxAmount = useMemo(() => {
    const levels = [...orderBook.bids, ...orderBook.asks]
    if (levels.length === 0) {
      return 1
    }
    return Math.max(...levels.map((level) => level.amount))
  }, [orderBook])

  return (
    <section className="rounded-xl border border-slate-700/70 bg-slate-900/60 p-3">
      <h3 className="mb-2 text-sm font-semibold text-cyan-200">3D Order Book Depth</h3>
      <div className="mb-2 grid grid-cols-4 text-xs text-slate-400">
        <span>Type</span>
        <span>Price</span>
        <span>Amount</span>
        <span>Depth</span>
      </div>

      <div className="space-y-1.5">
        <AnimatePresence mode="popLayout" initial={false}>
          {orderBook.asks.map((level, index) => {
            const ratio = Math.max(level.amount / maxAmount, 0.08)
            return (
              <motion.div
                key={`ask-${level.price}-${index}`}
                layout
                initial={{ opacity: 0, y: -8, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, x: 20, scale: 0.96 }}
                transition={{ duration: 0.2 }}
                className="grid grid-cols-4 items-center gap-2 text-xs"
              >
                <span className="text-rose-300">Sell</span>
                <span className="text-rose-200">{level.price.toFixed(2)}</span>
                <span className="text-slate-200">{level.amount.toFixed(3)}</span>
                <div className="perspective-[500px]">
                  <motion.div
                    className="h-3 origin-left rounded bg-rose-500/65 shadow-[0_0_16px_rgba(244,63,94,0.38)]"
                    animate={{ width: `${ratio * 100}%`, rotateX: 14, translateZ: 8 }}
                    transition={{ duration: 0.28, ease: "easeOut" }}
                  />
                </div>
              </motion.div>
            )
          })}

          {orderBook.bids.map((level, index) => {
            const ratio = Math.max(level.amount / maxAmount, 0.08)
            return (
              <motion.div
                key={`bid-${level.price}-${index}`}
                layout
                initial={{ opacity: 0, y: 8, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, x: -20, scale: 0.96 }}
                transition={{ duration: 0.2 }}
                className="grid grid-cols-4 items-center gap-2 text-xs"
              >
                <span className="text-emerald-300">Buy</span>
                <span className="text-emerald-200">{level.price.toFixed(2)}</span>
                <span className="text-slate-200">{level.amount.toFixed(3)}</span>
                <div className="perspective-[500px]">
                  <motion.div
                    className="h-3 origin-left rounded bg-emerald-500/65 shadow-[0_0_16px_rgba(34,197,94,0.4)]"
                    animate={{ width: `${ratio * 100}%`, rotateX: -14, translateZ: 8 }}
                    transition={{ duration: 0.28, ease: "easeOut" }}
                  />
                </div>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>
    </section>
  )
}
