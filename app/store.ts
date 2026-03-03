import { create } from 'zustand';

interface TradeStore {
    isAuthenticated: boolean; // Security Lock
    login: () => void;
    logout: () => void;

    activePair: string;
    setActivePair: (pair: string) => void;

    aiSignal: string;
    aiConfidence: number;
    recentTrades: any[];
    setAIStats: (signal: string, confidence: number) => void;
    setRecentTrades: (trades: any[]) => void;
}

export const useTradeStore = create<TradeStore>((set) => ({
    isAuthenticated: false, // Default ga evaru login ayyi undaru
    login: () => set({ isAuthenticated: true }),
    logout: () => set({ isAuthenticated: false }),

    activePair: 'BTC/USDT',
    setActivePair: (pair) => set({ activePair: pair }),

    aiSignal: 'WAITING...',
    aiConfidence: 0,
    recentTrades: [],
    setAIStats: (signal, confidence) => set({ aiSignal: signal, aiConfidence: confidence }),
    setRecentTrades: (trades) => set({ recentTrades: trades }),
}));
