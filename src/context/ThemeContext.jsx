import { useEffect, useState } from "react";
import { ThemeContext } from "./themeContextValue";

function updateDocumentTheme(isDark) {
  document.documentElement.setAttribute(
    "data-theme",
    isDark ? "dark" : "light",
  );

  if (isDark) {
    document.documentElement.classList.add("dark");
  } else {
    document.documentElement.classList.remove("dark");
  }
}

export function ThemeProvider({ children }) {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    updateDocumentTheme(false);
  }, []);

  const toggleTheme = () => {
    setDark((currentDark) => {
      const newDark = !currentDark;

      updateDocumentTheme(newDark);

      return newDark;
    });
  };

  return (
    <ThemeContext.Provider value={{ dark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
