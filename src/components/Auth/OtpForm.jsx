import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import PrimaryButton from "../ui/PrimaryButton";
import { Link } from "react-router";

const OTP_LENGTH = 6;

function maskPhoneNumber(phoneNumber = "") {
  const digits = String(phoneNumber).replace(/\D/g, "");

  if (digits.length <= 4) {
    return digits.replace(/\d/g, "#");
  }

  const visibleStart = digits.slice(0, 3);
  const visibleEnd = digits.slice(-2);
  const hiddenLength = Math.max(
    digits.length - visibleStart.length - visibleEnd.length,
    3,
  );

  return `${visibleStart}${"#".repeat(hiddenLength)}${visibleEnd}`;
}

export default function OtpForm({
  phoneNumber,
  title = "تأكيد رقم الهاتف",
  description = "أدخل كود التحقق المرسل إلى رقم الهاتف",
  otpHint = "",
  submitText = "تأكيد",
  onVerified,
  onBack,
  onResend,
}) {
  const [digits, setDigits] = useState(Array(OTP_LENGTH).fill(""));
  const [error, setError] = useState("");
  const [isChecking, setIsChecking] = useState(false);
  const [forceDisabled, setForceDisabled] = useState(false);
  const inputsRef = useRef([]);
  const maskedPhoneNumber = maskPhoneNumber(phoneNumber);

  useEffect(() => {
    inputsRef.current[0]?.focus();
  }, []);

  const otpValue = digits.join("");

  const handleChange = (index, value) => {
    const nextValue = value.replace(/\D/g, "").slice(-1);
    const nextDigits = [...digits];
    nextDigits[index] = nextValue;
    setDigits(nextDigits);
    setError("");
    setForceDisabled(false);

    if (nextValue && index < OTP_LENGTH - 1) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, event) => {
    if (event.key === "Backspace" && !digits[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const handlePaste = (event) => {
    event.preventDefault();
    const pasted = event.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, OTP_LENGTH);

    if (!pasted) return;

    const nextDigits = Array(OTP_LENGTH).fill("");
    pasted.split("").forEach((digit, index) => {
      nextDigits[index] = digit;
    });
    setDigits(nextDigits);
    inputsRef.current[Math.min(pasted.length, OTP_LENGTH) - 1]?.focus();
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (otpValue.length !== OTP_LENGTH) {
      setError("أدخل كود التحقق كاملًا");
      toast.error("أدخل كود التحقق كاملًا");
      setForceDisabled(true);
      return;
    }

    setIsChecking(true);
    try {
      await onVerified?.(otpValue);
      toast.success("تم تأكيد الكود بنجاح");
    } catch (error) {
      setError(error.message || "كود التحقق غير صحيح");
      toast.error(error.message || "كود التحقق غير صحيح");
      setForceDisabled(true);
    } finally {
      setIsChecking(false);
    }
  };

  const handleResend = async () => {
    if (!onResend) {
      toast.info("إعادة إرسال الكود ستكون متاحة قريبًا");
      return;
    }

    await onResend();
    setDigits(Array(OTP_LENGTH).fill(""));
    setError("");
    inputsRef.current[0]?.focus();
  };

  const isOtpFilled = otpValue.length === OTP_LENGTH;

  return (
    <section className="flex w-full items-center justify-center bg-white px-6 py-10 dark:bg-[#252525] lg:basis-1/2 lg:min-h-full lg:px-10">
      <Link
        to="/"
        className="btn btn-circle btn-sm fixed left-5 top-5 lg:hidden  z-40 border-none bg-(--bg-primary) text-[#05ADE8] shadow-sm hover:bg-white"
        aria-label="Back to home"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
          className="h-5 w-5"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18"
          />
        </svg>
      </Link>
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-[430px] text-right"
        dir="rtl"
        autoComplete="off"
      >
        <div className="mb-10 text-center">
          <h1 className="mb-2 text-3xl font-semibold text-gray-900 dark:text-[#F0F0F0]">
            {title}
          </h1>

          <p className="mx-auto max-w-[330px] text-sm leading-6 text-gray-500 dark:text-[#D2D2D2]">
            {description}
            {maskedPhoneNumber ? (
              <span className="mt-1 block font-semibold text-gray-800 dark:text-[#F0F0F0]">
                {maskedPhoneNumber}
              </span>
            ) : null}
          </p>

          {otpHint ? (
            <div className="mx-auto mt-4 max-w-[260px] rounded-lg border border-[#05ADE8]/30 bg-[#EAF8FC] px-4 py-3 text-center text-sm text-gray-800 dark:bg-[#303030] dark:text-[#F0F0F0]">
              <span className="block text-xs text-gray-500 dark:text-[#D2D2D2]">
                كود التحقق للتجربة
              </span>
              <strong
                className="mt-1 block text-xl tracking-[0.35em] text-[#05ADE8]"
                dir="ltr"
              >
                {otpHint}
              </strong>
            </div>
          ) : (
            <p className="mx-auto mt-3 max-w-[330px] text-xs leading-5 text-gray-400">
              خدمة الرسائل غير مفعلة حاليًا، افتح Network response الخاص
              بالتسجيل لمعرفة الكود.
            </p>
          )}
        </div>

        <div className="mb-4 grid grid-cols-6 gap-2" dir="ltr">
          {digits.map((digit, index) => (
            <input
              key={index}
              ref={(node) => {
                inputsRef.current[index] = node;
              }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(event) => handleChange(index, event.target.value)}
              onKeyDown={(event) => handleKeyDown(index, event)}
              onPaste={handlePaste}
              className={`h-12 rounded-lg border bg-base-200 text-center text-lg font-semibold text-gray-900 outline-none transition focus:ring-1 focus:ring-[#05ADE8] dark:bg-[#303030] dark:text-[#F0F0F0] ${
                error ? "border-[#C51F26]" : "border-transparent"
              }`}
              aria-label={`OTP digit ${index + 1}`}
            />
          ))}
        </div>

        {error && (
          <p className="mb-4 text-center text-sm font-medium text-[#C51F26]">
            {error}
          </p>
        )}

        <PrimaryButton disabled={isChecking || forceDisabled || !isOtpFilled}>
          {isChecking ? "جاري التأكيد..." : submitText}
        </PrimaryButton>

        <div className="mt-5 flex items-center justify-center gap-4 text-sm">
          <button
            type="button"
            onClick={handleResend}
            className="font-semibold text-gray-900 underline dark:text-[#F0F0F0]"
          >
            إعادة إرسال الكود
          </button>

          {onBack ? (
            <button
              type="button"
              onClick={onBack}
              className="text-gray-500 underline dark:text-[#D2D2D2]"
            >
              تعديل الرقم
            </button>
          ) : null}
        </div>
      </form>
    </section>
  );
}
