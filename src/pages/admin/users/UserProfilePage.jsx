import { ArrowRight, ChevronLeft, Star } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import adminImage from "../../../assets/landingPage/admin.png";
import doctorImage from "../../../assets/landingPage/login-doctor.png";
import ActivityList from "../../../components/admin/ActivityList";
import {
  getDoctor,
  getUserAppointmentsCount,
  listDoctorActivities,
  listPatientActivities,
  listReceptionistActivities,
} from "../../../services/medilinkApi";
import { userRoles, userStatuses } from "./usersData";
import { useUsersStore } from "./useUsersStore";

const uploadedProfileImages = import.meta.glob(
  "../../../assets/profiles/*.{jpg,jpeg,png,webp}",
  {
    eager: true,
    import: "default",
  },
);

const profileImageNames = {
  patient: ["patient", "patient-profile", "profile-patient"],
  doctor: ["doctor", "doctor-profile", "profile-doctor"],
  receptionist: [
    "receptionist",
    "receptionist-profile",
    "profile-receptionist",
  ],
};

const fallbackProfileImages = {
  patient: adminImage,
  doctor: doctorImage,
  receptionist: adminImage,
};

export default function UserProfilePage() {
  const navigate = useNavigate();
  const { userId } = useParams();
  const [searchParams] = useSearchParams();
  const { getUser, loading } = useUsersStore();
  const storedUser = userId ? getUser(userId) : null;
  const routeRole = searchParams.get("role") || "";
  const isDoctorProfile = (storedUser?.role || routeRole) === "doctor";
  const canLoadAppointmentCounts = ["doctor", "patient"].includes(
    storedUser?.role || routeRole,
  );
  const [doctorDetails, setDoctorDetails] = useState(null);
  const [appointmentCounts, setAppointmentCounts] = useState(null);
  const activeDoctorDetails =
    isDoctorProfile && doctorDetails?.routeUserId === userId
      ? doctorDetails.data
      : null;
  const activeAppointmentCounts =
    appointmentCounts?.routeUserId === userId ? appointmentCounts.data : null;
  const profileSource = activeDoctorDetails || storedUser;
  const profile = buildProfile(
    profileSource,
    searchParams,
    activeAppointmentCounts,
  );

  useEffect(() => {
    if (!userId || !isDoctorProfile) {
      return undefined;
    }

    let mounted = true;
    const doctorIds = getDoctorProfileLookupIds(storedUser, userId);

    async function loadDoctorDetails() {
      for (const doctorId of doctorIds) {
        try {
          const doctor = await getDoctor(doctorId);
          if (mounted) setDoctorDetails({ routeUserId: userId, data: doctor });
          return;
        } catch {
          // Try the next possible doctor identifier.
        }
      }

      if (mounted) setDoctorDetails({ routeUserId: userId, data: null });
    }

    loadDoctorDetails();

    return () => {
      mounted = false;
    };
  }, [isDoctorProfile, storedUser, userId]);

  useEffect(() => {
    if (!userId || !canLoadAppointmentCounts) {
      return undefined;
    }

    let mounted = true;
    const countIds = getAppointmentCountLookupIds(storedUser, userId);

    async function loadAppointmentCounts() {
      for (const countId of countIds) {
        try {
          const counts = await getUserAppointmentsCount(countId);
          if (mounted) {
            setAppointmentCounts({ routeUserId: userId, data: counts });
          }
          return;
        } catch {
          // Try the next possible user identifier.
        }
      }

      if (mounted) {
        setAppointmentCounts({ routeUserId: userId, data: null });
      }
    }

    loadAppointmentCounts();

    return () => {
      mounted = false;
    };
  }, [canLoadAppointmentCounts, storedUser, userId]);

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
      return;
    }

    navigate("/admin/appointments");
  };

  if (userId && loading && !storedUser) {
    return <ProfileLoadingState />;
  }

  return (
    <section className="min-h-screen bg-[#f8fbfc] text-[#333] dark:bg-[#2f2f2f] dark:text-white">
      <header className="relative flex min-h-[120px] items-start justify-start bg-white px-4 pt-[38px] shadow-[0_1px_8px_rgba(0,0,0,0.03)] dark:bg-[#3a3a3a] sm:px-6 lg:px-[32px]">
        <div className="text-right">
          <h1 className="text-[26px] font-bold leading-[31px] text-[#333] dark:text-white">
            ملف المستخدم
          </h1>
          <p className="mt-1 text-[16px] leading-5 text-[#8a8a8a] dark:text-gray-300">
            المستخدمون / ملف المستخدم
          </p>
        </div>

        <button
          type="button"
          className="absolute left-6 top-[43px] flex items-center gap-3 text-[20px] font-medium text-[#30bfd6] lg:left-[32px]"
          onClick={handleBack}
        >
          <ArrowRight size={20} strokeWidth={2} />
          رجوع
        </button>
      </header>

      <main className="px-4 py-[30px] sm:px-6 lg:px-[34px]">
        <div
          className="grid gap-[23px] lg:grid-cols-[432px_1fr]"
          dir="ltr"
        >
          <InfoCard profile={profile} />

          <div className="grid gap-[35px]" dir="rtl">
            <HeroCard profile={profile} />
            <StatsGrid profile={profile} />
          </div>
        </div>

        {(storedUser?.role || routeRole) === "patient" && (
          <PatientActivityPanel
            key={userId}
            user={storedUser}
            routeId={userId}
          />
        )}
        {(storedUser?.role || routeRole) === "doctor" && (
          <DoctorActivityPanel
            key={userId}
            user={profileSource}
            routeId={userId}
          />
        )}
        {(storedUser?.role || routeRole) === "receptionist" && (
          <ReceptionistActivityPanel
            key={userId}
            user={storedUser}
            routeId={userId}
          />
        )}
      </main>
    </section>
  );
}

