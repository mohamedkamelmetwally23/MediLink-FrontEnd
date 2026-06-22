import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Banknote,
  CalendarDays,
  Check,
  ChevronDown,
  ChevronRight,
  Receipt,
  Stethoscope,
  TrendingUp,
  UserRound,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import ActivityList from "../../components/admin/ActivityList";
import {
  getCurrentAuthUser,
  getClinicProfits,
  listActivities,
  listAppointments,
} from "../../services/medilinkApi";
import { normalizeSpecialtyLabel } from "./users/usersData";
import { useUsersStore } from "./users/useUsersStore";

const statsConfig = [
  {
    title: "إجمالي المستخدمين",
    icon: UserRound,
    color: "text-[#4fc5b9]",
    bg: "bg-[#eefcfa]",
  },
  {
    title: "إجمالي الحجوزات",
    icon: CalendarDays,
    color: "text-[#ffb21d]",
    bg: "bg-[#fff3d8]",
  },
  {
    title: "إجمالي الأطباء",
    icon: Stethoscope,
    color: "text-[#1d77c8]",
    bg: "bg-[#edf6ff]",
  },
  {
    title: "إجمالي الإيرادات",
    icon: Banknote,
    color: "text-[#5bbf22]",
    bg: "bg-[#edf9e6]",
  },
  {
    title: "الحجوزات المدفوعة",
    icon: Receipt,
    color: "text-[#e07b22]",
    bg: "bg-[#fff3e8]",
  },
  {
    title: "متوسط رسوم الموعد",
    icon: TrendingUp,
    color: "text-[#9b22bf]",
    bg: "bg-[#f5ebff]",
  },
];

const pieColors = [
  "#1976d2",
  "#399de5",
  "#39bdd1",
  "#62c7c3",
  "#359ce6",
  "#42b9d0",
  "#1689c9",
];

const monthNames = [
  "يناير",
  "فبراير",
  "مارس",
  "أبريل",
  "مايو",
  "يونيو",
  "يوليو",
  "أغسطس",
  "سبتمبر",
  "أكتوبر",
  "نوفمبر",
  "ديسمبر",
];

const appointmentRangeOptions = [
  { id: "day", label: "يوم" },
  { id: "week", label: "أسبوع" },
  { id: "month", label: "شهر" },
  { id: "year", label: "سنة" },
];

const doctorPeriodOptions = [
  { id: "all", label: "الكل" },
  { id: "day", label: "اليوم" },
  { id: "week", label: "الأسبوع" },
  { id: "month", label: "الشهر" },
  { id: "year", label: "السنة" },
];

function getAuthUserDisplayName(user, fallback = "المستخدم") {
  const profile =
    user?.profile ||
    user?.admin ||
    user?.doctor ||
    user?.receptionist ||
    user?.patient ||
    user?.user ||
    user;

  return (
    profile?.name ||
    [profile?.firstName, profile?.lastName].filter(Boolean).join(" ").trim() ||
    profile?.fullName ||
    user?.name ||
    [user?.firstName, user?.lastName].filter(Boolean).join(" ").trim() ||
    fallback
  );
}

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

function getAppointmentRevenue(appointment) {
  const raw = appointment.raw || {};
  return Number(
    raw.amount ??
      raw.total ??
      raw.price ??
      raw.fee ??
      raw.consultationFee ??
      appointment.amount ??
      0,
  ) || 0;
}

function getAppointmentDate(appointment) {
  const date = new Date(
    appointment.date ||
      appointment.appointmentDate ||
      appointment.day ||
      appointment.raw?.appointmentDate ||
      appointment.raw?.date ||
      appointment.raw?.createdAt ||
      "",
  );

  return Number.isNaN(date.getTime()) ? null : date;
}

function getDateKey(date) {
  return date.toISOString().slice(0, 10);
}

function getWeekStart(date) {
  const weekStart = new Date(date);
  weekStart.setHours(0, 0, 0, 0);
  weekStart.setDate(date.getDate() - ((date.getDay() + 1) % 7));
  return weekStart;
}

function formatDayLabel(date) {
  return `${date.getDate()} ${monthNames[date.getMonth()]}`;
}

