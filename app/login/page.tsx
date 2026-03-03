"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useTradeStore } from "../store"; // Store techukunnam

export default function LoginPage() {
    const [loginMethod, setLoginMethod] = useState("email");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const router = useRouter();
    const { login } = useTradeStore(); // Login action thechukunnam

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || !password) {
            toast.error("Please enter email and password!", {
                style: { background: '#181a20', color: '#f6465d', border: '1px solid #f6465d' }
            });
            return;
        }

        setIsLoading(true);

        setTimeout(() => {
            login(); // 🔓 Ikkada Lock open chesthunnam!

            toast.success("Login Successful! Redirecting...", {
                style: { background: '#181a20', color: '#0ecb81', border: '1px solid #0ecb81' },
                icon: '🚀'
            });

            setTimeout(() => {
                router.push("/");
            }, 1000);
        }, 1500);
    };

    return (
        <div className="min-h-screen bg-[#0b0e11] text-white font-sans selection:bg-[#fcd535] selection:text-black flex flex-col">
            <nav className="h-20 flex items-center px-6 lg:px-12 bg-transparent shrink-0">
                <Link href="/" className="text-2xl font-black tracking-tighter text-[#fcd535] flex items-center gap-2 hover:opacity-80 transition-opacity">
                    <svg className="w-7 h-7 fill-[#fcd535]" viewBox="0 0 24 24"><path d="M12 0l3.5 3.5-3.5 3.5-3.5-3.5L12 0zm7.1 7.1l3.5 3.5-3.5 3.5-3.5-3.5 3.5-3.5zM4.9 7.1l3.5 3.5-3.5 3.5-3.5-3.5 3.5-3.5zM12 14.1l3.5 3.5-3.5 3.5-3.5-3.5 3.5-3.5z" /></svg>
                    K-TRADE <span className="text-white font-normal text-sm ml-1 mt-1">Pro</span>
                </Link>
            </nav>

            <main className="flex-1 flex items-center justify-center p-4">
                <div className="w-full max-w-[850px] bg-[#181a20] rounded-2xl shadow-2xl border border-zinc-800/80 flex flex-col md:flex-row overflow-hidden animate-in fade-in zoom-in-95 duration-500">
                    <div className="flex-1 p-8 lg:p-12">
                        <h1 className="text-3xl font-bold mb-2">Log In</h1>
                        <p className="text-zinc-400 text-sm mb-8">Welcome back! Please enter your details.</p>

                        <div className="flex gap-6 text-sm font-medium mb-8 border-b border-zinc-800">
                            <span onClick={() => setLoginMethod("email")} className={`pb-3 cursor-pointer transition-colors ${loginMethod === "email" ? "text-white border-b-2 border-[#fcd535]" : "text-zinc-500 hover:text-white"}`}>Email</span>
                            <span onClick={() => setLoginMethod("phone")} className={`pb-3 cursor-pointer transition-colors ${loginMethod === "phone" ? "text-white border-b-2 border-[#fcd535]" : "text-zinc-500 hover:text-white"}`}>Phone Number</span>
                        </div>

                        <form onSubmit={handleLogin} className="space-y-5">
                            <div className="space-y-2">
                                <label className="text-xs text-zinc-400 font-medium">Email</label>
                                <div className="bg-[#0b0e11] border border-zinc-700 rounded-lg px-4 py-3 focus-within:border-[#fcd535] transition-all duration-300">
                                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Enter your email" className="w-full bg-transparent text-white outline-none text-sm placeholder:text-zinc-600" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs text-zinc-400 font-medium">Password</label>
                                <div className="bg-[#0b0e11] border border-zinc-700 rounded-lg px-4 py-3 focus-within:border-[#fcd535] transition-all duration-300">
                                    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter your password" className="w-full bg-transparent text-white outline-none text-sm placeholder:text-zinc-600" />
                                </div>
                            </div>
                            <div className="flex justify-end"><span className="text-[#fcd535] text-xs hover:underline cursor-pointer">Forgot Password?</span></div>
                            <button type="submit" disabled={isLoading} className="w-full bg-[#fcd535] hover:bg-[#e0bd2e] active:scale-[0.98] text-black font-bold py-3.5 rounded-lg transition-all duration-200 shadow-lg disabled:opacity-70 flex justify-center items-center">
                                {isLoading ? <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div> : "Log In"}
                            </button>
                        </form>
                    </div>

                    <div className="hidden md:flex flex-1 bg-[#0b0e11] border-l border-zinc-800/80 p-12 flex-col items-center justify-center text-center relative overflow-hidden">
                        <h2 className="text-xl font-bold mb-3 z-10">Log in with QR Code</h2>
                        <p className="text-sm text-zinc-500 mb-8 max-w-[250px] z-10">Scan this code with the K-TRADE mobile app to log in instantly.</p>
                        <div className="bg-white p-4 rounded-2xl z-10 mb-8 transition-transform hover:scale-105 duration-300 cursor-pointer">
                            <svg width="160" height="160" viewBox="0 0 200 200" fill="black" xmlns="http://www.w3.org/2000/svg">
                                <rect x="20" y="20" width="60" height="60" fill="none" stroke="black" strokeWidth="12" rx="8" />
                                <rect x="120" y="20" width="60" height="60" fill="none" stroke="black" strokeWidth="12" rx="8" />
                                <rect x="20" y="120" width="60" height="60" fill="none" stroke="black" strokeWidth="12" rx="8" />
                                <rect x="40" y="40" width="20" height="20" rx="4" /><rect x="140" y="40" width="20" height="20" rx="4" /><rect x="40" y="140" width="20" height="20" rx="4" />
                                <path d="M110 110h30v20h-30zM150 150h30v30h-30zM110 160h20v20h-20zM160 110h20v20h-20z" fill="black" />
                                <path d="M90 20h20v40H90zM90 140h20v40H90zM20 90h40v20H20zM140 90h40v20h-40z" fill="black" />
                                <rect x="90" y="80" width="20" height="20" fill="#fcd535" />
                            </svg>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