function buildProfile(user, searchParams, appointmentCounts = null) {
  const fullName =
    user ? `${user.firstName} ${user.lastName}`.trim() : searchParams.get("name") || "غير متوفر";
  const [firstName, ...rest] = fullName.split(" ");
  const lastName = rest.join(" ");
  const role = user?.role || searchParams.get("role") || "patient";
  const fallbackAppointmentsCount = user?.caseCount ?? user?.appointmentsCount ?? 0;

  return {
    firstName: user?.firstName || firstName,
    lastName: user?.lastName || lastName,
    fullName,
    role,
    status: user?.status || searchParams.get("status") || "inactive",
    phone: user?.phone || searchParams.get("phone") || "غير متوفر",
    gender: formatGender(user?.gender || searchParams.get("gender")),
    birthDate: formatDate(user?.birthDate || searchParams.get("birthDate")),
    age: getAge(user?.birthDate || searchParams.get("birthDate")),
    registrationDate: formatDate(
      user?.registrationDate ||
        user?.raw?.user?.createdAt ||
        user?.raw?.createdAt,
    ),
    workDays: user?.workDays?.length ? user.workDays.join("، ") : "غير متوفر",
    workHours:
      user?.workStart && user?.workEnd
        ? `${formatWorkTime(user.workStart)} - ${formatWorkTime(user.workEnd)}`
        : "غير متوفر",
    specialty: user?.specialty || searchParams.get("specialty") || "غير متوفر",
    education: user?.education || "غير متوفر",
    experience: user?.experience ? `${user.experience} سنوات` : "غير متوفر",
    appointmentsCount: appointmentCounts?.total ?? fallbackAppointmentsCount,
    completedAppointmentsCount:
      appointmentCounts?.completed ?? user?.completedAppointmentsCount ?? 0,
    cancelledAppointmentsCount:
      appointmentCounts?.cancelled ?? user?.cancelledAppointmentsCount ?? 0,
    pendingAppointmentsCount:
      appointmentCounts?.pending ?? user?.pendingAppointmentsCount ?? 0,
    rating: normalizeRatingValue(
      user?.rating ??
        user?.ratingsAverage ??
        user?.raw?.rating ??
        user?.raw?.ratingsAverage,
    ),
    image: getProfileImage(role),
  };
}

