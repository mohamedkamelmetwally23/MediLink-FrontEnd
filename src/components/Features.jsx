import img8 from "../assets/landingPage/8.png";
import img9 from "../assets/landingPage/9.png";
import img10 from "../assets/landingPage/10.png";
import img11 from "../assets/landingPage/11.png";

const features = [
  {
    image: img8,
    title: "أطباء متخصصون",
    description:
      "فريق من الأطباء والاستشاريين في مختلف التخصصات الطبية لتقديم رعاية صحية موثوقة.",
  },
  {
    image: img9,
    title: "حجز مواعيد بسهولة",
    description:
      "احجز موعدك في دقائق قليلة من خلال منصة سهلة الاستخدام دون الحاجة إلى الاتصالات الهاتفية.",
  },
  {
    image: img10,
    title: "مساعد مدعوم بالذكاء الاصطناعي",
    description:
      "يساعدك في الوصول إلى التخصص المناسب بسرعة من خلال اقتراحات مبنية على الأعراض والاحتياجات الطبية.",
  },
  {
    image: img11,
    title: "تجربة آمنة ومريحة",
    description:
      "نحافظ على خصوصية بيانات المرضى ونوفر تجربة رقمية سلسة وآمنة على جميع الأجهزة.",
  },
];

export default function Features() {
  return (
    <section id="features" className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <h2 className="mb-10 text-center text-3xl font-bold sm:text-4xl">
        لماذا <span className="text-[#05ADE8]">ميدلينك؟</span>
      </h2>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {features.map((feature) => (
          <article
            key={feature.title}
            className="flex h-full flex-col items-center rounded-xl bg-white p-5 text-center shadow-sm dark:bg-[#252525]"
          >
            <img src={feature.image} alt="" className="mb-4 h-20 w-20 object-contain" />
            <h3 className="mb-2 text-lg font-bold text-gray-900 dark:text-[#F0F0F0]">
              {feature.title}
            </h3>
            <p className="text-sm leading-7 text-[#636363] dark:text-[#D2D2D2]">
              {feature.description}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
