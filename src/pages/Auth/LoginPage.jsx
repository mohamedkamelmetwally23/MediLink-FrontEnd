import LoginIllustrationPanel from "../../components/Auth/LoginIllustrationPanel";
import LoginForm from "../../components/Auth/LoginForm";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen w-full items-center justify-center bg-[#D3E0E4] p-4 dark:bg-[#151515]">
      <div className="flex w-full max-w-[1200px] flex-col items-stretch overflow-hidden rounded-[2rem] bg-white shadow-[0_25px_80px_-35px_rgba(0,0,0,0.25)] dark:bg-[#252525] lg:flex-row-reverse lg:min-h-[760px]">
        <LoginIllustrationPanel />
        <LoginForm />
      </div>
    </main>
  );
}
