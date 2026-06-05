import { FaRobot } from "react-icons/fa";
import { toast } from "react-toastify";

export default function AssistantButton() {
  return (
    <div className="fixed bottom-5 right-4 z-50 sm:bottom-6 sm:right-6">
      <button
        type="button"
        onClick={() => toast.info("المساعد الذكي جاهز في القسم الخاص به")}
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
  );
}
