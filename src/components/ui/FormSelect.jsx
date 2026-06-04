import { useState } from "react";

export default function FormSelect({ name, placeholder, options = [] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState("");

  const selectedLabel =
    options.find((option) => option.value === selected)?.label || placeholder;

  return (
    <div className="relative">
      <input type="hidden" name={name} value={selected} />

      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={`flex h-12 w-full items-center justify-between rounded-lg border bg-base-200 px-4 text-sm focus:outline-none ${
          isOpen
            ? "border-[#05ADE8] ring-1 ring-[#05ADE8]"
            : "border-transparent"
        }`}
      >
        <span className={selected ? "text-gray-800" : "text-gray-400"}>
          {selectedLabel}
        </span>

        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.8}
          stroke="currentColor"
          className={`h-4 w-4 text-gray-500 transition ${
            isOpen ? "rotate-180" : ""
          }`}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="m19.5 8.25-7.5 7.5-7.5-7.5"
          />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 top-14 z-50 max-h-56 w-full overflow-y-auto rounded-lg border border-gray-200 bg-white p-1 shadow-lg">
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => {
                setSelected(option.value);
                setIsOpen(false);
              }}
              className={`block h-9 w-full rounded-md px-3 text-right text-sm transition ${
                selected === option.value
                  ? "bg-gradient-to-r from-[#05ADE8] to-[#6CCCC8] text-white"
                  : "text-gray-700 hover:bg-base-200"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}