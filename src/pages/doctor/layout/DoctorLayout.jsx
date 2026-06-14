import { useState } from "react";
import { Link, NavLink, Outlet } from "react-router-dom";
import {
  Home,
  LogOut,
  Menu,
  Stethoscope,
  UsersRound,
  X,
} from "lucide-react";
import doctorAvatar from "../../../assets/landingPage/admin.png";
import patientAvatarOne from "../../../assets/landingPage/12 1.png";
import patientAvatarTwo from "../../../assets/landingPage/12 1 (1).png";
import patientAvatarThree from "../../../assets/landingPage/12 1 (2).png";

const navItems = [
  { label: "لوحة التحكم", icon: Home, to: "/doctor/dashboard" },
  { label: "المواعيد", icon: UsersRound, to: "/doctor/appointments" },
  { label: "المرضى", icon: Stethoscope, to: "/doctor/patients" },
];

const waitingList = [
  {
    name: "أحمد الفقي",
    time: "4:00 م - 3:30 م",
    status: "الآن",
    statusTone: "now",
    image: doctorAvatar,
  },
  {
    name: "خليل محمد",
    time: "4:30 م - 4:00 م",
    status: "قادم",
    statusTone: "soon",
    image: patientAvatarOne,
  },
  {
    name: "بني علي",
    time: "5:30 م - 5:00 م",
    status: "قادم",
    statusTone: "soon",
    image: patientAvatarTwo,
  },
  {
    name: "على محمود",
    time: "6:00 م - 5:30 م",
    status: "قادم",
    statusTone: "soon",
    image: patientAvatarThree,
  },
];

export default function DoctorLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div
      dir="rtl"
      className="min-h-screen bg-[#f8fbfc] text-[#333] dark:bg-[#2f2f2f] dark:text-white"
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
  return (
    <aside
      className={`fixed inset-y-0 right-0 z-50 w-[min(260px,85vw)] shrink-0 overflow-y-auto bg-white shadow-2xl transition-transform duration-300 dark:bg-[#3a3a3a] lg:static lg:z-auto lg:w-[244px] lg:translate-x-0 lg:shadow-none ${
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

      <div className="relative h-[197px] overflow-visible bg-gradient-to-b from-[#13a9d8] to-[#5ccfd3] text-center">
        <Link
          to="/doctor"
          className="block pt-[35px] text-[17px] font-bold leading-6 text-white"
          onClick={onClose}
        >
          Medilink
        </Link>

        <div className="absolute bottom-0 h-[36px] w-full rounded-t-[50%] bg-white dark:bg-[#3a3a3a]" />

        <div className="absolute bottom-[-2px] left-1/2 -translate-x-1/2">
          <div className="h-[94px] w-[94px] overflow-hidden rounded-full ring-[5px] ring-white dark:ring-[#3a3a3a]">
            <img
              src={doctorAvatar}
              alt="د. توفيق عبد الله"
              className="h-full w-full object-cover"
            />
          </div>
          <span className="absolute bottom-[12px] right-[4px] h-[13px] w-[13px] rounded-full bg-[#22c55e] ring-[3px] ring-white dark:ring-[#3a3a3a]" />
        </div>
      </div>

      <div className="mt-[14px] text-center">
        <h2 className="text-[14px] font-bold leading-5 text-[#333] dark:text-white">
          د. توفيق عبد الله
        </h2>
        <p className="mt-1 text-[10px] leading-4 text-[#888] dark:text-gray-300">
          طبيب
        </p>
      </div>

      <nav className="mt-[27px] space-y-[16px] px-[38px] text-[14px] font-bold">
        {navItems.map((item) => (
          <SideItem
            key={`${item.label}-${item.to}`}
            {...item}
            onClick={onClose}
          />
        ))}

        <div className="mx-auto h-px w-full bg-[#f0f0f0] dark:bg-white/20" />

        <button
          type="button"
          className="flex h-[36px] w-full items-center justify-start gap-[22px] rounded-xl px-0 text-[#ff7b7b]"
        >
          <LogOut size={21} strokeWidth={1.8} />
          <span>تسجيل الخروج</span>
        </button>
      </nav>

      <WaitingList />
    </aside>
  );
}

function SideItem({ icon: Icon, label, to, onClick }) {
  return (
    <NavLink
      to={to}
      end={to === "/doctor/dashboard"}
      onClick={onClick}
      className={({ isActive }) =>
        `flex h-[36px] items-center justify-start gap-[22px] rounded-xl px-0 transition ${
          isActive
            ? "text-[#30bfd6]"
            : "text-[#b8b8b8] hover:text-[#30bfd6] dark:text-gray-300"
        }`
      }
    >
      <Icon size={21} strokeWidth={1.8} />
      <span className="whitespace-nowrap">{label}</span>
    </NavLink>
  );
}

function WaitingList() {
  return (
    <section className="mt-[42px] border-t border-[#f0f0f0] px-[20px] pt-[17px] dark:border-white/20">
      <div className="flex items-center justify-between text-[12px] font-bold text-[#333] dark:text-white">
        <h3>قائمة الإنتظار</h3>
        <span>باقي : 2</span>
      </div>

      <div className="mt-[15px] space-y-[13px]">
        {waitingList.map((item) => (
          <WaitingItem key={`${item.name}-${item.time}`} item={item} />
        ))}
      </div>
    </section>
  );
}

function WaitingItem({ item }) {
  const toneClass =
    item.statusTone === "now"
      ? "bg-[#dff8f5] text-[#24b7a6]"
      : "bg-[#fff1cd] text-[#d79a16]";

  return (
    <article className="grid h-[50px] grid-cols-[34px_minmax(0,1fr)_46px] items-center gap-[8px]">
      <img
        src={item.image}
        alt={item.name}
        className="h-[34px] w-[34px] rounded-full object-cover"
      />
      <div className="min-w-0 text-right">
        <h4 className="truncate text-[11px] font-bold leading-4 text-[#333] dark:text-white">
          {item.name}
        </h4>
        <p className="mt-[2px] truncate text-[9px] leading-3 text-[#969696] dark:text-gray-300">
          {item.time}
        </p>
      </div>
      <span
        className={`grid h-[24px] place-items-center rounded-[6px] text-[9px] font-bold ${toneClass}`}
      >
        {item.status}
      </span>
    </article>
  );
}
