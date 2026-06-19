import { useState } from "react";
import { toast } from "react-toastify";
import AuthSkeleton from "../../components/Auth/AuthSkeleton";
import AuthSuccess from "../../components/Auth/AuthSuccess";
import NewPasswordForm from "../../components/Auth/NewPasswordForm";
import OtpForm from "../../components/Auth/OtpForm";
import ResetPasswordForm from "../../components/Auth/ResetPasswordForm";
import ResetPasswordIllustrationPanel from "../../components/Auth/ResetPasswordIllustrationPanel";

function createDemoOtp() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export default function ResetPasswordPage() {
  const [step, setStep] = useState("form");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otpHint, setOtpHint] = useState("");

  const handleOtpRequested = (nextPhoneNumber) => {
    const nextOtpHint = createDemoOtp();

    setPhoneNumber(nextPhoneNumber);
    setOtpHint(nextOtpHint);
    setStep("loading");

    window.setTimeout(() => {
      toast.info("تم إرسال كود الاستعادة");
      setStep("otp");
    }, 700);
  };

  const handleOtpResend = () => {
    setOtpHint(createDemoOtp());
    toast.info("تم إرسال كود جديد");
  };

  const handleOtpVerified = (otp) => {
    if (otp !== otpHint) {
      throw new Error("كود التحقق غير صحيح");
    }

    setStep("new-password");
  };

  const handleBackToForm = () => {
    setOtpHint("");
    setStep("form");
  };

  const renderContent = () => {
    if (step === "loading") {
      return <AuthSkeleton title="جاري إرسال كود الاستعادة..." />;
    }

    if (step === "otp") {
      return (
        <OtpForm
          phoneNumber={phoneNumber}
          title="تأكيد رقم الهاتف"
          description="أدخل كود التحقق لاستعادة كلمة المرور"
          otpHint={otpHint}
          submitText="تأكيد"
          onBack={handleBackToForm}
          onResend={handleOtpResend}
          onVerified={handleOtpVerified}
        />
      );
    }

    if (step === "new-password") {
      return <NewPasswordForm onSuccess={() => setStep("success")} />;
    }

    if (step === "success") {
      return (
        <AuthSuccess
          title="تم تغيير كلمة المرور بنجاح"
          description="يمكنك الآن تسجيل الدخول باستخدام كلمة المرور الجديدة."
          buttonText="تسجيل الدخول"
          to="/login"
        />
      );
    }

    return <ResetPasswordForm onOtpRequested={handleOtpRequested} />;
  };

  return (
    <main className="flex min-h-screen w-full items-center justify-center bg-[#D3E0E4] p-4 dark:bg-[#151515]">
      <div className="flex w-full max-w-[1200px] flex-col items-stretch overflow-hidden rounded-[2rem] bg-white shadow-[0_25px_80px_-35px_rgba(0,0,0,0.25)] dark:bg-[#252525] lg:flex-row-reverse lg:min-h-[760px]">
        {step === "success" ? null : (
          <ResetPasswordIllustrationPanel
            onBack={step === "otp" ? handleBackToForm : undefined}
          />
        )}
        {renderContent()}
      </div>
    </main>
  );
}
