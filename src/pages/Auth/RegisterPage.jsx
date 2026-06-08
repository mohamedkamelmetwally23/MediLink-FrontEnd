import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import AuthIllustrationPanel from "../../components/Auth/AuthIllustrationPanel";
import AuthSkeleton from "../../components/Auth/AuthSkeleton";
import AuthSuccess from "../../components/Auth/AuthSuccess";
import OtpForm from "../../components/Auth/OtpForm";
import RegisterForm from "../../components/Auth/RegisterForm";
import { extractOtp, signupUser, verifyOtp } from "../../services/authApi";

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

export default function RegisterPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [step, setStep] = useState("form");
  const [registerFormData, setRegisterFormData] = useState(initialRegisterFormData);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otpHint, setOtpHint] = useState("");
  const stepParam = new URLSearchParams(location.search).get("step");
  const visibleStep = step === "otp" && stepParam !== "otp" ? "form" : step;

  const handleBackToForm = () => {
    setStep("form");
    navigate("/register", { replace: true });
  };

  const handleOtpRequested = async (signupPayload) => {
    const signupResponse = await signupUser(signupPayload);
    const nextOtpHint = extractOtp(signupResponse);

    setPhoneNumber(signupPayload.phone);
    setOtpHint(nextOtpHint);
    toast.success(
      nextOtpHint
        ? "تم إنشاء الحساب، استخدم كود التحقق الظاهر أمامك"
        : "تم إنشاء الحساب، راجع response للحصول على كود التحقق"
    );
    setStep("otp");
    navigate("/register?step=otp");
  };

  const handleOtpVerified = async (otp) => {
    await verifyOtp({ phone: phoneNumber, otp });
    setStep("success");
  };

  const renderContent = () => {
    if (visibleStep === "loading") {
      return <AuthSkeleton title="جاري إرسال كود التحقق..." />;
    }

    if (visibleStep === "otp") {
      return (
        <OtpForm
          phoneNumber={phoneNumber}
          title="تأكيد رقم الهاتف"
          description="أدخل كود التحقق المرسل إلى رقم الهاتف"
          otpHint={otpHint}
          submitText="تأكيد الحساب"
          onBack={handleBackToForm}
          onVerified={handleOtpVerified}
        />
      );
    }

    if (visibleStep === "success") {
      return (
        <AuthSuccess
          title="تم إنشاء الحساب بنجاح"
          description="تم تأكيد رقم هاتفك، يمكنك الآن تسجيل الدخول إلى حسابك."
          buttonText="تسجيل الدخول"
          to="/login"
        />
      );
    }

    return (
      <RegisterForm
        initialData={registerFormData}
        onDataChange={setRegisterFormData}
        onOtpRequested={handleOtpRequested}
      />
    );
  };

  return (
    <main className="flex min-h-screen w-full items-center justify-center bg-[#D3E0E4] p-4 dark:bg-[#151515]">
      <div className="flex w-full max-w-[1200px] flex-col items-stretch overflow-hidden rounded-[2rem] bg-white shadow-[0_25px_80px_-35px_rgba(0,0,0,0.25)] dark:bg-[#252525] lg:flex-row-reverse lg:min-h-[760px]">
        {visibleStep === "success" ? null : (
          <AuthIllustrationPanel
            onBack={visibleStep === "otp" ? handleBackToForm : undefined}
          />
        )}
        {renderContent()}
      </div>
    </main>
  );
}
