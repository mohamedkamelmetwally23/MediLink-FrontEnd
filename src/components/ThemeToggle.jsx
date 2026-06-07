import { FaMoon, FaSun } from "react-icons/fa";
import { useTheme } from "../hooks/useTheme";

export default function ThemeToggle() {
  const { dark, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="btn btn-circle w-8 h-8 lg:w-14 lg:h-14 text-(--text-primary) bg-(--bg-primary) border-1 lg:border-4 fixed left-5 bottom-5"
    >
      {dark ? (
        <FaSun className="text-lg lg:text-3xl" />
      ) : (
        <FaMoon className="text-lg lg:text-3xl" />
      )}
    </button>
  );
}