function getAppointmentBucket(date, range) {
  if (range === "day") {
    return {
      key: getDateKey(date),
      label: formatDayLabel(date),
    };
  }

  if (range === "week") {
    const start = getWeekStart(date);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);

    return {
      key: getDateKey(start),
      label: `${formatDayLabel(start)} - ${formatDayLabel(end)}`,
    };
  }

  if (range === "year") {
    return {
      key: String(date.getFullYear()),
      label: String(date.getFullYear()),
    };
  }

  return {
    key: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`,
    label: monthNames[date.getMonth()],
  };
}

function getVisibleBucketsLimit(range) {
  return {
    day: 14,
    week: 12,
    month: 12,
    year: 6,
  }[range];
}

function buildAppointmentChart(appointments, range) {
  const counts = new Map();

  appointments.forEach((appointment) => {
    const date = getAppointmentDate(appointment);
    if (!date) return;

    const bucket = getAppointmentBucket(date, range);
    const current = counts.get(bucket.key) || { ...bucket, value: 0 };
    counts.set(bucket.key, { ...current, value: current.value + 1 });
  });

  return Array.from(counts.values())
    .sort((first, second) => first.key.localeCompare(second.key))
    .slice(-getVisibleBucketsLimit(range));
}

function getDoctorName(doctor) {
  return `${doctor.firstName || ""} ${doctor.lastName || ""}`.trim() || "طبيب";
}

function isSameDay(firstDate, secondDate) {
  return getDateKey(firstDate) === getDateKey(secondDate);
}

function isDateInCurrentPeriod(date, period) {
  if (period === "all") return true;

  const today = new Date();

  if (period === "day") {
    return isSameDay(date, today);
  }

  if (period === "week") {
    const currentWeekStart = getWeekStart(today);
    const currentWeekEnd = new Date(currentWeekStart);
    currentWeekEnd.setDate(currentWeekStart.getDate() + 6);
    currentWeekEnd.setHours(23, 59, 59, 999);

    return date >= currentWeekStart && date <= currentWeekEnd;
  }

  if (period === "month") {
    return (
      date.getFullYear() === today.getFullYear() &&
      date.getMonth() === today.getMonth()
    );
  }

  return date.getFullYear() === today.getFullYear();
}

function getDoctorFilterOptions(users) {
  return users
    .filter((user) => user.role === "doctor")
    .map((doctor) => ({
      id: String(doctor.id || doctor.userId || doctor.raw?._id || doctor.raw?.user?._id || ""),
      label: getDoctorName(doctor),
    }))
    .filter((doctor) => doctor.id);
}

function buildDoctorChart(appointments, users, selectedDoctorId, selectedPeriod) {
  const doctors = users.filter((user) => user.role === "doctor");
  const doctorsById = new Map();
  const doctorCounts = new Map(
    doctors.map((doctor) => {
      const name = getDoctorName(doctor);
      const doctorIds = [doctor.id, doctor.userId, doctor.raw?._id, doctor.raw?.user?._id]
        .filter(Boolean)
        .map(String);

      doctorIds.forEach((id) => doctorsById.set(id, { id: doctorIds[0], name }));

      return [name, 0];
    }),
  );

  appointments.forEach((appointment) => {
    const doctorId = String(appointment.doctorId || appointment.raw?.doctorId || "");
    const appointmentDoctor = String(appointment.doctor || "").trim();
    const doctor =
      doctorsById.get(doctorId) ||
      doctorsById.get(appointmentDoctor) ||
      (/^[a-f\d]{24}$/i.test(appointmentDoctor)
        ? null
        : { id: appointmentDoctor, name: appointmentDoctor });

    if (!doctor?.name) return;
    if (selectedDoctorId !== "all" && doctor.id !== selectedDoctorId) return;

    const date = getAppointmentDate(appointment);
    if (!date || !isDateInCurrentPeriod(date, selectedPeriod)) return;

    doctorCounts.set(doctor.name, (doctorCounts.get(doctor.name) || 0) + 1);
  });

  return Array.from(doctorCounts, ([name, value]) => ({ name, value })).filter(
    (item) => item.value > 0,
  );
}

function formatDoctorTick(name) {
  const value = String(name || "");
  return value.length > 16 ? `${value.slice(0, 14)}…` : value;
}

function isValidSpecialtyName(name) {
  return /^[\u0600-\u06FF\s/&\u060C-]{2,50}$/.test(String(name || "").trim());
}

function buildSpecializationChart(users) {
  const specialtyCounts = new Map();

  users
    .filter((user) => user.role === "doctor" && isValidSpecialtyName(user.specialty))
    .forEach((doctor) => {
      const specialty = normalizeSpecialtyLabel(doctor.specialty);

      specialtyCounts.set(
        specialty,
        (specialtyCounts.get(specialty) || 0) + 1,
      );
    });

  const total = Array.from(specialtyCounts.values()).reduce(
    (sum, value) => sum + value,
    0,
  );

  if (total === 0) return [];

  return Array.from(specialtyCounts, ([name, count]) => ({
    name,
    value: Math.round((count / total) * 100),
  }));
}

export default function Dashboard() {
  const isDark = useDarkTheme();
  const { users } = useUsersStore();
  const [dashboardAppointments, setDashboardAppointments] = useState([]);
  const [appointmentsLoaded, setAppointmentsLoaded] = useState(false);
  const [clinicProfits, setClinicProfits] = useState(null);
  const [activities, setActivities] = useState([]);
  const [activitiesLoading, setActivitiesLoading] = useState(true);
  const [activitiesError, setActivitiesError] = useState("");
  const [selectedAppointmentRange, setSelectedAppointmentRange] = useState("month");
  const [selectedDoctorId, setSelectedDoctorId] = useState("all");
  const [selectedDoctorPeriod, setSelectedDoctorPeriod] = useState("year");
  const axisColor = isDark ? "#f3f4f6" : "#2f3a40";
  const axisLineColor = isDark ? "#d1d5db" : "#3f4b52";
  const gridColor = isDark ? "#6b7280" : "#d9e2e7";
  const chartTooltipStyle = getTooltipStyle(isDark);
  const chartTooltipTextStyle = {
    color: isDark ? "#f9fafb" : "#2f3a40",
  };
  const tickStyle = {
    fontSize: 11,
    fill: axisColor,
    fontWeight: 600,
  };
  const appointmentChart = useMemo(
    () => buildAppointmentChart(dashboardAppointments, selectedAppointmentRange),
    [dashboardAppointments, selectedAppointmentRange],
  );
  const doctorFilterOptions = useMemo(() => getDoctorFilterOptions(users), [users]);
  const doctorChart = useMemo(
    () =>
      buildDoctorChart(
        dashboardAppointments,
        users,
        selectedDoctorId,
        selectedDoctorPeriod,
      ),
    [dashboardAppointments, users, selectedDoctorId, selectedDoctorPeriod],
  );
  const specializationChart = useMemo(
    () => buildSpecializationChart(users),
    [users],
  );
  const totalRevenue = dashboardAppointments.reduce(
    (total, appointment) => total + getAppointmentRevenue(appointment),
    0,
  );
  const emptyAppointmentsText = !appointmentsLoaded
    ? "جاري تحميل البيانات..."
    : dashboardAppointments.length > 0
      ? "لا توجد حجوزات مطابقة للفلتر المحدد"
      : undefined;
  const dashboardStats = statsConfig.map((item, index) => {
    const values = [
      users.length,
      dashboardAppointments.length,
      users.filter((user) => user.role === "doctor").length,
      clinicProfits?.totalProfit ?? totalRevenue,
      clinicProfits?.appointmentCount ?? 0,
      clinicProfits?.avgFeePerAppointment != null
        ? Number(clinicProfits.avgFeePerAppointment).toFixed(2)
        : 0,
    ];

    return {
      ...item,
      value: String(values[index]),
    };
  });

  useEffect(() => {
    let mounted = true;

    listAppointments()
      .then((fetchedAppointments) => {
        if (mounted) {
          setDashboardAppointments(fetchedAppointments);
          setAppointmentsLoaded(true);
        }
      })
      .catch(() => {
        if (mounted) {
          setAppointmentsLoaded(true);
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    let mounted = true;

    getClinicProfits()
      .then((profits) => {
        if (mounted) setClinicProfits(profits);
      })
      .catch(() => {});

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    let mounted = true;

    listActivities(500)
      .then((fetchedActivities) => {
        if (mounted) {
          setActivities(fetchedActivities);
          setActivitiesError("");
        }
      })
      .catch((error) => {
        if (mounted) {
          setActivitiesError(error?.message || "تعذر تحميل النشاطات الأخيرة");
        }
      })
      .finally(() => {
        if (mounted) setActivitiesLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <section className="min-h-screen bg-[#f8fbfc] text-[#333333] dark:bg-[#2f2f2f] dark:text-white">
      <Header />

      <section className="space-y-[23px] px-4 py-8 sm:px-6 lg:px-[38px]">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {dashboardStats.map((item) => (
            <StatCard key={item.title} {...item} />
          ))}
        </div>

        <div className="grid grid-cols-1 gap-[18px] xl:grid-cols-2">
          <DashboardCard
            title="عدد الحجوزات"
            action={
              <RangeTabs
                options={appointmentRangeOptions}
                value={selectedAppointmentRange}
                onChange={setSelectedAppointmentRange}
              />
            }
            className="h-[317px]"
          >
            {appointmentChart.length === 0 ? (
              <ChartState text={emptyAppointmentsText} />
            ) : (
              <ChartBox>
                <AreaChart
                  data={appointmentChart}
                  margin={{ top: 13, right: 5, left: 0, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="appointmentsFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#28bfe1" stopOpacity={0.18} />
                      <stop offset="100%" stopColor="#28bfe1" stopOpacity={0.08} />
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
                    tick={tickStyle}
                    tickMargin={11}
                  />
                  <YAxis
                    axisLine={{ stroke: axisLineColor }}
                    tickLine={false}
                    tick={tickStyle}
                    tickMargin={10}
                    allowDecimals={false}
                    width={50}
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
                    fill="url(#appointmentsFill)"
                    stroke="#31b9db"
                    strokeWidth={3}
                    dot={{ r: 5, fill: "#31b9db", strokeWidth: 0 }}
                    activeDot={{ r: 6, fill: "#31b9db", strokeWidth: 0 }}
                  />
                </AreaChart>
              </ChartBox>
            )}
          </DashboardCard>

          <DashboardCard
            title="عدد الحجوزات لكل طبيب"
            action={
              <div className="flex gap-2.5">
                <SelectControl
                  value={selectedDoctorId}
                  onChange={setSelectedDoctorId}
                  options={[{ id: "all", label: "الكل" }, ...doctorFilterOptions]}
                  className="w-[150px]"
                />
                <SelectControl
                  value={selectedDoctorPeriod}
                  onChange={setSelectedDoctorPeriod}
                  options={doctorPeriodOptions}
                  className="w-[128px]"
                />
              </div>
            }
            className="h-[317px]"
          >
            {doctorChart.length === 0 ? (
              <ChartState text={emptyAppointmentsText} />
            ) : (
              <ChartBox>
                <BarChart
                  data={doctorChart}
                  margin={{ top: 13, right: 5, left: 0, bottom: 8 }}
                  barCategoryGap="29%"
                >
                  <defs>
                    <linearGradient id="doctorBarFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10aee3" />
                      <stop offset="100%" stopColor="#62c9c2" />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    stroke={gridColor}
                    strokeDasharray="0"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="name"
                    axisLine={{ stroke: axisLineColor }}
                    tickLine={false}
                    interval={0}
                    tick={{ ...tickStyle, fontSize: 10 }}
                    tickFormatter={formatDoctorTick}
                    tickMargin={8}
                  />
                  <YAxis
                    axisLine={{ stroke: axisLineColor }}
                    tickLine={false}
                    tick={tickStyle}
                    tickMargin={10}
                    allowDecimals={false}
                    width={50}
                  />
                  <Tooltip
                    contentStyle={chartTooltipStyle}
                    itemStyle={chartTooltipTextStyle}
                    labelStyle={chartTooltipTextStyle}
                    formatter={(value) => [value, "قيمة"]}
                    cursor={{ fill: "rgba(49, 185, 219, 0.08)" }}
                  />
                  <Bar
                    dataKey="value"
                    fill="url(#doctorBarFill)"
                    radius={[17, 17, 17, 17]}
                    barSize={30}
                  />
                </BarChart>
              </ChartBox>
            )}
          </DashboardCard>
        </div>

        <div className="grid grid-cols-1 gap-[18px] xl:grid-cols-[minmax(0,0.75fr)_minmax(0,1fr)]">
          <DashboardCard title="أكثر التخصصات حجزا" className="h-[360px] overflow-hidden">
            <div
              className="flex h-[232px] items-center justify-between gap-5"
              dir="ltr"
            >
              {specializationChart.length === 0 ? (
                <ChartState />
              ) : (
                <>
                  <div className="h-[224px] w-[224px] shrink-0">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={specializationChart}
                          dataKey="value"
                          innerRadius={67}
                          outerRadius={112}
                          paddingAngle={0}
                          stroke="none"
                        >
                          {specializationChart.map((_, index) => (
                            <Cell key={pieColors[index]} fill={pieColors[index]} />
                          ))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="w-[150px] space-y-[8px]" dir="rtl">
                    {specializationChart.map((item, index) => (
                      <div
                        key={item.name}
                        className="grid grid-cols-[14px_1fr_35px] items-center gap-2 text-[16px] leading-5 text-[#444] dark:text-gray-100"
                      >
                        <span
                          className="h-[10px] w-[10px] rounded-full"
                          style={{ backgroundColor: pieColors[index] }}
                        />
                        <span className="truncate">{item.name}</span>
                        <span className="text-left text-[14px] text-[#424242] dark:text-gray-200">
                          {item.value}%
                        </span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </DashboardCard>

          <DashboardCard
            title="النشاطات الأخيرة"
            action={
              <Link
                to="/admin/activity"
                className="flex items-center gap-2 text-[13px] text-[#30bfd6]"
                dir="ltr"
              >
                <ChevronRight size={22} strokeWidth={1.9} />
                <span>عرض الكل</span>
              </Link>
            }
            className="h-[360px] overflow-hidden"
          >
            <ActivityList
              activities={activities}
              loading={activitiesLoading}
              error={activitiesError}
              compact
            />
          </DashboardCard>
        </div>
      </section>
    </section>
  );
}

function Header() {
  const displayName = getAuthUserDisplayName(getCurrentAuthUser(), "المستخدم");

  return (
    <header className="flex min-h-[120px] flex-col gap-5 bg-white px-4 py-7 shadow-[0_1px_8px_rgba(0,0,0,0.03)] dark:bg-[#3a3a3a] sm:px-6 lg:flex-row lg:items-start lg:justify-between lg:px-[38px] lg:pt-[32px]">
      <div className="text-right">
        <h2 className="text-[26px] font-bold leading-[31px] text-[#333] dark:text-white">
          مرحبا {displayName} 👋
        </h2>
        <p className="mt-1 text-[14px] leading-5 text-[#8a8a8a] dark:text-gray-300">
          إليك ملخص أداء العيادة
        </p>
      </div>

    </header>
  );
}

function StatCard({ title, value, icon: Icon, color, bg }) {
  return (
    <article className="h-[154px] rounded-[10px] bg-white px-[32px] pb-[20px] pt-[27px] shadow-[0_4px_20px_rgba(0,0,0,0.08)] dark:bg-[#505050]">
      <div className="flex items-start justify-between" dir="ltr">
        <span
          className={`grid h-[56px] w-[56px] shrink-0 place-items-center rounded-[11px] ${bg} ${color}`}
        >
          <Icon size={29} strokeWidth={2} />
        </span>

        <div className="text-right" dir="rtl">
          <p className="text-[17px] leading-6 text-[#333] dark:text-gray-100">
            {title}
          </p>
          <h3 className="mt-1 text-[24px] font-bold leading-8 text-[#2e2e2e] dark:text-white">
            {value}
          </h3>
        </div>
      </div>

     
    </article>
  );
}

function DashboardCard({ title, action, children, className = "" }) {
  return (
    <section
      className={`rounded-[10px] bg-white px-[26px] pb-[18px] pt-[24px] shadow-[0_4px_20px_rgba(0,0,0,0.08)] dark:bg-[#505050] ${className}`}
    >
      <div className="mb-[17px] flex h-[37px] items-center justify-between gap-4">
        <h3 className="text-right text-[17px] font-bold leading-6 text-[#333] dark:text-white">
          {title}
        </h3>
        {action}
      </div>
      {children}
    </section>
  );
}

