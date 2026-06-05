import { FaRobot } from "react-icons/fa";

export default function AssistantButton() {
  return (
    <div className="fixed bottom-6 right-6 z-50">
      <button
        className="
          group
          flex items-center
          bg-cyan-500 text-white
          rounded-full
          shadow-lg
          overflow-hidden
          transition-all duration-300
          w-14 hover:w-65
          h-14
          cursor-pointer
        "
      >
        <div className="w-14 flex justify-center dark:text-[#2E2E2E] items-center shrink-0">
          <FaRobot size={24} />
        </div>

        <span
          className="
            whitespace-nowrap
            opacity-0
            group-hover:opacity-100
            transition-opacity duration-300
            pr-2
            dark:text-black
          "
        >
          تحدث مع المساعد الشخصي
        </span>
      </button>
    </div>
  );
}
