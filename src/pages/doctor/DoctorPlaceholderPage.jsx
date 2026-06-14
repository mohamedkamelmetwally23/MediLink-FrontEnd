export default function DoctorPlaceholderPage({ title, subtitle }) {
  return (
    <section className="min-h-screen bg-[#f8fbfc] text-[#333] dark:bg-[#2f2f2f] dark:text-white">
      <header className="flex min-h-[100px] items-start bg-white px-4 pt-[30px] shadow-[0_1px_8px_rgba(0,0,0,0.03)] dark:bg-[#3a3a3a] sm:px-6 lg:px-[24px]">
        <div className="text-right">
          <h1 className="text-[22px] font-bold leading-7 text-[#333] dark:text-white">
            {title}
          </h1>
          <p className="mt-1 text-[13px] leading-5 text-[#8a8a8a] dark:text-gray-300">
            {subtitle}
          </p>
        </div>
      </header>
    </section>
  );
}
