import { useEffect, useMemo, useState } from "react";
import {
  Ban,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Search,
  X,
} from "lucide-react";
import { Link } from "react-router-dom";
import CustomSelect from "../../components/admin/CustomSelect";
import {
  getUserAppointmentsCount,
  listDoctors,
  updateDoctor,
} from "../../services/medilinkApi";
import { includesSearchText } from "../../utils/searchText";

const pageSize = 10;

const statusLabels = {
  active: "مفعل",
  inactive: "غير مفعل",
};

function getDoctorName(doctor) {
  return (
    [doctor?.firstName, doctor?.lastName].filter(Boolean).join(" ").trim() ||
    doctor?.name ||
    ""
  );
}

function getAppointmentsCount(doctor) {
  return doctor.completedAppointmentsCount ?? 0;
}

export default function ReceptionistDoctorsPage() {
  const [doctors, setDoctors] = useState([]);
  const [search, setSearch] = useState("");
  const [specialtyFilter, setSpecialtyFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    listDoctors()
      .then(async (items) => {
        const doctorsWithCompletedAppointments = await Promise.all(
          items.map(async (doctor) => {
            const doctorId =
              doctor.profileId ||
              doctor.raw?._id ||
              doctor.raw?.doctorProfile?._id ||
              doctor.id;

            try {
              const counts = await getUserAppointmentsCount(doctorId);
              return {
                ...doctor,
                completedAppointmentsCount: counts.completed,
              };
            } catch {
              return {
                ...doctor,
                completedAppointmentsCount: 0,
              };
            }
          }),
        );

        if (mounted) setDoctors(doctorsWithCompletedAppointments);
      })
      .catch(() => {
        if (!mounted) return;
        setDoctors([]);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const specialties = useMemo(
    () =>
      Array.from(
        new Set(doctors.map((doctor) => doctor.specialty).filter(Boolean)),
      ),
    [doctors],
  );

  const filteredDoctors = useMemo(() => {
    const query = search.trim();

    return doctors.filter((doctor) => {
      const name = getDoctorName(doctor);

      return (
        (!query ||
          includesSearchText(name, query) ||
          includesSearchText(doctor.phone, query) ||
          includesSearchText(doctor.specialty, query)) &&
        (!specialtyFilter || doctor.specialty === specialtyFilter) &&
        (!statusFilter || doctor.status === statusFilter)
      );
    });
  }, [doctors, search, specialtyFilter, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredDoctors.length / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const pageDoctors = filteredDoctors.slice(
    (safeCurrentPage - 1) * pageSize,
    safeCurrentPage * pageSize,
  );
  const resetToFirstPage = (updateValue) => {
    updateValue();
    setCurrentPage(1);
  };

  const toggleStatus = (doctor) => {
    const nextStatus = doctor.status === "active" ? "inactive" : "active";
    saveStatusLocally(doctor.id, nextStatus);

    updateDoctor(doctor.id, { ...doctor, status: nextStatus }, doctor).catch(
      () => {},
    );
  };

  const saveStatusLocally = (id, status) => {
    setDoctors((current) =>
      current.map((doctor) => (doctor.id === id ? { ...doctor, status } : doctor)),
    );
  };

  return (
    <section className="min-h-screen bg-white text-[#333] dark:bg-[#2f2f2f] dark:text-white">
      <PageHeader />

      <main className="px-4 pb-8 pt-[24px] sm:px-6 lg:px-[38px]">
        <div
          className="mb-[16px] flex items-center justify-end gap-4"
          dir="ltr"
        >
          <SearchBox
            value={search}
            onChange={(value) => resetToFirstPage(() => setSearch(value))}
          />
        </div>

        <section className="overflow-hidden bg-white dark:bg-[#505050]">
          <div className="overflow-x-auto">
            <div className="min-w-[980px]">
              <TableHeader
                specialtyFilter={specialtyFilter}
                statusFilter={statusFilter}
                specialties={specialties}
                onSpecialtyChange={(value) =>
                  resetToFirstPage(() => setSpecialtyFilter(value))
                }
                onStatusChange={(value) =>
                  resetToFirstPage(() => setStatusFilter(value))
                }
              />

              {loading ? (
                <TableState text="جاري تحميل الأطباء..." />
              ) : filteredDoctors.length === 0 ? (
                <TableState text="لا يوجد أطباء حتى الآن" />
              ) : (
                pageDoctors.map((doctor) => (
                  <DoctorRow
                    key={doctor.id}
                    doctor={doctor}
                    onToggleStatus={() => toggleStatus(doctor)}
                  />
                ))
              )}
            </div>
          </div>

          {filteredDoctors.length > 0 && (
            <Pagination
              currentPage={safeCurrentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          )}
        </section>
      </main>

    </section>
  );
}

function PageHeader() {
  return (
    <header className="flex min-h-[112px] items-start justify-start bg-white px-4 pt-[32px] shadow-[0_1px_8px_rgba(0,0,0,0.03)] dark:bg-[#3a3a3a] sm:px-6 lg:px-[32px]">
      <div className="text-right">
        <h1 className="text-[23px] font-bold leading-[31px] text-[#333] dark:text-white">
          الأطباء
        </h1>
        <p className="mt-1 text-[13px] leading-5 text-[#8a8a8a] dark:text-gray-300">
          متابعة بيانات الأطباء وتخصصاتهم وحجوزاتهم.
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

function TableHeader({
  specialtyFilter,
  statusFilter,
  specialties,
  onSpecialtyChange,
  onStatusChange,
}) {
  return (
    <div
      className="grid h-[42px] grid-cols-[1.25fr_1.15fr_0.75fr_0.85fr_46px_46px] items-center bg-[#f7f7f7] text-[12px] font-medium text-[#333] dark:bg-[#444] dark:text-white"
      dir="rtl"
    >
      <span className="text-center">الاسم</span>
      <FilterSelect
        value={specialtyFilter}
        onChange={onSpecialtyChange}
        label="التخصص"
      >
        <option value="">التخصص</option>
        {specialties.map((specialty) => (
          <option key={specialty} value={specialty}>
            {specialty}
          </option>
        ))}
      </FilterSelect>
      <span className="text-center">عدد الزيارات</span>
      <FilterSelect value={statusFilter} onChange={onStatusChange} label="حالة">
        <option value="">حالة</option>
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

function DoctorRow({
  doctor,
  onToggleStatus,
}) {
  const appointmentsCount = getAppointmentsCount(doctor);
  const activityDoctorId =
    doctor.profileId ||
    doctor.raw?._id ||
    doctor.raw?.doctorProfile?._id ||
    doctor.id;

  return (
    <div
      className="grid h-[40px] grid-cols-[1.25fr_1.15fr_0.75fr_0.85fr_46px_46px] items-center border-b border-[#e8e8e8] bg-white text-[11px] text-[#2f2f2f] transition dark:border-white/15 dark:bg-[#505050] dark:text-white"
      dir="rtl"
    >
      <span className="truncate px-2 text-center">{getDoctorName(doctor)}</span>
      <span className="truncate px-2 text-center">
        {doctor.specialty || "غير محدد"}
      </span>
      <span className="text-center">{appointmentsCount}</span>
      <div className="flex justify-center">
        <StatusBadge status={doctor.status} />
      </div>
      <div className="flex items-center justify-center" dir="ltr">
        <button
          type="button"
          aria-label="تغيير الحالة"
          className={
            doctor.status === "inactive"
              ? "text-[#ff2020]"
              : "text-[#333] dark:text-white"
          }
          onClick={onToggleStatus}
        >
          <Ban size={15} strokeWidth={1.7} />
        </button>
      </div>
      <Link
        to={`/receptionist/doctors/${doctor.id}/profile?activityDoctorId=${encodeURIComponent(activityDoctorId)}`}
        aria-label="عرض الطبيب"
        className="grid h-full place-items-center text-[#333] transition hover:text-[#24b9d6] dark:text-white"
      >
        <ChevronLeft size={16} strokeWidth={1.7} />
      </Link>
    </div>
  );
}

function StatusBadge({ status }) {
  const active = status !== "inactive";

  return (
    <span
      className={`rounded-[5px] px-[7px] py-[4px] text-[9px] font-medium ${
        active
          ? "bg-[#e8fff4] text-[#129a55]"
          : "bg-[#fff0f0] text-[#ff2020]"
      }`}
    >
      {active ? "مفعل" : "غير مفعل"}
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
