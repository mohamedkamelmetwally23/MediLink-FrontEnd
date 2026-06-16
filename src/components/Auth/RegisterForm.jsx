import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { CalendarDays } from "lucide-react";
import FormInput from "../ui/FormInput";
import PrimaryButton from "../ui/PrimaryButton";
import { validateStrongPassword } from "../../utils/passwordValidation";

const minimumAge = 18;
const maximumAge = 75;
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
const registerErrorToastId = "register-error";
const initialRegisterFormData = {
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
};

function showRegisterError(message) {
  toast.error(message, { toastId: registerErrorToastId });
}

function padDatePart(value) {
  return String(value).padStart(2, "0");
}

function formatDateInputValue(date) {
  return [
    date.getFullYear(),
    padDatePart(date.getMonth() + 1),
    padDatePart(date.getDate()),
  ].join("-");
}

function getAgeBoundaryDate(age) {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  date.setFullYear(date.getFullYear() - age);
  return date;
}

function getBirthDateLimits() {
  return {
    min: getAgeBoundaryDate(maximumAge),
    max: getAgeBoundaryDate(minimumAge),
  };
}

function getBirthDateValue(formData) {
  if (!formData.birthDay || !formData.birthMonth || !formData.birthYear) {
    return "";
  }

  return `${formData.birthYear}-${padDatePart(formData.birthMonth)}-${padDatePart(
    formData.birthDay,
  )}`;
}

function parseBirthDate(formData) {
  const day = Number(formData.birthDay);
  const month = Number(formData.birthMonth);
  const year = Number(formData.birthYear);

  if (!day || !month || !year) {
    return null;
  }

  const date = new Date(year, month - 1, day);
  date.setHours(0, 0, 0, 0);

  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }

  return date;
}

function RequiredLabel({ children, htmlFor, error }) {
  return (
    <label
      htmlFor={htmlFor}
      className={`mb-2 inline-flex items-center gap-1 text-sm font-medium ${
        error ? "text-[#C51F26]" : "text-gray-900 dark:text-[#F0F0F0]"
      }`}
    >
      <span>{children}</span>
      <span className="text-[#C51F26]">*</span>
    </label>
  );
}

