import type { Metadata } from "next";
import { Suspense } from "react";
import { Inter, Nunito, Baloo_2, Outfit } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "sonner";
import { TopProgressBar } from "@/components/ui/TopProgressBar";
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

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  weight: ["400", "500", "600", "700"],
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
      <html lang="en" suppressHydrationWarning>
        <body
          className={`${inter.variable} ${nunito.variable} ${baloo.variable} ${outfit.variable} antialiased font-sans bg-gray-light text-gray-dark`}
          suppressHydrationWarning
        >
          <Suspense fallback={null}>
            <TopProgressBar />
          </Suspense>
          {children}
          <Toaster position="top-right" richColors />
        </body>
      </html>
    </ClerkProvider>
  );
}
