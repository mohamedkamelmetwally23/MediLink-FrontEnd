import { Link } from "react-router-dom";
import doctorImage from "../../assets/Auth/loginDoctor.png";

export default function LoginIllustrationPanel() {
  return (
    <section className="relative flex w-1/2 items-center justify-center overflow-hidden rounded-r-[3rem] bg-base-200">
      <Link
        to="/"
        className="btn btn-circle btn-sm absolute left-8 top-8 z-40 border-none bg-white text-[#05ADE8] shadow-sm hover:bg-white"
        aria-label="Back to home"
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

      <div className="relative h-[560px] w-[480px]">
        <div className="absolute right-10 top-28 z-0 h-72 w-72 rounded-full bg-gradient-to-b from-[#05ADE8] to-[#6CCCC8]" />

        <div className="absolute left-12 top-32 z-10 h-14 w-14 rounded-full bg-[#1F5FAF]" />

        <div className="absolute bottom-0 left-8 z-0 h-48 w-48 rounded-full bg-[#6CCCC8]/75" />

        <div className="absolute right-0 top-80 z-20 h-8 w-8 rounded-full bg-white" />

        <div className="absolute bottom-36 left-0 z-30 flex h-36 w-36 items-center justify-center rounded-t-full rounded-br-full bg-white">
        </div>

        <img
          src={doctorImage}
          alt="Doctor"
          className="absolute bottom-6 right-12 z-20 w-[380px] object-contain"
        />
      </div>

      <p className="absolute bottom-12 text-xs text-gray-700">
        حقوق النشر محفوظة 2025-2026 © ميدلينك
      </p>
    </section>
  );
}