import { useEffect, useMemo, useState } from "react";
import {
  Banknote,
  CalendarCheck,
  ChevronLeft,
  Receipt,
  TrendingUp,
  XCircle,
} from "lucide-react";
import patientAvatar from "../../assets/landingPage/admin.png";
import doctorAvatar from "../../assets/landingPage/doctor1.png";
import CustomSelect from "../../components/admin/CustomSelect";
import {
  changeAppointmentQueueStatus,
  getClinicProfits,
  getDoctorQueueByReceptionist,
  listAppointments,
  listDoctorsForReceptionistQueue,
} from "../../services/medilinkApi";

const statusLabels = {
  pending: "انتظار",
  confirmed: "مؤكد",
  completed: "مكتمل",
  cancelled: "ملغي",
};

const paymentLabels = {
  paid: "مدفوع",
  waiting: "بانتظار الدفع",
  unpaid: "غير مدفوع",
  refunded: "مسترد",
};

const statusStyles = {
  pending: "bg-[#fff4ce] text-[#d09a14]",
  confirmed: "bg-[#e8fff4] text-[#129a55]",
  completed: "bg-[#eaf2ff] text-[#2870c9]",
  cancelled: "bg-[#fff0f0] text-[#ff3131]",
  paid: "bg-[#e8fff4] text-[#129a55]",
  waiting: "bg-[#fff4ce] text-[#d09a14]",
  unpaid: "bg-[#fff0f0] text-[#ff3131]",
  refunded: "bg-[#eaf2ff] text-[#2870c9]",
};

const statCards = [
  {
    key: "bookings",
    label: "إجمالي الحجوزات",
    icon: CalendarCheck,
    iconClass: "bg-[#fff5dc] text-[#e5aa24]",
    trend: "-5% عن الامس",
    trendClass: "text-[#ff3b3b]",
  },
  {
    key: "cancelled",
    label: "الحجوزات الملغية",
    icon: XCircle,
    iconClass: "bg-[#fff0f0] text-[#ff6a6a]",
    trend: "+2% عن الامس",
    trendClass: "text-[#22b66b]",
  },
  {
    key: "revenue",
    label: "إجمالي الإيرادات",
    icon: Banknote,
    iconClass: "bg-[#eafff4] text-[#23b66f]",
    trend: "+18% عن الامس",
    trendClass: "text-[#22b66b]",
  },
  {
    key: "appointmentCount",
    label: "الحجوزات المدفوعة",
    icon: Receipt,
    iconClass: "bg-[#fff3e8] text-[#e07b22]",
    trend: "",
    trendClass: "",
  },
  {
    key: "avgFee",
    label: "متوسط رسوم الموعد",
    icon: TrendingUp,
    iconClass: "bg-[#f5ebff] text-[#9b22bf]",
    trend: "",
    trendClass: "",
  },
];

function getIsoDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getTimeMinutes(time) {
  const [hours = 0, minutes = 0] = String(time || "").split(":").map(Number);
  return (
    (Number.isFinite(hours) ? hours : 0) * 60 +
    (Number.isFinite(minutes) ? minutes : 0)
  );
}

function formatTime(value) {
  if (!value) return "";

  const [hourText = "0", minute = "00"] = String(value).split(":");
  const hour24 = Number(hourText);

  if (!Number.isFinite(hour24)) return value;

  const hour12 = hour24 % 12 || 12;
  const period = hour24 >= 12 ? "م" : "ص";

  return `${hour12}:${minute} ${period}`;
}

function formatShortTimeRange(value) {
  const start = getTimeMinutes(value);
  const endHour = Math.floor((start + 30) / 60) % 24;
  const endMinute = String((start + 30) % 60).padStart(2, "0");

  return `${formatTime(value)} - ${formatTime(`${endHour}:${endMinute}`)}`;
}

function formatDateTime(appointment) {
  return `اليوم ${formatTime(appointment.time)}`;
}

function getAppointmentDateTimeKey(appointment) {
  if (!appointment?.date && !appointment?.time) return "";
  return `${appointment.date || ""}|${appointment.time || ""}`;
}

function formatNumber(value) {
  return new Intl.NumberFormat("en-US").format(value || 0);
}

