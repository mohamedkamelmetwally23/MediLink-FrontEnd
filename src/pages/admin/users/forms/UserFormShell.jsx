import { Pencil } from "lucide-react";

export default function UserFormShell({ title, subtitle, children }) {
  return (
    <section>
      <header className="flex min-h-[120px] items-end justify-start bg-white px-6 pb-8 shadow-sm dark:bg-[#3a3a3a] lg:px-8">
        <div className="text-right mr-10 lg:mr-0">
          <h1 className="text-2xl font-bold lg:text-3xl">{title}</h1>
          <p className="text-sm text-gray-500 dark:text-gray-300 mt-3">{subtitle}</p>
        </div>
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
