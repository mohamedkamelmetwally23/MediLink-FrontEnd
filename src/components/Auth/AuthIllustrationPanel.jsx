import doctorImage from "../../assets/landingPage/signupDoctor.png";
import doctorAddsDark from "../../assets/landingPage/signup-layOut.png";
import doctorAddsLight from "../../assets/landingPage/signup-layOut-light.png";
import bgDark from "../../assets/landingPage/login-bg-dark.png";
import bgLight from "../../assets/landingPage/login-bg-light.png";
import { useTheme } from "../../hooks/useTheme";
import union from "../../assets/landingPage/Union.png";
import vector from "../../assets/landingPage/Vector 94.png";
import { ArrowButton } from "../ui/ArrowButton";

function BackButton({ onBack }) {
  const className =
    "absolute left-5 top-7 z-40 h-9 w-9 bg-white text-[#05ADE8] hover:bg-white";

  if (onBack) {
    return (
      <ArrowButton
        onClick={onBack}
        className={className}
        ariaLabel="Back to register form"
      />
    );
  }

  return (
    <ArrowButton to="/" className={className} ariaLabel="Back to home" />
  );
}

export default function AuthIllustrationPanel({ onBack }) {
  const { dark } = useTheme();
  return (
    <section className="relative flex  w-1/2 items-center justify-center overflow-hidden rounded-r-[3rem] bg-(--bg-primary)">
      <BackButton onBack={onBack} />
      {/* Illustration */}
      <div className="relative h-full w-full">
        <img
          src={dark ? bgDark : bgLight}
          alt="Doctor"
          className="absolute bottom-0 right-0 z-17  w-full h-full object-cover"
        />
        <img
          src={union}
          alt="Doctor"
          className="absolute bottom-90 right-10 z-19  object-contain"
        />
        <img
          src={vector}
          alt="Doctor"
          className="absolute bottom-40 right-10 z-18  object-contain"
        />
        <img
          src={dark ? doctorAddsDark : doctorAddsLight}
          alt="Doctor"
          className="absolute bottom-30 right-0 z-21  w-full h-full object-contain"
        />
        <img
          src={doctorImage}
          alt="Doctor"
          className="absolute bottom-10 right-0 z-20  w-full h-full object-contain"
        />
      </div>

      {/* Copyright */}
      <p className="absolute bottom-12 text-xs z-22 text-(--text-primary)">
        حقوق النشر محفوظة 2025-2026 © ميدلينك
      </p>
    </section>
  );
}
