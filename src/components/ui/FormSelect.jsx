import { useEffect, useId, useRef, useState } from "react";

export default function FormSelect({
  id,
  name,
  placeholder,
  options = [],
  value,
  onChange,
  error = false,
}) {
  const generatedId = useId();
  const selectId = id || `${name}-${generatedId}`;
  const wrapperRef = useRef(null);
  const [isOpen, setIsOpen] = useState(false);
  const [internalValue, setInternalValue] = useState("");

  const selected = value ?? internalValue;

  const selectedLabel =
    options.find((option) => String(option.value) === String(selected))?.label ||
    placeholder;

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (!wrapperRef.current?.contains(event.target)) {
        setIsOpen(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const handleSelect = (nextValue) => {
    if (value === undefined) {
      setInternalValue(nextValue);
    }

    onChange?.({
      target: {
        name,
        value: nextValue,
        type: "select-one",
      },
    });
    setIsOpen(false);
  };

  return (
    <div ref={wrapperRef} className="relative">
      <input type="hidden" name={name} value={selected} />

      <button
        id={selectId}
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className={`flex h-12 w-full items-center justify-between rounded-lg border bg-base-200 px-4 text-sm shadow-sm transition focus:outline-none dark:bg-[#303030] ${
          error
            ? "border-[#C51F26] ring-1 ring-[#C51F26]"
            : isOpen
            ? "border-[#05ADE8] ring-1 ring-[#05ADE8]"
            : "border-transparent"
        }`}
      >
        <span
          className={
            selected
              ? "text-gray-800 dark:text-[#F0F0F0]"
              : "text-gray-400 dark:text-[#8A8A8A]"
          }
        >
          {selectedLabel}
        </span>

        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.8}
          stroke="currentColor"
          className={`h-4 w-4 text-gray-500 transition dark:text-[#D2D2D2] ${
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
        <div
          className="absolute right-0 top-[calc(100%+0.5rem)] z-50 w-full overflow-hidden rounded-xl border border-gray-200/80 bg-white shadow-2xl shadow-sky-900/10 ring-1 ring-black/5 dark:border-[#3B3B3B] dark:bg-[#303030] dark:shadow-black/30"
          role="listbox"
          aria-labelledby={selectId}
        >
          <div className="max-h-60 overflow-y-auto p-1.5 [scrollbar-color:#05ADE8_transparent] [scrollbar-width:thin]">
            {options.map((option) => {
              const isSelected = String(selected) === String(option.value);

              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleSelect(option.value)}
                  role="option"
                  aria-selected={isSelected}
                  className={`flex h-10 w-full items-center justify-between rounded-lg px-3 text-right text-sm font-medium transition ${
                    isSelected
                      ? "bg-gradient-to-r from-[#05ADE8] to-[#6CCCC8] text-white shadow-sm"
                      : "text-gray-700 hover:bg-[#EAF8FC] dark:text-[#F0F0F0] dark:hover:bg-[#3A3A3A]"
                  }`}
                >
                  <span>{option.label}</span>
                  {isSelected && (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={2}
                      stroke="currentColor"
                      className="h-4 w-4"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="m4.5 12.75 6 6 9-13.5"
                      />
                    </svg>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
