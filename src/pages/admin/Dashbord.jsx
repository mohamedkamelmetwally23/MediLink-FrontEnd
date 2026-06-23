import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Banknote,
  CalendarDays,
  Check,
  ChevronDown,
  Receipt,
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
  LabelList,
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
  { id: "day", label: "في اليوم" },
  { id: "week", label: "في الأسبوع" },
  { id: "month", label: "في الشهر" },
  { id: "year", label: "في السنة" },
];

const doctorPeriodOptions = [
  { id: "all", label: "الكل" },
  { id: "day", label: "في اليوم" },
  { id: "week", label: "في الأسبوع" },
  { id: "month", label: "في الشهر" },
  { id: "year", label: "في السنة" },
];

function getDoctorChartTitle(selectedPeriod) {
  const periodLabel = doctorPeriodOptions.find(
    (option) => option.id === selectedPeriod && option.id !== "all",
  )?.label;

  return periodLabel
    ? `عدد الحجوزات لكل طبيب ${periodLabel}`
    : "عدد الحجوزات لكل طبيب";
}

function getAppointmentChartTitle(selectedRange) {
  const rangeLabel = appointmentRangeOptions.find(
    (option) => option.id === selectedRange,
  )?.label;

  return rangeLabel ? `عدد الحجوزات ${rangeLabel}` : "عدد الحجوزات";
}

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

function getUserDate(user) {
  const raw = user.raw || {};
  const date = new Date(
    user.createdAt ||
      user.registeredAt ||
      user.registrationDate ||
      raw.createdAt ||
      raw.updatedAt ||
      "",
  );

  return Number.isNaN(date.getTime()) ? null : date;
}

function getDateKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
    2,
    "0",
  )}-${String(date.getDate()).padStart(2, "0")}`;
}

function getPreviousMonth(date) {
  return new Date(date.getFullYear(), date.getMonth() - 1, 1);
}

function isSameCalendarMonth(date, targetMonth) {
  return (
    date &&
    targetMonth &&
    date.getFullYear() === targetMonth.getFullYear() &&
    date.getMonth() === targetMonth.getMonth()
  );
}

function buildStatTrend(current, previous, label = "عن الشهر الماضي") {
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

function getWeekStart(date) {
  const weekStart = new Date(date);
  weekStart.setHours(0, 0, 0, 0);
  weekStart.setDate(date.getDate() - ((date.getDay() + 1) % 7));
  return weekStart;
}

function formatDayLabel(date) {
  return `${date.getDate()} ${monthNames[date.getMonth()]}`;
}

function formatHourLabel(hour) {
  const hourNumber = Number(hour) || 0;
  const hour12 = hourNumber % 12 || 12;
  const period = hourNumber >= 12 ? "م" : "ص";

  return `${hour12} ${period}`;
}

function getAppointmentHour(appointment) {
  const rawTime =
    appointment.time ||
    appointment.appointmentTime ||
    appointment.raw?.time ||
    appointment.raw?.appointmentTime ||
    appointment.raw?.slotTime ||
    appointment.raw?.slot?.time ||
    "";
  const hour = Number(String(rawTime).split(":")[0]);

  if (Number.isFinite(hour)) return hour;

  const date = getAppointmentDate(appointment);
  return date ? date.getHours() : null;
}

function getLatestAppointmentDate(appointments) {
  return appointments.reduce((latest, appointment) => {
    const date = getAppointmentDate(appointment);

    if (!date) return latest;
    return !latest || date > latest ? date : latest;
  }, null);
}

function getCurrentRangeBounds(range, anchorDate = new Date()) {
  const today = new Date(anchorDate);
  today.setHours(0, 0, 0, 0);

  if (range === "day") {
    const end = new Date(today);
    end.setHours(23, 59, 59, 999);

    return { start: today, end };
  }

  if (range === "week") {
    const start = getWeekStart(today);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    end.setHours(23, 59, 59, 999);

    return { start, end };
  }

  if (range === "month") {
    return {
      start: new Date(today.getFullYear(), today.getMonth(), 1),
      end: new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59, 999),
    };
  }

  return {
    start: new Date(today.getFullYear(), 0, 1),
    end: new Date(today.getFullYear(), 11, 31, 23, 59, 59, 999),
  };
}

function getAppointmentBucket(date, range) {
  if (range === "year") {
    return {
      key: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`,
      label: monthNames[date.getMonth()],
    };
  }

  return {
    key: getDateKey(date),
    label:
      range === "week"
        ? `${formatShortWeekday(date)} ${date.getDate()}`
        : formatDayLabel(date),
  };
}

