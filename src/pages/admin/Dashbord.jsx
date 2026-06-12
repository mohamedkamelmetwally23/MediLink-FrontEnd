import { Link } from "react-router-dom";
import {
  Banknote,
  Bell,
  CalendarDays,
  ChevronDown,
  ChevronLeft,
  Search,
  Stethoscope,
  TrendingDown,
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

const stats = [
  {
    title: "إجمالي المستخدمين",
    value: "2,449",
    change: "+13%",
    icon: UserRound,
    color: "text-[#4fc5b9]",
    bg: "bg-[#eefcfa]",
  },
  {
    title: "إجمالي الحجوزات",
    value: "3,848",
    change: "-5%",
    icon: CalendarDays,
    color: "text-[#ffb21d]",
    bg: "bg-[#fff3d8]",
  },
  {
    title: "إجمالي الأطباء",
    value: "32",
    change: "+5%",
    icon: Stethoscope,
    color: "text-[#1d77c8]",
    bg: "bg-[#edf6ff]",
  },
  {
    title: "إجمالي الإيرادات",
    value: "125,430",
    change: "+18%",
    icon: Banknote,
    color: "text-[#5bbf22]",
    bg: "bg-[#edf9e6]",
  },
];

const appointments = [
  { month: "يناير", value: 360 },
  { month: "فبراير", value: 390 },
  { month: "مارس", value: 590 },
  { month: "أبريل", value: 610 },
  { month: "مايو", value: 950 },
  { month: "يونيو", value: 1090 },
  { month: "يوليو", value: 1240 },
];

const doctors = [
  { name: "أحمد علي", value: 125 },
  { name: "سارة خالد", value: 210 },
  { name: "أماني فضالي", value: 115 },
  { name: "محمد حسن", value: 130 },
  { name: "خالد توفيق", value: 75 },
  { name: "عبد الله حامد", value: 135 },
  { name: "طارق مصطفى", value: 185 },
];

const activities = [
  "تم إنشاء حساب مستخدم جديد",
  "تم حجز موعد جديد",
  "تم إلغاء موعد",
  "تم إضافة طبيب جديد",
  "تم تحديث بيانات العيادة",
];

const specializations = [
  { name: "فم وأسنان", value: 25 },
  { name: "جلدية وتجميل", value: 20 },
  { name: "مخ وأعصاب", value: 15 },
  { name: "الأطفال", value: 13 },
  { name: "العين", value: 10 },
  { name: "أمراض باطنة", value: 9 },
  { name: "أنف وأذن", value: 8 },
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

export default function Dashboard() {
  return (
    <section className="min-h-screen bg-[#f8fbfc] text-[#333333] dark:bg-[#2f2f2f] dark:text-white">
      <Header />

      <section className="space-y-[23px] px-4 py-8 sm:px-6 lg:px-[38px]">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((item) => (
            <StatCard key={item.title} {...item} />
          ))}
        </div>

        <div className="grid grid-cols-1 gap-[18px] xl:grid-cols-2">
          <DashboardCard
            title="عدد الحجوزات"
            action={<RangeTabs options={["يوم", "أسبوع", "شهر", "سنة"]} />}
            className="h-[317px]"
          >
            <ChartBox>
              <AreaChart
                data={appointments}
                margin={{ top: 13, right: 5, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="appointmentsFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#28bfe1" stopOpacity={0.18} />
                    <stop offset="100%" stopColor="#28bfe1" stopOpacity={0.08} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  stroke="#d9e2e7"
                  strokeDasharray="0"
                  vertical={false}
                />
                <XAxis
                  dataKey="month"
                  axisLine={{ stroke: "#7e8a91" }}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: "#6e767b" }}
                  tickMargin={11}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: "#6e767b" }}
                  ticks={[0, 500, 1000, 1500]}
                  domain={[0, 1500]}
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
            <ChartBox>
              <BarChart
                data={doctors}
                margin={{ top: 13, right: 5, left: 0, bottom: 0 }}
                barCategoryGap="29%"
              >
                <defs>
                  <linearGradient id="doctorBarFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10aee3" />
                    <stop offset="100%" stopColor="#62c9c2" />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  stroke="#d9e2e7"
                  strokeDasharray="0"
                  vertical={false}
                />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  interval={0}
                  tick={{ fontSize: 10, fill: "#6e767b" }}
                  tickMargin={8}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: "#6e767b" }}
                  ticks={[0, 50, 100, 150, 200]}
                  domain={[0, 220]}
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
          </DashboardCard>
        </div>

        <div className="grid grid-cols-1 gap-[18px] xl:grid-cols-[minmax(0,0.75fr)_minmax(0,1fr)]">
          <DashboardCard title="أكثر التخصصات حجزا" className="h-[360px] overflow-hidden">
            <div
              className="flex h-[232px] items-center justify-between gap-5"
              dir="ltr"
            >
              <div className="h-[224px] w-[224px] shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={specializations}
                      dataKey="value"
                      innerRadius={67}
                      outerRadius={112}
                      paddingAngle={0}
                      stroke="none"
                    >
                      {specializations.map((_, index) => (
                        <Cell key={pieColors[index]} fill={pieColors[index]} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="w-[150px] space-y-[8px]" dir="rtl">
                {specializations.map((item, index) => (
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
                <ChevronLeft size={16} strokeWidth={1.8} />
                <span>عرض الكل</span>
              </Link>
            }
            className="h-[360px] overflow-hidden"
          >
            <div className="mt-1 overflow-hidden">
              {activities.map((text) => (
                <div
                  key={text}
                  className="flex h-[56px] items-center justify-between gap-5 border-b border-[#e9eef1] last:border-b-0 dark:border-white/15"
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
              ))}
            </div>
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
          مرحبا أحمد محمد 👋
        </h2>
        <p className="mt-1 text-[14px] leading-5 text-[#8a8a8a] dark:text-gray-300">
          إليك ملخص أداء العيادة
        </p>
      </div>

      <label className="flex h-[56px] w-full items-center gap-3 rounded-[12px] border border-[#d7d7d7] bg-[#fbfbfb] px-[18px] text-[#9a9a9a] shadow-[inset_0_1px_1px_rgba(0,0,0,0.02)] dark:border-white/20 dark:bg-transparent dark:text-gray-200 lg:w-[351px]">
        <Search size={20} strokeWidth={1.8} />
        <input
          className="min-w-0 flex-1 bg-transparent text-[14px] outline-none placeholder:text-[#9a9a9a]"
          placeholder="إبحث هنا..."
        />
      </label>
    </header>
  );
}

function StatCard({ title, value, change, icon: Icon, color, bg }) {
  const isDown = change.includes("-");
  const TrendIcon = isDown ? TrendingDown : TrendingUp;

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

      <p className="mt-[26px] flex items-center justify-end gap-2 text-[16px] leading-5 text-[#666] dark:text-gray-300">
        <span>عن الشهر الماضي</span>
        <span
          className={`flex items-center gap-1 ${
            isDown ? "text-[#ff2020]" : "text-[#36b320]"
          }`}
        >
          {change}
          <TrendIcon size={16} strokeWidth={2} />
        </span>
      </p>
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
