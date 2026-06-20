import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { listMyDoctorAppointments } from "../../services/medilinkApi";

const views = [
  { id: "day", label: "يوم" },
  { id: "week", label: "أسبوع" },
  { id: "month", label: "شهر" },
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

const weekHours = Array.from({ length: 13 }, (_, index) => {
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
    label: "قيد الانتظار",
    dot: "bg-[#37bed9]",
    text: "text-[#22abc6]",
    bg: "bg-[#e9f9fb]",
    border: "border-[#37bed9]",
  },
  confirmed: {
    label: "مؤكد",
    dot: "bg-[#2360a8]",
    text: "text-[#2360a8]",
    bg: "bg-[#eaf2ff]",
    border: "border-[#2360a8]",
  },
  completed: {
    label: "مكتمل",
    dot: "bg-[#4aae1b]",
    text: "text-[#4aae1b]",
    bg: "bg-[#eaf7e5]",
    border: "border-[#4aae1b]",
  },
  cancelled: {
    label: "ملغي",
    dot: "bg-[#c92525]",
    text: "text-[#c92525]",
    bg: "bg-[#ffe7e7]",
    border: "border-[#c92525]",
  },
};

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
  return Number.isNaN(parsedDate.getTime()) ? fallbackDate : startOfDay(parsedDate);
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

function getMonthDates(date) {
  const monthLength = new Date(
    date.getFullYear(),
    date.getMonth() + 1,
    0,
  ).getDate();

  return Array.from({ length: monthLength }, (_, index) =>
    getIsoDate(new Date(date.getFullYear(), date.getMonth(), index + 1)),
  );
}

function getAppointmentQueryDates(activeView, selectedDate) {
  if (activeView === "day") return [getIsoDate(selectedDate)];
  if (activeView === "week") {
    return getWeekDays(selectedDate).map((day) => day.dateIso);
  }

  return getMonthDates(selectedDate);
}

function mergeAppointmentGroups(groups) {
  const appointmentsByKey = new Map();

  groups.flat().forEach((appointment, index) => {
    const key =
      appointment.id ||
      [
        appointment.date,
        appointment.time,
        appointment.patientId || appointment.patient,
        index,
      ]
        .filter(Boolean)
        .join("|");

    appointmentsByKey.set(String(key), appointment);
  });

  return Array.from(appointmentsByKey.values());
}

function getSettledAppointmentGroups(results) {
  return results
    .filter((result) => result.status === "fulfilled")
    .map((result) => result.value);
}

function getFirstAppointmentError(results) {
  return results.find((result) => result.status === "rejected")?.reason;
}

function getRangeTitle(activeView, selectedDate) {
  if (activeView === "day") {
    return `${selectedDate.getDate()} ${selectedDate.toLocaleDateString("ar-EG", {
      month: "long",
    })}`;
  }

  if (activeView === "month") {
    return selectedDate.toLocaleDateString("ar-EG", {
      month: "long",
      year: "numeric",
    });
  }

  const weekDaysRange = getWeekDays(selectedDate);
  const firstDay = weekDaysRange[0].date;
  const lastDay = weekDaysRange[6].date;

  return `${firstDay.getDate()} ${firstDay.toLocaleDateString("ar-EG", {
    month: "long",
  })} - ${lastDay.getDate()} ${lastDay.toLocaleDateString("ar-EG", {
    month: "long",
  })}`;
}

function getCalendarHeading(activeView, selectedDate) {
  if (activeView === "week") {
    const weekDaysRange = getWeekDays(selectedDate);
    const firstDay = weekDaysRange[0].date;
    const lastDay = weekDaysRange[6].date;
    const sameMonth =
      firstDay.getMonth() === lastDay.getMonth() &&
      firstDay.getFullYear() === lastDay.getFullYear();

    if (sameMonth) {
      return firstDay.toLocaleDateString("ar-EG", {
        month: "long",
        year: "numeric",
      });
    }

    return `${firstDay.toLocaleDateString("ar-EG", {
      month: "long",
      year: "numeric",
    })} - ${lastDay.toLocaleDateString("ar-EG", {
      month: "long",
      year: "numeric",
    })}`;
  }

  return selectedDate.toLocaleDateString("ar-EG", {
    month: "long",
    year: "numeric",
  });
}

function getCalendarHour(time) {
  const match = /^(\d{1,2}):/.exec(time || "");
  return match ? Number(match[1]) : 9;
}

function getCalendarStatus(status) {
  if (status === "completed") return "completed";
  if (status === "cancelled") return "cancelled";
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
    time: formatAppointmentTime(time),
    status: getCalendarStatus(appointment.status),
  };
}

