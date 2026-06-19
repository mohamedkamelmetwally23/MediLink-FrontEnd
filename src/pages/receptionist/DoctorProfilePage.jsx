import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Bell, CalendarCheck, ChevronRight, Star, Stethoscope } from "lucide-react";
import doctorAvatar from "../../assets/landingPage/doctor1.png";
import { listDoctors } from "../../services/medilinkApi";

const fallbackDoctor = {
  id: "demo-doctor-profile",
  firstName: "أماني",
  lastName: "سلامة",
  specialty: "أمراض القلب",
  status: "active",
  phone: "01033333333",
  gender: "female",
  birthDate: "2001-01-01",
  consultationFee: 500,
  appointmentsCount: 543,
  experienceYears: 6,
  workDays: ["السبت", "الأحد", "الإثنين", "الثلاثاء"],
  workStart: "08:00",
  workEnd: "16:00",
  image: doctorAvatar,
};

function getDoctorName(doctor) {
  return (
    [doctor?.firstName, doctor?.lastName].filter(Boolean).join(" ").trim() ||
    doctor?.name ||
    "طبيب"
  );
}

function formatTime(value) {
  if (!value) return "";
  const [hourText = "0", minute = "00"] = String(value).split(":");
  const hour24 = Number(hourText);
  if (!Number.isFinite(hour24)) return value;
  const hour12 = hour24 % 12 || 12;
  const period = hour24 >= 12 ? "مساءا" : "صباحا";
  return `${hour12}:${minute} ${period}`;
}

