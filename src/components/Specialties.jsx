import { Link } from "react-router-dom";
import { useSpecializations } from "../hooks/useSpecializations";

export default function Specialties() {
  const { specialties } = useSpecializations();

  return (
    <section id="specialties" className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <h2 className="mb-8 text-center text-3xl font-bold dark:text-[#F0F0F0] sm:text-4xl">
        التخصصات
      </h2>

      <div className="flex snap-x gap-4 overflow-x-auto pb-5 [scrollbar-color:#60C8CB_transparent] [scrollbar-width:thin]">
        {specialties.map((item, index) => (
          <Link
            key={item.id || item.name}
            to={`/patient/doctors?specialty=${encodeURIComponent(item.name)}`}
            style={{ "--reveal-delay": `${index * 70}ms` }}
            className="reveal-item flex min-h-36 min-w-[180px] snap-start flex-col items-center justify-center rounded-xl bg-[var(--bg-primary)] p-4 text-center shadow-[0_4px_20px_rgba(0,0,0,0.1)] transition hover:-translate-y-1 hover:shadow-[0_10px_22px_rgba(0,0,0,0.1)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.2)] dark:hover:shadow-[0_10px_22px_rgba(0,0,0,0.1)] sm:min-w-[190px]"
          >
            <img src={item.image} className="mb-3 h-[50px] w-[50px]" alt="" />
            <span className="text-sm font-semibold dark:text-[#F0F0F0]">{item.name}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
