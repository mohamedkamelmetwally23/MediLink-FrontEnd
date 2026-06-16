import { FaMoon, FaSun } from "react-icons/fa";
import { useTheme } from "../hooks/useTheme";

export default function ThemeToggle() {
  const { dark, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="btn btn-circle w-14 h-14 text-(--text-primary) bg-(--bg-primary) border-3 fixed left-5 bottom-5 md:left-5 md:bottom-5 z-[1000] shadow-lg"
      aria-label="تبديل الوضع" 
    >
      {dark ? <FaSun size={24}/> : <FaMoon size={24} />}
    </button>
  );
}