function formatDate(value) {
  if (!value) return "غير متوفر";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);

  return date.toLocaleDateString("ar-EG", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function getDoctorStatus(doctor) {
  return doctor?.status === "inactive" ? "غير مفعل" : "مفعل";
}

function isPermissionError(error) {
  const message = String(error?.message || error || "").toLowerCase();

  return (
    error?.status === 403 ||
    message.includes("permission") ||
    message.includes("not have") ||
    message.includes("not authorized")
  );
}

export default function ReceptionistDoctorProfilePage() {
  const { doctorId } = useParams();
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    listDoctors()
      .then((items) => {
        if (mounted) setDoctors(items);
      })
      .catch((error) => {
        if (mounted && isPermissionError(error)) setDoctors([]);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const doctor = useMemo(
    () =>
      doctors.find(
        (item) =>
          String(item.id) === String(doctorId) ||
          String(item.profileId) === String(doctorId) ||
          String(item.userId) === String(doctorId),
      ) || fallbackDoctor,
    [doctorId, doctors],
  );

  const infoRows = [
    ["تاريخ الميلاد", formatDate(doctor.birthDate)],
    ["الجنس", doctor.gender === "female" ? "أنثى" : "ذكر"],
    ["رقم الهاتف", doctor.phone || "01033333333"],
    ["سنوات الخبرة", `${doctor.experienceYears || 8} سنوات`],
    ["أيام العمل", (doctor.workDays || []).join("، ") || "السبت، الأحد، الإثنين، الأربعاء"],
    [
      "ساعات العمل",
      `${formatTime(doctor.workStart || "08:00")} - ${formatTime(
        doctor.workEnd || "16:00",
      )}`,
    ],
    ["تاريخ التسجيل", formatDate(doctor.registrationDate || "2026-06-19")],
  ];

  const activityItems = [
    "تم حجز موعد جديد",
    "تم حجز موعد جديد",
    "تم إلغاء موعد",
    "تم تحديث البيانات",
  ];

  return (
    <section className="min-h-screen bg-[#f8fcfd] text-[#333] dark:bg-[#2f2f2f] dark:text-white">
      <header className="flex min-h-[92px] items-start justify-start bg-white px-4 pt-[28px] shadow-[0_1px_8px_rgba(0,0,0,0.03)] dark:bg-[#3a3a3a] sm:px-6 lg:px-[32px]">
        <div className="text-right">
          <h1 className="text-[21px] font-extrabold leading-[28px] text-[#333] dark:text-white">
            ملف المستخدم
          </h1>
          <p className="mt-1 text-[12px] leading-5 text-[#9a9a9a] dark:text-gray-300">
            المستخدمون / ملف المستخدم
          </p>
        </div>
      </header>

      <main className="px-4 pb-8 pt-[18px] sm:px-6 lg:px-[38px]">
        <div className="mb-[24px] flex justify-end">
          <Link
            to="/receptionist/doctors"
            className="inline-flex items-center gap-2 text-[12px] font-bold text-[#23b9d5]"
          >
            <ChevronRight size={15} strokeWidth={2} />
            <span>رجوع</span>
          </Link>
        </div>

        <div
          className="grid gap-4 xl:grid-cols-[320px_minmax(0,1fr)]"
          dir="ltr"
        >
          <section
            className="rounded-[8px] bg-white px-4 py-5 shadow-[0_5px_18px_rgba(37,70,82,0.08)] dark:bg-[#505050]"
            dir="rtl"
          >
            <h2 className="mb-4 text-right text-[16px] font-bold text-[#333] dark:text-white">
              معلومات المريض
            </h2>
            <div className="divide-y divide-[#edf1f3] dark:divide-white/10">
              {infoRows.map(([label, value]) => (
                <div
                  key={label}
                  className="grid min-h-[39px] grid-cols-[1fr_1fr] items-center text-[11px]"
                >
                  <span className="text-right font-bold text-[#777] dark:text-gray-300">
                    {label}
                  </span>
                  <span className="text-center text-[#777] dark:text-gray-300">
                    {value}
                  </span>
                </div>
              ))}
            </div>
          </section>

          <section className="space-y-4" dir="rtl">
            <article className="rounded-[8px] bg-white px-5 py-6 text-center shadow-[0_5px_18px_rgba(37,70,82,0.08)] dark:bg-[#505050]">
              <img
                src={doctor.image || doctorAvatar}
                alt={getDoctorName(doctor)}
                className="mx-auto h-[132px] w-[132px] rounded-full object-cover object-top ring-[5px] ring-[#f1f1f1] dark:ring-white/10"
              />
              <h2 className="mt-4 text-[18px] font-extrabold text-[#333] dark:text-white">
                {getDoctorName(doctor)}
              </h2>
              <div className="mt-2 flex items-center justify-center gap-2 text-[12px]">
                <span className="rounded-[5px] bg-[#e8fff4] px-2 py-1 text-[10px] font-bold text-[#129a55]">
                  {getDoctorStatus(doctor)}
                </span>
                <span className="font-bold text-[#8a98a0] dark:text-gray-300">
                  طبيب
                </span>
              </div>
            </article>

            <div className="grid gap-3 sm:grid-cols-3">
              <MiniStat
                icon={Stethoscope}
                label="التخصص"
                value={doctor.specialty || "غير محدد"}
              />
              <MiniStat
                icon={CalendarCheck}
                label="إجمالي الحجوزات"
                value={doctor.appointmentsCount || 0}
              />
              <MiniStat
                icon={Star}
                label="التقييم"
                value={doctor.rating || "4.8"}
              />
            </div>
          </section>
        </div>

        <section className="mt-4 rounded-[8px] bg-white px-4 py-5 shadow-[0_5px_18px_rgba(37,70,82,0.08)] dark:bg-[#505050]">
          <h2 className="mb-4 text-right text-[14px] font-bold text-[#333] dark:text-white">
            النشاط الأخير
          </h2>
          <div className="divide-y divide-[#edf1f3] dark:divide-white/10">
            {activityItems.map((activity, index) => (
              <div
                key={`${activity}-${index}`}
                className="flex min-h-[42px] items-center justify-between gap-3 text-[12px]"
              >
                <span className="text-[#8a98a0] dark:text-gray-300">
                  منذ 10 دقائق
                </span>
                <span className="flex items-center gap-3 font-bold text-[#555] dark:text-white">
                  {activity}
                  <span className="grid h-7 w-7 place-items-center rounded-full bg-[#e8fbff] text-[#23b9d5] dark:bg-white/10">
                    <Bell size={14} strokeWidth={1.8} />
                  </span>
                </span>
              </div>
            ))}
          </div>
        </section>

        {loading && (
          <p className="mt-4 text-center text-[12px] text-[#8a98a0]">
            جاري تحديث بيانات الطبيب...
          </p>
        )}
      </main>
    </section>
  );
}

function MiniStat({ icon: Icon, label, value }) {
  return (
    <article className="min-h-[96px] rounded-[8px] bg-white p-4 text-center shadow-[0_5px_18px_rgba(37,70,82,0.08)] dark:bg-[#505050]">
      <Icon className="mx-auto text-[#24b9d6]" size={19} strokeWidth={1.8} />
      <p className="mt-2 text-[11px] font-bold text-[#24b9d6]">
        {label}
      </p>
      <strong className="mt-2 block text-[14px] font-bold text-[#24b9d6]">
        {value}
      </strong>
    </article>
  );
}
