import { FaStar } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { getDoctorImage, getDoctorName, getDoctorRating, useDoctors } from "../hooks/useDoctors";

function DoctorsSkeleton() {
  return (
    <div className="flex gap-6 overflow-hidden pb-5">
      {Array.from({ length: 6 }).map((_, index) => (
        <div key={index} className="min-h-[280px] w-[255px] shrink-0 rounded-xl bg-white p-4 shadow-md dark:bg-[#3B3B3B]">
          <div className="skeleton mx-auto h-40 w-full rounded-lg" />
          <div className="skeleton mx-auto mt-4 h-5 w-28 rounded-md" />
          <div className="skeleton mx-auto mt-2 h-4 w-36 rounded-md" />
          <div className="skeleton mx-auto mt-4 h-4 w-28 rounded-md" />
        </div>
      ))}
    </div>
  );
}

export default function Doctors() {
  const navigate = useNavigate();
  const { doctors, loading, error, reload } = useDoctors();

  const openDoctorProfile = (doctor) => {
    const role = localStorage.getItem("medilinkRole");
    const token =
      localStorage.getItem("medilinkToken") ||
      localStorage.getItem("token") ||
      localStorage.getItem("accessToken");
    const doctorPath = `/patient/doctors/${doctor.id}`;

    if (token && (role === "patient" || role === "user")) {
      navigate(doctorPath);
      return;
    }

    navigate("/login", {
      state: { returnTo: doctorPath },
    });
  };

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
      ) : doctors.length === 0 ? (
        <p className="text-center leading-7 text-[#6D6D6D] dark:text-[#D2D2D2]">لا يوجد أطباء متاحون حالياً.</p>
      ) : (
        <div
          className="flex snap-x snap-mandatory gap-6 overflow-x-auto pb-6 pt-2 [scrollbar-color:#64CAC6_transparent] [scrollbar-width:thin] [&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-[#64CAC6] [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-track]:bg-[#D8F4F3]/30"
          dir="rtl"
        >
          {doctors.map((doctor, index) => {
            const rating = getDoctorRating(doctor);

            return (
              <button
                type="button"
                key={doctor.id || index}
                style={{ "--reveal-delay": `${index * 80}ms` }}
                onClick={() => openDoctorProfile(doctor)}
                className="reveal-item flex min-h-[280px] w-[255px] shrink-0 snap-start flex-col items-center overflow-hidden rounded-xl bg-linear-to-b from-[#F0F0F0] to-[#FFFFFF] px-5 pb-5 pt-3 text-center shadow-md transition hover:-translate-y-1 hover:shadow-lg dark:from-[#494949] dark:to-[#383838]"
              >
                <img src={getDoctorImage(doctor, index)} alt={getDoctorName(doctor)} className="h-40 w-full object-contain object-bottom" />
                <p className="mt-2 text-lg font-bold dark:text-[#F0F0F0]">{getDoctorName(doctor)}</p>
                <p className="min-h-9 text-xs leading-5 text-[#6D6D6D] dark:text-[#BDBDBD]">{doctor.specialty || "طب عام"}</p>
                <div className="mt-auto flex items-center gap-3 text-sm text-[#555555] dark:text-[#E0E0E0]">
                  <span>{rating.toFixed(1)}</span>
                  <span className="flex gap-1.5 text-yellow-400">
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
