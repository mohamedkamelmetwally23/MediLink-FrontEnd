import { useEffect, useState } from "react";
import { FaRobot } from "react-icons/fa";
import AiAgent from "./AiAgent";

export default function AssistantButton() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!isOpen) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  return (
    <>
      {!isOpen && (
        <div className="fixed bottom-5 right-4 z-50 sm:bottom-6 sm:right-6">
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className="group flex h-14 w-14 items-center overflow-hidden rounded-full bg-cyan-500 text-white shadow-lg transition-all duration-300 hover:w-56 dark:text-[#2E2E2E]"
            aria-label="تحدث مع المساعد الشخصي"
          >
            <span className="flex w-14 shrink-0 justify-center">
              <FaRobot size={24} />
            </span>
            <span className="whitespace-nowrap pr-1 text-sm opacity-0 transition-opacity duration-300 group-hover:opacity-100 dark:text-black">
              تحدث مع المساعد الشخصي
            </span>
          </button>
        </div>
      )}

      {isOpen && (
        <div
          className="fixed inset-0 z-[90] bg-black/35 p-0 backdrop-blur-[1px]"
          role="dialog"
          aria-modal="true"
          aria-label="المساعد الذكي للرعاية الصحية"
        >
          <div className="h-full w-full overflow-hidden bg-white shadow-2xl dark:bg-[#252525] sm:absolute sm:bottom-6 sm:right-6 sm:h-[min(660px,calc(100vh-3rem))] sm:max-w-[430px] sm:rounded-2xl lg:max-w-[520px]">
            <AiAgent onClose={() => setIsOpen(false)} />
          </div>
        </div>
      )}
    </>
  );
}
