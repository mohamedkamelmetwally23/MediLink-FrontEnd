import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

export default function FormInput({
  id,
  name,
  label,
  type = "text",
  placeholder = "",
  autoComplete = "off",
  error = "",
  required = false,
  value,
  onChange,
  showErrorText = true,
}) {
  const [showPassword, setShowPassword] = useState(false);

  const isPassword = type === "password";
  const inputType = isPassword && showPassword ? "text" : type;

  return (
    <div>
      {label && (
        <label
          htmlFor={id}
          className={`mb-2 inline-flex items-center gap-1 text-sm font-medium ${
            error ? "text-[#C51F26]" : "text-gray-900 dark:text-[#F0F0F0]"
          }`}
        >
          <span>{label}</span>
          {required && <span className="text-[#C51F26]">*</span>}
        </label>
      )}

      <div className="relative">
        <input
          id={id}
          name={name}
          type={inputType}
          placeholder={placeholder}
          autoComplete={autoComplete}
          inputMode={type === "tel" ? "numeric" : undefined}
          value={value}
          onChange={onChange}
          className={`input h-12 w-full rounded-lg border px-4 text-right text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none dark:text-[#F0F0F0] dark:placeholder:text-[#8A8A8A] ${
            isPassword ? "pl-12" : ""
          } ${
            error
              ? "border-[#C51F26] bg-white focus:ring-1 focus:ring-[#C51F26] dark:bg-[#303030]"
              : "border-transparent bg-base-200 focus:ring-1 focus:ring-[#05ADE8] dark:bg-[#303030]"
          }`}
        />

        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute left-4 top-1/2 grid h-7 w-7 -translate-y-1/2 place-items-center text-gray-400 transition hover:text-gray-600 dark:hover:text-[#F0F0F0]"
            aria-label={showPassword ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}
            aria-pressed={showPassword}
          >
            {showPassword ? <Eye size={18} strokeWidth={1.8} /> : <EyeOff size={18} strokeWidth={1.8} />}
          </button>
        )}
      </div>

      {showErrorText && error && (
        Array.isArray(error) ? (
          <div className="mt-1 space-y-1 text-xs text-[#C51F26]">
            {error.map((message) => (
              <p key={message}>{message}</p>
            ))}
          </div>
        ) : (
          <p className="mt-1 text-xs text-[#C51F26]">{error}</p>
        )
      )}
    </div>
  );
}
