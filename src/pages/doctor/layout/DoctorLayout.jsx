import { useMemo, useState } from "react";
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { Home, LogOut, Menu, Stethoscope, UsersRound, X } from "lucide-react";
import asideLogo from "../../../assets/aside.png";
import doctorAvatar from "../../../assets/landingPage/doctor1.png";
import currentPatientAvatar from "../../../assets/landingPage/admin.png";
import patientAvatarOne from "../../../assets/landingPage/12 1.png";
import patientAvatarTwo from "../../../assets/landingPage/12 1 (1).png";
import { clearAuthSession } from "../../../services/authApi";

const navItems = [
  { label: "لوحة التحكم", icon: Home, to: "/doctor/dashboard" },
  { label: "المواعيد", icon: UsersRound, to: "/doctor/appointments" },
  { label: "المرضى", icon: Stethoscope, to: "/doctor/patients" },
];

const waitingList = [
  {
    id: 5,
    name: "أحمد الألفي",
    time: "4:00 م - 3:30 م",
    status: "الآن",
    statusTone: "now",
    image: currentPatientAvatar,
    current: true,
  },
  {
    id: 6,
    name: "خليل محمد",
    time: "5:00 م - 4:30 م",
    status: "التالي",
    statusTone: "soon",
    image: patientAvatarOne,
  },
  {
    id: 7,
    name: "يمنى علاء",
    time: "5:30 م - 5:00 م",
    status: "التالي",
    statusTone: "soon",
    image: patientAvatarTwo,
  },
];

export default function DoctorLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div
      dir="rtl"
      className="min-h-screen bg-white text-[#333] dark:bg-[#2e2e2e] dark:text-white"
    >
      <div className="flex min-h-screen">
        {isSidebarOpen && (
          <button
            type="button"
            aria-label="إغلاق القائمة"
            className="fixed inset-0 z-40 bg-black/45 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        <Sidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />

        <main className="min-w-0 flex-1">
          <button
            type="button"
            aria-label="فتح القائمة"
            className="fixed right-4 top-4 z-30 rounded-lg bg-white p-2 text-gray-700 shadow-md dark:bg-[#454545] dark:text-white lg:hidden"
            onClick={() => setIsSidebarOpen(true)}
          >
            <Menu size={24} />
          </button>

          <Outlet />
        </main>
      </div>
    </div>
  );
}

function Sidebar({ isOpen, onClose }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    clearAuthSession();
    onClose?.();
    navigate("/login", { replace: true });
  };

  return (
    <aside
      className={`fixed inset-y-0 right-0 z-50 w-[min(300px,88vw)] shrink-0 overflow-hidden bg-white shadow-2xl transition-transform duration-300 dark:bg-[#3a3a3a] lg:static lg:z-auto lg:w-[300px] lg:translate-x-0 lg:shadow-[0_12px_35px_rgba(0,0,0,0.08)] ${
        isOpen ? "translate-x-0" : "translate-x-full lg:translate-x-0"
      }`}
    >
      <button
        type="button"
        aria-label="إغلاق القائمة"
        className="absolute left-4 top-4 rounded-lg p-2 text-white hover:bg-white/15 lg:hidden"
        onClick={onClose}
      >
        <X />
      </button>

      <div className="h-full flex flex-col overflow-y-auto">
        <DoctorBadge onClose={onClose} />
        <MainNav onClose={onClose} onLogout={handleLogout} />
        <WaitingList onClose={onClose} />
      </div>
    </aside>
  );
}

function DoctorBadge({ onClose }) {
  return (
    <>
      <div className="relative h-[227px] overflow-visible bg-gradient-to-b from-[#0caee0] to-[#63d0ca] text-center">
        <Link
          to="/doctor"
          className="mx-auto flex w-fit pt-[43px]"
          aria-label="Medilink"
          onClick={onClose}
        >
          <img src={asideLogo} alt="Medilink" className="h-[42px] w-auto object-contain" />
        </Link>

        <div className="absolute bottom-0 h-[46px] w-full rounded-t-[48%] bg-white dark:bg-[#3a3a3a]" />

        <div className="absolute bottom-[-16px] left-1/2 -translate-x-1/2">
          <div className="h-[130px] w-[130px] overflow-hidden rounded-full bg-white ring-[5px] ring-white dark:bg-[#505050] dark:ring-[#3a3a3a]">
            <img
              src={doctorAvatar}
              alt="د. توفيق عبد الله"
              className="h-full w-full object-cover object-top"
            />
          </div>
          <span className="absolute bottom-[20px] right-[10px] h-[18px] w-[18px] rounded-full bg-[#25c976] ring-[4px] ring-white dark:ring-[#3a3a3a]" />
        </div>
      </div>

      <div className="mt-[17px] text-center">
        <h2 className="text-[17px] font-bold leading-6 text-[#333] dark:text-white">
          توفيق عبد الله
        </h2>
        <p className="mt-1 text-[12px] leading-4 text-[#8d8d8d] dark:text-gray-300">
          طبيب
        </p>
      </div>
    </>
  );
}

