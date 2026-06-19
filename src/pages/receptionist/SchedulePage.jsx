import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import CustomSelect from "../../components/admin/CustomSelect";
import {
  listAppointments,
  listDoctors,
} from "../../services/medilinkApi";

const views = [
  { id: "month", label: "شهر" },
  { id: "week", label: "أسبوع" },
  { id: "day", label: "يوم" },
];

const weekdayLabels = [
  "الأحد",
  "الإثنين",
  "الثلاثاء",
  "الأربعاء",
  "الخميس",
  "الجمعة",
  "السبت",
];

const hours = Array.from({ length: 13 }, (_, index) => {
  const value = index + 8;
  const hour12 = value % 12 || 12;
  const period = value >= 12 ? "م" : "ص";

  return {
    label: `${hour12}${period}`,
    value,
  };
});

const statusMeta = {
  pending: {
    label: "في الانتظار",
    dot: "bg-[#35c0d8]",
    text: "text-[#159fbd]",
    bg: "bg-[#e9f9fb]",
    border: "border-[#35c0d8]",
  },
  confirmed: {
    label: "مؤكد",
    dot: "bg-[#4bb543]",
    text: "text-[#38932f]",
    bg: "bg-[#eaf8e8]",
    border: "border-[#4bb543]",
  },
  completed: {
    label: "مؤكد",
    dot: "bg-[#4bb543]",
    text: "text-[#38932f]",
    bg: "bg-[#eaf8e8]",
    border: "border-[#4bb543]",
  },
  cancelled: {
    label: "ملغي",
    dot: "bg-[#c92525]",
    text: "text-[#c92525]",
    bg: "bg-[#ffe8e8]",
    border: "border-[#c92525]",
  },
};

function createDemoAppointments(baseDate = new Date()) {
  const today = startOfDay(baseDate);
  const dates = [-4, -2, -1, 0, 1, 3, 5].map((offset) =>
    getIsoDate(addDays(today, offset)),
  );

  return [
    ["خالد فتحي", "د. خالد علي", dates[0], "09:00", "confirmed"],
    ["سما سامي", "د. كمال شوقي", dates[0], "12:00", "pending"],
    ["محمد حسين", "د. محمد خالد", dates[1], "10:00", "pending"],
    ["يوسف أمين", "د. كمال شوقي", dates[1], "13:00", "cancelled"],
    ["نور باسم", "د. سارة محمد", dates[2], "15:00", "confirmed"],
    ["محمد حسني", "د. جيهان الشامي", dates[3], "10:00", "pending"],
    ["عبد الرحمن عبد الله", "د. مروان يوسف", dates[3], "11:00", "cancelled"],
    ["ياسمين أحمد", "د. كمال شوقي", dates[3], "12:00", "confirmed"],
    ["نورا أمين", "د. خالد علي", dates[3], "16:00", "pending"],
    ["سارة عبد الله", "د. مروان خالد", dates[4], "10:00", "confirmed"],
    ["أحمد مختار", "د. خالد علي", dates[4], "11:00", "pending"],
    ["محمد توفيق", "د. خالد علي", dates[5], "17:00", "cancelled"],
    ["هدى كامل", "د. سارة محمد", dates[6], "12:30", "confirmed"],
  ].map(([patient, doctor, date, time, status], index) => ({
    id: `demo-schedule-${index + 1}`,
    patient,
    doctor,
    date,
    time,
    status,
  }));
}

function startOfDay(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function addDays(date, days) {
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + days);
  return nextDate;
}

function addMonths(date, months) {
  const nextDate = new Date(date);
  nextDate.setMonth(nextDate.getMonth() + months);
  return nextDate;
}

function getIsoDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function parseAppointmentDate(value, fallbackDate) {
  if (!value) return fallbackDate;

  const normalizedDate = String(value).includes("T")
    ? new Date(value)
    : new Date(`${value}T12:00:00`);

  if (!Number.isNaN(normalizedDate.getTime())) return startOfDay(normalizedDate);

  const parsedDate = new Date(value);
  return Number.isNaN(parsedDate.getTime())
    ? fallbackDate
    : startOfDay(parsedDate);
}

