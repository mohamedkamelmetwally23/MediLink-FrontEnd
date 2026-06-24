import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { CalendarCheck2, CircleDollarSign, Stethoscope, UsersRound } from "lucide-react";
import { FaStar } from "react-icons/fa";
import ProfileAvatar from "../../components/ProfileAvatar";
import { getDoctor } from "../../services/medilinkApi";
import { getDoctorImage, getDoctorName, getDoctorRating } from "../../hooks/useDoctors";
import { PatientHomeFooter, PatientHomeHeader } from "./PatientHomePage";

const gradient = "bg-linear-to-b from-[#05ADE8] to-[#6CCCC8]";

function RatingStars({ rating }) {
  return (
    <span className="flex gap-1" aria-label={`التقييم ${rating.toFixed(1)} من 5`}>
      {Array.from({ length: 5 }).map((_, index) => {
        const fillPercentage = Math.max(0, Math.min(1, rating - index)) * 100;

        return (
          <span
            key={index}
            className="relative block size-4 text-[#D7D7D7] dark:text-[#666666]"
            aria-hidden="true"
          >
            <FaStar className="absolute inset-0 size-4" />
            <span
              className="absolute inset-y-0 right-0 overflow-hidden text-[#FFB800]"
              style={{ width: `${fillPercentage}%` }}
            >
              <FaStar className="absolute right-0 top-0 size-4 max-w-none" />
            </span>
          </span>
        );
      })}
    </span>
  );
}

function formatTime(value) {
  if (!value) return "غير محدد";
  const [hoursText, minutes = "00"] = String(value).split(":");
  const hours = Number(hoursText);
  if (!Number.isFinite(hours)) return value;
  return `${hours % 12 || 12}:${minutes} ${hours >= 12 ? "مساءً" : "صباحًا"}`;
}

function DoctorProfileSkeleton() {
  return (
    <main className="mx-auto w-full max-w-[1280px] space-y-8 px-4 py-12 sm:px-6 lg:px-10">
      <div className="skeleton h-[420px] rounded-3xl" />
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="skeleton h-36 rounded-2xl" />
        ))}
      </div>
      <div className="skeleton h-[430px] rounded-2xl" />
    </main>
  );
}

