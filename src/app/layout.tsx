import type { Metadata } from "next";
import { Cinzel, Cormorant_Garamond, Pinyon_Script } from "next/font/google";
import "./globals.css";

const cinzel = Cinzel({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-cinzel",
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
});

const pinyon = Pinyon_Script({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-pinyon",
});

export const metadata: Metadata = {
  title: "A Journey Through Montenegro",
  description: "Our wedding weekend on the Montenegrin coast.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${cinzel.variable} ${cormorant.variable} ${pinyon.variable}`}>
      <body className="antialiased">{children}</body>
    </html>
  );
}
