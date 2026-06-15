import { useState } from "react";

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
            error
              ? "border-[#C51F26] bg-white focus:ring-1 focus:ring-[#C51F26] dark:bg-[#303030]"
              : "border-transparent bg-base-200 focus:ring-1 focus:ring-[#05ADE8] dark:bg-[#303030]"
          }`}
        />

        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-[#F0F0F0]"
            aria-label={showPassword ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}
          >
            {showPassword ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.8}
                stroke="currentColor"
                className="h-4 w-4"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3.98 8.22A10.48 10.48 0 0 0 1.93 12C3.23 16.34 7.24 19.5 12 19.5c1.56 0 3.05-.34 4.38-.95M6.23 6.23A10.45 10.45 0 0 1 12 4.5c4.76 0 8.77 3.16 10.07 7.5a10.52 10.52 0 0 1-4.29 5.77M6.23 6.23 3 3m3.23 3.23 12.54 12.54M21 21l-3.23-3.23"
                />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.8}
                stroke="currentColor"
                className="h-4 w-4"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M2.25 12s3.75-6.75 9.75-6.75S21.75 12 21.75 12 18 18.75 12 18.75 2.25 12 2.25 12Z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                />
              </svg>
            )}
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
