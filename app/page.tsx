import { Navbar } from "@/components/Landing/Navbar";
import { Hero } from "@/components/Landing/Hero";
import { Features } from "@/components/Landing/Features";
import { Footer } from "@/components/Landing/Footer";

export default function Home() {
  return (
    <main className="min-h-screen font-sans">
      <Navbar />
      <Hero />
      <Features />
      <Footer />
    </main>
  );
}
