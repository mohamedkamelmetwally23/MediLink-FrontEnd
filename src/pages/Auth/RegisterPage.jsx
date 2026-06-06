import { useState } from "react";
import { toast } from "react-toastify";
import AuthIllustrationPanel from "../../components/Auth/AuthIllustrationPanel";
import AuthSkeleton from "../../components/Auth/AuthSkeleton";
import AuthSuccess from "../../components/Auth/AuthSuccess";
import OtpForm from "../../components/Auth/OtpForm";
import RegisterForm from "../../components/Auth/RegisterForm";
import { extractOtp, signupUser, verifyOtp } from "../../services/authApi";

export default function RegisterPage() {
  const [step, setStep] = useState("form");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otpHint, setOtpHint] = useState("");

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
  };

  const handleOtpVerified = async (otp) => {
    await verifyOtp({ phone: phoneNumber, otp });
    setStep("success");
  };

  const renderContent = () => {
    if (step === "loading") {
      return <AuthSkeleton title="جاري إرسال كود التحقق..." />;
    }

    if (step === "otp") {
      return (
        <OtpForm
          phoneNumber={phoneNumber}
          title="تأكيد رقم الهاتف"
          description="أدخل كود التحقق المرسل إلى رقم الهاتف"
          otpHint={otpHint}
          submitText="تأكيد الحساب"
          onBack={() => setStep("form")}
          onVerified={handleOtpVerified}
        />
      );
    }

    if (step === "success") {
      return (
        <AuthSuccess
          title="تم إنشاء الحساب بنجاح"
          description="تم تأكيد رقم هاتفك، يمكنك الآن تسجيل الدخول إلى حسابك."
          buttonText="تسجيل الدخول"
          to="/login"
        />
      );
    }

    return <RegisterForm onOtpRequested={handleOtpRequested} />;
  };

  return (
    <main className="flex min-h-screen w-full items-center justify-center bg-[#D3E0E4] p-4 dark:bg-[#151515]">
      <div className="flex w-full max-w-[1200px] flex-col items-stretch overflow-hidden rounded-[2rem] bg-white shadow-[0_25px_80px_-35px_rgba(0,0,0,0.25)] dark:bg-[#252525] lg:flex-row-reverse lg:min-h-[760px]">
        {step === "success" ? null : <AuthIllustrationPanel />}
        {renderContent()}
      </div>
    </main>
  );
}
