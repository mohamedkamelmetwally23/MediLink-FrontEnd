import { useEffect, useMemo, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { CalendarCheck, ChevronRight, ClipboardList, UserRound } from "lucide-react";
import patientAvatar from "../../assets/landingPage/admin.png";
import ActivityList from "../../components/admin/ActivityList";
import {
  getUserAppointmentsCount,
  listPatientActivities,
  listPatientsForReceptionist,
} from "../../services/medilinkApi";

const fallbackPatient = {
  id: "demo-patient-profile",
  firstName: "خالد",
  lastName: "طارق",
  name: "خالد طارق",
  phone: "01275552006",
  gender: "male",
  birthDate: "2001-01-01",
  registrationDate: "2026-06-19",
  status: "active",
  casesCount: 7,
  appointmentsCount: 7,
  completedAppointmentsCount: 3,
  cancelledAppointmentsCount: 2,
};

function getPatientName(patient) {
  return (
    patient?.name ||
    [patient?.firstName, patient?.lastName].filter(Boolean).join(" ").trim() ||
    "مريض"
  );
}

function getPatientImage(patient) {
  const raw = patient?.raw || {};
  const user = raw.user || raw.account || raw;

  return (
    patient?.image ||
    patient?.profileImage ||
    raw.image ||
    raw.profileImage ||
    user.image ||
    user.profileImage ||
    patientAvatar
  );
}

function getAge(value) {
  if (!value) return "غير متوفر";

  const birthDate = new Date(value);
  if (Number.isNaN(birthDate.getTime())) return "غير متوفر";

  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birthDate.getDate())
  ) {
    age -= 1;
  }

  return `${age}`;
}

function formatGender(value) {
  if (value === "female") return "أنثى";
  if (value === "male") return "ذكر";
  return "غير متوفر";
}

function formatDate(value) {
  if (!value) return "غير متوفر";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);

  return date.toISOString().slice(0, 10);
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

