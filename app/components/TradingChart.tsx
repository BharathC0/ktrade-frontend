"use client";

import { useEffect, useRef } from "react";
import { createChart, ColorType } from "lightweight-charts";
import { useTradeStore } from "../store";

export default function TradingChart() {
    const chartContainerRef = useRef<HTMLDivElement>(null);
    const setAIStats = useTradeStore((state) => state.setAIStats);
    const setRecentTrades = useTradeStore((state) => state.setRecentTrades);

    useEffect(() => {
        if (!chartContainerRef.current) return;

        const chart = createChart(chartContainerRef.current, {
            layout: {
                background: { type: ColorType.Solid, color: "transparent" },
                textColor: "#a1a1aa",
            },
            grid: {
                vertLines: { color: "rgba(39, 39, 42, 0.4)" },
                horzLines: { color: "rgba(39, 39, 42, 0.4)" },
            },
            width: chartContainerRef.current.clientWidth,
            height: chartContainerRef.current.clientHeight,
            timeScale: {
                timeVisible: true,
                secondsVisible: false,
            },
        });

        const candlestickSeries = chart.addCandlestickSeries({
            upColor: "#0ecb81",
            downColor: "#f6465d",
            borderVisible: false,
            wickUpColor: "#0ecb81",
            wickDownColor: "#f6465d",
        });

        // 1. Generate Historical Data
        const historicalData = [];
        let startTime = Math.floor(Date.now() / 1000) - (100 * 60);
        let lastClose = 64200;

        for (let i = 0; i < 100; i++) {
            const open = lastClose + (Math.random() * 20 - 10);
            const close = open + (Math.random() * 30 - 15);
            historicalData.push({
                time: startTime as any,
                open: Number(open.toFixed(2)),
                high: Number(Math.max(open, close) + 5).valueOf(),
                low: Number(Math.min(open, close) - 5).valueOf(),
                close: Number(close.toFixed(2)),
            });
            startTime += 60;
            lastClose = close;
        }

        candlestickSeries.setData(historicalData);
        let latestTime = startTime;

        // 2. Connect Live WebSocket
        const ws = new WebSocket("ws://127.0.0.1:8000/ws/live-data");

        ws.onmessage = (event) => {
            const parsedData = JSON.parse(event.data);

            // Update Candles
            if (parsedData.candle) {
                latestTime += 60;
                candlestickSeries.update({
                    time: latestTime as any,
                    open: parsedData.candle.open,
                    high: parsedData.candle.high,
                    low: parsedData.candle.low,
                    close: parsedData.candle.close,
                });
            }

            // Update AI Signal
            if (parsedData.ai) {
                setAIStats(parsedData.ai.signal, parsedData.ai.confidence);
            }

            // Update Trade History Table
            if (parsedData.recent_trades) {
                setRecentTrades(parsedData.recent_trades);
            }
        };

        const handleResize = () => {
            chart.applyOptions({ width: chartContainerRef.current?.clientWidth });
        };
        window.addEventListener("resize", handleResize);

        return () => {
            window.removeEventListener("resize", handleResize);
            ws.close();
            chart.remove();
        };
    }, [setAIStats, setRecentTrades]);

    return <div ref={chartContainerRef} className="w-full h-full min-h-[400px]" />;
}