function getPatientImage(appointment) {
  const patient = appointment.raw?.patient || appointment.raw?.patientId || {};
  const user = patient.user || patient.account || patient;

  return (
    appointment.raw?.patientImage ||
    patient.image ||
    patient.profileImage ||
    user.image ||
    user.profileImage ||
    patientAvatar
  );
}

function getDoctorImage(doctor) {
  return (
    doctor?.image ||
    doctor?.raw?.image ||
    doctor?.raw?.profileImage ||
    doctorAvatar
  );
}

function getDoctorName(doctor) {
  return (
    [doctor?.firstName, doctor?.lastName].filter(Boolean).join(" ").trim() ||
    doctor?.name ||
    ""
  );
}

function getDoctorOptions(doctors) {
  return doctors
    .map((doctor) => ({
      id: doctor.queueDoctorId,
      name: getDoctorName(doctor),
      specialty: doctor.specialty || "طبيب",
      image: getDoctorImage(doctor),
    }))
    .filter((doctor) => doctor.id && doctor.name);
}

function sortAppointmentsByTime(appointments) {
  return [...appointments].sort(
    (left, right) => getTimeMinutes(left.time) - getTimeMinutes(right.time),
  );
}

export default function ReceptionistDashboard() {
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState("all");
  const [doctorQueue, setDoctorQueue] = useState([]);
  const [queueLoading, setQueueLoading] = useState(false);
  const [queueError, setQueueError] = useState("");
  const [queueActionLoading, setQueueActionLoading] = useState(false);
  const [tableDoctorFilter, setTableDoctorFilter] = useState("");
  const [tableDateTimeFilter, setTableDateTimeFilter] = useState("");
  const [tableBookingFilter, setTableBookingFilter] = useState("");
  const [tablePaymentFilter, setTablePaymentFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [clinicProfits, setClinicProfits] = useState(null);
  const todayIso = getIsoDate(new Date());

  useEffect(() => {
    let mounted = true;

    Promise.allSettled([
      listAppointments(),
      listDoctorsForReceptionistQueue(),
    ])
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
        if (mounted) {
          setLoading(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (selectedDoctor === "all") return undefined;

    let mounted = true;

    getDoctorQueueByReceptionist(selectedDoctor)
      .then((queue) => {
        if (mounted) setDoctorQueue(queue);
      })
      .catch((error) => {
        if (mounted) {
          setDoctorQueue([]);
          setQueueError(error?.message || "تعذر تحميل قائمة الانتظار");
        }
      })
      .finally(() => {
        if (mounted) setQueueLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [selectedDoctor]);

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

  const doctorOptions = useMemo(
    () => getDoctorOptions(doctors),
    [doctors],
  );
  const todayAppointments = useMemo(
    () =>
      sortAppointmentsByTime(
        appointments.filter((appointment) => appointment.date === todayIso),
      ),
    [appointments, todayIso],
  );
  const tableDoctorOptions = useMemo(
    () =>
      Array.from(
        new Set(
          todayAppointments
            .map((appointment) => appointment.doctor)
            .filter(Boolean),
        ),
      ),
    [todayAppointments],
  );
  const tableDateTimeOptions = useMemo(() => {
    const byKey = new Map();

    todayAppointments.forEach((appointment) => {
      const key = getAppointmentDateTimeKey(appointment);
      if (!key || byKey.has(key)) return;
      byKey.set(key, formatDateTime(appointment));
    });

    return Array.from(byKey, ([value, label]) => ({ value, label }));
  }, [todayAppointments]);
  const selectedDoctorInfo =
    doctorOptions.find((doctor) => String(doctor.id) === selectedDoctor) || null;
  const currentAppointment = doctorQueue[0] || null;
  const nextQueueAppointments = doctorQueue.slice(1, 6);
  const tableAppointments = useMemo(
    () =>
      todayAppointments
        .filter((appointment) => {
          const matchesDoctor =
            !tableDoctorFilter || appointment.doctor === tableDoctorFilter;
          const matchesDateTime =
            !tableDateTimeFilter ||
            getAppointmentDateTimeKey(appointment) === tableDateTimeFilter;
          const matchesBooking =
            !tableBookingFilter || appointment.status === tableBookingFilter;
          const matchesPayment =
            !tablePaymentFilter || appointment.payment === tablePaymentFilter;

          return (
            matchesDoctor &&
            matchesDateTime &&
            matchesBooking &&
            matchesPayment
          );
        })
        .slice(0, 10),
    [
      tableBookingFilter,
      tableDateTimeFilter,
      tableDoctorFilter,
      tablePaymentFilter,
      todayAppointments,
    ],
  );
  const stats = {
    bookings: todayAppointments.length,
    cancelled: todayAppointments.filter(
      (appointment) => appointment.status === "cancelled",
    ).length,
    revenue: clinicProfits?.totalProfit ?? 0,
    appointmentCount: clinicProfits?.appointmentCount ?? 0,
    avgFee: clinicProfits?.avgFeePerAppointment != null
      ? Number(clinicProfits.avgFeePerAppointment).toFixed(2)
      : 0,
  };

  const handleDoctorChange = (doctorId) => {
    setSelectedDoctor(doctorId);
    setDoctorQueue([]);
    setQueueError("");
    setQueueLoading(doctorId !== "all");
  };

  const handleQueueAction = async (changeTo) => {
    if (!currentAppointment || queueActionLoading) return;

    setQueueActionLoading(true);
    setQueueError("");

    try {
      await changeAppointmentQueueStatus(
        currentAppointment.queueAppointmentId || currentAppointment.id,
        changeTo,
      );
      const nextQueue = await getDoctorQueueByReceptionist(selectedDoctor);
      setDoctorQueue(nextQueue);
    } catch (error) {
      setQueueError(error?.message || "تعذر تحديث حالة الموعد");
    } finally {
      setQueueActionLoading(false);
    }
  };

  return (
    <section className="min-h-screen bg-[#f8fcfd] text-[#27343a] dark:bg-[#2e2e2e] dark:text-white">
      <Header />

      <main className="px-4 pb-8 pt-5 sm:px-6 lg:px-7">
        <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,1fr)_300px]" dir="ltr">
          <section className="space-y-4" dir="rtl">
            <StatsGrid loading={loading} stats={stats} />
            <TodayAppointmentsTable
              appointments={tableAppointments}
              loading={loading}
              doctorFilter={tableDoctorFilter}
              doctorOptions={tableDoctorOptions}
              dateTimeFilter={tableDateTimeFilter}
              dateTimeOptions={tableDateTimeOptions}
              bookingFilter={tableBookingFilter}
              paymentFilter={tablePaymentFilter}
              onDoctorFilterChange={setTableDoctorFilter}
              onDateTimeFilterChange={setTableDateTimeFilter}
              onBookingFilterChange={setTableBookingFilter}
              onPaymentFilterChange={setTablePaymentFilter}
              onClearFilters={() => {
                setTableDoctorFilter("");
                setTableDateTimeFilter("");
                setTableBookingFilter("");
                setTablePaymentFilter("");
              }}
            />
          </section>

          <QueuePanel
            currentAppointment={currentAppointment}
            doctorOptions={doctorOptions}
            loading={queueLoading}
            nextQueueAppointments={nextQueueAppointments}
            queueCount={doctorQueue.length}
            queueError={queueError}
            actionLoading={queueActionLoading}
            selectedDoctor={selectedDoctor}
            selectedDoctorInfo={selectedDoctorInfo}
            onDoctorChange={handleDoctorChange}
            onConfirm={() => handleQueueAction("مؤكد")}
            onSkip={() => handleQueueAction("ملغى")}
          />
        </div>
      </main>
    </section>
  );
}

function Header() {
  return (
    <header className="flex min-h-[92px] items-center justify-start bg-white px-4 py-5 shadow-[0_1px_10px_rgba(20,60,72,0.04)] dark:bg-[#3a3a3a] sm:px-6 lg:px-7">
      <div className="text-right">
        <h1 className="text-[22px] font-bold leading-7 text-[#27343a] dark:text-white">
          لوحة التحكم
        </h1>
        <p className="mt-1 text-[11px] leading-5 text-[#9ba8ae] dark:text-gray-300">
          المستخدمون / لوحة المستخدم
        </p>
      </div>
    </header>
  );
}

function StatsGrid({ stats, loading }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
      {statCards.map((card) => (
        <StatCard
          key={card.key}
          {...card}
          value={loading ? "..." : stats[card.key]}
        />
      ))}
    </div>
  );
}

function StatCard({ label, value, icon: Icon, iconClass, trend, trendClass }) {
  return (
    <article className="min-h-[92px] rounded-[8px] bg-white p-4 shadow-[0_5px_18px_rgba(37,70,82,0.08)] dark:bg-[#505050]">
      <div className="flex items-start justify-between gap-3">
        <div className="text-right">
          <p className="text-[11px] font-bold text-[#7f8c93] dark:text-gray-300">
            {label}
          </p>
          <strong className="mt-1 block text-[20px] leading-6 text-[#27343a] dark:text-white">
            {typeof value === "number" ? formatNumber(value) : value}
          </strong>
        </div>
        <span
          className={`grid h-10 w-10 shrink-0 place-items-center rounded-[8px] ${iconClass}`}
        >
          <Icon size={19} strokeWidth={1.9} />
        </span>
      </div>
      <p className={`mt-3 text-[10px] font-bold ${trendClass}`}>
        {trend}
      </p>
    </article>
  );
}

function QueuePanel({
  currentAppointment,
  doctorOptions,
  loading,
  nextQueueAppointments,
  queueCount,
  queueError,
  actionLoading,
  selectedDoctor,
  selectedDoctorInfo,
  onDoctorChange,
  onConfirm,
  onSkip,
}) {
  return (
    <aside className="rounded-[8px] bg-white p-3 shadow-[0_5px_18px_rgba(37,70,82,0.08)] dark:bg-[#505050]" dir="rtl">
      <label className="block">
        <span className="mb-1 block text-[11px] font-bold text-[#27343a] dark:text-white">
          اختر طبيب
        </span>
        <CustomSelect
          value={selectedDoctor}
          onChange={onDoctorChange}
          displayLabel={selectedDoctorInfo?.name || "عرض الكل"}
          className="w-full"
          buttonClassName="flex h-[40px] w-full items-center gap-2 rounded-[7px] border border-transparent bg-[#f0f0f0] px-3 text-[12px] font-bold text-[#27343a] outline-none transition hover:bg-[#eaf8fb] focus:border-[#25b9d6] dark:bg-[#444] dark:text-white dark:hover:bg-[#4b4b4b]"
          menuClassName="max-h-[230px] rounded-[10px] border-[#dceff3] bg-white p-1.5 shadow-[0_18px_38px_rgba(24,64,75,0.16)] dark:border-white/15 dark:bg-[#3a3a3a]"
        >
          <option value="all">عرض الكل</option>
          {doctorOptions.map((doctor) => (
            <option key={doctor.id} value={String(doctor.id)}>
              {doctor.name}
            </option>
          ))}
        </CustomSelect>
      </label>

      <div className="mt-3 flex items-center justify-between text-[12px] font-bold">
        <h2 className="text-[#27343a] dark:text-white">قائمة الإنتظار</h2>
        <span className="text-[#7f8c93] dark:text-gray-300">
          باقى: {loading ? "..." : queueCount}
        </span>
      </div>

      <section className="mt-2 rounded-[8px] bg-[#effbfc] p-2 dark:bg-[#24484b]">
        {loading ? (
          <div className="h-[100px] animate-pulse rounded-[8px] bg-white/75 dark:bg-white/10" />
        ) : queueError ? (
          <div className="grid min-h-[100px] place-items-center px-3 text-center text-[12px] font-bold text-red-500">
            {queueError}
          </div>
        ) : selectedDoctor === "all" ? (
          <div className="grid min-h-[100px] place-items-center text-center text-[12px] font-bold text-[#7c8a91] dark:text-gray-200">
            اختر طبيبًا لعرض قائمة الانتظار
          </div>
        ) : currentAppointment ? (
          <CurrentPatient
            appointment={currentAppointment}
            actionLoading={actionLoading}
            onConfirm={onConfirm}
            onSkip={onSkip}
          />
        ) : (
          <div className="grid min-h-[100px] place-items-center text-center text-[12px] font-bold text-[#7c8a91] dark:text-gray-200">
            لا يوجد دور حالي
          </div>
        )}
      </section>

      <div className="mt-2 space-y-2">
        {loading ? (
          Array.from({ length: 5 }).map((_, index) => (
            <div
              key={index}
              className="h-[52px] animate-pulse rounded-[8px] bg-[#f2f8fa] dark:bg-white/10"
            />
          ))
        ) : nextQueueAppointments.length > 0 ? (
          nextQueueAppointments.map((appointment) => (
            <QueueItem key={appointment.id} appointment={appointment} />
          ))
        ) : (
          <div className="rounded-[8px] bg-[#f7fbfc] px-3 py-5 text-center text-[12px] font-bold text-[#8a98a0] dark:bg-white/10 dark:text-gray-200">
            لا توجد عناصر انتظار
          </div>
        )}
      </div>
    </aside>
  );
}

function CurrentPatient({
  appointment,
  actionLoading,
  onConfirm,
  onSkip,
}) {
  return (
    <article>
      <div className="flex items-center gap-3">
        <img
          src={getPatientImage(appointment)}
          alt={appointment.patient}
          className="h-11 w-11 rounded-full object-cover"
        />
        <div className="min-w-0 text-right">
          <h3 className="truncate text-[12px] font-bold text-[#27343a] dark:text-white">
            {appointment.patient || "مريض"}
          </h3>
          <p className="truncate text-[10px] font-bold text-[#8a98a0] dark:text-gray-300">
            {formatShortTimeRange(appointment.time)}
          </p>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={onConfirm}
          disabled={actionLoading}
          className="h-[34px] rounded-[7px] bg-gradient-to-l from-[#67d2cb] to-[#0fb8e8] text-[12px] font-bold text-white transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {actionLoading ? "جاري التحديث..." : "تأكيد"}
        </button>
        <button
          type="button"
          onClick={onSkip}
          disabled={actionLoading}
          className="h-[34px] rounded-[7px] bg-[#b9c1c5] text-[12px] font-bold text-white transition hover:bg-[#a9b2b7] disabled:cursor-not-allowed disabled:opacity-60"
        >
          تخطي
        </button>
      </div>
    </article>
  );
}

function QueueItem({ appointment }) {
  return (
    <article className="flex min-h-[54px] items-center gap-2 rounded-[8px] bg-[#fffdf6] px-2 py-2 dark:bg-[#484235]">
      <img
        src={getPatientImage(appointment)}
        alt={appointment.patient}
        className="h-9 w-9 rounded-full object-cover"
      />
      <div className="min-w-0 flex-1 text-right">
        <h4 className="truncate text-[12px] font-bold text-[#27343a] dark:text-white">
          {appointment.patient || "مريض"}
        </h4>
        <p className="truncate text-[10px] text-[#8a98a0] dark:text-gray-300">
          {formatShortTimeRange(appointment.time)}
        </p>
      </div>
      <Badge value={appointment.status} labels={statusLabels} />
    </article>
  );
}

function TodayAppointmentsTable({
  appointments,
  loading,
  doctorFilter,
  doctorOptions,
  dateTimeFilter,
  dateTimeOptions,
  bookingFilter,
  paymentFilter,
  onDoctorFilterChange,
  onDateTimeFilterChange,
  onBookingFilterChange,
  onPaymentFilterChange,
  onClearFilters,
}) {
  return (
    <section className="overflow-hidden rounded-[8px] bg-white shadow-[0_5px_18px_rgba(37,70,82,0.08)] dark:bg-[#505050]">
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
        <h2 className="text-[14px] font-bold text-[#27343a] dark:text-white">
          مواعيد اليوم
        </h2>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onClearFilters}
            className="flex h-[36px] items-center gap-1 rounded-[7px] px-2 text-[12px] font-bold text-[#66757d] transition hover:bg-[#f2fbfd] hover:text-[#19aeca] dark:text-gray-200 dark:hover:bg-white/10"
          >
            <span>عرض الكل</span>
            <ChevronLeft size={16} strokeWidth={2} />
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-[760px]">
          <div className="grid h-[38px] grid-cols-[1.05fr_1fr_1fr_1fr_0.85fr] items-center bg-[#f7f9fa] text-[10px] font-bold text-[#66757d] dark:bg-[#444] dark:text-gray-200">
            <span className="text-center">المريض</span>
            <DashboardTableFilter
              value={doctorFilter}
              onChange={onDoctorFilterChange}
              label="الطبيب"
            >
              <option value="">الطبيب</option>
              {doctorOptions.map((doctor) => (
                <option key={doctor} value={doctor}>
                  {doctor}
                </option>
              ))}
            </DashboardTableFilter>
            <DashboardTableFilter
              value={dateTimeFilter}
              onChange={onDateTimeFilterChange}
              label="التاريخ والوقت"
            >
              <option value="">التاريخ والوقت</option>
              {dateTimeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </DashboardTableFilter>
            <DashboardTableFilter
              value={bookingFilter}
              onChange={onBookingFilterChange}
              label="حالة الحجز"
            >
              <option value="">حالة الحجز</option>
              {Object.entries(statusLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </DashboardTableFilter>
            <DashboardTableFilter
              value={paymentFilter}
              onChange={onPaymentFilterChange}
              label="حالة الدفع"
            >
              <option value="">حالة الدفع</option>
              {Object.entries(paymentLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </DashboardTableFilter>
          </div>

          {loading ? (
            <TableLoading />
          ) : appointments.length === 0 ? (
            <div className="grid min-h-[280px] place-items-center text-[13px] font-bold text-[#8a98a0] dark:text-gray-200">
              لا توجد مواعيد اليوم
            </div>
          ) : (
            appointments.map((appointment) => (
              <AppointmentRow key={appointment.id} appointment={appointment} />
            ))
          )}
        </div>
      </div>
    </section>
  );
}

function DashboardTableFilter({ value, onChange, label, children }) {
  return (
    <CustomSelect
      value={value}
      onChange={onChange}
      displayLabel={label}
      className="h-full"
      buttonClassName="relative flex h-full w-full items-center justify-center bg-transparent px-0 text-[10px] font-bold text-[#66757d] outline-none transition hover:text-[#19aeca] dark:text-gray-200 [&>span]:flex-none [&>span]:text-center [&>svg]:absolute [&>svg]:left-[14px] [&>svg]:h-[13px] [&>svg]:w-[13px]"
      menuClassName="max-h-[230px] rounded-[8px] border-[#dceff3] bg-white p-1.5 text-[12px] shadow-[0_14px_30px_rgba(24,64,75,0.13)] dark:border-white/15 dark:bg-[#3a3a3a]"
    >
      {children}
    </CustomSelect>
  );
}

function AppointmentRow({ appointment }) {
  return (
    <div className="grid min-h-[38px] grid-cols-[1.05fr_1fr_1fr_1fr_0.85fr] items-center border-b border-[#edf1f3] text-[10px] text-[#27343a] last:border-b-0 dark:border-white/15 dark:text-white">
      <span className="truncate px-2 text-center font-bold">
        {appointment.patient || "مريض"}
      </span>
      <span className="truncate px-2 text-center">
        {appointment.doctor || "طبيب"}
      </span>
      <span className="truncate px-2 text-center">
        {formatDateTime(appointment)}
      </span>
      <span className="flex justify-center">
        <Badge value={appointment.status} labels={statusLabels} />
      </span>
      <span className="flex justify-center">
        <Badge value={appointment.payment} labels={paymentLabels} />
      </span>
    </div>
  );
}

function Badge({ value, labels }) {
  return (
    <span
      className={`rounded-[6px] px-2 py-1 text-[9px] font-bold ${
        statusStyles[value] || statusStyles.pending
      }`}
    >
      {labels[value] || value || "غير محدد"}
    </span>
  );
}

function TableLoading() {
  return (
    <div className="space-y-2 p-3">
      {Array.from({ length: 8 }).map((_, index) => (
        <div
          key={index}
          className="h-[32px] animate-pulse rounded-[6px] bg-[#edf3f5] dark:bg-white/10"
        />
      ))}
    </div>
  );
}
