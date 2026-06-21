import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Clock3,
  RotateCcw,
} from "lucide-react";
import { FaStar } from "react-icons/fa";
import CustomSelect from "../../components/admin/CustomSelect";
import { getDoctorImage, getDoctorName, getDoctorRating, useDoctors } from "../../hooks/useDoctors";
import { listSpecializations } from "../../services/medilinkApi";
import { PatientHomeFooter, PatientHomeHeader } from "./PatientHomePage";

const pageSize = 12;
const gradient = "bg-linear-to-b from-[#05ADE8] to-[#6CCCC8]";
const days = ["السبت", "الأحد", "الإثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة"];

function formatTime(value) {
  if (!value) return "4:00 مساءً";

  const [hoursText, minutes = "00"] = String(value).split(":");
  const hours = Number(hoursText);
  if (!Number.isFinite(hours)) return value;

  const period = hours >= 12 ? "مساءً" : "صباحاً";
  const displayHour = hours % 12 || 12;
  return `${displayHour}:${minutes} ${period}`;
}

function DoctorSelect({ label, value, options, onChange, disabled = false }) {
  return (
    <div className="min-w-0">
      <label className="mb-2 block text-sm font-semibold text-[#555555] dark:text-[#E2E2E2]">{label}</label>
      <CustomSelect
        value={value}
        options={options}
        onChange={onChange}
        disabled={disabled}
        buttonClassName="flex h-12 w-full items-center gap-3 rounded-lg border-0 bg-[#F8F8F8] px-4 text-[#4A4A4A] outline-none transition hover:bg-[#F3F3F3] dark:bg-[#454545] dark:text-[#F0F0F0] dark:hover:bg-[#4D4D4D]"
        menuClassName="text-right"
      />
    </div>
  );
}

