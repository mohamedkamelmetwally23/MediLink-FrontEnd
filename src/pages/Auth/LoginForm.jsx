import LoginIllustrationPanel from "../../components/Auth/LoginIllustrationPanel";
import LoginForm from "../../components/Auth/LoginForm";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen w-full items-center justify-center bg-[#C7D6D9] p-4">
      <div className="flex h-[760px] w-full max-w-7xl flex-row-reverse overflow-hidden bg-white">
        <LoginIllustrationPanel />
        <LoginForm />
      </div>
    </main>
  );
}