function getAppointmentBucketForAppointment(appointment, date, range) {
  if (range === "day") {
    const hour = getAppointmentHour(appointment);
    if (hour === null) return null;

    return {
      key: String(hour).padStart(2, "0"),
      label: formatHourLabel(hour),
    };
  }

  return getAppointmentBucket(date, range);
}

function buildAppointmentBuckets(range, anchorDate) {
  if (range === "day") {
    return Array.from({ length: 14 }, (_, index) => {
      const hour = index + 8;

      return {
        key: String(hour).padStart(2, "0"),
        label: formatHourLabel(hour),
        value: 0,
      };
    });
  }

  if (range === "week") {
    const start = getWeekStart(anchorDate);

    return Array.from({ length: 7 }, (_, index) => {
      const date = new Date(start);
      date.setDate(start.getDate() + index);

      return {
        ...getAppointmentBucket(date, range),
        value: 0,
      };
    });
  }

  if (range === "month") {
    const daysInMonth = new Date(
      anchorDate.getFullYear(),
      anchorDate.getMonth() + 1,
      0,
    ).getDate();

    return Array.from({ length: daysInMonth }, (_, index) => {
      const date = new Date(anchorDate.getFullYear(), anchorDate.getMonth(), index + 1);

      return {
        ...getAppointmentBucket(date, range),
        value: 0,
      };
    });
  }

  return Array.from({ length: 12 }, (_, index) => {
    const date = new Date(anchorDate.getFullYear(), index, 1);

    return {
      ...getAppointmentBucket(date, range),
      value: 0,
    };
  });
}

function buildAppointmentChart(appointments, range) {
  const anchorDate = getLatestAppointmentDate(appointments);

  if (!anchorDate) return [];

  const { start, end } = getCurrentRangeBounds(range, anchorDate);
  const counts = new Map(
    buildAppointmentBuckets(range, anchorDate).map((bucket) => [
      bucket.key,
      bucket,
    ]),
  );

  appointments.forEach((appointment) => {
    const date = getAppointmentDate(appointment);
    if (!date) return;
    if (date < start || date > end) return;

    const bucket = getAppointmentBucketForAppointment(appointment, date, range);
    if (!bucket) return;

    const current = counts.get(bucket.key) || { ...bucket, value: 0 };
    counts.set(bucket.key, { ...current, value: current.value + 1 });
  });

  return Array.from(counts.values())
    .sort((first, second) => first.key.localeCompare(second.key));
}

function getDoctorName(doctor) {
  return `${doctor.firstName || ""} ${doctor.lastName || ""}`.trim() || "طبيب";
}

function getEntityId(value) {
  if (!value) return "";
  if (typeof value === "string") return value;

  return (
    value._id ||
    value.id ||
    value.user?._id ||
    value.user?.id ||
    value.account?._id ||
    value.account?.id ||
    value.profile?._id ||
    value.profile?.id ||
    ""
  );
}

function uniqueIds(ids) {
  return Array.from(
    new Set(
      ids
        .map((id) => {
          if (!id) return "";
          if (typeof id === "string" || typeof id === "number") return String(id);
          return getEntityId(id);
        })
        .filter(Boolean),
    ),
  );
}

function getDoctorLookupIds(doctor = {}) {
  const raw = doctor.raw || {};

  return uniqueIds([
    doctor.id,
    doctor.userId,
    doctor.profileId,
    raw._id,
    raw.id,
    raw.user?._id,
    raw.user?.id,
    raw.account?._id,
    raw.account?.id,
    getEntityId(raw.user),
    getEntityId(raw.account),
    getEntityId(raw.doctor),
    getEntityId(raw.doctorProfile),
    getEntityId(raw.profile),
  ]);
}

function getAppointmentDoctorLookupIds(appointment = {}) {
  const raw = appointment.raw || {};
  const doctor = raw.doctor || raw.doctorId || {};

  return uniqueIds([
    appointment.doctorId,
    raw.doctorId,
    raw.doctor,
    raw.doctor?._id,
    raw.doctor?.id,
    raw.doctor?.user?._id,
    raw.doctor?.user?.id,
    raw.doctor?.account?._id,
    raw.doctor?.account?.id,
    raw.doctorProfile,
    raw.doctorProfile?._id,
    raw.doctorProfile?.id,
    getEntityId(doctor),
    getEntityId(doctor.user),
    getEntityId(doctor.account),
  ]);
}

function matchesSelectedDoctor(doctor, selectedDoctorId) {
  if (selectedDoctorId === "all") return true;

  const selectedId = String(selectedDoctorId);
  return doctor.id === selectedId || doctor.ids?.includes(selectedId);
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
      id: getDoctorLookupIds(doctor)[0] || "",
      label: getDoctorName(doctor),
    }))
    .filter((doctor) => doctor.id);
}

