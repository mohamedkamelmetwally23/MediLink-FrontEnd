import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import {
  CalendarCheck,
  ChevronDown,
  ChevronUp,
  CircleMinus,
  CirclePlus,
  Cross,
  LockKeyhole,
  LogOut,
  Mail,
  MapPin,
  Menu,
  MessageCircleMore,
  Phone,
  Search,
  Settings,
  Stethoscope,
  UserRound,
  X,
} from "lucide-react";
import { FaFacebookF, FaInstagram, FaLinkedinIn, FaStar } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import LogoutConfirmModal from "../../components/LogoutConfirmModal";
import RatingPopup from "../../components/RatingPopup";
import ThemeLogo from "../../components/ThemeLogo";
import ProfileAvatar from "../../components/ProfileAvatar";
import heroDoctor from "../../assets/patient departement/Group 623 (3).png";
import doctor1 from "../../assets/landingPage/12 1.png";
import featureDoctor from "../../assets/landingPage/8.png";
import featureBooking from "../../assets/landingPage/9.png";
import featureAi from "../../assets/landingPage/10.png";
import featureSecurity from "../../assets/landingPage/11.png";
import searchDoctorIcon from "../../assets/landingPage/13(1).png";
import specialtyIcon from "../../assets/landingPage/13 (2).png";
import appointmentIcon from "../../assets/landingPage/13 (3).png";
import { clearAuthSession } from "../../services/authApi";
import { API_ORIGIN } from "../../services/apiClient";
import { useClinicInfo } from "../../services/clinicInfoStore";
import {
  getBookedAppointmentsForPatient,
  getCurrentAuthUser,
  getCurrentUser,
  submitReview,
} from "../../services/medilinkApi";
import { getDoctorImage, getDoctorName, getDoctorRating, useDoctors } from "../../hooks/useDoctors";
import { useSpecializations } from "../../hooks/useSpecializations";
import { includesSearchText } from "../../utils/searchText";

const gradient = "bg-linear-to-b from-[#05ADE8] to-[#6CCCC8]";
const sectionClass = "mx-auto w-full max-w-[1280px] px-4 sm:px-6 lg:px-10";

const whyFeatures = [
  {
    title: "أطباء متخصصون",
    description: "فريق من الأطباء والاستشاريين في مختلف التخصصات الطبية لتقديم رعاية صحية موثوقة.",
    image: featureDoctor,
  },
  {
    title: "حجز مواعيد بسهولة",
    description: "احجز موعدك في دقائق قليلة من خلال منصة سهلة الاستخدام دون الحاجة للاتصالات الهاتفية.",
    image: featureBooking,
  },
  {
    title: "تجربة آمنة ومريحة",
    description: "نحافظ على خصوصية بيانات المرضى ونوفر تجربة رقمية سلسة وآمنة على جميع الأجهزة.",
    image: featureSecurity,
  },
  {
    title: "مساعد مدعوم بالذكاء الاصطناعي",
    description: "يساعدك في الوصول إلى التخصص المناسب بسرعة من خلال اقتراحات مبنية على الأعراض.",
    image: featureAi,
  },
];

const assistantCards = [
  {
    title: "إبحث عن طبيب",
    description: "ابحث عن أفضل الأطباء والمواعيد المتاحة المناسبة لك.",
    image: searchDoctorIcon,
  },
  {
    title: "اعرف التخصص المناسب",
    description: "اخبرني عن أعراضك وسأوجهك للتخصص المناسب.",
    image: specialtyIcon,
  },
  {
    title: "احجز موعدك",
    description: "احجز موعدك بسهولة مع الطبيب المناسب.",
    image: appointmentIcon,
  },
];

const faqs = [
  {
    question: "هل يمكنني حجز موعد دون الاتصال بالعيادة؟",
    answer: "نعم، يمكنك حجز موعدك بالكامل عبر المنصة واختيار الطبيب والتوقيت المناسب لك بكل سهولة.",
  },
  {
    question: "هل يمكنني إلغاء أو تعديل موعدي؟",
    answer: "يمكنك تعديل الموعد أو إلغاؤه من صفحة مواعيدك قبل وقت الزيارة.",
  },
  {
    question: "هل بياناتي ومعلوماتي الطبية آمنة؟",
    answer: "نحافظ على بياناتك الطبية وفق معايير الخصوصية والأمان ولا نشاركها دون إذنك.",
  },
  {
    question: "هل يمكنني التواصل مع الطبيب مباشرة؟",
    answer: "يمكنك استخدام قنوات التواصل المتاحة داخل المنصة حسب إعدادات الطبيب والعيادة.",
  },
];

