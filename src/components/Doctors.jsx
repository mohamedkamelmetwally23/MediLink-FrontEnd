import { useEffect, useState } from "react";
import { FaRegStar, FaStar, FaStarHalfAlt } from "react-icons/fa";
import { toast } from "react-toastify";
import image1 from "../assets/landingPage/12 1.png";
import image2 from "../assets/landingPage/12 1 (1).png";
import image3 from "../assets/landingPage/12 1 (2).png";
import image4 from "../assets/landingPage/12 1 (3).png";
import image5 from "../assets/landingPage/12 1 (4).png";
import image6 from "../assets/landingPage/12 1 (5).png";

const doctors = [
  { id: 1, name: "د. ندى حسين", image: image1, specialty: "أخصائية جلدية", rating: 5 },
  { id: 2, name: "د. عادل محمد", image: image2, specialty: "استشاري أمراض باطنة", rating: 5 },
  { id: 3, name: "د. عبد الله محمود", image: image3, specialty: "أخصائي جراحة عظام", rating: 3 },
  { id: 4, name: "د. سامح شوقي", image: image4, specialty: "استشاري أطفال", rating: 5 },
  { id: 5, name: "د. سارة أحمد", image: image5, specialty: "أخصائية تغذية", rating: 4 },
  { id: 6, name: "د. علي عبد الرحمن", image: image6, specialty: "استشاري أسنان", rating: 4.7 },
];

function DoctorsSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      {Array.from({ length: 6 }).map((_, index) => (
        <div key={index} className="rounded-xl bg-white p-4 shadow-md dark:bg-[#252525]">
          <div className="skeleton mx-auto h-28 w-28 rounded-full" />
          <div className="skeleton mx-auto mt-4 h-5 w-24 rounded-md" />
          <div className="skeleton mx-auto mt-2 h-4 w-32 rounded-md" />
          <div className="skeleton mx-auto mt-3 h-4 w-24 rounded-md" />
        </div>
      ))}
    </div>
  );
}

export default function Doctors() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = window.setTimeout(() => setIsLoading(false), 550);

    return () => window.clearTimeout(timer);
  }, []);

  return (
    <section id="doctors" className="mx-auto max-w-7xl scroll-mt-24 px-4 py-12 sm:px-6 lg:px-8">
      <h2 className="mb-3 text-center text-3xl font-bold dark:text-[#F0F0F0] sm:text-4xl">
        الأطباء
      </h2>
      <p className="mx-auto mb-8 max-w-2xl text-center leading-7 text-[#6D6D6D] dark:text-[#D2D2D2]">
        فريق من أفضل الأطباء المتخصصين لخدمتك في مختلف التخصصات.
      </p>

      {isLoading ? (
        <DoctorsSkeleton />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {doctors.map((doctor, index) => (
            <button
              type="button"
              key={doctor.id}
              style={{ "--reveal-delay": `${index * 80}ms` }}
              onClick={() => toast.info(`سيتم فتح ملف ${doctor.name} قريبًا`)}
              className="reveal-item flex min-h-[250px] flex-col items-center rounded-xl bg-linear-to-b from-[#F0F0F0] to-[#FFFFFF] p-4 text-center shadow-md transition hover:-translate-y-1 hover:shadow-lg dark:from-[#3C3C4399] dark:to-[#3C3C434D]"
            >
              <img src={doctor.image} alt={doctor.name} className="h-32 object-contain" />
              <p className="mt-3 font-semibold dark:text-[#D1D1D1]">{doctor.name}</p>
              <p className="min-h-9 text-xs leading-5 text-[#6D6D6D] dark:text-[#BDBDBD]">
                {doctor.specialty}
              </p>

              <div className="mt-auto flex gap-1 text-yellow-400">
                {[1, 2, 3, 4, 5].map((star) => {
                  if (doctor.rating >= star) return <FaStar key={star} />;
                  if (doctor.rating >= star - 0.5) {
                    return <FaStarHalfAlt className="scale-x-[-1]" key={star} />;
                  }
                  return <FaRegStar key={star} />;
                })}
              </div>
            </button>
          ))}
        </div>
      )}
    </section>
  );
}
