import { useState } from "react";
import { FiPlus, FiMinus } from "react-icons/fi";
import img from "../assets/landingPage/question.png";
import imgDark from "../assets/landingPage/question-dark.png";
import {useTheme} from "../context/ThemeContext"

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(0);
  const {dark} = useTheme()

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
        "جميع البيانات محمية بأحدث معايير الأمان والخصوصية لضمان سلامة معلوماتك.",
    },
    {
      question: "هل يمكنني التواصل مع الطبيب مباشرة؟",
      answer:
        "يمكنك التواصل مع الطبيب من خلال وسائل التواصل المتاحة داخل المنصة.",
    },
  ];

  const toggleItem = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="py-16 px-6 ">
      <div className="grid md:grid-cols-3 gap-8">
        {/* Side Card */}
        <div className="rounded-2xl bg-linear-to-b from-[#05ADE8] dark:from-[#05ADE8] to-[#6CCCC8] dark:to-[#6CCCC8] text-white p-8 flex flex-col items-center justify-center text-center">
          <img src={dark ? imgDark : img} alt="image" />

          <h3 className="text-3xl font-bold mb-4 dark:text-[#2E2E2E]">الأسئلة الأكثر شيوعاً</h3>

          <p className="text-lg leading-8 dark:text-[#2E2E2E]">
            اعرف أكثر عن منصة الطبي وخدمات ومميزات الرعاية الصحية عن بعد لفهم
            كيفية استخدام خدماتنا بكل سهولة ويسر.
          </p>
        </div>

        {/* FAQ */}
        <div className="md:col-span-2 space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className={`rounded-2xl border-2 border-cyan-500 overflow-hidden transition-all duration-300 ${
                openIndex === index
                  ? "bg-linear-to-r from-[#05ADE8] to-[#6CCCC8] text-white dark:text-[#2E2E2E]"
                  : "bg-(--bg-primary) text-[#05ADE8]"
              }`}
            >
              <button
                onClick={() => toggleItem(index)}
                className="w-full flex items-center justify-between p-6 text-right"
              >
                <span className="text-xl font-bold">
                  {index + 1}- {faq.question}
                </span>

                {openIndex === index ? (
                  <FiMinus size={28} />
                ) : (
                  <FiPlus size={28} />
                )}
              </button>

              <div
                className={`transition-all duration-300 overflow-hidden ${
                  openIndex === index
                    ? "max-h-40 opacity-100 pb-6 px-6"
                    : "max-h-0 opacity-0"
                }`}
              >
                <p className="text-lg">{faq.answer}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
