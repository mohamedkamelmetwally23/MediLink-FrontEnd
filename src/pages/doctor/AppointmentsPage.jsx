import { useState } from "react";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";

const views = [
  { id: "day", label: "يوم" },
  { id: "week", label: "أسبوع" },
  { id: "month", label: "شهر" },
];

const weekDays = [
  { name: "السبت", day: 13 },
  { name: "الأحد", day: 14, muted: true },
  { name: "الإثنين", day: 15 },
  { name: "الثلاثاء", day: 16 },
  { name: "الأربعاء", day: 17 },
  { name: "الخميس", day: 18 },
  { name: "الجمعة", day: 19 },
];

const weekHours = [
  { label: "9ص", value: 9 },
  { label: "10ص", value: 10 },
  { label: "11ص", value: 11 },
  { label: "12م", value: 12 },
  { label: "1م", value: 13 },
  { label: "2م", value: 14 },
  { label: "3م", value: 15 },
  { label: "4م", value: 16, current: true },
  { label: "5م", value: 17 },
  { label: "6م", value: 18 },
  { label: "7م", value: 19 },
  { label: "8م", value: 20 },
];

const appointments = [
  {
    day: 13,
    hour: 13,
    patient: "كريم رشاد",
    time: "1:00 مساء - 12:30 مساء",
    status: "completed",
  },
  {
    day: 13,
    hour: 15,
    patient: "أنس طارق",
    time: "3:00 مساء - 2:30 مساء",
    status: "completed",
  },
  {
    day: 13,
    hour: 16,
    patient: "محمد علي",
    time: "4:00 مساء - 3:30 مساء",
    status: "waiting",
  },
  {
    day: 13,
    hour: 17,
    patient: "أحمد محمد",
    time: "5:00 مساء - 4:30 مساء",
    status: "cancelled",
  },
  {
    day: 14,
    hour: 13,
    patient: "حسام محمد",
    time: "1:30 مساء - 1:00 مساء",
    status: "waiting",
  },
  {
    day: 14,
    hour: 14,
    patient: "سلمى خالد",
    time: "2:30 مساء - 2:00 مساء",
    status: "waiting",
  },
  {
    day: 14,
    hour: 15,
    patient: "ندى علي",
    time: "3:00 مساء - 2:30 مساء",
    status: "waiting",
  },
  {
    day: 14,
    hour: 16,
    patient: "خليل محمد",
    time: "4:30 مساء - 4:00 مساء",
    status: "waiting",
  },
  {
    day: 15,
    hour: 13,
    patient: "محمد حسن",
    time: "1:30 مساء - 1:00 مساء",
    status: "cancelled",
  },
  {
    day: 15,
    hour: 14,
    patient: "حسن علي",
    time: "2:30 مساء - 2:00 مساء",
    status: "waiting",
  },
  {
    day: 15,
    hour: 15,
    patient: "سارة محمد",
    time: "3:30 مساء - 3:00 مساء",
    status: "waiting",
  },
  {
    day: 16,
    hour: 13,
    patient: "محمد علي",
    time: "1:30 مساء - 1:00 مساء",
    status: "waiting",
  },
  {
    day: 16,
    hour: 14,
    patient: "محمد فهد",
    time: "2:30 مساء - 2:00 مساء",
    status: "cancelled",
  },
  {
    day: 16,
    hour: 15,
    patient: "محمود علي",
    time: "3:30 مساء - 3:00 مساء",
    status: "waiting",
  },
  {
    day: 17,
    hour: 13,
    patient: "أحمد علي",
    time: "1:30 مساء - 1:00 مساء",
    status: "waiting",
  },
  {
    day: 17,
    hour: 14,
    patient: "خالد محمد",
    time: "2:30 مساء - 2:00 مساء",
    status: "waiting",
  },
  {
    day: 17,
    hour: 15,
    patient: "يوسف خالد",
    time: "3:30 مساء - 3:00 مساء",
    status: "waiting",
  },
  {
    day: 18,
    hour: 13,
    patient: "أحمد علي",
    time: "1:30 مساء - 1:00 مساء",
    status: "waiting",
  },
  {
    day: 18,
    hour: 14,
    patient: "مريم أحمد",
    time: "2:30 مساء - 2:00 مساء",
    status: "waiting",
  },
  {
    day: 18,
    hour: 15,
    patient: "أحمد محمد",
    time: "3:30 مساء - 3:00 مساء",
    status: "waiting",
  },
  {
    day: 18,
    hour: 16,
    patient: "مروان أحمد",
    time: "4:30 مساء - 4:00 مساء",
    status: "cancelled",
  },
];

const monthCells = Array.from({ length: 35 }, (_, index) => {
  const day = index + 1;
  return day <= 31 ? day : day - 31;
});

const monthEvents = {
  9: [
    { patient: "كريم رشاد", status: "completed" },
    { patient: "سما محمد", status: "completed" },
    { patient: "أحمد طالب", status: "completed" },
  ],
  12: [
    { patient: "سارة محمد", status: "completed" },
    { patient: "أسماء طالب", status: "cancelled" },
    { patient: "كريم رشاد", status: "completed" },
  ],
  18: [
    { patient: "أسامة خليل", status: "waiting" },
    { patient: "كريم رشاد", status: "waiting" },
    { patient: "سارة محمد", status: "waiting" },
  ],
};

