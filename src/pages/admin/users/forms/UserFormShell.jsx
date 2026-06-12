import { ArrowRight, Pencil } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function UserFormShell({
  title,
  subtitle,
  children,
  returnTo = "/admin/users",
}) {
  const navigate = useNavigate();

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
      return;
    }

    navigate(returnTo);
  };

  return (
    <section>
      <header className="relative flex min-h-[120px] items-end justify-start bg-white px-6 pb-8 shadow-sm dark:bg-[#3a3a3a] lg:px-8">
        <div className="text-right mr-10 lg:mr-0">
          <h1 className="text-2xl font-bold lg:text-3xl">{title}</h1>
          <p className="text-sm text-gray-500 dark:text-gray-300 mt-3">{subtitle}</p>
        </div>

        <button
          type="button"
          onClick={handleBack}
          className="absolute left-6 bottom-8 inline-flex h-11 items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 text-sm font-semibold text-[#333] shadow-sm transition hover:border-cyan-300 hover:text-[#18b9d4] dark:border-white/10 dark:bg-[#454545] dark:text-white lg:left-8"
        >
          <ArrowRight size={18} />
          رجوع
        </button>
      </header>

      <div className="p-4 sm:p-6 lg:p-8">
        <div className="mx-auto grid max-w-[1072px] gap-8 rounded-xl bg-white p-6 shadow-[0_0_20px_rgba(0,0,0,0.08)] dark:bg-[#3f3f3f] lg:grid-cols-[180px_1fr] lg:p-10">
          <div className="flex justify-center lg:justify-start">
            <div className="relative h-44 w-44">
              <div className="absolute inset-0 overflow-hidden rounded-full bg-[#d1d1d1] dark:bg-[#5a5a5a]">
                <div className="absolute left-1/2 top-11 h-12 w-12 -translate-x-1/2 rounded-full border-[8px] border-[#6f6f6f]" />
                <div className="absolute bottom-[-18px] left-1/2 h-24 w-36 -translate-x-1/2 rounded-t-full border-[8px] border-b-0 border-[#6f6f6f]" />
              </div>
              <button
                type="button"
                aria-label="تغيير الصورة"
                className="absolute bottom-7 right-0 grid h-10 w-10 place-items-center rounded-full bg-cyan-400 text-white"
              >
                <Pencil size={20} />
              </button>
            </div>
          </div>

          {children}
        </div>
      </div>
    </section>
  );
}
