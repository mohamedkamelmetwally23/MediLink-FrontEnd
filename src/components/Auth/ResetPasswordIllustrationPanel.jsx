import { Link } from "react-router-dom";
// import doctorImage from "../../assets/Auth/resetDoctor.png";
import doctorImage from "../../assets/landingPage/doctorReset.png";
import addsLight from "../../assets/landingPage/adds-light.png";
import addsDark from "../../assets/landingPage/adds-Dark.png";
import vector from "../../assets/landingPage/Vector 94.png";
import union from "../../assets/landingPage/Union.png";
import bgDark from "../../assets/landingPage/login-bg-dark.png";
import bgLight from "../../assets/landingPage/login-bg-light.png";
import {useTheme} from "../../hooks/useTheme"


export default function ResetPasswordIllustrationPanel() {
  const {dark} = useTheme()
  return (
    <section className="relative flex w-1/2 items-center justify-center overflow-hidden rounded-r-[3rem] bg-(--bg-primary)">
      {/* Back Button */}
      <Link
        to="/login"
        className="btn btn-circle btn-sm absolute left-4 top-8 z-40 border-none bg-white text-[#05ADE8] shadow-sm hover:bg-white"
        aria-label="Back to login"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
          className="h-5 w-5"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18"
          />
        </svg>
      </Link>

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