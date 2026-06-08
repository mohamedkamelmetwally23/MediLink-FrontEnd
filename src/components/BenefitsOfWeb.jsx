import img1 from "../assets/landingPage/13(1).png";
import img2 from "../assets/landingPage/13 (2).png";
import img3 from "../assets/landingPage/13 (3).png";

const benefits = [
  {
    image: img3,
    title: "احجز موعدك",
    description: "احجز موعدك بسهولة مع الطبيب المناسب في الوقت المتاح لك.",
  },
  {
    image: img2,
    title: "اعرف التخصص المناسب",
    description: "اكتب أعراضك وسنساعدك في الوصول للتخصص الأقرب لاحتياجك.",
  },
  {
    image: img1,
    title: "ابحث عن طبيب",
    description: "تصفح أفضل الأطباء والمواعيد المتاحة المناسبة لك.",
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
            className="reveal-item flex h-full flex-col items-center rounded-xl bg-white px-5 py-6 text-center shadow-md dark:bg-[#252525] dark:shadow-[#3d3d3d]"
          >
            <img src={benefit.image} alt="" className="mb-4 h-28 object-contain" />
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
