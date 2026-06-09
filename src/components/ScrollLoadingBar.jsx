import { useEffect, useRef, useState } from "react";

export default function ScrollLoadingBar() {
  const [progress, setProgress] = useState(0);
  const [isScrolling, setIsScrolling] = useState(false);
  const hideTimerRef = useRef(null);

  useEffect(() => {
    const updateProgress = () => {
      const scrollTop =
        window.scrollY || document.documentElement.scrollTop || 0;
      const maxScroll =
        document.documentElement.scrollHeight - window.innerHeight;
      const nextProgress = maxScroll > 0 ? (scrollTop / maxScroll) * 100 : 0;

      setProgress(Math.min(100, Math.max(0, nextProgress)));
      setIsScrolling(true);

      window.clearTimeout(hideTimerRef.current);
      hideTimerRef.current = window.setTimeout(() => {
        setIsScrolling(false);
      }, 650);
    };

    updateProgress();
    window.addEventListener("scroll", updateProgress, { passive: true });
    window.addEventListener("resize", updateProgress);

    return () => {
      window.removeEventListener("scroll", updateProgress);
      window.removeEventListener("resize", updateProgress);
      window.clearTimeout(hideTimerRef.current);
    };
  }, []);

  return (
    <div
      className={`fixed inset-x-0 top-0 z-[1000] h-1 overflow-hidden bg-transparent transition-opacity duration-300 ${
        isScrolling ? "opacity-100" : "opacity-0"
      }`}
      aria-hidden="true"
    >
      <div
        className="h-full rounded-l-full bg-gradient-to-l from-[#6CCCC8] via-[#05ADE8] to-[#0f8ee8] shadow-[0_0_14px_rgba(5,173,232,0.7)] transition-[width] duration-150"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}