export default function ReceptionistPatientProfilePage() {
  const { patientId } = useParams();
  const [searchParams] = useSearchParams();
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [appointmentCounts, setAppointmentCounts] = useState(null);
  const [activities, setActivities] = useState([]);
  const [activitiesLoading, setActivitiesLoading] = useState(true);
  const [activitiesError, setActivitiesError] = useState("");

  useEffect(() => {
    let mounted = true;

    listPatientsForReceptionist()
      .then((items) => {
        if (mounted) setPatients(items);
      })
      .catch((error) => {
        if (mounted && isPermissionError(error)) setPatients([]);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const patient = useMemo(
    () =>
      patients.find(
        (item) =>
          String(item.id) === String(patientId) ||
          String(item.userId) === String(patientId),
      ) || fallbackPatient,
    [patientId, patients],
  );
  const patientUserId =
    searchParams.get("userId") ||
    patient.userId ||
    patient.raw?.user?._id ||
    patient.raw?.user?.id ||
    "";

  useEffect(() => {
    if (!patientUserId) {
      setAppointmentCounts(null);
      setActivities([]);
      setActivitiesLoading(false);
      setActivitiesError("");
      return undefined;
    }

    let mounted = true;
    setAppointmentCounts(null);
    setActivities([]);
    setActivitiesLoading(true);
    setActivitiesError("");

    Promise.allSettled([
      getUserAppointmentsCount(patientUserId),
      listPatientActivities(patientUserId, 500),
    ]).then(([countsResult, activitiesResult]) => {
      if (!mounted) return;

      if (countsResult.status === "fulfilled") {
        setAppointmentCounts(countsResult.value);
      } else {
        setAppointmentCounts(null);
      }

      if (activitiesResult.status === "fulfilled") {
        setActivities(activitiesResult.value);
        setActivitiesError("");
      } else {
        setActivitiesError(
          activitiesResult.reason?.message ||
            "تعذر تحميل سجل نشاطات المريض",
        );
      }

      setActivitiesLoading(false);
    });

    return () => {
      mounted = false;
    };
  }, [patientUserId]);

  const infoRows = [
    ["تاريخ الميلاد", formatDate(patient.birthDate)],
    ["العمر", getAge(patient.birthDate)],
    ["الجنس", formatGender(patient.gender)],
    ["رقم الهاتف", patient.phone || "غير متوفر"],
    ["تاريخ التسجيل", formatDate(patient.registrationDate)],
  ];

  const stats = [
    {
      label: "إجمالي الحجوزات",
      value: appointmentCounts?.total ?? 0,
      icon: CalendarCheck,
    },
    {
      label: "الحجوزات المكتملة",
      value: appointmentCounts?.completed ?? 0,
      icon: ClipboardList,
    },
    {
      label: "الحجوزات الملغية",
      value: appointmentCounts?.cancelled ?? 0,
      icon: UserRound,
    },
  ];

  return (
    <section className="min-h-screen bg-[#f8fcfd] text-[#333] dark:bg-[#2f2f2f] dark:text-white">
      <header className="flex min-h-[112px] items-start justify-start bg-white px-4 pt-[32px] shadow-[0_1px_8px_rgba(0,0,0,0.03)] dark:bg-[#3a3a3a] sm:px-6 lg:px-[32px]">
        <div className="text-right">
          <h1 className="text-[23px] font-bold leading-[31px] text-[#333] dark:text-white">
            ملف المستخدم
          </h1>
          <p className="mt-1 text-[13px] leading-5 text-[#8a8a8a] dark:text-gray-300">
            المرضى / ملف المستخدم
          </p>
        </div>
      </header>

      <main className="px-4 pb-8 pt-[24px] sm:px-6 lg:px-[38px]">
        <div className="mb-[24px] flex justify-end">
          <Link
            to="/receptionist/patients"
            className="inline-flex items-center gap-2 text-[12px] font-bold text-[#23b9d5]"
          >
            <ChevronRight size={15} strokeWidth={2} />
            <span>رجوع</span>
          </Link>
        </div>

        <div
          className="grid gap-4 xl:grid-cols-[minmax(260px,320px)_minmax(0,1fr)]"
          dir="ltr"
        >
          <section
            className="rounded-[8px] bg-white p-4 shadow-[0_5px_18px_rgba(37,70,82,0.08)] dark:bg-[#505050]"
            dir="rtl"
          >
            <h2 className="mb-4 text-right text-[14px] font-bold">
              معلومات المريض
            </h2>
            <div className="divide-y divide-[#edf1f3] dark:divide-white/10">
              {infoRows.map(([label, value]) => (
                <div
                  key={label}
                  className="grid grid-cols-[1fr_1fr] py-2 text-[11px]"
                >
                  <span className="text-[#8a98a0] dark:text-gray-300">
                    {label}
                  </span>
                  <span className="text-right font-bold">{value}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="space-y-4" dir="rtl">
            <article className="rounded-[8px] bg-white p-5 text-center shadow-[0_5px_18px_rgba(37,70,82,0.08)] dark:bg-[#505050]">
              <img
                src={getPatientImage(patient)}
                alt={getPatientName(patient)}
                className="mx-auto h-[112px] w-[112px] rounded-full object-cover object-top ring-4 ring-[#edf7f9] dark:ring-white/10"
              />
              <h2 className="mt-3 text-[16px] font-bold">
                {getPatientName(patient)}
              </h2>
              <p className="mt-1 text-[12px] text-[#8a98a0] dark:text-gray-300">
                مريض
              </p>
            </article>

            <div className="grid gap-3 sm:grid-cols-3">
              {stats.map((stat) => (
                <MiniStat key={stat.label} {...stat} />
              ))}
            </div>
          </section>
        </div>

        <section className="mt-4 overflow-hidden rounded-[8px] bg-white py-4 shadow-[0_5px_18px_rgba(37,70,82,0.08)] dark:bg-[#505050]">
          <h2 className="mb-3 px-6 text-right text-[14px] font-bold">
            سجل نشاطات المريض
          </h2>
          <ActivityList
            activities={activities}
            loading={activitiesLoading}
            error={activitiesError}
            showRole={false}
            showActorName={false}
          />
        </section>

        {loading && (
          <p className="mt-4 text-center text-[12px] text-[#8a98a0]">
            جاري تحديث بيانات المريض...
          </p>
        )}
      </main>
    </section>
  );
}

function MiniStat({ icon: Icon, label, value }) {
  return (
    <article className="rounded-[8px] bg-white p-4 text-center shadow-[0_5px_18px_rgba(37,70,82,0.08)] dark:bg-[#505050]">
      <Icon className="mx-auto text-[#24b9d6]" size={20} strokeWidth={1.8} />
      <p className="mt-2 text-[11px] text-[#8a98a0] dark:text-gray-300">
        {label}
      </p>
      <strong className="mt-1 block text-[13px]">{value}</strong>
    </article>
  );
}
