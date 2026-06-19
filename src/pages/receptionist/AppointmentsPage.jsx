import { useEffect, useMemo, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Pencil,
  Search,
  Trash2,
  X,
} from "lucide-react";
import CustomSelect from "../../components/admin/CustomSelect";
import {
  deleteAppointment,
  listAppointments,
  updateAppointmentStatus,
} from "../../services/medilinkApi";
import { includesSearchText } from "../../utils/searchText";

const pageSize = 10;

const bookingStatusLabels = {
  confirmed: "تم التأكيد",
  pending: "في إنتظار",
  completed: "مكتمل",
  cancelled: "ملغي",
};

const paymentStatusLabels = {
  paid: "مدفوع",
  waiting: "بانتظار الدفع",
  unpaid: "غير مدفوع",
  refunded: "تم الإسترداد",
};

const badgeStyles = {
  confirmed: "bg-[#e8fff4] text-[#129a55]",
  pending: "bg-[#fff7d8] text-[#a47500]",
  completed: "bg-[#e7f2ff] text-[#2870c9]",
  cancelled: "bg-[#fff0f0] text-[#ff2020]",
  paid: "bg-[#e8fff4] text-[#129a55]",
  waiting: "bg-[#fff7d8] text-[#a47500]",
  unpaid: "bg-[#fff0f0] text-[#ff2020]",
  refunded: "bg-[#e7f2ff] text-[#2870c9]",
};

