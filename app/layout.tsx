import type { Metadata } from "next";
import { Inter, Nunito, Baloo_2 } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const nunito = Nunito({
  subsets: ["latin"],
  variable: "--font-nunito",
});

const baloo = Baloo_2({
  subsets: ["latin"],
  variable: "--font-baloo",
});

export const metadata: Metadata = {
  title: "hiCousins",
  description: "Gamified family contribution tracking",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body
          className={`${inter.variable} ${nunito.variable} ${baloo.variable} antialiased font-sans bg-gray-light text-gray-dark`}
        >
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
