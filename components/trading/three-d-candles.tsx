"use client"

import { Html, OrbitControls } from "@react-three/drei"
import { Canvas } from "@react-three/fiber"
import gsap from "gsap"
import { useEffect, useMemo, useRef, useState } from "react"
import { type Candle, useTradeStore } from "@/lib/store/useTradeStore"

type AnimatedCandle = Candle

type CandleMeshProps = {
  candle: AnimatedCandle
  x: number
  index: number
  isSelected: boolean
  onSelect: (index: number) => void
  priceScale: number
}

const CandleMesh = ({ candle, x, index, isSelected, onSelect, priceScale }: CandleMeshProps) => {
  const up = candle.close >= candle.open
  const bodyHeight = Math.max(Math.abs(candle.close - candle.open) * priceScale, 0.12)
  const bodyCenter = ((candle.open + candle.close) / 2) * priceScale
  const wickHeight = Math.max((candle.high - candle.low) * priceScale, 0.16)
  const wickCenter = ((candle.high + candle.low) / 2) * priceScale

  const handleSelect = () => {
    onSelect(index)
  }

  return (
    <group position={[x, 0, 0]}>
      <mesh
        position={[0, bodyCenter, 0]}
        onClick={handleSelect}
        onPointerDown={handleSelect}
        onPointerOver={(event) => event.stopPropagation()}
      >
        <boxGeometry args={[0.48, bodyHeight, 0.48]} />
        <meshStandardMaterial
          color={up ? "#22c55e" : "#ef4444"}
          emissive={up ? "#22c55e" : "#ef4444"}
          emissiveIntensity={0.55}
          metalness={0.2}
          roughness={0.35}
        />
      </mesh>

      <mesh position={[0, wickCenter, -0.02]}>
        <boxGeometry args={[0.08, wickHeight, 0.08]} />
        <meshStandardMaterial
          color={up ? "#86efac" : "#fca5a5"}
          emissive={up ? "#16a34a" : "#dc2626"}
          emissiveIntensity={0.4}
          metalness={0.15}
          roughness={0.5}
        />
      </mesh>

      {isSelected && (
        <Html center position={[0, candle.high * priceScale + 0.8, 0]}>
          <div className="min-w-[170px] rounded-xl border border-cyan-300/40 bg-slate-950/90 p-3 text-xs text-slate-100 shadow-[0_0_18px_rgba(45,212,191,0.28)]">
            <p className="mb-1 font-semibold text-cyan-200">Candle: {candle.time}</p>
            <p>Open: {candle.open.toFixed(2)}</p>
            <p>High: {candle.high.toFixed(2)}</p>
            <p>Low: {candle.low.toFixed(2)}</p>
            <p>Close: {candle.close.toFixed(2)}</p>
          </div>
        </Html>
      )}
    </group>
  )
}

const CandlesScene = () => {
  const currentPair = useTradeStore((state) => state.currentPair)
  const candles = useTradeStore((state) => state.candles[state.currentPair] ?? [])
  const livePrice = useTradeStore((state) => state.marketData[state.currentPair]?.price ?? 0)

  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
  const [animatedCandles, setAnimatedCandles] = useState<AnimatedCandle[]>(candles)
  const animatedRef = useRef<AnimatedCandle[]>(candles)

  useEffect(() => {
    setAnimatedCandles(candles)
    animatedRef.current = candles
  }, [currentPair, candles])

  useEffect(() => {
    if (animatedRef.current.length === 0 || livePrice <= 0) {
      return
    }

    const nextCandles = animatedRef.current.map((candle) => ({ ...candle }))
    const lastIndex = nextCandles.length - 1
    const target = nextCandles[lastIndex]
    const from = { close: target.close }
    const to = livePrice
    const open = target.open
    const high = Math.max(target.high, to)
    const low = Math.min(target.low, to)

    const tween = gsap.to(from, {
      close: to,
      duration: 0.4,
      ease: "power2.out",
      onUpdate: () => {
        const frameCandles = nextCandles.map((candle, index) => {
          if (index !== lastIndex) {
            return candle
          }
          const close = from.close
          return {
            ...candle,
            close,
            high: Math.max(high, close, open),
            low: Math.min(low, close, open)
          }
        })
        animatedRef.current = frameCandles
        setAnimatedCandles(frameCandles)
      }
    })

    return () => {
      tween.kill()
    }
  }, [livePrice])

  const priceScale = useMemo(() => {
    if (animatedCandles.length === 0) {
      return 0.001
    }
    const highest = Math.max(...animatedCandles.map((item) => item.high))
    return highest > 1000 ? 0.0004 : highest > 100 ? 0.003 : 0.02
  }, [animatedCandles])

  const totalWidth = useMemo(() => animatedCandles.length * 0.65, [animatedCandles.length])

  return (
    <Canvas camera={{ position: [0, 10, 18], fov: 42 }}>
      <ambientLight intensity={0.35} />
      <pointLight position={[6, 14, 8]} intensity={1.2} color="#22d3ee" />
      <pointLight position={[-8, 10, -6]} intensity={0.7} color="#7c3aed" />
      <gridHelper args={[26, 26, "#0f172a", "#0e7490"]} position={[0, 0, 0]} />

      {animatedCandles.map((candle, index) => (
        <CandleMesh
          key={`${candle.time}-${index}`}
          candle={candle}
          x={index * 0.65 - totalWidth / 2}
          index={index}
          isSelected={selectedIndex === index}
          onSelect={setSelectedIndex}
          priceScale={priceScale}
        />
      ))}

      <OrbitControls enablePan={false} minDistance={8} maxDistance={35} />
    </Canvas>
  )
}

export const ThreeDCandles = () => {
  return (
    <div className="h-full min-h-[360px] w-full overflow-hidden rounded-2xl border border-cyan-300/20 bg-slate-950/60">
      <CandlesScene />
    </div>
  )
}
