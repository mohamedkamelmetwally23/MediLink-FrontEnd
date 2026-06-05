import { useState } from "react";
import { FiMinus, FiPlus } from "react-icons/fi";
import img from "../assets/landingPage/question.png";
import imgDark from "../assets/landingPage/question-dark.png";
import { useTheme } from "../hooks/useTheme";

const faqs = [
  {
    question: "هل يمكنني حجز موعد دون الاتصال بالعيادة؟",
    answer:
      "نعم، يمكنك حجز موعدك بالكامل عبر المنصة واختيار الطبيب والتوقيت المناسب لك بكل سهولة.",
  },
  {
    question: "هل يمكنني إلغاء أو تعديل موعدي؟",
    answer:
      "نعم، يمكنك تعديل أو إلغاء الموعد من خلال حسابك الشخصي قبل موعد الزيارة.",
  },
  {
    question: "هل بياناتي ومعلوماتي الطبية آمنة؟",
    answer:
      "جميع البيانات محمية بمعايير أمان وخصوصية مصممة للحفاظ على معلوماتك.",
  },
  {
    question: "هل يمكنني التواصل مع الطبيب مباشرة؟",
    answer:
      "يمكنك التواصل مع الطبيب من خلال وسائل التواصل المتاحة داخل المنصة.",
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(0);
  const { dark } = useTheme();

  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="grid gap-6 lg:grid-cols-3">
        <aside className="flex flex-col items-center justify-center rounded-xl bg-linear-to-b from-[#05ADE8] to-[#6CCCC8] p-6 text-center text-white lg:p-8">
          <img src={dark ? imgDark : img} alt="" className="mb-4 max-h-52 object-contain" />
          <h3 className="mb-3 text-2xl font-bold dark:text-[#2E2E2E]">
            الأسئلة الأكثر شيوعًا
          </h3>
          <p className="leading-8 dark:text-[#2E2E2E]">
            تعرف أكثر على منصة ميدلينك وخدمات الرعاية الصحية الرقمية.
          </p>
        </aside>

        <div className="space-y-4 lg:col-span-2">
          {faqs.map((faq, index) => (
            <article
              key={faq.question}
              className={`overflow-hidden rounded-xl border-2 border-cyan-500 transition-all duration-300 ${
                openIndex === index
                  ? "bg-linear-to-r from-[#05ADE8] to-[#6CCCC8] text-white dark:text-[#2E2E2E]"
                  : "bg-white text-[#05ADE8] dark:bg-[#252525]"
              }`}
            >
              <button
                type="button"
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="flex w-full items-center justify-between gap-4 p-4 text-right sm:p-5"
              >
                <span className="text-base font-bold leading-7 sm:text-lg">
                  {index + 1}- {faq.question}
                </span>
                <span className="shrink-0">
                  {openIndex === index ? <FiMinus size={26} /> : <FiPlus size={26} />}
                </span>
              </button>

              <div
                className={`overflow-hidden transition-all duration-300 ${
                  openIndex === index ? "max-h-48 px-4 pb-5 opacity-100 sm:px-5" : "max-h-0 opacity-0"
                }`}
              >
                <p className="text-sm leading-7 sm:text-base">{faq.answer}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
