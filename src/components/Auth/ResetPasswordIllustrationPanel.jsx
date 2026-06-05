import { Link } from "react-router-dom";
import doctorImage from "../../assets/Auth/resetDoctor.png";

export default function ResetPasswordIllustrationPanel() {
  return (
    <section className="relative flex w-1/2 items-center justify-center overflow-hidden rounded-r-[3rem] bg-base-200">
      {/* Back Button */}
      <Link
        to="/login"
        className="btn btn-circle btn-sm absolute left-8 top-8 z-40 border-none bg-white text-[#05ADE8] shadow-sm hover:bg-white"
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
      <div className="relative h-[560px] w-[480px]">
        <img
          src={doctorImage}
          alt="Doctor"
          className="absolute bottom-12 right-8 z-20 w-[390px] object-contain"
        />
      </div>

      {/* Copyright */}
      <p className="absolute bottom-12 text-xs text-gray-700">
        حقوق النشر محفوظة 2025-2026 © ميدلينك
      </p>
    </section>
  );
}