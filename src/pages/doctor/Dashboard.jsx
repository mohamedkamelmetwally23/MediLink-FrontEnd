import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Banknote,
  CalendarCheck,
  CalendarDays,
  ChevronLeft,
  TrendingDown,
  TrendingUp,
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
import ActivityList from "../../components/admin/ActivityList";
import {
  getCurrentDoctorId,
  getCurrentDoctorProfile,
  getDoctorPatientsPlanCount,
  listDoctorActivities,
  listDoctorAvailableSlots,
  listDoctorAppointments,
  listMyDoctorAppointments,
} from "../../services/medilinkApi";

const statusMeta = {
  confirmed: {
    label: "مؤكد",
    tone: "confirmed",
    color: "#1976d2",
  },
  pending: {
    label: "قيد الانتظار",
    tone: "waiting",
    color: "#35c0d8",
  },
  completed: {
    label: "تم الكشف",
    tone: "done",
    color: "#4bb543",
  },
  cancelled: {
    label: "ملغي",
    tone: "cancelled",
    color: "#ff4b4b",
  },
};

const statStyles = [
  {
    icon: CalendarDays,
    color: "text-[#1976d2]",
    bg: "bg-[#eef6ff]",
  },
  {
    icon: UserRound,
    color: "text-[#4fc5b9]",
    bg: "bg-[#effcfa]",
  },
  {
    icon: CalendarCheck,
    color: "text-[#ffb21d]",
    bg: "bg-[#fff4dc]",
  },
  {
    icon: Banknote,
    color: "text-[#4bb543]",
    bg: "bg-[#effbe9]",
  },
];

