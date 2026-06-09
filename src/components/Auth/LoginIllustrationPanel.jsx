// import doctorImage from "../../assets/Auth/loginDoctor.png";
import doctorImageDark from "../../assets/landingPage/login-doctor-dark (2).png";
import doctorImageLight from "../../assets/landingPage/login-doctor.png";
import bgLight from "../../assets/landingPage/login-bg-light.png";
import bgDark from "../../assets/landingPage/login-bg-dark.png";
import {useTheme} from "../../hooks/useTheme"
import { ArrowButton } from "../ui/ArrowButton";


export default function LoginIllustrationPanel() {
  const {dark} = useTheme()
  return (
    <section className="relative flex w-1/2 items-center justify-center overflow-hidden rounded-r-[3rem] bg-(--bg-primary)">
      <ArrowButton
        to="/"
        className="absolute left-5 top-7 z-40 h-9 w-9 bg-white text-[#05ADE8] hover:bg-white"
        ariaLabel="Back to home"
      />

      <div className="relative h-full w-full">
        <img
          src={dark ? bgDark : bgLight}
          alt="Doctor"
          className="absolute bottom-0 right-0 z-20 h-full w-full  object-fill"
        />
        <img
          src={dark ? doctorImageLight : doctorImageDark}
          alt="Doctor"
          className="absolute bottom-25 right-0 z-21 h-[93%] w-full  object-fill"
        />
      </div>

      <p className="absolute bottom-12 z-22 text-xs text-(--text-primary)">
        حقوق النشر محفوظة 2025-2026 © ميدلينك
      </p>
    </section>
  );
}
