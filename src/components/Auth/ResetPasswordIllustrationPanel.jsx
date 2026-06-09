// import doctorImage from "../../assets/Auth/resetDoctor.png";
import doctorImage from "../../assets/landingPage/doctorReset.png";
import addsLight from "../../assets/landingPage/adds-light.png";
import addsDark from "../../assets/landingPage/adds-Dark.png";
import vector from "../../assets/landingPage/Vector 94.png";
import union from "../../assets/landingPage/Union.png";
import bgDark from "../../assets/landingPage/login-bg-dark.png";
import bgLight from "../../assets/landingPage/login-bg-light.png";
import {useTheme} from "../../hooks/useTheme"
import { ArrowButton } from "../ui/ArrowButton";


export default function ResetPasswordIllustrationPanel() {
  const {dark} = useTheme()
  return (
    <section className="relative flex w-1/2 items-center justify-center overflow-hidden rounded-r-[3rem] bg-base-200">
      {/* Back Button */}
      <ArrowButton
        to="/login"
        className="absolute left-5 top-7 z-40 h-9 w-9 bg-white text-[#05ADE8] hover:bg-white"
        ariaLabel="Back to login"
      />

      {/* Illustration */}
      <div className="relative h-full w-full">
        <img
          src={dark? bgDark : bgLight}
          alt="Doctor"
          className="absolute bottom-0 right-0 z-17 w-full h-full object-fill"
        />
        <img
          src={dark? addsDark : addsLight}
          alt="Doctor"
          className="absolute bottom-20 right-0 z-21 w-full h-full object-contain"
        />
        <img
          src={union}
          alt="Doctor"
          className="absolute bottom-90 right-10 z-19  object-contain"
        />
        <img
          src={vector}
          alt="Doctor"
          className="absolute bottom-35 right-10 z-18  object-contain"
        />
        <img
          src={doctorImage}
          alt="Doctor"
          className="absolute bottom-30 right-0 z-20 w-full h-[80%] object-contain"
        />
      </div>

      {/* Copyright */}
      <p className="absolute bottom-12 z-22 text-xs text-(--text-primary)">
        حقوق النشر محفوظة 2025-2026 © ميدلينك
      </p>
    </section>
  );
}
