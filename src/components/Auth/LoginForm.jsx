import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import FormInput from "../ui/FormInput";
import PrimaryButton from "../ui/PrimaryButton";
import {
  getAccountRole,
  loginUser,
  saveAuthSession,
} from "../../services/authApi";


export default function LoginForm() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    phoneNumber: "",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const [rememberMe, setRememberMe] = useState(false);
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

    const newErrors = {};

    if (!formData.phoneNumber) {
      newErrors.phoneNumber = "رقم الهاتف مطلوب";
    } else if (!/^01[0-9]{9}$/.test(formData.phoneNumber)) {
      newErrors.phoneNumber = "رقم الهاتف غير صحيح";
    }

    if (!formData.password) {
      newErrors.password = "كلمة المرور مطلوبة";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors({
        ...newErrors,
        general: "رقم الهاتف أو كلمة المرور غير صحيحة",
      });
      setForceDisabled(true);
      return;
    }

    setIsSubmitting(true);
    try {
      const data = await loginUser({
        phone: formData.phoneNumber.trim(),
        password: formData.password,
      });

      saveAuthSession(data);
      toast.success("تم تسجيل الدخول بنجاح");
      const role = getAccountRole(data);
      navigate(
        role === "admin"
          ? "/admin/dashboard"
          : role === "doctor"
            ? "/doctor/dashboard"
            : role === "patient" || role === "user"
              ? "/patient"
              : "/",
      );
    } catch (error) {
      setErrors({
        phoneNumber: " ",
        password: " ",
        general: error.message || "رقم الهاتف أو كلمة المرور غير صحيحة",
      });
      setForceDisabled(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isInputFilled =
    formData.phoneNumber.trim().length > 0 &&
    formData.password.trim().length > 0;

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
            تسجيل دخول
          </h1>

          <p className="text-sm text-gray-500 dark:text-[#D2D2D2]">
            مرحبًا بعودتك، سجل دخولك للوصول إلى حسابك
          </p>
        </div>

        <div className="mb-5">
          <FormInput
            id="loginPhone"
            name="phoneNumber"
            label="رقم الهاتف"
            type="tel"
            placeholder="01XXXXXXXXX"
            value={formData.phoneNumber}
            onChange={handleChange}
            autoComplete="tel"
            error={errors.phoneNumber}
            showErrorText={false}
          />
        </div>

        <div className="mb-3">
          <FormInput
            id="loginPassword"
            name="password"
            label="كلمة المرور"
            type="password"
            placeholder="أدخل كلمة المرور"
            value={formData.password}
            onChange={handleChange}
            autoComplete="current-password"
            error={errors.password}
            showErrorText={false}
          />
        </div>

        <div className="mb-8 flex items-center justify-between">
          <Link
            to="/forgot-password"
            className="text-xs font-semibold text-gray-900 underline dark:text-[#F0F0F0]"
          >
            نسيت كلمة المرور؟
          </Link>

          <label className="flex cursor-pointer items-center gap-2 text-xs text-gray-900 dark:text-[#F0F0F0]">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(event) => setRememberMe(event.target.checked)}
              className="checkbox checkbox-xs rounded border-gray-400"
            />
            <span>تذكرني</span>
          </label>
        </div>

        {errors.general && (
          <p className="mb-6 text-center text-sm font-medium text-[#C51F26]">
            {errors.general}
          </p>
        )}

        <PrimaryButton
          disabled={isSubmitting || forceDisabled || !isInputFilled}
        >
          {isSubmitting ? "جاري تسجيل الدخول..." : "تسجيل دخول"}
        </PrimaryButton>

        <p className="mt-5 text-center text-sm text-gray-900 dark:text-[#F0F0F0]">
          ليس لديك حساب؟{" "}
          <Link to="/register" className="font-semibold underline">
            إنشاء حساب
          </Link>
        </p>
      </form>
    </section>
  );
}
