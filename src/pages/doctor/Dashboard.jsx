import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Banknote,
  Bell,
  CalendarCheck,
  CalendarDays,
  ChevronLeft,
  Search,
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
import doctorAvatar from "../../assets/landingPage/admin.png";
import patientAvatarOne from "../../assets/landingPage/12 1.png";
import patientAvatarTwo from "../../assets/landingPage/12 1 (1).png";
import patientAvatarThree from "../../assets/landingPage/12 1 (2).png";
import patientAvatarFour from "../../assets/landingPage/12 1 (3).png";
import {
  getCurrentDoctorId,
  listDoctorAppointments,
} from "../../services/medilinkApi";
import { useUsersStore } from "../admin/users/useUsersStore";

const stats = [
  {
    title: "مواعيد اليوم",
    value: "10",
    change: "-10%",
    period: "عن اليوم الماضي",
    icon: CalendarCheck,
    color: "text-[#287dd8]",
    bg: "bg-[#edf6ff]",
  },
  {
    title: "إجمالي المرضى",
    value: "234",
    change: "+13%",
    period: "عن الشهر الماضي",
    icon: UserRound,
    color: "text-[#4fc5b9]",
    bg: "bg-[#eefcfa]",
  },
  {
    title: "إجمالي الحجوزات",
    value: "453",
    change: "-5%",
    period: "عن الشهر الماضي",
    icon: CalendarDays,
    color: "text-[#ffb21d]",
    bg: "bg-[#fff3d8]",
  },
  {
    title: "إجمالي الإيرادات",
    value: "15,430",
    change: "+18%",
    period: "عن الشهر الماضي",
    icon: Banknote,
    color: "text-[#5bbf22]",
    bg: "bg-[#edf9e6]",
  },
];

const bookingsChart = [
  { month: "يناير", value: 70 },
  { month: "فبراير", value: 76 },
  { month: "مارس", value: 90 },
  { month: "أبريل", value: 121 },
  { month: "مايو", value: 126 },
  { month: "يونيو", value: 186 },
  { month: "يوليو", value: 220 },
  { month: "أغسطس", value: 252 },
];

const todayAppointments = [
  {
    patient: "ندى علي",
    time: "5:30 م - 5:00 م",
    status: "قيد الإنتظار",
    tone: "waiting",
    image: patientAvatarOne,
  },
  {
    patient: "خليل محمد",
    time: "5:00 م - 4:30 م",
    status: "قيد الإنتظار",
    tone: "waiting",
    image: patientAvatarTwo,
  },
  {
    patient: "أحمد الفقي",
    time: "4:00 م - 3:30 م",
    status: "الآن",
    tone: "now",
    image: doctorAvatar,
  },
  {
    patient: "أحمد المحمدي",
    time: "3:30 م - 3:00 م",
    status: "تم الكشف",
    tone: "done",
    image: patientAvatarThree,
  },
  {
    patient: "خالد محمد",
    time: "3:00 م - 2:30 م",
    status: "ملغي",
    tone: "cancelled",
    image: patientAvatarFour,
  },
];

const activities = [
  "تم إنشاء حجز موعد",
  "تم إضافة وصفة طبية للمريض بنجاح",
  "تم إلغاء موعد",
  "تم إضافة سجل مرضي جديد",
  "تم تحديث البيانات",
];

