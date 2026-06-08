import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";

export function Field({ label, error, children, className = "" }) {
  return (
    <label className={`block text-right ${className}`}>
      <span
        className={`mb-2 block font-semibold ${
          error ? "text-red-500" : "text-[#111] dark:text-white"
        }`}
      >
        {label}
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

export function SelectInput({ error, children, ...props }) {
  return (
    <select
      {...props}
      className={`h-[52px] w-full rounded-xl border bg-[#eee] px-4 text-[#333] outline-none transition dark:bg-[#505050] dark:text-white ${
        error ? "border-red-500" : "border-transparent focus:border-cyan-400"
      }`}
    >
      {children}
    </select>
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
  const toggleDay = (day) => {
    const nextValue = value.includes(day)
      ? value.filter((item) => item !== day)
      : [...value, day];
    onChange(nextValue);
  };

  return (
    <div
      className={`flex min-h-[52px] flex-wrap items-center gap-2 rounded-xl border bg-[#eee] px-3 py-2 dark:bg-[#505050] ${
        error ? "border-red-500" : "border-transparent"
      }`}
    >
      {options.map((day) => (
        <button
          key={day}
          type="button"
          className={`rounded-lg px-3 py-1 text-sm transition ${
            value.includes(day)
              ? "bg-cyan-100 text-[#111] dark:bg-cyan-500 dark:text-white"
              : "bg-white text-gray-500 dark:bg-[#3a3a3a] dark:text-gray-200"
          }`}
          onClick={() => toggleDay(day)}
        >
          {day}
        </button>
      ))}
    </div>
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
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Field label="من الساعة" error={startError}>
        <SelectInput
          value={start}
          error={startError}
          onChange={(event) => onStartChange(event.target.value)}
        >
          <option value="">اختر البداية</option>
          {options.map((time) => (
            <option key={time} value={time}>
              {time}
            </option>
          ))}
        </SelectInput>
      </Field>

      <Field label="إلى الساعة" error={endError}>
        <SelectInput
          value={end}
          error={endError}
          onChange={(event) => onEndChange(event.target.value)}
        >
          <option value="">اختر النهاية</option>
          {options.map((time) => (
            <option key={time} value={time}>
              {time}
            </option>
          ))}
        </SelectInput>
      </Field>
    </div>
  );
}
