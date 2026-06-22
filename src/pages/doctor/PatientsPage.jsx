import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Search,
  X,
} from "lucide-react";
import { includesSearchText } from "../../utils/searchText";
import { listPatientsForDoctor } from "../../services/medilinkApi";

const pageSize = 10;

const statusLabels = {
  active: "مفعل",
  inactive: "غير مفعل",
};

function toPatientRow(user) {
  return {
    id: user.id || user.userId || user.phone || user.name,
    userId: user.userId || "",
    name: user.name || `${user.firstName} ${user.lastName}`.trim(),
    phone: user.phone || "",
    casesCount: user.casesCount ?? user.appointmentsCount ?? 0,
    status: user.status || "active",
    raw: user,
  };
}

export default function DoctorPatientsPage() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    let mounted = true;

    listPatientsForDoctor()
      .then((result) => {
        if (!mounted) return;
        setPatients(result.map(toPatientRow));
      })
      .catch((requestError) => {
        if (!mounted) return;
        setPatients([]);
        setError(requestError.message || "تعذر تحميل مرضى الدكتور");
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
      const matchesSearch =
        !query ||
        includesSearchText(patient.name, query) ||
        includesSearchText(patient.phone, query) ||
        includesSearchText(patient.casesCount, query);

      return matchesSearch && (!statusFilter || patient.status === statusFilter);
    });
  }, [patients, search, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredPatients.length / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const pagePatients = filteredPatients.slice(
    (safeCurrentPage - 1) * pageSize,
    safeCurrentPage * pageSize,
  );

  const resetToFirstPage = (updateValue) => {
    updateValue();
    setCurrentPage(1);
  };

  return (
    <section className="min-h-screen bg-[#f8fbfc] text-[#333] dark:bg-[#2f2f2f] dark:text-white">
      <Header />

      <main className="w-full px-4 pb-[28px] pt-[16px] sm:px-6 lg:px-[24px]">
        <div className="w-full space-y-[6px]">
          <div className="flex justify-end" dir="ltr">
            <SearchBox value={search} onChange={setSearch} />
          </div>

        <section className="w-full overflow-hidden rounded-[4px] border border-[#e8eef1] bg-white shadow-[0_4px_14px_rgba(0,0,0,0.05)] dark:border-white/10 dark:bg-[#505050]">
          <div className="overflow-x-auto">
            <div className="w-full min-w-[760px]">
              <TableHeader
                statusFilter={statusFilter}
                onStatusChange={(value) =>
                  resetToFirstPage(() => setStatusFilter(value))
                }
              />

              {loading ? (
                <TableState text="جاري تحميل المرضى..." />
              ) : error ? (
                <TableState text={error} />
              ) : filteredPatients.length === 0 ? (
                <TableState text="لا يوجد مرضى حتى الآن" />
              ) : (
                pagePatients.map((patient) => (
                  <PatientRow
                    key={patient.id}
                    patient={patient}
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
        </div>
      </main>

    </section>
  );
}

function Header() {
  return (
    <header className="flex min-h-[100px] flex-col gap-5 bg-white px-4 py-[20px] shadow-[0_1px_8px_rgba(0,0,0,0.03)] dark:bg-[#3a3a3a] sm:px-6 lg:flex-row lg:items-start lg:justify-between lg:px-[24px]">
      <div className="ml-auto text-right">
        <h1 className="text-[20px] font-bold leading-7 text-[#333] dark:text-white">
          المرضى
        </h1>
        <p className="mt-1 text-[11px] leading-5 text-[#8a8a8a] dark:text-gray-300">
          عرض وإدارة جميع المرضى الخاصة بالعيادة.
        </p>
      </div>
    </header>
  );
}

function SearchBox({ value, onChange }) {
  return (
    <label
      className="flex h-[34px] w-full items-center gap-[8px] rounded-[6px] border border-[#d7d7d7] bg-white px-[10px] text-[#9a9a9a] dark:border-white/20 dark:bg-[#454545] dark:text-gray-200 sm:w-[190px]"
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
        className="min-w-0 flex-1 bg-transparent text-right text-[11px] outline-none placeholder:text-[#9a9a9a]"
        placeholder="إبحث هنا..."
        dir="rtl"
      />
      <Search size={14} strokeWidth={1.7} />
    </label>
  );
}

function TableHeader({
  statusFilter,
  onStatusChange,
}) {
  return (
    <div
      className="grid h-[56px] grid-cols-[1.6fr_1.35fr_1fr_minmax(0,0.5fr)_48px] items-center bg-[#f7f7f7] text-[17px] font-medium text-[#333] dark:bg-[#444] dark:text-white"
      dir="rtl"
    >
      <span className="truncate text-center">الاسم</span>
      <span className="text-center">رقم الهاتف</span>
      <select
        value={statusFilter}
        onChange={(event) => onStatusChange(event.target.value)}
        className="mx-auto h-full w-full bg-transparent text-center text-[17px] font-medium outline-none dark:bg-[#444]"
      >
        <option value="">الحالة</option>
        <option value="active">مفعل</option>
        <option value="inactive">غير مفعل</option>
      </select>
      <span aria-hidden="true" />
      <span />
    </div>
  );
}

function PatientRow({ patient }) {
  return (
    <div
      className="grid h-[56px] grid-cols-[1.6fr_1.35fr_1fr_minmax(0,0.5fr)_48px] items-center border-b border-[#dddddd] bg-white text-[17px] text-[#2f2f2f] transition dark:border-white/15 dark:bg-[#505050] dark:text-white"
      dir="rtl"
    >
      <span className="truncate text-center">
        {patient.name}
      </span>
      <span className="truncate text-center" dir="ltr">
        {patient.phone}
      </span>
      <div className="flex justify-center">
        <StatusBadge status={patient.status} />
      </div>
      <span aria-hidden="true" />
      <Link
        to={`/doctor/patients/${encodeURIComponent(patient.id)}/profile`}
        state={{ patient: patient.raw || patient }}
        aria-label={`عرض ملف ${patient.name}`}
        className="grid h-full place-items-center text-[#333] dark:text-white"
      >
        <ChevronLeft size={23} strokeWidth={1.7} />
      </Link>
    </div>
  );
}

function StatusBadge({ status }) {
  const isActive = status === "active";

  return (
    <span
      className={`rounded-[7px] px-[7px] py-[5px] text-[10px] font-medium ${
        isActive
          ? "bg-[#e8fff4] text-[#129a55]"
          : "bg-[#fff0f0] text-[#ff2020]"
      }`}
    >
      {statusLabels[status]}
    </span>
  );
}

function TableState({ text }) {
  return (
    <div className="grid min-h-[250px] place-items-center border-t border-[#edf1f3] text-[13px] font-bold text-[#333] dark:border-white/10 dark:text-white">
      {text}
    </div>
  );
}

function Pagination({ currentPage, totalPages, onPageChange }) {
  const pages = getPaginationPages(currentPage, totalPages);

  return (
    <div className="flex h-[42px] items-center justify-center gap-[14px] border-t border-[#edf1f3] text-[10px] font-bold text-[#333] dark:border-white/10 dark:text-white">
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

