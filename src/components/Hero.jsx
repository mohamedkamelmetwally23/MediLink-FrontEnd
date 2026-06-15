import { Link } from "react-router-dom";
import doctor from "../assets/landingPage/doctor1.png";
import img1 from "../assets/landingPage/1.png";
import img2 from "../assets/landingPage/2.png";
import img3 from "../assets/landingPage/3.png";
import img1Dark from "../assets/landingPage/1 dark.png";
import img2Dark from "../assets/landingPage/2 dark.png";
import img3Dark from "../assets/landingPage/3 dark.png";
import { useTheme } from "../hooks/useTheme";

export default function Hero() {
  const { dark } = useTheme();
  const handleBrowseDoctors = () => {
    document.getElementById("doctors")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  const badges = [
    { icon: dark ? img1Dark : img1, label: "آمن وموثوق" },
    { icon: dark ? img2Dark : img2, label: "سهل الاستخدام" },
  ];

  return (
    <section id="home" className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-16">
      <div className="grid gap-10 lg:grid-cols-[1fr_0.95fr] lg:items-center">
        <div className="order-2 text-center lg:order-1 lg:text-right">
          <h1 className="text-4xl font-bold leading-tight text-gray-950 dark:text-[#F0F0F0] sm:text-5xl lg:text-6xl">
            رعايتك الصحية
            <br />
            تبدأ مع <span className="text-cyan-500">ميدلينك</span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-gray-600 dark:text-[#D2D2D2] lg:mx-0 lg:text-lg">
            منصة ذكية لحجز وإدارة الخدمات الطبية بسهولة وسرعة. تواصل مع أفضل
            الأطباء واحصل على رعاية متكاملة بضغطة زر.
          </p>

          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row lg:justify-start">
            <Link
              to="/login"
              className="btn h-12 rounded-lg border-0 bg-linear-to-b from-[#05ADE8] to-[#6CCCC8] px-10 text-white shadow-none dark:text-black"
            >
              تسجيل دخول
            </Link>

            <button
              type="button"
              onClick={handleBrowseDoctors}
              className="btn btn-outline btn-info h-12 rounded-lg px-10"
            >
              تصفح الأطباء
            </button>
          </div>

          <div className="mt-8 grid grid-cols-3 gap-3 text-xs sm:text-sm lg:max-w-xl">
            {badges.map((badge) => (
              <div
                key={badge.label}
                className="flex min-h-16 items-center justify-center gap-2 rounded-lg bg-white px-2 shadow-sm dark:bg-[#252525]"
              >
                <img src={badge.icon} alt="" className="h-8 w-8 shrink-0" />
                <span className="leading-5">{badge.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="order-1 flex justify-center lg:order-2">
          <div className="relative w-full max-w-[470px]">
            <div className="absolute left-1/2 top-16 h-56 w-56 -translate-x-1/2 rounded-full bg-cyan-400 sm:h-72 sm:w-72" />
            <img
              src={doctor}
              alt="طبيب من ميدلينك"
              className="relative z-10 mx-auto w-full max-w-[430px] object-contain"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
