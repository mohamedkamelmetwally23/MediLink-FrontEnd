import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Search,
  Trash2,
  X,
} from "lucide-react";
import CustomSelect from "../../../components/admin/CustomSelect";
import {
  deleteAppointment,
  listAppointments,
} from "../../../services/medilinkApi";

const pageSize = 10;

const bookingStatusLabels = {
  confirmed: "تم التأكيد",
  pending: "في انتظار تأكيد",
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

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [search, setSearch] = useState("");
  const [doctorFilter, setDoctorFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [bookingFilter, setBookingFilter] = useState("");
  const [paymentFilter, setPaymentFilter] = useState("");
  const [pendingDelete, setPendingDelete] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    listAppointments()
      .then((fetchedAppointments) => {
        if (mounted) {
          setAppointments(fetchedAppointments);
        }
      })
      .catch((requestError) => {
        if (mounted) {
          setError(requestError.message || "تعذر تحميل المواعيد");
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
  }, []);

  const doctors = useMemo(
    () => Array.from(new Set(appointments.map((appointment) => appointment.doctor))),
    [appointments],
  );

  const dates = useMemo(
    () => Array.from(new Set(appointments.map((appointment) => appointment.date))),
    [appointments],
  );

  const filteredAppointments = useMemo(() => {
    const query = search.trim();

    return appointments.filter((appointment) => {
      const matchesSearch =
        !query ||
        appointment.patient.includes(query) ||
        appointment.doctor.includes(query) ||
        appointment.phone.includes(query) ||
        appointment.specialty.includes(query);

      return (
        matchesSearch &&
        (!doctorFilter || appointment.doctor === doctorFilter) &&
        (!dateFilter || appointment.date === dateFilter) &&
        (!bookingFilter || appointment.status === bookingFilter) &&
        (!paymentFilter || appointment.payment === paymentFilter)
      );
    });
  }, [appointments, search, doctorFilter, dateFilter, bookingFilter, paymentFilter]);

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

  const deleteAppointments = (ids) => {
    const apiIds = ids.filter((id) => String(id).length > 12);
    const removeFromState = () => {
      setAppointments((current) =>
        current.filter((appointment) => !ids.includes(appointment.id)),
      );
      setSelectedIds((current) => current.filter((id) => !ids.includes(id)));
      setPendingDelete(null);
    };

    if (apiIds.length === 0) {
      removeFromState();
      return;
    }

    Promise.all(apiIds.map(deleteAppointment))
      .then(removeFromState)
      .catch(() => setPendingDelete(null));
  };

  return (
    <section className="min-h-screen bg-white text-[#333] dark:bg-[#2f2f2f] dark:text-white">
      <PageHeader />

      <main className="px-4 pb-8 pt-[28px] sm:px-6 lg:px-[38px]">
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
            <div className="min-w-[1040px]">
              <TableHeader
                allVisibleSelected={allVisibleSelected}
                onToggleAll={toggleAllVisible}
                doctorFilter={doctorFilter}
                dateFilter={dateFilter}
                bookingFilter={bookingFilter}
                paymentFilter={paymentFilter}
                doctors={doctors}
                dates={dates}
                onDoctorChange={(value) =>
                  resetToFirstPage(() => setDoctorFilter(value))
                }
                onDateChange={(value) =>
                  resetToFirstPage(() => setDateFilter(value))
                }
                onBookingChange={(value) =>
                  resetToFirstPage(() => setBookingFilter(value))
                }
                onPaymentChange={(value) =>
                  resetToFirstPage(() => setPaymentFilter(value))
                }
              />

              {loading ? (
                <TableState text="جاري تحميل المواعيد..." />
              ) : error ? (
                <TableState text={error} />
              ) : filteredAppointments.length === 0 ? (
                <TableState text="لا يوجد مواعيد في قاعدة البيانات حتى الآن" />
              ) : (
                pageAppointments.map((appointment) => (
                  <AppointmentRow
                    key={appointment.id}
                    appointment={appointment}
                    selected={selectedIds.includes(appointment.id)}
                    onToggle={() => toggleAppointment(appointment.id)}
                    onDelete={() => setPendingDelete([appointment.id])}
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
    </section>
  );
}

function PageHeader() {
  return (
    <header className="flex min-h-[120px] items-start justify-start bg-white px-4 pt-[38px] shadow-[0_1px_8px_rgba(0,0,0,0.03)] dark:bg-[#3a3a3a] sm:px-6 lg:px-[32px]">
      <div className="text-right">
        <h1 className="text-[26px] font-bold leading-[31px] text-[#333] dark:text-white">
          المواعيد
        </h1>
        <p className="mt-1 text-[16px] leading-5 text-[#8a8a8a] dark:text-gray-300">
          متابعة جميع المواعيد وحالات الحجز والدفع والإلغاء.
        </p>
      </div>
    </header>
  );
}

function SearchBox({ value, onChange }) {
  return (
    <label
      className="flex h-[52px] w-full items-center gap-[12px] rounded-[12px] border border-[#d7d7d7] bg-[#fbfbfb] px-[16px] text-[#9a9a9a] dark:border-white/20 dark:bg-[#454545] dark:text-gray-200 sm:w-[260px]"
      dir="ltr"
    >
      <button
        type="button"
        aria-label="مسح البحث"
        className="grid h-6 w-6 place-items-center"
        onClick={() => onChange("")}
      >
        <X size={16} strokeWidth={1.6} />
      </button>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="min-w-0 flex-1 bg-transparent text-right text-[15px] outline-none placeholder:text-[#9a9a9a]"
        placeholder="إبحث هنا..."
        dir="rtl"
      />
      <Search size={20} strokeWidth={1.7} />
    </label>
  );
}

function SelectionBar({ count, onClear, onDelete }) {
  return (
    <div className="mb-[16px] flex h-[70px] items-center justify-between rounded-[9px] border border-[#d8eef5] bg-[#f5fcff] px-[32px] dark:border-cyan-400/25 dark:bg-cyan-400/10">
      <p className="text-[17px] font-semibold text-[#333] dark:text-white">
        تم تحديد {count} من العناصر
      </p>

      <div className="flex items-center gap-[24px]" dir="ltr">
        <button
          type="button"
          aria-label="إلغاء التحديد"
          className="grid h-[36px] w-[36px] place-items-center text-[#222] dark:text-white"
          onClick={onClear}
        >
          <X size={26} strokeWidth={1.8} />
        </button>
        <button
          type="button"
          className="flex h-[40px] items-center gap-[16px] rounded-[11px] border border-[#ff2626] px-[18px] text-[16px] font-semibold text-[#ff2626]"
          onClick={onDelete}
        >
          <span>حذف المحدد</span>
          <Trash2 size={22} strokeWidth={1.8} />
        </button>
      </div>
    </div>
  );
}

function TableHeader({
  allVisibleSelected,
  onToggleAll,
  doctorFilter,
  dateFilter,
  bookingFilter,
  paymentFilter,
  doctors,
  dates,
  onDoctorChange,
  onDateChange,
  onBookingChange,
  onPaymentChange,
}) {
  return (
    <div className="grid h-[56px] grid-cols-[64px_1.25fr_1.15fr_1.45fr_1fr_1fr_64px_48px] items-center bg-[#f7f7f7] text-[17px] font-medium text-[#333] dark:bg-[#444] dark:text-white">
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
      buttonClassName="relative flex h-full w-full items-center justify-center bg-transparent px-0 text-[17px] font-medium text-[#333] outline-none dark:text-white [&>span]:flex-none [&>span]:text-center [&>svg]:absolute [&>svg]:left-[18px]"
    >
      {children}
    </CustomSelect>
  );
}

function AppointmentRow({ appointment, selected, onToggle, onDelete }) {
  return (
    <div
      className={`grid h-[56px] grid-cols-[64px_1.25fr_1.15fr_1.45fr_1fr_1fr_64px_48px] items-center border-b border-[#dddddd] text-[17px] text-[#2f2f2f] transition dark:border-white/15 dark:text-white ${
        selected ? "bg-[#eeeeee] dark:bg-white/10" : "bg-white dark:bg-[#505050]"
      }`}
    >
      <div className="flex justify-center">
        <Checkbox checked={selected} onClick={onToggle} />
      </div>
      <span className="truncate text-center">{appointment.patient}</span>
      <span className="truncate text-center">{appointment.doctor}</span>
      <span className="truncate text-center">
        {formatAppointmentDate(appointment.date, appointment.time)}
      </span>
      <div className="flex justify-center">
        <StatusBadge value={appointment.status} labels={bookingStatusLabels} />
      </div>
      <div className="flex justify-center">
        <StatusBadge value={appointment.payment} labels={paymentStatusLabels} />
      </div>
      <div className="flex justify-center">
        <button
          type="button"
          aria-label="حذف الموعد"
          className="text-[#333] dark:text-white"
          onClick={onDelete}
        >
          <Trash2 size={24} strokeWidth={1.8} />
        </button>
      </div>
      <Link
        to={getPatientProfilePath(appointment)}
        aria-label={`عرض ملف ${appointment.patient}`}
        className="grid h-full place-items-center text-[#333] dark:text-white"
      >
        <ChevronLeft size={23} strokeWidth={1.7} />
      </Link>
    </div>
  );
}

function getPatientProfilePath(appointment) {
  const params = new URLSearchParams({
    name: appointment.patient,
    phone: appointment.phone,
    role: "patient",
    status: "active",
  });

  return `/admin/users/profile?${params.toString()}`;
}

function Checkbox({ checked, onClick }) {
  return (
    <button
      type="button"
      aria-pressed={checked}
      className={`grid h-[20px] w-[20px] place-items-center rounded-[4px] border text-[14px] font-bold leading-none ${
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
      className={`rounded-[7px] px-[7px] py-[5px] text-[10px] font-medium ${
        badgeStyles[value] || badgeStyles.pending
      }`}
    >
      {labels[value]}
    </span>
  );
}

function TableState({ text }) {
  return (
    <div className="grid min-h-[620px] place-items-center text-[22px] font-medium text-black dark:text-white">
      {text}
    </div>
  );
}

function Pagination({ currentPage, totalPages, onPageChange }) {
  const pages = getPaginationPages(currentPage, totalPages);

  return (
    <div className="flex h-[79px] items-center justify-center gap-[25px] text-[16px] font-bold text-[#333] dark:text-white">
      <button
        type="button"
        aria-label="الصفحة الأولى"
        disabled={currentPage === 1}
        className="disabled:opacity-30"
        onClick={() => onPageChange(1)}
      >
        <ChevronsRight size={18} strokeWidth={1.7} />
      </button>
      <button
        type="button"
        aria-label="الصفحة السابقة"
        disabled={currentPage === 1}
        className="disabled:opacity-30"
        onClick={() => onPageChange(currentPage - 1)}
      >
        <ChevronRight size={18} strokeWidth={1.7} />
      </button>

      {pages.map((page) =>
        page === "ellipsis" ? (
          <span key="ellipsis">...</span>
        ) : (
          <button
            key={page}
            type="button"
            className={`grid h-[28px] w-[28px] place-items-center rounded-full ${
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
        <ChevronLeft size={18} strokeWidth={1.7} />
      </button>
      <button
        type="button"
        aria-label="الصفحة الأخيرة"
        disabled={currentPage === totalPages}
        className="disabled:opacity-30"
        onClick={() => onPageChange(totalPages)}
      >
        <ChevronsLeft size={18} strokeWidth={1.7} />
      </button>
    </div>
  );
}

function getPaginationPages(currentPage, totalPages) {
  if (totalPages <= 5) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  return [1, 2, 3, 4, "ellipsis", totalPages].filter((page, index, items) => {
    if (page === "ellipsis") return true;
    return items.indexOf(page) === index;
  });
}

function ConfirmDeleteModal({ onCancel, onConfirm }) {
  return (
    <div className="fixed inset-0 z-[80] grid place-items-center bg-black/20 p-4">
      <div className="w-full max-w-[348px] rounded-[9px] bg-white px-[24px] pb-[16px] pt-[30px] text-center shadow-[0_12px_35px_rgba(0,0,0,0.16)] dark:bg-[#3f3f3f]">
        <div className="mx-auto grid h-[50px] w-[50px] place-items-center rounded-full bg-[#c92626] text-[36px] font-bold leading-none text-white">
          !
        </div>
        <h2 className="mt-[23px] text-[21px] font-bold leading-7 text-[#c92626]">
          هل أنت متأكد من حذف هذا العنصر
        </h2>
        <div className="mt-[15px] grid grid-cols-2 gap-[7px]" dir="ltr">
          <button
            type="button"
            className="h-[43px] rounded-[8px] border border-[#0fb8e8] text-[13px] font-semibold text-[#12aee0]"
            onClick={onConfirm}
          >
            نعم
          </button>
          <button
            type="button"
            className="h-[43px] rounded-[8px] bg-gradient-to-l from-[#67d2cb] to-[#0fb8e8] text-[13px] font-semibold text-white"
            onClick={onCancel}
          >
            لا
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