export function PatientHomeHeader({
  doctorSearch = "",
  onDoctorSearch,
  disabled = false,
}) {
  const location = useLocation();
  const navigate = useNavigate();
  const { patientId } = useParams();
  const authUser = getCurrentAuthUser();
  const [profilePhoto, setProfilePhoto] = useState(
    authUser?.photo || "",
  );
  const currentPatientId =
    patientId ||
    authUser?.patientId ||
    authUser?.patient?._id ||
    authUser?.patient?.id ||
    authUser?.profile?._id ||
    authUser?._id ||
    authUser?.id ||
    "";
  const patientHomePath = `/patient/${encodeURIComponent(currentPatientId)}/home`;
  const profileMenuRef = useRef(null);
  const searchMenuRef = useRef(null);
  const searchInputRef = useRef(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [accountDetailsOpen, setAccountDetailsOpen] = useState(false);
  const [editDetailsOpen, setEditDetailsOpen] = useState(false);
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false);
  const isHomePage = location.pathname === patientHomePath;
  const isAppointmentsPage = location.pathname === "/patient/doctors";

  const mobileLinks = [
    { href: patientHomePath, label: "الرئيسية", route: true },
    { href: "/patient/doctors", label: "المواعيد", route: true },
    { href: "#contact", label: "تواصل معنا" },
  ];

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
      if (searchMenuRef.current && !searchMenuRef.current.contains(event.target)) {
        setSearchOpen(false);
      }
    };

    document.addEventListener("pointerdown", handleOutsideClick);
    return () => document.removeEventListener("pointerdown", handleOutsideClick);
  }, []);

  useEffect(() => {
    if (searchOpen) searchInputRef.current?.focus();
  }, [searchOpen]);

  useEffect(() => {
    let mounted = true;

    getCurrentUser()
      .then((user) => {
        if (mounted && user.photo) setProfilePhoto(user.photo);
      })
      .catch(() => null);

    const handleUserUpdated = (event) => {
      const user = event.detail || getCurrentAuthUser() || {};
      setProfilePhoto(user.photo || "");
    };

    window.addEventListener("medilink-user-updated", handleUserUpdated);

    return () => {
      mounted = false;
      window.removeEventListener("medilink-user-updated", handleUserUpdated);
    };
  }, []);

  const handleLogout = () => {
    clearAuthSession();
    navigate("/login", { replace: true });
  };

  const handleDoctorSearch = (value) => {
    if (onDoctorSearch) {
      onDoctorSearch(value);
      return;
    }

    navigate(patientHomePath, {
      state: { doctorSearch: value, focusDoctors: true },
    });
  };

  const showDoctorResults = () => {
    if (!isHomePage) {
      handleDoctorSearch(doctorSearch);
      return;
    }

    document.getElementById("doctors")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  return (
    <>
      <header className="fixed left-1/2 top-0 z-40 mx-auto grid min-h-[76px] w-[calc(100%_-_24px)] max-w-[1280px] -translate-x-1/2 grid-cols-[auto_1fr_auto] items-center gap-4 rounded-b-2xl bg-white/95 px-4 shadow-[0_4px_14px_rgba(0,0,0,0.08)] backdrop-blur-xl dark:bg-[#343434]/95 sm:w-[calc(100%_-_48px)] sm:px-6 lg:min-h-[88px] lg:px-8">
        <Link
          to={patientHomePath}
          className={`justify-self-start ${disabled ? "pointer-events-none opacity-45" : ""}`}
          aria-label="MediLink"
          aria-disabled={disabled}
          tabIndex={disabled ? -1 : undefined}
        >
          <ThemeLogo className="w-28 object-contain sm:w-36" />
        </Link>

        <nav className={`hidden items-center justify-center gap-8 text-sm font-semibold text-[#343434] dark:text-[#F0F0F0] md:flex lg:gap-12 lg:text-lg ${disabled ? "pointer-events-none opacity-45" : ""}`}>
          <Link
            to={patientHomePath}
            aria-current={isHomePage ? "page" : undefined}
            className={`transition hover:text-[#05ADE8] ${
              isHomePage ? "text-[#05ADE8] dark:text-[#05ADE8]" : ""
            }`}
          >
            الرئيسية
          </Link>
          <Link
            to="/patient/doctors"
            aria-current={isAppointmentsPage ? "page" : undefined}
            className={`transition hover:text-[#05ADE8] ${
              isAppointmentsPage ? "text-[#05ADE8] dark:text-[#05ADE8]" : ""
            }`}
          >
            المواعيد
          </Link>
          <a href="#contact" className="transition hover:text-[#05ADE8]">تواصل معنا</a>
        </nav>

        <div className="flex items-center justify-self-end gap-3">
          <button
            type="button"
            disabled={disabled}
            className="grid size-10 place-items-center rounded-full text-[#343434] transition hover:bg-[#05ADE8]/10 dark:text-white md:hidden"
            onClick={() => {
              setMenuOpen((open) => !open);
              setSearchOpen(false);
            }}
            aria-label="فتح قائمة التنقل"
            aria-expanded={menuOpen}
            aria-controls="patient-mobile-navigation"
          >
            {menuOpen ? <X size={25} /> : <Menu size={27} />}
          </button>
          <div ref={searchMenuRef} className="relative">
            <button
              type="button"
              disabled={disabled}
              className={`grid size-10 place-items-center rounded-full transition hover:bg-[#05ADE8]/10 ${
                searchOpen
                  ? "bg-[#05ADE8]/10 text-[#05ADE8] dark:text-[#05ADE8]"
                  : "text-[#343434] dark:text-white"
              }`}
              onClick={() => {
                setSearchOpen((open) => !open);
                setMenuOpen(false);
                setProfileOpen(false);
              }}
              aria-label="بحث عن طبيب"
              aria-expanded={searchOpen}
              aria-controls="patient-doctor-search"
            >
              <Search size={27} strokeWidth={1.8} />
            </button>

            <form
              id="patient-doctor-search"
              className={`absolute left-0 top-[calc(100%_+_14px)] w-[min(360px,calc(100vw_-_32px))] origin-top-left rounded-xl bg-white p-3 shadow-[0_14px_38px_rgba(0,0,0,0.2)] transition duration-200 dark:bg-[#383838] ${
                searchOpen ? "visible scale-100 opacity-100" : "invisible scale-95 opacity-0"
              }`}
              role="search"
              onSubmit={(event) => {
                event.preventDefault();
                showDoctorResults();
                setSearchOpen(false);
              }}
            >
              <div className="flex items-center gap-2 rounded-lg border border-[#DDE3E5] bg-[#F8FAFA] px-3 focus-within:border-[#05ADE8] dark:border-[#555555] dark:bg-[#454545]">
                <Search className="shrink-0 text-[#05ADE8]" size={20} />
                <input
                  ref={searchInputRef}
                  type="search"
                  value={doctorSearch}
                  onChange={(event) => handleDoctorSearch(event.target.value)}
                  placeholder="ابحث باسم الطبيب..."
                  aria-label="ابحث باسم الطبيب"
                  className="h-11 min-w-0 flex-1 bg-transparent text-sm text-[#333333] outline-none placeholder:text-[#999999] dark:text-white"
                />
                {doctorSearch && (
                  <button
                    type="button"
                    className="grid size-7 shrink-0 place-items-center rounded-full text-[#777777] transition hover:bg-black/5 hover:text-[#05ADE8] dark:text-[#D0D0D0] dark:hover:bg-white/10"
                    onClick={() => handleDoctorSearch("")}
                    aria-label="مسح البحث"
                  >
                    <X size={17} />
                  </button>
                )}
              </div>
              <button
                type="submit"
                className={`mt-2 min-h-10 w-full rounded-lg ${gradient} px-4 text-sm font-semibold text-white`}
              >
                عرض نتائج الأطباء
              </button>
            </form>
          </div>
          <div ref={profileMenuRef} className="relative">
            <button
              type="button"
              disabled={disabled}
              className="block rounded-full ring-[#05ADE8] transition hover:ring-2 focus-visible:outline-none focus-visible:ring-2"
              onClick={() => {
                setProfileOpen((open) => !open);
                setMenuOpen(false);
                setSearchOpen(false);
              }}
              aria-label="فتح قائمة الحساب"
              aria-expanded={profileOpen}
              aria-controls="patient-profile-menu"
            >
              <ProfileAvatar src={profilePhoto} alt="صورة الحساب" className="size-10 rounded-full object-cover sm:size-11" />
            </button>

            <div
              id="patient-profile-menu"
              className={`absolute left-0 top-[calc(100%_+_14px)] w-[290px] max-w-[calc(100vw_-_32px)] origin-top-left rounded-xl bg-white p-4 text-right shadow-[0_14px_38px_rgba(0,0,0,0.24)] transition duration-200 dark:bg-[#383838] ${
                profileOpen ? "visible scale-100 opacity-100" : "invisible scale-95 opacity-0"
              }`}
              dir="rtl"
            >
              <button
                type="button"
                className={`flex w-full items-center gap-3 rounded-md px-2 py-2.5 text-[#333333] transition hover:bg-[#F7F7F7] dark:text-[#F0F0F0] dark:hover:bg-white/5 ${
                  accountDetailsOpen ? "bg-[#F8F9FA] dark:bg-white/5" : ""
                }`}
                onClick={() => setAccountDetailsOpen((open) => !open)}
              >
                <UserRound size={23} strokeWidth={1.8} />
                <span className="flex-1 text-lg font-medium">حسابي الشخصي</span>
                {accountDetailsOpen ? <ChevronUp size={19} /> : <ChevronDown size={19} />}
              </button>

              <div
                className={`grid transition-all duration-200 ${
                  accountDetailsOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                }`}
              >
                <div className="overflow-hidden">
                  <nav className="space-y-1 py-2 pr-11 text-[16px] text-[#777777] dark:text-[#C8C8C8]">
                    {[
                      { label: "الملف الشخصي", tab: "extra" },
                      { label: "معلوماتي الإضافية", tab: "extra" },
                      { label: "الملفات الطبية", tab: "files" },
                      { label: "السجل المرضي", tab: "records" },
                      { label: "الوصفات الطبية", tab: "prescriptions" },
                      { label: "المواعيد المحجوزة", tab: "appointments" },
                    ].map((item) => (
                      <Link
                        key={item.label}
                        to={`/patient/${encodeURIComponent(currentPatientId)}/profile?tab=${item.tab}`}
                        className="block rounded-md px-2 py-2 transition hover:bg-[#05ADE8]/10 hover:text-[#05ADE8]"
                        onClick={() => setProfileOpen(false)}
                      >
                        {item.label}
                      </Link>
                    ))}
                  </nav>
                </div>
              </div>

              <div className="my-1 border-t border-[#E7E7E7] dark:border-[#555555]" />

              <button
                type="button"
                className={`flex w-full items-center gap-3 rounded-md px-2 py-2.5 text-[#333333] transition hover:bg-[#F7F7F7] dark:text-[#F0F0F0] dark:hover:bg-white/5 ${
                  editDetailsOpen ? "bg-[#F8F9FA] dark:bg-white/5" : ""
                }`}
                onClick={() => setEditDetailsOpen((open) => !open)}
              >
                <Settings size={23} strokeWidth={1.8} />
                <span className="flex-1 text-lg font-medium">تعديل البيانات</span>
                {editDetailsOpen ? <ChevronUp size={19} /> : <ChevronDown size={19} />}
              </button>

              <div
                className={`grid transition-all duration-200 ${
                  editDetailsOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                }`}
              >
                <div className="overflow-hidden">
                  <nav className="space-y-1 py-2 pr-11 text-[16px] text-[#777777] dark:text-[#C8C8C8]">
                    <button
                      type="button"
                      className="block w-full rounded-md px-2 py-2 text-right transition hover:bg-[#05ADE8]/10 hover:text-[#05ADE8]"
                      onClick={() => {
                        setProfileOpen(false);
                        navigate(`/patient/${encodeURIComponent(currentPatientId)}/profile/edit`);
                      }}
                    >
                      تعديل البيانات الشخصية
                    </button>
                    <button
                      type="button"
                      className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-right transition hover:bg-[#05ADE8]/10 hover:text-[#05ADE8]"
                      onClick={() => {
                        setProfileOpen(false);
                        navigate(`/patient/${encodeURIComponent(currentPatientId)}/profile/change-password`);
                      }}
                    >
                      <LockKeyhole size={16} strokeWidth={1.8} />
                      <span>تغيير كلمة المرور</span>
                    </button>
                  </nav>
                </div>
              </div>

              <div className="border-t border-[#E7E7E7] dark:border-[#555555]" />

              <button
                type="button"
                className="flex w-full items-center gap-3 rounded-md px-2 py-3 text-[#D92727] transition hover:bg-red-50 dark:hover:bg-red-950/20"
                onClick={() => {
                  setProfileOpen(false);
                  setLogoutConfirmOpen(true);
                }}
              >
                <LogOut size={23} strokeWidth={1.8} />
                <span className="text-lg font-medium">تسجيل الخروج</span>
              </button>
            </div>
          </div>
        </div>

        <div
          id="patient-mobile-navigation"
          className={`absolute inset-x-0 top-[calc(100%_+_8px)] overflow-hidden rounded-xl bg-white shadow-[0_12px_30px_rgba(0,0,0,0.16)] transition-all duration-200 dark:bg-[#383838] md:hidden ${
            menuOpen ? "visible translate-y-0 opacity-100" : "invisible -translate-y-2 opacity-0"
          } ${disabled ? "pointer-events-none opacity-45" : ""}`}
        >
          <nav className="flex flex-col p-2" aria-label="قائمة التنقل للموبايل">
            {mobileLinks.map((link) =>
              link.route ? (
                <Link
                  key={link.href}
                  to={link.href}
                  aria-current={
                    (link.href === patientHomePath && isHomePage) ||
                    (link.href === "/patient/doctors" && isAppointmentsPage)
                      ? "page"
                      : undefined
                  }
                  className={`rounded-lg px-4 py-3 text-right text-base font-semibold transition hover:bg-[#05ADE8]/10 hover:text-[#05ADE8] dark:text-[#F0F0F0] ${
                    (link.href === patientHomePath && isHomePage) ||
                    (link.href === "/patient/doctors" && isAppointmentsPage)
                      ? "bg-[#05ADE8]/10 text-[#05ADE8] dark:text-[#05ADE8]"
                      : "text-[#343434]"
                  }`}
                  onClick={() => setMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ) : (
                <a
                  key={link.href}
                  href={link.href}
                  className="rounded-lg px-4 py-3 text-right text-base font-semibold text-[#343434] transition hover:bg-[#05ADE8]/10 hover:text-[#05ADE8] dark:text-[#F0F0F0]"
                  onClick={() => setMenuOpen(false)}
                >
                  {link.label}
                </a>
              ),
            )}
          </nav>
        </div>
        <LogoutConfirmModal
          open={logoutConfirmOpen}
          onCancel={() => setLogoutConfirmOpen(false)}
          onConfirm={handleLogout}
        />
      </header>
      <div className="h-[76px] lg:h-[88px]" aria-hidden="true" />
    </>
  );
}

function resolveMediaUrl(image) {
  if (!image || typeof image !== "string") return "";
  if (/^(https?:|data:|blob:)/i.test(image)) return image;
  return `${API_ORIGIN.replace(/\/$/, "")}/${image.replace(/^\/+/, "")}`;
}

function getAppointmentTimestamp(appointment) {
  if (!appointment?.date) return Number.POSITIVE_INFINITY;

  const date = String(appointment.date).slice(0, 10);
  const time = String(appointment.time || "00:00").slice(0, 5);
  const timestamp = new Date(`${date}T${time}:00`).getTime();

  return Number.isNaN(timestamp) ? Number.POSITIVE_INFINITY : timestamp;
}

function getUpcomingAppointment(appointments = []) {
  const now = Date.now();
  const activeAppointments = appointments.filter(
    (appointment) => appointment.status !== "cancelled",
  );
  const upcoming = activeAppointments
    .filter((appointment) => getAppointmentTimestamp(appointment) >= now)
    .sort(
      (first, second) =>
        getAppointmentTimestamp(first) - getAppointmentTimestamp(second),
    );

  if (upcoming.length) return upcoming[0];

  return (
    activeAppointments.sort(
      (first, second) =>
        getAppointmentTimestamp(second) - getAppointmentTimestamp(first),
    )[0] || null
  );
}

function formatAppointmentTime(value) {
  if (!value) return "غير محدد";

  const match = /^(\d{1,2}):(\d{2})/.exec(String(value));
  if (!match) return String(value);

  const hour = Number(match[1]);
  const minute = match[2];
  const period = hour >= 12 ? "مساءً" : "صباحاً";
  const displayHour = hour % 12 || 12;

  return `${displayHour}:${minute} ${period}`;
}

function formatAppointmentDay(appointment) {
  if (!appointment?.date) return "";

  const appointmentDate = new Date(
    `${String(appointment.date).slice(0, 10)}T12:00:00`,
  );
  if (Number.isNaN(appointmentDate.getTime())) return appointment.date;

  const today = new Date();
  const todayDate = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  );
  const targetDate = new Date(
    appointmentDate.getFullYear(),
    appointmentDate.getMonth(),
    appointmentDate.getDate(),
  );
  const dayDiff = Math.round((targetDate - todayDate) / 86400000);

  if (dayDiff === 0) return "اليوم";
  if (dayDiff === 1) return "غداً";

  return appointmentDate.toLocaleDateString("ar-EG", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

function buildDoctorLookup(doctors = []) {
  const lookup = new Map();

  doctors.forEach((doctor) => {
    [
      doctor.id,
      doctor.profileId,
      doctor.userId,
      doctor.raw?._id,
      doctor.raw?.id,
      doctor.raw?.user?._id,
      doctor.raw?.user?.id,
      doctor.raw?.doctorProfile?._id,
      doctor.raw?.doctorProfile?.id,
    ]
      .filter(Boolean)
      .forEach((id) => lookup.set(String(id), doctor));
  });

  return lookup;
}

function getAppointmentDoctor(appointment, doctorById) {
  if (!appointment) return null;

  const rawDoctor = appointment.raw?.doctor || appointment.raw?.doctorId || {};
  const rawDoctorUser =
    rawDoctor && typeof rawDoctor === "object"
      ? rawDoctor.user || rawDoctor.account || {}
      : {};
  const ids = [
    appointment.doctorId,
    rawDoctor?._id,
    rawDoctor?.id,
    rawDoctorUser?._id,
    rawDoctorUser?.id,
    appointment.raw?.doctorProfile?._id,
    appointment.raw?.doctorProfile?.id,
  ].filter(Boolean);

  return ids.map((id) => doctorById.get(String(id))).find(Boolean) || null;
}

function getAppointmentDoctorName(appointment, doctor) {
  if (doctor) return getDoctorName(doctor);

  const rawDoctor = appointment?.raw?.doctor || appointment?.raw?.doctorId || {};
  const rawDoctorUser =
    rawDoctor && typeof rawDoctor === "object"
      ? rawDoctor.user || rawDoctor.account || {}
      : {};
  const rawName =
    appointment?.doctor ||
    rawDoctorUser.name ||
    rawDoctor.name ||
    [
      rawDoctorUser.firstName || rawDoctor.firstName,
      rawDoctorUser.lastName || rawDoctor.lastName,
    ]
      .filter(Boolean)
      .join(" ")
      .trim();

  if (!rawName) return "طبيب ميديلينك";
  return /^(د\.|دكتور|دكتورة)\s*/.test(rawName) ? rawName : `د. ${rawName}`;
}

function getAppointmentDoctorImage(appointment, doctor) {
  if (doctor) return getDoctorImage(doctor);

  const rawDoctor = appointment?.raw?.doctor || appointment?.raw?.doctorId || {};
  const rawDoctorUser =
    rawDoctor && typeof rawDoctor === "object"
      ? rawDoctor.user || rawDoctor.account || {}
      : {};
  const image =
    rawDoctorUser.photo ||
    rawDoctorUser.profileImage ||
    rawDoctorUser.image ||
    rawDoctor.profileImage ||
    rawDoctor.photo ||
    rawDoctor.image ||
    appointment?.raw?.doctorImage ||
    "";

  return resolveMediaUrl(image) || doctor1;
}

function HeroSection({
  patientName,
  upcomingAppointment,
  appointmentLoading,
  doctorById = new Map(),
}) {
  const appointmentDoctor = getAppointmentDoctor(upcomingAppointment, doctorById);
  const appointmentDoctorName = getAppointmentDoctorName(
    upcomingAppointment,
    appointmentDoctor,
  );
  const appointmentDoctorImage = getAppointmentDoctorImage(
    upcomingAppointment,
    appointmentDoctor,
  );
  const appointmentDay = formatAppointmentDay(upcomingAppointment);

  return (
    <section id="home" className={`${sectionClass} pt-10 sm:pt-14 lg:pt-16`}>
      <div className="grid items-center gap-8 md:grid-cols-2 lg:gap-14">
        <div className="order-2 text-center md:order-1 md:text-right">
          <h1 className="text-3xl font-bold text-[#333333] dark:text-[#F0F0F0] sm:text-4xl lg:text-[48px]">
            مرحباً، {patientName} <span aria-hidden="true">👋</span>
          </h1>
          <p className="mt-3 text-base text-[#737373] dark:text-[#CFCFCF] sm:text-lg">نتمنى لك يوماً صحياً سعيداً</p>

          <article className="mt-5 grid grid-cols-[1fr_auto] items-center gap-4 rounded-lg bg-[#EAF8F8] p-4 dark:bg-[#363636] sm:p-5" dir="ltr">
            <div className="text-left" dir="rtl">
              {appointmentLoading ? (
                <>
                  <p className="text-lg font-medium text-[#505050] dark:text-[#F0F0F0]">جاري تحميل موعدك القادم...</p>
                  <p className="mt-1 font-bold text-[#333333] dark:text-white">الساعة: --</p>
                  <p className="mt-1 text-sm font-semibold text-[#4F4F4F] dark:text-[#D5D5D5]">مع طبيب ميديلينك</p>
                </>
              ) : upcomingAppointment ? (
                <>
                  <p className="text-lg font-medium text-[#505050] dark:text-[#F0F0F0]">
                    لديك موعد قادم {appointmentDay}
                  </p>
                  <p className="mt-1 font-bold text-[#333333] dark:text-white">
                    الساعة: {formatAppointmentTime(upcomingAppointment.time)}
                  </p>
                  <p className="mt-1 text-sm font-semibold text-[#4F4F4F] dark:text-[#D5D5D5]">
                    مع {appointmentDoctorName}
                  </p>
                </>
              ) : (
                <>
                  <p className="text-lg font-medium text-[#505050] dark:text-[#F0F0F0]">لا توجد مواعيد قادمة حالياً</p>
                  <p className="mt-1 font-bold text-[#333333] dark:text-white">احجز موعدك المناسب الآن</p>
                  <p className="mt-1 text-sm font-semibold text-[#4F4F4F] dark:text-[#D5D5D5]">مع أطباء ميديلينك</p>
                </>
              )}
            </div>
            <div className="relative shrink-0">
              <span className="absolute -right-2 top-1 size-3 rounded-full bg-[#2164AE]" />
              <img src={appointmentDoctorImage} alt={appointmentDoctorName} className="h-24 w-28 object-contain sm:h-28 sm:w-32" />
            </div>
          </article>

          <div className="mt-7 grid grid-cols-2 gap-3">
            <Link to="/patient/doctors" className={`inline-flex min-h-12 items-center justify-center rounded-lg ${gradient} px-4 font-semibold text-white`}>حجز موعد جديد</Link>
            <button
              type="button"
              className="min-h-12 rounded-lg border-2 border-[#05ADE8] bg-transparent px-4 font-semibold text-[#05ADE8]"
              onClick={() =>
                document.getElementById("doctors")?.scrollIntoView({
                  behavior: "smooth",
                  block: "start",
                })
              }
            >
              تصفح الأطباء
            </button>
          </div>
        </div>

        <div className="order-1 flex justify-center md:order-2">
          <img src={heroDoctor} alt="طبيبة MediLink" className="w-full max-w-[520px] object-contain lg:max-w-[590px]" />
        </div>
      </div>
    </section>
  );
}

function StatsSection() {
  const stats = [
    { value: "+20", label: "تخصص طبي", icon: Cross },
    { value: "+30", label: "طبيب معتمد", icon: Stethoscope },
    { value: "+1200", label: "مريض", icon: UserRound },
    { value: "+1000", label: "حجز من خلال الموقع", icon: CalendarCheck },
  ];

  return (
    <section className={`${sectionClass} mt-8`}>
      <div className={`relative grid overflow-hidden rounded-lg ${gradient} text-white sm:grid-cols-2 lg:grid-cols-4`}>
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <article key={stat.label} className={`flex min-h-36 flex-col items-center justify-center px-4 py-6 text-center ${index ? "border-t border-white/40 sm:border-r sm:border-t-0" : ""}`}>
              <Icon size={39} strokeWidth={1.8} />
              <strong className="mt-2 text-2xl font-semibold">{stat.value}</strong>
              <span className="text-sm">{stat.label}</span>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function SpecialtiesSection() {
  const { specialties } = useSpecializations();

  return (
    <section id="specialties" className={`${sectionClass} scroll-mt-28 py-16`}>
      <h2 className="text-center text-3xl font-semibold text-[#333333] dark:text-[#F0F0F0]">التخصصات</h2>
      <div className="mt-8 flex snap-x gap-4 overflow-x-auto pb-5 [scrollbar-color:#60C8CB_transparent] [scrollbar-width:thin]">
        {specialties.map((item) => (
          <Link
            key={item.id || item.name}
            to={`/patient/doctors?specialty=${encodeURIComponent(item.name)}`}
            className="flex min-h-32 min-w-[180px] snap-start flex-col items-center justify-center rounded-lg bg-white p-4 text-center shadow-[0_4px_18px_rgba(0,0,0,0.12)] transition hover:-translate-y-1 dark:bg-[#383838] dark:shadow-[0_8px_24px_rgba(0,0,0,0.25)] sm:min-w-[190px]"
          >
            <img src={item.image} alt="" className="mb-3 size-12 object-contain" />
            <span className="text-sm font-semibold text-[#333333] dark:text-[#F0F0F0]">{item.name}</span>
          </Link>
        ))}
      </div>
    </section>
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
            className="relative block size-3 text-[#D7D7D7] dark:text-[#666666]"
            aria-hidden="true"
          >
            <FaStar className="absolute inset-0 size-3" />
            <span
              className="absolute inset-y-0 right-0 overflow-hidden text-[#F8B400]"
              style={{ width: `${fillPercentage}%` }}
            >
              <FaStar className="absolute right-0 top-0 size-3 max-w-none" />
            </span>
          </span>
        );
      })}
    </span>
  );
}

function DoctorsSection({
  search = "",
  doctors = [],
  loading = false,
  error = "",
}) {
  const filteredDoctors = useMemo(() => {
    const query = search.trim();
    if (!query) return doctors;

    return doctors.filter((doctor) =>
      includesSearchText(getDoctorName(doctor), query),
    );
  }, [doctors, search]);
  const visibleDoctors = filteredDoctors.slice(0, 8);

  return (
    <section id="doctors" className={`${sectionClass} scroll-mt-28 pb-16`}>
      <h2 className="text-center text-3xl font-semibold text-[#333333] dark:text-[#F0F0F0]">الأطباء</h2>
      <p className="mt-2 text-center text-[#8A8A8A] dark:text-[#C8C8C8]">فريق من أفضل الأطباء المتخصصين لخدمتكم</p>
      {search.trim() && !loading && !error && (
        <p className="mt-3 text-center text-sm font-semibold text-[#05ADE8]">
          {filteredDoctors.length > 0
            ? `تم العثور على ${filteredDoctors.length} طبيب`
            : `لا يوجد طبيب باسم "${search.trim()}"`}
        </p>
      )}
      <div className="mt-8 flex snap-x gap-5 overflow-x-auto pb-5 [scrollbar-width:thin] [scrollbar-color:#60C8CB_transparent]">
        {loading &&
          Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="min-h-[225px] min-w-[190px] rounded-lg bg-white p-4 shadow-md dark:bg-[#383838] sm:min-w-[205px]">
              <div className="skeleton h-28 rounded-lg" />
              <div className="skeleton mx-auto mt-3 h-5 w-28 rounded" />
              <div className="skeleton mx-auto mt-2 h-4 w-20 rounded" />
            </div>
          ))}

        {!loading && error && (
          <p className="w-full py-10 text-center text-[#777777] dark:text-[#C8C8C8]">{error}</p>
        )}

        {!loading &&
          !error &&
          visibleDoctors.map((doctor, index) => {
            const rating = getDoctorRating(doctor);

            return (
              <Link
                key={doctor.id || index}
                to={`/patient/doctors/${encodeURIComponent(doctor.id)}`}
                state={{ doctor }}
                aria-label={`عرض صفحة ${getDoctorName(doctor)}`}
                className="flex min-h-[225px] min-w-[190px] snap-start flex-col items-center rounded-lg bg-linear-to-b from-[#F0F0F0] to-white p-4 text-center shadow-[0_4px_16px_rgba(0,0,0,0.09)] transition hover:-translate-y-1 hover:shadow-[0_8px_24px_rgba(0,0,0,0.15)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#05ADE8] dark:from-[#454545] dark:to-[#383838] sm:min-w-[205px]"
              >
                <ProfileAvatar
                  src={getDoctorImage(doctor, index)}
                  alt={getDoctorName(doctor)}
                  className="h-28 w-full object-contain"
                />
                <h3 className="mt-2 text-base font-bold text-[#333333] dark:text-[#F0F0F0]">{getDoctorName(doctor)}</h3>
                <p className="mt-1 text-xs text-[#777777] dark:text-[#C7C7C7]">{doctor.specialty || "طب عام"}</p>
                <div className="mt-auto flex items-center gap-2 pt-3 text-xs text-[#555555] dark:text-[#E0E0E0]">
                  <span>{rating.toFixed(1)}</span>
                  <RatingStars rating={rating} />
                </div>
              </Link>
            );
          })}

        {!loading && !error && visibleDoctors.length === 0 && (
          <p className="w-full py-10 text-center text-[#777777] dark:text-[#C8C8C8]">
            جرّب كتابة اسم طبيب آخر.
          </p>
        )}
      </div>
      {!loading && !error && filteredDoctors.length > 0 && (
        <div className="mt-5 text-center">
          <Link to="/patient/doctors" className="inline-flex min-h-11 items-center justify-center rounded-lg border border-[#05ADE8] px-6 font-semibold text-[#05ADE8]">
            عرض كل الأطباء
          </Link>
        </div>
      )}
    </section>
  );
}

