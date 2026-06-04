import { useState } from "react";
import { Link } from "react-router-dom";
import FormInput from "../ui/FormInput";
import PrimaryButton from "../ui/PrimaryButton";

export default function ResetPasswordForm() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [error, setError] = useState("");
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!phoneNumber.trim()) {
      setError("رقم الهاتف مطلوب");
      return;
    }

    if (!/^01[0-9]{9}$/.test(phoneNumber)) {
      setError("رقم الهاتف غير صحيح");
      return;
    }

    setError("");
    setIsSent(true);

    console.log("Reset password phone:", phoneNumber);

    // هنا بعدين هنربط API إرسال كود إعادة التعيين
  };

  return (
    <section className="flex w-1/2 items-center justify-center bg-white px-10">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-[430px] text-right"
        dir="rtl"
        autoComplete="off"
      >
        <div className="mb-10 text-center">
          <h1 className="mb-2 text-3xl font-semibold text-gray-900">
            نسيت كلمة المرور؟
          </h1>

          <p className="mx-auto max-w-[330px] text-sm leading-6 text-gray-500">
            أدخل رقم الهاتف لاستعادة كلمة المرور الخاصة بك
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
              setIsSent(false);
            }}
            autoComplete="tel"
            error={error}
          />
        </div>

        {isSent && (
          <p className="mb-5 text-center text-sm font-medium text-[#05ADE8]">
            تم إرسال رابط استعادة كلمة المرور إلى رقم الهاتف
          </p>
        )}

        <PrimaryButton disabled={false}>إرسال رقم الهاتف</PrimaryButton>

        <p className="mt-5 text-center text-sm text-gray-900">
          هل تذكرت كلمة المرور؟{" "}
          <Link to="/login" className="font-semibold underline">
            تسجيل الدخول
          </Link>
        </p>
      </form>
    </section>
  );
}