import { useState } from "react";

export default function GenderSelector() {
  const [selectedGender, setSelectedGender] = useState("");

  const getButtonClass = (gender) =>
    selectedGender === gender
      ? "btn h-12 rounded-lg border-none bg-gradient-to-r from-[#05ADE8] to-[#6CCCC8] text-sm font-normal text-white hover:from-[#05ADE8] hover:to-[#6CCCC8]"
      : "btn h-12 rounded-lg border border-gray-800 bg-white text-sm font-normal text-gray-800 hover:bg-white dark:border-[#D2D2D2] dark:bg-[#252525] dark:text-[#F0F0F0] dark:hover:bg-[#303030]";

  return (
    <div className="grid grid-cols-2 gap-3">
      <button
        type="button"
        onClick={() => setSelectedGender("female")}
        className={getButtonClass("female")}
      >
        أنثى
      </button>

      <button
        type="button"
        onClick={() => setSelectedGender("male")}
        className={getButtonClass("male")}
      >
        ذكر
      </button>
    </div>
  );
}