const dayTimeline = [
  { label: "11ص", value: "11:00" },
  { label: "11:30ص", value: "11:30" },
  { label: "12م", value: "12:00" },
  { label: "12:30م", value: "12:30" },
  {
    label: "1م",
    value: "13:00",
    event: {
      patient: "كريم رشاد",
      time: "1:00 مساء - 12:30 مساء",
      status: "completed",
    },
  },
  { label: "1:30م", value: "13:30" },
  { label: "2م", value: "14:00" },
  {
    label: "2:30م",
    value: "14:30",
    event: {
      patient: "أنس طارق",
      time: "3:00 مساء - 2:30 مساء",
      status: "completed",
    },
  },
  { label: "3م", value: "15:00" },
  { label: "3:30م", value: "15:30" },
  { label: "4م", value: "16:00", current: true },
  {
    label: "4:30م",
    value: "16:30",
    event: {
      patient: "محمد علي",
      time: "4:30 مساء - 4:00 مساء",
      status: "waiting",
    },
  },
  {
    label: "5م",
    value: "17:00",
    event: {
      patient: "أحمد محمد",
      time: "5:00 مساء - 4:30 مساء",
      status: "cancelled",
    },
  },
  { label: "5:30م", value: "17:30" },
  { label: "6م", value: "18:00" },
];