const arabicMonths = [
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

function getIsoDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function createDemoAppointments() {
  const today = getIsoDate(new Date());
  const yesterday = getIsoDate(new Date(Date.now() - 24 * 60 * 60 * 1000));
  const tomorrow = getIsoDate(new Date(Date.now() + 24 * 60 * 60 * 1000));

  return [
    {
      id: "demo-receptionist-appointment-1",
      patient: "محمد حسين",
      doctor: "د.محمد خالد",
      date: today,
      time: "13:00",
      phone: "01066666666",
      specialty: "قلب",
      status: "confirmed",
      payment: "paid",
    },
    {
      id: "demo-receptionist-appointment-2",
      patient: "يوسف أمين",
      doctor: "د.كمال شوقي",
      date: today,
      time: "13:00",
      phone: "01077777777",
      specialty: "جلدية",
      status: "pending",
      payment: "waiting",
    },
    {
      id: "demo-receptionist-appointment-3",
      patient: "محمد حسني",
      doctor: "د.جيهان الشامي",
      date: today,
      time: "16:00",
      phone: "01088888888",
      specialty: "أطفال",
      status: "confirmed",
      payment: "paid",
    },
    {
      id: "demo-receptionist-appointment-4",
      patient: "عبد الرحمن نعم الله",
      doctor: "د.مروان يوسف",
      date: today,
      time: "17:00",
      phone: "01099999999",
      specialty: "باطنة",
      status: "cancelled",
      payment: "waiting",
    },
    {
      id: "demo-receptionist-appointment-5",
      patient: "خالد فتحي",
      doctor: "د.كمال شوقي",
      date: yesterday,
      time: "10:00",
      phone: "01111111111",
      specialty: "جلدية",
      status: "confirmed",
      payment: "paid",
    },
    {
      id: "demo-receptionist-appointment-6",
      patient: "سارة عبد الله",
      doctor: "د.مروان خالد",
      date: yesterday,
      time: "10:00",
      phone: "01222222222",
      specialty: "قلب",
      status: "completed",
      payment: "refunded",
    },
    {
      id: "demo-receptionist-appointment-7",
      patient: "سما سامي",
      doctor: "د.كمال شوقي",
      date: yesterday,
      time: "12:30",
      phone: "01555555555",
      specialty: "جلدية",
      status: "pending",
      payment: "waiting",
    },
    {
      id: "demo-receptionist-appointment-8",
      patient: "ياسمين أحمد",
      doctor: "د.كمال شوقي",
      date: yesterday,
      time: "12:00",
      phone: "01033333333",
      specialty: "باطنة",
      status: "confirmed",
      payment: "paid",
    },
    {
      id: "demo-receptionist-appointment-9",
      patient: "نورا أمين",
      doctor: "د.مروان خالد",
      date: yesterday,
      time: "06:00",
      phone: "01044444444",
      specialty: "أطفال",
      status: "completed",
      payment: "paid",
    },
    {
      id: "demo-receptionist-appointment-10",
      patient: "محمد توفيق",
      doctor: "د.مروان خالد",
      date: tomorrow,
      time: "17:00",
      phone: "01055555555",
      specialty: "عيون",
      status: "cancelled",
      payment: "unpaid",
    },
  ];
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

export default function ReceptionistAppointmentsPage() {
  const [appointments, setAppointments] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [search, setSearch] = useState("");
  const [doctorFilter, setDoctorFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [bookingFilter, setBookingFilter] = useState("");
  const [paymentFilter, setPaymentFilter] = useState("");
  const [pendingDelete, setPendingDelete] = useState(null);
  const [editingAppointment, setEditingAppointment] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const demoAppointments = useMemo(() => createDemoAppointments(), []);

  useEffect(() => {
    let mounted = true;

    listAppointments()
      .then((fetchedAppointments) => {
        if (!mounted) return;
        setAppointments(
          fetchedAppointments.length > 0 ? fetchedAppointments : demoAppointments,
        );
      })
      .catch((requestError) => {
        if (!mounted) return;

        if (isPermissionError(requestError)) {
          setAppointments(demoAppointments);
          setError("");
          return;
        }

        setAppointments(demoAppointments);
        setError("");
      })
      .finally(() => {
        if (mounted) {
          setLoading(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, [demoAppointments]);

  const doctors = useMemo(
    () =>
      Array.from(
        new Set(appointments.map((appointment) => appointment.doctor).filter(Boolean)),
      ),
    [appointments],
  );
  const dates = useMemo(
    () =>
      Array.from(
        new Set(appointments.map((appointment) => appointment.date).filter(Boolean)),
      ),
    [appointments],
  );

  const filteredAppointments = useMemo(() => {
    const query = search.trim();

    return appointments.filter((appointment) => {
      const matchesSearch =
        !query ||
        includesSearchText(appointment.patient, query) ||
        includesSearchText(appointment.doctor, query) ||
        includesSearchText(appointment.phone, query) ||
        includesSearchText(appointment.specialty, query);

      return (
        matchesSearch &&
        (!doctorFilter || appointment.doctor === doctorFilter) &&
        (!dateFilter || appointment.date === dateFilter) &&
        (!bookingFilter || appointment.status === bookingFilter) &&
        (!paymentFilter || appointment.payment === paymentFilter)
      );
    });
  }, [
    appointments,
    bookingFilter,
    dateFilter,
    doctorFilter,
    paymentFilter,
    search,
  ]);

  const totalPages = Math.max(1, Math.ceil(filteredAppointments.length / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const pageAppointments = filteredAppointments.slice(
    (safeCurrentPage - 1) * pageSize,
    safeCurrentPage * pageSize,
  );
  const visibleIds = pageAppointments.map((appointment) => appointment.id);
  const selectedCount = selectedIds.length;
  const allVisibleSelected =
    visibleIds.length > 0 && visibleIds.every((id) => selectedIds.includes(id));

  const resetToFirstPage = (updateValue) => {
    updateValue();
    setCurrentPage(1);
  };

  const toggleAppointment = (id) => {
    setSelectedIds((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id],
    );
  };

  const toggleAllVisible = () => {
    setSelectedIds((current) => {
      if (allVisibleSelected) {
        return current.filter((id) => !visibleIds.includes(id));
      }

      return Array.from(new Set([...current, ...visibleIds]));
    });
  };

  const removeAppointments = (ids) => {
    setAppointments((current) =>
      current.filter((appointment) => !ids.includes(appointment.id)),
    );
    setSelectedIds((current) => current.filter((id) => !ids.includes(id)));
    setPendingDelete(null);
  };

  const deleteAppointments = (ids) => {
    const apiIds = ids.filter((id) => !String(id).startsWith("demo-"));

    if (apiIds.length === 0) {
      removeAppointments(ids);
      return;
    }

    Promise.all(apiIds.map(deleteAppointment))
      .then(() => removeAppointments(ids))
      .catch(() => setPendingDelete(null));
  };

  const updateAppointment = (appointment, values) => {
    setAppointments((current) =>
      current.map((item) =>
        item.id === appointment.id
          ? { ...item, status: values.status, payment: values.payment }
          : item,
      ),
    );
    setEditingAppointment(null);

    if (!String(appointment.id).startsWith("demo-")) {
      updateAppointmentStatus(appointment.id, values.status).catch(() => {});
    }
  };

  return (
    <section className="min-h-screen bg-white text-[#333] dark:bg-[#2f2f2f] dark:text-white">
      <PageHeader />

      <main className="px-4 pb-8 pt-[24px] sm:px-6 lg:px-[38px]">
        <div className="mb-[16px] flex justify-end" dir="ltr">
          <SearchBox
            value={search}
            onChange={(value) => resetToFirstPage(() => setSearch(value))}
          />
        </div>

        {selectedCount > 0 && (
          <SelectionBar
            count={selectedCount}
            onClear={() => setSelectedIds([])}
            onDelete={() => setPendingDelete(selectedIds)}
          />
        )}

        <section className="overflow-hidden bg-white dark:bg-[#505050]">
          <div className="overflow-x-auto">
            <div className="min-w-[920px]">
              <TableHeader
                allVisibleSelected={allVisibleSelected}
                bookingFilter={bookingFilter}
                dateFilter={dateFilter}
                dates={dates}
                doctorFilter={doctorFilter}
                doctors={doctors}
                onBookingChange={(value) =>
                  resetToFirstPage(() => setBookingFilter(value))
                }
                onDateChange={(value) =>
                  resetToFirstPage(() => setDateFilter(value))
                }
                onDoctorChange={(value) =>
                  resetToFirstPage(() => setDoctorFilter(value))
                }
                onPaymentChange={(value) =>
                  resetToFirstPage(() => setPaymentFilter(value))
                }
                onToggleAll={toggleAllVisible}
                paymentFilter={paymentFilter}
              />

              {loading ? (
                <TableState text="جاري تحميل المواعيد..." />
              ) : error ? (
                <TableState text={error} />
              ) : filteredAppointments.length === 0 ? (
                <TableState text="لا يوجد مواعيد حتى الآن" />
              ) : (
                pageAppointments.map((appointment) => (
                  <AppointmentRow
                    key={appointment.id}
                    appointment={appointment}
                    selected={selectedIds.includes(appointment.id)}
                    onDelete={() => setPendingDelete([appointment.id])}
                    onEdit={() => setEditingAppointment(appointment)}
                    onToggle={() => toggleAppointment(appointment.id)}
                  />
                ))
              )}
            </div>
          </div>

          {filteredAppointments.length > 0 && (
            <Pagination
              currentPage={safeCurrentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          )}
        </section>
      </main>

      {pendingDelete && (
        <ConfirmDeleteModal
          onCancel={() => setPendingDelete(null)}
          onConfirm={() => deleteAppointments(pendingDelete)}
        />
      )}

      {editingAppointment && (
        <EditAppointmentModal
          appointment={editingAppointment}
          onCancel={() => setEditingAppointment(null)}
          onSave={(values) => updateAppointment(editingAppointment, values)}
        />
      )}
    </section>
  );
}

function PageHeader() {
  return (
    <header className="flex min-h-[118px] items-start justify-start bg-white px-4 pt-[34px] shadow-[0_1px_8px_rgba(0,0,0,0.03)] dark:bg-[#3a3a3a] sm:px-6 lg:px-[32px]">
      <div className="text-right">
        <h1 className="text-[23px] font-bold leading-[31px] text-[#333] dark:text-white">
          تفاصيل الحجوزات
        </h1>
        <p className="mt-1 text-[13px] leading-5 text-[#8a8a8a] dark:text-gray-300">
          متابعة جميع تفاصيل الحجوزات وحالات الحجز والدفع والإلغاء.
        </p>
      </div>
    </header>
  );
}

function SearchBox({ value, onChange }) {
  return (
    <label
      className="flex h-[43px] w-full items-center gap-[10px] rounded-[8px] border border-[#d7d7d7] bg-[#fbfbfb] px-[13px] text-[#9a9a9a] dark:border-white/20 dark:bg-[#454545] dark:text-gray-200 sm:w-[260px]"
      dir="ltr"
    >
      <button
        type="button"
        aria-label="مسح البحث"
        className="grid h-6 w-6 place-items-center"
        onClick={() => onChange("")}
      >
        <X size={14} strokeWidth={1.7} />
      </button>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="min-w-0 flex-1 bg-transparent text-right text-[13px] outline-none placeholder:text-[#9a9a9a]"
        placeholder="ابحث هنا..."
        dir="rtl"
      />
      <Search size={17} strokeWidth={1.7} />
    </label>
  );
}

function SelectionBar({ count, onClear, onDelete }) {
  return (
    <div className="mb-[16px] flex h-[58px] items-center justify-between rounded-[8px] border border-[#d8eef5] bg-[#f5fcff] px-[18px] dark:border-cyan-400/25 dark:bg-cyan-400/10">
      <p className="text-[13px] font-semibold text-[#333] dark:text-white">
        تم تحديد {count} من العناصر
      </p>

      <div className="flex items-center gap-[18px]" dir="ltr">
        <button
          type="button"
          aria-label="إلغاء التحديد"
          className="grid h-[32px] w-[32px] place-items-center text-[#222] dark:text-white"
          onClick={onClear}
        >
          <X size={20} strokeWidth={1.8} />
        </button>
        <button
          type="button"
          className="flex h-[32px] items-center gap-[10px] rounded-[8px] border border-[#ff2626] px-[14px] text-[12px] font-semibold text-[#ff2626]"
          onClick={onDelete}
        >
          <span>حذف المحدد</span>
          <Trash2 size={16} strokeWidth={1.8} />
        </button>
      </div>
    </div>
  );
}

function TableHeader({
  allVisibleSelected,
  bookingFilter,
  dateFilter,
  dates,
  doctorFilter,
  doctors,
  onBookingChange,
  onDateChange,
  onDoctorChange,
  onPaymentChange,
  onToggleAll,
  paymentFilter,
}) {
  return (
    <div
      className="grid h-[42px] grid-cols-[48px_1.15fr_1.15fr_1.45fr_1fr_1fr_76px] items-center bg-[#f7f7f7] text-[12px] font-medium text-[#333] dark:bg-[#444] dark:text-white"
      dir="rtl"
    >
      <div className="flex justify-center">
        <Checkbox checked={allVisibleSelected} onClick={onToggleAll} />
      </div>
      <span className="text-center">المريض</span>
      <FilterSelect value={doctorFilter} onChange={onDoctorChange} label="الطبيب">
        <option value="">الطبيب</option>
        {doctors.map((doctor) => (
          <option key={doctor} value={doctor}>
            {doctor}
          </option>
        ))}
      </FilterSelect>
      <FilterSelect
        value={dateFilter}
        onChange={onDateChange}
        label="التاريخ والوقت"
      >
        <option value="">التاريخ والوقت</option>
        {dates.map((date) => (
          <option key={date} value={date}>
            {formatDateOnly(date)}
          </option>
        ))}
      </FilterSelect>
      <FilterSelect
        value={bookingFilter}
        onChange={onBookingChange}
        label="حالة الحجز"
      >
        <option value="">حالة الحجز</option>
        {Object.entries(bookingStatusLabels).map(([value, label]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </FilterSelect>
      <FilterSelect
        value={paymentFilter}
        onChange={onPaymentChange}
        label="حالة الدفع"
      >
        <option value="">حالة الدفع</option>
        {Object.entries(paymentStatusLabels).map(([value, label]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </FilterSelect>
      <span />
    </div>
  );
}

function FilterSelect({ value, onChange, label, children }) {
  return (
    <CustomSelect
      value={value}
      onChange={onChange}
      displayLabel={label}
      className="h-full"
      buttonClassName="relative flex h-full w-full items-center justify-center bg-transparent px-0 text-[12px] font-medium text-[#333] outline-none dark:text-white [&>span]:flex-none [&>span]:text-center [&>svg]:absolute [&>svg]:left-[16px] [&>svg]:h-[14px] [&>svg]:w-[14px]"
      menuClassName="rounded-[9px] p-1.5 text-[12px]"
    >
      {children}
    </CustomSelect>
  );
}

function AppointmentRow({ appointment, selected, onDelete, onEdit, onToggle }) {
  return (
    <div
      className={`grid h-[40px] grid-cols-[48px_1.15fr_1.15fr_1.45fr_1fr_1fr_76px] items-center border-b border-[#e8e8e8] text-[11px] text-[#2f2f2f] transition dark:border-white/15 dark:text-white ${
        selected ? "bg-[#eeeeee] dark:bg-white/10" : "bg-white dark:bg-[#505050]"
      }`}
      dir="rtl"
    >
      <div className="flex justify-center">
        <Checkbox checked={selected} onClick={onToggle} />
      </div>
      <span className="truncate px-2 text-center">{appointment.patient}</span>
      <span className="truncate px-2 text-center">{appointment.doctor}</span>
      <span className="truncate px-2 text-center">
        {formatAppointmentDate(appointment.date, appointment.time)}
      </span>
      <div className="flex justify-center">
        <StatusBadge value={appointment.status} labels={bookingStatusLabels} />
      </div>
      <div className="flex justify-center">
        <StatusBadge value={appointment.payment} labels={paymentStatusLabels} />
      </div>
      <div className="flex items-center justify-center gap-3" dir="ltr">
        <button
          type="button"
          aria-label="تعديل"
          className="text-[#333] transition hover:text-[#24b9d6] dark:text-white"
          onClick={onEdit}
        >
          <Pencil size={16} strokeWidth={1.7} />
        </button>
        <button
          type="button"
          aria-label="حذف"
          className="text-[#333] transition hover:text-[#ff2626] dark:text-white"
          onClick={onDelete}
        >
          <Trash2 size={16} strokeWidth={1.7} />
        </button>
      </div>
    </div>
  );
}

function Checkbox({ checked, onClick }) {
  return (
    <button
      type="button"
      aria-pressed={checked}
      className={`grid h-[16px] w-[16px] place-items-center rounded-[3px] border text-[10px] font-bold leading-none ${
        checked
          ? "border-[#43bfd1] bg-[#43bfd1] text-white"
          : "border-[#999] bg-transparent"
      }`}
      onClick={onClick}
    >
      {checked ? "✓" : ""}
    </button>
  );
}

function StatusBadge({ value, labels }) {
  return (
    <span
      className={`rounded-[5px] px-[7px] py-[4px] text-[9px] font-medium ${
        badgeStyles[value] || badgeStyles.pending
      }`}
    >
      {labels[value] || "غير محدد"}
    </span>
  );
}

function TableState({ text }) {
  return (
    <div className="grid min-h-[460px] place-items-center text-[15px] font-medium text-black dark:text-white">
      {text}
    </div>
  );
}

function Pagination({ currentPage, totalPages, onPageChange }) {
  const pages = getPaginationPages(currentPage, totalPages);

  return (
    <div className="flex h-[68px] items-center justify-center gap-[18px] text-[12px] font-bold text-[#333] dark:text-white">
      <button
        type="button"
        aria-label="الصفحة الأولى"
        disabled={currentPage === 1}
        className="disabled:opacity-30"
        onClick={() => onPageChange(1)}
      >
        <ChevronsRight size={15} strokeWidth={1.7} />
      </button>
      <button
        type="button"
        aria-label="الصفحة السابقة"
        disabled={currentPage === 1}
        className="disabled:opacity-30"
        onClick={() => onPageChange(currentPage - 1)}
      >
        <ChevronRight size={15} strokeWidth={1.7} />
      </button>

      {pages.map((page) =>
        page === "ellipsis" ? (
          <span key="ellipsis">...</span>
        ) : (
          <button
            key={page}
            type="button"
            className={`grid h-[22px] w-[22px] place-items-center rounded-full ${
              page === currentPage ? "bg-[#38bfd7] text-white" : ""
            }`}
            onClick={() => onPageChange(page)}
          >
            {page}
          </button>
        ),
      )}

      <button
        type="button"
        aria-label="الصفحة التالية"
        disabled={currentPage === totalPages}
        className="disabled:opacity-30"
        onClick={() => onPageChange(currentPage + 1)}
      >
        <ChevronLeft size={15} strokeWidth={1.7} />
      </button>
      <button
        type="button"
        aria-label="الصفحة الأخيرة"
        disabled={currentPage === totalPages}
        className="disabled:opacity-30"
        onClick={() => onPageChange(totalPages)}
      >
        <ChevronsLeft size={15} strokeWidth={1.7} />
      </button>
    </div>
  );
}

function getPaginationPages(currentPage, totalPages) {
  if (totalPages <= 5) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  if (currentPage <= 4) return [1, 2, 3, 4, "ellipsis", totalPages];
  return [1, "ellipsis", currentPage - 1, currentPage, currentPage + 1, totalPages]
    .filter((page) => page === "ellipsis" || (page >= 1 && page <= totalPages))
    .filter((page, index, items) => page === "ellipsis" || items.indexOf(page) === index);
}

function ConfirmDeleteModal({ onCancel, onConfirm }) {
  return (
    <div className="fixed inset-0 z-[90] grid place-items-center bg-black/20 p-4">
      <div className="w-full max-w-[348px] rounded-[9px] bg-white px-[24px] pb-[16px] pt-[30px] text-center shadow-[0_12px_35px_rgba(0,0,0,0.16)] dark:bg-[#3f3f3f]">
        <div className="mx-auto grid h-[50px] w-[50px] place-items-center rounded-full bg-[#c92626] text-[36px] font-bold leading-none text-white">
          !
        </div>
        <h2 className="mt-[23px] text-[18px] font-bold leading-7 text-[#c92626]">
          هل أنت متأكد من حذف هذا العنصر
        </h2>
        <div className="mt-[15px] grid grid-cols-2 gap-[7px]" dir="ltr">
          <button
            type="button"
            className="h-[38px] rounded-[8px] border border-[#ff3030] text-[12px] font-semibold text-[#ff3030]"
            onClick={onConfirm}
          >
            نعم
          </button>
          <button
            type="button"
            className="h-[38px] rounded-[8px] bg-gradient-to-l from-[#67d2cb] to-[#0fb8e8] text-[12px] font-semibold text-white"
            onClick={onCancel}
          >
            لا
          </button>
        </div>
      </div>
    </div>
  );
}

function EditAppointmentModal({ appointment, onCancel, onSave }) {
  const initialStatus = appointment.status || "confirmed";
  const initialPayment = appointment.payment || "paid";
  const [status, setStatus] = useState(initialStatus);
  const [payment, setPayment] = useState(initialPayment);
  const hasChanges = status !== initialStatus || payment !== initialPayment;

  return (
    <div className="fixed inset-0 z-[90] grid place-items-center bg-black/20 p-4">
      <div
        className="w-full max-w-[382px] rounded-[8px] bg-white p-[22px] shadow-[0_12px_35px_rgba(0,0,0,0.16)] dark:bg-[#3f3f3f]"
        dir="rtl"
      >
        <h2 className="text-center text-[16px] font-bold text-[#333] dark:text-white">
          تغيير حالة الدفع والحجز
        </h2>

        <label className="mt-5 block">
          <span className="mb-2 block text-[12px] font-bold text-[#333] dark:text-white">
            حالة الحجز
          </span>
          <CustomSelect
            value={status}
            onChange={setStatus}
            displayLabel={bookingStatusLabels[status]}
            buttonClassName="flex h-[42px] w-full items-center gap-2 rounded-[8px] border border-transparent bg-[#f0f0f0] px-3 text-[12px] font-bold text-[#333] outline-none transition focus:border-[#25b9d6] dark:bg-[#454545] dark:text-white"
            menuClassName="rounded-[9px] p-1.5 text-[12px]"
          >
            {Object.entries(bookingStatusLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </CustomSelect>
        </label>

        <label className="mt-4 block">
          <span className="mb-2 block text-[12px] font-bold text-[#333] dark:text-white">
            حالة الدفع
          </span>
          <CustomSelect
            value={payment}
            onChange={setPayment}
            displayLabel={paymentStatusLabels[payment]}
            buttonClassName="flex h-[42px] w-full items-center gap-2 rounded-[8px] border border-transparent bg-[#f0f0f0] px-3 text-[12px] font-bold text-[#333] outline-none transition focus:border-[#25b9d6] dark:bg-[#454545] dark:text-white"
            menuClassName="rounded-[9px] p-1.5 text-[12px]"
          >
            {Object.entries(paymentStatusLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </CustomSelect>
        </label>

        <div className="mt-5 grid grid-cols-2 gap-[10px]" dir="ltr">
          <button
            type="button"
            disabled={!hasChanges}
            className="h-[36px] rounded-[8px] bg-gradient-to-l from-[#67d2cb] to-[#0fb8e8] text-[12px] font-semibold text-white transition disabled:cursor-not-allowed disabled:bg-none disabled:bg-[#bdbdbd] disabled:text-white disabled:shadow-none"
            onClick={() => onSave({ status, payment })}
          >
            حفظ التغييرات
          </button>
          <button
            type="button"
            className="h-[36px] rounded-[8px] border border-[#0fb8e8] text-[12px] font-semibold text-[#12aee0]"
            onClick={onCancel}
          >
            إلغاء
          </button>
        </div>
      </div>
    </div>
  );
}

function formatAppointmentDate(date, time) {
  return `${formatDateOnly(date)} - ${formatAppointmentTime(time)}`;
}

function formatDateOnly(date) {
  if (!date) return "";

  const [year, month, day] = date.split("-").map(Number);
  if (!year || !month || !day) return date;

  return `${day} ${arabicMonths[month - 1]} ${year}`;
}

function formatAppointmentTime(time) {
  if (!time) return "";

  const timeMatch = /^(\d{1,2}):(\d{2})$/.exec(time);
  if (timeMatch) {
    const hour24 = Number(timeMatch[1]);
    const hour12 = hour24 % 12 || 12;
    const period = hour24 >= 12 ? "مساءا" : "صباحا";

    return `${hour12}:${timeMatch[2]} ${period}`;
  }

  return time.replace(" ص", " صباحا").replace(" م", " مساءا");
}