function getAppointmentCountLookupIds(user, routeId) {
  return Array.from(
    new Set(
      [
        user?.userId,
        user?.raw?.user?._id,
        user?.raw?.user?.id,
        user?.raw?.patient?.user?._id,
        user?.raw?.patient?.user?.id,
        user?.raw?.doctor?.user?._id,
        user?.raw?.doctor?.user?.id,
        user?.raw?.doctorProfile?.user?._id,
        user?.raw?.doctorProfile?.user?.id,
        user?.id,
        routeId,
        user?.profileId,
        user?.raw?._id,
        user?.raw?.id,
        user?.raw?.patient?._id,
        user?.raw?.patient?.id,
        user?.raw?.doctor?._id,
        user?.raw?.doctor?.id,
        user?.raw?.doctorProfile?._id,
        user?.raw?.doctorProfile?.id,
        user?.raw?.profile?._id,
        user?.raw?.profile?.id,
      ]
        .filter(Boolean)
        .map(String),
    ),
  );
}

function getDoctorProfileLookupIds(user, routeId) {
  return Array.from(
    new Set(
      [
        routeId,
        user?.id,
        user?.profileId,
        user?.userId,
        user?.raw?._id,
        user?.raw?.id,
        user?.raw?.doctor?._id,
        user?.raw?.doctor?.id,
        user?.raw?.doctorProfile?._id,
        user?.raw?.doctorProfile?.id,
        user?.raw?.profile?._id,
        user?.raw?.profile?.id,
        user?.raw?.user?._id,
        user?.raw?.user?.id,
      ]
        .filter(Boolean)
        .map(String),
    ),
  );
}

function getPatientActivityLookupIds(user, routeId) {
  return Array.from(
    new Set(
      [
        user?.profileId,
        user?.raw?.patient?._id,
        user?.raw?.patient?.id,
        user?.raw?.patientProfile?._id,
        user?.raw?.patientProfile?.id,
        user?.raw?.profile?._id,
        user?.raw?.profile?.id,
        user?.id,
        user?.raw?._id,
        user?.raw?.id,
        user?.userId,
        user?.raw?.user?._id,
        user?.raw?.user?.id,
        routeId,
      ]
        .filter(Boolean)
        .map(String),
    ),
  );
}

function getDoctorActivityLookupIds(user, routeId) {
  return Array.from(
    new Set(
      [
        user?.profileId,
        user?.raw?.doctor?._id,
        user?.raw?.doctor?.id,
        user?.raw?.doctorProfile?._id,
        user?.raw?.doctorProfile?.id,
        user?.raw?.profile?._id,
        user?.raw?.profile?.id,
        user?.id,
        user?.raw?._id,
        user?.raw?.id,
        user?.userId,
        user?.raw?.user?._id,
        user?.raw?.user?.id,
        routeId,
      ]
        .filter(Boolean)
        .map(String),
    ),
  );
}

function getReceptionistActivityLookupIds(user, routeId) {
  return Array.from(
    new Set(
      [
        user?.userId,
        user?.raw?.user?._id,
        user?.raw?.user?.id,
        user?.raw?.receptionist?.user?._id,
        user?.raw?.receptionist?.user?.id,
        user?.raw?.receptionistProfile?.user?._id,
        user?.raw?.receptionistProfile?.user?.id,
        routeId,
        user?.id,
        user?.raw?.receptionist?._id,
        user?.raw?.receptionist?.id,
        user?.raw?.receptionistProfile?._id,
        user?.raw?.receptionistProfile?.id,
        user?.raw?.profile?._id,
        user?.raw?.profile?.id,
        user?.profileId,
        user?.raw?._id,
        user?.raw?.id,
      ]
        .filter(Boolean)
        .map(String),
    ),
  );
}

function normalizeRatingValue(value) {
  const rating = Number(value);
  if (!Number.isFinite(rating)) return 0;
  return Math.min(5, Math.max(0, rating));
}

function formatRatingValue(value) {
  const rating = normalizeRatingValue(value);
  return Number.isInteger(rating) ? String(rating) : rating.toFixed(1);
}

