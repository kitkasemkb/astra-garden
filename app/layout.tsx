import "./globals.css";
import type { Metadata } from "next";
import { Cormorant_Garamond, Sarabun } from "next/font/google";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-serif",
  display: "swap",
});
const sarabun = Sarabun({
  subsets: ["thai", "latin"],
  weight: ["300", "400", "600", "700"],
  variable: "--font-thai",
  display: "swap",
});

export const metadata: Metadata = {
  title: "ASTRA GARDEN · Astrology & Numerology",
  description: "Astrology translated into gentle guidance — birth chart, life path, and personal readings.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th" className={`${cormorant.variable} ${sarabun.variable}`}>
      <body>{children}</body>
    </html>
  );
}
