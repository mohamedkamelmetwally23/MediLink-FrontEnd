import doctor from "../assets/landingPage/doctor1.png";
import img1 from "../assets/landingPage/1.png";
import img2 from "../assets/landingPage/2.png";
import img3 from "../assets/landingPage/3.png";
import img1Dark from "../assets/landingPage/1 dark.png";
import img2Dark from "../assets/landingPage/2 dark.png";
import img3Dark from "../assets/landingPage/3 dark.png";
import { useTheme } from "../context/ThemeContext";

export default function Hero() {
  const {dark} = useTheme()
  return (
    <>
      <section className="px-6 hidden md:px-5 py-12 md:flex md:flex-col-reverse ">
        <div className="hidden md:grid md:grid-cols-2 gap-12 items-center relative">
          <div className="text-center md:text-right absolute z-1000 top-10 md:relative">
            <h1 className="text-4xl md:text-6xl  font-bold leading-snug">
              رعايتك الصحية
              <br />
              تبدأ مع
              <span className="text-cyan-500"> ميدلينك</span>
            </h1>

            <p className="py-6 md:w-120 leading-8">
              منصة ذكية لحجز وإدارة الخدمات الطبية بسهولة وسرعة، تواصل مع أفضل
              الأطباء واحصل على رعاية متكاملة بضغطة زر.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <button className="btn bg-linear-to-b from-[#05ADE8] to-[#6CCCC8] dark:text-black outline-none border-0 px-10 md:w-70">
                تسجيل دخول
              </button>

              <button className="btn btn-outline btn-info px-10 md:w-70">
                تصفح الأطباء
              </button>
            </div>

            <div className="flex justify-between items-center gap-5 py-8 mt-10 w-full md:justify-start">
              <div className="flex justify-start items-start gap-1 text-xs md:text-[16px]">
                <img src={dark ? img1Dark : img1} alt="" />

                <p className="self-center">آمن وموثوق</p>
              </div>
              <div className="flex justify-start items-start gap-3 text-xs md:text-[16px]">
                <img src={dark ? img2Dark : img2} alt="" />
                <p className="self-center">سهل الإستخدام</p>
              </div>
              <div className="flex justify-start items-start gap-3 text-xs md:text-[16px]">
                <img src={dark ? img3Dark : img3} alt="" />
                <p className="self-center">دعم فني 24/7</p>
              </div>
            </div>
          </div>

          <div className="relative flex justify-center">
            <div className="absolute w-64 h-64 bg-cyan-400 rounded-full top-10"></div>

            <img
              src={doctor}
              alt=""
              className="relative z-10 max-w-md w-full"
            />
          </div>
        </div>
      </section>

      {/*mobile layout*/}
      <section className=" flex flex-col-reverse">
        <div className="flex justify-around items-center gap-5 mt-4 w-full md:hidden">
          <div className="flex justify-start items-start gap-1 text-xs md:text-[16px]">
            <img src={dark ? img1Dark : img1} alt="" />

            <p className="self-center">آمن وموثوق</p>
          </div>
          <div className="flex justify-start items-start gap-3 text-xs md:text-[16px]">
            <img src={dark ? img2Dark : img2} alt="" />
            <p className="self-center">سهل الإستخدام</p>
          </div>
          <div className="flex justify-start items-start gap-3 text-xs md:text-[16px]">
            <img src={dark ? img3Dark : img3} alt="" />
            <p className="self-center">دعم فني 24/7</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:hidden gap-12 items-center relative">
          <div className="text-center absolute z-1000 top-10">
            <h1 className="text-5xl  font-bold leading-snug text-[#F0F0F0] ">
              رعايتك الصحية
              <br />
              تبدأ مع
              <span className="text-cyan-500"> ميدلينك</span>
            </h1>

            <p className="py-6 px-4 text-white  leading-8">
              منصة ذكية لحجز وإدارة الخدمات الطبية بسهولة وسرعة، تواصل مع أفضل
              الأطباء واحصل على رعاية متكاملة بضغطة زر.
            </p>

            <div className="flex flex-row gap-4 justify-center ">
              <button className="btn shadow-none border-0 bg-linear-to-b from-[#05ADE8] to-[#6CCCC8] text-white dark:text-black px-10 rounded-lg">
                تسجيل دخول
              </button>

              <button className="btn btn-outline btn-info px-10 md:w-70">
                تصفح الأطباء
              </button>
            </div>
          </div>

          <div className="relative flex justify-center">
            <div className="absolute inset-0 bg-black/80 z-20 "></div>
            <div className="absolute w-64 h-64 bg-cyan-400 rounded-full top-10"></div>

            <img
              src={doctor}
              alt=""
              className="relative z-10 max-w-md w-full"
            />
          </div>
        </div>
      </section>
    </>
  );
}
