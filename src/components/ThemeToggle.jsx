import { FaMoon, FaSun } from "react-icons/fa";
import { useTheme } from "../hooks/useTheme";

export default function ThemeToggle() {
  const { dark, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="btn btn-circle w-14 h-14 text-(--text-primary) bg-(--bg-primary) border-3 fixed left-5 bottom-5"
    >
      {dark ? <FaSun size={24}/> : <FaMoon size={24} />}
    </button>
  );
}