function formatShortWeekday(date) {
  return new Intl.DateTimeFormat("ar-EG", { weekday: "short" }).format(date);
}

function getDoctorPeriodBucket(date, period) {
  if (period === "year") {
    return {
      key: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`,
      name: monthNames[date.getMonth()],
    };
  }

  return {
    key: getDateKey(date),
    name:
      period === "week"
        ? formatShortWeekday(date)
        : formatDayLabel(date),
  };
}

function buildDoctorPeriodBuckets(period) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (period === "day") {
    return [getDoctorPeriodBucket(today, period)];
  }

  if (period === "week") {
    const start = getWeekStart(today);

    return Array.from({ length: 7 }, (_, index) => {
      const date = new Date(start);
      date.setDate(start.getDate() + index);
      return getDoctorPeriodBucket(date, period);
    });
  }

  if (period === "month") {
    const daysInMonth = new Date(
      today.getFullYear(),
      today.getMonth() + 1,
      0,
    ).getDate();

    return Array.from({ length: daysInMonth }, (_, index) => {
      const date = new Date(today.getFullYear(), today.getMonth(), index + 1);
      return getDoctorPeriodBucket(date, period);
    });
  }

  return Array.from({ length: 12 }, (_, index) => {
    const date = new Date(today.getFullYear(), index, 1);
    return getDoctorPeriodBucket(date, period);
  });
}

function buildDoctorChart(appointments, users, selectedDoctorId, selectedPeriod) {
  const doctors = users
    .filter((user) => user.role === "doctor")
    .map((doctor) => {
      const ids = getDoctorLookupIds(doctor);

      return {
        id: ids[0] || "",
        ids,
        name: getDoctorName(doctor),
      };
    })
    .filter((doctor) => doctor.id);
  const doctorsById = new Map();

  doctors.forEach((doctor) => {
    doctor.ids.forEach((id) => doctorsById.set(id, doctor));
  });

  const visibleDoctors =
    selectedDoctorId === "all"
      ? doctors
      : doctors.filter((doctor) => matchesSelectedDoctor(doctor, selectedDoctorId));
  const isTimelineView = selectedPeriod !== "all";
  const timelineCounts = new Map(
    isTimelineView
      ? buildDoctorPeriodBuckets(selectedPeriod).map((bucket) => [
          bucket.key,
          { name: bucket.name, value: 0 },
        ])
      : [],
  );
  const doctorCounts = new Map(
    isTimelineView ? [] : visibleDoctors.map((doctor) => [doctor.name, 0]),
  );

  appointments.forEach((appointment) => {
    const appointmentDoctorIds = getAppointmentDoctorLookupIds(appointment);
    const appointmentDoctor = String(appointment.doctor || "").trim();
    const doctor =
      appointmentDoctorIds.map((id) => doctorsById.get(id)).find(Boolean) ||
      (/^[a-f\d]{24}$/i.test(appointmentDoctor)
        ? null
        : { id: appointmentDoctor, name: appointmentDoctor });

    if (!doctor?.name) return;
    if (!matchesSelectedDoctor(doctor, selectedDoctorId)) return;

    const date = getAppointmentDate(appointment);
    if (!date || !isDateInCurrentPeriod(date, selectedPeriod)) return;

    if (isTimelineView) {
      const bucket = getDoctorPeriodBucket(date, selectedPeriod);
      const current = timelineCounts.get(bucket.key) || {
        name: bucket.name,
        value: 0,
      };

      timelineCounts.set(bucket.key, {
        ...current,
        value: current.value + 1,
      });
      return;
    }

    if (!doctorCounts.has(doctor.name)) {
      doctorCounts.set(doctor.name, 0);
    }

    doctorCounts.set(doctor.name, (doctorCounts.get(doctor.name) || 0) + 1);
  });

  if (isTimelineView) {
    const timelineData = Array.from(timelineCounts.values());

    return selectedPeriod === "month"
      ? timelineData.filter((item) => item.value > 0)
      : timelineData;
  }

  const chartData = Array.from(doctorCounts, ([name, value]) => ({ name, value }));

  return selectedDoctorId === "all"
    ? chartData.filter((item) => item.value > 0)
    : chartData;
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
  const [selectedAppointmentRange, setSelectedAppointmentRange] = useState("year");
  const [selectedDoctorId, setSelectedDoctorId] = useState("all");
  const [selectedDoctorPeriod, setSelectedDoctorPeriod] = useState("all");
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
  const appointmentChartTitle = getAppointmentChartTitle(selectedAppointmentRange);
  const doctorChartTitle = getDoctorChartTitle(selectedDoctorPeriod);
  const doctorXAxisInterval = 0;
  const specializationChart = useMemo(
    () => buildSpecializationChart(users),
    [users],
  );
  const totalRevenue = dashboardAppointments.reduce(
    (total, appointment) => total + getAppointmentRevenue(appointment),
    0,
  );
  const statPeriods = useMemo(() => {
    const today = new Date();
    const previousMonth = getPreviousMonth(today);
    const currentMonthAppointments = dashboardAppointments.filter((appointment) =>
      isSameCalendarMonth(getAppointmentDate(appointment), today),
    );
    const previousMonthAppointments = dashboardAppointments.filter((appointment) =>
      isSameCalendarMonth(getAppointmentDate(appointment), previousMonth),
    );
    const currentMonthUsers = users.filter((user) =>
      isSameCalendarMonth(getUserDate(user), today),
    );
    const previousMonthUsers = users.filter((user) =>
      isSameCalendarMonth(getUserDate(user), previousMonth),
    );
    const currentMonthDoctors = currentMonthUsers.filter((user) => user.role === "doctor");
    const previousMonthDoctors = previousMonthUsers.filter((user) => user.role === "doctor");
    const currentMonthRevenue = currentMonthAppointments.reduce(
      (total, appointment) => total + getAppointmentRevenue(appointment),
      0,
    );
    const previousMonthRevenue = previousMonthAppointments.reduce(
      (total, appointment) => total + getAppointmentRevenue(appointment),
      0,
    );
    const currentMonthPaid = currentMonthAppointments.filter(
      (appointment) => appointment.payment === "paid",
    ).length;
    const previousMonthPaid = previousMonthAppointments.filter(
      (appointment) => appointment.payment === "paid",
    ).length;

    return {
      currentMonthAppointments,
      previousMonthAppointments,
      currentMonthUsers,
      previousMonthUsers,
      currentMonthDoctors,
      previousMonthDoctors,
      currentMonthRevenue,
      previousMonthRevenue,
      currentMonthPaid,
      previousMonthPaid,
    };
  }, [dashboardAppointments, users]);
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
    ];

    return {
      ...item,
      value: values[index],
      trend: [
        buildStatTrend(
          statPeriods.currentMonthUsers.length,
          statPeriods.previousMonthUsers.length,
        ),
        buildStatTrend(
          statPeriods.currentMonthAppointments.length,
          statPeriods.previousMonthAppointments.length,
        ),
        buildStatTrend(
          statPeriods.currentMonthDoctors.length,
          statPeriods.previousMonthDoctors.length,
        ),
        buildStatTrend(
          statPeriods.currentMonthRevenue,
          statPeriods.previousMonthRevenue,
        ),
        buildStatTrend(
          statPeriods.currentMonthPaid,
          statPeriods.previousMonthPaid,
        ),
      ][index],
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
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 xl:gap-6" dir="rtl">
          {dashboardStats.map((item) => (
            <StatCard key={item.title} {...item} />
          ))}
        </div>

        <div className="grid grid-cols-1 gap-[18px] xl:grid-cols-2">
          <DashboardCard
            title={appointmentChartTitle}
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
                    domain={[0, (dataMax) => Math.max(1, dataMax)]}
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
            title={doctorChartTitle}
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
            {!appointmentsLoaded ? (
              <ChartState text={emptyAppointmentsText} />
            ) : doctorChart.length === 0 ? (
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
                    interval={doctorXAxisInterval}
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
                  >
                    <LabelList
                      dataKey="value"
                      position="top"
                      fill={axisColor}
                      fontSize={12}
                      fontWeight={700}
                      formatter={(value) =>
                        selectedDoctorPeriod === "all" || Number(value) > 0
                          ? value
                          : ""
                      }
                    />
                  </Bar>
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

function StatCard({ title, value, trend, icon: Icon, color, bg }) {
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

      <div className="pl-[78px] text-right" dir="rtl">
        <p className="text-[18px] font-medium leading-7 text-[#333] dark:text-gray-100">
          {title}
        </p>
        <h3 className="mt-[8px] text-[30px] font-bold leading-9 text-[#2e2e2e] dark:text-white">
          {formatStatValue(value)}
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
          <span className="whitespace-nowrap text-[#777] dark:text-gray-300">
            {trend.label}
          </span>
        </div>
      )}
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
    <div className="flex h-[36px] w-[330px] max-w-full overflow-hidden rounded-[9px] bg-[#fafafa] p-[2px] text-[12px] text-[#333] dark:bg-[#3f3f3f] dark:text-gray-200">
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
