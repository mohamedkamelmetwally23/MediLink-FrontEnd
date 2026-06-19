import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import Hero2 from "../components/Hero2";
import Features from "../components/Features";
import Specialties from "../components/Specialties";
import Doctors from "../components/Doctors";
import BenefitsOfWeb from "../components/BenefitsOfWeb";
import FAQ from "../components/Questions";
import Footer from "../components/Footer";
import ThemeToggle from "../components/ThemeToggle";
import LandingSkeleton from "../components/LandingSkeleton";

export default function LandingPage() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = window.setTimeout(() => setIsLoading(false), 450);

    return () => window.clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <LandingSkeleton />;
  }

  return (
    <div className="w-full overflow-x-hidden">
      <div className="fixed inset-x-0 top-0 z-50 bg-white/95 shadow-[0_4px_6px_-2px_rgba(0,0,0,0.1)] backdrop-blur dark:bg-[#2E2E2E]/95">
        <Navbar />
      </div>
      <main className="w-full pt-[72px] overflow-x-hidden">
        <Hero />
        <Hero2 />
        <Features />
        <Specialties />
        <Doctors />
        <BenefitsOfWeb />
        <FAQ />
        <Footer />
      </main>
      <ThemeToggle />
    </div>
  );
}
