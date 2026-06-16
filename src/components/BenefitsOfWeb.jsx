import img1 from "../assets/landingPage/13(1).png";
import img2 from "../assets/landingPage/13 (2).png";
import img3 from "../assets/landingPage/13 (3).png";

const benefits = [
  {
    image: img1,
    title: "ابحث عن طبيب",
    description: "تصفح أفضل الأطباء والمواعيد المتاحة المناسبة لك.",
  },
  {
    image: img2,
    title: "اعرف التخصص المناسب",
    description: "اكتب أعراضك وسنساعدك في الوصول للتخصص الأقرب لاحتياجك.",
  },
  {
    image: img3,
    title: "احجز موعدك",
    description: "احجز موعدك بسهولة مع الطبيب المناسب في الوقت المتاح لك.",
  },
];

export default function BenefitsOfWeb() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <h2 className="mb-8 text-center text-3xl font-bold dark:text-[#D2D2D2]">
        ماذا يمكنك أن تسأل؟
      </h2>

      <div className="grid gap-5 md:grid-cols-3">
        {benefits.map((benefit, index) => (
          <article
            key={benefit.title}
            style={{ "--reveal-delay": `${index * 100}ms` }}
            className="reveal-item flex h-full flex-col items-center rounded-xl bg-[var(--bg-primary)] px-5 py-6 text-center shadow-[0_4px_20px_rgba(0,0,0,0.1)] transition hover:-translate-y-1 hover:shadow-[0_10px_22px_rgba(0,0,0,0.1)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.2)] dark:hover:shadow-[0_10px_22px_rgba(0,0,0,0.1)]"
          >
            <img
              src={benefit.image}
              alt=""
              className="mb-4 h-20 w-20 object-contain"
            />
            <h3 className="mb-2 text-xl font-bold">{benefit.title}</h3>
            <p className="leading-7 text-[#636363] dark:text-[#D2D2D2]">
              {benefit.description}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
