import {
  Banknote,
  CalendarDays,
  Search,
  Stethoscope,
  Users,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
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
    icon: Users,
    color: "text-teal-500",
    bg: "bg-teal-50",
  },
  {
    title: "إجمالي الحجوزات",
    value: "3,848",
    change: "-5%",
    icon: CalendarDays,
    color: "text-amber-500",
    bg: "bg-amber-50",
  },
  {
    title: "إجمالي الإيرادات",
    value: "125,430",
    change: "+18%",
    icon: Banknote,
    color: "text-green-600",
    bg: "bg-green-50",
  },
  {
    title: "إجمالي الأطباء",
    value: "32",
    change: "+5%",
    icon: Stethoscope,
    color: "text-blue-600",
    bg: "bg-blue-50",
  },
];

const appointments = [
  { month: "يناير", value: 360 },
  { month: "فبراير", value: 440 },
  { month: "مارس", value: 590 },
  { month: "أبريل", value: 620 },
  { month: "مايو", value: 950 },
  { month: "يونيو", value: 1100 },
  { month: "يوليو", value: 1250 },
];

const doctors = [
  { name: "أحمد علي", value: 125 },
  { name: "سارة خالد", value: 210 },
  { name: "أماني فضالي", value: 115 },
  { name: "محمد حسن", value: 130 },
  { name: "خالد توفيق", value: 75 },
  { name: "عبد الله محمد", value: 135 },
  { name: "طارق مصطفى", value: 185 },
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
  "#3498db",
  "#35b9d0",
  "#65c7c1",
  "#3aa0e8",
  "#45c0d6",
  "#169bd5",
];

export default function Dashboard() {
  return (
    <section>
      <Header />

      <section className="p-4 sm:p-6 lg:p-8">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((item) => (
            <StatCard key={item.title} {...item} />
          ))}
        </div>

        <div className="mt-6 grid grid-cols-1 gap-5 xl:grid-cols-2">
          <Card title="عدد المواعيد">
            <div className="mb-6 flex w-full max-w-sm overflow-hidden rounded-xl bg-gray-100 dark:bg-[#3b3b3b]">
              {["سنة", "شهر", "أسبوع", "يوم"].map((item, index) => (
                <button
                  key={item}
                  className={`flex-1 py-2 text-sm ${
                    index === 0
                      ? "bg-cyan-400 text-white"
                      : "text-gray-700 dark:text-gray-200"
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>

            <ChartBox>
              <LineChart data={appointments}>
                <CartesianGrid
                  stroke="currentColor"
                  opacity={0.18}
                  vertical={false}
                />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 15, fill: "currentColor" }}
                />
                <YAxis
                  tick={{ fontSize: 15, fill: "currentColor" }}
                  tickMargin={40}
                />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#22c7f4"
                  strokeWidth={3}
                  dot={{ r: 5, fill: "#22c7f4" }}
                />
              </LineChart>
            </ChartBox>
          </Card>

          <Card title="عدد المواعيد لكل طبيب">
            <div className="mb-6 flex gap-2">
              <SelectButton text="السنة" />
              <SelectButton text="الكل" />
            </div>

            <ChartBox>
              <BarChart data={doctors}>
                <CartesianGrid
                  stroke="currentColor"
                  opacity={0.18}
                  vertical={false}
                />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 13, fill: "currentColor" }}
                  tickMargin={12}
                />
                <YAxis
                  tick={{ fontSize: 15, fill: "currentColor" }}
                  tickMargin={40}
                />
                <Tooltip />
                <Bar dataKey="value" fill="#20b8df" barSize={30} />
              </BarChart>
            </ChartBox>
          </Card>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-5 xl:grid-cols-[1.15fr_0.85fr]">
          <Card title="النشاط الأخير">
            <div className="mt-6 max-h-[250px] overflow-hidden">
              {[
                "تم إنشاء حساب مستخدم جديد",
                "تم حجز موعد جديد",
                "تم إلغاء موعد",
                "تم إضافة طبيب جديد",
                "تم تحديث بيانات العيادة",
              ].map((text) => (
                <div
                  key={text}
                  className="flex items-center justify-between border-b border-gray-200 py-4 dark:border-white/30"
                >
                  <span className="text-xs text-gray-500 dark:text-gray-300">
                    منذ 10 دقائق
                  </span>
                  <div className="flex items-center gap-3">
                    <span className="text-sm sm:text-base">{text}</span>
                    <span className="grid h-10 w-10 place-items-center rounded-full bg-teal-50 text-teal-500">
                      <Users size={20} />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card title="أكثر التخصصات حجزا">
            <div className="flex flex-col items-center gap-6 md:flex-row md:justify-between">
              <div className="h-[230px] w-[230px]">
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      data={specializations}
                      dataKey="value"
                      innerRadius={68}
                      outerRadius={112}
                    >
                      {specializations.map((_, index) => (
                        <Cell key={pieColors[index]} fill={pieColors[index]} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="space-y-3">
                {specializations.map((item, index) => (
                  <div key={item.name} className="flex items-center gap-3 text-sm">
                    <span>{item.value}%</span>
                    <span>{item.name}</span>
                    <span
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: pieColors[index] }}
                    />
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>
      </section>
    </section>
  );
}

function Header() {
  return (
    <header className="flex h-auto flex-col gap-4 bg-white px-4 py-6 shadow-sm dark:bg-[#3a3a3a] sm:px-8 lg:h-[120px] lg:flex-row lg:items-center lg:justify-between">
      <div className="mr-13 lg:mr-0">
        <h2 className="text-xl font-bold sm:text-2xl">
          مرحبا د. أحمد محمد
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-300">
          إليك ملخص أداء العيادة
        </p>
      </div>

      <label className="flex w-full items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3 text-gray-500 dark:border-white/30 dark:bg-transparent dark:text-gray-200 lg:w-[350px]">
        <Search size={20} />
        <input className="w-full bg-transparent outline-none" placeholder="ابحث هنا..." />
      </label>
    </header>
  );
}

function StatCard({ title, value, change, icon: Icon, color, bg }) {
  const isDown = change.includes("-");

  return (
    <div className="rounded-xl bg-white p-6 shadow-[0_0_20px_rgba(0,0,0,0.08)] dark:bg-[#505050]">
      <div className="flex items-center justify-between">
        <div className={`grid h-14 w-14 place-items-center rounded-xl ${bg} ${color}`}>
          <Icon size={30} />
        </div>

        <div className="text-right">
          <p className="text-base text-gray-700 dark:text-gray-200">{title}</p>
          <h3 className="mt-1 text-2xl font-bold">{value}</h3>
        </div>
      </div>

      <p className="mt-7 text-base text-gray-500 dark:text-gray-300">
        عن الشهر الماضي{" "}
        <span className={isDown ? "text-red-500" : "text-green-600"}>
          {change}
        </span>
      </p>
    </div>
  );
}

function Card({ title, children }) {
  return (
    <div className="rounded-xl bg-white p-6 shadow-[0_0_20px_rgba(0,0,0,0.08)] dark:bg-[#505050]">
      <h3 className="mb-2 text-right text-xl font-bold">{title}</h3>
      {children}
    </div>
  );
}

function ChartBox({ children }) {
  return (
    <div className="h-[230px] w-full text-gray-500 dark:text-gray-200">
      <ResponsiveContainer width="100%" height="100%">
        {children}
      </ResponsiveContainer>
    </div>
  );
}

function SelectButton({ text }) {
  return (
    <button className="rounded-xl border border-gray-300 px-6 py-2 text-sm text-gray-700 dark:border-white/30 dark:text-white">
      {text}
    </button>
  );
}
