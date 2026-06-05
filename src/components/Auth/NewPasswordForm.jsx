import { useState } from "react";
import { toast } from "react-toastify";
import FormInput from "../ui/FormInput";
import PrimaryButton from "../ui/PrimaryButton";

export default function NewPasswordForm({ onSuccess }) {
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setErrors({});
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const nextErrors = {};

    if (!formData.password) {
      nextErrors.password = "كلمة المرور مطلوبة";
    } else if (formData.password.length < 8) {
      nextErrors.password = "كلمة المرور يجب ألا تقل عن 8 أحرف";
    }

    if (!formData.confirmPassword) {
      nextErrors.confirmPassword = "تأكيد كلمة المرور مطلوب";
    } else if (formData.confirmPassword !== formData.password) {
      nextErrors.confirmPassword = "كلمتا المرور غير متطابقتين";
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      toast.error("راجع بيانات كلمة المرور");
      return;
    }

    setIsSubmitting(true);
    window.setTimeout(() => {
      setIsSubmitting(false);
      toast.success("تم تغيير كلمة المرور بنجاح");
      onSuccess?.();
    }, 700);
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
            placeholder="أدخل كلمة المرور الجديدة"
            value={formData.password}
            onChange={handleChange}
            autoComplete="new-password"
            error={errors.password}
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
          />
        </div>

        <div className="mt-7">
          <PrimaryButton disabled={isSubmitting}>
            {isSubmitting ? "جاري الحفظ..." : "حفظ كلمة المرور"}
          </PrimaryButton>
        </div>
      </form>
    </section>
  );
}
