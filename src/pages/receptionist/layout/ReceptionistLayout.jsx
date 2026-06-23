import { useEffect, useRef, useState } from "react";
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  CalendarCheck,
  CalendarPlus,
  Home,
  LogOut,
  Menu,
  Pencil,
  Plus,
  Stethoscope,
  UsersRound,
  X,
} from "lucide-react";
import asideLogo from "../../../assets/aside.png";
import defaultReceptionistAvatar from "../../../assets/patient departement/default-patient-avatar.svg";
import LogoutConfirmModal from "../../../components/LogoutConfirmModal";
import { clearAuthSession } from "../../../services/authApi";
import {
  getCurrentAuthUser,
  getCurrentUser,
  updateCurrentUserPhoto,
} from "../../../services/medilinkApi";
import { getPatientFileSizeError } from "../../../utils/patientFileValidation";

const navItems = [
  { label: "لوحة التحكم", icon: Home, to: "/receptionist/dashboard" },
  { label: "المرضى", icon: UsersRound, to: "/receptionist/patients" },
  { label: "الأطباء", icon: Stethoscope, to: "/receptionist/doctors" },
  { label: "تفاصيل الحجوزات", icon: CalendarPlus, to: "/receptionist/appointments" },
  { label: "المواعيد", icon: CalendarCheck, to: "/receptionist/schedule" },
];

function getAuthUserDisplayName(user, fallback = "موظف الاستقبال") {
  const profile =
    user?.profile ||
    user?.receptionist ||
    user?.user ||
    user;

  return (
    profile?.name ||
    [profile?.firstName, profile?.lastName].filter(Boolean).join(" ").trim() ||
    user?.name ||
    [user?.firstName, user?.lastName].filter(Boolean).join(" ").trim() ||
    fallback
  );
}

function getAuthUserPhoto(user) {
  const profile =
    user?.profile ||
    user?.receptionist ||
    user?.user ||
    user;

  return profile?.photo || user?.photo || "";
}

function saveCurrentUserToSession(updatedUser) {
  const currentUser = getCurrentAuthUser() || {};
  const nextUser = {
    ...currentUser,
    ...updatedUser,
    photo: getAuthUserPhoto(updatedUser) || "",
  };

  localStorage.setItem("medilinkUser", JSON.stringify(nextUser));
  window.dispatchEvent(
    new CustomEvent("medilink-user-updated", { detail: nextUser }),
  );

  return nextUser;
}

