import { useEffect, useState } from "react";
import { ThemeContext } from "./themeContextValue";

export function ThemeProvider({ children }) {
  const [dark, setDark] = useState(false);

  //   useEffect(() => {
  //     const savedTheme = localStorage.getItem("theme");

  //     if (savedTheme) {
  //       const isDark = savedTheme === "dark";

  //       setDark(isDark);

  //       if (isDark) {
  //         document.documentElement.classList.add("dark");
  //       } else {
  //         document.documentElement.classList.remove("dark");
  //       }
  //     } else {
  //       const media = window.matchMedia("(prefers-color-scheme: dark)");

  //       const isDark = media.matches;

  //       setDark(isDark);

  //       if (isDark) {
  //         document.documentElement.classList.add("dark");
  //       } else {
  //         document.documentElement.classList.remove("dark");
  //       }
  //     }
  //   }, []);

  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");

    const applyTheme = (isDark) => {
      setDark(isDark);
      document.documentElement.setAttribute(
        "data-theme",
        isDark ? "dark" : "light",
      );

      if (isDark) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    };

    const savedTheme = localStorage.getItem("theme");

    if (savedTheme) {
      applyTheme(savedTheme === "dark");
      return;
    }

    applyTheme(media.matches);

    const handleChange = (e) => {
      applyTheme(e.matches);
    };

    media.addEventListener("change", handleChange);

    return () => {
      media.removeEventListener("change", handleChange);
    };
  }, []);

  const toggleTheme = () => {
    const newDark = !dark;

    setDark(newDark);

    if (newDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }

    document.documentElement.setAttribute(
      "data-theme",
      newDark ? "dark" : "light",
    );
    localStorage.setItem("theme", newDark ? "dark" : "light");
  };

  return (
    <ThemeContext.Provider value={{ dark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
