import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  Bot,
  CalendarCheck,
  ChevronDown,
  ChevronUp,
  CircleMinus,
  CirclePlus,
  Cross,
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
import ThemeLogo from "../../components/ThemeLogo";
import avatar from "../../assets/patient departement/default-patient-avatar.svg";
import heroDoctor from "../../assets/patient departement/Group 623 (3).png";
import specialtyTooth from "../../assets/landingPage/lets-icons_tooth-light.png";
import specialtyStomach from "../../assets/landingPage/healthicons_stomach-outline.png";
import specialtyChild from "../../assets/landingPage/hugeicons_kid.png";
import specialtySkin from "../../assets/landingPage/streamline-ultimate_hair-skin.png";
import specialtyNose from "../../assets/landingPage/healthicons_nose-outline.png";
import specialtyBrain from "../../assets/landingPage/Vector.png";
import specialtyEye from "../../assets/landingPage/vaadin_eye.png";
import doctor1 from "../../assets/landingPage/12 1.png";
import featureDoctor from "../../assets/landingPage/8.png";
import featureBooking from "../../assets/landingPage/9.png";
import featureAi from "../../assets/landingPage/10.png";
import featureSecurity from "../../assets/landingPage/11.png";
import searchDoctorIcon from "../../assets/landingPage/13(1).png";
import specialtyIcon from "../../assets/landingPage/13 (2).png";
import appointmentIcon from "../../assets/landingPage/13 (3).png";
import { clearAuthSession } from "../../services/authApi";
import {
  getCurrentAuthUser,
  getCurrentUser,
} from "../../services/medilinkApi";
import { getDoctorImage, getDoctorName, getDoctorRating, useDoctors } from "../../hooks/useDoctors";

const gradient = "bg-linear-to-b from-[#05ADE8] to-[#6CCCC8]";
const sectionClass = "mx-auto w-full max-w-[1280px] px-4 sm:px-6 lg:px-10";

const specialties = [
  { label: "الفم والأسنان", image: specialtyTooth },
  { label: "الباطنة", image: specialtyStomach },
  { label: "الأطفال", image: specialtyChild },
  { label: "الجلدية والتجميل", image: specialtySkin },
  { label: "أنف وأذن", image: specialtyNose },
  { label: "مخ وأعصاب", image: specialtyBrain },
  { label: "العيون", image: specialtyEye },
];

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

