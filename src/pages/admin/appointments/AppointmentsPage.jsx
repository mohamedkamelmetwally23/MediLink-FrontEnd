import { useMemo, useState } from "react";
import {
  CalendarDays,
  Check,
  ChevronsLeft,
  Search,
  Trash2,
  X,
} from "lucide-react";
import {
  ArrowButton,
  ArrowGlyph,
  arrowButtonClass,
} from "../../../components/ui/ArrowButton";

const pageSize = 8;

const initialAppointments = [
  {
    id: 1,
    patient: "محمد حسن",
    doctor: "د. مروة خالد",
    specialty: "أسنان",
    phone: "01237652086",
    date: "2026-06-11",
    time: "9:30 ص",
    status: "confirmed",
    payment: "مدفوع",
  },
  {
    id: 2,
    patient: "سلمى حمدي",
    doctor: "د. ماهر طاهر",
    specialty: "باطنة",
    phone: "01127652086",
    date: "2026-06-11",
    time: "10:00 ص",
    status: "pending",
    payment: "غير مدفوع",
  },
  {
    id: 3,
    patient: "علي يوسف",
    doctor: "د. سارة هيثم",
    specialty: "أطفال",
    phone: "01037652086",
    date: "2026-06-12",
    time: "11:30 ص",
    status: "confirmed",
    payment: "مدفوع",
  },
  {
    id: 4,
    patient: "حمد شعبان",
    doctor: "د. أماني الظريف",
    specialty: "جلدية",
    phone: "01537652086",
    date: "2026-06-12",
    time: "12:00 م",
    status: "cancelled",
    payment: "مسترد",
  },
  {
    id: 5,
    patient: "نور باسم",
    doctor: "د. مروة خالد",
    specialty: "أسنان",
    phone: "01287652086",
    date: "2026-06-13",
    time: "1:00 م",
    status: "pending",
    payment: "غير مدفوع",
  },
  {
    id: 6,
    patient: "بسملة خالد",
    doctor: "د. ماهر طاهر",
    specialty: "باطنة",
    phone: "01233652086",
    date: "2026-06-13",
    time: "2:30 م",
    status: "confirmed",
    payment: "مدفوع",
  },
  {
    id: 7,
    patient: "محمود ناصر",
    doctor: "د. سارة هيثم",
    specialty: "أطفال",
    phone: "01097652086",
    date: "2026-06-14",
    time: "4:00 م",
    status: "completed",
    payment: "مدفوع",
  },
  {
    id: 8,
    patient: "هدى سمير",
    doctor: "د. أماني الظريف",
    specialty: "جلدية",
    phone: "01187652086",
    date: "2026-06-14",
    time: "5:00 م",
    status: "confirmed",
    payment: "مدفوع",
  },
  {
    id: 9,
    patient: "أحمد شريف",
    doctor: "د. مروة خالد",
    specialty: "أسنان",
    phone: "01587652086",
    date: "2026-06-15",
    time: "6:00 م",
    status: "pending",
    payment: "غير مدفوع",
  },
];

const statusLabels = {
  all: "كل الحالات",
  confirmed: "مؤكد",
  pending: "قيد الانتظار",
  completed: "مكتمل",
  cancelled: "ملغي",
};

