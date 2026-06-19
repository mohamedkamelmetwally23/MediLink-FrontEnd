import { useEffect, useMemo, useState } from "react";
import {
  Ban,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Pencil,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { Link } from "react-router-dom";
import CustomSelect from "../../components/admin/CustomSelect";
import doctorAvatar from "../../assets/landingPage/doctor1.png";
import {
  deleteDoctor,
  listDoctors,
  updateDoctor,
} from "../../services/medilinkApi";
import { includesSearchText } from "../../utils/searchText";

const pageSize = 10;

const statusLabels = {
  active: "مفعل",
  inactive: "غير مفعل",
};

const demoDoctors = [
  ["محمد", "حسين", "أمراض القلب", 214, "active"],
  ["أحمد", "شوقي", "جلدية وتناسلية", 63, "active"],
  ["محمد", "أمين", "طب الأطفال", 43, "active"],
  ["محمد", "فتح الله", "قلب", 81, "active"],
  ["جمال", "عامر", "جلدية وتناسلية", 116, "active"],
  ["محمد", "المنشاوي", "عيون", 213, "active"],
  ["عبد الرحمن", "عبد الله", "قلب", 97, "active"],
  ["خالد", "كامل", "مخ وأعصاب", 51, "inactive"],
  ["محمد", "فهمي", "أنف وأذن", 91, "active"],
  ["مروان", "خالد", "طب الأطفال", 107, "active"],
  ["يوسف", "محمد", "أمراض القلب", 70, "active"],
  ["سارة", "محمد", "جلدية وتناسلية", 44, "inactive"],
].map(([firstName, lastName, specialty, appointmentsCount, status], index) => ({
  id: `demo-doctor-${index + 1}`,
  profileId: `demo-profile-${index + 1}`,
  userId: `demo-user-${index + 1}`,
  firstName,
  lastName,
  specialty,
  specializationId: specialty,
  appointmentsCount,
  status,
  phone: `010${String(555550000 + index).padStart(8, "0")}`,
  gender: index % 3 === 0 ? "female" : "male",
  birthDate: "1990-01-01",
  experienceYears: 5 + index,
  workDays: ["السبت", "الأحد", "الاثنين", "الثلاثاء"],
  workStart: "08:00",
  workEnd: "16:00",
  consultationFee: 200 + index * 25,
  image: index % 3 === 0 ? doctorAvatar : "",
  raw: {},
}));

function getDoctorName(doctor) {
  return (
    [doctor?.firstName, doctor?.lastName].filter(Boolean).join(" ").trim() ||
    doctor?.name ||
    ""
  );
}

function getAppointmentsCount(doctor) {
  return doctor.appointmentsCount ?? doctor.caseCount ?? doctor.casesCount ?? 0;
}

function isDemoDoctor(doctorOrId) {
  const id = typeof doctorOrId === "string" ? doctorOrId : doctorOrId?.id;
  return String(id || "").startsWith("demo-doctor-");
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

export default function ReceptionistDoctorsPage() {
  const [doctors, setDoctors] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [search, setSearch] = useState("");
  const [specialtyFilter, setSpecialtyFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [pendingDelete, setPendingDelete] = useState(null);
  const [editingDoctor, setEditingDoctor] = useState(undefined);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    listDoctors()
      .then((items) => {
        if (!mounted) return;
        setDoctors(items.length > 0 ? items : demoDoctors);
      })
      .catch((error) => {
        if (!mounted) return;
        setDoctors(isPermissionError(error) ? demoDoctors : demoDoctors);
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
  const visibleIds = pageDoctors.map((doctor) => doctor.id);
  const selectedCount = selectedIds.length;
  const allVisibleSelected =
    visibleIds.length > 0 && visibleIds.every((id) => selectedIds.includes(id));

  const resetToFirstPage = (updateValue) => {
    updateValue();
    setCurrentPage(1);
  };

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

  const removeDoctors = (ids) => {
    setDoctors((current) => current.filter((doctor) => !ids.includes(doctor.id)));
    setSelectedIds((current) => current.filter((id) => !ids.includes(id)));
    setPendingDelete(null);
  };

  const deleteDoctors = (ids) => {
    const apiIds = ids.filter((id) => !isDemoDoctor(id));

    if (apiIds.length === 0) {
      removeDoctors(ids);
      return;
    }

    Promise.all(apiIds.map(deleteDoctor))
      .then(() => removeDoctors(ids))
      .catch(() => setPendingDelete(null));
  };

  const saveDoctor = (values) => {
    const currentDoctor = editingDoctor || null;
    const nextDoctor = {
      ...(currentDoctor || {
        id: `demo-doctor-${Date.now()}`,
        role: "doctor",
        appointmentsCount: 0,
        status: "active",
      }),
      ...values,
      specializationId: values.specialty,
    };

    setDoctors((current) => {
      if (!currentDoctor) return [nextDoctor, ...current];

      return current.map((doctor) =>
        doctor.id === currentDoctor.id ? nextDoctor : doctor,
      );
    });
    setEditingDoctor(undefined);

    if (!currentDoctor || isDemoDoctor(currentDoctor)) return;

    updateDoctor(currentDoctor.id, values, currentDoctor).catch(() => {});
  };

  const toggleStatus = (doctor) => {
    const nextStatus = doctor.status === "active" ? "inactive" : "active";
    saveStatusLocally(doctor.id, nextStatus);

    if (!isDemoDoctor(doctor)) {
      updateDoctor(doctor.id, { ...doctor, status: nextStatus }, doctor).catch(
        () => {},
      );
    }
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
          className="mb-[16px] flex items-center justify-between gap-4"
          dir="ltr"
        >
          <button
            type="button"
            className="flex h-[38px] items-center gap-2 rounded-[8px] bg-gradient-to-l from-[#67d2cb] to-[#0fb8e8] px-[15px] text-[12px] font-bold text-white"
            onClick={() => setEditingDoctor(null)}
          >
            <Plus size={16} strokeWidth={2} />
            <span>أضف طبيب</span>
          </button>

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
            <div className="min-w-[980px]">
              <TableHeader
                allVisibleSelected={allVisibleSelected}
                onToggleAll={toggleAllVisible}
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
                    selected={selectedIds.includes(doctor.id)}
                    onDelete={() => setPendingDelete([doctor.id])}
                    onEdit={() => setEditingDoctor(doctor)}
                    onToggle={() => toggleDoctor(doctor.id)}
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

      {pendingDelete && (
        <ConfirmDeleteModal
          onCancel={() => setPendingDelete(null)}
          onConfirm={() => deleteDoctors(pendingDelete)}
        />
      )}

      {editingDoctor !== undefined && (
        <DoctorEditModal
          doctor={editingDoctor}
          specialties={specialties}
          onCancel={() => setEditingDoctor(undefined)}
          onSave={saveDoctor}
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
  specialtyFilter,
  statusFilter,
  specialties,
  onSpecialtyChange,
  onStatusChange,
}) {
  return (
    <div
      className="grid h-[42px] grid-cols-[48px_1.25fr_1.15fr_0.75fr_0.85fr_108px_46px] items-center bg-[#f7f7f7] text-[12px] font-medium text-[#333] dark:bg-[#444] dark:text-white"
      dir="rtl"
    >
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
  selected,
  onDelete,
  onEdit,
  onToggle,
  onToggleStatus,
}) {
  const appointmentsCount = getAppointmentsCount(doctor);

  return (
    <div
      className={`grid h-[40px] grid-cols-[48px_1.25fr_1.15fr_0.75fr_0.85fr_108px_46px] items-center border-b border-[#e8e8e8] text-[11px] text-[#2f2f2f] transition dark:border-white/15 dark:text-white ${
        selected ? "bg-[#eeeeee] dark:bg-white/10" : "bg-white dark:bg-[#505050]"
      }`}
      dir="rtl"
    >
      <div className="flex justify-center">
        <Checkbox checked={selected} onClick={onToggle} />
      </div>
      <span className="truncate px-2 text-center">{getDoctorName(doctor)}</span>
      <span className="truncate px-2 text-center">
        {doctor.specialty || "غير محدد"}
      </span>
      <span className="text-center">{appointmentsCount}</span>
      <div className="flex justify-center">
        <StatusBadge status={doctor.status} />
      </div>
      <div className="flex items-center justify-center gap-3" dir="ltr">
        <button
          type="button"
          aria-label="حذف"
          className="text-[#333] transition hover:text-[#ff2626] dark:text-white"
          onClick={onDelete}
        >
          <Trash2 size={15} strokeWidth={1.7} />
        </button>
        <button
          type="button"
          aria-label="تعديل"
          className="text-[#333] transition hover:text-[#24b9d6] dark:text-white"
          onClick={onEdit}
        >
          <Pencil size={15} strokeWidth={1.7} />
        </button>
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
        to={`/receptionist/doctors/${doctor.id}/profile`}
        aria-label="عرض الطبيب"
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

function DoctorEditModal({ doctor, specialties, onCancel, onSave }) {
  const [firstName, setFirstName] = useState(doctor?.firstName || "");
  const [lastName, setLastName] = useState(doctor?.lastName || "");
  const [specialty, setSpecialty] = useState(doctor?.specialty || specialties[0] || "");
  const [workStart, setWorkStart] = useState(doctor?.workStart || "08:00");
  const [workEnd, setWorkEnd] = useState(doctor?.workEnd || "16:00");

  const handleSave = () => {
    onSave({
      firstName: firstName.trim() || "طبيب",
      lastName: lastName.trim(),
      specialty,
      specializationId: specialty,
      gender: doctor?.gender || "male",
      birthDate: doctor?.birthDate || "1990-01-01",
      workStart,
      workEnd,
      workDays: doctor?.workDays || ["السبت", "الأحد"],
      experienceYears: doctor?.experienceYears || 0,
      status: doctor?.status || "active",
      appointmentsCount: doctor?.appointmentsCount || 0,
      image: doctor?.image || "",
      phone: doctor?.phone || "",
    });
  };

  return (
    <div className="fixed inset-0 z-[90] grid place-items-center bg-black/20 p-4">
      <div
        className="w-full max-w-[382px] rounded-[8px] bg-white p-[22px] shadow-[0_12px_35px_rgba(0,0,0,0.16)] dark:bg-[#3f3f3f]"
        dir="rtl"
      >
        <h2 className="text-center text-[16px] font-bold text-[#333] dark:text-white">
          {doctor ? "تعديل بيانات الطبيب" : "إضافة طبيب"}
        </h2>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <Field label="الاسم الأول" value={firstName} onChange={setFirstName} />
          <Field label="الاسم الأخير" value={lastName} onChange={setLastName} />
        </div>

        <label className="mt-4 block">
          <span className="mb-2 block text-[12px] font-bold text-[#333] dark:text-white">
            التخصص
          </span>
          <CustomSelect
            value={specialty}
            onChange={setSpecialty}
            displayLabel={specialty || "اختر التخصص"}
            buttonClassName="flex h-[42px] w-full items-center gap-2 rounded-[8px] border border-transparent bg-[#f0f0f0] px-3 text-[12px] font-bold text-[#333] outline-none transition focus:border-[#25b9d6] dark:bg-[#454545] dark:text-white"
            menuClassName="rounded-[9px] p-1.5 text-[12px]"
          >
            {specialties.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
            {!specialties.includes(specialty) && specialty && (
              <option value={specialty}>{specialty}</option>
            )}
          </CustomSelect>
        </label>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <Field label="بداية العمل" value={workStart} onChange={setWorkStart} />
          <Field label="نهاية العمل" value={workEnd} onChange={setWorkEnd} />
        </div>

        <div className="mt-5 grid grid-cols-2 gap-[10px]" dir="ltr">
          <button
            type="button"
            className="h-[36px] rounded-[8px] bg-gradient-to-l from-[#67d2cb] to-[#0fb8e8] text-[12px] font-semibold text-white"
            onClick={handleSave}
          >
            حفظ التعديلات
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

function Field({ label, value, onChange }) {
  return (
    <label className="block">
      <span className="mb-2 block text-[12px] font-bold text-[#333] dark:text-white">
        {label}
      </span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-[42px] w-full rounded-[8px] bg-[#f0f0f0] px-3 text-right text-[12px] font-bold text-[#333] outline-none transition focus:ring-1 focus:ring-[#25b9d6] dark:bg-[#454545] dark:text-white"
      />
    </label>
  );
}
