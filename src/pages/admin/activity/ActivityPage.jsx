import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import ActivityList from "../../../components/admin/ActivityList";
import { listActivities } from "../../../services/medilinkApi";

export default function ActivityPage() {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    listActivities(500)
      .then((fetchedActivities) => {
        if (mounted) {
          setActivities(fetchedActivities);
          setError("");
        }
      })
      .catch((requestError) => {
        if (mounted) {
          setError(requestError?.message || "تعذر تحميل النشاطات");
        }
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

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
          dir="rtl"
        >
          <ArrowRight size={18} strokeWidth={2} />
          <span>رجوع</span>
        </Link>
      </header>

      <main className="px-4 py-[30px] sm:px-6 lg:px-[32px]">
        <section className="min-h-[805px] overflow-hidden rounded-[10px] bg-white py-[12px] shadow-[0_4px_20px_rgba(0,0,0,0.08)] dark:bg-[#505050]">
          <ActivityList
            activities={activities}
            loading={loading}
            error={error}
          />
        </section>
      </main>
    </section>
  );
}
