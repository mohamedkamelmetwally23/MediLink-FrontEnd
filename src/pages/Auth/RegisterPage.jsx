import AuthIllustrationPanel from "../../components/Auth/AuthIllustrationPanel";
import RegisterForm from "../../components/Auth/RegisterForm";

export default function RegisterPage() {
  return (
    <main className="flex min-h-screen w-full items-center justify-center bg-[#C7D6D9] p-5">
      <div className="flex min-h-[900px] w-full max-w-7xl flex-row-reverse overflow-hidden bg-white">
        <AuthIllustrationPanel />
        <RegisterForm />
      </div>
    </main>
  );
}