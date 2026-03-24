"use client"

import { Html, OrbitControls } from "@react-three/drei"
import { Canvas } from "@react-three/fiber"
import gsap from "gsap"
import { useMemo, useRef, useState } from "react"
import type { Group } from "three"
import { useTradeStore } from "@/lib/store/useTradeStore"

type AssetNodeProps = {
  pair: string
  ratio: number
  position: [number, number, number]
  isActive: boolean
  onSelect: (pair: string) => void
}

const AssetNode = ({ pair, ratio, position, isActive, onSelect }: AssetNodeProps) => {
  const handleSelect = () => {
    onSelect(pair)
  }

  const size = 0.12 + ratio * 1.6

  return (
    <mesh position={position} onClick={handleSelect} onPointerDown={handleSelect}>
      <sphereGeometry args={[size, 20, 20]} />
      <meshStandardMaterial
        color={isActive ? "#22d3ee" : "#a78bfa"}
        emissive={isActive ? "#0e7490" : "#5b21b6"}
        emissiveIntensity={isActive ? 1.2 : 0.5}
        metalness={0.35}
        roughness={0.18}
      />
      <Html center position={[0, size + 0.18, 0]}>
        <div className="rounded bg-slate-950/85 px-2 py-0.5 text-[10px] text-cyan-100">{pair}</div>
      </Html>
    </mesh>
  )
}

export const AssetDistributionSphere = () => {
  const positions = useTradeStore((state) => state.positions)
  const currentPair = useTradeStore((state) => state.currentPair)
  const setCurrentPair = useTradeStore((state) => state.setCurrentPair)

  const shellRef = useRef<Group | null>(null)
  const [selectedPair, setSelectedPair] = useState<string | null>(null)

  const assets = useMemo(() => {
    const totalNotional = positions.reduce((acc, position) => acc + position.size * position.markPrice, 0)
    return positions.map((position, index) => {
      const ratio = totalNotional > 0 ? (position.size * position.markPrice) / totalNotional : 0
      const phi = Math.acos(1 - (2 * (index + 1)) / (positions.length + 1))
      const theta = Math.PI * (1 + Math.sqrt(5)) * (index + 1)
      const radius = 3.2
      const x = radius * Math.sin(phi) * Math.cos(theta)
      const y = radius * Math.cos(phi)
      const z = radius * Math.sin(phi) * Math.sin(theta)
      return {
        pair: position.pair,
        ratio,
        position: [x, y, z] as [number, number, number]
      }
    })
  }, [positions])

  const handleSelectAsset = (pair: string) => {
    setCurrentPair(pair)
    setSelectedPair(pair)
    if (!shellRef.current) {
      return
    }
    gsap.fromTo(
      shellRef.current.scale,
      { x: 1, y: 1, z: 1 },
      { x: 1.16, y: 1.16, z: 1.16, duration: 0.22, yoyo: true, repeat: 1, ease: "power2.out" }
    )
  }

  return (
    <div className="h-[260px] w-full overflow-hidden rounded-xl border border-cyan-300/20 bg-slate-950/60">
      <Canvas camera={{ position: [0, 0, 8], fov: 45 }}>
        <ambientLight intensity={0.45} />
        <pointLight position={[6, 5, 8]} color="#22d3ee" intensity={1.3} />
        <pointLight position={[-5, -4, -6]} color="#a78bfa" intensity={0.8} />

        <group ref={shellRef}>
          <mesh>
            <sphereGeometry args={[3.2, 32, 32]} />
            <meshStandardMaterial
              color="#0f172a"
              wireframe
              emissive="#155e75"
              emissiveIntensity={0.75}
              metalness={0.2}
              roughness={0.55}
            />
          </mesh>

          {assets.map((asset) => (
            <AssetNode
              key={asset.pair}
              pair={asset.pair}
              ratio={asset.ratio}
              position={asset.position}
              isActive={currentPair === asset.pair || selectedPair === asset.pair}
              onSelect={handleSelectAsset}
            />
          ))}
        </group>

        <OrbitControls enablePan={false} minDistance={6} maxDistance={12} />
      </Canvas>
    </div>
  )
}