const bookingRangeOptions = [
  { id: "day", label: "يوم" },
  { id: "week", label: "أسبوع" },
  { id: "month", label: "شهر" },
  { id: "year", label: "سنة" },
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

function formatMonth(date) {
  return date.toLocaleDateString("ar-EG", { month: "short" });
}

function formatShortWeekday(date) {
  return date.toLocaleDateString("ar-EG", { weekday: "short" });
}

function getDoctorName(doctor) {
  return (
    [doctor?.firstName, doctor?.lastName].filter(Boolean).join(" ").trim() ||
    doctor?.name ||"دكتور "
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

function getLatestAppointmentDate(appointments) {
  return appointments.reduce((latest, appointment) => {
    const date = getAppointmentDateForStats(appointment);

    if (!date) return latest;
    return !latest || date > latest ? date : latest;
  }, null);
}

function getBookingsRangeBounds(range, anchorDate = new Date()) {
  const current = new Date(anchorDate);
  current.setHours(0, 0, 0, 0);

  if (range === "day") {
    const end = new Date(current);
    end.setHours(23, 59, 59, 999);

    return { start: current, end };
  }

  if (range === "week") {
    const start = new Date(current);
    const daysFromSaturday = (start.getDay() + 1) % 7;
    start.setDate(start.getDate() - daysFromSaturday);

    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    end.setHours(23, 59, 59, 999);

    return { start, end };
  }

  if (range === "month") {
    return {
      start: new Date(current.getFullYear(), current.getMonth(), 1),
      end: new Date(current.getFullYear(), current.getMonth() + 1, 0, 23, 59, 59, 999),
    };
  }

  return {
    start: new Date(current.getFullYear(), 0, 1),
    end: new Date(current.getFullYear(), 11, 31, 23, 59, 59, 999),
  };
}

function getBookingsBucket(appointment, range) {
  const date = getAppointmentDateForStats(appointment);

  if (!date) return null;

  if (range === "day") {
    const time = appointment.time || appointment.raw?.time || "";

    return {
      key: `${getIsoDate(date)}-${time || "00:00"}`,
      label: time ? formatTime(time) : `${date.getDate()} ${formatMonth(date)}`,
    };
  }

  if (range === "year") {
    return {
      key: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`,
      label: formatMonth(date),
    };
  }

  return {
    key: getIsoDate(date),
    label:
      range === "week"
        ? `${formatShortWeekday(date)} ${date.getDate()}`
        : `${date.getDate()} ${formatMonth(date)}`,
  };
}

function buildBookingsChart(appointments, range) {
  const anchorDate = getLatestAppointmentDate(appointments);

  if (!anchorDate) return [];

  const { start, end } = getBookingsRangeBounds(range, anchorDate);
  const counts = new Map();

  appointments.forEach((appointment) => {
    const date = getAppointmentDateForStats(appointment);
    if (!date || date < start || date > end) return;

    const bucket = getBookingsBucket(appointment, range);
    if (!bucket) return;

    const current = counts.get(bucket.key) || { ...bucket, value: 0 };
    counts.set(bucket.key, { ...current, value: current.value + 1 });
  });

  return Array.from(counts.values()).sort((first, second) =>
    first.key.localeCompare(second.key),
  );
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

function getAppointmentDateForStats(appointment) {
  return parseDate(
    appointment.date ||
      appointment.appointmentDate ||
      appointment.raw?.appointmentDate ||
      appointment.raw?.date ||
      appointment.raw?.createdAt ||
      "",
  );
}

function isSameCalendarDay(date, target) {
  return (
    date &&
    target &&
    date.getFullYear() === target.getFullYear() &&
    date.getMonth() === target.getMonth() &&
    date.getDate() === target.getDate()
  );
}

function isSameCalendarMonth(date, target) {
  return (
    date &&
    target &&
    date.getFullYear() === target.getFullYear() &&
    date.getMonth() === target.getMonth()
  );
}

function getPreviousDay(date) {
  const previousDay = new Date(date);
  previousDay.setDate(date.getDate() - 1);
  return previousDay;
}

function getPreviousMonth(date) {
  return new Date(date.getFullYear(), date.getMonth() - 1, 1);
}

function filterAppointmentsByMonth(appointments, targetMonth) {
  return appointments.filter((appointment) =>
    isSameCalendarMonth(getAppointmentDateForStats(appointment), targetMonth),
  );
}

function countAppointmentsByDay(appointments, targetDay) {
  return appointments.filter((appointment) =>
    isSameCalendarDay(getAppointmentDateForStats(appointment), targetDay),
  ).length;
}


function buildStatTrend(current, previous, label) {
  const change =
    previous > 0 ? ((current - previous) / previous) * 100 : current > 0 ? 100 : 0;
  const rounded = Math.round(Math.abs(change));

  return {
    label,
    percent: `${change > 0 ? "+" : change < 0 ? "-" : ""}${rounded}%`,
    direction: change < 0 ? "down" : "up",
  };
}

function formatStatValue(value) {
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);
}

function getArabicDashboardError(error, fallback) {
  const message = String(error?.message || "").trim();

  if (!message) return fallback;
  if (/[\u0600-\u06FF]/.test(message)) return message;
  if (/network|fetch|timeout|failed/i.test(message)) {
    return "تعذر الاتصال بالخادم، حاول مرة أخرى";
  }
  if (/unauthorized|forbidden|token|auth/i.test(message)) {
    return "انتهت الجلسة، سجل الدخول مرة أخرى";
  }

  return fallback;
}

function mergeDashboardAppointments(...groups) {
  const appointmentsByKey = new Map();

  groups.flat().forEach((appointment, index) => {
    const key =
      appointment.id ||
      [
        appointment.date,
        appointment.time,
        appointment.patientId || getPatientName(appointment),
        index,
      ]
        .filter(Boolean)
        .join("|");

    appointmentsByKey.set(String(key), appointment);
  });

  return Array.from(appointmentsByKey.values());
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

function getDoctorAvailableSlotIds(doctor) {
  return Array.from(
    new Set(
      [
        doctor?.profileId,
        doctor?.raw?._id,
        doctor?.raw?.doctorProfile?._id,
        doctor?.raw?.doctorProfile?.id,
        doctor?.raw?.profile?._id,
        doctor?.raw?.profile?.id,
        doctor?.raw?.id,
        doctor?.id,
        doctor?.userId,
        doctor?.raw?.user?._id,
        doctor?.raw?.user?.id,
        getCurrentDoctorId(),
      ]
        .filter(Boolean)
        .map(String),
    ),
  );
}

async function loadDoctorAvailableSlots(doctor) {
  const doctorIds = getDoctorAvailableSlotIds(doctor);
  if (doctorIds.length === 0) return [];

  return listDoctorAvailableSlots(doctorIds);
}

function withFallback(promise, fallback, timeoutMs = 7000) {
  return Promise.race([
    promise,
    new Promise((resolve) => {
      window.setTimeout(() => resolve(fallback), timeoutMs);
    }),
  ]).catch(() => fallback);
}

export default function DoctorDashboard() {
  const isDark = useDarkTheme();
  const [doctor, setDoctor] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [doctorPatientsCount, setDoctorPatientsCount] = useState(null);
  const [, setAvailableSlotDays] = useState([]);
  const [activities, setActivities] = useState([]);
  const [activitiesLoading, setActivitiesLoading] = useState(true);
  const [activitiesError, setActivitiesError] = useState("");
  const [loading] = useState(false);
  const [error, setError] = useState("");
  const [selectedBookingsRange, setSelectedBookingsRange] = useState("day");
  const axisColor = isDark ? "#f3f4f6" : "#777";
  const axisLineColor = isDark ? "#d1d5db" : "#cad6dd";
  const gridColor = isDark ? "#6b7280" : "#e8eef2";
  const chartTooltipStyle = getTooltipStyle(isDark);
  const chartTooltipTextStyle = {
    color: isDark ? "#f9fafb" : "#2f3a40",
  };
  const todayIso = getIsoDate(new Date());
  const todayAppointments = useMemo(
    () =>
      appointments
        .filter((appointment) => appointment.date === todayIso)
        .sort((left, right) => getTimeMinutes(left.time) - getTimeMinutes(right.time)),
    [appointments, todayIso],
  );
  const bookingsChart = useMemo(
    () => buildBookingsChart(appointments, selectedBookingsRange),
    [appointments, selectedBookingsRange],
  );
  const weeklyStates = useMemo(
    () => buildWeeklyStates(appointments),
    [appointments],
  );
  const maxChartValue = Math.max(4, ...bookingsChart.map((item) => item.value));
  const statPeriods = useMemo(() => {
    const today = new Date();
    const previousDay = getPreviousDay(today);
    const previousMonth = getPreviousMonth(today);
    const currentMonthAppointments = filterAppointmentsByMonth(appointments, today);
    const previousMonthAppointments = filterAppointmentsByMonth(
      appointments,
      previousMonth,
    );
    const todayCount = todayAppointments.length;
    const previousDayCount = countAppointmentsByDay(appointments, previousDay);
    const fee = Number(doctor?.consultationFee) || 0;
    const billableFilter = (a) => a.status === "confirmed" || a.status === "completed";
    const currentMonthRevenue = currentMonthAppointments.filter(billableFilter).length * fee;
    const previousMonthRevenue = previousMonthAppointments.filter(billableFilter).length * fee;

    return {
      todayCount,
      previousDayCount,
      currentMonthAppointments,
      previousMonthAppointments,
      currentMonthRevenue,
      previousMonthRevenue,
    };
  }, [appointments, todayAppointments, doctor?.consultationFee]);
  const consultationFee = Number(doctor?.consultationFee) || 0;
  const totalRevenue =
    appointments.filter((a) => a.status === "confirmed" || a.status === "completed").length *
    consultationFee;
  const dashboardStats = [
    {
      title: "مواعيد اليوم",
      value: statPeriods.todayCount,
      trend: buildStatTrend(
        statPeriods.todayCount,
        statPeriods.previousDayCount,
        "عن اليوم الماضي",
      ),
    },
    {
      title: "إجمالي المرضى",
      value: doctorPatientsCount ?? getUniquePatientsCount(appointments),
      trend: buildStatTrend(
        getUniquePatientsCount(statPeriods.currentMonthAppointments),
        getUniquePatientsCount(statPeriods.previousMonthAppointments),
        "عن الشهر الماضي",
      ),
    },
    {
      title: "إجمالي الحجوزات",
      value: appointments.length,
      trend: buildStatTrend(
        statPeriods.currentMonthAppointments.length,
        statPeriods.previousMonthAppointments.length,
        "عن الشهر الماضي",
      ),
    },
    {
      title: "إجمالي الإيرادات",
      value: totalRevenue,
      trend: buildStatTrend(
        statPeriods.currentMonthRevenue,
        statPeriods.previousMonthRevenue,
        "عن الشهر الماضي",
      ),
    },
  ].map((item, index) => ({ ...item, ...statStyles[index] }));

  useEffect(() => {
    let mounted = true;

    async function loadDashboard() {
      if (!mounted) return;
      setError("");
      setActivitiesLoading(true);

      const todayIso = getIsoDate(new Date());
      const doctorPromise = getCurrentDoctorProfile().catch(() => null);
      const todayAppointmentsPromise = listMyDoctorAppointments(todayIso).catch(() => []);
      const currentIdAppointmentsPromise = loadDoctorAppointments(null).catch(() => []);
      const doctorPatientsPromise = getDoctorPatientsPlanCount().catch(() => null);

      doctorPromise.then((currentDoctor) => {
        if (mounted) setDoctor(currentDoctor);
      });

      doctorPromise
        .then((currentDoctor) => {
          const doctorId =
            currentDoctor?.profileId ||
            currentDoctor?.raw?._id ||
            currentDoctor?.raw?.doctorProfile?._id ||
            currentDoctor?.id ||
            getCurrentDoctorId();

          if (!doctorId) return [];
          return listDoctorActivities(doctorId, 500);
        })
        .then((doctorActivities) => {
          if (mounted) {
            setActivities(doctorActivities);
            setActivitiesError("");
          }
        })
        .catch((activityError) => {
          if (mounted) {
            setActivitiesError(
              getArabicDashboardError(
                activityError,
                "تعذر تحميل سجل النشاطات",
              ),
            );
          }
        })
        .finally(() => {
          if (mounted) setActivitiesLoading(false);
        });

      doctorPatientsPromise.then((count) => {
        if (mounted && Number.isFinite(Number(count))) {
          setDoctorPatientsCount(Number(count));
        }
      });

      todayAppointmentsPromise.then((todayAppointmentsResult) => {
        if (!mounted) return;
        setAppointments((current) =>
          mergeDashboardAppointments(current, todayAppointmentsResult),
        );
      });

      Promise.all([currentIdAppointmentsPromise, todayAppointmentsPromise]).then(
        ([allAppointments, todayAppointmentsResult]) => {
          if (!mounted) return;

          setAppointments(
            mergeDashboardAppointments(allAppointments, todayAppointmentsResult),
          );
        },
      );

      doctorPromise
        .then((currentDoctor) =>
          currentDoctor ? loadDoctorAppointments(currentDoctor).catch(() => []) : [],
        )
        .then((profileAppointments) => {
          if (!mounted) return;

          setAppointments((current) =>
            mergeDashboardAppointments(current, profileAppointments),
          );
        });

      doctorPromise
        .then((currentDoctor) =>
          loadDoctorAvailableSlots(currentDoctor).catch(() => []),
        )
        .then((slots) => {
          if (mounted) setAvailableSlotDays(slots);
        });

      Promise.all([doctorPromise, todayAppointmentsPromise]).then(
        ([currentDoctor, todayAppointmentsResult]) => {
          if (!mounted) return;
          if (!currentDoctor && todayAppointmentsResult.length === 0) {
            setError("تعذر تحميل بعض بيانات لوحة التحكم من قاعدة البيانات");
          }
        },
      );
    }

    loadDashboard();

    const handleVisibility = () => {
      if (!document.hidden) {
        setAppointments([]);
        setDoctor(null);
        setDoctorPatientsCount(null);
        setActivities([]);
        loadDashboard();
      }
    };

    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      mounted = false;
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, []);

  return (
    <section className="min-h-screen bg-[#f8fbfc] text-[#333333] dark:bg-[#2f2f2f] dark:text-white">
      <Header doctorFirstName={doctor?.firstName} />

      <main className="space-y-[18px] px-4 py-[24px] sm:px-6 lg:px-[24px]">
        {error && (
          <div className="rounded-[8px] border border-red-200 bg-red-50 px-4 py-3 text-right text-[13px] font-semibold text-red-700 dark:border-red-400/30 dark:bg-red-400/10 dark:text-red-200">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 gap-[14px] sm:grid-cols-2 xl:grid-cols-4" dir="rtl">
          {dashboardStats.map((item) => (
            <StatCard key={item.title} loading={loading} {...item} />
          ))}
        </div>

        <div className="grid grid-cols-1 gap-[18px] xl:grid-cols-[minmax(330px,0.95fr)_minmax(0,1.25fr)]">
          <AppointmentsToday appointments={todayAppointments} loading={loading} />

          <DashboardCard
            title="عدد الحجوزات"
            action={
              <RangeTabs
                options={bookingRangeOptions}
                value={selectedBookingsRange}
                onChange={setSelectedBookingsRange}
              />
            }
            className="min-h-[270px]"
          >
            <div className="h-[202px] w-full text-[#6e767b] dark:text-gray-200">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={bookingsChart}
                  margin={{ top: 8, right: 3, left: 0, bottom: 0 }}
                >
                  <defs>
                    <linearGradient
                      id="doctorBookingsFill"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="0%" stopColor="#35c0d8" stopOpacity={0.2} />
                      <stop offset="100%" stopColor="#35c0d8" stopOpacity={0.06} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    stroke={gridColor}
                    strokeDasharray="0"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="label"
                    axisLine={{ stroke: axisLineColor }}
                    tickLine={false}
                    tick={{ fontSize: 9, fill: axisColor, fontWeight: 600 }}
                    tickMargin={8}
                  />
                  <YAxis
                    axisLine={{ stroke: axisLineColor }}
                    tickLine={false}
                    tick={{ fontSize: 9, fill: axisColor, fontWeight: 600 }}
                    tickMargin={10}
                    allowDecimals={false}
                    domain={[0, maxChartValue]}
                    width={46}
                  />
                  <Tooltip
                    contentStyle={chartTooltipStyle}
                    itemStyle={chartTooltipTextStyle}
                    labelStyle={chartTooltipTextStyle}
                    formatter={(value) => [value, "قيمة"]}
                  />
                  <Area
                    type="monotone"
                    dataKey="value"
                    fill="url(#doctorBookingsFill)"
                    stroke="#35c0d8"
                    strokeWidth={2.5}
                    dot={{ r: 3, fill: "#35c0d8", strokeWidth: 0 }}
                    activeDot={{ r: 4, fill: "#35c0d8", strokeWidth: 0 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </DashboardCard>
        </div>

        <div className="grid grid-cols-1 gap-[18px] xl:grid-cols-[minmax(330px,0.95fr)_minmax(0,1.25fr)]">
          <WeeklyBookings states={weeklyStates} loading={loading} />
          <RecentActivities
            activities={activities}
            loading={activitiesLoading}
            error={activitiesError}
          />
        </div>
      </main>
    </section>
  );
}

function Header({ doctorFirstName }) {
  return (
    <header className="flex min-h-[100px] flex-col gap-5 bg-white px-4 py-[22px] shadow-[0_1px_8px_rgba(0,0,0,0.03)] dark:bg-[#3a3a3a] sm:px-6 lg:flex-row lg:items-start lg:justify-between lg:px-[24px]">
      <div className="ml-auto text-right">
        <h1 className="text-[20px] font-bold leading-7 text-[#333] dark:text-white">
          مرحبا دكتور {doctorFirstName || "ميديلينك"} 👋
        </h1>
        <p className="mt-1 text-[11px] leading-5 text-[#8a8a8a] dark:text-gray-300">
          إليك ملخص مواعيدك اليوم
        </p>
      </div>
    </header>
  );
}

function StatCard({ title, value, trend, icon: Icon, color, bg, loading }) {
  const TrendIcon = trend?.direction === "down" ? TrendingDown : TrendingUp;
  const trendColor =
    trend?.direction === "down" ? "text-[#e53935]" : "text-[#4bb543]";

  return (
    <article className="relative min-h-[148px] rounded-[12px] bg-white px-[22px] py-[20px] shadow-[0_8px_24px_rgba(0,0,0,0.08)] dark:bg-[#505050]">
      <span
        className={`absolute left-[24px] top-[28px] grid h-[58px] w-[58px] place-items-center rounded-[14px] ${bg} ${color}`}
      >
        <Icon size={30} strokeWidth={2} />
      </span>

      <div className="text-right" dir="rtl">
        <p className="text-[18px] font-medium leading-7 text-[#333] dark:text-gray-100">
          {title}
        </p>
        <h3 className="mt-[8px] text-[30px] font-bold leading-9 text-[#2e2e2e] dark:text-white">
          {loading ? "..." : formatStatValue(value)}
        </h3>
      </div>

      {trend && (
        <div
          className="mt-[26px] flex items-center justify-start gap-[8px] text-right text-[15px] font-medium"
          dir="rtl"
        >
          <span dir="ltr" className={trendColor}>
            {trend.percent}
          </span>
          <TrendIcon size={18} strokeWidth={2.4} className={trendColor} />
          <span className="text-[#777] dark:text-gray-300">{trend.label}</span>
        </div>
      )}
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

function RangeTabs({ options, value, onChange }) {
  return (
    <div className="flex h-[25px] w-[167px] overflow-hidden rounded-[7px] bg-[#fafafa] p-[2px] text-[9px] text-[#333] dark:bg-[#3f3f3f] dark:text-gray-200">
      {options.map((item) => (
        <button
          key={item.id}
          type="button"
          onClick={() => onChange(item.id)}
          className={`grid flex-1 place-items-center rounded-[7px] ${
            item.id === value ? "bg-[#35c0d8] text-white" : ""
          }`}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}

function AppointmentsToday({ appointments, loading }) {
  return (
    <DashboardCard
      title="مواعيد اليوم"
      action={<CardLink to="/doctor/appointments?view=day&date=today" />}
      className="min-h-[270px] overflow-hidden"
    >
      {loading ? (
        <LoadingRows />
      ) : appointments.length === 0 ? (
        <EmptyState text="لا توجد مواعيد مسجلة اليوم" />
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
    confirmed: "bg-[#eaf2ff] text-[#1976d2]",
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
      className="min-h-[270px]"
    >
      {loading ? (
        <LoadingRows />
      ) : states.length === 0 ? (
        <EmptyState text="لا توجد حجوزات هذا الأسبوع" />
      ) : (
        <div className="flex h-[208px] items-center justify-center gap-[24px]" dir="ltr">
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

function RecentActivities({ activities, loading, error }) {
  return (
    <DashboardCard
      title="النشاط الأخير"
      action={<CardLink to="/doctor/activity" />}
      className="min-h-[270px] overflow-hidden"
    >
      <ActivityList
        activities={activities}
        loading={loading}
        error={error}
        compact
        showRole={false}
        showActorName={false}
        insetItems={false}
      />
    </DashboardCard>
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
    <div className="grid min-h-[188px] place-items-center text-center text-[12px] font-bold text-[#7d7d7d] dark:text-gray-200">
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

function getTooltipStyle(isDark) {
  return {
    backgroundColor: isDark ? "#3f3f3f" : "#ffffff",
    border: `1px solid ${isDark ? "rgba(255, 255, 255, 0.16)" : "#e2edf1"}`,
    borderRadius: 8,
    boxShadow: isDark
      ? "0 10px 24px rgba(0, 0, 0, 0.32)"
      : "0 8px 20px rgba(20, 72, 89, 0.1)",
    color: isDark ? "#f9fafb" : "#2f3a40",
    direction: "rtl",
    fontFamily: "Cairo, sans-serif",
    fontSize: 12,
  };
}
