import { Link } from "react-router-dom";
import { toast } from "react-toastify";

const links = [
  { href: "#home", label: "الرئيسية" },
  { href: "#features", label: "المميزات" },
  { href: "#specialties", label: "التخصصات" },
  { href: "#doctors", label: "الأطباء" },
  { href: "#contact", label: "تواصل معنا" },
];

export default function Navbar() {
  const handleNavClick = (label) => {
    toast.info(`تم الانتقال إلى ${label}`, { autoClose: 1200 });
  };

  return (
    <header className="navbar mx-auto max-w-7xl px-3 sm:px-5 lg:px-8">
      <div className="navbar-start min-w-0">
        <div className="dropdown lg:hidden">
          <button tabIndex={0} className="btn btn-ghost btn-square" aria-label="فتح القائمة">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="size-6 text-black dark:text-white"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
              />
            </svg>
          </button>

          <ul
            tabIndex={0}
            className="menu dropdown-content z-[1001] mt-3 w-56 rounded-box bg-white p-2 text-sm shadow dark:bg-[#252525] dark:text-[#F0F0F0]"
          >
            {links.map((link) => (
              <li key={link.href}>
                <a href={link.href} onClick={() => handleNavClick(link.label)}>
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <Link to="/" className="truncate text-xl font-bold text-sky-600 sm:text-2xl">
          MediLink
        </Link>
      </div>

      <nav className="navbar-center hidden lg:flex">
        <ul className="menu menu-horizontal gap-1 px-1 text-base font-semibold xl:text-lg">
          {links.map((link) => (
            <li key={link.href}>
              <a href={link.href} onClick={() => handleNavClick(link.label)}>
                {link.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <div className="navbar-end gap-2">
        <Link
          to="/register"
          className="btn btn-sm border-none bg-linear-to-r from-[#05ADE8] to-[#6CCCC8] text-white outline-none dark:text-black sm:px-5 md:btn-md"
        >
          حساب جديد
        </Link>

        <Link to="/login" className="btn btn-outline btn-info btn-sm sm:px-5 md:btn-md">
          دخول
        </Link>
      </div>
    </header>
  );
}
