"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

// Number formatting utility functions
const formatPrice = (price: number) => {
  if (price >= 1000) return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(price);
  if (price >= 1) return `$${price.toFixed(2)}`;
  return `$${price.toFixed(4)}`;
};

const formatCompact = (num: number) => {
  if (num >= 1e12) return `$${(num / 1e12).toFixed(2)}T`;
  if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
  if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
  if (num >= 1e3) return `$${(num / 1e3).toFixed(2)}K`;
  return `$${num}`;
};

export default function MarketsPage() {
  const [coins, setCoins] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // FETCH LIVE DATA FROM COINGECKO API
  useEffect(() => {
    const fetchMarkets = async () => {
      try {
        const res = await fetch(
          "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=50&page=1&sparkline=false"
        );
        const data = await res.json();
        setCoins(data);
        setLoading(false);
      } catch (err) {
        console.error("API Limit reached or error:", err);
      }
    };
    fetchMarkets();

    // Auto-refresh every 60 seconds
    const interval = setInterval(fetchMarkets, 60000);
    return () => clearInterval(interval);
  }, []);

  // Calculate Dynamic Categories from Live Data
  const hotCoins = coins.slice(0, 3); // Top 3 by Market Cap
  const topGainers = [...coins].sort((a, b) => b.price_change_percentage_24h - a.price_change_percentage_24h).slice(0, 3);
  const topVolume = [...coins].sort((a, b) => b.total_volume - a.total_volume).slice(0, 3);

  // "New" is usually manual/curated on Binance, so we'll mock 3 interesting low-cap coins for the UI feel
  const newCoins = [
    { symbol: "esp", name: "ESP", current_price: 0.12889, price_change_percentage_24h: -3.98 },
    { symbol: "zama", name: "ZAMA", current_price: 0.01983, price_change_percentage_24h: -5.93 },
    { symbol: "sent", name: "SENT", current_price: 0.02159, price_change_percentage_24h: 1.84 },
  ];

  return (
    <div className="min-h-screen bg-[#0b0e11] text-zinc-300 font-sans selection:bg-[#fcd535] selection:text-black pb-20">

      {/* NAVBAR */}
      <nav className="h-16 border-b border-zinc-800/80 flex items-center justify-between px-6 bg-[#181a20] sticky top-0 z-40">
        <div className="flex items-center gap-6">
          <Link href="/" className="text-[22px] font-black tracking-tighter text-[#fcd535] flex items-center gap-2">
            <svg className="w-6 h-6 fill-[#fcd535]" viewBox="0 0 24 24"><path d="M12 0l3.5 3.5-3.5 3.5-3.5-3.5L12 0zm7.1 7.1l3.5 3.5-3.5 3.5-3.5-3.5 3.5-3.5zM4.9 7.1l3.5 3.5-3.5 3.5-3.5-3.5 3.5-3.5zM12 14.1l3.5 3.5-3.5 3.5-3.5-3.5 3.5-3.5z" /></svg>
            k-TRADE
          </Link>
          <div className="hidden lg:flex gap-5 text-zinc-400 font-medium text-sm">
            <span className="hover:text-white cursor-pointer transition">Buy Crypto</span>
            <span className="text-white cursor-pointer">Markets</span>
            <Link href="/" className="hover:text-white cursor-pointer transition">Trade</Link>
            <span className="hover:text-white cursor-pointer transition">Futures</span>
            <span className="hover:text-white cursor-pointer transition">Earn</span>
          </div>
        </div>
        <div className="flex gap-4 items-center">
          <button className="text-sm bg-[#fcd535] hover:bg-[#e0bd2e] text-black px-4 py-1.5 rounded transition font-bold">
            Deposit
          </button>
        </div>
      </nav>

      {/* HEADER TABS */}
      <div className="px-6 lg:px-12 pt-8 pb-4">
        <div className="flex gap-8 text-[17px] font-semibold text-zinc-400 mb-8">
          <span className="text-white border-b-[3px] border-[#fcd535] pb-2 cursor-pointer">Overview</span>
          <span className="hover:text-white cursor-pointer transition pb-2">Trading Data</span>
          <span className="hover:text-white cursor-pointer transition pb-2">AI Select</span>
          <span className="hover:text-white cursor-pointer transition pb-2">Token Unlock</span>
        </div>

        {/* 4 TOP CARDS (Hot, New, Top Gainer, Top Volume) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">

          {/* HOT */}
          <div className="bg-[#181a20] rounded-2xl p-5 border border-zinc-800 hover:border-zinc-700 transition">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-white font-bold flex items-center gap-2">🔥 Hot</h3>
              <span className="text-xs text-zinc-500 hover:text-white cursor-pointer">More &gt;</span>
            </div>
            <div className="space-y-3">
              {loading ? <p className="text-xs text-zinc-500 animate-pulse">Loading live data...</p> : hotCoins.map((coin, i) => (
                <div key={i} className="flex justify-between items-center text-sm cursor-pointer hover:bg-zinc-800/50 -mx-2 px-2 py-1 rounded transition">
                  <div className="flex items-center gap-2 w-1/3">
                    <img src={coin.image} alt={coin.symbol} className="w-5 h-5 rounded-full" />
                    <span className="text-zinc-200 font-bold uppercase">{coin.symbol}</span>
                  </div>
                  <span className="w-1/3 text-right font-mono text-zinc-300">{formatPrice(coin.current_price)}</span>
                  <span className={`w-1/3 text-right font-mono ${coin.price_change_percentage_24h >= 0 ? 'text-[#0ecb81]' : 'text-[#f6465d]'}`}>
                    {coin.price_change_percentage_24h > 0 ? '+' : ''}{coin.price_change_percentage_24h?.toFixed(2)}%
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* NEW (Mocked for UI feel) */}
          <div className="bg-[#181a20] rounded-2xl p-5 border border-zinc-800 hover:border-zinc-700 transition">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-white font-bold flex items-center gap-2">✨ New</h3>
              <span className="text-xs text-zinc-500 hover:text-white cursor-pointer">More &gt;</span>
            </div>
            <div className="space-y-3">
              {newCoins.map((coin, i) => (
                <div key={i} className="flex justify-between items-center text-sm cursor-pointer hover:bg-zinc-800/50 -mx-2 px-2 py-1 rounded transition">
                  <div className="flex items-center gap-2 w-1/3">
                    <div className="w-5 h-5 rounded-full bg-zinc-700 flex items-center justify-center text-[8px] text-white font-bold">{coin.symbol[0].toUpperCase()}</div>
                    <span className="text-zinc-200 font-bold uppercase">{coin.symbol}</span>
                  </div>
                  <span className="w-1/3 text-right font-mono text-zinc-300">${coin.current_price}</span>
                  <span className={`w-1/3 text-right font-mono ${coin.price_change_percentage_24h >= 0 ? 'text-[#0ecb81]' : 'text-[#f6465d]'}`}>
                    {coin.price_change_percentage_24h > 0 ? '+' : ''}{coin.price_change_percentage_24h}%
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* TOP GAINER (Live API) */}
          <div className="bg-[#181a20] rounded-2xl p-5 border border-zinc-800 hover:border-zinc-700 transition">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-white font-bold flex items-center gap-2">🚀 Top Gainer</h3>
              <span className="text-xs text-zinc-500 hover:text-white cursor-pointer">More &gt;</span>
            </div>
            <div className="space-y-3">
              {loading ? <p className="text-xs text-zinc-500 animate-pulse">Scanning markets...</p> : topGainers.map((coin, i) => (
                <div key={i} className="flex justify-between items-center text-sm cursor-pointer hover:bg-zinc-800/50 -mx-2 px-2 py-1 rounded transition">
                  <div className="flex items-center gap-2 w-1/3">
                    <img src={coin.image} alt={coin.symbol} className="w-5 h-5 rounded-full" />
                    <span className="text-zinc-200 font-bold uppercase">{coin.symbol}</span>
                  </div>
                  <span className="w-1/3 text-right font-mono text-zinc-300">{formatPrice(coin.current_price)}</span>
                  <span className="w-1/3 text-right font-mono text-[#0ecb81]">
                    +{coin.price_change_percentage_24h?.toFixed(2)}%
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* TOP VOLUME (Live API) */}
          <div className="bg-[#181a20] rounded-2xl p-5 border border-zinc-800 hover:border-zinc-700 transition">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-white font-bold flex items-center gap-2">📊 Top Volume</h3>
              <span className="text-xs text-zinc-500 hover:text-white cursor-pointer">More &gt;</span>
            </div>
            <div className="space-y-3">
              {loading ? <p className="text-xs text-zinc-500 animate-pulse">Calculating volume...</p> : topVolume.map((coin, i) => (
                <div key={i} className="flex justify-between items-center text-sm cursor-pointer hover:bg-zinc-800/50 -mx-2 px-2 py-1 rounded transition">
                  <div className="flex items-center gap-2 w-1/3">
                    <img src={coin.image} alt={coin.symbol} className="w-5 h-5 rounded-full" />
                    <span className="text-zinc-200 font-bold uppercase">{coin.symbol}</span>
                  </div>
                  <span className="w-1/3 text-right font-mono text-zinc-300">{formatCompact(coin.total_volume)}</span>
                  <span className={`w-1/3 text-right font-mono ${coin.price_change_percentage_24h >= 0 ? 'text-[#0ecb81]' : 'text-[#f6465d]'}`}>
                    {coin.price_change_percentage_24h > 0 ? '+' : ''}{coin.price_change_percentage_24h?.toFixed(2)}%
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* PILL NAVIGATION TABS */}
        <div className="flex gap-6 text-sm font-medium text-zinc-400 mb-6 items-center">
          <span className="hover:text-white cursor-pointer">Favorites</span>
          <span className="text-[#fcd535] cursor-pointer text-base font-bold">Cryptos</span>
          <span className="hover:text-white cursor-pointer">Spot</span>
          <span className="hover:text-white cursor-pointer">Futures</span>
          <span className="hover:text-[#fcd535] cursor-pointer flex items-center gap-1">Alpha <span className="bg-[#fcd535] text-black text-[8px] px-1 rounded uppercase font-bold">New</span></span>
          <span className="hover:text-white cursor-pointer">Zones</span>
        </div>

        {/* SUB-TABS */}
        <div className="flex flex-wrap gap-2 text-xs font-medium text-zinc-400 mb-8 border-b border-zinc-800/50 pb-4">
          <span className="bg-zinc-800 text-white px-3 py-1.5 rounded-lg cursor-pointer">All</span>
          <span className="hover:bg-zinc-800/50 px-3 py-1.5 rounded-lg cursor-pointer transition">BNB Chain</span>
          <span className="hover:bg-zinc-800/50 px-3 py-1.5 rounded-lg cursor-pointer transition flex items-center gap-1">Solana <span className="text-[#fcd535] text-[9px]">New</span></span>
          <span className="hover:bg-zinc-800/50 px-3 py-1.5 rounded-lg cursor-pointer transition">RWA</span>
          <span className="hover:bg-zinc-800/50 px-3 py-1.5 rounded-lg cursor-pointer transition">Meme</span>
          <span className="hover:bg-zinc-800/50 px-3 py-1.5 rounded-lg cursor-pointer transition">AI</span>
          <span className="hover:bg-zinc-800/50 px-3 py-1.5 rounded-lg cursor-pointer transition">Layer 1 / Layer 2</span>
        </div>

        {/* MAIN DATA TABLE */}
        <div className="mt-4">
          <h2 className="text-xl font-bold text-white mb-1">Top Tokens by Market Capitalization</h2>
          <p className="text-xs text-zinc-500 mb-6 flex justify-between">
            Get a comprehensive snapshot of all cryptocurrencies available. This page displays the latest prices, 24-hour trading volume...
            <span className="text-white cursor-pointer hover:underline">More v</span>
          </p>

          <table className="w-full text-left text-sm">
            <thead className="text-xs text-zinc-500 font-medium border-b border-zinc-800/80">
              <tr>
                <th className="pb-4 font-normal cursor-pointer hover:text-white">Name <span className="text-[10px]">↕</span></th>
                <th className="pb-4 font-normal text-right cursor-pointer hover:text-white">Price <span className="text-[10px]">↕</span></th>
                <th className="pb-4 font-normal text-right cursor-pointer hover:text-white">24h Change <span className="text-[10px]">↕</span></th>
                <th className="pb-4 font-normal text-right cursor-pointer hover:text-white">24h Volume <span className="text-[10px]">↕</span></th>
                <th className="pb-4 font-normal text-right cursor-pointer hover:text-white">Market Cap <span className="text-[10px]">↕</span></th>
                <th className="pb-4 font-normal text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/50">
              {loading ? (
                <tr><td colSpan={6} className="py-10 text-center text-zinc-500 animate-pulse">Syncing live market data from Blockchain...</td></tr>
              ) : (
                coins.map((coin, idx) => (
                  <tr key={idx} className="hover:bg-zinc-800/30 transition-colors group cursor-pointer">
                    <td className="py-4">
                      <div className="flex items-center gap-3">
                        <span className="text-zinc-500 text-xs w-4">{idx + 1}</span>
                        <img src={coin.image} alt={coin.name} className="w-6 h-6 rounded-full" />
                        <span className="text-white font-bold text-[15px] uppercase">{coin.symbol}</span>
                        <span className="text-zinc-500 text-xs">{coin.name}</span>
                      </div>
                    </td>
                    <td className="py-4 text-right font-mono text-[15px] text-white">
                      {formatPrice(coin.current_price)}
                    </td>
                    <td className={`py-4 text-right font-mono ${coin.price_change_percentage_24h >= 0 ? 'text-[#0ecb81]' : 'text-[#f6465d]'}`}>
                      {coin.price_change_percentage_24h > 0 ? '+' : ''}{coin.price_change_percentage_24h?.toFixed(2)}%
                    </td>
                    <td className="py-4 text-right font-mono text-zinc-300">
                      {formatCompact(coin.total_volume)}
                    </td>
                    <td className="py-4 text-right font-mono text-zinc-300">
                      {formatCompact(coin.market_cap)}
                    </td>
                    <td className="py-4 text-right text-zinc-500">
                      <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="hover:text-white transition">📈</span>
                        <span className="hover:text-white transition">📊</span>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