const statusMeta = {
  waiting: {
    label: "قيد الإنتظار",
    dot: "bg-[#37bed9]",
    text: "text-[#22abc6]",
    bg: "bg-[#e9f9fb]",
    border: "border-[#37bed9]",
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

export default function DoctorAppointmentsPage() {
  const [activeView, setActiveView] = useState("week");

  return (
    <section className="min-h-screen bg-[#f8fbfc] text-[#333333] dark:bg-[#2f2f2f] dark:text-white">
      <Header />

      <main className="px-4 pb-[28px] pt-[24px] sm:px-6 lg:px-[24px]">
        <section className="rounded-[8px] bg-white px-[18px] pb-[18px] pt-[16px] shadow-[0_4px_18px_rgba(0,0,0,0.08)] dark:bg-[#505050]">
          <CalendarToolbar activeView={activeView} onViewChange={setActiveView} />

          <div className="mt-[16px] overflow-x-auto">
            {activeView === "month" && <MonthView />}
            {activeView === "week" && <WeekView />}
            {activeView === "day" && <DayView />}
          </div>
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

function CalendarToolbar({ activeView, onViewChange }) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="flex items-start gap-[9px]" dir="ltr">
        <ArrowButton label="الشهر التالي" icon={ChevronLeft} />
        <div className="min-w-[112px] text-right" dir="rtl">
          <h2 className="text-[15px] font-bold leading-5 text-[#333] dark:text-white">
            2026, أبريل
          </h2>
          <p className="text-[9px] leading-4 text-[#8a8a8a] dark:text-gray-300">
            {activeView === "day" ? "13 أبريل" : "13 أبريل - 19 أبريل"}
          </p>
        </div>
        <ArrowButton label="الشهر السابق" icon={ChevronRight} />
      </div>

      <ViewTabs activeView={activeView} onViewChange={onViewChange} />
    </div>
  );
}

function ArrowButton({ icon: Icon, label }) {
  return (
    <button
      type="button"
      aria-label={label}
      className="grid h-[28px] w-[28px] place-items-center rounded-[7px] border border-[#e3edf1] text-[#7d8b92] transition hover:border-[#35c0d8] hover:text-[#35c0d8] dark:border-white/15 dark:text-gray-200"
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

function MonthView() {
  return (
    <div className="min-w-[850px] overflow-hidden rounded-[7px] border border-[#edf2f4] dark:border-white/15">
      <div className="grid h-[44px] grid-cols-7 bg-white text-[10px] font-bold text-[#555] dark:bg-[#505050] dark:text-gray-100">
        {weekDays.map((day) => (
          <div
            key={day.name}
            className="flex items-center justify-center border-l border-[#edf2f4] last:border-l-0 dark:border-white/15"
          >
            {day.name}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7">
        {monthCells.map((day, index) => (
          <MonthCell key={`${day}-${index}`} day={day} muted={index > 30} />
        ))}
      </div>
    </div>
  );
}

function MonthCell({ day, muted }) {
  const events = monthEvents[day] || [];

  return (
    <div className="h-[116px] border-l border-t border-[#edf2f4] bg-white p-[7px] last:border-l-0 dark:border-white/15 dark:bg-[#505050]">
      <div
        className={`ml-auto grid h-[18px] w-[18px] place-items-center rounded-full text-[9px] ${
          day === 13
            ? "bg-[#35c0d8] font-bold text-white"
            : muted
              ? "text-[#c8cfd3] dark:text-gray-500"
              : "text-[#7e8b91] dark:text-gray-300"
        }`}
      >
        {day}
      </div>

      <div className="mt-[15px] space-y-[3px]">
        {events.slice(0, 3).map((event) => (
          <CompactEvent key={`${event.patient}-${event.status}`} event={event} />
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

function WeekView() {
  return (
    <div className="min-w-[900px] overflow-hidden rounded-[7px] border border-[#edf2f4] dark:border-white/15">
      <div className="grid h-[48px] grid-cols-[42px_repeat(7,minmax(0,1fr))] bg-white text-[10px] font-bold text-[#555] dark:bg-[#505050] dark:text-gray-100">
        <div className="border-l border-[#edf2f4] dark:border-white/15" />
        {weekDays.map((day) => (
          <div
            key={day.name}
            className={`flex flex-col items-center justify-center gap-[2px] border-l border-[#edf2f4] last:border-l-0 dark:border-white/15 ${
              day.muted ? "bg-[#f7fbfc] dark:bg-white/5" : ""
            }`}
          >
            <span>{day.name}</span>
            <span
              className={`grid h-[18px] min-w-[18px] place-items-center rounded-full px-[5px] text-[8px] ${
                day.muted ? "bg-[#e7fbfd] text-[#27b6cc]" : "text-[#7e8b91]"
              }`}
            >
              {day.day} أبريل
            </span>
          </div>
        ))}
      </div>

      {weekHours.map((hour) => (
        <div
          key={hour.value}
          className={`grid h-[48px] grid-cols-[42px_repeat(7,minmax(0,1fr))] ${
            hour.current ? "border-t border-[#37bed9]" : ""
          }`}
        >
          <div className="relative flex items-start justify-center border-l border-t border-[#edf2f4] pt-[6px] text-[8px] text-[#97a1a6] dark:border-white/15 dark:text-gray-300">
            {hour.current ? (
              <span className="absolute -top-[10px] rounded-full bg-[#35c0d8] px-[8px] py-[2px] text-[8px] font-bold text-white">
                4:00 م
              </span>
            ) : (
              hour.label
            )}
          </div>

          {weekDays.map((day) => (
            <WeekCell
              key={`${day.day}-${hour.value}`}
              day={day.day}
              hour={hour.value}
              highlighted={day.muted}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

function WeekCell({ day, hour, highlighted }) {
  const cellEvents = appointments.filter(
    (appointment) => appointment.day === day && appointment.hour === hour,
  );

  return (
    <div
      className={`border-l border-t border-[#edf2f4] px-[3px] py-[2px] last:border-l-0 dark:border-white/15 ${
        highlighted ? "bg-[#f7fbfc] dark:bg-white/5" : "bg-white dark:bg-[#505050]"
      }`}
    >
      <div className="space-y-[2px]">
        {cellEvents.map((event) => (
          <CompactEvent key={`${event.patient}-${event.time}`} event={event} />
        ))}
      </div>
    </div>
  );
}

function DayView() {
  return (
    <div className="min-w-[850px] overflow-hidden rounded-[7px] border border-[#edf2f4] dark:border-white/15">
      <div className="flex h-[42px] items-center justify-center gap-[14px] border-b border-[#edf2f4] bg-white dark:border-white/15 dark:bg-[#505050]">
        <ArrowButton label="اليوم التالي" icon={ChevronLeft} />
        <div className="text-center">
          <h2 className="text-[12px] font-bold text-[#333] dark:text-white">
            الأحد
            <span className="mx-2 text-[#8a8a8a] dark:text-gray-300">
              13 أبريل
            </span>
          </h2>
        </div>
        <ArrowButton label="اليوم السابق" icon={ChevronRight} />
      </div>

      {dayTimeline.map((slot) => (
        <div
          key={slot.value}
          className={`grid h-[42px] grid-cols-[42px_minmax(0,1fr)] ${
            slot.current ? "border-t border-[#37bed9]" : ""
          }`}
        >
          <div className="relative flex items-start justify-center border-l border-t border-[#edf2f4] pt-[5px] text-[8px] text-[#97a1a6] dark:border-white/15 dark:text-gray-300">
            {slot.current ? (
              <span className="absolute -top-[10px] rounded-full bg-[#35c0d8] px-[8px] py-[2px] text-[8px] font-bold text-white">
                الآن
              </span>
            ) : (
              slot.label
            )}
          </div>
          <div className="border-t border-[#edf2f4] bg-white px-[5px] py-[4px] dark:border-white/15 dark:bg-[#505050]">
            {slot.event && <WideEvent event={slot.event} />}
          </div>
        </div>
      ))}
    </div>
  );
}

function CompactEvent({ event }) {
  const meta = statusMeta[event.status];

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
  const meta = statusMeta[event.status];

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
    <div className="mt-[14px] flex items-center justify-center gap-[58px] text-[11px] font-bold text-[#333] dark:text-white">
      {Object.entries(statusMeta).map(([status, meta]) => (
        <div key={status} className="flex items-center gap-[9px]">
          <span>{meta.label}</span>
          <span className={`h-[11px] w-[11px] rounded-full ${meta.dot}`} />
        </div>
      ))}
    </div>
  );
}
