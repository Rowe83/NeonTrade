"use client"

import { BarChart3, CandlestickChart, PanelBottom, Wallet } from "lucide-react"
import { useMemo, useState } from "react"
import { AssetDistributionSphere } from "@/components/trading/asset-distribution-sphere"
import { OrderBookDepth3D } from "@/components/trading/order-book-depth-3d"
import { ThreeDCandles } from "@/components/trading/three-d-candles"
import { useWebSocket } from "@/hooks/useWebSocket"
import { useTradeStore } from "@/lib/store/useTradeStore"

type MobileTab = "quotes" | "kline" | "positions"

const glassPanelClass =
  "rounded-2xl border border-cyan-300/20 bg-slate-900/45 p-4 backdrop-blur-xl shadow-[0_0_24px_rgba(34,211,238,0.12)]"

export const TradingLayout = () => {
  const [activeTab, setActiveTab] = useState<MobileTab>("quotes")
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  const currentPair = useTradeStore((state) => state.currentPair)
  const marketData = useTradeStore((state) => state.marketData)
  const positions = useTradeStore((state) => state.positions)
  const setCurrentPair = useTradeStore((state) => state.setCurrentPair)

  const markets = useMemo(() => Object.values(marketData), [marketData])
  const activeSnapshot = marketData[currentPair]

  const handleTabChange = (tab: MobileTab) => {
    setActiveTab(tab)
  }

  const handlePairChange = (pair: string) => {
    setCurrentPair(pair)
  }

  const handleDrawerToggle = () => {
    setIsDrawerOpen((prev) => !prev)
  }

  useWebSocket()

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-[1800px] flex-col gap-3 p-3 md:gap-4 md:p-4">
      <section className="hidden h-full min-h-[calc(100vh-2rem)] grid-cols-12 gap-4 lg:grid">
        <aside className={`col-span-3 ${glassPanelClass}`}>
          <h2 className="mb-4 text-sm font-semibold text-cyan-200">Market List</h2>
          <div className="space-y-2">
            {markets.map((market) => (
              <button
                key={market.pair}
                type="button"
                onClick={() => handlePairChange(market.pair)}
                className={`flex w-full items-center justify-between rounded-xl border px-3 py-2 text-left transition ${
                  currentPair === market.pair
                    ? "border-cyan-300/50 bg-cyan-400/10"
                    : "border-slate-700/70 bg-slate-900/60 hover:border-cyan-300/30"
                }`}
                aria-label={`切换交易对到 ${market.pair}`}
              >
                <span className="font-medium text-slate-100">{market.pair}</span>
                <span className={market.change24h >= 0 ? "text-emerald-400" : "text-rose-400"}>
                  {market.price.toLocaleString()}
                </span>
              </button>
            ))}
          </div>
        </aside>

        <section className={`col-span-6 flex flex-col gap-4 ${glassPanelClass}`}>
          <header className="flex items-center justify-between">
            <h1 className="text-base font-semibold text-cyan-100">{currentPair}</h1>
            <span className="text-sm text-slate-300">
              Last Price: {activeSnapshot?.price.toLocaleString() ?? "--"}
            </span>
          </header>
          <div className="flex flex-1">
            <ThreeDCandles />
          </div>
        </section>

        <aside className={`col-span-3 flex flex-col gap-4 ${glassPanelClass}`}>
          <section className="rounded-xl border border-slate-700/70 bg-slate-900/60 p-3">
            <h3 className="mb-2 text-sm font-semibold text-cyan-200">3D 资产分布球</h3>
            <AssetDistributionSphere />
          </section>

          <OrderBookDepth3D />

          <section className="rounded-xl border border-slate-700/70 bg-slate-900/60 p-3">
            <h3 className="mb-2 text-sm font-semibold text-cyan-200">Trade Panel</h3>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                className="rounded-lg bg-emerald-500/20 px-3 py-2 text-sm font-medium text-emerald-300"
                aria-label="下多单"
              >
                Buy / Long
              </button>
              <button
                type="button"
                className="rounded-lg bg-rose-500/20 px-3 py-2 text-sm font-medium text-rose-300"
                aria-label="下空单"
              >
                Sell / Short
              </button>
            </div>
            <p className="mt-3 text-xs text-slate-400">下单表单将在下一步接入撮合与风控逻辑。</p>
          </section>
        </aside>
      </section>

      <section className="flex min-h-screen flex-col gap-3 lg:hidden">
        <nav className={`${glassPanelClass} flex items-center justify-between`} aria-label="移动端顶部导航">
          <button
            type="button"
            onClick={() => handleTabChange("quotes")}
            className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm ${
              activeTab === "quotes" ? "bg-cyan-400/20 text-cyan-200" : "text-slate-300"
            }`}
            aria-label="查看行情"
          >
            <BarChart3 className="h-4 w-4" />
            行情
          </button>
          <button
            type="button"
            onClick={() => handleTabChange("kline")}
            className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm ${
              activeTab === "kline" ? "bg-cyan-400/20 text-cyan-200" : "text-slate-300"
            }`}
            aria-label="查看K线"
          >
            <CandlestickChart className="h-4 w-4" />
            K线
          </button>
          <button
            type="button"
            onClick={() => handleTabChange("positions")}
            className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm ${
              activeTab === "positions" ? "bg-cyan-400/20 text-cyan-200" : "text-slate-300"
            }`}
            aria-label="查看持仓"
          >
            <Wallet className="h-4 w-4" />
            持仓
          </button>
        </nav>

        <div className={`${glassPanelClass} flex-1`}>
          {activeTab === "quotes" && (
            <div className="space-y-2">
              <h2 className="text-sm font-semibold text-cyan-200">市场行情</h2>
              {markets.map((market) => (
                <button
                  key={market.pair}
                  type="button"
                  onClick={() => handlePairChange(market.pair)}
                  className="flex w-full items-center justify-between rounded-lg border border-slate-700/70 bg-slate-900/60 px-3 py-2"
                  aria-label={`切换交易对到 ${market.pair}`}
                >
                  <span>{market.pair}</span>
                  <span>{market.price.toLocaleString()}</span>
                </button>
              ))}
            </div>
          )}

          {activeTab === "kline" && (
            <div className="h-full min-h-[40vh]">
              <ThreeDCandles />
            </div>
          )}

          {activeTab === "positions" && (
            <div>
              <h2 className="mb-2 text-sm font-semibold text-cyan-200">当前持仓</h2>
              {positions.length === 0 ? (
                <p className="text-sm text-slate-400">暂无持仓</p>
              ) : (
                <div className="space-y-2">
                  {positions.map((position) => (
                    <div
                      key={position.id}
                      className="rounded-lg border border-slate-700/70 bg-slate-900/60 p-3 text-sm"
                    >
                      <p>{position.pair}</p>
                      <p className="text-slate-300">
                        {position.side} / {position.size}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={handleDrawerToggle}
          className="fixed bottom-4 right-4 z-20 flex items-center gap-2 rounded-full border border-cyan-300/40 bg-slate-900/80 px-4 py-3 text-sm text-cyan-100 backdrop-blur-lg"
          aria-label="切换下单面板"
        >
          <PanelBottom className="h-4 w-4" />
          下单
        </button>

        <div
          className={`fixed inset-x-0 bottom-0 z-30 rounded-t-2xl border border-cyan-300/30 bg-slate-900/95 p-4 backdrop-blur-xl transition-transform duration-200 ${
            isDrawerOpen ? "translate-y-0" : "translate-y-full"
          }`}
        >
          <div className="mx-auto mb-4 h-1.5 w-16 rounded-full bg-slate-700" />
          <h3 className="mb-3 text-sm font-semibold text-cyan-200">移动端下单面板</h3>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              className="rounded-lg bg-emerald-500/20 px-3 py-2 text-sm font-medium text-emerald-300"
              aria-label="移动端下多单"
            >
              Buy / Long
            </button>
            <button
              type="button"
              className="rounded-lg bg-rose-500/20 px-3 py-2 text-sm font-medium text-rose-300"
              aria-label="移动端下空单"
            >
              Sell / Short
            </button>
          </div>
        </div>
      </section>
    </main>
  )
}
