import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Banknote,
  CalendarDays,
  ChevronDown,
  ChevronRight,
  Stethoscope,
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
import { listAppointments } from "../../services/medilinkApi";
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

function buildMonthlyAppointmentChart(appointments) {
  const monthCounts = new Map();

  appointments.forEach((appointment) => {
    const date = new Date(appointment.date || appointment.raw?.createdAt || "");
    if (Number.isNaN(date.getTime())) return;

    const month = monthNames[date.getMonth()];
    monthCounts.set(month, (monthCounts.get(month) || 0) + 1);
  });

  return Array.from(monthCounts, ([month, value]) => ({ month, value }));
}

function buildDoctorChart(appointments, users) {
  const doctors = users.filter((user) => user.role === "doctor");
  const doctorsById = new Map();
  const doctorCounts = new Map(
    doctors.map((doctor) => {
      const name = `${doctor.firstName || ""} ${doctor.lastName || ""}`.trim() || "طبيب";

      [doctor.id, doctor.userId, doctor.raw?._id, doctor.raw?.user?._id]
        .filter(Boolean)
        .forEach((id) => doctorsById.set(String(id), name));

      return [name, 0];
    }),
  );

  appointments.forEach((appointment) => {
    const doctorId = String(appointment.doctorId || appointment.raw?.doctorId || "");
    const appointmentDoctor = String(appointment.doctor || "").trim();
    const name =
      doctorsById.get(doctorId) ||
      doctorsById.get(appointmentDoctor) ||
      (/^[a-f\d]{24}$/i.test(appointmentDoctor) ? "" : appointmentDoctor);

    if (!name) return;
    doctorCounts.set(name, (doctorCounts.get(name) || 0) + 1);
  });

  return Array.from(doctorCounts, ([name, value]) => ({ name, value }));
}

function formatDoctorTick(name) {
  const value = String(name || "");
  return value.length > 16 ? `${value.slice(0, 14)}…` : value;
}

function buildSpecializationChart(users) {
  const specialtyCounts = new Map();

  users
    .filter((user) => user.role === "doctor" && user.specialty)
    .forEach((doctor) => {
      specialtyCounts.set(
        doctor.specialty,
        (specialtyCounts.get(doctor.specialty) || 0) + 1,
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
  const axisColor = isDark ? "#f3f4f6" : "#2f3a40";
  const axisLineColor = isDark ? "#d1d5db" : "#3f4b52";
  const gridColor = isDark ? "#6b7280" : "#d9e2e7";
  const tickStyle = {
    fontSize: 11,
    fill: axisColor,
    fontWeight: 600,
  };
  const appointmentChart = useMemo(
    () => buildMonthlyAppointmentChart(dashboardAppointments),
    [dashboardAppointments],
  );
  const doctorChart = useMemo(
    () => buildDoctorChart(dashboardAppointments, users),
    [dashboardAppointments, users],
  );
  const specializationChart = useMemo(
    () => buildSpecializationChart(users),
    [users],
  );
  const totalRevenue = dashboardAppointments.reduce(
    (total, appointment) => total + getAppointmentRevenue(appointment),
    0,
  );
  const dashboardStats = statsConfig.map((item, index) => {
    const values = [
      users.length,
      dashboardAppointments.length,
      users.filter((user) => user.role === "doctor").length,
      totalRevenue,
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
        }
      })
      .catch(() => null);

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <section className="min-h-screen bg-[#f8fbfc] text-[#333333] dark:bg-[#2f2f2f] dark:text-white">
      <Header />

      <section className="space-y-[23px] px-4 py-8 sm:px-6 lg:px-[38px]">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {dashboardStats.map((item) => (
            <StatCard key={item.title} {...item} />
          ))}
        </div>

        <div className="grid grid-cols-1 gap-[18px] xl:grid-cols-2">
          <DashboardCard
            title="عدد الحجوزات"
            action={<RangeTabs options={["يوم", "أسبوع", "شهر", "سنة"]} />}
            className="h-[317px]"
          >
            {appointmentChart.length === 0 ? (
              <ChartState />
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
                    dataKey="month"
                    axisLine={{ stroke: axisLineColor }}
                    tickLine={false}
                    tick={tickStyle}
                    tickMargin={11}
                  />
                  <YAxis
                    axisLine={{ stroke: axisLineColor }}
                    tickLine={false}
                    tick={tickStyle}
                    allowDecimals={false}
                    width={43}
                  />
                  <Tooltip contentStyle={tooltipStyle} />
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
                <SelectButton text="الكل" />
                <SelectButton text="السنة" />
              </div>
            }
            className="h-[317px]"
          >
            {doctorChart.length === 0 ? (
              <ChartState />
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
                    allowDecimals={false}
                    width={43}
                  />
                  <Tooltip
                    contentStyle={tooltipStyle}
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
            <ChartState text="لا يوجد نشاط من قاعدة البيانات حتى الآن" />
          </DashboardCard>
        </div>
      </section>
    </section>
  );
}

function Header() {
  return (
    <header className="flex min-h-[120px] flex-col gap-5 bg-white px-4 py-7 shadow-[0_1px_8px_rgba(0,0,0,0.03)] dark:bg-[#3a3a3a] sm:px-6 lg:flex-row lg:items-start lg:justify-between lg:px-[38px] lg:pt-[32px]">
      <div className="text-right">
        <h2 className="text-[26px] font-bold leading-[31px] text-[#333] dark:text-white">
          مرحبا أحمد  محمد 👋
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

function RangeTabs({ options }) {
  return (
    <div className="flex h-[36px] w-[280px] overflow-hidden rounded-[9px] bg-[#fafafa] p-[2px] text-[12px] text-[#333] dark:bg-[#3f3f3f] dark:text-gray-200">
      {options.map((item) => (
        <button
          key={item}
          type="button"
          className={`flex-1 rounded-[9px] transition ${
            item === "شهر" ? "bg-[#35c0d8] text-white" : ""
          }`}
        >
          {item}
        </button>
      ))}
    </div>
  );
}

function SelectButton({ text }) {
  return (
    <button
      type="button"
      className="flex h-[37px] w-[101px] items-center justify-center gap-3 rounded-[9px] border border-[#d8d8d8] bg-[#fafafa] text-[17px] leading-5 text-[#333] dark:border-white/20 dark:bg-transparent dark:text-white"
      dir="ltr"
    >
      <ChevronDown size={19} strokeWidth={1.8} />
      {text}
    </button>
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
