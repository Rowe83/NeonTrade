# NeonTrade

NeonTrade is a dark-mode, neon glassmorphism trading terminal UI built with **Next.js 15** (App Router). It combines real-time market simulation, Zustand state, and **Three.js** visuals for candles, asset distribution, and order-book depth.

## Tech stack

- **Framework**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS
- **State**: Zustand (`useTradeStore`)
- **3D**: `@react-three/fiber`, `@react-three/drei`, `three`
- **Animation**: GSAP (candle updates), Framer Motion (order book transitions)
- **Icons**: Lucide React

## Features

- Responsive layout: desktop three-column shell; mobile tabs and order drawer
- 3D candlestick chart with OrbitControls, emissive materials, and OHLC tooltips
- 3D asset sphere: position-weighted orbs; click updates `currentPair` with pulse animation
- Simulated WebSocket stream (`hooks/useWebSocket.ts`) driving prices, candles, order book, and positions

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Command       | Description        |
| ------------- | ------------------ |
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | ESLint |

## License

Private / proprietary unless you add a license file.
