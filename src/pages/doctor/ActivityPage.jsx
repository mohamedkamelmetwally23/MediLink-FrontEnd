import { ArrowRight, Bell } from "lucide-react";
import { Link } from "react-router-dom";

const activities = [
  "تم إنشاء حجز موعد",
  "تم إضافة وصفة طبية للمريض بنجاح",
  "تم إلغاء موعد",
  "تم إضافة سجل مرضي جديد",
  "تم تحديث البيانات",
  "تم تأكيد موعد جديد",
  "تم بدء الكشف لمريض جديد",
  "تم إضافة معلومات متابعة",
  "تم تعديل بيانات مريض",
  "تم إنهاء كشف اليوم",
];

export default function DoctorActivityPage() {
  return (
    <section className="min-h-screen bg-[#f8fbfc] text-[#333] dark:bg-[#2f2f2f] dark:text-white">
      <header className="relative flex min-h-[100px] items-start justify-start bg-white px-4 pt-[20px] shadow-[0_1px_8px_rgba(0,0,0,0.03)] dark:bg-[#3a3a3a] sm:px-6 lg:px-[24px]">
        <div className="text-right">
          <h1 className="text-[20px] font-bold leading-7 text-[#333] dark:text-white">
            النشاط الأخير
          </h1>
          <p className="mt-1 text-[11px] leading-5 text-[#8a8a8a] dark:text-gray-300">
            آخر نشاطات حساب الطبيب والمرضى.
          </p>
        </div>

        <Link
          to="/doctor/dashboard"
          className="absolute left-5 top-[26px] flex items-center gap-[6px] text-[11px] font-bold text-[#30bfd6] lg:left-[24px]"
        >
          <ArrowRight size={13} strokeWidth={2} />
          رجوع
        </Link>
      </header>

      <main className="px-4 py-[24px] sm:px-6 lg:px-[24px]">
        <section className="min-h-[520px] rounded-[8px] bg-white px-[14px] py-[18px] shadow-[0_4px_18px_rgba(0,0,0,0.08)] dark:bg-[#505050]">
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
      className="flex h-[45px] items-center justify-between gap-4 border-b border-[#eef2f4] px-[8px] last:border-b-0 dark:border-white/15"
      dir="ltr"
    >
      <span className="shrink-0 text-[9px] text-[#777] dark:text-gray-300">
        منذ 10 دقائق
      </span>
      <div className="flex min-w-0 items-center gap-[10px]" dir="ltr">
        <span
          className="truncate text-[12px] font-medium text-[#333] dark:text-white"
          dir="rtl"
        >
          {text}
        </span>
        <span className="grid h-[28px] w-[28px] shrink-0 place-items-center rounded-full bg-[#eafbfd] text-[#19bed9]">
          <Bell size={14} />
        </span>
      </div>
    </div>
  );
}
