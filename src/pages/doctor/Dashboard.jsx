import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Bell,
  CalendarCheck,
  CalendarDays,
  ChevronLeft,
  Clock3,
  Search,
  UserRound,
} from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import patientAvatar from "../../assets/landingPage/admin.png";
import {
  getCurrentDoctorId,
  getCurrentDoctorProfile,
  listCurrentDoctorAvailableSlots,
  listDoctorAppointments,
} from "../../services/medilinkApi";

const statusMeta = {
  confirmed: {
    label: "مؤكد",
    activity: "تم تأكيد حجز موعد",
    tone: "waiting",
    color: "#1976d2",
  },
  pending: {
    label: "قيد الانتظار",
    activity: "تم إنشاء طلب حجز جديد",
    tone: "waiting",
    color: "#38bfd7",
  },
  completed: {
    label: "تم الكشف",
    activity: "تم إنهاء كشف المريض",
    tone: "done",
    color: "#4aae1b",
  },
  cancelled: {
    label: "ملغي",
    activity: "تم إلغاء موعد",
    tone: "cancelled",
    color: "#ff4b4b",
  },
};

const statStyles = [
  {
    icon: CalendarCheck,
    color: "text-[#287dd8]",
    bg: "bg-[#edf6ff]",
  },
  {
    icon: UserRound,
    color: "text-[#4fc5b9]",
    bg: "bg-[#eefcfa]",
  },
  {
    icon: CalendarDays,
    color: "text-[#ffb21d]",
    bg: "bg-[#fff3d8]",
  },
  {
    icon: Clock3,
    color: "text-[#5bbf22]",
    bg: "bg-[#edf9e6]",
  },
];