const statusStyles = {
  confirmed: "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15",
  pending: "bg-amber-50 text-amber-600 dark:bg-amber-500/15",
  completed: "bg-sky-50 text-sky-600 dark:bg-sky-500/15",
  cancelled: "bg-red-50 text-red-500 dark:bg-red-500/15",
};

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState(initialAppointments);
  const [selectedIds, setSelectedIds] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [pendingDelete, setPendingDelete] = useState(null);

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
        (statusFilter === "all" || appointment.status === statusFilter)
      );
    });
  }, [appointments, search, statusFilter]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredAppointments.length / pageSize),
  );
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const pageAppointments = filteredAppointments.slice(
    (safeCurrentPage - 1) * pageSize,
    safeCurrentPage * pageSize,
  );
  const visibleIds = pageAppointments.map((appointment) => appointment.id);
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
    setAppointments((current) =>
      current.filter((appointment) => !ids.includes(appointment.id)),
    );
    setSelectedIds((current) => current.filter((id) => !ids.includes(id)));
    setPendingDelete(null);
  };

  return (
    <section>
      <header className="flex min-h-[120px] items-end justify-start bg-white px-6 pb-8 shadow-sm dark:bg-[#3a3a3a] lg:px-8">
        <div className="text-right">
          <h1 className="text-2xl font-bold lg:text-3xl">المواعيد</h1>
          <p className="mt-3 text-sm text-gray-500 dark:text-gray-300">
            متابعة حجوزات المرضى وإدارة حالة كل موعد داخل العيادة.
          </p>
        </div>
      </header>

      <div className="p-4 sm:p-6 lg:p-8">
        <AppointmentsToolbar
          search={search}
          statusFilter={statusFilter}
          onSearchChange={(value) => resetToFirstPage(() => setSearch(value))}
          onStatusChange={(value) =>
            resetToFirstPage(() => setStatusFilter(value))
          }
        />

        {selectedIds.length > 0 && (
          <div className="mb-4 flex flex-col gap-3 rounded-xl border border-cyan-200 bg-cyan-50 p-4 text-cyan-900 dark:border-cyan-500/40 dark:bg-cyan-500/10 dark:text-cyan-100 sm:flex-row sm:items-center sm:justify-between">
            <span className="font-semibold">
              تم تحديد {selectedIds.length} موعد
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                className="rounded-lg bg-red-500 px-4 py-2 text-sm font-semibold text-white"
                onClick={() => setPendingDelete(selectedIds)}
              >
                حذف المحدد
              </button>
              <button
                type="button"
                className="rounded-lg border border-cyan-300 px-4 py-2 text-sm font-semibold"
                onClick={() => setSelectedIds([])}
              >
                إلغاء التحديد
              </button>
            </div>
          </div>
        )}

        <div className="overflow-hidden rounded-xl bg-white shadow-[0_0_20px_rgba(0,0,0,0.06)] dark:bg-[#3b3b3b]">
          {filteredAppointments.length === 0 ? (
            <AppointmentsEmptyState />
          ) : (
            <>
              <AppointmentsTable
                appointments={pageAppointments}
                selectedIds={selectedIds}
                allVisibleSelected={allVisibleSelected}
                onToggleAllVisible={toggleAllVisible}
                onToggleAppointment={toggleAppointment}
                onDeleteAppointment={(id) => setPendingDelete([id])}
              />

              <AppointmentsPagination
                currentPage={safeCurrentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </>
          )}
        </div>
      </div>

      {pendingDelete && (
        <ConfirmAppointmentDeleteModal
          count={pendingDelete.length}
          onCancel={() => setPendingDelete(null)}
          onConfirm={() => deleteAppointments(pendingDelete)}
        />
      )}
    </section>
  );
}

