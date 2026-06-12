import { ArrowRight, Bell } from "lucide-react";
import { Link } from "react-router-dom";

const activities = [
  "تم حجز موعد جديد",
  "تم حجز موعد جديد",
  "تم حجز موعد جديد",
  "تم حجز موعد جديد",
  "تم حجز موعد جديد",
  "تم حجز موعد جديد",
  "تم حجز موعد جديد",
  "تم حجز موعد جديد",
  "تم حجز موعد جديد",
  "تم إلغاء موعد",
  "تم تحديث البيانات",
  "تم تحديث البيانات",
  "تم تحديث البيانات",
  "تم تحديث البيانات",
];

export default function ActivityPage() {
  return (
    <section className="min-h-screen bg-[#f8fbfc] text-[#333] dark:bg-[#2f2f2f] dark:text-white">
      <header className="flex min-h-[120px] items-start justify-between gap-4 bg-white px-4 pt-[39px] shadow-[0_1px_8px_rgba(0,0,0,0.03)] dark:bg-[#3a3a3a] sm:px-6 lg:px-[32px]">
        <div className="text-right">
          <h1 className="text-[26px] font-bold leading-[31px] text-[#333] dark:text-white">
            النشاط الأخير
          </h1>
          <p className="mt-1 text-[16px] leading-5 text-[#8a8a8a] dark:text-gray-300">
            اخر نشاطات المستخدمين
          </p>
        </div>

        <Link
          to="/admin/dashboard"
          className="flex h-[38px] items-center gap-2 rounded-[8px] px-2 text-[15px] font-semibold text-[#30bfd6] transition hover:bg-[#eafbfd] dark:hover:bg-white/10"
          dir="ltr"
        >
          <ArrowRight size={18} strokeWidth={2} />
          <span>رجوع</span>
        </Link>
      </header>

      <main className="px-4 py-[30px] sm:px-6 lg:px-[32px]">
        <section className="min-h-[805px] rounded-[10px] bg-white px-[12px] py-[32px] shadow-[0_4px_20px_rgba(0,0,0,0.08)] dark:bg-[#505050]">
          {activities.map((text, index) => (
            <ActivityRow key={`${text}-${index}`} text={text} />
          ))}
        </section>
      </main>
    </section>
  );
}

function ActivityRow({ text }) {
  return (
    <div
      className="flex h-[56px] items-center justify-between gap-5 border-b border-[#e9eef1] px-[16px] last:border-b-0 dark:border-white/15"
      dir="ltr"
    >
      <span className="shrink-0 text-[12px] text-[#777] dark:text-gray-300">
        منذ 10 دقائق
      </span>
      <div className="flex min-w-0 items-center gap-4" dir="ltr">
        <span
          className="truncate text-[17px] font-medium text-[#333] dark:text-white"
          dir="rtl"
        >
          {text}
        </span>
        <span className="grid h-[40px] w-[40px] shrink-0 place-items-center rounded-full bg-[#eafbfd] text-[#19bed9]">
          <Bell size={19} />
        </span>
      </div>
    </div>
  );
}