function getWeekStart(date) {
  const day = date.getDay();
  const daysFromSaturday = (day + 1) % 7;
  return addDays(startOfDay(date), -daysFromSaturday);
}

function getWeekDays(date) {
  const weekStart = getWeekStart(date);
  const todayIso = getIsoDate(startOfDay(new Date()));

  return Array.from({ length: 7 }, (_, index) => {
    const dayDate = addDays(weekStart, index);

    return {
      date: dayDate,
      dateIso: getIsoDate(dayDate),
      name: weekdayLabels[dayDate.getDay()],
      day: dayDate.getDate(),
      current: getIsoDate(dayDate) === todayIso,
    };
  });
}

function getMonthCells(date) {
  const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
  const gridStart = getWeekStart(monthStart);

  return Array.from({ length: 42 }, (_, index) => {
    const cellDate = addDays(gridStart, index);

    return {
      date: cellDate,
      dateIso: getIsoDate(cellDate),
      day: cellDate.getDate(),
      muted: cellDate.getMonth() !== date.getMonth(),
    };
  });
}

function getCalendarHeading(selectedDate) {
  const month = selectedDate.toLocaleDateString("ar-EG", { month: "long" });

  return `${selectedDate.getFullYear()}، ${month}`;
}

function getSelectedDayTitle(selectedDate) {
  return `${weekdayLabels[selectedDate.getDay()]} ${formatShortDayMonth(selectedDate)}`;
}

function getRangeTitle(activeView, selectedDate) {
  if (activeView === "day") {
    return selectedDate.toLocaleDateString("ar-EG", {
      weekday: "long",
      day: "numeric",
      month: "long",
    });
  }

  if (activeView === "month") return getCalendarHeading(selectedDate);

  const weekDays = getWeekDays(selectedDate);
  const first = weekDays[0].date;
  const last = weekDays[6].date;

  return `${last.getDate()} ${last.toLocaleDateString("ar-EG", {
    month: "long",
  })} - ${first.getDate()} ${first.toLocaleDateString("ar-EG", {
    month: "long",
  })}`;
}

function getCalendarHour(time) {
  const match = /^(\d{1,2}):/.exec(time || "");
  return match ? Number(match[1]) : 9;
}

function getCalendarStatus(status) {
  if (status === "cancelled") return "cancelled";
  if (status === "completed") return "completed";
  if (status === "pending") return "pending";
  return "confirmed";
}

function formatAppointmentTime(time) {
  if (!time) return "";
  if (!/^\d{1,2}:\d{2}$/.test(time)) return time;

  const [hourText = "0", minute = "00"] = time.split(":");
  const hour24 = Number(hourText);
  const hour12 = hour24 % 12 || 12;
  const period = hour24 >= 12 ? "م" : "ص";

  return `${hour12}:${minute} ${period}`;
}

function formatShortDayMonth(date) {
  return `${date.getDate()} ${date.toLocaleDateString("ar-EG", {
    month: "long",
  })}`;
}

function toCalendarAppointment(appointment, index, baseDate = new Date()) {
  const fallbackDate = addDays(getWeekStart(baseDate), index % 7);
  const appointmentDate = parseAppointmentDate(appointment.date, fallbackDate);
  const time = appointment.time || "";

  return {
    id: appointment.id || `${appointment.date}-${appointment.time}-${index}`,
    dateIso: getIsoDate(appointmentDate),
    day: appointmentDate.getDate(),
    hour: getCalendarHour(time),
    patient: appointment.patient || "مريض",
    doctor: appointment.doctor || "طبيب",
    time: formatAppointmentTime(time),
    status: getCalendarStatus(appointment.status),
  };
}

function getDoctorOptions(doctors, appointments) {
  const names = new Set();

  doctors.forEach((doctor) => {
    const name = [doctor.firstName, doctor.lastName].filter(Boolean).join(" ").trim();
    if (name) names.add(name);
    if (doctor.name) names.add(doctor.name);
  });

  appointments.forEach((appointment) => {
    if (appointment.doctor) names.add(appointment.doctor);
  });

  return Array.from(names);
}

