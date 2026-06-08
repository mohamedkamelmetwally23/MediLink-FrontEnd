import { Camera } from "lucide-react";

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
        <div className="mx-auto grid max-w-[1072px] gap-8 rounded-xl bg-white p-6 shadow-[0_0_20px_rgba(0,0,0,0.08)] dark:bg-[#3f3f3f] lg:grid-cols-[150px_1fr] lg:p-10">
          <div className="flex justify-center lg:justify-start">
            <div className="relative h-32 w-32 rounded-full bg-[#d1d1d1] dark:bg-[#5a5a5a]">
              <div className="absolute inset-5 rounded-full border-[6px] border-[#6a6a6a] border-b-transparent" />
              <div className="absolute bottom-0 left-1/2 h-14 w-24 -translate-x-1/2 rounded-t-full border-[6px] border-[#6a6a6a] border-b-0" />
              <button
                type="button"
                aria-label="تغيير الصورة"
                className="absolute bottom-4 right-0 grid h-8 w-8 place-items-center rounded-full bg-cyan-400 text-white"
              >
                <Camera size={17} />
              </button>
            </div>
          </div>

          {children}
        </div>
      </div>
    </section>
  );
}