export default function PatientDoctorProfilePage() {
  const { doctorId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const showPatientHeader = hasPatientSession();
  const initialDoctor = location.state?.doctor || null;
  const [doctor, setDoctor] = useState(initialDoctor);
  const [loading, setLoading] = useState(!initialDoctor);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;
    setLoading(!initialDoctor);
    setError("");

    getDoctor(doctorId)
      .then((result) => {
        if (mounted) setDoctor(result);
      })
      .catch((requestError) => {
        if (mounted && initialDoctor) return;
        if (mounted) setError(requestError.message || "تعذر تحميل بيانات الطبيب");
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [doctorId, initialDoctor]);

  return (
    <div className="min-h-screen bg-white text-[#333333] dark:bg-[#2E2E2E] dark:text-[#F0F0F0]" dir="rtl">
      {showPatientHeader && <PatientHomeHeader />}
      {loading ? (
        <DoctorProfileSkeleton />
      ) : error || !doctor ? (
        <main className="mx-auto min-h-[55vh] w-full max-w-[1280px] px-4 py-20 text-center">
          <p className="text-lg text-red-600 dark:text-red-300">{error || "الطبيب غير موجود"}</p>
          <button type="button" onClick={() => navigate("/patient/doctors")} className={`mt-6 rounded-xl px-8 py-3 font-bold text-white ${gradient}`}>
            العودة إلى الأطباء
          </button>
        </main>
      ) : (
        <DoctorProfile doctor={doctor} canBook={showPatientHeader} onBook={() => navigate(`/patient/doctors/${doctor.id}/book`, { state: { doctor } })} />
      )}
      <PatientHomeFooter />
    </div>
  );
}

function hasPatientSession() {
  const token =
    localStorage.getItem("medilinkToken") ||
    localStorage.getItem("token") ||
    localStorage.getItem("accessToken");
  const role = localStorage.getItem("medilinkRole");

  return Boolean(token && (role === "patient" || role === "user"));
}

function DoctorProfile({ doctor, canBook, onBook }) {
  const rating = getDoctorRating(doctor);
  const price = doctor.consultationFee || doctor.raw?.price || 100;
  const stats = [
    { icon: CircleDollarSign, value: `${price} جنيه`, label: "سعر الكشف" },
    { icon: Stethoscope, value: doctor.experienceYears || 0, label: "سنوات الخبرة" },
    { icon: CalendarCheck2, value: doctor.appointmentsCount || 0, label: "إجمالي الحجوزات" },
    { icon: UsersRound, value: doctor.raw?.patientsCount || doctor.raw?.caseCount || 0, label: "عدد المرضى" },
  ];
  const workingDays = doctor.workDays?.length
    ? doctor.workDays
    : ["السبت", "الأحد", "الإثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة"];

  return (
    <main className="mx-auto w-full max-w-[1280px] px-4 py-10 sm:px-6 md:py-14 lg:px-10">
      <section className="grid overflow-hidden rounded-3xl bg-[#EFFBFA] px-5 pt-7 dark:bg-[#354746] sm:px-8 md:grid-cols-[1fr_.9fr] md:items-stretch md:px-12 md:pt-0 lg:min-h-[430px]">
        <div className="order-2 pb-9 text-center md:order-1 md:py-12">
          <h1 className="text-3xl font-extrabold sm:text-4xl lg:text-5xl">{getDoctorName(doctor)}</h1>
          <p className="mt-3 text-xl text-[#8A8A8A] dark:text-[#C8D5D4] sm:text-2xl">{doctor.specialty || "طب عام"}</p>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
            <span className="font-bold">{rating.toFixed(1)} ({doctor.reviewsCount || 0} تقييم)</span>
            <RatingStars rating={rating} />
          </div>

          <div className="mx-auto mt-8 grid max-w-xl grid-cols-1 gap-4 text-sm text-[#476967] sm:grid-cols-3 dark:text-[#D9F1EF]">
            <p>أول موعد متاح<br /><strong>{workingDays[0]}، {formatTime(doctor.workStart)}</strong></p>
            <p className="border-y border-[#B7CCCA] py-4 sm:border-x sm:border-y-0 sm:py-0">طبيب ذو خبرة<br /><strong>{doctor.experienceYears || 0} سنوات</strong></p>
            <p>متاح للحجز<br /><strong>هذا الأسبوع</strong></p>
          </div>

          {canBook && (
          <button type="button" onClick={onBook} className={`mt-8 w-full max-w-xl rounded-xl py-3.5 text-lg font-bold text-white shadow-lg ${gradient}`}>
            احجز موعدك الآن
          </button>
          )}
        </div>

        <div className="relative order-1 mx-auto flex h-[300px] w-full max-w-[430px] items-stretch justify-center py-4 md:order-2 md:h-full md:min-h-[430px] md:py-5">
          <span className="absolute right-[10%] top-[20%] size-32 rounded-full bg-[#20B7D8] sm:size-44" />
          <span className="absolute left-[10%] top-[20%] size-12 rounded-full bg-[#2364AA]" />
          <span className="absolute bottom-[8%] left-[7%] size-24 rounded-full bg-[#74D2DF]" />
          <ProfileAvatar
            src={getDoctorImage(doctor)}
            alt={getDoctorName(doctor)}
            className="relative z-10 h-full w-full rounded-2xl object-cover object-center"
          />
        </div>
      </section>

      <section className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map(({ icon: Icon, value, label }) => (
          <article key={label} className="flex min-h-32 items-center justify-center gap-5 rounded-2xl bg-white p-5 shadow-[0_5px_22px_rgba(0,0,0,.1)] dark:bg-[#383838]">
            <span className="grid size-14 place-items-center rounded-xl bg-[#EFFBFA] text-[#20B7D8] dark:bg-[#2E5552]"><Icon size={29} /></span>
            <div><strong className="text-xl">{value}</strong><p className="mt-1 text-sm text-[#666] dark:text-[#CCC]">{label}</p></div>
          </article>
        ))}
      </section>

      <section className="mt-12 overflow-hidden rounded-2xl border border-[#E7EEEE] dark:border-[#4D5D5B]">
        <div className="grid grid-cols-3 bg-[#EFFBFA] px-4 py-5 font-bold dark:bg-[#354746]">
          <span>أيام العمل</span><span className="text-center">من</span><span className="text-left">إلى</span>
        </div>
        {workingDays.map((day) => (
          <div key={day} className="grid grid-cols-3 border-t border-[#E7EEEE] px-4 py-5 dark:border-[#4D4D4D]">
            <span className="font-semibold">{day}</span>
            <span className="text-center">{formatTime(doctor.workStart)}</span>
            <span className="text-left">{formatTime(doctor.workEnd)}</span>
          </div>
        ))}
      </section>
    </main>
  );
}
