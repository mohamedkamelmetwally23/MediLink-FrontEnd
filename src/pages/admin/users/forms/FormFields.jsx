import { ChevronDown, Eye, EyeOff, X } from "lucide-react";
import { Children, isValidElement, useState } from "react";

export function Field({ label, error, children, className = "" }) {
  return (
    <label className={`block text-right ${className}`}>
      <span
        className={`mb-2 block font-semibold ${
          error ? "text-red-500" : "text-[#111] dark:text-white"
        }`}
      >
        {label}
        <span className="mr-1 text-red-500">*</span>
      </span>
      {children}
      {error && <span className="mt-2 block text-sm text-red-500">{error}</span>}
    </label>
  );
}

export function TextInput({ error, className = "", ...props }) {
  return (
    <input
      {...props}
      className={`h-[52px] w-full rounded-xl border bg-[#eee] px-4 text-[#333] outline-none transition placeholder:text-gray-400 dark:bg-[#505050] dark:text-white ${
        error ? "border-red-500" : "border-transparent focus:border-cyan-400"
      } ${className}`}
    />
  );
}

function DropdownSelect({
  value,
  options,
  error,
  disabled = false,
  placeholder = "اختر",
  buttonClassName = "h-[52px]",
  onChange,
}) {
  const [open, setOpen] = useState(false);
  const selectedOption = options.find((option) => option.value === value);

  return (
    <div
      className="relative"
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
        className={`flex w-full items-center gap-3 rounded-xl border bg-[#eee] px-4 text-[#333] outline-none transition disabled:cursor-not-allowed disabled:opacity-80 dark:bg-[#505050] dark:text-white ${
          error ? "border-red-500" : "border-transparent focus:border-cyan-400"
        } ${buttonClassName}`}
        onClick={() => {
          if (!disabled) {
            setOpen((current) => !current);
          }
        }}
      >
        <ChevronDown size={22} className="shrink-0 text-gray-600 dark:text-gray-200" />
        <span dir="rtl" className="flex-1 truncate text-right">
          {selectedOption?.label || placeholder}
        </span>
      </button>

      {open && !disabled && (
        <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-50 max-h-[240px] overflow-y-auto rounded-xl border border-gray-100 bg-white p-2 shadow-[0_12px_30px_rgba(0,0,0,0.12)] dark:border-[#555] dark:bg-[#3a3a3a]">
          {options.map((option) => (
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
                onChange(option.value);
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

function getSelectOptions(children) {
  return Children.toArray(children)
    .filter(isValidElement)
    .map((child) => ({
      value: child.props.value ?? "",
      label: child.props.children,
      disabled: child.props.disabled,
    }));
}

export function SelectInput({
  error,
  children,
  value = "",
  onChange,
  disabled,
  name,
}) {
  return (
    <DropdownSelect
      value={value}
      error={error}
      disabled={disabled}
      options={getSelectOptions(children)}
      onChange={(nextValue) =>
        onChange?.({ target: { name, value: nextValue } })
      }
    />
  );
}

export function PasswordInput({ error, ...props }) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <input
        {...props}
        type={visible ? "text" : "password"}
        className={`h-[52px] w-full rounded-xl border bg-[#eee] px-4 pl-12 text-[#333] outline-none transition dark:bg-[#505050] dark:text-white ${
          error ? "border-red-500" : "border-transparent focus:border-cyan-400"
        }`}
      />
      <button
        type="button"
        aria-label={visible ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}
        className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-300"
        onClick={() => setVisible((current) => !current)}
      >
        {visible ? <EyeOff size={20} /> : <Eye size={20} />}
      </button>
    </div>
  );
}

export function WorkDaysPicker({ value, onChange, options, error }) {
  const [open, setOpen] = useState(false);

  const toggleDay = (day) => {
    const nextValue = value.includes(day)
      ? value.filter((item) => item !== day)
      : [...value, day];
    onChange(nextValue);
  };

  return (
    <div className="relative">
      <div
        role="button"
        tabIndex={0}
        dir="ltr"
        className={`flex min-h-[52px] w-full cursor-pointer items-center gap-3 rounded-xl border bg-[#eee] px-4 py-2 text-[#333] outline-none transition dark:bg-[#505050] dark:text-white ${
          error ? "border-red-500" : "border-transparent focus-within:border-cyan-400"
        }`}
        onClick={() => setOpen((current) => !current)}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            setOpen((current) => !current);
          }
        }}
      >
        <ChevronDown size={22} className="shrink-0 text-gray-600 dark:text-gray-200" />
        <div dir="rtl" className="flex flex-1 flex-wrap items-center justify-start gap-2">
          {value.length > 0 ? (
            value.map((day) => (
              <button
                key={day}
                type="button"
                className="inline-flex h-8 items-center gap-2 rounded-lg bg-[#f6ffff] px-3 text-xs text-[#111] transition hover:bg-cyan-50 dark:bg-[#3a3a3a] dark:text-white"
                onClick={(event) => {
                  event.stopPropagation();
                  toggleDay(day);
                }}
              >
                <X size={13} />
                {day}
              </button>
            ))
          ) : (
            <span className="text-sm text-gray-400">اختر أيام العمل</span>
          )}
        </div>
      </div>

      {open && (
        <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-30 rounded-xl border border-gray-100 bg-white p-2 shadow-lg dark:border-[#555] dark:bg-[#3a3a3a]">
          {options.map((day) => (
            <button
              key={day}
              type="button"
              className={`block w-full rounded-lg px-3 py-2 text-right text-sm transition ${
                value.includes(day)
                  ? "bg-cyan-50 text-[#16b9d3] dark:bg-[#505050] dark:text-cyan-300"
                  : "text-[#333] hover:bg-gray-50 dark:text-white dark:hover:bg-[#505050]"
              }`}
              onClick={() => toggleDay(day)}
            >
              {day}
            </button>
          ))}
        </div>
      )}

      {error && <span className="mt-2 block text-sm text-red-500">{error}</span>}
    </div>
  );
}

function formatWorkTime(time) {
  if (!time) return "";

  const twentyFourHourMatch = /^(\d{1,2}):(\d{2})$/.exec(time);
  if (twentyFourHourMatch) {
    const hour24 = Number(twentyFourHourMatch[1]);
    const hour12 = hour24 % 12 || 12;
    const period = hour24 >= 12 ? "مساءا" : "صباحا";

    return `${hour12}:${twentyFourHourMatch[2]} ${period}`;
  }

  return time.replace(" ص", " صباحا").replace(" م", " مساءا");
}

function TimeSelect({ value, error, options, onChange }) {
  const timeOptions = [
    { value: "", label: "اختر الوقت" },
    ...options.map((time) => ({ value: time, label: formatWorkTime(time) })),
  ];

  return (
    <DropdownSelect
      value={value}
      error={error}
      options={timeOptions}
      placeholder="اختر الوقت"
      buttonClassName="h-[46px]"
      onChange={onChange}
    />
  );
}

export function WorkHoursRange({
  start,
  end,
  onStartChange,
  onEndChange,
  options,
  startError,
  endError,
}) {
  const [open, setOpen] = useState(false);
  const error = startError || endError;
  const displayValue =
    start && end ? `${formatWorkTime(start)} - ${formatWorkTime(end)}` : "اختر ساعات العمل";

  return (
    <div className="relative">
      <button
        type="button"
        dir="ltr"
        className={`flex h-[52px] w-full items-center gap-3 rounded-xl border bg-[#eee] px-4 text-[#333] outline-none transition dark:bg-[#505050] dark:text-white ${
          error ? "border-red-500" : "border-transparent focus:border-cyan-400"
        }`}
        onClick={() => setOpen((current) => !current)}
      >
        <ChevronDown size={22} className="shrink-0 text-gray-600 dark:text-gray-200" />
        <span dir="rtl" className="flex-1 text-right">
          {displayValue}
        </span>
      </button>

      {open && (
        <div
          dir="rtl"
          className="absolute left-0 right-0 top-[calc(100%+8px)] z-30 grid gap-3 rounded-xl border border-gray-100 bg-white p-3 shadow-lg dark:border-[#555] dark:bg-[#3a3a3a] sm:grid-cols-2"
        >
          <TimeSelect
            value={start}
            error={startError}
            options={options}
            onChange={onStartChange}
          />
          <TimeSelect
            value={end}
            error={endError}
            options={options}
            onChange={onEndChange}
          />
        </div>
      )}

      {error && <span className="mt-2 block text-sm text-red-500">{error}</span>}
    </div>
  );
}
