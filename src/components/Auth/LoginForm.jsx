import { useState } from "react";
import { Link } from "react-router-dom";
import FormInput from "../ui/FormInput";
import PrimaryButton from "../ui/PrimaryButton";

export default function LoginForm() {
  const [formData, setFormData] = useState({
    phoneNumber: "",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const [rememberMe, setRememberMe] = useState(false);

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

    const newErrors = {};

    if (!formData.phoneNumber) {
      newErrors.phoneNumber = "رقم الهاتف مطلوب";
    }

    if (!formData.password) {
      newErrors.password = "كلمة المرور مطلوبة";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    if (
      formData.phoneNumber !== "0155646677" ||
      formData.password !== "12345678"
    ) {
      setErrors({
        phoneNumber: " ",
        password: " ",
        general: "رقم الهاتف أو كلمة المرور غير صحيحة",
      });
      return;
    }

    console.log("Login data:", {
      ...formData,
      rememberMe,
    });
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

        <PrimaryButton disabled={false}>تسجيل دخول</PrimaryButton>

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
