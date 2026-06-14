import img8 from "../assets/landingPage/8.png";
import img9 from "../assets/landingPage/9.png";
import img10 from "../assets/landingPage/10.png";
import img11 from "../assets/landingPage/11.png";
import rowDown from "../assets/landingPage/rowdown.png";
import rowUp from "../assets/landingPage/rowdup.png";

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
    image: img11,
    title: "تجربة آمنة ومريحة",
    description:
      "نحافظ على خصوصية بيانات المرضى ونوفر تجربة رقمية سلسة وآمنة على جميع الأجهزة.",
  },
  {
    image: img10,
    title: "مساعد مدعوم بالذكاء الاصطناعي",
    description:
      "يساعدك في الوصول إلى التخصص المناسب بسرعة من خلال اقتراحات مبنية على الأعراض والاحتياجات الطبية.",
  },
];

export default function Features() {
  return (
    <section id="features" className="features-section">
      <h2 className="features-section__title">
        لماذا <span>ميدلينك؟</span>
      </h2>

      <div className="features-section__path" aria-label="مميزات ميدلينك">
        <img className="features-section__line features-section__line--first" src={rowDown} alt="" />
        <img className="features-section__line features-section__line--second" src={rowUp} alt="" />
        <img className="features-section__line features-section__line--third" src={rowDown} alt="" />

        {features.map((feature, index) => (
          <article
            key={feature.title}
            style={{ "--reveal-delay": `${index * 90}ms` }}
            className={`features-section__item features-section__item--${index + 1} reveal-item`}
          >
            <img className="features-section__icon" src={feature.image} alt="" />
            <h3>{feature.title}</h3>
            <p>{feature.description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
