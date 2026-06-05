import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import Hero2 from "../components/Hero2";
import Features from "../components/Features";
import Specialties from "../components/Specialties";
import Doctors from "../components/Doctors";
import AiAgent from "../components/AiAgent";
import AssistantButton from "../components/AssistantButton";
import BenefitsOfWeb from "../components/BenefitsOfWeb";
import FAQ from "../components/Questions";
import Footer from "../components/Footer";
import ThemeToggle from "../components/ThemeToggle";

export default function LandingPage() {
  return (
    <div>
      <div className="shadow-[0_4px_6px_-2px_rgba(0,0,0,0.1)]">
        <Navbar />
      </div>
      <Hero />
      <Hero2 />
      <Features />
      <Specialties />
      <Doctors />
      <AiAgent />
      <AssistantButton />
      <BenefitsOfWeb />
      <FAQ />
      <Footer />
      <ThemeToggle />
    </div>
  );
}
