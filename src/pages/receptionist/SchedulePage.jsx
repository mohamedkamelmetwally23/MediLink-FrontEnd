import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import CustomSelect from "../../components/admin/CustomSelect";
import {
  listAppointments,
  listDoctors,
} from "../../services/medilinkApi";

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

const compactEventHeight = 27;
const compactEventPadding = 10;
const wideEventHeight = 36;
const wideEventPadding = 12;

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

function getCalendarMinutes(time) {
  const match = /^(\d{1,2}):(\d{2})/.exec(time || "");
  if (!match) return getCalendarHour(time) * 60;

  return Number(match[1]) * 60 + Number(match[2]);
}

function getCalendarStatus(status) {
  const raw = String(status || "").trim();
  const value = raw.toLowerCase();

  if (
    ["completed", "complete", "done", "finished", "finish", "attended", "closed"].includes(
      value,
    ) ||
    ["مكتمل", "مكتملة", "تم الانتهاء", "تم الكشف", "تم الكشف عليه", "منتهي", "منتهية"].includes(
      raw,
    )
  )
    return "completed";
  if (
    ["cancelled", "canceled", "cancel", "rejected", "reject", "refused"].includes(
      value,
    ) ||
    ["ملغى", "ملغي", "ملغية", "ملغيًا", "تم الإلغاء", "تم الالغاء", "إلغاء", "الغاء"].includes(
      raw,
    )
  )
    return "cancelled";
  if (
    ["pending", "waiting", "reserved"].includes(value) ||
    ["قيد الانتظار", "قيد_الانتظار", "قيدالانتظار", "في الانتظار"].includes(raw)
  )
    return "pending";
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
    sortMinutes: getCalendarMinutes(time),
    patient: appointment.patient || "مريض",
    doctor: appointment.doctor || "طبيب",
    time: formatAppointmentTime(time),
    status: getCalendarStatus(appointment.status),
  };
}

function sortCalendarEvents(events) {
  return [...events].sort((first, second) => {
    if (first.sortMinutes !== second.sortMinutes) {
      return first.sortMinutes - second.sortMinutes;
    }

    return String(first.patient).localeCompare(String(second.patient), "ar");
  });
}

function getWeekHourRowHeight(appointments, weekDays, hour) {
  const maxEventsInCell = Math.max(
    0,
    ...weekDays.map(
      (day) =>
        appointments.filter(
          (appointment) =>
            appointment.dateIso === day.dateIso && appointment.hour === hour,
        ).length,
    ),
  );

  return Math.max(56, maxEventsInCell * compactEventHeight + compactEventPadding);
}

