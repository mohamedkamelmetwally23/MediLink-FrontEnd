import img4 from "../assets/landingPage/4.png";
import img5 from "../assets/landingPage/5.png";
import img6 from "../assets/landingPage/6.png";
import img7 from "../assets/landingPage/7.png";

const stats = [
  { icon: img4, value: "+20", label: "تخصص طبي" },
  { icon: img5, value: "+30", label: "طبيب معتمد" },
  { icon: img6, value: "+1200", label: "مريض" },
  { icon: img7, value: "+1000", label: "حجز من خلال الموقع" },
];

export default function Hero2() {
  return (
    <section className="mx-auto max-w-7xl px-4 pb-10 sm:px-6 lg:px-8">
      <div className="grid gap-3 rounded-xl bg-linear-to-r from-[#05ADE8] to-[#6CCCC8] p-4 sm:grid-cols-2 lg:grid-cols-4 lg:p-8">
        {stats.map((stat, index) => (
          <div
            key={stat.label}
            className={`flex min-h-32 flex-col items-center justify-center text-center text-white ${
              index !== stats.length - 1 ? "lg:border-l lg:border-white/70" : ""
            }`}
          >
            <img src={stat.icon} alt="" className="mb-2 h-10 w-10 object-contain" />
            <p className="text-xl font-bold">{stat.value}</p>
            <p className="text-sm sm:text-base">{stat.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
