import { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import FormInput from "../ui/FormInput";
import PrimaryButton from "../ui/PrimaryButton";

export default function ResetPasswordForm({ onOtpRequested }) {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [error, setError] = useState("");
  const [forceDisabled, setForceDisabled] = useState(false);

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!phoneNumber.trim()) {
      setError("رقم الهاتف مطلوب");
      toast.error("رقم الهاتف مطلوب");
      setForceDisabled(true);
      return;
    }

    if (!/^01[0-9]{9}$/.test(phoneNumber)) {
      setError("رقم الهاتف غير صحيح");
      toast.error("رقم الهاتف غير صحيح");
      setForceDisabled(true);
      return;
    }

    setError("");
    onOtpRequested?.(phoneNumber);
  };

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
            نسيت كلمة المرور؟
          </h1>

          <p className="mx-auto max-w-[330px] text-sm leading-6 text-gray-500 dark:text-[#D2D2D2]">
            أدخل رقم الهاتف لإرسال كود استعادة كلمة المرور
          </p>
        </div>

        <div className="mb-5">
          <FormInput
            id="resetPhone"
            name="phoneNumber"
            label="رقم الهاتف"
            type="tel"
            placeholder="01XXXXXXXXX"
            value={phoneNumber}
            onChange={(event) => {
              setPhoneNumber(event.target.value);
              setError("");
            }}
            autoComplete="tel"
            error={error}
            showErrorText={false}
          />
        </div>

        <PrimaryButton
          disabled={forceDisabled || phoneNumber.trim().length === 0}
        >
          إرسال كود التحقق
        </PrimaryButton>

        <p className="mt-5 text-center text-sm text-gray-900 dark:text-[#F0F0F0]">
          هل تذكرت كلمة المرور؟{" "}
          <Link to="/login" className="font-semibold underline">
            تسجيل الدخول
          </Link>
        </p>
      </form>
    </section>
  );
}
