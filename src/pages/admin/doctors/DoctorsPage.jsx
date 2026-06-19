import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Ban,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Pencil,
  Plus,
  Search,
  X,
} from "lucide-react";
import CustomSelect from "../../../components/admin/CustomSelect";
import ConfirmStatusChangeModal from "../../../components/admin/ConfirmStatusChangeModal";
import { includesSearchText } from "../../../utils/searchText";
import { useSpecialtiesStore } from "../specialties/useSpecialtiesStore";
import { userStatuses } from "../users/usersData";
import { useUsersStore } from "../users/useUsersStore";

const pageSize = 10;

function getAppointmentsCount(doctor) {
  return doctor.appointmentsCount ?? doctor.caseCount ?? doctor.casesCount ?? 0;
}

export default function DoctorsPage() {
  const {
    users,
    loading,
    toggleUserStatus,
  } = useUsersStore();
  const { specialties } = useSpecialtiesStore();
  const [selectedIds, setSelectedIds] = useState([]);
  const [search, setSearch] = useState("");
  const [specialtyFilter, setSpecialtyFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [pendingStatusUser, setPendingStatusUser] = useState(null);
  const [pendingStatusNote, setPendingStatusNote] = useState("");
  const [statusError, setStatusError] = useState("");
  const [isStatusUpdating, setIsStatusUpdating] = useState(false);
  const [bulkStatusLoading, setBulkStatusLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const filteredDoctors = useMemo(() => {
    const query = search.trim();

    return users.filter((doctor) => {
      const fullName = `${doctor.firstName} ${doctor.lastName}`;

      return (
        doctor.role === "doctor" &&
        (!query ||
          includesSearchText(fullName, query) ||
          includesSearchText(doctor.phone, query) ||
          includesSearchText(doctor.specialty, query)) &&
        (!specialtyFilter || doctor.specialty === specialtyFilter) &&
        (!statusFilter || doctor.status === statusFilter)
      );
    });
  }, [users, search, specialtyFilter, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredDoctors.length / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const pageDoctors = filteredDoctors.slice(
    (safeCurrentPage - 1) * pageSize,
    safeCurrentPage * pageSize,
  );
  const visibleIds = pageDoctors.map((doctor) => doctor.id);
  const selectedCount = selectedIds.length;
  const selectedDoctors = filteredDoctors.filter((doctor) =>
    selectedIds.includes(doctor.id),
  );
  const allSelectedBlocked =
    selectedDoctors.length > 0 &&
    selectedDoctors.every((doctor) => doctor.status === "inactive");
  const allVisibleSelected =
    visibleIds.length > 0 && visibleIds.every((id) => selectedIds.includes(id));

  const toggleDoctor = (id) => {
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

  const confirmStatusChange = async (note = pendingStatusNote) => {
    if (!pendingStatusUser) return;

    setIsStatusUpdating(true);
    setStatusError("");

    try {
      await toggleUserStatus(pendingStatusUser.id, { note });
      setPendingStatusUser(null);
      setPendingStatusNote("");
    } catch (error) {
      setStatusError(error.message || "تعذر تحديث الحالة، حاول مرة أخرى.");
    } finally {
      setIsStatusUpdating(false);
    }
  };

  const toggleSelectedDoctorsStatus = async () => {
    const targetIds = selectedDoctors
      .filter((doctor) =>
        allSelectedBlocked
          ? doctor.status === "inactive"
          : doctor.status !== "inactive",
      )
      .map((doctor) => doctor.id);

    if (targetIds.length === 0) {
      setSelectedIds([]);
      return;
    }

    setBulkStatusLoading(true);

    try {
      await Promise.all(targetIds.map((id) => toggleUserStatus(id)));
      setSelectedIds([]);
    } finally {
      setBulkStatusLoading(false);
    }
  };

  return (
    <section className="min-h-screen bg-white text-[#333] dark:bg-[#2f2f2f] dark:text-white">
      <PageHeader />

      <main className="px-4 pb-8 pt-[28px] sm:px-6 lg:px-[52px]">
        <div
          className="mb-[16px] flex items-center justify-between gap-4"
          dir="ltr"
        >
          <Link
            to="/admin/doctors/new"
            className="flex h-[52px] items-center gap-2 rounded-[10px] bg-gradient-to-l from-[#67d2cb] to-[#0fb8e8] px-[18px] text-[16px] font-medium text-white"
          >
            <Plus size={20} strokeWidth={2} />
            <span>أضف طبيب</span>
          </Link>

          <SearchBox
            value={search}
            onChange={(value) => {
              setSearch(value);
              setCurrentPage(1);
            }}
          />
        </div>

        {selectedCount > 0 && (
          <SelectionBar
            count={selectedCount}
            onClear={() => setSelectedIds([])}
            onToggleStatus={toggleSelectedDoctorsStatus}
            loading={bulkStatusLoading}
            unblock={allSelectedBlocked}
          />
        )}

        <section className="overflow-hidden bg-white dark:bg-[#505050]">
          <div className="overflow-x-auto">
            <div className="min-w-[1120px]">
              <TableHeader
                allVisibleSelected={allVisibleSelected}
                onToggleAll={toggleAllVisible}
                specialtyFilter={specialtyFilter}
                statusFilter={statusFilter}
                specialties={specialties}
                onSpecialtyChange={(value) => {
                  setSpecialtyFilter(value);
                  setCurrentPage(1);
                }}
                onStatusChange={(value) => {
                  setStatusFilter(value);
                  setCurrentPage(1);
                }}
              />

              {loading ? (
                <TableState text="جاري التحميل..." />
              ) : filteredDoctors.length === 0 ? (
                <TableState text="لا يوجد أطباء حتى الآن" />
              ) : (
                pageDoctors.map((doctor) => (
                  <DoctorRow
                    key={doctor.id}
                    doctor={doctor}
                    selected={selectedIds.includes(doctor.id)}
                    onToggle={() => toggleDoctor(doctor.id)}
                    onToggleStatus={() => {
                      setStatusError("");
                      setPendingStatusNote(
                        doctor.status === "active" ? "" : doctor.statusNote || "",
                      );
                      setPendingStatusUser(doctor);
                    }}
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

      {pendingStatusUser && (
        <ConfirmStatusChangeModal
          status={pendingStatusUser.status}
          loading={isStatusUpdating}
          error={statusError}
          note={pendingStatusNote}
          onNoteChange={setPendingStatusNote}
          onCancel={() => {
            setPendingStatusUser(null);
            setPendingStatusNote("");
            setStatusError("");
          }}
          onConfirm={confirmStatusChange}
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
          الأطباء
        </h1>
        <p className="mt-1 text-[16px] leading-5 text-[#8a8a8a] dark:text-gray-300">
          متابعة بيانات الأطباء وتخصصاتهم وحجوزاتهم.
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
        placeholder="ابحث هنا..."
        dir="rtl"
      />
      <Search size={20} strokeWidth={1.7} />
    </label>
  );
}

function SelectionBar({ count, onClear, onToggleStatus, loading, unblock }) {
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
          disabled={loading}
          className={`flex h-[40px] items-center rounded-[11px] border px-[18px] text-[16px] font-semibold transition disabled:cursor-wait disabled:opacity-60 ${
            unblock
              ? "border-[#129a55] text-[#129a55] hover:bg-[#e8fff4] dark:hover:bg-emerald-500/10"
              : "border-[#ff2626] text-[#ff2626] hover:bg-[#fff0f0] dark:hover:bg-red-500/10"
          }`}
          onClick={onToggleStatus}
        >
          {loading
            ? unblock
              ? "جاري إلغاء الحظر..."
              : "جاري الحظر..."
            : unblock
              ? "إلغاء الحظر"
              : "حظر المحدد"}
        </button>
      </div>
    </div>
  );
}

function TableHeader({
  allVisibleSelected,
  onToggleAll,
  specialtyFilter,
  statusFilter,
  specialties,
  onSpecialtyChange,
  onStatusChange,
}) {
  return (
    <div className="grid h-[56px] grid-cols-[64px_1.25fr_1.1fr_0.7fr_0.8fr_1fr_118px_48px] items-center bg-[#f7f7f7] text-[17px] font-medium text-[#333] dark:bg-[#444] dark:text-white">
      <div className="flex justify-center">
        <Checkbox checked={allVisibleSelected} onClick={onToggleAll} />
      </div>
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
      <span className="text-center">عدد الحجوزات</span>
      <FilterSelect
        value={statusFilter}
        onChange={onStatusChange}
        label="حالة"
      >
        <option value="">حالة</option>
        {Object.entries(userStatuses).map(([value, label]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </FilterSelect>
      <span className="text-center">ملاحظه</span>
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

function DoctorRow({ doctor, selected, onToggle, onToggleStatus }) {
  const appointmentsCount = getAppointmentsCount(doctor);

  return (
    <div
      className={`grid h-[56px] grid-cols-[64px_1.25fr_1.1fr_0.7fr_0.8fr_1fr_118px_48px] items-center border-b border-[#dddddd] text-[17px] text-[#2f2f2f] transition dark:border-white/15 dark:text-white ${
        selected ? "bg-[#eeeeee] dark:bg-white/10" : "bg-white dark:bg-[#505050]"
      }`}
    >
      <div className="flex justify-center">
        <Checkbox checked={selected} onClick={onToggle} />
      </div>
      <span className="truncate text-center">
        {doctor.firstName} {doctor.lastName}
      </span>
      <span className="truncate text-center">{doctor.specialty || "غير محدد"}</span>
      <span className="text-center">{appointmentsCount}</span>
      <div className="flex justify-center">
        <StatusBadge status={doctor.status} />
      </div>
      <span
        className="truncate px-2 text-center text-[14px] text-[#777] dark:text-gray-300"
        title={doctor.statusNote || ""}
      >
        {doctor.status === "inactive" && doctor.statusNote ? doctor.statusNote : "-"}
      </span>
      <div className="flex items-center justify-center gap-[12px]" dir="ltr">
        <Link
          to={`/admin/doctors/${doctor.id}/edit`}
          aria-label="تعديل الطبيب"
          className="text-[#333] dark:text-white"
        >
          <Pencil size={23} strokeWidth={1.8} />
        </Link>
        <button
          type="button"
          aria-label="تغيير حالة الطبيب"
          className={
            doctor.status === "inactive"
              ? "text-[#ff2020]"
              : "text-[#333] dark:text-white"
          }
          onClick={onToggleStatus}
        >
          <Ban size={23} strokeWidth={1.8} />
        </button>
      </div>
      <Link
        to={`/admin/users/${doctor.id}/profile`}
        aria-label="عرض الطبيب"
        className="grid h-full place-items-center text-[#333] dark:text-white"
      >
        <ChevronLeft size={23} strokeWidth={1.7} />
      </Link>
    </div>
  );
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

function StatusBadge({ status }) {
  const active = status === "active";

  return (
    <span
      className={`rounded-[7px] px-[7px] py-[5px] text-[10px] font-medium ${
        active
          ? "bg-[#e8fff4] text-[#129a55]"
          : "bg-[#fff0f0] text-[#ff2020]"
      }`}
    >
      {userStatuses[status]}
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