function MainNav({ onClose, onLogout }) {
  return (
    <nav className="mt-[35px] space-y-[20px] px-[42px] text-[18px] font-bold">
      {navItems.map((item) => (
        <SideItem
          key={`${item.label}-${item.to}`}
          {...item}
          onClick={onClose}
        />
      ))}

      <div className="mx-auto h-px w-full bg-[#eeeeee] dark:bg-white/15" />

      <button
        type="button"
        onClick={onLogout}
        className="flex h-[42px] w-full items-center justify-start gap-[22px] rounded-xl px-0 text-[#ff8383]"
      >
        <LogOut size={25} strokeWidth={1.8} />
        <span>تسجيل الخروج</span>
      </button>
    </nav>
  );
}

function SideItem({ icon: Icon, label, to, onClick }) {
  return (
    <NavLink
      to={to}
      end={to === "/doctor/dashboard"}
      onClick={onClick}
      className={({ isActive }) =>
        `flex h-[42px] items-center justify-start gap-[22px] rounded-xl px-0 transition ${
          isActive
            ? "text-[#30bfd6]"
            : "text-[#b8b8b8] hover:text-[#30bfd6] dark:text-gray-300"
        }`
      }
    >
      <Icon size={25} strokeWidth={1.8} />
      <span className="whitespace-nowrap">{label}</span>
    </NavLink>
  );
}

function WaitingList({ onClose }) {
  return (
    <section className="mt-[88px] px-[24px] pb-8">
      <div className="flex items-center justify-between text-[14px] font-bold text-[#333] dark:text-white">
        <h3>قائمة الإنتظار</h3>
        <span className="font-medium">باقي : 2</span>
      </div>

      <div className="mt-[20px] space-y-[10px]">
        {waitingList.map((item) => (
          <WaitingItem key={`${item.name}-${item.time}`} item={item} onClose={onClose} />
        ))}
      </div>
    </section>
  );
}

function WaitingItem({ item, onClose }) {
  const location = useLocation();
  const navigate = useNavigate();
  const isInExamination = useMemo(
    () =>
      location.pathname.startsWith(`/doctor/patients/${item.id}/profile`) &&
      location.state?.startExam === true,
    [item.id, location.pathname, location.state],
  );
  const toneClass =
    item.statusTone === "now"
      ? "bg-[#dff8f5] text-[#24b7a6] dark:bg-[#1d5f59] dark:text-[#8ff2e8]"
      : "bg-[#fff1cd] text-[#d79a16] dark:bg-[#5a4515] dark:text-[#ffd36f]";

  const openExamination = () => {
    navigate(`/doctor/patients/${item.id}/profile`, { state: { startExam: true } });
    onClose();
  };

  if (item.current) {
    return (
      <article className="rounded-[8px] bg-[#effcfc] px-[14px] py-[14px] dark:bg-[#24484b]">
        <div className="grid grid-cols-[42px_minmax(0,1fr)_36px] items-center gap-[10px]">
          <img
            src={item.image}
            alt={item.name}
            className="h-[42px] w-[42px] rounded-full object-cover"
          />
          <div className="min-w-0 text-right">
            <h4 className="truncate text-[15px] font-bold leading-5 text-[#333] dark:text-white">
              {item.name}
            </h4>
            <p className="mt-[2px] truncate text-[12px] leading-4 text-[#555] dark:text-gray-300">
              {item.time}
            </p>
          </div>
          <span className={`grid h-[25px] place-items-center rounded-[7px] text-[11px] font-bold ${toneClass}`}>
            الآن
          </span>
        </div>

        <button
          type="button"
          className={`mt-[12px] h-[52px] w-full rounded-[8px] text-[17px] font-semibold shadow-sm transition ${
            isInExamination
              ? "border-2 border-[#969696] bg-transparent text-[#9a9a9a] hover:border-[#7f7f7f] hover:text-[#808080] dark:border-[#b8c0c2] dark:text-[#d3dada] dark:hover:text-white"
              : "bg-gradient-to-l from-[#67cbc5] to-[#08ace0] text-white hover:brightness-105"
          }`}
          onClick={openExamination}
        >
          {isInExamination ? "يتم الكشف الآن" : "بدء الكشف"}
        </button>
      </article>
    );
  }

  return (
    <article className="grid h-[73px] grid-cols-[42px_minmax(0,1fr)_42px] items-center gap-[9px] rounded-[8px] bg-[#fffdf7] px-[12px] dark:bg-[#484235]">
      <img
        src={item.image}
        alt={item.name}
        className="h-[42px] w-[42px] rounded-full object-cover"
      />
      <div className="min-w-0 text-right">
        <h4 className="truncate text-[15px] font-bold leading-5 text-[#969696] dark:text-gray-200">
          {item.name}
        </h4>
        <p className="mt-[2px] truncate text-[12px] leading-4 text-[#9b9b9b] dark:text-gray-300">
          {item.time}
        </p>
      </div>
      <span className={`grid h-[25px] place-items-center rounded-[7px] text-[11px] font-bold ${toneClass}`}>
        {item.status}
      </span>
    </article>
  );
}
