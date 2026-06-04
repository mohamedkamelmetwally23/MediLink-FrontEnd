import ResetPasswordIllustrationPanel from "../../components/Auth/ResetPasswordIllustrationPanel";
import ResetPasswordForm from "../../components/Auth/ResetPasswordForm";

export default function ResetPasswordPage() {
  return (
    <main className="flex min-h-screen w-full items-center justify-center bg-[#C7D6D9] p-4">
      <div className="flex h-[760px] w-full max-w-7xl flex-row-reverse overflow-hidden bg-white">
        <ResetPasswordIllustrationPanel />
        <ResetPasswordForm />
      </div>
    </main>
  );
}