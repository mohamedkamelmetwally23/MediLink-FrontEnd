import { useState } from "react";
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  Building2,
  CalendarCheck,
  Cross,
  Home,
  LogOut,
  Menu,
  Stethoscope,
  UserRoundCog,
  UsersRound,
  X,
} from "lucide-react";
import doctor from "../../../assets/landingPage/admin.png";
import { clearAuthSession } from "../../../services/authApi";
import { useUsersStore } from "../users/useUsersStore";

const navItems = [
  {
    label: "لوحة التحكم",
    icon: Home,
    to: "/admin/dashboard",
    activePaths: ["/admin/activity"],
  },
  { label: "المرضى", icon: UsersRound, to: "/admin/users" },
  { label: "الأطباء", icon: Stethoscope, to: "/admin/doctors" },
  {
    label: "موظفين الاستقبال",
    icon: UserRoundCog,
    to: "/admin/receptionists",
    activePrefix: "/admin/receptionists",
  },
  { label: "التخصصات", icon: Cross, to: "/admin/specialties" },
  { label: "المواعيد", icon: CalendarCheck, to: "/admin/appointments" },
  { label: "إدارة العيادة", icon: Building2, to: "/admin/clinic" },
];

export default function AdminLayout() {
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
  const location = useLocation();
  const navigate = useNavigate();
  const { getUser } = useUsersStore();
  const forcedActiveTo = getProfileActiveRoute(location, getUser);

  const handleLogout = () => {
    clearAuthSession();
    onClose?.();
    navigate("/login", { replace: true });
  };

  return (
    <aside
      className={`fixed inset-y-0 right-0 z-50 w-[min(292px,85vw)] shrink-0 overflow-hidden bg-white shadow-2xl transition-transform duration-300 dark:bg-[#3a3a3a] lg:static lg:z-auto lg:w-[292px] lg:translate-x-0 lg:shadow-none ${
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

      <div className="relative h-[227px] overflow-visible bg-gradient-to-b from-[#13a9d8] to-[#5acbd0] text-center">
        <Link
          to="/admin"
          className="block pt-[42px] text-[24px] font-bold leading-7 text-white"
        >
          Medilink
        </Link>

        <div className="absolute bottom-0 h-[46px] w-full rounded-t-[50%] bg-white dark:bg-[#3a3a3a]" />

        <div className="absolute bottom-[-10px] left-1/2 -translate-x-1/2">
          <div className="h-[128px] w-[128px] overflow-hidden rounded-full ring-[6px] ring-white dark:ring-[#3a3a3a]">
            <img
              src={doctor}
              alt="مدير النظام"
              className="h-full w-full object-cover"
            />
          </div>
          <span className="absolute bottom-[15px] right-[11px] h-[16px] w-[16px] rounded-full bg-[#22c55e] ring-[4px] ring-white dark:ring-[#3a3a3a]" />
        </div>
      </div>

      <div className="mt-[17px] text-center">
        <h2 className="text-[17px] font-bold leading-6 text-[#333] dark:text-white">
          د. أحمد محمد
        </h2>
        <p className="mt-1 text-[13px] leading-5 text-[#888] dark:text-gray-300">
          مدير النظام
        </p>
      </div>

      <nav className="mt-[29px] space-y-[18px] px-[38px] text-[18px] font-bold">
        {navItems.map((item) => (
          <SideItem
            key={`${item.label}-${item.to}`}
            {...item}
            forcedActiveTo={forcedActiveTo}
            onClick={onClose}
          />
        ))}

        <div className="mx-auto h-px w-[158px] bg-[#f0f0f0] dark:bg-white/20" />

        <button
          type="button"
          onClick={handleLogout}
          className="flex h-[47px] w-full items-center justify-start gap-[34px] rounded-xl px-0 text-[#ff7b7b]"
        >
          <LogOut size={27} strokeWidth={1.8} />
          <span>تسجيل الخروج</span>
        </button>
      </nav>
      </div>
    </aside>
  );
}

function getProfileActiveRoute(location, getUser) {
  if (location.pathname === "/admin/users/profile") {
    return getRoleActiveRoute(new URLSearchParams(location.search).get("role"));
  }

  const profileMatch = location.pathname.match(/^\/admin\/users\/([^/]+)\/profile$/);
  if (!profileMatch) {
    return null;
  }

  return getRoleActiveRoute(getUser(profileMatch[1])?.role);
}

function getRoleActiveRoute(role) {
  if (role === "doctor") return "/admin/doctors";
  if (role === "receptionist") return "/admin/receptionists";
  if (role === "patient") return "/admin/users";

  return null;
}

function SideItem({
  icon: Icon,
  label,
  to,
  activePaths = [],
  activePrefix,
  disableDefaultActive = false,
  forcedActiveTo,
  onClick,
}) {
  const location = useLocation();
  const isPrefixActive =
    activePrefix && location.pathname.startsWith(activePrefix);

  return (
    <NavLink
      to={to}
      end={to === "/admin/dashboard"}
      onClick={onClick}
      className={({ isActive }) =>
        {
          const isItemActive = forcedActiveTo
            ? to === forcedActiveTo
            : (!disableDefaultActive && isActive) ||
          activePaths.includes(location.pathname) ||
              isPrefixActive;

          return `relative flex h-[47px] items-center justify-start gap-[34px] rounded-xl px-0 transition ${
            isItemActive
              ? "text-[#30bfd6]"
              : "text-[#b8b8b8] hover:text-[#30bfd6] dark:text-gray-300"
          }`;
        }
      }
    >
      {({ isActive }) => {
        const isItemActive = forcedActiveTo
          ? to === forcedActiveTo
          : (!disableDefaultActive && isActive) ||
            activePaths.includes(location.pathname) ||
            isPrefixActive;

        return (
          <>
            {isItemActive && (
              <span className="absolute right-[-18px] top-1/2 h-[34px] w-[4px] -translate-y-1/2 rounded-l-full bg-[#30bfd6]" />
            )}
            <Icon size={27} strokeWidth={1.8} />
            <span className="whitespace-nowrap">{label}</span>
          </>
        );
      }}
    </NavLink>
  );
}