function useDarkTheme() {
  const getIsDark = () =>
    typeof document !== "undefined" &&
    document.documentElement.classList.contains("dark");

  const [isDark, setIsDark] = useState(getIsDark);

  useEffect(() => {
    const root = document.documentElement;
    const observer = new MutationObserver(() => setIsDark(getIsDark()));

    observer.observe(root, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  return isDark;
}

function getIsoDate(date) {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) return "";

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function parseDate(value) {
  if (!value) return null;

  const date = new Date(`${value}T12:00:00`);
  if (!Number.isNaN(date.getTime())) return date;

  const fallbackDate = new Date(value);
  return Number.isNaN(fallbackDate.getTime()) ? null : fallbackDate;
}

function getAppointmentTimestamp(appointment) {
  const date = appointment.date || appointment.raw?.date || appointment.raw?.createdAt;
  const time = appointment.time || appointment.raw?.time || "00:00";
  const parsedDate = parseDate(date);

  if (!parsedDate) return 0;

  const [hours = 0, minutes = 0] = String(time).split(":").map(Number);
  parsedDate.setHours(Number.isFinite(hours) ? hours : 0);
  parsedDate.setMinutes(Number.isFinite(minutes) ? minutes : 0);
  return parsedDate.getTime();
}

function getTimeMinutes(time) {
  const [hours = 0, minutes = 0] = String(time || "").split(":").map(Number);
  return (Number.isFinite(hours) ? hours : 0) * 60 + (Number.isFinite(minutes) ? minutes : 0);
}

function formatTime(value) {
  if (!value) return "";

  const [hourText = "0", minute = "00"] = String(value).split(":");
  const hour24 = Number(hourText);

  if (!Number.isFinite(hour24)) return value;

  const hour12 = hour24 % 12 || 12;
  const period = hour24 >= 12 ? "م" : "ص";

  return `${hour12}:${minute} ${period}`;
}

function formatDate(value) {
  const date = parseDate(value);

  if (!date) return "";

  return date.toLocaleDateString("ar-EG", {
    day: "numeric",
    month: "long",
  });
}

function formatMonth(date) {
  return date.toLocaleDateString("ar-EG", { month: "short" });
}

function formatRelativeTime(value) {
  const timestamp = value ? new Date(value).getTime() : 0;

  if (!timestamp || Number.isNaN(timestamp)) return "منذ قليل";

  const diffMinutes = Math.max(0, Math.round((Date.now() - timestamp) / 60000));

  if (diffMinutes < 1) return "الآن";
  if (diffMinutes < 60) return `منذ ${diffMinutes} دقيقة`;

  const diffHours = Math.round(diffMinutes / 60);
  if (diffHours < 24) return `منذ ${diffHours} ساعة`;

  return `منذ ${Math.round(diffHours / 24)} يوم`;
}

function getDoctorName(doctor) {
  return (
    [doctor?.firstName, doctor?.lastName].filter(Boolean).join(" ").trim() ||
    doctor?.name ||
    "دكتور ميديلينك"
  );
}

function getPatientName(appointment) {
  return (
    appointment.patient ||
    appointment.raw?.patientName ||
    appointment.raw?.patient?.name ||
    [appointment.raw?.patient?.firstName, appointment.raw?.patient?.lastName]
      .filter(Boolean)
      .join(" ")
      .trim() ||
    "مريض"
  );
}

function getPatientImage(appointment) {
  const patient = appointment.raw?.patient || appointment.raw?.patientId || {};
  const user = patient.user || patient.account || patient;

  return (
    appointment.raw?.patientImage ||
    patient.image ||
    patient.profileImage ||
    user.image ||
    user.profileImage ||
    patientAvatar
  );
}

function isSlotAvailable(status) {
  const value = String(status || "").trim().toLowerCase();
  return !["booked", "reserved", "unavailable", "محجوز", "غير متاح"].includes(value);
}

function flattenAvailableSlots(days = []) {
  return days
    .flatMap((day) =>
      (day.slots || []).map((slot) => ({
        date: day.date,
        day: day.day,
        time: slot.time,
        status: slot.status,
      })),
    )
    .filter((slot) => slot.date && slot.time && isSlotAvailable(slot.status))
    .sort((left, right) => {
      const byDate = String(left.date).localeCompare(String(right.date));
      return byDate || getTimeMinutes(left.time) - getTimeMinutes(right.time);
    });
}

function getUniquePatientsCount(appointments) {
  const patients = new Set();

  appointments.forEach((appointment) => {
    const id = appointment.patientId || appointment.raw?.patient?._id || appointment.raw?.patient?.id;
    const name = getPatientName(appointment);
    const key = id || name;

    if (key) patients.add(String(key));
  });

  return patients.size;
}

function buildMonthlyBookings(appointments) {
  const today = new Date();

  return Array.from({ length: 8 }, (_, index) => {
    const monthDate = new Date(today.getFullYear(), today.getMonth() - 7 + index, 1);
    const count = appointments.filter((appointment) => {
      const date = parseDate(appointment.date);
      return (
        date &&
        date.getMonth() === monthDate.getMonth() &&
        date.getFullYear() === monthDate.getFullYear()
      );
    }).length;

    return {
      month: formatMonth(monthDate),
      value: count,
    };
  });
}

function getWeekRange() {
  const now = new Date();
  const start = new Date(now);
  const daysFromSaturday = (start.getDay() + 1) % 7;

  start.setDate(start.getDate() - daysFromSaturday);
  start.setHours(0, 0, 0, 0);

  const end = new Date(start);
  end.setDate(start.getDate() + 7);

  return { start, end };
}

function buildWeeklyStates(appointments) {
  const { start, end } = getWeekRange();
  const weekAppointments = appointments.filter((appointment) => {
    const timestamp = getAppointmentTimestamp(appointment);
    return timestamp >= start.getTime() && timestamp < end.getTime();
  });
  const total = weekAppointments.length;

  return Object.entries(statusMeta)
    .map(([status, meta]) => {
      const count = weekAppointments.filter(
        (appointment) => appointment.status === status,
      ).length;

      return {
        name: meta.label,
        value: total ? Math.round((count / total) * 100) : 0,
        count,
        color: meta.color,
      };
    })
    .filter((item) => item.count > 0);
}

function buildRecentActivities(appointments) {
  return [...appointments]
    .sort((left, right) => {
      const leftDate = left.raw?.updatedAt || left.raw?.createdAt || left.date;
      const rightDate = right.raw?.updatedAt || right.raw?.createdAt || right.date;
      return new Date(rightDate).getTime() - new Date(leftDate).getTime();
    })
    .slice(0, 5)
    .map((appointment) => {
      const meta = statusMeta[appointment.status] || statusMeta.confirmed;
      const date = appointment.raw?.updatedAt || appointment.raw?.createdAt || appointment.date;

      return {
        id: appointment.id || `${appointment.date}-${appointment.time}-${getPatientName(appointment)}`,
        text: `${meta.activity} - ${getPatientName(appointment)}`,
        time: formatRelativeTime(date),
      };
    });
}

async function loadDoctorAppointments(doctor) {
  const ids = Array.from(
    new Set(
      [doctor?.profileId, doctor?.id, doctor?.userId, getCurrentDoctorId()]
        .filter(Boolean)
        .map(String),
    ),
  );

  for (const id of ids) {
    try {
      const appointments = await listDoctorAppointments(id);

      if (appointments.length > 0) return appointments;
    } catch {
      // Try the next doctor id shape.
    }
  }

  return [];
}

export default function DoctorDashboard() {
  const isDark = useDarkTheme();
  const [doctor, setDoctor] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [availableSlotDays, setAvailableSlotDays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const axisColor = isDark ? "#f3f4f6" : "#777";
  const axisLineColor = isDark ? "#d1d5db" : "#cad6dd";
  const gridColor = isDark ? "#6b7280" : "#e8eef2";
  const todayIso = getIsoDate(new Date());
  const availableSlots = useMemo(
    () => flattenAvailableSlots(availableSlotDays),
    [availableSlotDays],
  );
  const todayAppointments = useMemo(
    () =>
      appointments
        .filter((appointment) => appointment.date === todayIso)
        .sort((left, right) => getTimeMinutes(left.time) - getTimeMinutes(right.time)),
    [appointments, todayIso],
  );
  const monthlyBookings = useMemo(
    () => buildMonthlyBookings(appointments),
    [appointments],
  );
  const weeklyStates = useMemo(
    () => buildWeeklyStates(appointments),
    [appointments],
  );
  const recentActivities = useMemo(
    () => buildRecentActivities(appointments),
    [appointments],
  );
  const maxChartValue = Math.max(4, ...monthlyBookings.map((item) => item.value));
  const dashboardStats = [
    {
      title: "مواعيد اليوم",
      value: todayAppointments.length,
      subtitle: "من الحجوزات المسجلة",
    },
    {
      title: "إجمالي المرضى",
      value: getUniquePatientsCount(appointments),
      subtitle: "حسب حجوزات الدكتور",
    },
    {
      title: "إجمالي الحجوزات",
      value: appointments.length,
      subtitle: "كل المواعيد المرتبطة بك",
    },
    {
      title: "المواعيد المتاحة",
      value: availableSlots.length,
      subtitle: "من جدول الأوقات المتاحة",
    },
  ].map((item, index) => ({ ...item, ...statStyles[index] }));

  useEffect(() => {
    let mounted = true;

    async function loadDashboard() {
      setLoading(true);
      setError("");

      try {
        const currentDoctor = await getCurrentDoctorProfile();
        const [doctorAppointments, doctorSlots] = await Promise.all([
          loadDoctorAppointments(currentDoctor),
          listCurrentDoctorAvailableSlots(currentDoctor),
        ]);

        if (!mounted) return;

        setDoctor(currentDoctor);
        setAppointments(doctorAppointments);
        setAvailableSlotDays(doctorSlots);
      } catch (requestError) {
        if (mounted) {
          setError(requestError.message || "تعذر تحميل بيانات لوحة التحكم");
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadDashboard();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <section className="min-h-screen bg-[#f8fbfc] text-[#333333] dark:bg-[#2f2f2f] dark:text-white">
      <Header doctorName={getDoctorName(doctor)} />

      <main className="space-y-[18px] px-4 py-[24px] sm:px-6 lg:px-[24px]">
        {error && (
          <div className="rounded-[8px] border border-red-200 bg-red-50 px-4 py-3 text-right text-[13px] font-semibold text-red-700 dark:border-red-400/30 dark:bg-red-400/10 dark:text-red-200">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 gap-[14px] sm:grid-cols-2 xl:grid-cols-4">
          {dashboardStats.map((item) => (
            <StatCard key={item.title} loading={loading} {...item} />
          ))}
        </div>

        <div className="grid grid-cols-1 gap-[18px] xl:grid-cols-[minmax(330px,0.95fr)_minmax(0,1.25fr)]">
          <AppointmentsToday appointments={todayAppointments} loading={loading} />

          <DashboardCard
            title="عدد الحجوزات"
            action={<RangeTabs options={["يوم", "أسبوع", "شهر", "سنة"]} />}
            className="min-h-[238px]"
          >
            <div className="h-[170px] w-full text-[#6e767b] dark:text-gray-200">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={monthlyBookings}
                  margin={{ top: 8, right: 3, left: -22, bottom: 0 }}
                >
                  <defs>
                    <linearGradient
                      id="doctorBookingsFill"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="0%" stopColor="#28bfe1" stopOpacity={0.2} />
                      <stop offset="100%" stopColor="#28bfe1" stopOpacity={0.06} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    stroke={gridColor}
                    strokeDasharray="0"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="month"
                    axisLine={{ stroke: axisLineColor }}
                    tickLine={false}
                    tick={{ fontSize: 9, fill: axisColor, fontWeight: 600 }}
                    tickMargin={8}
                  />
                  <YAxis
                    axisLine={{ stroke: axisLineColor }}
                    tickLine={false}
                    tick={{ fontSize: 9, fill: axisColor, fontWeight: 600 }}
                    allowDecimals={false}
                    domain={[0, maxChartValue]}
                    width={38}
                  />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Area
                    type="monotone"
                    dataKey="value"
                    fill="url(#doctorBookingsFill)"
                    stroke="#31b9db"
                    strokeWidth={2.5}
                    dot={{ r: 3, fill: "#31b9db", strokeWidth: 0 }}
                    activeDot={{ r: 4, fill: "#31b9db", strokeWidth: 0 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </DashboardCard>
        </div>

        <div className="grid grid-cols-1 gap-[18px] xl:grid-cols-[minmax(330px,0.95fr)_minmax(0,1.25fr)]">
          <WeeklyBookings states={weeklyStates} loading={loading} />
          <AvailableSlots slots={availableSlots} loading={loading} />
        </div>

        <RecentActivity activities={recentActivities} loading={loading} />
      </main>
    </section>
  );
}

function Header({ doctorName }) {
  return (
    <header className="flex min-h-[100px] flex-col gap-5 bg-white px-4 py-[22px] shadow-[0_1px_8px_rgba(0,0,0,0.03)] dark:bg-[#3a3a3a] sm:px-6 lg:flex-row lg:items-start lg:justify-between lg:px-[24px]">
      <div className="text-right">
        <h1 className="text-[20px] font-bold leading-7 text-[#333] dark:text-white">
          مرحبا {doctorName} 👋
        </h1>
        <p className="mt-1 text-[11px] leading-5 text-[#8a8a8a] dark:text-gray-300">
          إليك ملخص أدائك اليوم
        </p>
      </div>

      <SearchBox />
    </header>
  );
}

function SearchBox() {
  return (
    <label
      className="flex h-[44px] w-full items-center gap-[10px] rounded-[8px] border border-[#d7d7d7] bg-[#fbfbfb] px-[13px] text-[#9a9a9a] dark:border-white/20 dark:bg-[#454545] dark:text-gray-200 sm:w-[280px]"
      dir="ltr"
    >
      <input
        className="min-w-0 flex-1 bg-transparent text-right text-[12px] outline-none placeholder:text-[#9a9a9a]"
        placeholder="ابحث هنا..."
        dir="rtl"
      />
      <Search size={17} strokeWidth={1.7} />
    </label>
  );
}

function StatCard({ title, value, subtitle, icon: Icon, color, bg, loading }) {
  return (
    <article className="h-[118px] rounded-[8px] bg-white px-[20px] pb-[13px] pt-[18px] shadow-[0_4px_18px_rgba(0,0,0,0.08)] dark:bg-[#505050]">
      <div className="flex items-start justify-between" dir="ltr">
        <span
          className={`grid h-[40px] w-[40px] shrink-0 place-items-center rounded-[8px] ${bg} ${color}`}
        >
          <Icon size={21} strokeWidth={2} />
        </span>

        <div className="text-right" dir="rtl">
          <p className="text-[13px] leading-5 text-[#333] dark:text-gray-100">
            {title}
          </p>
          <h3 className="text-[17px] font-bold leading-6 text-[#2e2e2e] dark:text-white">
            {loading ? "..." : value}
          </h3>
        </div>
      </div>

      <p className="mt-[20px] text-right text-[10px] leading-4 text-[#777] dark:text-gray-300">
        {subtitle}
      </p>
    </article>
  );
}

function DashboardCard({ title, action, children, className = "" }) {
  return (
    <section
      className={`rounded-[8px] bg-white px-[20px] pb-[14px] pt-[16px] shadow-[0_4px_18px_rgba(0,0,0,0.08)] dark:bg-[#505050] ${className}`}
    >
      <div className="mb-[12px] flex min-h-[28px] items-center justify-between gap-4">
        <h2 className="text-right text-[13px] font-bold leading-5 text-[#333] dark:text-white">
          {title}
        </h2>
        {action}
      </div>
      {children}
    </section>
  );
}

function RangeTabs({ options }) {
  return (
    <div className="flex h-[25px] w-[167px] overflow-hidden rounded-[7px] bg-[#fafafa] p-[2px] text-[9px] text-[#333] dark:bg-[#3f3f3f] dark:text-gray-200">
      {options.map((item) => (
        <span
          key={item}
          className={`grid flex-1 place-items-center rounded-[7px] ${
            item === "شهر" ? "bg-[#35c0d8] text-white" : ""
          }`}
        >
          {item}
        </span>
      ))}
    </div>
  );
}

function AppointmentsToday({ appointments, loading }) {
  return (
    <DashboardCard
      title="مواعيد اليوم"
      action={<CardLink to="/doctor/appointments" />}
      className="min-h-[238px] overflow-hidden"
    >
      {loading ? (
        <LoadingRows />
      ) : appointments.length === 0 ? (
        <EmptyState text="لا توجد مواعيد اليوم" />
      ) : (
        <div className="space-y-[2px]">
          {appointments.slice(0, 5).map((appointment) => (
            <AppointmentRow
              key={appointment.id || `${appointment.date}-${appointment.time}`}
              appointment={appointment}
            />
          ))}
        </div>
      )}
    </DashboardCard>
  );
}

function AppointmentRow({ appointment }) {
  const status = appointment.status || "confirmed";
  const meta = statusMeta[status] || statusMeta.confirmed;

  return (
    <article className="grid h-[36px] grid-cols-[34px_minmax(0,1fr)_72px] items-center gap-[8px] rounded-[7px] px-[4px] transition hover:bg-[#f5fbfc] dark:hover:bg-white/10">
      <img
        src={getPatientImage(appointment)}
        alt={getPatientName(appointment)}
        className="h-[30px] w-[30px] rounded-full object-cover"
      />
      <div className="min-w-0 text-right">
        <h3 className="truncate text-[11px] font-bold leading-4 text-[#333] dark:text-white">
          {getPatientName(appointment)}
        </h3>
        <p className="truncate text-[9px] leading-3 text-[#7d7d7d] dark:text-gray-300">
          {formatTime(appointment.time)}
        </p>
      </div>
      <StatusBadge tone={meta.tone}>{meta.label}</StatusBadge>
    </article>
  );
}

function StatusBadge({ tone, children }) {
  const toneClasses = {
    waiting: "bg-[#fff1cd] text-[#d79a16]",
    done: "bg-[#e8fff4] text-[#129a55]",
    cancelled: "bg-[#fff0f0] text-[#ff2020]",
  };

  return (
    <span
      className={`grid h-[22px] place-items-center rounded-[6px] text-[8px] font-bold ${
        toneClasses[tone] || toneClasses.waiting
      }`}
    >
      {children}
    </span>
  );
}

function WeeklyBookings({ states, loading }) {
  return (
    <DashboardCard
      title="حالات حجز المواعيد هذا الأسبوع"
      className="min-h-[238px]"
    >
      {loading ? (
        <LoadingRows />
      ) : states.length === 0 ? (
        <EmptyState text="لا توجد حجوزات هذا الأسبوع" />
      ) : (
        <div className="flex h-[176px] items-center justify-center gap-[24px]" dir="ltr">
          <div className="h-[146px] w-[146px] shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={states}
                  dataKey="value"
                  innerRadius={47}
                  outerRadius={73}
                  paddingAngle={0}
                  stroke="none"
                >
                  {states.map((item) => (
                    <Cell key={item.name} fill={item.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="w-[140px] space-y-[8px]" dir="rtl">
            {states.map((item) => (
              <div
                key={item.name}
                className="grid grid-cols-[10px_1fr_56px] items-center gap-2 text-[11px] leading-4 text-[#444] dark:text-gray-100"
              >
                <span
                  className="h-[7px] w-[7px] rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span className="truncate">{item.name}</span>
                <span className="text-left text-[10px] text-[#555] dark:text-gray-200">
                  {item.value}% ({item.count})
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </DashboardCard>
  );
}

function AvailableSlots({ slots, loading }) {
  return (
    <DashboardCard
      title="أقرب المواعيد المتاحة"
      action={<CardLink to="/doctor/appointments" />}
      className="min-h-[238px] overflow-hidden"
    >
      {loading ? (
        <LoadingRows />
      ) : slots.length === 0 ? (
        <EmptyState text="لا توجد أوقات متاحة الآن" />
      ) : (
        <div className="space-y-[6px]">
          {slots.slice(0, 5).map((slot) => (
            <div
              key={`${slot.date}-${slot.time}`}
              className="grid min-h-[34px] grid-cols-[82px_1fr] items-center rounded-[7px] bg-[#f7fcfd] px-[10px] text-[11px] dark:bg-white/10"
            >
              <span className="text-left font-bold text-[#28b8d4]">
                {formatTime(slot.time)}
              </span>
              <span className="truncate text-right text-[#444] dark:text-white">
                {slot.day || formatDate(slot.date)} - {formatDate(slot.date)}
              </span>
            </div>
          ))}
        </div>
      )}
    </DashboardCard>
  );
}

function RecentActivity({ activities, loading }) {
  return (
    <DashboardCard
      title="النشاط الأخير"
      action={<CardLink to="/doctor/activity" />}
      className="min-h-[190px] overflow-hidden"
    >
      {loading ? (
        <LoadingRows />
      ) : activities.length === 0 ? (
        <EmptyState text="لا يوجد نشاط حديث" />
      ) : (
        <div className="mt-1 overflow-hidden">
          {activities.map((activity) => (
            <ActivityRow key={activity.id} activity={activity} />
          ))}
        </div>
      )}
    </DashboardCard>
  );
}

function ActivityRow({ activity }) {
  return (
    <div
      className="flex h-[35px] items-center justify-between gap-4 border-b border-[#eef2f4] last:border-b-0 dark:border-white/15"
      dir="ltr"
    >
      <span className="shrink-0 text-[8px] text-[#777] dark:text-gray-300">
        {activity.time}
      </span>
      <div className="flex min-w-0 items-center gap-[9px]" dir="ltr">
        <span
          className="truncate text-[11px] font-medium text-[#333] dark:text-white"
          dir="rtl"
        >
          {activity.text}
        </span>
        <span className="grid h-[25px] w-[25px] shrink-0 place-items-center rounded-full bg-[#eafbfd] text-[#19bed9]">
          <Bell size={13} />
        </span>
      </div>
    </div>
  );
}

function CardLink({ to }) {
  return (
    <Link
      to={to}
      className="flex items-center gap-[5px] text-[9px] text-[#777] transition hover:text-[#30bfd6]"
      dir="ltr"
    >
      <ChevronLeft size={12} strokeWidth={1.8} />
      <span>عرض الكل</span>
    </Link>
  );
}

function EmptyState({ text }) {
  return (
    <div className="grid min-h-[155px] place-items-center text-center text-[12px] font-bold text-[#7d7d7d] dark:text-gray-200">
      {text}
    </div>
  );
}

function LoadingRows() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 4 }).map((_, index) => (
        <div
          key={index}
          className="h-[32px] animate-pulse rounded-[7px] bg-[#edf3f5] dark:bg-white/10"
        />
      ))}
    </div>
  );
}

const tooltipStyle = {
  border: "1px solid #e2edf1",
  borderRadius: 8,
  boxShadow: "0 8px 20px rgba(20, 72, 89, 0.1)",
  direction: "rtl",
  fontFamily: "Cairo, sans-serif",
  fontSize: 12,
};