function RatingStars({ rating }) {
  return (
    <span
      className="flex gap-1"
      aria-label={`التقييم ${rating.toFixed(1)} من 5`}
    >
      {Array.from({ length: 5 }).map((_, starIndex) => {
        const fillPercentage = Math.max(
          0,
          Math.min(1, rating - starIndex),
        ) * 100;

        return (
          <span
            key={starIndex}
            className="relative block size-4 text-[#D7D7D7] dark:text-[#666666]"
            aria-hidden="true"
          >
            <FaStar className="absolute inset-0 size-4" />
            <span
              className="absolute inset-y-0 right-0 overflow-hidden text-[#F8B400]"
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

function DoctorCard({ doctor, index }) {
  const navigate = useNavigate();
  const doctorProfilePath = `/patient/doctors/${doctor.id}`;
  const available = doctor.available !== false && doctor.status !== "inactive";
  const rating = getDoctorRating(doctor);
  const price = doctor.consultationFee || doctor.raw?.consultationFee || doctor.raw?.price || 100;
  const firstDay = doctor.workDays?.[0] || days[new Date().getDay()] || "السبت";
  const firstTime = formatTime(doctor.workStart);

  return (
    <article className="relative flex min-h-[430px] flex-col overflow-hidden rounded-xl bg-white p-4 shadow-[0_4px_18px_rgba(0,0,0,0.12)] dark:bg-[#383838] dark:shadow-[0_10px_28px_rgba(0,0,0,0.28)]">
      <Link
        to={doctorProfilePath}
        state={{ doctor }}
        aria-label={`عرض صفحة ${getDoctorName(doctor)}`}
        className="relative flex h-[210px] items-end justify-center overflow-hidden rounded-lg bg-linear-to-b from-[#FAFAFA] to-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#05ADE8] dark:from-[#444444] dark:to-[#383838]"
      >
        <img
          src={getDoctorImage(doctor, index)}
          alt={getDoctorName(doctor)}
          className={`h-full w-full object-contain object-bottom transition-transform duration-200 hover:scale-[1.03] ${available ? "" : "grayscale"}`}
        />
        {!available && (
          <div className="absolute inset-0 grid place-items-center bg-black/35 text-xl font-semibold text-white">
            غير متاح حالياً
          </div>
        )}
      </Link>

      <div className="flex flex-1 flex-col text-center">
        <h2 className="mt-3 text-xl font-bold">
          <Link
            to={doctorProfilePath}
            state={{ doctor }}
            className="text-[#333333] transition-colors hover:text-[#05ADE8] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#05ADE8] dark:text-[#F0F0F0] dark:hover:text-[#35BCD5]"
          >
            {getDoctorName(doctor)}
          </Link>
        </h2>
        <p className="mt-1 min-h-6 text-sm text-[#8A8A8A] dark:text-[#C7C7C7]">{doctor.specialty || "طب عام"}</p>

        <div className="mt-2 flex items-center justify-center gap-2">
          <span className="text-sm font-semibold text-[#444444] dark:text-[#E5E5E5]">{rating.toFixed(1)}</span>
          <RatingStars rating={rating} />
        </div>

        <p className="mt-3 font-bold text-[#333333] dark:text-[#F0F0F0]">{price} جنيه</p>

        <div className={`mt-3 rounded-xl px-3 py-2.5 ${available ? "bg-[#ECF9F8] text-[#47716F] dark:bg-[#31504E] dark:text-[#D8F6F3]" : "bg-[#F1F1F1] text-[#AAAAAA] dark:bg-[#454545]"}`}>
          <p className="font-semibold">أول موعد متاح</p>
          <p className="mt-0.5 flex items-center justify-center gap-1 text-xs">
            <Clock3 size={14} />
            {firstDay} - {firstTime}
          </p>
        </div>

        <button
          type="button"
          disabled={!available}
          className={`mt-3 min-h-11 rounded-lg font-semibold text-white ${available ? gradient : "bg-[#BDBDBD]"} disabled:cursor-not-allowed`}
          onClick={() =>
            navigate(`/patient/doctors/${doctor.id}/book`, {
              state: { doctor },
            })
          }
        >
          احجز موعدك الآن
        </button>
      </div>
    </article>
  );
}

function DoctorCardsSkeleton() {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: 8 }).map((_, index) => (
        <div key={index} className="h-[430px] rounded-xl bg-white p-4 shadow-md dark:bg-[#383838]">
          <div className="skeleton h-[210px] rounded-lg" />
          <div className="skeleton mx-auto mt-4 h-6 w-32 rounded" />
          <div className="skeleton mx-auto mt-3 h-4 w-24 rounded" />
          <div className="skeleton mt-8 h-14 rounded-xl" />
          <div className="skeleton mt-3 h-11 rounded-lg" />
        </div>
      ))}
    </div>
  );
}

function Pagination({ currentPage, totalPages, visibleCount, totalCount, onChange }) {
  const firstVisiblePage = Math.max(1, Math.min(currentPage - 1, totalPages - 3));
  const pages = Array.from(
    { length: Math.min(4, totalPages) },
    (_, index) => firstVisiblePage + index,
  ).reverse();

  return (
    <section className="mt-10 border-b-[3px] border-[#05ADE8] pb-5 text-center">
      <p className="text-base font-semibold text-[#3F3F3F] dark:text-[#F0F0F0] sm:text-lg">
        عرض {visibleCount} من {totalCount} طبيب
      </p>

      <nav
        className="mt-5 flex items-center justify-center gap-3 text-sm font-semibold text-[#444444] dark:text-[#F0F0F0] sm:gap-5"
        aria-label="صفحات الأطباء"
        dir="ltr"
      >
        <button
          type="button"
          aria-label="الصفحة الأخيرة"
          disabled={currentPage === totalPages}
          onClick={() => onChange(totalPages)}
          className="grid size-8 place-items-center rounded-full transition hover:bg-[#05ADE8]/10 disabled:cursor-not-allowed disabled:opacity-30"
        >
          <ChevronsLeft size={17} strokeWidth={1.7} />
        </button>
        <button
          type="button"
          aria-label="الصفحة التالية"
          disabled={currentPage === totalPages}
          onClick={() => onChange(currentPage + 1)}
          className="grid size-8 place-items-center rounded-full transition hover:bg-[#05ADE8]/10 disabled:cursor-not-allowed disabled:opacity-30"
        >
          <ChevronLeft size={17} strokeWidth={1.7} />
        </button>

        {pages.map((page) => (
          <button
            key={page}
            type="button"
            aria-label={`الصفحة ${page}`}
            aria-current={page === currentPage ? "page" : undefined}
            className={`grid size-8 place-items-center rounded-full transition ${
              page === currentPage
                ? "bg-[#35BCD5] text-white shadow-[0_4px_10px_rgba(53,188,213,0.25)]"
                : "hover:bg-[#05ADE8]/10"
            }`}
            onClick={() => onChange(page)}
          >
            {page}
          </button>
        ))}

        <button
          type="button"
          aria-label="الصفحة السابقة"
          disabled={currentPage === 1}
          onClick={() => onChange(currentPage - 1)}
          className="grid size-8 place-items-center rounded-full transition hover:bg-[#05ADE8]/10 disabled:cursor-not-allowed disabled:opacity-30"
        >
          <ChevronRight size={17} strokeWidth={1.7} />
        </button>
        <button
          type="button"
          aria-label="الصفحة الأولى"
          disabled={currentPage === 1}
          onClick={() => onChange(1)}
          className="grid size-8 place-items-center rounded-full transition hover:bg-[#05ADE8]/10 disabled:cursor-not-allowed disabled:opacity-30"
        >
          <ChevronsRight size={17} strokeWidth={1.7} />
        </button>
      </nav>
    </section>
  );
}

export default function PatientDoctorsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { doctors, loading, error, reload } = useDoctors();
  const [specializations, setSpecializations] = useState([]);
  const [specializationsLoading, setSpecializationsLoading] = useState(true);
  const [specializationsError, setSpecializationsError] = useState("");
  const [filters, setFilters] = useState({
    specialty: searchParams.get("specialty") || "",
    experience: "",
    day: "",
    rating: "",
    gender: "",
  });
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    let mounted = true;

    listSpecializations()
      .then((result) => {
        if (!mounted) return;

        const uniqueSpecializations = Array.from(
          new Map(
            result
              .filter((specialization) => specialization.name)
              .map((specialization) => [specialization.name, specialization]),
          ).values(),
        );

        setSpecializations(uniqueSpecializations);
      })
      .catch((requestError) => {
        if (mounted) {
          setSpecializationsError(requestError.message || "تعذر تحميل التخصصات");
        }
      })
      .finally(() => {
        if (mounted) setSpecializationsLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const filteredDoctors = useMemo(
    () =>
      doctors.filter((doctor) => {
        const experience = Number(doctor.experienceYears || doctor.experience || 0);
        const rating = getDoctorRating(doctor);
        const isActive =
          doctor.active === true || doctor.status === "active";

        return (
          isActive &&
          (!filters.specialty || doctor.specialty === filters.specialty) &&
          (!filters.experience || experience >= Number(filters.experience)) &&
          (!filters.day || doctor.workDays?.includes(filters.day)) &&
          (!filters.rating || rating >= Number(filters.rating)) &&
          (!filters.gender || doctor.gender === filters.gender)
        );
      }),
    [doctors, filters],
  );

  const totalPages = Math.max(1, Math.ceil(filteredDoctors.length / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const pageDoctors = filteredDoctors.slice((safePage - 1) * pageSize, safePage * pageSize);

  const setFilter = (key, value) => {
    setFilters((current) => ({ ...current, [key]: value }));
    setCurrentPage(1);

    if (key === "specialty") {
      setSearchParams((currentParams) => {
        const nextParams = new URLSearchParams(currentParams);

        if (value) {
          nextParams.set("specialty", value);
        } else {
          nextParams.delete("specialty");
        }

        return nextParams;
      });
    }
  };

  return (
    <div className="min-h-screen bg-white text-[#333333] dark:bg-[#2E2E2E] dark:text-[#F0F0F0]" dir="rtl">
      <PatientHomeHeader />

      <main className="mx-auto w-full max-w-[1280px] px-4 pb-20 pt-14 sm:px-6 md:pt-16 lg:px-10">
        <header className="text-right">
          <h1 className="text-3xl font-bold sm:text-4xl">الأطباء والمواعيد</h1>
          <p className="mt-2 text-base text-[#777777] dark:text-[#C8C8C8] sm:text-lg">اختر الطبيب المناسب واحجز موعدك بسهولة</p>
        </header>

        <section className="mt-8 rounded-xl border border-[#E2E2E2] bg-white p-5 dark:border-[#555555] dark:bg-[#383838] sm:p-6">
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
            <DoctorSelect
              label="التخصص"
              value={filters.specialty}
              onChange={(value) => setFilter("specialty", value)}
              disabled={specializationsLoading}
              options={[
                {
                  value: "",
                  label: specializationsLoading ? "جاري تحميل التخصصات..." : "الكل",
                },
                ...specializations.map((specialization) => ({
                  value: specialization.name,
                  label: specialization.name,
                })),
              ]}
            />
            <DoctorSelect
              label="سنوات الخبرة"
              value={filters.experience}
              onChange={(value) => setFilter("experience", value)}
              options={[
                { value: "", label: "الكل" },
                { value: "3", label: "3 سنوات فأكثر" },
                { value: "5", label: "5 سنوات فأكثر" },
                { value: "10", label: "10 سنوات فأكثر" },
              ]}
            />
            <DoctorSelect
              label="اليوم المتاح"
              value={filters.day}
              onChange={(value) => setFilter("day", value)}
              options={[{ value: "", label: "الكل" }, ...days.map((day) => ({ value: day, label: day }))]}
            />
            <DoctorSelect
              label="التقييم"
              value={filters.rating}
              onChange={(value) => setFilter("rating", value)}
              options={[
                { value: "", label: "الكل" },
                { value: "4", label: "4 فأكثر" },
                { value: "4.5", label: "4.5 فأكثر" },
              ]}
            />
            <DoctorSelect
              label="الجنس"
              value={filters.gender}
              onChange={(value) => setFilter("gender", value)}
              options={[
                { value: "", label: "الكل" },
                { value: "male", label: "ذكر" },
                { value: "female", label: "أنثى" },
              ]}
            />
          </div>

          {specializationsError && (
            <p className="mt-3 text-sm font-medium text-red-600 dark:text-red-300">
              {specializationsError}
            </p>
          )}

          {Object.values(filters).some(Boolean) && (
            <button
              type="button"
              className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[#05ADE8]"
              onClick={() => {
                setFilters({ specialty: "", experience: "", day: "", rating: "", gender: "" });
                setCurrentPage(1);
                setSearchParams((currentParams) => {
                  const nextParams = new URLSearchParams(currentParams);
                  nextParams.delete("specialty");
                  return nextParams;
                });
              }}
            >
              <RotateCcw size={16} />
              مسح الفلاتر
            </button>
          )}
        </section>

        <section className="mt-10">
          {loading ? (
            <DoctorCardsSkeleton />
          ) : error ? (
            <div className="rounded-xl border border-red-200 bg-red-50 p-8 text-center dark:border-red-900 dark:bg-red-950/20">
              <p className="text-red-700 dark:text-red-300">{error}</p>
              <button type="button" onClick={reload} className="mt-4 rounded-lg bg-[#05ADE8] px-5 py-2.5 font-semibold text-white">إعادة المحاولة</button>
            </div>
          ) : pageDoctors.length === 0 ? (
            <div className="rounded-xl bg-[#F8F8F8] p-12 text-center text-[#777777] dark:bg-[#383838] dark:text-[#C8C8C8]">لا يوجد أطباء مطابقون للفلاتر الحالية.</div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {pageDoctors.map((doctor, index) => (
                <DoctorCard key={doctor.id || `${doctor.firstName}-${index}`} doctor={doctor} index={(safePage - 1) * pageSize + index} />
              ))}
            </div>
          )}

          {!loading && !error && filteredDoctors.length > 0 && (
            <Pagination
              currentPage={safePage}
              totalPages={totalPages}
              visibleCount={pageDoctors.length}
              totalCount={filteredDoctors.length}
              onChange={setCurrentPage}
            />
          )}
        </section>
      </main>

      <PatientHomeFooter />
    </div>
  );
}
