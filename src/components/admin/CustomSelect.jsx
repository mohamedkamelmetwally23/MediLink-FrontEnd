import { Children, isValidElement, useState } from "react";
import { ChevronDown } from "lucide-react";

function optionsFromChildren(children) {
  return Children.toArray(children)
    .filter(isValidElement)
    .map((child) => ({
      value: child.props.value ?? "",
      label: child.props.children,
      disabled: child.props.disabled,
    }));
}

export default function CustomSelect({
  value = "",
  options,
  children,
  onChange,
  disabled = false,
  placeholder = "اختر",
  displayLabel,
  className = "",
  buttonClassName = "",
  menuClassName = "",
}) {
  const [open, setOpen] = useState(false);
  const selectOptions = options ?? optionsFromChildren(children);
  const selectedOption = selectOptions.find((option) => option.value === value);
  const label = displayLabel ?? selectedOption?.label ?? placeholder;
  const buttonClasses =
    buttonClassName ||
    "flex h-[52px] w-full items-center gap-3 rounded-xl border border-gray-200 bg-white px-4 text-[#333] outline-none transition focus:border-cyan-400 disabled:cursor-not-allowed disabled:opacity-70 dark:border-white/30 dark:bg-[#454545] dark:text-white";

  return (
    <div
      className={`relative ${className}`}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          setOpen(false);
        }
      }}
    >
      <button
        type="button"
        dir="ltr"
        disabled={disabled}
        className={buttonClasses}
        onClick={() => {
          if (!disabled) {
            setOpen((current) => !current);
          }
        }}
      >
        <ChevronDown size={19} strokeWidth={1.8} className="shrink-0" />
        <span dir="rtl" className="flex-1 truncate text-right">
          {label}
        </span>
      </button>

      {open && !disabled && (
        <div
          className={`absolute left-0 right-0 top-[calc(100%+8px)] z-50 max-h-[240px] overflow-y-auto rounded-xl border border-gray-100 bg-white p-2 shadow-[0_12px_30px_rgba(0,0,0,0.12)] dark:border-[#555] dark:bg-[#3a3a3a] ${menuClassName}`}
        >
          {selectOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              disabled={option.disabled}
              className={`block w-full rounded-lg px-3 py-2 text-right text-sm transition disabled:cursor-not-allowed disabled:opacity-50 ${
                option.value === value
                  ? "bg-cyan-50 text-[#16b9d3] dark:bg-[#505050] dark:text-cyan-300"
                  : "text-[#333] hover:bg-gray-50 dark:text-white dark:hover:bg-[#505050]"
              }`}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => {
                onChange?.(option.value);
                setOpen(false);
              }}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