function WhySection() {
  return (
    <section className={`${sectionClass} pb-20`}>
      <h2 className="text-center text-3xl font-semibold text-[#333333] dark:text-[#F0F0F0]">
        لماذا <span className="text-[#20B8D5]">ميديلينك؟</span>
      </h2>
      <div className="relative mt-12 grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
        <div className="absolute left-[12%] right-[12%] top-10 hidden border-t-2 border-dashed border-[#28B9D7] lg:block" />
        {whyFeatures.map((feature) => (
          <article key={feature.title} className="relative z-[1] flex flex-col items-center bg-white px-4 text-center dark:bg-[#2E2E2E]">
            <div className="grid size-20 place-items-center bg-white dark:bg-[#2E2E2E]">
              <img src={feature.image} alt="" className="size-16 object-contain" />
            </div>
            <h3 className="mt-5 text-lg font-bold text-[#333333] dark:text-[#F0F0F0]">{feature.title}</h3>
            <p className="mt-2 max-w-[260px] text-sm leading-6 text-[#777777] dark:text-[#C7C7C7]">{feature.description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function AssistantSection() {
  return (
    <section id="assistant" className={`${sectionClass} pb-20`}>
      <h2 className="text-center text-3xl font-semibold text-[#333333] dark:text-[#F0F0F0]">
        <span className="text-[#39BDC8]">مساعدك الذكي</span> للرعاية الصحية
      </h2>
      <p className="mx-auto mt-3 max-w-3xl text-center text-base text-[#777777] dark:text-[#C7C7C7]">
        اسأل عن الأعراض، التخصصات، الأطباء أو احجز موعدك بسهولة. مساعد AI متاح على مدار الساعة لمساعدتك.
      </p>
      <div className="mt-9 grid gap-5 md:grid-cols-3">
        {assistantCards.map((card) => (
          <article key={card.title} className="flex min-h-[225px] flex-col items-center justify-center rounded-lg bg-white p-6 text-center shadow-[0_4px_18px_rgba(0,0,0,0.1)] dark:bg-[#383838] dark:shadow-[0_8px_24px_rgba(0,0,0,0.25)]">
            <img src={card.image} alt="" className="size-20 object-contain" />
            <h3 className="mt-4 text-xl font-semibold text-[#444444] dark:text-[#F0F0F0]">{card.title}</h3>
            <p className="mt-2 max-w-[290px] text-base leading-7 text-[#666666] dark:text-[#CFCFCF]">{card.description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function FaqSection() {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <section className={`${sectionClass} pb-20`}>
      <div className="grid gap-6 lg:grid-cols-[1.65fr_1fr] lg:items-stretch lg:gap-10" dir="ltr">
        <div className="space-y-3" dir="rtl">
          {faqs.map((faq, index) => {
            const open = openIndex === index;
            return (
              <article key={faq.question} className={`overflow-hidden rounded-lg border-2 border-[#05ADE8] ${open ? `${gradient} text-white` : "bg-white text-[#05ADE8] dark:bg-[#383838]"}`}>
                <button type="button" onClick={() => setOpenIndex(open ? null : index)} className="flex min-h-[68px] w-full items-center justify-between gap-4 px-5 py-3 text-right">
                  <span className="text-base font-semibold sm:text-lg">{index + 1}- {faq.question}</span>
                  {open ? <CircleMinus className="shrink-0" /> : <CirclePlus className="shrink-0" />}
                </button>
                <div className={`grid transition-all duration-300 ${open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
                  <div className="overflow-hidden">
                    <p className="px-5 pb-5 text-sm leading-7 sm:text-base">{faq.answer}</p>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        <aside className={`flex min-h-[335px] flex-col items-center justify-center rounded-lg ${gradient} p-8 text-center text-white`} dir="rtl">
          <MessageCircleMore size={72} strokeWidth={1.6} />
          <h3 className="mt-6 text-2xl font-bold">الأسئلة الأكثر شيوعاً</h3>
          <p className="mt-4 max-w-[330px] text-lg leading-8">اعرف أكثر عن منصة ميديلينك وخدمات ومميزات الرعاية الصحية التي نقدمها لك بسهولة ويسر</p>
        </aside>
      </div>
    </section>
  );
}

export function PatientHomeFooter() {
  const location = useLocation();
  const clinicInfo = useClinicInfo();
  const { specialties } = useSpecializations();
  const authUser = getCurrentAuthUser();
  const currentPatientId =
    authUser?.patientId ||
    authUser?.patient?._id ||
    authUser?.patient?.id ||
    authUser?.profile?._id ||
    authUser?._id ||
    authUser?.id ||
    "";
  const patientHomePath = `/patient/${encodeURIComponent(currentPatientId)}/home`;
  const specialtiesSectionHref =
    location.pathname === patientHomePath
      ? "#specialties"
      : `${patientHomePath}#specialties`;

  return (
    <footer id="contact" className="bg-white shadow-[0_-8px_22px_rgba(0,0,0,0.04)] dark:bg-[#343434]">
      <div className={`${sectionClass} grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-3`}>
        <section>
          <ThemeLogo className="w-40 object-contain" />
          <p className="mt-5 max-w-[280px] text-sm leading-6 text-[#444444] dark:text-[#D7D7D7]">نظام متكامل لإدارة العيادات والمراكز الطبية وتقديم أفضل تجربة للمرضى والأطباء</p>
          <div className="mt-6 flex gap-5 text-xl text-[#26B8D6]"><FaLinkedinIn /><FaInstagram /><FaXTwitter /><FaFacebookF /></div>
        </section>

        <section>
          <h3 className="mb-4 font-bold text-[#333333] dark:text-[#F0F0F0]">التخصصات</h3>
          {specialties.slice(0, 5).map((specialty) => (
            <Link
              key={specialty.id || specialty.name}
              to={`/patient/doctors?specialty=${encodeURIComponent(specialty.name)}`}
              className="mb-3 block text-sm text-[#444444] transition hover:text-[#05ADE8] dark:text-[#D7D7D7]"
            >
              {specialty.name}
            </Link>
          ))}
          <a
            href={specialtiesSectionHref}
            className="block text-sm font-semibold text-[#05ADE8] transition hover:underline hover:underline-offset-4"
          >
            عرض المزيد
          </a>
        </section>

        <section>
          <h3 className="mb-4 font-bold text-[#333333] dark:text-[#F0F0F0]">تواصل معنا</h3>
          <p className="mb-4 flex items-center gap-3 text-sm text-[#444444] dark:text-[#D7D7D7]">
            <Phone size={17} fill="currentColor" />
            <span>{clinicInfo.phone}</span>
          </p>
          <p className="mb-4 flex items-center gap-3 text-sm text-[#444444] dark:text-[#D7D7D7]">
            <Mail size={17} fill="currentColor" />
            <span className="break-all">{clinicInfo.email}</span>
          </p>
          <p className="flex items-center gap-3 text-sm text-[#444444] dark:text-[#D7D7D7]">
            <MapPin size={18} fill="currentColor" />
            <span>{clinicInfo.address}</span>
          </p>
        </section>
      </div>
    </footer>
  );
}

export default function PatientHomePage() {
  const location = useLocation();
  const authUser = getCurrentAuthUser();
  const [doctorSearch, setDoctorSearch] = useState(
    location.state?.doctorSearch || "",
  );
  const { doctors, loading: doctorsLoading, error: doctorsError } = useDoctors();
  const [upcomingAppointment, setUpcomingAppointment] = useState(null);
  const [appointmentLoading, setAppointmentLoading] = useState(true);
  const [ratingAppointments, setRatingAppointments] = useState([]);
  const patient = authUser?.patient || authUser?.profile || authUser || {};
  const patientName =
    [patient.firstName, patient.lastName].filter(Boolean).join(" ").trim() ||
    patient.name ||
    "مريض ميديلينك";
  const doctorById = useMemo(() => buildDoctorLookup(doctors), [doctors]);

  useEffect(() => {
    let mounted = true;

    getBookedAppointmentsForPatient()
      .then((appointments) => {
        if (!mounted) return;
        setUpcomingAppointment(getUpcomingAppointment(appointments));

        const unratedAppointments = appointments.filter((appointment) => {
          const isRated =
            appointment.raw?.isRated ??
            appointment.raw?.rated ??
            appointment.raw?.reviewed;
          const isUnrated =
            isRated === false ||
            String(isRated).trim().toLowerCase() === "false";

          return (
            appointment.status === "completed" &&
            isUnrated
          );
        });

        setRatingAppointments(unratedAppointments);
      })
      .catch(() => {
        if (mounted) setUpcomingAppointment(null);
      })
      .finally(() => {
        if (mounted) setAppointmentLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (location.hash === "#specialties") {
      const frame = window.requestAnimationFrame(() => {
        document.getElementById("specialties")?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      });

      return () => window.cancelAnimationFrame(frame);
    }

    if (location.state?.focusDoctors) {
      const frame = window.requestAnimationFrame(() => {
        document.getElementById("doctors")?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      });

      return () => window.cancelAnimationFrame(frame);
    }

    return undefined;
  }, [location.hash, location.state]);

  const ratingAppointment = ratingAppointments[0] || null;

  const showNextRatingAppointment = () => {
    setRatingAppointments((appointments) => appointments.slice(1));
  };

  const handleRatingSubmit = async ({ appointmentId, stars }) => {
    await submitReview({ appointmentId, stars });
    showNextRatingAppointment();
  };

  const handleRatingSkip = () => {
    showNextRatingAppointment();
  };

  return (
    <div className="min-h-screen bg-white text-[#333333] dark:bg-[#2E2E2E] dark:text-[#F0F0F0]" dir="rtl">
      <PatientHomeHeader
        doctorSearch={doctorSearch}
        onDoctorSearch={setDoctorSearch}
      />
      <main>
        <HeroSection
          patientName={patientName}
          upcomingAppointment={upcomingAppointment}
          appointmentLoading={appointmentLoading}
          doctorById={doctorById}
        />
        <StatsSection />
        <SpecialtiesSection />
        <DoctorsSection
          search={doctorSearch}
          doctors={doctors}
          loading={doctorsLoading}
          error={doctorsError}
        />
        <WhySection />
        <AssistantSection />
        <FaqSection />
      </main>
      <PatientHomeFooter />
      {ratingAppointment && (
        <RatingPopup
          key={ratingAppointment.id}
          appointment={ratingAppointment}
          remainingCount={ratingAppointments.length}
          onSubmit={handleRatingSubmit}
          onSkip={handleRatingSkip}
        />
      )}
    </div>
  );
}
