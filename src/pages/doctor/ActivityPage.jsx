import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import ActivityList from "../../components/admin/ActivityList";
import {
  getCurrentDoctorId,
  getCurrentDoctorProfile,
  listDoctorActivities,
} from "../../services/medilinkApi";

export default function DoctorActivityPage() {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    getCurrentDoctorProfile()
      .catch(() => null)
      .then((doctor) => {
        const doctorId =
          doctor?.profileId ||
          doctor?.raw?._id ||
          doctor?.raw?.doctorProfile?._id ||
          doctor?.id ||
          getCurrentDoctorId();

        if (!doctorId) {
          throw new Error("تعذر تحديد رقم الطبيب");
        }

        return listDoctorActivities(doctorId, 500);
      })
      .then((doctorActivities) => {
        if (mounted) setActivities(doctorActivities);
      })
      .catch((requestError) => {
        if (mounted) {
          setError(requestError?.message || "تعذر تحميل سجل النشاطات");
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
        <section className="min-h-[520px] overflow-hidden rounded-[8px] bg-white py-[18px] shadow-[0_4px_18px_rgba(0,0,0,0.08)] dark:bg-[#505050]">
          <ActivityList
            activities={activities}
            loading={loading}
            error={error}
            showRole={false}
            showActorName={false}
          />
        </section>
      </main>
    </section>
  );
}
