"use client";

import TradingChart from "./components/TradingChart";
import { useTradeStore } from "./store";
import { useState, useEffect } from "react"; // <-- useEffect add chesam
import { useRouter } from "next/navigation"; // <-- router add chesam
import toast from "react-hot-toast";
import Link from "next/link";
import { ethers } from "ethers";

const currencies = [
  { symbol: "₹", code: "INR", name: "Indian Rupee", color: "bg-orange-500" },
  { symbol: "$", code: "USD", name: "US Dollar", color: "bg-green-600" },
  { symbol: "€", code: "EUR", name: "Euro", color: "bg-blue-600" },
];

export default function Home() {
  // Store nunchi isAuthenticated techukunnam
  const { isAuthenticated, activePair, setActivePair, aiSignal, aiConfidence, recentTrades } = useTradeStore();

  const router = useRouter();

  // THE SECURITY GUARD 🛑
  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login"); // Login avvakapothe gettesthundi
    }
  }, [isAuthenticated, router]);

  // Login avvakapothe em chupinchadhu (blank screen before redirect)
  if (!isAuthenticated) return null;

  // ... (Kinda unna nee code antha mamule, emi marchoddu!)
  const [orderType, setOrderType] = useState("Limit");
  const [isDepositOpen, setIsDepositOpen] = useState(false);
  const [showCurrencySelect, setShowCurrencySelect] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState(currencies[0]);
  const [searchQuery, setSearchQuery] = useState("");

  // KOTHA STATE: Profile Menu Open/Close kosam
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // WEB3 STATES
  const [walletAddress, setWalletAddress] = useState("");
  const [walletBalance, setWalletBalance] = useState("");
  const [networkSymbol, setNetworkSymbol] = useState("ETH");

  const filteredCurrencies = currencies.filter(c =>
    c.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const baseCoin = activePair.split('/')[0];

  // --- CONNECT WALLET ---
  const connectWallet = async () => {
    if (typeof window !== "undefined" && typeof (window as any).ethereum !== "undefined") {
      try {
        const provider = new ethers.BrowserProvider((window as any).ethereum);
        const accounts = await provider.send("eth_requestAccounts", []);
        const address = accounts[0];
        setWalletAddress(address);

        const balance = await provider.getBalance(address);
        const formattedBalance = ethers.formatEther(balance);
        setWalletBalance(parseFloat(formattedBalance).toFixed(4));

        const network = await provider.getNetwork();
        if (network.chainId === BigInt(56)) setNetworkSymbol("BNB");
        else if (network.chainId === BigInt(137)) setNetworkSymbol("MATIC");
        else setNetworkSymbol("ETH");

        toast.success(`Wallet Connected!`, {
          style: { background: '#181a20', color: '#0ecb81', border: '1px solid #0ecb81' }
        });
      } catch (err) {
        toast.error("Connection Rejected");
      }
    } else {
      toast.error("Please install MetaMask!");
    }
  };

  // --- DISCONNECT WALLET ---
  const disconnectWallet = () => {
    setWalletAddress("");
    setWalletBalance("");
    setNetworkSymbol("ETH");
    setIsProfileOpen(false);
    toast.success("Wallet Disconnected", {
      style: { background: '#181a20', color: '#fff', border: '1px solid #3f3f46' }
    });
  };

  const handleOrder = async (side: string) => {
    if (!walletAddress) {
      toast.error("Please connect your Web3 Wallet first!");
      return;
    }

    const orderData = { pair: activePair, type: orderType, side: side, price: 64230.00, amount: 0.15 };

    try {
      await fetch("https://ktrade-backend-3.onrender.com/api/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
      });

      const color = side === "Buy" ? '#0ecb81' : '#f6465d';
      toast.success(`${side.toUpperCase()} Order Filled: 0.15 ${baseCoin} @ 64,230.00`, {
        style: { background: `rgba(${side === 'Buy' ? '14, 203, 129' : '246, 70, 93'}, 0.1)`, border: `1px solid ${color}`, color: color },
        iconTheme: { primary: color, secondary: '#181a20' },
      });
    } catch (err) {
      toast.error("Engine Disconnected! Check Python Server.");
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0e11] text-zinc-300 flex flex-col font-sans text-sm selection:bg-[#fcd535] selection:text-black relative overflow-hidden">

      {/* 1. MEGA NAVBAR WITH WEB3 */}
      <nav className="h-14 border-b border-zinc-800/60 flex items-center justify-between px-4 bg-[#181a20]/95 backdrop-blur-md sticky top-0 z-40">
        <div className="flex items-center gap-6">
          <div className="text-xl font-black tracking-tighter text-[#fcd535] cursor-pointer hover:opacity-80 transition-opacity">
            K-TRADE <span className="text-white text-sm font-normal ml-1">Pro</span>
          </div>
          <div className="hidden md:flex gap-4 text-zinc-400 font-medium text-xs">
            <span className="hover:text-white cursor-pointer transition-colors duration-200">Buy Crypto</span>
            <Link href="/markets" className="hover:text-white cursor-pointer transition-colors duration-200">Markets</Link>
            <span className="text-[#fcd535] cursor-pointer transition-colors duration-200">Trade</span>
            <span className="hover:text-white cursor-pointer transition-colors duration-200">Futures</span>
            <span className="hover:text-white cursor-pointer transition-colors duration-200">Earn</span>
          </div>
        </div>

        <div className="flex gap-4 items-center">
          <div className="text-xs text-right hidden md:block mr-4">
            <p className="text-zinc-500">
              {walletAddress ? `Wallet: ${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}` : "Estimated Balance"}
            </p>
            <p className="text-white font-mono group cursor-pointer">
              {walletBalance ? (
                <span className="text-[#0ecb81]">{walletBalance} {networkSymbol}</span>
              ) : (
                "0.0000 BTC"
              )}
            </p>
          </div>

          {!walletAddress ? (
            <button
              onClick={connectWallet}
              className="text-sm bg-zinc-800 hover:bg-zinc-700 text-white px-4 py-1.5 rounded transition-all duration-200 font-bold border border-zinc-600 flex items-center gap-2"
            >
              🦊 Connect Wallet
            </button>
          ) : (
            <button
              onClick={() => setIsDepositOpen(true)}
              className="text-sm bg-[#fcd535] hover:bg-[#e0bd2e] active:scale-95 text-black px-4 py-1.5 rounded transition-all duration-200 font-bold shadow-lg hover:shadow-[#fcd535]/20 flex items-center gap-1"
            >
              <span className="text-lg leading-none">↓</span> Deposit
            </button>
          )}

          {/* THE MAGIC ACCOUNT DROPDOWN */}
          <div className="relative">
            <div
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="w-8 h-8 bg-zinc-800 hover:bg-zinc-700 rounded-full flex items-center justify-center cursor-pointer transition-colors duration-200 select-none"
            >
              👤
            </div>

            {/* Account Menu Popup */}
            {isProfileOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-[#1e2329] border border-zinc-700 rounded-xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                {walletAddress ? (
                  <div className="p-4 flex flex-col gap-3">
                    <div className="flex items-center gap-3 border-b border-zinc-700/50 pb-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#fcd535] to-[#f6465d] flex items-center justify-center text-lg shadow-inner">🦊</div>
                      <div>
                        <p className="text-white font-bold text-sm">Web3 User</p>
                        <p className="text-xs text-zinc-400 font-mono bg-zinc-800/50 px-1.5 py-0.5 rounded mt-0.5 border border-zinc-700/50">
                          {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
                        </p>
                      </div>
                    </div>
                    <div className="flex justify-between items-center bg-[#0b0e11] p-3 rounded-lg border border-zinc-800 shadow-inner">
                      <span className="text-xs text-zinc-500 font-medium">Network Balance</span>
                      <span className="font-mono text-sm text-[#0ecb81] font-bold">{walletBalance} {networkSymbol}</span>
                    </div>
                    <button
                      onClick={disconnectWallet}
                      className="w-full mt-1 py-2 bg-zinc-800 hover:bg-[#f6465d]/10 text-zinc-300 hover:text-[#f6465d] text-xs font-bold rounded-lg transition-colors border border-transparent hover:border-[#f6465d]/30"
                    >
                      Disconnect Wallet
                    </button>
                  </div>
                ) : (
                  <div className="p-5 flex flex-col items-center justify-center gap-3 text-center">
                    <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center text-2xl mb-1 shadow-inner">👤</div>
                    <p className="text-white font-bold text-sm">Not Connected</p>
                    <p className="text-xs text-zinc-500 mb-2 leading-relaxed">Connect your decentralized Web3 wallet to start trading on K-TRADE Pro.</p>
                    <button
                      onClick={() => { setIsProfileOpen(false); connectWallet(); }}
                      className="w-full py-2.5 bg-[#fcd535] hover:bg-[#e0bd2e] text-black text-xs font-bold rounded-lg transition-colors shadow-lg"
                    >
                      Connect Web3 Wallet
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

        </div>
      </nav>

      {/* REST OF THE DASHBOARD REMAINS EXACTLY SAME */}
      <main className="flex-1 grid grid-cols-12 gap-[1px] bg-zinc-800/50">

        {/* LEFT: Coin Pairs */}
        <div className="col-span-2 bg-[#181a20] p-2 flex flex-col">
          <div className={`mb-4 p-3 border rounded transition-all duration-500 ${aiSignal.includes('BUY') ? 'border-[#0ecb81]/30 bg-[#0ecb81]/5' : aiSignal.includes('SELL') ? 'border-[#f6465d]/30 bg-[#f6465d]/5' : 'border-[#fcd535]/30 bg-[#fcd535]/5'}`}>
            <h3 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-2 flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full animate-ping ${aiSignal.includes('BUY') ? 'bg-[#0ecb81]' : aiSignal.includes('SELL') ? 'bg-[#f6465d]' : 'bg-[#fcd535]'}`}></span>
              AI Radar ({baseCoin})
            </h3>
            <div className="flex justify-between items-end">
              <span className={`text-lg font-black transition-colors duration-500 ${aiSignal.includes('BUY') ? 'text-[#0ecb81]' : aiSignal.includes('SELL') ? 'text-[#f6465d]' : 'text-zinc-400'}`}>
                {aiSignal}
              </span>
              <span className="text-xs font-mono text-zinc-400">{aiConfidence}% CONF</span>
            </div>
          </div>

          <input type="text" placeholder="Search coin..." className="bg-zinc-900 border border-zinc-700 text-xs p-2 rounded mb-2 w-full outline-none focus:border-[#fcd535] transition-all duration-300" />

          <div className="flex text-[10px] text-zinc-500 mb-2 px-1 justify-between">
            <span>Pair</span><span>Price</span><span>Change</span>
          </div>
          <div className="flex-1 overflow-y-auto space-y-1 text-xs font-mono pr-1 custom-scrollbar">
            {['BTC', 'ETH', 'SOL', 'KAS', 'XRP', 'ADA', 'DOGE', 'AVAX', 'LINK', 'MATIC'].map((coin, i) => {
              const pairName = `${coin}/USDT`;
              const isActive = activePair === pairName;
              return (
                <div
                  key={coin}
                  onClick={() => setActivePair(pairName)}
                  className={`flex justify-between p-1.5 rounded cursor-pointer transition-all duration-200 hover:translate-x-1 ${isActive ? 'bg-zinc-800 border-l-2 border-[#fcd535]' : 'hover:bg-zinc-800/50'}`}
                >
                  <span className={`font-sans font-medium ${isActive ? 'text-[#fcd535]' : 'text-zinc-200'}`}>{pairName}</span>
                  <span>{((64000 / (i + 1)) + Math.random() * 100).toFixed(2)}</span>
                  <span className={i % 2 === 0 ? "text-[#0ecb81]" : "text-[#f6465d]"}>
                    {i % 2 === 0 ? "+" : "-"}{(Math.random() * 5).toFixed(2)}%
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* CENTER: Chart & Trade History */}
        <div className="col-span-7 bg-[#181a20] flex flex-col">
          <div className="h-14 border-b border-zinc-800/60 flex items-center px-4 gap-6 shrink-0">
            <h1 className="text-xl font-bold text-white cursor-pointer hover:text-[#fcd535] transition-colors duration-200">{activePair}</h1>
            <div className="flex flex-col"><span className="text-[10px] text-zinc-500">24h Change</span><span className="text-[#0ecb81] font-mono text-sm">+2.45%</span></div>
          </div>

          <div className="h-[500px] w-full border-b border-zinc-800/60">
            <TradingChart />
          </div>

          <div className="flex-1 flex flex-col min-h-[250px]">
            <div className="flex gap-6 px-4 pt-2 border-b border-zinc-800 text-xs font-medium text-zinc-400">
              <span className="text-[#fcd535] border-b-2 border-[#fcd535] pb-2 cursor-pointer transition-all duration-200">Live Trade History</span>
            </div>
            <div className="p-2 overflow-y-auto text-xs">
              <table className="w-full text-left font-mono text-zinc-400">
                <thead className="text-[10px] text-zinc-500">
                  <tr><th>Date</th><th>Pair</th><th>Side</th><th>Amount</th><th>Status</th></tr>
                </thead>
                <tbody className="space-y-2">
                  {recentTrades.map((trade: any, idx: number) => (
                    <tr key={idx} className="border-b border-zinc-800/50 hover:bg-zinc-800/80 transition-colors duration-200">
                      <td className="py-2">{trade.date}</td>
                      <td className="text-white font-bold">{trade.pair}</td>
                      <td className={trade.side === 'Buy' ? "text-[#0ecb81]" : "text-[#f6465d]"}>{trade.side}</td>
                      <td className="text-zinc-200">{trade.amount}</td>
                      <td className="text-[#fcd535]">{trade.status}</td>
                    </tr>
                  ))}
                  {recentTrades.length === 0 && (
                    <tr>
                      <td colSpan={5} className="text-center py-8 text-zinc-600 animate-pulse">Waiting for trades... Place an order!</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* RIGHT: Trading Panel */}
        <div className="col-span-3 flex flex-col bg-zinc-800/50 gap-[1px]">
          <div className="bg-[#181a20] flex-1 p-2 overflow-hidden flex flex-col h-[350px]">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-xs font-semibold text-zinc-400">Order Book ({baseCoin})</h2>
            </div>
            <div className="flex justify-between text-[10px] text-zinc-500 mb-1 px-1"><span>Price(USDT)</span><span>Amount({baseCoin})</span></div>
            <div className="flex flex-col gap-[1px] font-mono text-xs flex-1 justify-end">
              {[1, 2, 3, 4, 5].map((_, i) => (
                <div key={i} className="flex justify-between text-[#f6465d] hover:bg-[#f6465d]/10 px-1 cursor-pointer relative py-[2px]"><span className="z-10">64235.10</span><span className="text-zinc-300 z-10">0.45</span></div>
              ))}
            </div>
            <div className="my-2 flex items-center justify-between py-1 px-1 hover:bg-zinc-800/50 rounded cursor-pointer"><span className="text-lg font-bold text-[#0ecb81]">64,230.00</span></div>
            <div className="flex flex-col gap-[1px] font-mono text-xs flex-1">
              {[1, 2, 3, 4, 5].map((_, i) => (
                <div key={i} className="flex justify-between text-[#0ecb81] hover:bg-[#0ecb81]/10 px-1 cursor-pointer relative py-[2px]"><span className="z-10">64228.00</span><span className="text-zinc-300 z-10">0.82</span></div>
              ))}
            </div>
          </div>

          <div className="bg-[#181a20] p-4 flex-1">
            <div className="flex gap-4 text-xs font-medium text-zinc-500 mb-4 border-b border-zinc-800 pb-2">
              <span className={`cursor-pointer ${orderType === 'Spot' ? 'text-[#fcd535]' : 'hover:text-white'}`} onClick={() => setOrderType('Spot')}>Spot</span>
              <span className={`cursor-pointer ${orderType === 'Cross' ? 'text-[#fcd535]' : 'hover:text-white'}`} onClick={() => setOrderType('Cross')}>Margin</span>
            </div>

            <div className="space-y-3">
              <div className="flex items-center bg-zinc-900 border border-zinc-700 rounded px-3 py-2 focus-within:border-[#fcd535] transition-all duration-300">
                <span className="text-zinc-500 text-xs w-12 transition-colors">Price</span>
                <input type="text" defaultValue="64230.00" className="bg-transparent text-white text-right w-full outline-none font-mono text-sm" />
                <span className="text-zinc-500 text-xs ml-2">USDT</span>
              </div>

              <div className="flex items-center bg-zinc-900 border border-zinc-700 rounded px-3 py-2 focus-within:border-[#fcd535] transition-all duration-300">
                <span className="text-zinc-500 text-xs w-12 transition-colors">Amount</span>
                <input type="text" placeholder="0.15" className="bg-transparent text-white text-right w-full outline-none font-mono text-sm" />
                <span className="text-zinc-500 text-xs ml-2 font-bold text-white">{baseCoin}</span>
              </div>

              <div className="py-2"><input type="range" className="w-full accent-[#fcd535] cursor-pointer hover:accent-[#e0bd2e] transition-all" /></div>

              <div className="flex gap-2 mt-4">
                <button onClick={() => handleOrder("Buy")} className="flex-1 bg-[#0ecb81] hover:brightness-110 active:scale-95 text-white font-bold py-3 rounded text-sm transition-all duration-200">
                  Buy {baseCoin}
                </button>
                <button onClick={() => handleOrder("Sell")} className="flex-1 bg-[#f6465d] hover:brightness-110 active:scale-95 text-white font-bold py-3 rounded text-sm transition-all duration-200">
                  Sell {baseCoin}
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* --- DEPOSIT MODAL WITH CURRENCY SEARCH --- */}
      <div
        className={`fixed inset-0 bg-black/50 z-50 transition-opacity duration-300 ${isDepositOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
        onClick={() => { setIsDepositOpen(false); setShowCurrencySelect(false); }}
      ></div>

      <div className={`fixed top-0 right-0 h-full w-[380px] bg-[#1e2329] z-50 shadow-2xl transform transition-transform duration-300 flex flex-col ${isDepositOpen ? "translate-x-0" : "translate-x-full"}`}>
        <div className="flex justify-between items-center px-6 py-5 border-b border-zinc-800/50 shrink-0">
          <button
            onClick={() => setShowCurrencySelect(!showCurrencySelect)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 border ${showCurrencySelect ? 'border-[#fcd535] bg-[#2b3139]' : 'border-zinc-700 bg-[#2b3139] hover:bg-zinc-700'}`}
          >
            <span className={`w-4 h-4 rounded-full ${selectedCurrency.color} text-white flex items-center justify-center text-[10px] leading-none`}>{selectedCurrency.symbol}</span>
            <span className="text-white">{selectedCurrency.code}</span>
            <span className={`text-[10px] text-zinc-400 transition-transform duration-200 ${showCurrencySelect ? 'rotate-180' : ''}`}>▼</span>
          </button>
          <button onClick={() => { setIsDepositOpen(false); setShowCurrencySelect(false); }} className="text-zinc-500 hover:text-white transition-colors">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {showCurrencySelect ? (
            <div className="p-4 animate-in fade-in duration-200">
              <div className="relative mb-4">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400">🔍</span>
                <input
                  type="text"
                  placeholder="Search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#0b0e11] border border-zinc-700 rounded-lg py-2.5 pl-9 pr-4 text-sm text-white outline-none focus:border-[#fcd535] transition-colors"
                />
              </div>
              <p className="text-xs text-zinc-500 font-medium mb-2 px-2">Select Payment Currency</p>
              <div className="space-y-1">
                {filteredCurrencies.map((c) => (
                  <div key={c.code} onClick={() => { setSelectedCurrency(c); setShowCurrencySelect(false); }} className="flex items-center gap-3 p-3 hover:bg-zinc-800/50 rounded-lg cursor-pointer transition-colors">
                    <div className={`w-6 h-6 rounded-full ${c.color} flex items-center justify-center text-xs font-bold text-white shadow-sm`}>{c.symbol}</div>
                    <div><p className="text-sm font-medium text-white">{c.code}</p><p className="text-xs text-zinc-500">{c.name}</p></div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="p-6 flex flex-col h-full animate-in fade-in duration-200">
              <div className="flex-1 space-y-6">
                <div>
                  <h3 className="text-[13px] font-semibold text-zinc-400 mb-3">I don't have crypto assets</h3>
                  <div className="bg-[#2b3139] hover:bg-[#323942] p-4 rounded-xl border border-transparent hover:border-zinc-600 cursor-pointer transition-all duration-200 flex items-start gap-4 group">
                    <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform"><span className="text-[#fcd535] text-sm">👤</span></div>
                    <div>
                      <h4 className="text-sm font-medium text-white mb-1">P2P Trading</h4>
                      <p className="text-xs text-zinc-500 leading-relaxed">Buy directly from users. Competitive pricing. Local payments.</p>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="text-[13px] font-semibold text-zinc-400 mb-3">I have crypto assets</h3>
                  <div className="bg-[#2b3139] hover:bg-[#323942] p-4 rounded-xl border border-transparent hover:border-zinc-600 cursor-pointer transition-all duration-200 flex items-start gap-4 group">
                    <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform"><span className="text-[#fcd535] text-sm">💳</span></div>
                    <div>
                      <h4 className="text-sm font-medium text-white mb-1">Deposit Crypto</h4>
                      <p className="text-xs text-zinc-500 leading-relaxed">Send crypto to your Binance Account</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="pt-6 pb-2 text-center">
                <span className="text-[#fcd535] text-xs font-medium border-b border-[#fcd535] cursor-pointer hover:text-white hover:border-white transition-colors pb-0.5">Beginner Deposit Tutorial</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