function ChartBox({ children }) {
  return (
    <div className="h-[219px] w-full text-[#6e767b] dark:text-gray-200">
      <ResponsiveContainer width="100%" height="100%">
        {children}
      </ResponsiveContainer>
    </div>
  );
}

function ChartState({ text = "لا توجد بيانات من قاعدة البيانات حتى الآن" }) {
  return (
    <div className="grid h-[219px] place-items-center text-center text-[16px] font-medium text-[#666] dark:text-gray-200">
      {text}
    </div>
  );
}

function RangeTabs({ options, value, onChange }) {
  return (
    <div className="flex h-[36px] w-[280px] overflow-hidden rounded-[9px] bg-[#fafafa] p-[2px] text-[12px] text-[#333] dark:bg-[#3f3f3f] dark:text-gray-200">
      {options.map((item) => (
        <button
          key={item.id}
          type="button"
          onClick={() => onChange(item.id)}
          className={`flex-1 rounded-[9px] transition ${
            item.id === value ? "bg-[#35c0d8] text-white" : ""
          }`}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}

function SelectControl({ value, onChange, options, className = "w-[128px]" }) {
  const [isOpen, setIsOpen] = useState(false);
  const selectedOption = options.find((option) => option.id === value) || options[0];

  const chooseOption = (optionId) => {
    onChange(optionId);
    setIsOpen(false);
  };

  return (
    <div
      className={`relative h-[37px] ${className}`}
      dir="rtl"
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          setIsOpen(false);
        }
      }}
    >
      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        className={`flex h-full w-full items-center justify-between gap-2 rounded-[10px] border px-3 text-[15px] font-semibold leading-5 outline-none transition ${
          isOpen
            ? "border-[#35c0d8] bg-[#35c0d8]/10 text-[#1daec8] shadow-[0_0_0_3px_rgba(53,192,216,0.14)] dark:text-white"
            : "border-[#d8d8d8] bg-[#fafafa] text-[#333] hover:border-[#35c0d8] dark:border-white/20 dark:bg-white/5 dark:text-white"
        }`}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <ChevronDown
          className={`shrink-0 transition ${isOpen ? "rotate-180" : ""}`}
          size={18}
          strokeWidth={2}
        />
        <span className="min-w-0 flex-1 truncate text-center">
          {selectedOption?.label}
        </span>
      </button>

      {isOpen && (
        <div
          className="absolute right-0 top-[calc(100%+8px)] z-30 max-h-64 w-full overflow-hidden rounded-[12px] border border-[#dce8ec] bg-white p-1.5 shadow-[0_16px_40px_rgba(20,72,89,0.18)] dark:border-white/10 dark:bg-[#3f3f3f] dark:shadow-[0_18px_45px_rgba(0,0,0,0.35)]"
          role="listbox"
        >
          <div className="max-h-56 overflow-y-auto pe-1">
            {options.map((option) => {
              const active = option.id === value;

              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => chooseOption(option.id)}
                  className={`flex min-h-10 w-full items-center justify-between gap-2 rounded-[9px] px-3 text-right text-[14px] font-medium transition ${
                    active
                      ? "bg-[#35c0d8] text-white shadow-[0_6px_14px_rgba(53,192,216,0.24)]"
                      : "text-[#333] hover:bg-[#eefbfd] hover:text-[#1298b2] dark:text-gray-100 dark:hover:bg-white/10 dark:hover:text-white"
                  }`}
                  role="option"
                  aria-selected={active}
                >
                  <span className="min-w-0 truncate">{option.label}</span>
                  {active && <Check size={16} strokeWidth={2.4} />}
                </button>
              );
            })}
          </div>
        </div>
      )}
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
