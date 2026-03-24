"use client"

import { create } from "zustand"

type MarketSnapshot = {
  pair: string
  price: number
  change24h: number
  volume24h: number
}

type OrderBookLevel = {
  price: number
  amount: number
  total: number
}

type OrderBook = {
  bids: OrderBookLevel[]
  asks: OrderBookLevel[]
}

type Position = {
  id: string
  pair: string
  side: "long" | "short"
  size: number
  entryPrice: number
  markPrice: number
  pnl: number
}

type Candle = {
  time: string
  open: number
  high: number
  low: number
  close: number
}

type TradeState = {
  currentPair: string
  marketData: Record<string, MarketSnapshot>
  orderBook: OrderBook
  positions: Position[]
  candles: Record<string, Candle[]>
  setCurrentPair: (pair: string) => void
  setMarketData: (payload: Record<string, MarketSnapshot>) => void
  setOrderBook: (payload: OrderBook) => void
  setPositions: (payload: Position[]) => void
  updateLivePrice: (pair: string, price: number) => void
  upsertPositionMarkPrice: (pair: string, markPrice: number) => void
}

const initialMarketData: Record<string, MarketSnapshot> = {
  "BTC/USDT": { pair: "BTC/USDT", price: 63125.4, change24h: 2.81, volume24h: 1284500 },
  "ETH/USDT": { pair: "ETH/USDT", price: 3402.15, change24h: 1.27, volume24h: 842900 },
  "SOL/USDT": { pair: "SOL/USDT", price: 142.32, change24h: -0.62, volume24h: 539100 }
}

const initialOrderBook: OrderBook = {
  bids: [
    { price: 63124.5, amount: 0.84, total: 0.84 },
    { price: 63123.8, amount: 1.12, total: 1.96 },
    { price: 63122.1, amount: 2.03, total: 3.99 }
  ],
  asks: [
    { price: 63126.8, amount: 0.47, total: 0.47 },
    { price: 63127.2, amount: 1.54, total: 2.01 },
    { price: 63128.9, amount: 1.86, total: 3.87 }
  ]
}

const createSeedCandles = (startPrice: number): Candle[] => {
  const seed: Candle[] = []
  let lastClose = startPrice

  for (let index = 0; index < 24; index += 1) {
    const drift = (Math.random() - 0.5) * (startPrice * 0.002)
    const open = lastClose
    const close = Math.max(0.01, open + drift)
    const high = Math.max(open, close) + Math.random() * (startPrice * 0.0012)
    const low = Math.min(open, close) - Math.random() * (startPrice * 0.0012)
    seed.push({
      time: `T-${24 - index}`,
      open,
      high,
      low: Math.max(0.01, low),
      close
    })
    lastClose = close
  }

  return seed
}

const initialCandles: Record<string, Candle[]> = {
  "BTC/USDT": createSeedCandles(initialMarketData["BTC/USDT"].price),
  "ETH/USDT": createSeedCandles(initialMarketData["ETH/USDT"].price),
  "SOL/USDT": createSeedCandles(initialMarketData["SOL/USDT"].price)
}

export const useTradeStore = create<TradeState>((set) => ({
  currentPair: "BTC/USDT",
  marketData: initialMarketData,
  orderBook: initialOrderBook,
  positions: [
    {
      id: "pos-btc",
      pair: "BTC/USDT",
      side: "long",
      size: 0.62,
      entryPrice: 61820,
      markPrice: 63125.4,
      pnl: 808.75
    },
    {
      id: "pos-eth",
      pair: "ETH/USDT",
      side: "long",
      size: 4.5,
      entryPrice: 3321,
      markPrice: 3402.15,
      pnl: 365.18
    },
    {
      id: "pos-sol",
      pair: "SOL/USDT",
      side: "short",
      size: 28,
      entryPrice: 146.2,
      markPrice: 142.32,
      pnl: 108.64
    }
  ],
  candles: initialCandles,
  setCurrentPair: (pair) => set({ currentPair: pair }),
  setMarketData: (payload) => set({ marketData: payload }),
  setOrderBook: (payload) => set({ orderBook: payload }),
  setPositions: (payload) => set({ positions: payload }),
  upsertPositionMarkPrice: (pair, markPrice) =>
    set((state) => {
      const nextPositions = state.positions.map((position) => {
        if (position.pair !== pair) {
          return position
        }
        const direction = position.side === "long" ? 1 : -1
        const pnl = (markPrice - position.entryPrice) * position.size * direction
        return {
          ...position,
          markPrice,
          pnl
        }
      })
      return { positions: nextPositions }
    }),
  updateLivePrice: (pair, price) =>
    set((state) => {
      const snapshot = state.marketData[pair]
      if (!snapshot) {
        return state
      }

      const pairCandles = state.candles[pair] ?? []
      if (pairCandles.length === 0) {
        const starter: Candle = {
          time: "T-0",
          open: price,
          high: price,
          low: price,
          close: price
        }
        return {
          marketData: {
            ...state.marketData,
            [pair]: {
              ...snapshot,
              price
            }
          },
          candles: {
            ...state.candles,
            [pair]: [starter]
          }
        }
      }

      const last = pairCandles[pairCandles.length - 1]
      const updatedLast: Candle = {
        ...last,
        close: price,
        high: Math.max(last.high, price),
        low: Math.min(last.low, price)
      }

      const updatedCandles = [...pairCandles.slice(0, -1), updatedLast]
      return {
        marketData: {
          ...state.marketData,
          [pair]: {
            ...snapshot,
            price
          }
        },
        candles: {
          ...state.candles,
          [pair]: updatedCandles
        }
      }
    })
}))

export type { Candle, MarketSnapshot, OrderBook, OrderBookLevel, Position }