export function PatientHomeHeader() {
  const navigate = useNavigate();
  const { patientId } = useParams();
  const authUser = getCurrentAuthUser();
  const [profilePhoto, setProfilePhoto] = useState(
    authUser?.photo || avatar,
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
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [accountDetailsOpen, setAccountDetailsOpen] = useState(false);

  const mobileLinks = [
    { href: patientHomePath, label: "الرئيسية", route: true },
    { href: "/patient/doctors", label: "المواعيد", route: true },
    { href: "#assistant", label: "مساعد AI" },
    { href: "#contact", label: "تواصل معنا" },
  ];

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
    };

    document.addEventListener("pointerdown", handleOutsideClick);
    return () => document.removeEventListener("pointerdown", handleOutsideClick);
  }, []);

  useEffect(() => {
    let mounted = true;

    getCurrentUser()
      .then((user) => {
        if (mounted && user.photo) setProfilePhoto(user.photo);
      })
      .catch(() => null);

    const handleUserUpdated = (event) => {
      const user = event.detail || getCurrentAuthUser() || {};
      setProfilePhoto(user.photo || avatar);
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

  return (
    <header className="sticky top-0 z-30 mx-auto grid min-h-[76px] w-[calc(100%_-_24px)] max-w-[1280px] grid-cols-[auto_1fr_auto] items-center gap-4 rounded-b-2xl bg-white/95 px-4 shadow-[0_4px_14px_rgba(0,0,0,0.08)] backdrop-blur-xl dark:bg-[#343434]/95 sm:w-[calc(100%_-_48px)] sm:px-6 lg:min-h-[88px] lg:px-8">
      <Link to={patientHomePath} className="justify-self-start" aria-label="MediLink">
        <ThemeLogo className="w-28 object-contain sm:w-36" />
      </Link>

      <nav className="hidden items-center justify-center gap-8 text-sm font-semibold text-[#343434] dark:text-[#F0F0F0] md:flex lg:gap-12 lg:text-lg">
        <Link to={patientHomePath} className="transition hover:text-[#05ADE8]">الرئيسية</Link>
        <Link to="/patient/doctors" className="transition hover:text-[#05ADE8]">المواعيد</Link>
        <a href="#assistant" className="transition hover:text-[#05ADE8]">مساعد AI</a>
        <a href="#contact" className="transition hover:text-[#05ADE8]">تواصل معنا</a>
      </nav>

      <div className="flex items-center justify-self-end gap-3">
        <button
          type="button"
          className="grid size-10 place-items-center rounded-full text-[#343434] transition hover:bg-[#05ADE8]/10 dark:text-white md:hidden"
          onClick={() => setMenuOpen((open) => !open)}
          aria-label="فتح قائمة التنقل"
          aria-expanded={menuOpen}
          aria-controls="patient-mobile-navigation"
        >
          {menuOpen ? <X size={25} /> : <Menu size={27} />}
        </button>
        <button type="button" className="grid size-10 place-items-center rounded-full text-[#343434] transition hover:bg-[#05ADE8]/10 dark:text-white" aria-label="بحث">
          <Search size={27} strokeWidth={1.8} />
        </button>
        <div ref={profileMenuRef} className="relative">
          <button
            type="button"
            className="block rounded-full ring-[#05ADE8] transition hover:ring-2 focus-visible:outline-none focus-visible:ring-2"
            onClick={() => {
              setProfileOpen((open) => !open);
              setMenuOpen(false);
            }}
            aria-label="فتح قائمة الحساب"
            aria-expanded={profileOpen}
            aria-controls="patient-profile-menu"
          >
            <img src={profilePhoto} alt="صورة الحساب" className="size-10 rounded-full object-cover sm:size-11" />
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
              className="flex w-full items-center gap-3 rounded-md px-2 py-3 text-[#333333] transition hover:bg-[#F7F7F7] dark:text-[#F0F0F0] dark:hover:bg-white/5"
              onClick={() => {
                setProfileOpen(false);
                navigate(`/patient/${encodeURIComponent(currentPatientId)}/profile/edit`);
              }}
            >
              <Settings size={23} strokeWidth={1.8} />
              <span className="text-lg font-medium">تعديل البيانات</span>
            </button>

            <div className="border-t border-[#E7E7E7] dark:border-[#555555]" />

            <button
              type="button"
              className="flex w-full items-center gap-3 rounded-md px-2 py-3 text-[#D92727] transition hover:bg-red-50 dark:hover:bg-red-950/20"
              onClick={handleLogout}
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
        }`}
      >
        <nav className="flex flex-col p-2" aria-label="قائمة التنقل للموبايل">
          {mobileLinks.map((link) =>
            link.route ? (
              <Link
                key={link.href}
                to={link.href}
                className="rounded-lg px-4 py-3 text-right text-base font-semibold text-[#343434] transition hover:bg-[#05ADE8]/10 hover:text-[#05ADE8] dark:text-[#F0F0F0]"
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
    </header>
  );
}

function HeroSection({ patientName }) {
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
              <p className="text-lg font-medium text-[#505050] dark:text-[#F0F0F0]">لديك موعد قادم اليوم</p>
              <p className="mt-1 font-bold text-[#333333] dark:text-white">الساعة: 4:00 مساءً</p>
              <p className="mt-1 text-sm font-semibold text-[#4F4F4F] dark:text-[#D5D5D5]">مع د. ندى حسين</p>
            </div>
            <div className="relative shrink-0">
              <span className="absolute -right-2 top-1 size-3 rounded-full bg-[#2164AE]" />
              <img src={doctor1} alt="د. ندى حسين" className="h-24 w-28 object-contain sm:h-28 sm:w-32" />
            </div>
          </article>

          <div className="mt-7 grid grid-cols-2 gap-3">
            <Link to="/patient/doctors" className={`inline-flex min-h-12 items-center justify-center rounded-lg ${gradient} px-4 font-semibold text-white`}>حجز موعد جديد</Link>
            <button type="button" className="min-h-12 rounded-lg border-2 border-[#05ADE8] bg-transparent px-4 font-semibold text-[#05ADE8]">تصفح الأطباء</button>
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
        <button type="button" className="absolute -top-5 right-0 grid size-12 place-items-center rounded-full bg-[#28B8D5] text-white shadow-lg sm:-right-2" aria-label="فتح المساعد">
          <Bot size={25} />
        </button>
      </div>
    </section>
  );
}

function SpecialtiesSection() {
  return (
    <section className={`${sectionClass} py-16`}>
      <h2 className="text-center text-3xl font-semibold text-[#333333] dark:text-[#F0F0F0]">التخصصات</h2>
      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7">
        {specialties.map((item) => (
          <button key={item.label} type="button" className="flex min-h-32 flex-col items-center justify-center rounded-lg bg-white p-4 text-center shadow-[0_4px_18px_rgba(0,0,0,0.12)] transition hover:-translate-y-1 dark:bg-[#383838] dark:shadow-[0_8px_24px_rgba(0,0,0,0.25)]">
            <img src={item.image} alt="" className="mb-3 size-12 object-contain" />
            <span className="text-sm font-semibold text-[#333333] dark:text-[#F0F0F0]">{item.label}</span>
          </button>
        ))}
      </div>
    </section>
  );
}

function DoctorsSection() {
  const { doctors, loading, error } = useDoctors();
  const visibleDoctors = doctors.slice(0, 8);

  return (
    <section id="doctors" className={`${sectionClass} pb-16`}>
      <h2 className="text-center text-3xl font-semibold text-[#333333] dark:text-[#F0F0F0]">الأطباء</h2>
      <p className="mt-2 text-center text-[#8A8A8A] dark:text-[#C8C8C8]">فريق من أفضل الأطباء المتخصصين لخدمتكم</p>
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
              <article key={doctor.id || index} className="flex min-h-[225px] min-w-[190px] snap-start flex-col items-center rounded-lg bg-linear-to-b from-[#F0F0F0] to-white p-4 text-center shadow-[0_4px_16px_rgba(0,0,0,0.09)] dark:from-[#454545] dark:to-[#383838] sm:min-w-[205px]">
                <img src={getDoctorImage(doctor, index)} alt={getDoctorName(doctor)} className="h-28 w-full object-contain" />
                <h3 className="mt-2 text-base font-bold text-[#333333] dark:text-[#F0F0F0]">{getDoctorName(doctor)}</h3>
                <p className="mt-1 text-xs text-[#777777] dark:text-[#C7C7C7]">{doctor.specialty || "طب عام"}</p>
                <div className="mt-auto flex items-center gap-2 pt-3 text-xs text-[#555555] dark:text-[#E0E0E0]">
                  <span>{rating.toFixed(1)}</span>
                  <span className="flex gap-1 text-[#F8B400]">
                    {Array.from({ length: 5 }).map((_, starIndex) => (
                      <FaStar key={starIndex} className={starIndex < Math.round(rating) ? "" : "opacity-25"} />
                    ))}
                  </span>
                </div>
              </article>
            );
          })}
      </div>
      {!loading && !error && doctors.length > 0 && (
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
  const columns = [
    { title: "روابط سريعة", links: ["الرئيسية", "من نحن", "خدماتنا", "التخصصات", "الأطباء"] },
    { title: "خدماتنا", links: ["حجز موعد", "الاستشارات", "الملفات الطبية", "المتابعة والتنبيهات", "الدعم الفني"] },
    { title: "التخصصات", links: ["الباطنة", "الأطفال", "الجلدية", "الفم والأسنان", "المخ والأعصاب"] },
  ];

  return (
    <footer id="contact" className="bg-white shadow-[0_-8px_22px_rgba(0,0,0,0.04)] dark:bg-[#343434]">
      <div className={`${sectionClass} grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-5`}>
        <section>
          <ThemeLogo className="w-40 object-contain" />
          <p className="mt-5 max-w-[280px] text-sm leading-6 text-[#444444] dark:text-[#D7D7D7]">نظام متكامل لإدارة العيادات والمراكز الطبية وتقديم أفضل تجربة للمرضى والأطباء</p>
          <div className="mt-6 flex gap-5 text-xl text-[#26B8D6]"><FaLinkedinIn /><FaInstagram /><FaXTwitter /><FaFacebookF /></div>
        </section>

        {columns.map((column) => (
          <section key={column.title}>
            <h3 className="mb-4 font-bold text-[#333333] dark:text-[#F0F0F0]">{column.title}</h3>
            {column.links.map((link) => <a key={link} href="#home" className="mb-3 block text-sm text-[#444444] transition hover:text-[#05ADE8] dark:text-[#D7D7D7]">{link}</a>)}
          </section>
        ))}

        <section>
          <h3 className="mb-4 font-bold text-[#333333] dark:text-[#F0F0F0]">تواصل معنا</h3>
          <p className="mb-4 flex items-center gap-3 text-sm text-[#444444] dark:text-[#D7D7D7]"><Phone size={17} fill="currentColor" />015 5677 3899</p>
          <p className="mb-4 flex items-center gap-3 text-sm text-[#444444] dark:text-[#D7D7D7]"><Mail size={17} fill="currentColor" />info@medilink.com</p>
          <p className="flex items-center gap-3 text-sm text-[#444444] dark:text-[#D7D7D7]"><MapPin size={18} fill="currentColor" />القاهرة، مصر</p>
        </section>
      </div>
    </footer>
  );
}

export default function PatientHomePage() {
  const authUser = getCurrentAuthUser();
  const patient = authUser?.patient || authUser?.profile || authUser || {};
  const patientName =
    [patient.firstName, patient.lastName].filter(Boolean).join(" ").trim() ||
    patient.name ||
    "مريض ميديلينك";

  return (
    <div className="min-h-screen bg-white text-[#333333] dark:bg-[#2E2E2E] dark:text-[#F0F0F0]" dir="rtl">
      <PatientHomeHeader />
      <main>
        <HeroSection patientName={patientName} />
        <StatsSection />
        <SpecialtiesSection />
        <DoctorsSection />
        <WhySection />
        <AssistantSection />
        <FaqSection />
      </main>
      <PatientHomeFooter />
    </div>
  );
}
