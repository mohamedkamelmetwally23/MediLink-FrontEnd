import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  CircleSlash,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { useUsersStore } from "../admin/users/useUsersStore";

const pageSize = 10;

const statusLabels = {
  active: "نشط",
  inactive: "غير نشط",
};

function toPatientRow(user) {
  return {
    id: user.id,
    name: user.name || `${user.firstName} ${user.lastName}`.trim(),
    phone: user.phone || "",
    casesCount: user.casesCount ?? user.appointmentsCount ?? 0,
    status: user.status || "active",
  };
}

export default function DoctorPatientsPage() {
  const { users, deleteUsers: removeUsers } = useUsersStore();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedIds, setSelectedIds] = useState([]);
  const [pendingDelete, setPendingDelete] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const patients = useMemo(
    () => users.filter((user) => user.role === "patient").map(toPatientRow),
    [users],
  );

  const filteredPatients = useMemo(() => {
    const query = search.trim();

    return patients.filter((patient) => {
      const matchesSearch =
        !query ||
        patient.name.includes(query) ||
        patient.phone.includes(query) ||
        String(patient.casesCount).includes(query);

      return matchesSearch && (!statusFilter || patient.status === statusFilter);
    });
  }, [patients, search, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredPatients.length / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const pagePatients = filteredPatients.slice(
    (safeCurrentPage - 1) * pageSize,
    safeCurrentPage * pageSize,
  );
  const visibleIds = pagePatients.map((patient) => patient.id);
  const selectedCount = selectedIds.length;
  const allVisibleSelected =
    visibleIds.length > 0 && visibleIds.every((id) => selectedIds.includes(id));

  const resetToFirstPage = (updateValue) => {
    updateValue();
    setCurrentPage(1);
  };

  const togglePatient = (id) => {
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

  const deletePatients = (ids) => {
    removeUsers(ids);
    setSelectedIds((current) => current.filter((id) => !ids.includes(id)));
    setPendingDelete(null);
  };

  return (
    <section className="min-h-screen bg-[#f8fbfc] text-[#333] dark:bg-[#2f2f2f] dark:text-white">
      <Header search={search} onSearchChange={setSearch} />

      <main className="px-4 pb-[28px] pt-[24px] sm:px-6 lg:px-[24px]">
        {selectedCount > 0 && (
          <SelectionBar
            count={selectedCount}
            onClear={() => setSelectedIds([])}
            onDelete={() => setPendingDelete(selectedIds)}
          />
        )}

        <section className="overflow-hidden rounded-[8px] bg-white shadow-[0_4px_18px_rgba(0,0,0,0.08)] dark:bg-[#505050]">
          <div className="overflow-x-auto">
            <div className="min-w-[820px]">
              <TableHeader
                allVisibleSelected={allVisibleSelected}
                onToggleAll={toggleAllVisible}
                statusFilter={statusFilter}
                onStatusChange={(value) =>
                  resetToFirstPage(() => setStatusFilter(value))
                }
              />

              {filteredPatients.length === 0 ? (
                <EmptyState />
              ) : (
                pagePatients.map((patient) => (
                  <PatientRow
                    key={patient.id}
                    patient={patient}
                    selected={selectedIds.includes(patient.id)}
                    onToggle={() => togglePatient(patient.id)}
                    onDelete={() => setPendingDelete([patient.id])}
                  />
                ))
              )}
            </div>
          </div>

          {filteredPatients.length > 0 && (
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
          onConfirm={() => deletePatients(pendingDelete)}
        />
      )}
    </section>
  );
}

function Header({ search, onSearchChange }) {
  return (
    <header className="flex min-h-[100px] flex-col gap-5 bg-white px-4 py-[20px] shadow-[0_1px_8px_rgba(0,0,0,0.03)] dark:bg-[#3a3a3a] sm:px-6 lg:flex-row lg:items-start lg:justify-between lg:px-[24px]">
      <div className="text-right">
        <h1 className="text-[20px] font-bold leading-7 text-[#333] dark:text-white">
          المرضى
        </h1>
        <p className="mt-1 text-[11px] leading-5 text-[#8a8a8a] dark:text-gray-300">
          عرض وإدارة جميع المرضى الخاصة بالعيادة.
        </p>
      </div>

      <SearchBox value={search} onChange={onSearchChange} />
    </header>
  );
}

function SearchBox({ value, onChange }) {
  return (
    <label
      className="flex h-[44px] w-full items-center gap-[10px] rounded-[8px] border border-[#d7d7d7] bg-[#fbfbfb] px-[13px] text-[#9a9a9a] dark:border-white/20 dark:bg-[#454545] dark:text-gray-200 sm:w-[280px]"
      dir="ltr"
    >
      {value && (
        <button
          type="button"
          aria-label="مسح البحث"
          className="grid h-5 w-5 place-items-center"
          onClick={() => onChange("")}
        >
          <X size={14} strokeWidth={1.7} />
        </button>
      )}
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="min-w-0 flex-1 bg-transparent text-right text-[12px] outline-none placeholder:text-[#9a9a9a]"
        placeholder="إبحث هنا..."
        dir="rtl"
      />
      <Search size={17} strokeWidth={1.7} />
    </label>
  );
}

function SelectionBar({ count, onClear, onDelete }) {
  return (
    <div className="mb-[16px] flex min-h-[48px] items-center justify-between gap-4 rounded-[7px] border border-[#d8eef5] bg-[#f8fdff] px-[18px] dark:border-cyan-400/25 dark:bg-cyan-400/10">
      <button
        type="button"
        aria-label="إلغاء التحديد"
        className="grid h-[28px] w-[28px] place-items-center text-[#6f7b80] dark:text-white"
        onClick={onClear}
      >
        <X size={18} strokeWidth={1.8} />
      </button>

      <div className="flex items-center gap-[16px]">
        <button
          type="button"
          className="flex h-[33px] items-center gap-[9px] rounded-[7px] border border-[#ff2626] px-[12px] text-[11px] font-semibold text-[#ff2626]"
          onClick={onDelete}
        >
          <Trash2 size={16} strokeWidth={1.8} />
          <span>حذف المحدد</span>
        </button>

        <p className="text-[12px] font-semibold text-[#333] dark:text-white">
          تم تحديد {count} من العناصر
        </p>
      </div>
    </div>
  );
}

function TableHeader({
  allVisibleSelected,
  onToggleAll,
  statusFilter,
  onStatusChange,
}) {
  return (
    <div className="grid h-[48px] grid-cols-[46px_1.3fr_1.15fr_0.8fr_0.8fr_84px_36px] items-center bg-[#f7f7f7] text-[12px] font-bold text-[#333] dark:bg-[#444] dark:text-white">
      <div className="flex justify-center">
        <Checkbox checked={allVisibleSelected} onClick={onToggleAll} />
      </div>
      <span className="text-center">الاسم</span>
      <span className="text-center">رقم الهاتف</span>
      <span className="text-center">عدد الزيارات</span>
      <select
        value={statusFilter}
        onChange={(event) => onStatusChange(event.target.value)}
        className="mx-auto h-[30px] w-[88px] rounded-[7px] bg-transparent text-center text-[12px] font-bold outline-none dark:bg-[#444]"
      >
        <option value="">الحالة</option>
        <option value="active">نشط</option>
        <option value="inactive">غير نشط</option>
      </select>
      <span />
      <span />
    </div>
  );
}

function PatientRow({ patient, selected, onToggle, onDelete }) {
  return (
    <div
      className={`grid h-[42px] grid-cols-[46px_1.3fr_1.15fr_0.8fr_0.8fr_84px_36px] items-center border-b border-[#eeeeee] text-[12px] text-[#333] transition dark:border-white/15 dark:text-white ${
        selected ? "bg-[#eefcff] dark:bg-cyan-400/10" : "bg-white dark:bg-[#505050]"
      }`}
    >
      <div className="flex justify-center">
        <Checkbox checked={selected} onClick={onToggle} />
      </div>
      <span className="truncate text-center font-medium">{patient.name}</span>
      <span className="truncate text-center" dir="ltr">
        {patient.phone}
      </span>
      <span className="text-center">{patient.casesCount}</span>
      <StatusBadge status={patient.status} />
      <div className="flex items-center justify-center gap-[14px]">
        <button
          type="button"
          aria-label={`تعطيل ${patient.name}`}
          className="text-[#a4a4a4] transition hover:text-[#35c0d8]"
        >
          <CircleSlash size={15} strokeWidth={1.8} />
        </button>
        <button
          type="button"
          aria-label={`حذف ${patient.name}`}
          className="text-[#a4a4a4] transition hover:text-[#ff2626]"
          onClick={onDelete}
        >
          <Trash2 size={15} strokeWidth={1.8} />
        </button>
      </div>
      <Link
        to={`/doctor/patients/${patient.id}/profile`}
        aria-label={`عرض ملف ${patient.name}`}
        className="grid h-full place-items-center text-[#333] dark:text-white"
      >
        <ChevronLeft size={17} strokeWidth={1.7} />
      </Link>
    </div>
  );
}

function Checkbox({ checked, onClick }) {
  return (
    <button
      type="button"
      aria-pressed={checked}
      className={`grid h-[16px] w-[16px] place-items-center rounded-[3px] border text-[11px] font-bold leading-none ${
        checked
          ? "border-[#43bfd1] bg-[#43bfd1] text-white"
          : "border-[#c2c2c2] bg-transparent"
      }`}
      onClick={onClick}
    >
      {checked ? "✓" : ""}
    </button>
  );
}

function StatusBadge({ status }) {
  const isActive = status === "active";

  return (
    <span
      className={`mx-auto text-[10px] font-bold ${
        isActive ? "text-[#36b320]" : "text-[#ff2020]"
      }`}
    >
      {statusLabels[status]}
    </span>
  );
}

function EmptyState() {
  return (
    <div className="grid min-h-[470px] place-items-center text-[14px] font-bold text-[#333] dark:text-white">
      لا يوجد مرضى حتى الآن
    </div>
  );
}

function Pagination({ currentPage, totalPages, onPageChange }) {
  const pages = getPaginationPages(currentPage, totalPages);

  return (
    <div className="flex h-[62px] items-center justify-center gap-[18px] text-[11px] font-bold text-[#333] dark:text-white">
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

  return [1, 2, 3, 4, "ellipsis", totalPages].filter((page, index, items) => {
    if (page === "ellipsis") return true;
    return items.indexOf(page) === index;
  });
}

function ConfirmDeleteModal({ onCancel, onConfirm }) {
  return (
    <div className="fixed inset-0 z-[80] grid place-items-center bg-black/20 p-4">
      <div className="w-full max-w-[348px] rounded-[8px] bg-white px-[24px] pb-[18px] pt-[28px] text-center shadow-[0_12px_35px_rgba(0,0,0,0.16)] dark:bg-[#3f3f3f]">
        <div className="mx-auto grid h-[44px] w-[44px] place-items-center rounded-full bg-[#c92626] text-[28px] font-bold leading-none text-white">
          !
        </div>
        <h2 className="mt-[18px] text-[17px] font-bold leading-7 text-[#c92626]">
          هل أنت متأكد من حذف هذا العنصر
        </h2>
        <div className="mt-[15px] grid grid-cols-2 gap-[8px]" dir="ltr">
          <button
            type="button"
            className="h-[39px] rounded-[7px] border border-[#0fb8e8] text-[12px] font-semibold text-[#12aee0]"
            onClick={onConfirm}
          >
            نعم
          </button>
          <button
            type="button"
            className="h-[39px] rounded-[7px] bg-gradient-to-l from-[#67d2cb] to-[#0fb8e8] text-[12px] font-semibold text-white"
            onClick={onCancel}
          >
            لا
          </button>
        </div>
      </div>
    </div>
  );
}