export default function DoctorAppointmentsPage() {
  const [activeView, setActiveView] = useState("week");
  const [selectedDate, setSelectedDate] = useState(startOfDay(new Date()));
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const weekDays = useMemo(() => getWeekDays(selectedDate), [selectedDate]);
  const currentHour = new Date().getHours();
  const calendarAppointments = useMemo(
    () =>
      appointments.map((appointment, index) =>
        toCalendarAppointment(appointment, index, selectedDate),
      ),
    [appointments, selectedDate],
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

  useEffect(() => {
    let mounted = true;
    const queryDates = getAppointmentQueryDates(activeView, selectedDate);

    Promise.resolve()
      .then(() => {
        if (mounted) {
          setLoading(true);
          setError("");
        }

        return Promise.allSettled(
          queryDates.map((date) => listMyDoctorAppointments(date)),
        );
      })
      .then((results) => {
        if (mounted) {
          const appointmentGroups = getSettledAppointmentGroups(results);
          const requestError = getFirstAppointmentError(results);

          setAppointments(mergeAppointmentGroups(appointmentGroups));
          setError(
            appointmentGroups.length === 0 && requestError
              ? requestError.message || "تعذر تحميل المواعيد"
              : "",
          );
        }
      })
      .catch((requestError) => {
        if (mounted) {
          setError(requestError.message || "تعذر تحميل المواعيد");
          setAppointments([]);
        }
      })
      .finally(() => {
        if (mounted) {
          setLoading(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, [activeView, selectedDate]);

  return (
    <section className="min-h-screen bg-[#f8fbfc] text-[#333333] dark:bg-[#2f2f2f] dark:text-white">
      <Header />

      <main className="px-4 pb-[28px] pt-[24px] sm:px-6 lg:px-[24px]">
        <section className="rounded-[8px] bg-white px-[18px] pb-[18px] pt-[16px] shadow-[0_4px_18px_rgba(0,0,0,0.08)] dark:bg-[#505050]">
          <CalendarToolbar
            activeView={activeView}
            selectedDate={selectedDate}
            onNext={goToNextRange}
            onPrevious={goToPreviousRange}
            onViewChange={setActiveView}
          />

          {error && (
            <div className="mt-4 rounded-[8px] border border-red-200 bg-red-50 px-4 py-3 text-right text-[13px] font-semibold text-red-700 dark:border-red-400/30 dark:bg-red-400/10 dark:text-red-200">
              {error}
            </div>
          )}

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
                onNext={goToNextRange}
                onPrevious={goToPreviousRange}
                selectedDate={selectedDate}
              />
            )}
          </div>

          {!loading && calendarAppointments.length === 0 && (
            <div className="mt-5 rounded-[8px] bg-[#f7fbfc] px-4 py-6 text-center text-[13px] font-bold text-[#7d8b92] dark:bg-white/10 dark:text-gray-200">
              لا توجد مواعيد مسجلة حتى الآن
            </div>
          )}
        </section>

        <Legend />
      </main>
    </section>
  );
}

function Header() {
  return (
    <header className="flex min-h-[100px] flex-col gap-5 bg-white px-4 py-[20px] shadow-[0_1px_8px_rgba(0,0,0,0.03)] dark:bg-[#3a3a3a] sm:px-6 lg:flex-row lg:items-start lg:justify-between lg:px-[24px]">
      <div className="text-right">
        <h1 className="text-[20px] font-bold leading-7 text-[#333] dark:text-white">
          المواعيد
        </h1>
        <p className="mt-1 text-[11px] leading-5 text-[#8a8a8a] dark:text-gray-300">
          عرض جميع المواعيد الخاصة بك وحالاتها.
        </p>
      </div>
    </header>
  );
}

function CalendarToolbar({
  activeView,
  selectedDate,
  onNext,
  onPrevious,
  onViewChange,
}) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="flex items-start gap-[9px]" dir="ltr">
        <ArrowButton label="التالي" icon={ChevronLeft} onClick={onNext} />
        <div className="min-w-[112px] text-right" dir="rtl">
          <h2 className="text-[15px] font-bold leading-5 text-[#333] dark:text-white">
            {getCalendarHeading(activeView, selectedDate)}
          </h2>
          <p className="text-[9px] leading-4 text-[#8a8a8a] dark:text-gray-300">
            {getRangeTitle(activeView, selectedDate)}
          </p>
        </div>
        <ArrowButton label="السابق" icon={ChevronRight} onClick={onPrevious} />
      </div>

      <ViewTabs activeView={activeView} onViewChange={onViewChange} />
    </div>
  );
}

function ArrowButton({ icon: Icon, label, onClick }) {
  return (
    <button
      type="button"
      aria-label={label}
      className="grid h-[28px] w-[28px] place-items-center rounded-[7px] border border-[#e3edf1] text-[#7d8b92] transition hover:border-[#35c0d8] hover:text-[#35c0d8] dark:border-white/15 dark:text-gray-200"
      onClick={onClick}
    >
      <Icon size={16} strokeWidth={1.7} />
    </button>
  );
}

function ViewTabs({ activeView, onViewChange }) {
  return (
    <div className="flex h-[25px] w-[167px] overflow-hidden rounded-[7px] bg-[#fafafa] p-[2px] text-[9px] text-[#333] dark:bg-[#3f3f3f] dark:text-gray-200">
      {views.map((view) => (
        <button
          key={view.id}
          type="button"
          className={`flex-1 rounded-[7px] transition ${
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

function MonthView({ appointments, selectedDate }) {
  const monthCells = getMonthCells(selectedDate);
  const headerDays = getWeekDays(selectedDate);

  return (
    <div className="min-w-[850px] overflow-hidden rounded-[7px] border border-[#edf2f4] dark:border-white/15">
      <div className="grid h-[44px] grid-cols-7 bg-white text-[10px] font-bold text-[#555] dark:bg-[#505050] dark:text-gray-100">
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
            day={day}
            appointments={appointments}
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
    <div className="h-[116px] border-l border-t border-[#edf2f4] bg-white p-[7px] last:border-l-0 dark:border-white/15 dark:bg-[#505050]">
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

      <div className="mt-[15px] space-y-[3px]">
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

      {weekHours.map((hour) => {
        const current = hour.value === currentHour;

        return (
          <div
            key={hour.value}
            className={`grid h-[48px] grid-cols-[42px_repeat(7,minmax(0,1fr))] ${
              current ? "border-t border-[#37bed9]" : ""
            }`}
          >
            <div className="relative flex items-start justify-center border-l border-t border-[#edf2f4] pt-[6px] text-[8px] text-[#97a1a6] dark:border-white/15 dark:text-gray-300">
              {current ? (
                <span className="absolute -top-[10px] rounded-full bg-[#35c0d8] px-[8px] py-[2px] text-[8px] font-bold text-white">
                  {formatAppointmentTime(`${String(hour.value).padStart(2, "0")}:00`)}
                </span>
              ) : (
                hour.label
              )}
            </div>

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

function DayView({ appointments, selectedDate, currentHour, onNext, onPrevious }) {
  const selectedDateIso = getIsoDate(selectedDate);
  const dayEvents = appointments.filter(
    (appointment) => appointment.dateIso === selectedDateIso,
  );

  return (
    <div className="min-w-[850px] overflow-hidden rounded-[7px] border border-[#edf2f4] dark:border-white/15">
      <div className="flex h-[42px] items-center justify-center gap-[14px] border-b border-[#edf2f4] bg-white dark:border-white/15 dark:bg-[#505050]">
        <ArrowButton label="اليوم التالي" icon={ChevronLeft} onClick={onNext} />
        <div className="text-center">
          <h2 className="text-[12px] font-bold text-[#333] dark:text-white">
            {weekdayLabels[selectedDate.getDay()]}
            <span className="mx-2 text-[#8a8a8a] dark:text-gray-300">
              {getRangeTitle("day", selectedDate)}
            </span>
          </h2>
        </div>
        <ArrowButton label="اليوم السابق" icon={ChevronRight} onClick={onPrevious} />
      </div>

      {weekHours.map((hour) => {
        const current = hour.value === currentHour;
        const events = dayEvents.filter((appointment) => appointment.hour === hour.value);

        return (
          <div
            key={hour.value}
            className={`grid h-[42px] grid-cols-[42px_minmax(0,1fr)] ${
              current ? "border-t border-[#37bed9]" : ""
            }`}
          >
            <div className="relative flex items-start justify-center border-l border-t border-[#edf2f4] pt-[5px] text-[8px] text-[#97a1a6] dark:border-white/15 dark:text-gray-300">
              {current ? (
                <span className="absolute -top-[10px] rounded-full bg-[#35c0d8] px-[8px] py-[2px] text-[8px] font-bold text-white">
                  الآن
                </span>
              ) : (
                hour.label
              )}
            </div>
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

function CompactEvent({ event }) {
  const meta = statusMeta[event.status] || statusMeta.confirmed;

  return (
    <div
      className={`border-r-[3px] ${meta.border} ${meta.bg} ${meta.text} min-h-[22px] rounded-[3px] px-[5px] py-[2px] text-right`}
    >
      <p className="truncate text-[8px] font-bold leading-3">{event.patient}</p>
      {event.time && (
        <p className="truncate text-[7px] leading-3 opacity-90">{event.time}</p>
      )}
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
        <p className="text-[8px] leading-3 opacity-90">{event.time}</p>
      </div>
    </div>
  );
}

function Legend() {
  return (
    <div className="mt-[14px] flex flex-wrap items-center justify-center gap-x-[42px] gap-y-3 text-[11px] font-bold text-[#333] dark:text-white">
      {Object.entries(statusMeta).map(([status, meta]) => (
        <div key={status} className="flex items-center gap-[9px]">
          <span>{meta.label}</span>
          <span className={`h-[11px] w-[11px] rounded-full ${meta.dot}`} />
        </div>
      ))}
    </div>
  );
}
