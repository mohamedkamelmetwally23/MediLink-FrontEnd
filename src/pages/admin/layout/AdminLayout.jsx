import { useState } from "react";
import { Link, NavLink, Outlet } from "react-router-dom";
import {
  Building2,
  CalendarDays,
  Home,
  LogOut,
  Menu,
  Stethoscope,
  UserCog,
  Users,
  X,
} from "lucide-react";
import doctor from "../../../assets/landingPage/admin.png";

const navItems = [
  { label: "لوحة التحكم", icon: Home, to: "/admin/dashboard" },
  { label: "المستخدمون", icon: UserCog, to: "/admin/users" },
  { label: "الأطباء", icon: Stethoscope, to: "/admin/doctors" },
  { label: "التخصصات", icon: Users, to: "/admin/specialties" },
  { label: "المواعيد", icon: CalendarDays, to: "/admin/appointments" },
  { label: "إدارة العيادة", icon: Building2, to: "/admin/clinic" },
];

export default function AdminLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div
      dir="rtl"
      className="min-h-screen bg-[#f8f8f8] text-[#333] dark:bg-[#2f2f2f] dark:text-white"
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
      className={`fixed inset-y-0 right-0 z-50 w-[min(300px,85vw)] shrink-0 overflow-y-auto bg-white shadow-2xl transition-transform duration-300 dark:bg-[#3a3a3a] lg:static lg:z-auto lg:w-[300px] lg:translate-x-0 lg:shadow-none ${
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

      <div className="relative h-[227px] overflow-visible bg-gradient-to-b from-[#0fb8e8] to-[#63d5df] text-center">
        <Link to="/admin" className="block pt-10 text-xl font-bold text-white">
          Medilink
        </Link>

        <div className="absolute bottom-0 h-[46px] w-full rounded-t-[50%] bg-white dark:bg-[#3a3a3a]" />

        <div className="absolute bottom-[-30px] left-1/2 -translate-x-1/2">
          <div className="h-32 w-32 overflow-hidden rounded-full ring-8 ring-white dark:ring-[#3a3a3a]">
            <img src={doctor} alt="مدير النظام" className="h-full w-full object-cover" />
          </div>
          <span className="absolute bottom-7 right-1 h-4 w-4 rounded-full bg-emerald-500 ring-4 ring-white dark:ring-[#3a3a3a]" />
        </div>
      </div>

      <div className="mt-16 text-center">
        <h2 className="text-lg font-bold">د. أحمد محمد</h2>
        <p className="text-sm text-gray-500 dark:text-gray-300">مدير النظام</p>
      </div>

      <nav className="mt-10 space-y-3 px-8 text-lg font-bold">
        {navItems.map((item) => (
          <SideItem key={item.to} {...item} onClick={onClose} />
        ))}

        <div className="my-5 h-px bg-gray-200 dark:bg-white/20" />

        <button
          type="button"
          className="flex w-full items-center justify-between rounded-xl px-3 py-3 text-red-400"
        >
          <span>تسجيل الخروج</span>
          <LogOut size={26} />
        </button>
      </nav>
    </aside>
  );
}

 function SideItem({ icon: Icon, label, to, onClick }) {
  return (
    <NavLink
      to={to}
      end={to === "/admin"}
      onClick={onClick}
      className={({ isActive }) =>
        `relative flex items-center justify-start gap-12 rounded-xl px-3 py-3 transition ${
          isActive
            ? "text-cyan-400"
            : "text-gray-400 hover:text-cyan-500 dark:text-gray-300"
        }`
      }
    >
      {({ isActive }) => (
        <>
          {isActive && (
            <span className="absolute -right-8 rotate-180 h-14 w-2 rounded-r-xl bg-cyan-400" />
          )}
          <Icon size={26} />
          <span>{label}</span>
        </>
      )}
    </NavLink>
  );
}