function ProfileLoadingState() {
  return (
    <section className="min-h-screen bg-[#f8fbfc] text-[#333] dark:bg-[#2f2f2f] dark:text-white">
      <header className="relative flex min-h-[120px] items-start justify-start bg-white px-4 pt-[38px] shadow-[0_1px_8px_rgba(0,0,0,0.03)] dark:bg-[#3a3a3a] sm:px-6 lg:px-[32px]">
        <div className="text-right">
          <h1 className="text-[26px] font-bold leading-[31px] text-[#333] dark:text-white">
            ملف المستخدم
          </h1>
          <p className="mt-1 text-[16px] leading-5 text-[#8a8a8a] dark:text-gray-300">
            جاري تحميل البيانات...
          </p>
        </div>
      </header>

      <main className="grid min-h-[calc(100vh-120px)] place-items-center px-4 py-[30px] sm:px-6 lg:px-[34px]">
        <p className="text-[18px] font-medium text-[#666] dark:text-gray-200">
          جاري تحميل بيانات المستخدم...
        </p>
      </main>
    </section>
  );
}

function formatGender(gender) {
  if (gender === "female") return "أنثى";
  if (gender === "male") return "ذكر";
  return "غير متوفر";
}

function formatDate(value) {
  if (!value) return "غير متوفر";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);

  return date.toLocaleDateString("ar-EG", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
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

  return `${age} سنة`;
}

function getProfileImage(role) {
  const expectedNames = profileImageNames[role] || profileImageNames.patient;
  const matchedImage = Object.entries(uploadedProfileImages).find(([path]) => {
    const fileName = path.split("/").pop().toLowerCase();
    const baseName = fileName.replace(/\.(jpg|jpeg|png|webp)$/i, "");

    return expectedNames.includes(baseName);
  });

  return matchedImage?.[1] || fallbackProfileImages[role] || adminImage;
}

