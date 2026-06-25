import { useState } from "react";
import { toast } from "react-toastify";
import FormInput from "../ui/FormInput";
import PrimaryButton from "../ui/PrimaryButton";
import { resetPassword } from "../../services/authApi";
import { validateStrongPassword } from "../../utils/passwordValidation";
import { Link } from "react-router";

export default function NewPasswordForm({ phoneNumber, onSuccess }) {
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [forceDisabled, setForceDisabled] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setErrors({});
    setForceDisabled(false);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const nextErrors = {};
    const phone = String(phoneNumber || "").trim();
    const passwordError = validateStrongPassword(formData.password);

    if (!phone) {
      nextErrors.general = "رقم الهاتف غير متاح، ابدأ استعادة كلمة المرور من جديد";
    }

    if (passwordError) {
      nextErrors.password = passwordError;
    }

    if (!formData.confirmPassword) {
      nextErrors.confirmPassword = "تأكيد كلمة المرور مطلوب";
    } else if (formData.confirmPassword !== formData.password) {
      nextErrors.confirmPassword = "كلمتا المرور غير متطابقتين";
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      setForceDisabled(true);
      toast.error("راجع بيانات كلمة المرور");
      return;
    }

    setIsSubmitting(true);
    try {
      await resetPassword({
        phone,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
      });
      toast.success("تم تغيير كلمة المرور بنجاح");
      onSuccess?.();
    } catch (error) {
      toast.error(error.message || "تعذر تغيير كلمة المرور");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormFilled =
    formData.password.trim().length > 0 &&
    formData.confirmPassword.trim().length > 0;

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
            إنشاء كلمة مرور جديدة
          </h1>

          <p className="mx-auto max-w-[330px] text-sm leading-6 text-gray-500 dark:text-[#D2D2D2]">
            أدخل كلمة مرور جديدة لحسابك
          </p>
        </div>

        <div className="space-y-4">
          <FormInput
            id="newPassword"
            name="password"
            label="كلمة المرور الجديدة"
            type="password"
            placeholder="ادخل كلمة مرور"
            value={formData.password}
            onChange={handleChange}
            autoComplete="new-password"
            error={errors.password}
            showErrorText={false}
          />

          <FormInput
            id="confirmNewPassword"
            name="confirmPassword"
            label="تأكيد كلمة المرور"
            type="password"
            placeholder="أعد إدخال كلمة المرور"
            value={formData.confirmPassword}
            onChange={handleChange}
            autoComplete="new-password"
            error={errors.confirmPassword}
            showErrorText={false}
          />
        </div>

        <div className="mt-7">
          <PrimaryButton
            disabled={isSubmitting || forceDisabled || !isFormFilled}
          >
            {isSubmitting ? "جاري الحفظ..." : "حفظ كلمة المرور"}
          </PrimaryButton>
        </div>
      </form>
    </section>
  );
}