function getDayHourRowHeight(eventCount) {
  return Math.max(46, eventCount * wideEventHeight + wideEventPadding);
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

function getRequestedView(searchParams) {
  const requestedView = searchParams.get("view");
  return views.some((view) => view.id === requestedView)
    ? requestedView
    : "day";
}

function getRequestedDate(searchParams) {
  const requestedDate = searchParams.get("date");

  if (requestedDate === "today") return startOfDay(new Date());

  const parsedDate = parseAppointmentDate(requestedDate, null);
  return parsedDate || startOfDay(new Date());
}

export default function ReceptionistSchedulePage() {
  const [searchParams] = useSearchParams();
  const [activeView, setActiveView] = useState(() =>
    getRequestedView(searchParams),
  );
  const [selectedDate, setSelectedDate] = useState(() =>
    getRequestedDate(searchParams),
  );
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [doctorFilter, setDoctorFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const weekDays = useMemo(() => getWeekDays(selectedDate), [selectedDate]);
  const currentHour = new Date().getHours();

  useEffect(() => {
    if (!searchParams.has("view") && !searchParams.has("date")) return;

    setActiveView(getRequestedView(searchParams));
    setSelectedDate(getRequestedDate(searchParams));
  }, [searchParams]);

  useEffect(() => {
    let mounted = true;

    Promise.allSettled([listAppointments(), listDoctors()])
      .then(([appointmentsResult, doctorsResult]) => {
        if (!mounted) return;

        setAppointments(
          appointmentsResult.status === "fulfilled"
            ? appointmentsResult.value
            : [],
        );
        setDoctors(
          doctorsResult.status === "fulfilled" ? doctorsResult.value : [],
        );
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

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
    <section className="min-h-screen bg-[#f8fbfc] text-[#333333] dark:bg-[#2f2f2f] dark:text-white">
      <Header />

      <main className="px-4 pb-[28px] pt-[24px] sm:px-6 lg:px-[24px]">
        <section className="rounded-[8px] bg-white px-[18px] pb-[18px] pt-[16px] shadow-[0_4px_18px_rgba(0,0,0,0.08)] dark:bg-[#505050]">
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
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex h-[42px] items-center justify-center gap-[14px]" dir="ltr">
          <ArrowButton label="التالي" icon={ChevronLeft} onClick={onNext} />
          <div className="min-w-[112px] text-center" dir="rtl">
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

      <div className="flex justify-center">
        <CustomSelect
          value={doctorFilter}
          onChange={onDoctorChange}
          displayLabel={doctorFilter === "all" ? "اسم الطبيب" : doctorFilter}
          className="w-full max-w-[220px]"
          buttonClassName="flex h-[36px] w-full items-center gap-2 rounded-[7px] border border-[#e3edf1] bg-white px-3 text-[13px] font-bold text-[#333] outline-none transition hover:border-[#35c0d8] dark:border-white/15 dark:bg-[#444] dark:text-white"
          menuClassName="rounded-[7px] p-1.5 text-[12px]"
        >
          <option value="all">اسم الطبيب</option>
          {doctorOptions.map((doctor) => (
            <option key={doctor} value={doctor}>
              {doctor}
            </option>
          ))}
        </CustomSelect>
      </div>
    </div>
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
    <div className="min-h-[132px] border-l border-t border-[#edf2f4] bg-white p-[7px] last:border-l-0 dark:border-white/15 dark:bg-[#505050]">
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
        {sortCalendarEvents(events).slice(0, 3).map((event) => (
          <CompactEvent key={`${event.id}-${event.time}-${event.status}`} event={event} />
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
        const rowHeight = getWeekHourRowHeight(
          appointments,
          weekDays,
          hour.value,
        );

        return (
          <div
            key={hour.value}
            className={`grid grid-cols-[42px_repeat(7,minmax(0,1fr))] ${
              current ? "border-t border-[#37bed9]" : ""
            }`}
            style={{ minHeight: `${rowHeight}px` }}
          >
            <HourLabel
              current={current}
              currentLabel={formatAppointmentTime(`${String(hour.value).padStart(2, "0")}:00`)}
              hour={hour}
            />
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
  const cellEvents = sortCalendarEvents(
    appointments.filter(
      (appointment) =>
        appointment.dateIso === dateIso && appointment.hour === hour,
    ),
  );

  return (
    <div
      className={`min-h-0 border-l border-t border-[#edf2f4] px-[4px] py-[4px] last:border-l-0 dark:border-white/15 ${
        highlighted ? "bg-[#f7fbfc] dark:bg-white/5" : "bg-white dark:bg-[#505050]"
      }`}
    >
      <div className="flex h-full min-h-0 flex-col gap-[3px]">
        {cellEvents.map((event) => (
          <CompactEvent key={`${event.id}-${event.time}`} event={event} />
        ))}
      </div>
    </div>
  );
}

function DayView({ appointments, selectedDate, currentHour, onNext, onPrevious }) {
  const selectedDateIso = getIsoDate(selectedDate);
  const dayEvents = sortCalendarEvents(
    appointments.filter(
      (appointment) => appointment.dateIso === selectedDateIso,
    ),
  );

  return (
    <div className="min-w-[850px] overflow-hidden rounded-[7px] border border-[#edf2f4] dark:border-white/15">
      <div className="flex h-[42px] items-center justify-center gap-[14px] border-b border-[#edf2f4] bg-white dark:border-white/15 dark:bg-[#505050]" dir="ltr">
        <ArrowButton label="اليوم التالي" icon={ChevronLeft} onClick={onNext} />
        <div className="text-center" dir="rtl">
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
        const rowHeight = getDayHourRowHeight(events.length);

        return (
          <div
            key={hour.value}
            className={`grid grid-cols-[42px_minmax(0,1fr)] ${
              current ? "border-t border-[#37bed9]" : ""
            }`}
            style={{ minHeight: `${rowHeight}px` }}
          >
            <HourLabel current={current} hour={hour} />
            <div className="border-t border-[#edf2f4] bg-white px-[5px] py-[5px] dark:border-white/15 dark:bg-[#505050]">
              <div className="grid h-full gap-[4px]">
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

function HourLabel({ current, hour, currentLabel = "الآن" }) {
  return (
    <div className="relative flex items-start justify-center border-l border-t border-[#edf2f4] pt-[6px] text-[8px] text-[#97a1a6] dark:border-white/15 dark:text-gray-300">
      {current ? (
        <span className="absolute -top-[10px] rounded-full bg-[#35c0d8] px-[8px] py-[2px] text-[8px] font-bold text-white">
          {currentLabel}
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
      className={`min-h-[24px] overflow-hidden border-r-[3px] ${meta.border} ${meta.bg} ${meta.text} rounded-[3px] px-[5px] py-[2px] text-right`}
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
      className={`flex h-full min-h-[32px] items-center justify-between overflow-hidden rounded-[3px] border-r-[3px] ${meta.border} ${meta.bg} px-[12px] ${meta.text}`}
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