function AppointmentsToolbar({
  search,
  statusFilter,
  onSearchChange,
  onStatusChange,
}) {
  return (
    <div className="mb-4 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      <label className="flex h-[52px] w-full items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 text-gray-500 dark:border-white/30 dark:bg-[#454545] dark:text-gray-200 lg:w-[310px]">
        <Search size={20} />
        <input
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          className="w-full bg-transparent outline-none"
          placeholder="ابحث هنا..."
        />
        {search && (
          <button
            type="button"
            aria-label="مسح البحث"
            onClick={() => onSearchChange("")}
          >
            <X size={16} />
          </button>
        )}
      </label>

      <select
        value={statusFilter}
        onChange={(event) => onStatusChange(event.target.value)}
        className="h-[52px] rounded-xl border border-gray-200 bg-white px-4 outline-none dark:border-white/30 dark:bg-[#454545]"
      >
        {Object.entries(statusLabels).map(([value, label]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>
    </div>
  );
}

function AppointmentsEmptyState() {
  return (
    <div className="grid min-h-[430px] place-items-center px-6 py-12 text-center">
      <div>
        <div className="mx-auto mb-5 grid h-16 w-16 place-items-center rounded-full bg-cyan-50 text-cyan-500 dark:bg-cyan-500/10">
          <CalendarDays size={34} />
        </div>
        <h2 className="text-lg font-bold">لا يوجد مواعيد حتى الآن</h2>
      </div>
    </div>
  );
}

function AppointmentsTable({
  appointments,
  selectedIds,
  allVisibleSelected,
  onToggleAllVisible,
  onToggleAppointment,
  onDeleteAppointment,
}) {
  return (
    <div className="overflow-x-auto">
      <div className="min-w-[980px]">
        <div className="grid grid-cols-[58px_1.2fr_1.1fr_1fr_1fr_1fr_1fr_90px] items-center bg-[#f5f5f5] px-6 py-4 font-semibold dark:bg-[#4a4a4a]">
          <SelectBox
            checked={allVisibleSelected}
            ariaLabel="تحديد كل المواعيد في الصفحة الحالية"
            onChange={onToggleAllVisible}
          />
          <span>اسم المريض</span>
          <span>الطبيب</span>
          <span>التخصص</span>
          <span>التاريخ</span>
          <span>الوقت</span>
          <span>الحالة</span>
          <span />
        </div>

        {appointments.map((appointment) => {
          const selected = selectedIds.includes(appointment.id);

          return (
            <div
              key={appointment.id}
              className={`grid grid-cols-[58px_1.2fr_1.1fr_1fr_1fr_1fr_1fr_90px] items-center border-b border-gray-200 px-6 py-4 transition dark:border-white/20 ${
                selected ? "bg-cyan-50 dark:bg-cyan-500/10" : ""
              }`}
            >
              <SelectBox
                checked={selected}
                ariaLabel={`تحديد موعد ${appointment.patient}`}
                onChange={() => onToggleAppointment(appointment.id)}
              />
              <div>
                <span className="block font-semibold">
                  {appointment.patient}
                </span>
                <span
                  dir="ltr"
                  className="block text-right text-xs text-gray-400"
                >
                  {appointment.phone}
                </span>
              </div>
              <span>{appointment.doctor}</span>
              <span>{appointment.specialty}</span>
              <span dir="ltr" className="text-right">
                {appointment.date}
              </span>
              <span>{appointment.time}</span>
              <StatusBadge status={appointment.status} />
              <div className="flex items-center justify-end gap-3">
                <button
                  type="button"
                  aria-label="حذف الموعد"
                  onClick={() => onDeleteAppointment(appointment.id)}
                >
                  <Trash2 size={21} className="text-red-600" />
                </button>
                <ArrowButton className={arrowButtonClass} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  return (
    <span
      className={`w-fit rounded-md px-3 py-1 text-xs font-semibold ${
        statusStyles[status] || statusStyles.pending
      }`}
    >
      {statusLabels[status]}
    </span>
  );
}

function SelectBox({ checked, onChange, ariaLabel }) {
  return (
    <button
      type="button"
      aria-label={ariaLabel}
      className={`grid h-5 w-5 place-items-center rounded border ${
        checked
          ? "border-cyan-400 bg-cyan-400 text-white"
          : "border-gray-400 bg-transparent"
      }`}
      onClick={onChange}
    >
      {checked ? <Check size={15} strokeWidth={3} /> : null}
    </button>
  );
}

function AppointmentsPagination({ currentPage, totalPages, onPageChange }) {
  const pages = Array.from({ length: totalPages }, (_, index) => index + 1);

  return (
    <div className="flex flex-wrap items-center justify-center gap-3 py-5 font-semibold">
      <button
        type="button"
        aria-label="الصفحة الأولى"
        disabled={currentPage === 1}
        className={`${arrowButtonClass} rotate-180`}
        onClick={() => onPageChange(1)}
      >
        <ChevronsLeft size={18} />
      </button>
      <button
        type="button"
        aria-label="الصفحة السابقة"
        disabled={currentPage === 1}
        className={`${arrowButtonClass} rotate-180`}
        onClick={() => onPageChange(currentPage - 1)}
      >
        <ArrowGlyph />
      </button>

      {pages.map((page) => (
        <button
          key={page}
          type="button"
          className={`grid h-8 w-8 place-items-center rounded-full ${
            page === currentPage ? "bg-cyan-400 text-white" : ""
          }`}
          onClick={() => onPageChange(page)}
        >
          {page}
        </button>
      ))}

      <button
        type="button"
        aria-label="الصفحة التالية"
        disabled={currentPage === totalPages}
        className={arrowButtonClass}
        onClick={() => onPageChange(currentPage + 1)}
      >
        <ArrowGlyph />
      </button>
      <button
        type="button"
        aria-label="الصفحة الأخيرة"
        disabled={currentPage === totalPages}
        className={arrowButtonClass}
        onClick={() => onPageChange(totalPages)}
      >
        <ChevronsLeft size={18} />
      </button>
    </div>
  );
}

function ConfirmAppointmentDeleteModal({ count, onCancel, onConfirm }) {
  return (
    <div className="fixed inset-0 z-[60] grid place-items-center bg-black/45 p-4">
      <div className="w-full max-w-[350px] rounded-xl bg-white p-6 text-center shadow-2xl dark:bg-[#454545]">
        <div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-full bg-red-700 text-3xl font-bold text-white">
          !
        </div>
        <h2 className="mb-5 text-xl font-bold text-red-700 dark:text-red-300">
          {count > 1
            ? `هل أنت متأكد من حذف ${count} مواعيد؟`
            : "هل أنت متأكد من حذف هذا الموعد؟"}
        </h2>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            className="h-11 rounded-lg border-2 border-cyan-400 font-semibold text-cyan-500"
            onClick={onConfirm}
          >
            نعم
          </button>
          <button
            type="button"
            className="h-11 rounded-lg bg-gradient-to-l from-[#67d2cb] to-[#0fb8e8] font-semibold text-white"
            onClick={onCancel}
          >
            لا
          </button>
        </div>
      </div>
    </div>
  );
}
