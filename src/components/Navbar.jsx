import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <div className="navbar px-1 md:px-6">
      <div className="navbar-start">
        <div className="dropdown md:hidden">
          <label tabIndex={0} className="btn btn-ghost">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="size-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
              />
            </svg>
          </label>

          <ul
            tabIndex={0}
            className="menu dropdown-content mt-3 z-[1001] p-1 shadow bg-base-100 rounded-box w-52"
          >
            <li>
              <a href="#home">الرئيسية</a>
            </li>
            <li>
              <a href="#features">المميزات</a>
            </li>
            <li>
              <a href="#specialties">التخصصات</a>
            </li>
            <li>
              <a href="#about">من نحن</a>
            </li>
            <li>
              <a href="#contact">تواصل معنا</a>
            </li>
          </ul>
        </div>

        <Link to="/" className="text-2xl font-bold text-sky-600">
          MediLink
        </Link>
      </div>

      <div className="navbar-center hidden md:flex">
        <ul className="menu menu-horizontal font-semibold md:text-xl px-1 gap-1">
          <li>
            <a href="#home">الرئيسية</a>
          </li>
          <li>
            <a href="#features">المميزات</a>
          </li>
          <li>
            <a href="#specialties">التخصصات</a>
          </li>
          <li>
            <a href="#about">من نحن</a>
          </li>
          <li>
            <a href="#contact">تواصل معنا</a>
          </li>
        </ul>
      </div>

      <div className="navbar-end gap-2">
        <Link
          to="/register"
          className="btn bg-linear-to-r from-[#05ADE8] to-[#6CCCC8] btn-sm text-white md:btn-md"
        >
          حساب جديد
        </Link>

        <Link
          to="/login"
          className="btn btn-outline btn-info btn-sm md:btn-md"
        >
          تسجيل دخول
        </Link>
      </div>
    </div>
  );
}