const weeklyStates = [
  { name: "مؤكد", value: 65, count: 48, color: "#1976d2" },
  { name: "مكتمل", value: 25, count: 24, color: "#38bfd7" },
  { name: "ملغي", value: 10, count: 10, color: "#7fd8d4" },
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

export default function DoctorDashboard() {
  const isDark = useDarkTheme();
  const { users } = useUsersStore();
  const [doctorAppointments, setDoctorAppointments] = useState([]);
  const axisColor = isDark ? "#f3f4f6" : "#777";
  const axisLineColor = isDark ? "#d1d5db" : "#cad6dd";
  const gridColor = isDark ? "#6b7280" : "#e8eef2";
  const tickStyle = {
    fontSize: 9,
    fill: axisColor,
    fontWeight: 600,
  };
  const todayIso = new Date().toISOString().slice(0, 10);
  const todayCount = doctorAppointments.filter(
    (appointment) => appointment.date === todayIso,
  ).length;
  const dashboardStats = stats.map((item, index) => {
    const values = [
      doctorAppointments.length > 0 ? todayCount : item.value,
      users.filter((user) => user.role === "patient").length,
      doctorAppointments.length || item.value,
      item.value,
    ];

    return {
      ...item,
      value: String(values[index]),
    };
  });

  useEffect(() => {
    let mounted = true;

    listDoctorAppointments(getCurrentDoctorId())
      .then((fetchedAppointments) => {
        if (mounted) {
          setDoctorAppointments(fetchedAppointments);
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

      <main className="space-y-[18px] px-4 py-[24px] sm:px-6 lg:px-[24px]">
        <div className="grid grid-cols-1 gap-[14px] sm:grid-cols-2 xl:grid-cols-4">
          {dashboardStats.map((item) => (
            <StatCard key={item.title} {...item} />
          ))}
        </div>

        <div className="grid grid-cols-1 gap-[18px] xl:grid-cols-[minmax(330px,0.95fr)_minmax(0,1.25fr)]">
          <AppointmentsToday />

          <DashboardCard
            title="عدد الحجوزات"
            action={<RangeTabs options={["يوم", "أسبوع", "شهر", "سنة"]} />}
            className="min-h-[238px]"
          >
            <div className="h-[170px] w-full text-[#6e767b] dark:text-gray-200">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={bookingsChart}
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
                    tick={tickStyle}
                    tickMargin={8}
                  />
                  <YAxis
                    axisLine={{ stroke: axisLineColor }}
                    tickLine={false}
                    tick={tickStyle}
                    ticks={[0, 100, 200, 300]}
                    domain={[0, 300]}
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
          <WeeklyBookings />
          <RecentActivity />
        </div>
      </main>
    </section>
  );
}

function Header() {
  return (
    <header className="flex min-h-[100px] flex-col gap-5 bg-white px-4 py-[22px] shadow-[0_1px_8px_rgba(0,0,0,0.03)] dark:bg-[#3a3a3a] sm:px-6 lg:flex-row lg:items-start lg:justify-between lg:px-[24px]">
      <div className="text-right">
        <h1 className="text-[20px] font-bold leading-7 text-[#333] dark:text-white">
          مرحبا توفيق عبد الله 👋
        </h1>
        <p className="mt-1 text-[11px] leading-5 text-[#8a8a8a] dark:text-gray-300">
          إليك ملخص أدائك اليومى
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
        placeholder="إبحث هنا..."
        dir="rtl"
      />
      <Search size={17} strokeWidth={1.7} />
    </label>
  );
}

function StatCard({ title, value, change, period, icon: Icon, color, bg }) {
  const isDown = change.includes("-");
  const TrendIcon = isDown ? TrendingDown : TrendingUp;

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
            {value}
          </h3>
        </div>
      </div>

      <p className="mt-[20px] flex items-center justify-end gap-1 text-[10px] leading-4 text-[#777] dark:text-gray-300">
        <span>{period}</span>
        <span
          className={`flex items-center gap-1 ${
            isDown ? "text-[#ff2020]" : "text-[#36b320]"
          }`}
        >
          {change}
          <TrendIcon size={12} strokeWidth={2} />
        </span>
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
        <button
          key={item}
          type="button"
          className={`flex-1 rounded-[7px] transition ${
            item === "شهر" ? "bg-[#35c0d8] text-white" : ""
          }`}
        >
          {item}
        </button>
      ))}
    </div>
  );
}

function AppointmentsToday() {
  return (
    <DashboardCard
      title="مواعيد اليوم"
      action={<CardLink to="/doctor/appointments" />}
      className="min-h-[238px] overflow-hidden"
    >
      <div className="space-y-[2px]">
        {todayAppointments.map((appointment) => (
          <AppointmentRow
            key={`${appointment.patient}-${appointment.time}`}
            appointment={appointment}
          />
        ))}
      </div>
    </DashboardCard>
  );
}

function AppointmentRow({ appointment }) {
  return (
    <article className="grid h-[36px] grid-cols-[34px_minmax(0,1fr)_64px] items-center gap-[8px] rounded-[7px] px-[4px] transition hover:bg-[#f5fbfc] dark:hover:bg-white/10">
      <img
        src={appointment.image}
        alt={appointment.patient}
        className="h-[30px] w-[30px] rounded-full object-cover"
      />
      <div className="min-w-0 text-right">
        <h3 className="truncate text-[11px] font-bold leading-4 text-[#333] dark:text-white">
          {appointment.patient}
        </h3>
        <p className="truncate text-[9px] leading-3 text-[#7d7d7d] dark:text-gray-300">
          {appointment.time}
        </p>
      </div>
      <StatusBadge tone={appointment.tone}>{appointment.status}</StatusBadge>
    </article>
  );
}

function StatusBadge({ tone, children }) {
  const toneClasses = {
    waiting: "bg-[#fff1cd] text-[#d79a16]",
    now: "bg-[#dff8f5] text-[#24b7a6]",
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

function WeeklyBookings() {
  return (
    <DashboardCard
      title="حالات حجز المواعيد هذا الأسبوع"
      className="min-h-[238px]"
    >
      <div className="flex h-[176px] items-center justify-center gap-[24px]" dir="ltr">
        <div className="h-[146px] w-[146px] shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={weeklyStates}
                dataKey="value"
                innerRadius={47}
                outerRadius={73}
                paddingAngle={0}
                stroke="none"
              >
                {weeklyStates.map((item) => (
                  <Cell key={item.name} fill={item.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="w-[120px] space-y-[8px]" dir="rtl">
          {weeklyStates.map((item) => (
            <div
              key={item.name}
              className="grid grid-cols-[10px_1fr_48px] items-center gap-2 text-[11px] leading-4 text-[#444] dark:text-gray-100"
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
    </DashboardCard>
  );
}

function RecentActivity() {
  return (
    <DashboardCard
      title="النشاط الأخير"
      action={<CardLink to="/doctor/activity" />}
      className="min-h-[238px] overflow-hidden"
    >
      <div className="mt-1 overflow-hidden">
        {activities.map((text) => (
          <ActivityRow key={text} text={text} />
        ))}
      </div>
    </DashboardCard>
  );
}

function ActivityRow({ text }) {
  return (
    <div
      className="flex h-[35px] items-center justify-between gap-4 border-b border-[#eef2f4] last:border-b-0 dark:border-white/15"
      dir="ltr"
    >
      <span className="shrink-0 text-[8px] text-[#777] dark:text-gray-300">
        منذ 10 دقائق
      </span>
      <div className="flex min-w-0 items-center gap-[9px]" dir="ltr">
        <span
          className="truncate text-[11px] font-medium text-[#333] dark:text-white"
          dir="rtl"
        >
          {text}
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

const tooltipStyle = {
  border: "1px solid #e2edf1",
  borderRadius: 8,
  boxShadow: "0 8px 20px rgba(20, 72, 89, 0.1)",
  direction: "rtl",
  fontFamily: "Cairo, sans-serif",
  fontSize: 12,
};
