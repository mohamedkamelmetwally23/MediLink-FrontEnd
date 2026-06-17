import { useEffect, useState } from "react";
import { FaStar } from "react-icons/fa";
import { toast } from "react-toastify";
import { listDoctors } from "../services/medilinkApi";
import image1 from "../assets/landingPage/12 1.png";
import image2 from "../assets/landingPage/12 1 (1).png";
import image3 from "../assets/landingPage/12 1 (2).png";
import image4 from "../assets/landingPage/12 1 (3).png";
import image5 from "../assets/landingPage/12 1 (4).png";
import image6 from "../assets/landingPage/12 1 (5).png";

const doctorImages = [image1, image2, image3, image4, image5, image6];

function getDisplayName(doctor) {
  const fullName = [doctor.firstName, doctor.lastName].filter(Boolean).join(" ").trim();
  return fullName ? `د. ${fullName}` : "طبيب ميديلينك";
}

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
  const [doctors, setDoctors] = useState([]);

  useEffect(() => {
    let isMounted = true;
    const timer = window.setTimeout(async () => {
      try {
        const result = await listDoctors();
        if (isMounted) setDoctors(result);
      } catch {
        if (isMounted) toast.error("تعذر تحميل الأطباء من الخادم");
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }, 0);

    return () => {
      isMounted = false;
      window.clearTimeout(timer);
    };
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
      ) : doctors.length === 0 ? (
        <p className="text-center leading-7 text-[#6D6D6D] dark:text-[#D2D2D2]">
          لا يوجد أطباء متاحون حاليًا.
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {doctors.map((doctor, index) => (
            <button
              type="button"
              key={doctor.id || index}
              style={{ "--reveal-delay": `${index * 80}ms` }}
              onClick={() => toast.info(`سيتم فتح ملف ${getDisplayName(doctor)} قريبًا`)}
              className="reveal-item flex min-h-[250px] flex-col items-center rounded-xl bg-linear-to-b from-[#F0F0F0] to-[#FFFFFF] p-4 text-center shadow-md transition hover:-translate-y-1 hover:shadow-lg dark:from-[#3C3C4399] dark:to-[#3C3C434D]"
            >
              <img
                src={doctorImages[index % doctorImages.length]}
                alt={getDisplayName(doctor)}
                className="h-32 object-contain"
              />
              <p className="mt-3 font-semibold dark:text-[#D1D1D1]">{getDisplayName(doctor)}</p>
              <p className="min-h-9 text-xs leading-5 text-[#6D6D6D] dark:text-[#BDBDBD]">
                {doctor.specialty || "طبيب"}
              </p>

              <div className="mt-auto flex gap-1 text-yellow-400">
                {[1, 2, 3, 4, 5].map((star) => (
                  <FaStar key={star} />
                ))}
              </div>
            </button>
          ))}
        </div>
      )}
    </section>
  );
}
