import { toast } from "react-toastify";
import img12 from "../assets/landingPage/lets-icons_tooth-light.png";
import img13 from "../assets/landingPage/healthicons_stomach-outline.png";
import img14 from "../assets/landingPage/hugeicons_kid.png";
import img15 from "../assets/landingPage/streamline-ultimate_hair-skin.png";
import img16 from "../assets/landingPage/healthicons_nose-outline.png";
import img17 from "../assets/landingPage/Vector.png";
import img18 from "../assets/landingPage/vaadin_eye.png";

const specialties = [
  { label: "الفم والأسنان", image: img12 },
  { label: "الباطنة", image: img13 },
  { label: "الأطفال", image: img14 },
  { label: "الجلدية والتجميل", image: img15 },
  { label: "أنف وأذن", image: img16 },
  { label: "المخ والأعصاب", image: img17 },
  { label: "العيون", image: img18 },
];

export default function Specialties() {
  return (
    <section id="specialties" className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <h2 className="mb-8 text-center text-3xl font-bold dark:text-[#F0F0F0] sm:text-4xl">
        التخصصات
      </h2>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-7">
        {specialties.map((item, index) => (
          <button
            key={item.label}
            type="button"
            style={{ "--reveal-delay": `${index * 70}ms` }}
            onClick={() => toast.info(`تم اختيار تخصص ${item.label}`)}
            className="reveal-item flex min-h-36 flex-col items-center justify-center rounded-xl bg-[var(--bg-primary)] p-4 text-center shadow-[0_4px_20px_rgba(0,0,0,0.1)] transition hover:-translate-y-1 hover:shadow-[0_10px_22px_rgba(0,0,0,0.1)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.2)] dark:hover:shadow-[0_10px_22px_rgba(0,0,0,0.1)]"
          >
            <img src={item.image} className="mb-3 h-[50px] w-[50px]" alt="" />
            <span className="text-sm font-semibold dark:text-[#F0F0F0]">{item.label}</span>
          </button>
        ))}
      </div>
    </section>
  );
}
