import { Link } from "react-router-dom";

export default function AuthSuccess({
  title = "تم تأكيد حسابك بنجاح",
  description = "يمكنك الآن المتابعة واستخدام حسابك.",
  buttonText = "متابعة",
  to = "/login",
}) {
  return (
    <section className="relative flex min-h-[760px] w-full items-center justify-center bg-white px-6 py-10 text-center dark:bg-[#252525]">
      <div className="w-full max-w-[360px]" dir="rtl">
        <div className="relative mx-auto mb-6 flex h-40 w-40 items-center justify-center">
          <div className="absolute h-28 w-28 rounded-full bg-gradient-to-b from-[#05ADE8] to-[#6CCCC8]" />
          <div className="absolute right-6 top-3 h-5 w-5 rounded-full bg-[#1F5FAF]" />
          <div className="absolute bottom-5 left-5 h-20 w-20 rounded-full bg-[#6CCCC8]/70" />
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2.6}
            stroke="currentColor"
            className="relative z-10 h-16 w-16 text-white"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="m4.5 12.75 6 6 9-13.5"
            />
          </svg>
        </div>

        <h1 className="mb-3 text-2xl font-semibold text-gray-900 dark:text-[#F0F0F0]">
          {title}
        </h1>
        <p className="mx-auto mb-7 max-w-[300px] text-sm leading-6 text-gray-500 dark:text-[#D2D2D2]">
          {description}
        </p>

        <Link
          to={to}
          className="btn h-12 w-full rounded-lg border-none bg-gradient-to-r from-[#05ADE8] to-[#6CCCC8] text-sm font-normal text-white hover:from-[#05ADE8] hover:to-[#6CCCC8]"
        >
          {buttonText}
        </Link>
      </div>
    </section>
  );
}