export default function ReceptionistLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div
      dir="rtl"
      className="min-h-screen bg-[#f6fbfc] text-[#27343a] dark:bg-[#2e2e2e] dark:text-white"
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
  const fileInputRef = useRef(null);
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false);
  const [user, setUser] = useState(() => getCurrentAuthUser() || {});
  const [profilePhoto, setProfilePhoto] = useState(
    () => getAuthUserPhoto(getCurrentAuthUser()) || defaultReceptionistAvatar,
  );
  const [photoUploading, setPhotoUploading] = useState(false);
  const displayName = getAuthUserDisplayName(user);

  useEffect(() => {
    let mounted = true;

    getCurrentUser()
      .then((currentUser) => {
        if (!mounted) return;

        const nextUser = saveCurrentUserToSession(currentUser);
        setUser(nextUser);
        setProfilePhoto(getAuthUserPhoto(nextUser) || defaultReceptionistAvatar);
      })
      .catch(() => {
        if (mounted) {
          setProfilePhoto(
            getAuthUserPhoto(getCurrentAuthUser()) || defaultReceptionistAvatar,
          );
        }
      });

    const handleUserUpdated = (event) => {
      const nextUser = event.detail || getCurrentAuthUser() || {};
      setUser(nextUser);
      setProfilePhoto(getAuthUserPhoto(nextUser) || defaultReceptionistAvatar);
    };

    window.addEventListener("medilink-user-updated", handleUserUpdated);

    return () => {
      mounted = false;
      window.removeEventListener("medilink-user-updated", handleUserUpdated);
    };
  }, []);

  const handleLogout = () => {
    clearAuthSession();
    onClose?.();
    navigate("/login", { replace: true });
  };

  const handleAddPatientBooking = () => {
    onClose?.();
    navigate("/receptionist/book");
  };

  const handlePhotoChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const sizeError = getPatientFileSizeError(file, "صورة البروفايل");
    if (sizeError) {
      toast.warning(sizeError);
      event.target.value = "";
      return;
    }

    const previousPhoto = profilePhoto;
    const previewUrl = URL.createObjectURL(file);

    setProfilePhoto(previewUrl);
    setPhotoUploading(true);

    try {
      const updatedUser = await updateCurrentUserPhoto(file);
      const nextUser = saveCurrentUserToSession(updatedUser);

      setUser(nextUser);
      setProfilePhoto(getAuthUserPhoto(nextUser) || defaultReceptionistAvatar);
      toast.success("تم تحديث الصورة بنجاح");
    } catch (error) {
      setProfilePhoto(previousPhoto || defaultReceptionistAvatar);
      toast.error(error.message || "تعذر تحديث الصورة");
    } finally {
      URL.revokeObjectURL(previewUrl);
      setPhotoUploading(false);
      event.target.value = "";
    }
  };

  return (
    <>
      <aside
        className={`fixed inset-y-0 right-0 z-50 w-[min(286px,88vw)] shrink-0 overflow-hidden bg-white shadow-2xl transition-transform duration-300 dark:bg-[#3a3a3a] lg:static lg:z-auto lg:w-[286px] lg:translate-x-0 lg:shadow-[0_12px_35px_rgba(0,0,0,0.08)] ${
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

      <div className="h-full overflow-y-auto">
        <div className="relative h-[214px] overflow-visible bg-gradient-to-b from-[#0caee0] to-[#67d4cf] text-center">
          <Link
            to="/receptionist/dashboard"
            className="mx-auto flex w-fit pt-[34px]"
            aria-label="Medilink"
            onClick={onClose}
          >
            <img src={asideLogo} alt="Medilink" className="h-[38px] w-auto object-contain" />
          </Link>

          <div className="absolute bottom-0 h-[44px] w-full rounded-t-[48%] bg-white dark:bg-[#3a3a3a]" />

          <div className="absolute bottom-[-18px] left-1/2 -translate-x-1/2">
            <div className="h-[116px] w-[116px] overflow-hidden rounded-full bg-white ring-[5px] ring-white dark:bg-[#505050] dark:ring-[#3a3a3a]">
              <img
                src={profilePhoto}
                alt={displayName}
                className="h-full w-full object-cover object-top"
              />
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handlePhotoChange}
            />
            <button
              type="button"
              aria-label="تغيير الصورة"
              title="تغيير الصورة"
              disabled={photoUploading}
              className="absolute bottom-[7px] left-[2px] grid h-[31px] w-[31px] place-items-center rounded-full bg-white text-[#24b9d6] shadow-[0_8px_18px_rgba(31,71,82,0.22)] ring-[3px] ring-white transition hover:scale-105 disabled:cursor-wait disabled:opacity-70 dark:bg-[#505050] dark:ring-[#3a3a3a]"
              onClick={() => fileInputRef.current?.click()}
            >
              <Pencil size={15} strokeWidth={2} />
            </button>
            <span className="absolute bottom-[14px] right-[7px] h-[17px] w-[17px] rounded-full bg-[#24c874] ring-[4px] ring-white dark:ring-[#3a3a3a]" />
          </div>
        </div>

        <div className="mt-[20px] text-center">
          <h2 className="text-[16px] font-bold leading-6 text-[#333] dark:text-white">
            {displayName}
          </h2>
          <p className="mt-1 text-[11px] leading-4 text-[#8d8d8d] dark:text-gray-300">
            موظف استقبال
          </p>
        </div>

        <div className="mt-[14px] flex justify-center">
          <button
            type="button"
            className="flex h-[34px] min-w-[132px] items-center justify-center gap-2 rounded-[7px] bg-gradient-to-l from-[#67d2cb] to-[#0fb8e8] px-4 text-[12px] font-bold text-white shadow-[0_8px_18px_rgba(18,184,220,0.24)] transition hover:brightness-105"
            onClick={handleAddPatientBooking}
          >
            <Plus size={15} strokeWidth={2} />
            <span>إضافة مريض</span>
          </button>
        </div>

        <nav className="mt-[25px] space-y-[17px] px-[34px] text-[16px] font-bold">
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
            onClick={() => setLogoutConfirmOpen(true)}
            className="flex h-[42px] w-full items-center justify-start gap-[20px] rounded-xl px-0 text-[#ff7373]"
          >
            <LogOut size={23} strokeWidth={1.8} />
            <span>تسجيل الخروج</span>
          </button>
        </nav>
      </div>
      </aside>
      <LogoutConfirmModal
        open={logoutConfirmOpen}
        onCancel={() => setLogoutConfirmOpen(false)}
        onConfirm={handleLogout}
      />
    </>
  );
}

function SideItem({ icon: Icon, label, to, onClick }) {
  const location = useLocation();
  const isKnownPage = [
    "/receptionist/dashboard",
    "/receptionist/patients",
    "/receptionist/doctors",
    "/receptionist/appointments",
    "/receptionist/schedule",
  ].includes(to);
  const target = isKnownPage ? to : "/receptionist/dashboard";
  const isCurrent =
    location.pathname === to ||
    location.pathname.startsWith(`${to}/`) ||
    (!isKnownPage && location.pathname === target && label === "لوحة التحكم");

  const className = `flex h-[42px] items-center justify-start gap-[20px] rounded-xl px-0 transition ${
    isCurrent
      ? "text-[#24b9d6]"
      : "text-[#b6b6b6] hover:text-[#24b9d6] dark:text-gray-300"
  }`;

  return (
    <NavLink
      to={target}
      end
      onClick={onClick}
      className={className}
    >
      <Icon size={23} strokeWidth={1.8} />
      <span className="whitespace-nowrap">{label}</span>
    </NavLink>
  );
}