function isPermissionError(error) {
  const message = String(error?.message || error || "").toLowerCase();

  return (
    error?.status === 403 ||
    message.includes("permission") ||
    message.includes("not have") ||
    message.includes("not authorized")
  );
}

export default function ReceptionistSchedulePage() {
  const [activeView, setActiveView] = useState("day");
  const [selectedDate, setSelectedDate] = useState(startOfDay(new Date()));
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [doctorFilter, setDoctorFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const demoAppointments = useMemo(
    () => createDemoAppointments(selectedDate),
    [selectedDate],
  );
  const weekDays = useMemo(() => getWeekDays(selectedDate), [selectedDate]);
  const currentHour = new Date().getHours();

  useEffect(() => {
    let mounted = true;

    Promise.allSettled([listAppointments(), listDoctors()])
      .then(([appointmentsResult, doctorsResult]) => {
        if (!mounted) return;

        if (
          appointmentsResult.status === "fulfilled" &&
          appointmentsResult.value.length > 0
        ) {
          setAppointments(appointmentsResult.value);
        } else {
          setAppointments(demoAppointments);
        }

        if (
          doctorsResult.status === "fulfilled" &&
          doctorsResult.value.length > 0
        ) {
          setDoctors(doctorsResult.value);
        } else if (
          doctorsResult.status === "rejected" &&
          !isPermissionError(doctorsResult.reason)
        ) {
          setDoctors([]);
        } else {
          setDoctors([]);
        }
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [demoAppointments]);

  const doctorOptions = useMemo(
    () => getDoctorOptions(doctors, appointments),
    [appointments, doctors],
  );
  const filteredAppointments = useMemo(
    () =>
      appointments.filter(
        (appointment) =>
          doctorFilter === "all" || appointment.doctor === doctorFilter,
      ),
    [appointments, doctorFilter],
  );
  const calendarAppointments = useMemo(
    () =>
      filteredAppointments.map((appointment, index) =>
        toCalendarAppointment(appointment, index, selectedDate),
      ),
    [filteredAppointments, selectedDate],
  );

  const goToPreviousRange = () => {
    setSelectedDate((current) => {
      if (activeView === "day") return addDays(current, -1);
      if (activeView === "week") return addDays(current, -7);
      return addMonths(current, -1);
    });
  };

  const goToNextRange = () => {
    setSelectedDate((current) => {
      if (activeView === "day") return addDays(current, 1);
      if (activeView === "week") return addDays(current, 7);
      return addMonths(current, 1);
    });
  };

  return (
    <section className="min-h-screen bg-[#f8fcfd] text-[#333] dark:bg-[#2f2f2f] dark:text-white">
      <Header />

      <main className="px-4 pb-8 pt-[24px] sm:px-6 lg:px-[38px]">
        <section className="rounded-[8px] bg-white px-[18px] pb-[18px] pt-[16px] shadow-[0_5px_18px_rgba(37,70,82,0.08)] dark:bg-[#505050]">
          <CalendarToolbar
            activeView={activeView}
            doctorFilter={doctorFilter}
            doctorOptions={doctorOptions}
            selectedDate={selectedDate}
            onDoctorChange={setDoctorFilter}
            onNext={goToNextRange}
            onPrevious={goToPreviousRange}
            onViewChange={setActiveView}
          />

          <div className="mt-[16px] overflow-x-auto">
            {activeView === "month" && (
              <MonthView
                appointments={calendarAppointments}
                selectedDate={selectedDate}
              />
            )}
            {activeView === "week" && (
              <WeekView
                appointments={calendarAppointments}
                currentHour={currentHour}
                weekDays={weekDays}
              />
            )}
            {activeView === "day" && (
              <DayView
                appointments={calendarAppointments}
                currentHour={currentHour}
                selectedDate={selectedDate}
              />
            )}
          </div>

          {!loading && calendarAppointments.length === 0 && (
            <div className="mt-5 rounded-[8px] bg-[#f7fbfc] px-4 py-6 text-center text-[13px] font-bold text-[#7d8b92] dark:bg-white/10 dark:text-gray-200">
              لا توجد مواعيد مسجلة حتى الآن
            </div>
          )}

          <Legend />
        </section>
      </main>
    </section>
  );
}

function Header() {
  return (
    <header className="flex min-h-[112px] items-start justify-start bg-white px-4 pt-[32px] shadow-[0_1px_8px_rgba(0,0,0,0.03)] dark:bg-[#3a3a3a] sm:px-6 lg:px-[32px]">
      <div className="text-right">
        <h1 className="text-[23px] font-bold leading-[31px] text-[#333] dark:text-white">
          المواعيد
        </h1>
        <p className="mt-1 text-[13px] leading-5 text-[#8a8a8a] dark:text-gray-300">
          متابعة جدول مواعيد العيادة اليومية والأسبوعية والشهرية.
        </p>
      </div>
    </header>
  );
}

function CalendarToolbar({
  activeView,
  doctorFilter,
  doctorOptions,
  selectedDate,
  onDoctorChange,
  onNext,
  onPrevious,
  onViewChange,
}) {
  return (
    <div className="space-y-5">
      <div
        className="grid items-center gap-5 lg:grid-cols-[1fr_minmax(220px,260px)_1fr]"
        dir="ltr"
      >
        <div className="justify-self-start">
          <ViewTabs activeView={activeView} onViewChange={onViewChange} />
        </div>

        <CustomSelect
          value={doctorFilter}
          onChange={onDoctorChange}
          displayLabel={doctorFilter === "all" ? "اسم الطبيب" : doctorFilter}
          className="mx-auto w-full max-w-[260px]"
          buttonClassName="flex h-[52px] w-full items-center gap-3 rounded-[9px] border border-transparent bg-[#fbfbfb] px-5 text-[18px] font-bold text-[#333] outline-none transition hover:border-[#35c0d8] dark:border-white/15 dark:bg-[#444] dark:text-white"
          menuClassName="rounded-[9px] p-1.5 text-[12px]"
        >
          <option value="all">اسم الطبيب</option>
          {doctorOptions.map((doctor) => (
            <option key={doctor} value={doctor}>
              {doctor}
            </option>
          ))}
        </CustomSelect>

        <div className="justify-self-end text-right" dir="rtl">
          <h2 className="text-[24px] font-extrabold leading-7 text-[#1f2c37] dark:text-white">
            {getCalendarHeading(selectedDate)}
          </h2>
          <p className="mt-1 text-[13px] font-semibold leading-5 text-[#9aa6ad] dark:text-gray-300">
            {getRangeTitle("week", selectedDate)}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-center gap-[12px]" dir="ltr">
        <ArrowButton label="التالي" icon={ChevronLeft} onClick={onNext} />
        <div
          className="min-w-[120px] rounded-[10px] bg-[#f2fbfd] px-4 py-2 text-center text-[18px] font-bold text-[#45545c] dark:bg-white/10 dark:text-white"
          dir="rtl"
        >
          {getSelectedDayTitle(selectedDate)}
        </div>
        <ArrowButton label="السابق" icon={ChevronRight} onClick={onPrevious} />
      </div>
    </div>
  );
}

function ViewTabs({ activeView, onViewChange }) {
  return (
    <div className="flex h-[44px] w-[210px] overflow-hidden rounded-[10px] bg-[#fbfbfb] p-[2px] text-[13px] font-bold text-[#333] dark:bg-[#3f3f3f] dark:text-gray-200">
      {views.map((view) => (
        <button
          key={view.id}
          type="button"
          className={`flex-1 rounded-[9px] transition ${
            activeView === view.id ? "bg-[#35c0d8] text-white" : ""
          }`}
          onClick={() => onViewChange(view.id)}
        >
          {view.label}
        </button>
      ))}
    </div>
  );
}

function ArrowButton({ icon: Icon, label, onClick }) {
  return (
    <button
      type="button"
      aria-label={label}
      className="grid h-[44px] w-[44px] place-items-center rounded-[10px] border border-[#e3edf1] bg-white text-[#7d8b92] transition hover:border-[#35c0d8] hover:text-[#35c0d8] dark:border-white/15 dark:bg-[#444] dark:text-gray-200"
      onClick={onClick}
    >
      <Icon size={18} strokeWidth={1.9} />
    </button>
  );
}

function MonthView({ appointments, selectedDate }) {
  const monthCells = getMonthCells(selectedDate);
  const headerDays = getWeekDays(selectedDate);

  return (
    <div className="min-w-[850px] overflow-hidden rounded-[7px] border border-[#edf2f4] dark:border-white/15">
      <div className="grid h-[40px] grid-cols-7 bg-white text-[10px] font-bold text-[#555] dark:bg-[#505050] dark:text-gray-100">
        {headerDays.map((day) => (
          <div
            key={day.dateIso}
            className="flex items-center justify-center border-l border-[#edf2f4] last:border-l-0 dark:border-white/15"
          >
            {day.name}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7">
        {monthCells.map((day) => (
          <MonthCell
            key={day.dateIso}
            appointments={appointments}
            day={day}
          />
        ))}
      </div>
    </div>
  );
}

function MonthCell({ day, appointments }) {
  const events = appointments.filter(
    (appointment) => appointment.dateIso === day.dateIso,
  );

  return (
    <div className="h-[102px] border-l border-t border-[#edf2f4] bg-white p-[6px] last:border-l-0 dark:border-white/15 dark:bg-[#505050]">
      <div
        className={`ml-auto grid h-[18px] w-[18px] place-items-center rounded-full text-[9px] ${
          day.dateIso === getIsoDate(startOfDay(new Date()))
            ? "bg-[#35c0d8] font-bold text-white"
            : day.muted
              ? "text-[#c8cfd3] dark:text-gray-500"
              : "text-[#7e8b91] dark:text-gray-300"
        }`}
      >
        {day.day}
      </div>

      <div className="mt-[10px] space-y-[3px]">
        {events.slice(0, 3).map((event) => (
          <CompactEvent key={`${event.id}-${event.status}`} event={event} />
        ))}
        {events.length > 3 && (
          <div className="text-[8px] font-bold leading-3 text-[#777] dark:text-gray-300">
            +{events.length - 3} المزيد
          </div>
        )}
      </div>
    </div>
  );
}

function WeekView({ appointments, weekDays, currentHour }) {
  return (
    <div className="min-w-[900px] overflow-hidden rounded-[7px] border border-[#edf2f4] dark:border-white/15">
      <div className="grid h-[48px] grid-cols-[42px_repeat(7,minmax(0,1fr))] bg-white text-[10px] font-bold text-[#555] dark:bg-[#505050] dark:text-gray-100">
        <div className="border-l border-[#edf2f4] dark:border-white/15" />
        {weekDays.map((day) => (
          <div
            key={day.dateIso}
            className={`flex flex-col items-center justify-center gap-[2px] border-l border-[#edf2f4] last:border-l-0 dark:border-white/15 ${
              day.current ? "bg-[#f7fbfc] dark:bg-white/5" : ""
            }`}
          >
            <span>{day.name}</span>
            <span
              className={`grid h-[18px] min-w-[18px] place-items-center rounded-full px-[5px] text-[8px] ${
                day.current ? "bg-[#e7fbfd] text-[#27b6cc]" : "text-[#7e8b91]"
              }`}
            >
              {formatShortDayMonth(day.date)}
            </span>
          </div>
        ))}
      </div>

      {hours.map((hour) => {
        const current = hour.value === currentHour;

        return (
          <div
            key={hour.value}
            className={`grid h-[44px] grid-cols-[42px_repeat(7,minmax(0,1fr))] ${
              current ? "border-t border-[#37bed9]" : ""
            }`}
          >
            <HourLabel current={current} hour={hour} />
            {weekDays.map((day) => (
              <WeekCell
                key={`${day.dateIso}-${hour.value}`}
                appointments={appointments}
                dateIso={day.dateIso}
                highlighted={day.current}
                hour={hour.value}
              />
            ))}
          </div>
        );
      })}
    </div>
  );
}

function WeekCell({ dateIso, hour, highlighted, appointments }) {
  const cellEvents = appointments.filter(
    (appointment) => appointment.dateIso === dateIso && appointment.hour === hour,
  );

  return (
    <div
      className={`border-l border-t border-[#edf2f4] px-[3px] py-[2px] last:border-l-0 dark:border-white/15 ${
        highlighted ? "bg-[#f7fbfc] dark:bg-white/5" : "bg-white dark:bg-[#505050]"
      }`}
    >
      <div className="space-y-[2px]">
        {cellEvents.map((event) => (
          <CompactEvent key={`${event.id}-${event.time}`} event={event} />
        ))}
      </div>
    </div>
  );
}

function DayView({ appointments, selectedDate, currentHour }) {
  const selectedDateIso = getIsoDate(selectedDate);
  const dayEvents = appointments.filter(
    (appointment) => appointment.dateIso === selectedDateIso,
  );

  return (
    <div className="min-w-[850px] overflow-hidden rounded-[7px] border border-[#edf2f4] dark:border-white/15">
      {hours.map((hour) => {
        const current = hour.value === currentHour;
        const events = dayEvents.filter((appointment) => appointment.hour === hour.value);

        return (
          <div
            key={hour.value}
            className={`grid h-[42px] grid-cols-[42px_minmax(0,1fr)] ${
              current ? "border-t border-[#37bed9]" : ""
            }`}
          >
            <HourLabel current={current} hour={hour} />
            <div className="border-t border-[#edf2f4] bg-white px-[5px] py-[4px] dark:border-white/15 dark:bg-[#505050]">
              <div className="grid h-full gap-[3px]">
                {events.map((event) => (
                  <WideEvent key={`${event.id}-${event.time}`} event={event} />
                ))}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function HourLabel({ current, hour }) {
  return (
    <div className="relative flex items-start justify-center border-l border-t border-[#edf2f4] pt-[6px] text-[8px] text-[#97a1a6] dark:border-white/15 dark:text-gray-300">
      {current ? (
        <span className="absolute -top-[10px] rounded-full bg-[#35c0d8] px-[8px] py-[2px] text-[8px] font-bold text-white">
          الآن
        </span>
      ) : (
        hour.label
      )}
    </div>
  );
}

function CompactEvent({ event }) {
  const meta = statusMeta[event.status] || statusMeta.confirmed;

  return (
    <div
      className={`border-r-[3px] ${meta.border} ${meta.bg} ${meta.text} min-h-[22px] rounded-[3px] px-[5px] py-[2px] text-right`}
    >
      <p className="truncate text-[8px] font-bold leading-3">{event.patient}</p>
      <p className="truncate text-[7px] leading-3 opacity-90">{event.time}</p>
    </div>
  );
}

function WideEvent({ event }) {
  const meta = statusMeta[event.status] || statusMeta.confirmed;

  return (
    <div
      className={`flex h-full min-h-[30px] items-center justify-between rounded-[3px] border-r-[3px] ${meta.border} ${meta.bg} px-[12px] ${meta.text}`}
    >
      <div className="text-right">
        <p className="text-[10px] font-bold leading-4">{event.patient}</p>
        <p className="text-[8px] leading-3 opacity-90">
          {event.doctor} - {event.time}
        </p>
      </div>
    </div>
  );
}

function Legend() {
  const entries = ["pending", "confirmed", "cancelled"];

  return (
    <div className="mt-[14px] flex flex-wrap items-center justify-center gap-x-[42px] gap-y-3 text-[11px] font-bold text-[#333] dark:text-white">
      {entries.map((status) => {
        const meta = statusMeta[status];

        return (
          <div key={status} className="flex items-center gap-[9px]">
            <span>{meta.label}</span>
            <span className={`h-[10px] w-[10px] rounded-full ${meta.dot}`} />
          </div>
        );
      })}
    </div>
  );
}
