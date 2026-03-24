"use client"

import { useEffect } from "react"
import { useTradeStore } from "@/lib/store/useTradeStore"

const createOrderBookFromPrice = (price: number) => {
  const bids = Array.from({ length: 8 }).map((_, index) => {
    const level = index + 1
    const levelPrice = price - level * (Math.random() * 2.4 + 0.35)
    const amount = Math.random() * 3.8 + 0.35
    return {
      price: Number(levelPrice.toFixed(2)),
      amount: Number(amount.toFixed(3)),
      total: Number((amount * level).toFixed(3))
    }
  })

  const asks = Array.from({ length: 8 }).map((_, index) => {
    const level = index + 1
    const levelPrice = price + level * (Math.random() * 2.4 + 0.35)
    const amount = Math.random() * 3.8 + 0.35
    return {
      price: Number(levelPrice.toFixed(2)),
      amount: Number(amount.toFixed(3)),
      total: Number((amount * level).toFixed(3))
    }
  })

  return { bids, asks }
}

export const useWebSocket = () => {
  const currentPair = useTradeStore((state) => state.currentPair)
  const marketData = useTradeStore((state) => state.marketData)
  const updateLivePrice = useTradeStore((state) => state.updateLivePrice)
  const setOrderBook = useTradeStore((state) => state.setOrderBook)
  const upsertPositionMarkPrice = useTradeStore((state) => state.upsertPositionMarkPrice)

  useEffect(() => {
    const stream = window.setInterval(() => {
      const currentPrice = marketData[currentPair]?.price
      if (!currentPrice) {
        return
      }

      const drift = (Math.random() - 0.5) * currentPrice * 0.0018
      const nextPrice = Math.max(0.01, currentPrice + drift)
      updateLivePrice(currentPair, nextPrice)
      upsertPositionMarkPrice(currentPair, nextPrice)
      setOrderBook(createOrderBookFromPrice(nextPrice))
    }, 1100)

    return () => {
      window.clearInterval(stream)
    }
  }, [currentPair, marketData, setOrderBook, updateLivePrice, upsertPositionMarkPrice])
}