function InfoCard({ profile }) {
  const rows = getInfoRows(profile);
  const titles = {
    doctor: "معلومات الطبيب",
    receptionist: "معلومات موظف الاستقبال",
    patient: "معلومات المريض",
  };

  return (
    <section
      className="min-h-[444px] rounded-[8px] bg-white px-[24px] py-[36px] shadow-[0_4px_20px_rgba(0,0,0,0.08)] dark:bg-[#505050]"
      dir="rtl"
    >
      <h2 className="mb-[27px] text-right text-[27px] font-medium text-[#333] dark:text-white">
        {titles[profile.role] || "معلومات المستخدم"}
      </h2>

      <div>
        {rows.map((row) => (
          <div
            key={row.label}
            className="flex h-[59px] items-center justify-between border-b border-[#d7d7d7] text-[16px] text-[#666] last:border-b-0 dark:border-white/20 dark:text-gray-200"
          >
            <span>{row.label}</span>
            <span>{row.value}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

function getInfoRows(profile) {
  if (profile.role === "doctor") {
    return [
      { label: "تاريخ الميلاد", value: profile.birthDate },
      { label: "الجنس", value: profile.gender },
      { label: "رقم الهاتف", value: profile.phone },
      { label: "سنوات الخبرة", value: profile.experience },
      { label: "أيام العمل", value: profile.workDays },
      { label: "ساعات العمل", value: profile.workHours },
      { label: "تاريخ التسجيل", value: profile.registrationDate },
    ];
  }

  if (profile.role === "receptionist") {
    return [
      { label: "تاريخ الميلاد", value: profile.birthDate },
      { label: "الجنس", value: profile.gender },
      { label: "رقم الهاتف", value: profile.phone },
      { label: "أيام العمل", value: profile.workDays },
      { label: "ساعات العمل", value: profile.workHours },
      { label: "تاريخ التسجيل", value: profile.registrationDate },
    ];
  }

  return [
    { label: "تاريخ الميلاد", value: profile.birthDate },
    { label: "العمر", value: profile.age },
    { label: "الجنس", value: profile.gender },
    { label: "رقم الهاتف", value: profile.phone },
    { label: "تاريخ التسجيل", value: profile.registrationDate },
  ];
}

function HeroCard({ profile }) {
  return (
    <section className="grid min-h-[338px] place-items-center rounded-[8px] bg-white px-6 py-[22px] text-center shadow-[0_4px_20px_rgba(0,0,0,0.08)] dark:bg-[#505050]">
      <div>
        <div className="mx-auto h-[174px] w-[174px] overflow-hidden rounded-full border-[5px] border-[#eeeeee]">
          <img
            src={profile.image}
            alt={profile.fullName}
            className="h-full w-full object-cover"
          />
        </div>
        <h2 className="mt-[22px] text-[30px] font-bold leading-9 text-[#333] dark:text-white">
          {profile.fullName}
        </h2>
        <div className="mt-[10px] flex items-center justify-center gap-[12px] text-[15px] text-[#8a8a8a]">
          <span>{userRoles[profile.role]}</span>
          <StatusBadge status={profile.status} />
        </div>
      </div>
    </section>
  );
}

function StatsGrid({ profile }) {
  const stats = getStats(profile);

  return (
    <div className="grid gap-[25px] sm:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat) => (
        <section
          key={stat.label}
          className="grid min-h-[113px] min-w-0 place-items-center overflow-hidden rounded-[8px] bg-white px-3 py-5 text-center shadow-[0_4px_20px_rgba(0,0,0,0.08)] dark:bg-[#505050]"
        >
          <div className="min-w-0 max-w-full">
            <p className="text-[16px] leading-5 text-[#30bfd6]">{stat.label}</p>
            <div className="mt-[13px] text-[22px] font-bold leading-7 text-[#30bfd6]">
              {stat.value}
            </div>
          </div>
        </section>
      ))}
    </div>
  );
}

function getStats(profile) {
  if (profile.role === "doctor") {
    return [
      { label: "التخصص", value: profile.specialty },
      { label: "إجمالي الحجوزات", value: profile.appointmentsCount },
      { label: "التقييم", value: <RatingStars rating={profile.rating} /> },
    ];
  }

  if (profile.role === "receptionist") {
    return [
      { label: "الحالة", value: "خريج" },
      { label: "التعليم", value: profile.education },
    ];
  }

  return [
    { label: "إجمالي الحجوزات", value: profile.appointmentsCount },
    { label: "الحجوزات المكتملة", value: profile.completedAppointmentsCount },
    { label: "الحجوزات الملغية", value: profile.cancelledAppointmentsCount },
    { label: "الحجوزات المعلقة", value: profile.pendingAppointmentsCount },
  ];
}

function RatingStars({ rating }) {
  const ratingValue = normalizeRatingValue(rating);

  return (
    <span
      className="flex max-w-full items-center justify-center gap-1"
      dir="ltr"
    >
      <span className="shrink-0 text-[16px] font-bold text-[#333] dark:text-white">
        {formatRatingValue(ratingValue)}
      </span>
      {Array.from({ length: 5 }).map((_, index) => (
        <span
          key={index}
          className="relative inline-grid h-[16px] w-[16px] shrink-0 place-items-center"
        >
          <Star size={16} className="text-[#d6d6d6]" strokeWidth={1.8} />
          <span
            className="absolute inset-0 overflow-hidden text-[#f6aa00]"
            style={{
              width: `${Math.min(Math.max(ratingValue - index, 0), 1) * 100}%`,
            }}
          >
            <Star size={16} fill="currentColor" strokeWidth={1.8} />
          </span>
        </span>
      ))}
    </span>
  );
}

function ActivityPanel({
  activities,
  loading,
  error,
  title,
  showAll = false,
  onShowAll,
}) {
  return (
    <section className="mt-[42px] overflow-hidden rounded-[8px] bg-white py-[25px] shadow-[0_4px_20px_rgba(0,0,0,0.08)] dark:bg-[#505050]">
      <div className="mb-[18px] flex items-center justify-between gap-4 px-6">
        <h2 className="text-right text-[20px] font-bold text-[#333] dark:text-white">
          {title}
        </h2>

        {!loading && !error && activities.length > 0 && !showAll && (
          <button
            type="button"
            onClick={onShowAll}
            className="flex items-center gap-2 text-[14px] font-semibold text-[#30bfd6] transition hover:text-[#159ab1]"
          >
            <span>عرض الكل</span>
            <ChevronLeft size={19} strokeWidth={2} />
          </button>
        )}
      </div>

      <div className="px-6">
        <ActivityList
          activities={activities}
          loading={loading}
          error={error}
          compact={!showAll}
          showRole={false}
          showActorName={false}
          insetItems={false}
        />
      </div>
    </section>
  );
}

function PatientActivityPanel({ user, routeId }) {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    let mounted = true;
    const patientIds = getPatientActivityLookupIds(user, routeId);

    async function loadPatientActivities() {
      for (const patientId of patientIds) {
        try {
          const patientActivities = await listPatientActivities(patientId, 500);

          if (mounted) {
            setActivities(patientActivities);
            setLoading(false);
          }
          return;
        } catch {
          // Try the next possible patient identifier.
        }
      }

      if (mounted) {
        setError("تعذر تحميل سجل نشاطات المريض");
        setLoading(false);
      }
    }

    loadPatientActivities();

    return () => {
      mounted = false;
    };
  }, [routeId, user]);

  return (
    <ActivityPanel
      activities={activities}
      loading={loading}
      error={error}
      title="سجل نشاطات المريض"
      showAll={showAll}
      onShowAll={() => setShowAll(true)}
    />
  );
}

