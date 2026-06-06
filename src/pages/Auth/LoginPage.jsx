import LoginIllustrationPanel from "../../components/Auth/LoginIllustrationPanel";
import LoginForm from "../../components/Auth/LoginForm";
import { Link } from "react-router-dom";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen relative w-full items-center justify-center bg-[#D3E0E4] p-4 dark:bg-[#151515]">
      <Link
        to="/"
        className="btn btn-circle btn-sm fixed left-5 top-5 lg:hidden  z-40 border-none bg-white text-[#05ADE8] shadow-sm hover:bg-white"
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
      <div className="flex w-full max-w-[1200px] relative flex-col items-stretch overflow-hidden rounded-[2rem] bg-white shadow-[0_25px_80px_-35px_rgba(0,0,0,0.25)] dark:bg-[#252525] lg:flex-row-reverse lg:min-h-[760px]">
        <LoginIllustrationPanel />
        <LoginForm />
      </div>
    </main>
  );
}
