import { FaStar } from "react-icons/fa";
import { toast } from "react-toastify";
import { getDoctorImage, getDoctorName, getDoctorRating, useDoctors } from "../hooks/useDoctors";

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
  const { doctors, loading, error, reload } = useDoctors();
  const visibleDoctors = doctors.slice(0, 6);

  return (
    <section id="doctors" className="mx-auto max-w-7xl scroll-mt-24 px-4 py-12 sm:px-6 lg:px-8">
      <h2 className="mb-3 text-center text-3xl font-bold dark:text-[#F0F0F0] sm:text-4xl">الأطباء</h2>
      <p className="mx-auto mb-8 max-w-2xl text-center leading-7 text-[#6D6D6D] dark:text-[#D2D2D2]">
        فريق من أفضل الأطباء المتخصصين لخدمتك في مختلف التخصصات.
      </p>

      {loading ? (
        <DoctorsSkeleton />
      ) : error ? (
        <div className="text-center">
          <p className="leading-7 text-[#6D6D6D] dark:text-[#D2D2D2]">{error}</p>
          <button type="button" onClick={reload} className="mt-4 rounded-lg bg-[#05ADE8] px-5 py-2.5 font-semibold text-white">
            إعادة المحاولة
          </button>
        </div>
      ) : visibleDoctors.length === 0 ? (
        <p className="text-center leading-7 text-[#6D6D6D] dark:text-[#D2D2D2]">لا يوجد أطباء متاحون حالياً.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {visibleDoctors.map((doctor, index) => {
            const rating = getDoctorRating(doctor);

            return (
              <button
                type="button"
                key={doctor.id || index}
                style={{ "--reveal-delay": `${index * 80}ms` }}
                onClick={() => toast.info(`سيتم فتح ملف ${getDoctorName(doctor)} قريباً`)}
                className="reveal-item flex min-h-[250px] flex-col items-center rounded-xl bg-linear-to-b from-[#F0F0F0] to-[#FFFFFF] p-4 text-center shadow-md transition hover:-translate-y-1 hover:shadow-lg dark:from-[#3C3C4399] dark:to-[#3C3C434D]"
              >
                <img src={getDoctorImage(doctor, index)} alt={getDoctorName(doctor)} className="h-32 object-contain" />
                <p className="mt-3 font-semibold dark:text-[#D1D1D1]">{getDoctorName(doctor)}</p>
                <p className="min-h-9 text-xs leading-5 text-[#6D6D6D] dark:text-[#BDBDBD]">{doctor.specialty || "طب عام"}</p>
                <div className="mt-auto flex items-center gap-2 text-xs text-[#555555] dark:text-[#E0E0E0]">
                  <span>{rating.toFixed(1)}</span>
                  <span className="flex gap-1 text-yellow-400">
                    {Array.from({ length: 5 }).map((_, starIndex) => (
                      <FaStar key={starIndex} className={starIndex < Math.round(rating) ? "" : "opacity-25"} />
                    ))}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </section>
  );
}