function DoctorActivityPanel({ user, routeId }) {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    let mounted = true;
    const doctorIds = getDoctorActivityLookupIds(user, routeId);

    async function loadDoctorActivities() {
      for (const doctorId of doctorIds) {
        try {
          const doctorActivities = await listDoctorActivities(doctorId, 500);

          if (mounted) {
            setActivities(doctorActivities);
            setLoading(false);
          }
          return;
        } catch {
          // Try the next possible doctor identifier.
        }
      }

      if (mounted) {
        setError("تعذر تحميل سجل نشاطات الطبيب");
        setLoading(false);
      }
    }

    loadDoctorActivities();

    return () => {
      mounted = false;
    };
  }, [routeId, user]);

  return (
    <ActivityPanel
      activities={activities}
      loading={loading}
      error={error}
      title="سجل نشاطات الطبيب"
      showAll={showAll}
      onShowAll={() => setShowAll(true)}
    />
  );
}

function ReceptionistActivityPanel({ user, routeId }) {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    let mounted = true;
    const receptionistIds = getReceptionistActivityLookupIds(user, routeId);

    async function loadReceptionistActivities() {
      for (const receptionistId of receptionistIds) {
        try {
          const receptionistActivities = await listReceptionistActivities(
            receptionistId,
            500,
          );

          if (mounted) {
            setActivities(receptionistActivities);
            setLoading(false);
          }
          return;
        } catch {
          // Try the next possible receptionist identifier.
        }
      }

      if (mounted) {
        setError("تعذر تحميل سجل نشاطات موظف الاستقبال");
        setLoading(false);
      }
    }

    loadReceptionistActivities();

    return () => {
      mounted = false;
    };
  }, [routeId, user]);

  return (
    <ActivityPanel
      activities={activities}
      loading={loading}
      error={error}
      title="سجل نشاطات موظف الاستقبال"
      showAll={showAll}
      onShowAll={() => setShowAll(true)}
    />
  );
}

function StatusBadge({ status }) {
  const active = status === "active";

  return (
    <span
      className={`rounded-[7px] px-[7px] py-[5px] text-[10px] font-medium ${
        active ? "bg-[#e8fff4] text-[#129a55]" : "bg-[#fff0f0] text-[#ff2020]"
      }`}
    >
      {userStatuses[status] || userStatuses.active}
    </span>
  );
}

function formatWorkTime(time) {
  if (!time) return "";

  const twentyFourHourMatch = /^(\d{1,2}):(\d{2})$/.exec(time);
  if (twentyFourHourMatch) {
    const hour24 = Number(twentyFourHourMatch[1]);
    const hour12 = hour24 % 12 || 12;
    const period = hour24 >= 12 ? "مساءا" : "صباحا";

    return `${hour12}:${twentyFourHourMatch[2]} ${period}`;
  }

  return time.replace(" ص", " صباحا").replace(" م", " مساءا");
}
