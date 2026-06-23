import { useEffect, useMemo, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { Link } from "react-router-dom";
import CustomSelect from "../../components/admin/CustomSelect";
import {
  deletePatient,
  getUserAppointmentsCount,
  listPatientsForReceptionist,
} from "../../services/medilinkApi";
import { includesSearchText } from "../../utils/searchText";

const pageSize = 10;

const statusLabels = {
  active: "نشط",
  inactive: "غير نشط",
};

function getPatientName(patient) {
  return (
    patient?.name ||
    [patient?.firstName, patient?.lastName].filter(Boolean).join(" ").trim() ||
    ""
  );
}

function getActiveStatus(patient) {
  return patient?.status === "inactive" || patient?.active === false
    ? "inactive"
    : "active";
}

function isDemoPatient(patientOrId) {
  const id = typeof patientOrId === "string" ? patientOrId : patientOrId?.id;
  return String(id || "").startsWith("demo-patient-");
}

export default function ReceptionistPatientsPage() {
  const [patients, setPatients] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [pendingDelete, setPendingDelete] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    localStorage.removeItem("medilink-users-cache-patients");

    listPatientsForReceptionist()
      .then(async (items) => {
        const patientsWithCounts = await Promise.all(
          items.map(async (patient) => {
            const userId =
              patient.userId ||
              patient.raw?.user?._id ||
              patient.raw?.user?.id ||
              "";

            if (!userId) return patient;

            try {
              const counts = await getUserAppointmentsCount(userId);
              return {
                ...patient,
                appointmentCounts: counts,
                casesCount: counts.completed,
                appointmentsCount: counts.total,
                completedAppointmentsCount: counts.completed,
                cancelledAppointmentsCount: counts.cancelled,
              };
            } catch {
              return patient;
            }
          }),
        );

        if (!mounted) return;
        setPatients(patientsWithCounts);
      })
      .catch(() => {
        if (!mounted) return;
        setPatients([]);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const filteredPatients = useMemo(() => {
    const query = search.trim();

    return patients.filter((patient) => {
      const name = getPatientName(patient);
      const status = getActiveStatus(patient);

      return (
        (!query ||
          includesSearchText(name, query) ||
          includesSearchText(patient.phone, query) ||
          includesSearchText(patient.casesCount, query)) &&
        (!statusFilter || status === statusFilter)
      );
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

  const removePatients = (ids) => {
    setPatients((current) =>
      current.filter((patient) => !ids.includes(patient.id)),
    );
    setSelectedIds((current) => current.filter((id) => !ids.includes(id)));
    setPendingDelete(null);
  };

  const deletePatients = (ids) => {
    const apiIds = ids.filter((id) => !isDemoPatient(id));

    if (apiIds.length === 0) {
      removePatients(ids);
      return;
    }

    Promise.all(apiIds.map(deletePatient))
      .then(() => removePatients(ids))
      .catch(() => setPendingDelete(null));
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
            <div className="min-w-[860px]">
              <TableHeader
                allVisibleSelected={allVisibleSelected}
                statusFilter={statusFilter}
                onStatusChange={(value) =>
                  resetToFirstPage(() => setStatusFilter(value))
                }
                onToggleAll={toggleAllVisible}
              />

              {loading ? (
                <TableState text="جاري تحميل المرضى..." />
              ) : filteredPatients.length === 0 ? (
                <TableState text="لا يوجد مرضى حتى الآن" />
              ) : (
                pagePatients.map((patient) => (
                  <PatientRow
                    key={patient.id}
                    patient={patient}
                    selected={selectedIds.includes(patient.id)}
                    onToggle={() => togglePatient(patient.id)}
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

function PageHeader() {
  return (
    <header className="flex min-h-[112px] items-start justify-start bg-white px-4 pt-[32px] shadow-[0_1px_8px_rgba(0,0,0,0.03)] dark:bg-[#3a3a3a] sm:px-6 lg:px-[32px]">
      <div className="text-right">
        <h1 className="text-[23px] font-bold leading-[31px] text-[#333] dark:text-white">
          المرضى
        </h1>
        <p className="mt-1 text-[13px] leading-5 text-[#8a8a8a] dark:text-gray-300">
          عرض وإدارة جميع حسابات المرضى.
        </p>
      </div>
    </header>
  );
}

function SearchBox({ value, onChange }) {
  return (
    <label
      className="flex h-[38px] w-full items-center gap-[10px] rounded-[8px] border border-[#d7d7d7] bg-[#fbfbfb] px-[13px] text-[#9a9a9a] dark:border-white/20 dark:bg-[#454545] dark:text-gray-200 sm:w-[250px]"
      dir="ltr"
    >
      <button
        type="button"
        aria-label="مسح البحث"
        className="grid h-5 w-5 place-items-center"
        onClick={() => onChange("")}
      >
        <X size={13} strokeWidth={1.7} />
      </button>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="min-w-0 flex-1 bg-transparent text-right text-[12px] outline-none placeholder:text-[#9a9a9a]"
        placeholder="ابحث هنا..."
        dir="rtl"
      />
      <Search size={16} strokeWidth={1.7} />
    </label>
  );
}

function SelectionBar({ count, onClear, onDelete }) {
  return (
    <div className="mb-[16px] flex h-[54px] items-center justify-between rounded-[8px] border border-[#d8eef5] bg-[#f5fcff] px-[18px] dark:border-cyan-400/25 dark:bg-cyan-400/10">
      <p className="text-[12px] font-semibold text-[#333] dark:text-white">
        تم تحديد {count} من العناصر
      </p>

      <div className="flex items-center gap-[18px]" dir="ltr">
        <button
          type="button"
          aria-label="إلغاء التحديد"
          className="grid h-[30px] w-[30px] place-items-center text-[#222] dark:text-white"
          onClick={onClear}
        >
          <X size={19} strokeWidth={1.8} />
        </button>
        <button
          type="button"
          className="flex h-[31px] items-center gap-[10px] rounded-[8px] border border-[#ff2626] px-[13px] text-[11px] font-semibold text-[#ff2626]"
          onClick={onDelete}
        >
          <span>حذف المحدد</span>
          <Trash2 size={15} strokeWidth={1.8} />
        </button>
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
    <div
      className="grid h-[42px] grid-cols-[48px_1.35fr_1.15fr_0.8fr_0.85fr_86px_46px] items-center bg-[#f7f7f7] text-[12px] font-medium text-[#333] dark:bg-[#444] dark:text-white"
      dir="rtl"
    >
      <div className="flex justify-center">
        <Checkbox checked={allVisibleSelected} onClick={onToggleAll} />
      </div>
      <span className="text-center">الاسم</span>
      <span className="text-center">رقم الهاتف</span>
      <span className="text-center">عدد الزيارات</span>
      <FilterSelect value={statusFilter} onChange={onStatusChange} label="الحالة">
        <option value="">الحالة</option>
        {Object.entries(statusLabels).map(([value, label]) => (
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
      buttonClassName="relative flex h-full w-full items-center justify-center bg-transparent px-0 text-[12px] font-medium text-[#333] outline-none dark:text-white [&>span]:flex-none [&>span]:text-center [&>svg]:absolute [&>svg]:left-[16px] [&>svg]:h-[14px] [&>svg]:w-[14px]"
      menuClassName="rounded-[9px] p-1.5 text-[12px]"
    >
      {children}
    </CustomSelect>
  );
}

function PatientRow({
  patient,
  selected,
  onToggle,
}) {
  const status = getActiveStatus(patient);
  const activityUserId =
    patient.userId ||
    patient.raw?.user?._id ||
    patient.raw?.user?.id ||
    "";

  return (
    <div
      className={`grid h-[40px] grid-cols-[48px_1.35fr_1.15fr_0.8fr_0.85fr_86px_46px] items-center border-b border-[#e8e8e8] text-[11px] text-[#2f2f2f] transition dark:border-white/15 dark:text-white ${
        selected ? "bg-[#eeeeee] dark:bg-white/10" : "bg-white dark:bg-[#505050]"
      }`}
      dir="rtl"
    >
      <div className="flex justify-center">
        <Checkbox checked={selected} onClick={onToggle} />
      </div>
      <span className="truncate px-2 text-center">{getPatientName(patient)}</span>
      <span className="truncate px-2 text-center" dir="ltr">
        {patient.phone || "-"}
      </span>
      <span className="text-center">
        {patient.casesCount ?? patient.appointmentsCount ?? 0}
      </span>
      <div className="flex justify-center">
        <StatusBadge status={status} />
      </div>
      <span />
      <Link
        to={`/receptionist/patients/${patient.id}/profile?userId=${encodeURIComponent(activityUserId)}`}
        aria-label="عرض المريض"
        className="grid h-full place-items-center text-[#333] transition hover:text-[#24b9d6] dark:text-white"
      >
        <ChevronLeft size={16} strokeWidth={1.7} />
      </Link>
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

function StatusBadge({ status }) {
  const active = status === "active";

  return (
    <span
      className={`rounded-[5px] px-[7px] py-[4px] text-[9px] font-medium ${
        active
          ? "bg-[#e8fff4] text-[#129a55]"
          : "bg-[#fff0f0] text-[#ff2020]"
      }`}
    >
      {active ? "نشط" : "غير نشط"}
    </span>
  );
}

function TableState({ text }) {
  return (
    <div className="grid min-h-[420px] place-items-center text-[15px] font-medium text-black dark:text-white">
      {text}
    </div>
  );
}

function Pagination({ currentPage, totalPages, onPageChange }) {
  const pages = getPaginationPages(currentPage, totalPages);

  return (
    <div className="flex h-[64px] items-center justify-center gap-[18px] text-[12px] font-bold text-[#333] dark:text-white">
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
