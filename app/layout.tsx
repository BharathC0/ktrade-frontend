import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "K-TRADE Pro | Advanced Trading Terminal",
  description: "High-frequency AI trading terminal",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
        {/* Ikkada pettam chudu mana Pro Toaster */}
        <Toaster
          position="bottom-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#181a20',
              color: '#fff',
              border: '1px solid #3f3f46',
              fontSize: '12px',
              fontFamily: 'monospace',
            },
          }}
        />
      </body>
    </html>
  );
}
