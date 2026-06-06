import { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import FormInput from "../ui/FormInput";
import FormSelect from "../ui/FormSelect";
import PrimaryButton from "../ui/PrimaryButton";
import { validateStrongPassword } from "../../utils/passwordValidation";

const days = Array.from({ length: 31 }, (_, i) => i + 1);
const months = [
  "يناير",
  "فبراير",
  "مارس",
  "أبريل",
  "مايو",
  "يونيو",
  "يوليو",
  "أغسطس",
  "سبتمبر",
  "أكتوبر",
  "نوفمبر",
  "ديسمبر",
];
const years = Array.from({ length: 60 }, (_, i) => 2025 - i);
const dayOptions = days.map((day) => ({ value: String(day), label: day }));
const monthOptions = months.map((month, index) => ({
  value: String(index + 1),
  label: month,
}));
const yearOptions = years.map((year) => ({ value: String(year), label: year }));

export default function RegisterForm({ onOtpRequested }) {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    birthDay: "",
    birthMonth: "",
    birthYear: "",
    gender: "",
    phoneNumber: "",
    password: "",
    confirmPassword: "",
    terms: false,
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    setErrors({});
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const newErrors = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = "الاسم الأول مطلوب";
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = "اسم العائلة مطلوب";
    }

    if (!formData.birthDay || !formData.birthMonth || !formData.birthYear) {
      newErrors.birthDate = "تاريخ الميلاد مطلوب";
    }

    if (!formData.gender) {
      newErrors.gender = "اختر الجنس";
    }

    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = "رقم الهاتف مطلوب";
    } else if (!/^01[0-9]{9}$/.test(formData.phoneNumber)) {
      newErrors.phoneNumber = "رقم الهاتف غير صحيح";
    }

    const passwordError = validateStrongPassword(formData.password);

    if (passwordError) {
      newErrors.password = passwordError;
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "تأكيد كلمة المرور مطلوب";
    } else if (formData.confirmPassword !== formData.password) {
      newErrors.confirmPassword = "كلمتا المرور غير متطابقتين";
    }

    if (!formData.terms) {
      newErrors.terms = "يجب الموافقة على الشروط والأحكام";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error("راجع بيانات التسجيل");
      return;
    }

    const signupPayload = {
      firstName: formData.firstName.trim(),
      lastName: formData.lastName.trim(),
      gender: formData.gender,
      phone: formData.phoneNumber.trim(),
      password: formData.password,
      confirmpassword: formData.confirmPassword,
      day: Number(formData.birthDay),
      month: Number(formData.birthMonth),
      year: Number(formData.birthYear),
    };

    setIsSubmitting(true);
    try {
      await onOtpRequested?.(signupPayload);
    } catch (error) {
      toast.error(error.message || "تعذر إنشاء الحساب");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="flex w-full items-center justify-center bg-white px-6 py-10 dark:bg-[#252525] lg:basis-1/2 lg:min-h-full lg:px-10">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-[520px] text-right"
        dir="rtl"
        autoComplete="off"
      >
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-3xl font-semibold text-gray-900 dark:text-[#F0F0F0]">
            إنشاء حساب جديد
          </h1>

          <p className="text-sm text-gray-500 dark:text-[#D2D2D2]">
            مرحبًا بك، سجل بياناتك للوصول إلى حسابك
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <FormInput
            id="registerFirstName"
            name="firstName"
            label="الاسم الأول"
            placeholder="الاسم الأول"
            value={formData.firstName}
            onChange={handleChange}
            autoComplete="given-name"
            error={errors.firstName}
          />
          <FormInput
            id="registerLastName"
            name="lastName"
            label="اسم العائلة"
            placeholder="اسم العائلة"
            value={formData.lastName}
            onChange={handleChange}
            autoComplete="family-name"
            error={errors.lastName}
          />
        </div>

        <div className="mt-4">
          <label className="mb-2 block text-sm font-medium text-gray-900 dark:text-[#F0F0F0]">
            تاريخ الميلاد
          </label>

          <div className="grid gap-3 sm:grid-cols-3">
            <FormSelect
              id="birthDay"
              name="birthDay"
              value={formData.birthDay}
              onChange={handleChange}
              placeholder="اليوم"
              options={dayOptions}
              error={errors.birthDate}
            />

            <FormSelect
              id="birthMonth"
              name="birthMonth"
              value={formData.birthMonth}
              onChange={handleChange}
              placeholder="الشهر"
              options={monthOptions}
              error={errors.birthDate}
            />

            <FormSelect
              id="birthYear"
              name="birthYear"
              value={formData.birthYear}
              onChange={handleChange}
              placeholder="السنة"
              options={yearOptions}
              error={errors.birthDate}
            />
          </div>

          {errors.birthDate && (
            <p className="mt-2 text-xs text-[#C51F26]">{errors.birthDate}</p>
          )}
        </div>

        <div className="mt-5">
          <label className="mb-2 block text-sm font-medium text-gray-900 dark:text-[#F0F0F0]">
            الجنس
          </label>
          <div className="grid grid-cols-2 gap-3">
            {[
              { value: "female", label: "أنثى" },
              { value: "male", label: "ذكر" },
            ].map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  setFormData((prev) => ({ ...prev, gender: option.value }));
                  setErrors({});
                }}
                className={
                  formData.gender === option.value
                    ? "btn h-12 rounded-lg border-none bg-gradient-to-r from-[#05ADE8] to-[#6CCCC8] text-sm font-normal text-white hover:from-[#05ADE8] hover:to-[#6CCCC8]"
                    : "btn h-12 rounded-lg border border-gray-300 bg-white text-sm font-normal text-gray-800 hover:bg-slate-50 dark:border-[#3B3B3B] dark:bg-[#252525] dark:text-[#F0F0F0] dark:hover:bg-[#303030]"
                }
              >
                {option.label}
              </button>
            ))}
          </div>

          {errors.gender && (
            <p className="mt-2 text-xs text-[#C51F26]">{errors.gender}</p>
          )}
        </div>

        <div className="mt-5 space-y-4">
          <FormInput
            id="registerPhone"
            name="phoneNumber"
            label="رقم الهاتف"
            type="tel"
            placeholder="01XXXXXXXXX"
            value={formData.phoneNumber}
            onChange={handleChange}
            autoComplete="tel"
            error={errors.phoneNumber}
          />

          <FormInput
            id="registerPassword"
            name="password"
            label="كلمة المرور"
            type="password"
            placeholder="مثال: Password1"
            value={formData.password}
            onChange={handleChange}
            autoComplete="new-password"
            error={errors.password}
          />

          <FormInput
            id="registerConfirmPassword"
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

        <div className="mt-5">
          <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-900 dark:text-[#F0F0F0]">
            <input
              type="checkbox"
              name="terms"
              checked={formData.terms}
              onChange={handleChange}
              className="checkbox checkbox-xs rounded border-gray-400"
            />
            <span>أوافق على جميع الشروط والأحكام</span>
          </label>
          {errors.terms && (
            <p className="mt-2 text-xs text-[#C51F26]">{errors.terms}</p>
          )}
        </div>

        <div className="mt-7">
          <PrimaryButton disabled={isSubmitting}>
            {isSubmitting ? "جاري إنشاء الحساب..." : "إنشاء حساب"}
          </PrimaryButton>
        </div>

        <p className="mt-5 text-center text-sm text-gray-900 dark:text-[#F0F0F0]">
          لديك حساب بالفعل؟{" "}
          <Link to="/login" className="font-semibold underline">
            تسجيل الدخول
          </Link>
        </p>
      </form>

    </section>
  );
}