function BirthDateSegment({ value, placeholder, error, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex h-12 w-full items-center justify-end rounded-lg border bg-base-200 px-4 text-right text-sm shadow-sm transition hover:text-[#05ADE8] focus:outline-none focus:ring-1 dark:bg-[#303030] ${
        error
          ? "border-[#C51F26] text-[#C51F26] focus:ring-[#C51F26]"
          : "border-transparent text-gray-800 focus:ring-[#05ADE8] dark:text-[#F0F0F0]"
      }`}
    >
      <span
        className={
          value ? "" : "text-gray-400 dark:text-[#8A8A8A]"
        }
      >
        {value || placeholder}
      </span>
    </button>
  );
}

export default function RegisterForm({
  onOtpRequested,
  initialData = initialRegisterFormData,
  onDataChange,
}) {
  const [formData, setFormData] = useState(() => ({
    ...initialRegisterFormData,
    ...initialData,
  }));
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [forceDisabled, setForceDisabled] = useState(false);
  const birthDateInputRef = useRef(null);
  const birthDateLimits = getBirthDateLimits();
  const minBirthDate = formatDateInputValue(birthDateLimits.min);
  const maxBirthDate = formatDateInputValue(birthDateLimits.max);

  const updateFormData = (nextFormData) => {
    setFormData(nextFormData);
    onDataChange?.(nextFormData);
    setErrors({});
  };

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;

    updateFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
    setForceDisabled(false);
  };

  const handleBirthDateChange = (event) => {
    const [year = "", month = "", day = ""] = event.target.value.split("-");

    updateFormData({
      ...formData,
      birthDay: day ? String(Number(day)) : "",
      birthMonth: month ? String(Number(month)) : "",
      birthYear: year,
    });
  };

  const openBirthDatePicker = () => {
    const input = birthDateInputRef.current;

    if (!input) {
      return;
    }

    input.focus({ preventScroll: true });

    if (typeof input.showPicker === "function") {
      input.showPicker();
      return;
    }

    input.click();
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const newErrors = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = "الاسم الأول مطلوب";
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = "الاسم الأخير مطلوب";
    }

    const birthDate = parseBirthDate(formData);

    if (!formData.birthDay || !formData.birthMonth || !formData.birthYear) {
      newErrors.birthDate = "تاريخ الميلاد مطلوب";
    } else if (!birthDate) {
      newErrors.birthDate = "تاريخ الميلاد غير صحيح";
    } else if (
      birthDate < birthDateLimits.min ||
      birthDate > birthDateLimits.max
    ) {
      newErrors.birthDate = "السن يجب أن يكون من 18 إلى 75 سنة";
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
      setForceDisabled(true);
      showRegisterError("راجع بيانات التسجيل");
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
      showRegisterError(error.message || "تعذر إنشاء الحساب");
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
            required
            placeholder="الاسم الأول"
            value={formData.firstName}
            onChange={handleChange}
            autoComplete="given-name"
            error={errors.firstName}
          />
          <FormInput
            id="registerLastName"
            name="lastName"
            label="الاسم الأخير"
            required
            placeholder="الاسم الأخير"
            value={formData.lastName}
            onChange={handleChange}
            autoComplete="family-name"
            error={errors.lastName}
          />
        </div>

        <div className="mt-4">
          <RequiredLabel htmlFor="birthDate" error={errors.birthDate}>
            تاريخ الميلاد
          </RequiredLabel>

          <div className="relative grid grid-cols-2 gap-3 sm:grid-cols-[1fr_1fr_1fr_48px]">
            <BirthDateSegment
              placeholder="اليوم"
              value={formData.birthDay}
              onClick={openBirthDatePicker}
              error={errors.birthDate}
            />

            <BirthDateSegment
              placeholder="الشهر"
              value={
                formData.birthMonth
                  ? months[Number(formData.birthMonth) - 1]
                  : ""
              }
              onClick={openBirthDatePicker}
              error={errors.birthDate}
            />

            <BirthDateSegment
              placeholder="السنة"
              value={formData.birthYear}
              onClick={openBirthDatePicker}
              error={errors.birthDate}
            />

            <button
              type="button"
              onClick={openBirthDatePicker}
              aria-label="فتح أجندة تاريخ الميلاد"
              className={`flex h-12 items-center justify-center rounded-lg border bg-base-200 text-gray-500 shadow-sm transition hover:text-[#05ADE8] focus:outline-none focus:ring-1 dark:bg-[#303030] dark:text-[#D2D2D2] ${
                errors.birthDate
                  ? "border-[#C51F26] focus:ring-[#C51F26]"
                  : "border-transparent focus:ring-[#05ADE8]"
              }`}
            >
              <CalendarDays size={18} />
            </button>

            <input
              ref={birthDateInputRef}
              id="birthDate"
              name="birthDate"
              type="date"
              value={getBirthDateValue(formData)}
              onChange={handleBirthDateChange}
              min={minBirthDate}
              max={maxBirthDate}
              tabIndex={-1}
              aria-hidden="true"
              className="absolute left-3 top-1/2 h-px w-px -translate-y-1/2 opacity-0"
            />
          </div>

          {errors.birthDate && (
            <p className="mt-2 text-xs text-[#C51F26]">{errors.birthDate}</p>
          )}
        </div>

        <div className="mt-5">
          <RequiredLabel error={errors.gender}>
            الجنس
          </RequiredLabel>
          <div className="grid grid-cols-2 gap-3">
            {[
              { value: "female", label: "أنثى" },
              { value: "male", label: "ذكر" },
            ].map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  updateFormData({ ...formData, gender: option.value });
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
            required
            type="tel"
            placeholder="01XXXXXXXXX"
            value={formData.phoneNumber}
            onChange={handleChange}
            autoComplete="tel"
            error={errors.phoneNumber}
            showErrorText={false}
          />

          <FormInput
            id="registerPassword"
            name="password"
            label="كلمة المرور"
            required
            type="password"
            placeholder="ادخل كلمة مرور"
            value={formData.password}
            onChange={handleChange}
            autoComplete="new-password"
            error={errors.password}
            showErrorText={true}
          />

          <FormInput
            id="registerConfirmPassword"
            name="confirmPassword"
            label="تأكيد كلمة المرور"
            required
            type="password"
            placeholder="أعد إدخال كلمة المرور"
            value={formData.confirmPassword}
            onChange={handleChange}
            autoComplete="new-password"
            error={errors.confirmPassword}
            showErrorText={false}
          />
        </div>

        <div className="mt-5">
          <div className="flex flex-wrap items-center gap-2 text-sm text-gray-900 dark:text-[#F0F0F0]">
            <input
              id="registerTerms"
              type="checkbox"
              name="terms"
              checked={formData.terms}
              onChange={handleChange}
              className="checkbox checkbox-xs rounded border-gray-400"
            />
            <label htmlFor="registerTerms" className="cursor-pointer">
              أوافق على جميع
            </label>
            <Link to="/legal" className="font-semibold text-[#05ADE8] underline underline-offset-4">
              الشروط والأحكام
            </Link>
          </div>
          {errors.terms && (
            <p className="mt-2 text-xs text-[#C51F26]">{errors.terms}</p>
          )}
        </div>

        <div className="mt-7">
          <PrimaryButton
            disabled={
              isSubmitting ||
              forceDisabled ||
              !formData.firstName.trim() ||
              !formData.lastName.trim() ||
              !formData.birthDay ||
              !formData.birthMonth ||
              !formData.birthYear ||
              !formData.gender ||
              !formData.phoneNumber.trim() ||
              !formData.password.trim() ||
              !formData.confirmPassword.trim() ||
              !formData.terms
            }
          >
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
