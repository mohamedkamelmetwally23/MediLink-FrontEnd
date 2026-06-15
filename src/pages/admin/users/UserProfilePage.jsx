import { ArrowRight, Star } from "lucide-react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import adminImage from "../../../assets/landingPage/admin.png";
import doctorImage from "../../../assets/landingPage/login-doctor.png";
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
  const { getUser } = useUsersStore();
  const storedUser = userId ? getUser(userId) : null;
  const profile = buildProfile(storedUser, searchParams);

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
      return;
    }

    navigate("/admin/appointments");
  };

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

        <ActivityPanel />
      </main>
    </section>
  );
}

function buildProfile(user, searchParams) {
  const fullName =
    user ? `${user.firstName} ${user.lastName}`.trim() : searchParams.get("name") || "غير متوفر";
  const [firstName, ...rest] = fullName.split(" ");
  const lastName = rest.join(" ");
  const role = user?.role || searchParams.get("role") || "patient";

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
    registrationDate: formatDate(user?.registrationDate || user?.raw?.createdAt),
    workDays: user?.workDays?.length ? user.workDays.join("، ") : "غير متوفر",
    workHours:
      user?.workStart && user?.workEnd
        ? `${formatWorkTime(user.workStart)} - ${formatWorkTime(user.workEnd)}`
        : "غير متوفر",
    specialty: user?.specialty || searchParams.get("specialty") || "غير متوفر",
    education: user?.education || "غير متوفر",
    experience: user?.experience ? `${user.experience} سنوات` : "غير متوفر",
    appointmentsCount: user?.caseCount ?? user?.appointmentsCount ?? 0,
    completedAppointmentsCount: user?.completedAppointmentsCount ?? 0,
    cancelledAppointmentsCount: user?.cancelledAppointmentsCount ?? 0,
    image: getProfileImage(role),
  };
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

  return (
    <section
      className="min-h-[444px] rounded-[8px] bg-white px-[24px] py-[36px] shadow-[0_4px_20px_rgba(0,0,0,0.08)] dark:bg-[#505050]"
      dir="rtl"
    >
      <h2 className="mb-[27px] text-right text-[27px] font-medium text-[#333] dark:text-white">
        {profile.role === "doctor" ? "معلومات الطبيب" : "معلومات المريض"}
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
    <div className="grid gap-[25px] sm:grid-cols-3">
      {stats.map((stat) => (
        <section
          key={stat.label}
          className="grid min-h-[113px] place-items-center rounded-[8px] bg-white px-4 py-5 text-center shadow-[0_4px_20px_rgba(0,0,0,0.08)] dark:bg-[#505050]"
        >
          <div>
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
      { label: "التقييم", value: <RatingStars /> },
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
  ];
}

function RatingStars() {
  return (
    <span className="flex justify-center gap-1 text-[#f6aa00]">
      {Array.from({ length: 5 }).map((_, index) => (
        <Star key={index} size={17} fill="currentColor" />
      ))}
    </span>
  );
}

function ActivityPanel() {
  return (
    <section className="mt-[42px] rounded-[8px] bg-white px-[16px] py-[25px] shadow-[0_4px_20px_rgba(0,0,0,0.08)] dark:bg-[#505050]">
      <h2 className="mb-[28px] text-right text-[20px] font-bold text-[#333] dark:text-white">
        النشاط الأخير
      </h2>

      <div className="grid min-h-[120px] place-items-center text-[16px] font-medium text-[#666] dark:text-gray-200">
        لا يوجد نشاط من قاعدة البيانات حتى الآن
      </div>
    </section>
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
