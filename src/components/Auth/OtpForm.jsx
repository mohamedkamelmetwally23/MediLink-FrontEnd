import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import PrimaryButton from "../ui/PrimaryButton";

const OTP_LENGTH = 6;
const DEMO_OTP = "123456";

export default function OtpForm({
  phoneNumber,
  title = "تأكيد رقم الهاتف",
  description = "أدخل كود التحقق المرسل إلى رقم الهاتف",
  submitText = "تأكيد",
  onVerified,
  onBack,
}) {
  const [digits, setDigits] = useState(Array(OTP_LENGTH).fill(""));
  const [error, setError] = useState("");
  const [isChecking, setIsChecking] = useState(false);
  const inputsRef = useRef([]);

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

  const handleSubmit = (event) => {
    event.preventDefault();

    if (otpValue.length !== OTP_LENGTH) {
      setError("أدخل كود التحقق كاملًا");
      toast.error("أدخل كود التحقق كاملًا");
      return;
    }

    setIsChecking(true);

    window.setTimeout(() => {
      setIsChecking(false);

      if (otpValue !== DEMO_OTP) {
        setError("كود التحقق غير صحيح");
        toast.error("كود التحقق غير صحيح");
        return;
      }

      toast.success("تم تأكيد الكود بنجاح");
      onVerified?.();
    }, 650);
  };

  const handleResend = () => {
    toast.info("تم إرسال كود جديد. كود التجربة هو 123456");
  };

  return (
    <section className="flex w-full items-center justify-center bg-white px-6 py-10 dark:bg-[#252525] lg:basis-1/2 lg:min-h-full lg:px-10">
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
            {phoneNumber ? (
              <span className="mt-1 block font-semibold text-gray-800 dark:text-[#F0F0F0]">
                {phoneNumber}
              </span>
            ) : null}
          </p>
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

        <PrimaryButton disabled={isChecking}>
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

        <p className="mt-4 text-center text-xs text-gray-400">
          كود التجربة: 123456
        </p>
      </form>
    </section>
  );
}
