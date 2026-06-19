import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
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
import { normalizeSpecialtyLabel } from "../users/usersData";
import { includesSearchText } from "../../../utils/searchText";
import { useUsersStore } from "../users/useUsersStore";
import {
  useSpecialtiesStore,
  validateSpecialtyName,
} from "./useSpecialtiesStore";

const pageSize = 10;
const minSpecialtyPrice = 100;
const maxSpecialtyPrice = 1000;

function getDoctorAppointmentsCount(doctor) {
  return doctor.appointmentsCount ?? doctor.caseCount ?? doctor.casesCount ?? 0;
}

function normalizePrice(price) {
  return String(price).replace(/[^\d]/g, "");
}

function getSpecialtyFormErrors({ name, price, specialties, currentName = "" }) {
  const normalizedName = normalizeSpecialtyLabel(name);
  const normalizedPrice = normalizePrice(price);
  const errors = {};
  const nameError = validateSpecialtyName(
    normalizedName,
    specialties.map(normalizeSpecialtyLabel),
    currentName,
  );

  if (nameError) {
    errors.name = nameError;
  }

  if (!normalizedPrice || Number(normalizedPrice) < minSpecialtyPrice) {
    errors.price = "سعر الكشف أقل قيمة 100 جنيه";
  } else if (Number(normalizedPrice) > maxSpecialtyPrice) {
    errors.price = "سعر الكشف آخره 1000 جنيه";
  }

  return errors;
}

export default function SpecialtiesPage() {
  const { users, updateUsersSpecialty, clearUsersSpecialties } = useUsersStore();
  const {
    specialties,
    specialtyItems,
    addSpecialty,
    updateSpecialty,
    deleteSpecialties,
  } = useSpecialtiesStore();
  const [prices, setPrices] = useState({});
  const [selectedNames, setSelectedNames] = useState([]);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [formState, setFormState] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const [pendingDelete, setPendingDelete] = useState(null);

  const doctors = useMemo(
    () => users.filter((user) => user.role === "doctor"),
    [users],
  );

  const specialtiesStats = useMemo(
    () =>
      specialties.map((name) => {
        const normalizedName = normalizeSpecialtyLabel(name);
        const specialtyItem = specialtyItems.find(
          (specialty) => normalizeSpecialtyLabel(specialty.name) === normalizedName,
        );
        const specialtyDoctors = doctors.filter(
          (doctor) => normalizeSpecialtyLabel(doctor.specialty) === normalizedName,
        );
        const actualStats = {
          doctorsCount: specialtyDoctors.length,
          appointmentsCount: specialtyDoctors.reduce(
            (total, doctor) => total + getDoctorAppointmentsCount(doctor),
            0,
          ),
        };

        return {
          name: normalizedName,
          doctorsCount: actualStats.doctorsCount,
          appointmentsCount: actualStats.appointmentsCount,
          price: specialtyItem?.price || prices[normalizedName] || "",
        };
      }),
    [specialties, specialtyItems, doctors, prices],
  );

  const filteredSpecialties = useMemo(() => {
    const query = search.trim();

    return specialtiesStats.filter((specialty) =>
      includesSearchText(specialty.name, query),
    );
  }, [specialtiesStats, search]);

  const totalPages = Math.max(1, Math.ceil(filteredSpecialties.length / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const pageSpecialties = filteredSpecialties.slice(
    (safeCurrentPage - 1) * pageSize,
    safeCurrentPage * pageSize,
  );
  const visibleNames = pageSpecialties.map((specialty) => specialty.name);
  const selectedCount = selectedNames.length;
  const selectedSpecialties = specialtiesStats.filter((specialty) =>
    selectedNames.includes(specialty.name),
  );
  const hasSelectedSpecialtyWithDoctors = selectedSpecialties.some(
    (specialty) => specialty.doctorsCount > 0,
  );
  const allVisibleSelected =
    visibleNames.length > 0 &&
    visibleNames.every((name) => selectedNames.includes(name));

  const updatePrices = (getNextPrices) => {
    setPrices((currentPrices) => {
      return getNextPrices(currentPrices);
    });
  };

  const openForm = (mode, specialty = null) => {
    setFormState({
      mode,
      name: specialty?.name || "",
      price: specialty?.price || "",
    });
    setFormErrors({});
  };

  const closeForm = () => {
    setFormState(null);
    setFormErrors({});
  };

  const handleSubmitSpecialty = async ({ name, price }) => {
    const normalizedName = normalizeSpecialtyLabel(name);
    const normalizedPrice = normalizePrice(price);
    const errors = getSpecialtyFormErrors({
      name,
      price,
      specialties,
      currentName: formState?.mode === "edit" ? formState.name : "",
    });

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      if (formState.mode === "edit") {
        await updateSpecialty(formState.name, normalizedName, normalizedPrice);
        updateUsersSpecialty(formState.name, normalizedName);
        updatePrices((currentPrices) => {
          const nextPrices = { ...currentPrices };
          delete nextPrices[formState.name];
          nextPrices[normalizedName] = normalizedPrice;
          return nextPrices;
        });
        setSelectedNames((current) =>
          current.map((item) => (item === formState.name ? normalizedName : item)),
        );
      } else {
        await addSpecialty(normalizedName, normalizedPrice);
        updatePrices((currentPrices) => ({
          ...currentPrices,
          [normalizedName]: normalizedPrice,
        }));
        setCurrentPage(1);
      }
    } catch (error) {
      setFormErrors({
        general: error.message || "تعذر حفظ التخصص",
      });
      return;
    }

    closeForm();
  };

  const toggleSpecialty = (name) => {
    setSelectedNames((current) =>
      current.includes(name)
        ? current.filter((item) => item !== name)
        : [...current, name],
    );
  };

  const toggleAllVisible = () => {
    setSelectedNames((current) => {
      if (allVisibleSelected) {
        return current.filter((name) => !visibleNames.includes(name));
      }

      return Array.from(new Set([...current, ...visibleNames]));
    });
  };

  const removeSpecialties = async (names) => {
    const deletableNames = names.filter((name) => {
      const specialty = specialtiesStats.find((item) => item.name === name);
      return !specialty || specialty.doctorsCount === 0;
    });

    if (deletableNames.length === 0) {
      setPendingDelete(null);
      return;
    }

    try {
      await deleteSpecialties(deletableNames);
      clearUsersSpecialties(deletableNames);
      updatePrices((currentPrices) => {
        const nextPrices = { ...currentPrices };
        deletableNames.forEach((name) => delete nextPrices[name]);
        return nextPrices;
      });
      setSelectedNames((current) =>
        current.filter((name) => !deletableNames.includes(name)),
      );
      setPendingDelete(null);
    } catch (error) {
      setFormErrors({
        general: error.message || "تعذر حذف التخصص",
      });
      setPendingDelete(null);
    }
  };

  return (
    <section className="min-h-screen bg-white text-[#333] dark:bg-[#2f2f2f] dark:text-white">
      <PageHeader />

      <main className="px-4 pb-8 pt-[28px] sm:px-6 lg:px-[38px]">
        <div
          className="mb-[16px] flex items-center justify-between gap-4"
          dir="ltr"
        >
          <button
            type="button"
            className="flex h-[52px] items-center gap-2 rounded-[10px] bg-gradient-to-l from-[#67d2cb] to-[#0fb8e8] px-[18px] text-[16px] font-medium text-white"
            onClick={() => openForm("create")}
          >
            <Plus size={20} strokeWidth={2} />
            <span>أضف تخصص</span>
          </button>

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
            disableDelete={hasSelectedSpecialtyWithDoctors}
            onClear={() => setSelectedNames([])}
            onDelete={() => setPendingDelete(selectedNames)}
          />
        )}

        <section className="overflow-hidden bg-white dark:bg-[#505050]">
          <div className="overflow-x-auto">
            <div className="min-w-[980px]">
              <TableHeader
                allVisibleSelected={allVisibleSelected}
                onToggleAll={toggleAllVisible}
              />

              {filteredSpecialties.length === 0 ? (
                <EmptyState />
              ) : (
                pageSpecialties.map((specialty) => (
                  <SpecialtyRow
                    key={specialty.name}
                    specialty={specialty}
                    selected={selectedNames.includes(specialty.name)}
                    onToggle={() => toggleSpecialty(specialty.name)}
                    onEdit={() => openForm("edit", specialty)}
                    disableDelete={specialty.doctorsCount > 0}
                    onDelete={() => setPendingDelete([specialty.name])}
                  />
                ))
              )}
            </div>
          </div>

          {filteredSpecialties.length > 0 && (
            <Pagination
              currentPage={safeCurrentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          )}
        </section>
      </main>

      {formState && (
        <SpecialtyModal
          mode={formState.mode}
          initialName={formState.name}
          initialPrice={formState.price}
          specialties={specialties}
          errors={formErrors}
          onCancel={closeForm}
          onSubmit={handleSubmitSpecialty}
        />
      )}

      {pendingDelete && (
        <ConfirmDeleteModal
          onCancel={() => setPendingDelete(null)}
          onConfirm={() => removeSpecialties(pendingDelete)}
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
          التخصصات
        </h1>
        <p className="mt-1 text-[16px] leading-5 text-[#8a8a8a] dark:text-gray-300">
          تنظيم التخصصات الطبية وإضافة أو تعديل أو حذف التخصصات المتاحة.
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

function SelectionBar({ count, disableDelete, onClear, onDelete }) {
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
          disabled={disableDelete}
          className={`flex h-[40px] items-center gap-[16px] rounded-[11px] border px-[18px] text-[16px] font-semibold transition ${
            disableDelete
              ? "cursor-not-allowed border-[#9a9a9a] text-[#9a9a9a] opacity-60"
              : "border-[#ff2626] text-[#ff2626]"
          }`}
          onClick={onDelete}
        >
          <span>حذف المحدد</span>
          <Trash2 size={22} strokeWidth={1.8} />
        </button>
      </div>
    </div>
  );
}

function TableHeader({ allVisibleSelected, onToggleAll }) {
  return (
    <div className="grid h-[56px] grid-cols-[64px_1.45fr_1fr_1fr_1fr_118px_48px] items-center bg-[#f7f7f7] text-[17px] font-medium text-[#333] dark:bg-[#444] dark:text-white">
      <div className="flex justify-center">
        <Checkbox checked={allVisibleSelected} onClick={onToggleAll} />
      </div>
      <span className="text-center">اسم التخصص</span>
      <span className="text-center">عدد الأطباء</span>
      <span className="text-center">عدد المواعيد</span>
      <span className="text-center">سعر الكشف</span>
      <span />
      <span />
    </div>
  );
}

function SpecialtyRow({
  specialty,
  selected,
  disableDelete,
  onToggle,
  onEdit,
  onDelete,
}) {
  return (
    <div
      className={`grid h-[56px] grid-cols-[64px_1.45fr_1fr_1fr_1fr_118px_48px] items-center border-b border-[#dddddd] text-[17px] text-[#2f2f2f] transition dark:border-white/15 dark:text-white ${
        selected ? "bg-[#eeeeee] dark:bg-white/10" : "bg-white dark:bg-[#505050]"
      }`}
    >
      <div className="flex justify-center">
        <Checkbox checked={selected} onClick={onToggle} />
      </div>
      <span className="truncate text-center">{specialty.name}</span>
      <span className="text-center">{specialty.doctorsCount}</span>
      <span className="text-center">{specialty.appointmentsCount}</span>
      <span className="text-center">{specialty.price} جنيه</span>
      <div className="flex items-center justify-center gap-[12px]" dir="ltr">
        <button
          type="button"
          aria-label="تعديل التخصص"
          className="text-[#333] dark:text-white"
          onClick={onEdit}
        >
          <Pencil size={23} strokeWidth={1.8} />
        </button>
        <button
          type="button"
          aria-label="حذف التخصص"
          disabled={disableDelete}
          className={`transition ${
            disableDelete
              ? "cursor-not-allowed text-[#9a9a9a] opacity-50"
              : "text-[#ff2626]"
          }`}
          onClick={onDelete}
        >
          <Trash2 size={24} strokeWidth={1.8} />
        </button>
      </div>
      <Link
        to={`/admin/specialties/${encodeURIComponent(specialty.name)}`}
        aria-label={`عرض ${specialty.name}`}
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

function EmptyState() {
  return (
    <div className="grid min-h-[620px] place-items-center text-[22px] font-medium text-black dark:text-white">
      لا يوجد تخصصات حتى الآن
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

function SpecialtyModal({
  mode,
  initialName,
  initialPrice,
  specialties,
  errors,
  onCancel,
  onSubmit,
}) {
  const [name, setName] = useState(initialName);
  const [price, setPrice] = useState(initialPrice);
  const liveErrors = getSpecialtyFormErrors({
    name,
    price,
    specialties,
    currentName: mode === "edit" ? initialName : "",
  });
  const unchanged =
    mode === "edit" &&
    normalizeSpecialtyLabel(name) === normalizeSpecialtyLabel(initialName) &&
    normalizePrice(price) === normalizePrice(initialPrice);
  const submitDisabled = unchanged || Object.keys(liveErrors).length > 0;
  const nameError = errors.name;
  const priceError = errors.price;
  const generalError = errors.general;

  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit({ name, price });
  };

  return (
    <div className="fixed inset-0 z-[80] grid place-items-center bg-black/20 p-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-[468px] rounded-[9px] bg-white px-[24px] pb-[16px] pt-[24px] shadow-[0_12px_35px_rgba(0,0,0,0.16)] dark:bg-[#3f3f3f]"
      >
        <h2 className="mb-[24px] text-center text-[22px] font-medium text-[#333] dark:text-white">
          {mode === "edit" ? "تعديل التخصص" : "إضافة تخصص جديد"}
        </h2>

        <label className="block text-right">
          <span
            className={`mb-[8px] block text-[16px] font-medium ${
              nameError ? "text-[#c92626]" : "text-[#111] dark:text-white"
            }`}
          >
            اسم التخصص
          </span>
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            className={`h-[52px] w-full rounded-[10px] border bg-[#eeeeee] px-[16px] text-right text-[16px] text-[#333] outline-none transition placeholder:text-[#9a9a9a] dark:bg-[#505050] dark:text-white ${
              nameError
                ? "border-[#ff2020]"
                : "border-transparent focus:border-[#0fb8e8]"
            }`}
            placeholder="اكتب اسم التخصص"
          />
        </label>

        <label className="mt-[18px] block text-right">
          <span
            className={`mb-[8px] block text-[16px] font-medium ${
              priceError ? "text-[#c92626]" : "text-[#111] dark:text-white"
            }`}
          >
            سعر الكشف
          </span>
          <div
            className={`flex h-[52px] items-center rounded-[10px] border bg-[#eeeeee] px-[16px] text-[16px] text-[#333] dark:bg-[#505050] dark:text-white ${
              priceError
                ? "border-[#ff2020]"
                : "border-transparent focus-within:border-[#0fb8e8]"
            }`}
            dir="ltr"
          >
            <span className="shrink-0">جنيه</span>
            <input
              value={price}
              onChange={(event) => setPrice(normalizePrice(event.target.value))}
              className="min-w-0 flex-1 bg-transparent text-right outline-none"
              inputMode="numeric"
              dir="rtl"
            />
          </div>
        </label>

        {(nameError || priceError || generalError) && (
          <p className="mt-[14px] text-center text-[17px] font-medium text-[#c92626]">
            {nameError || priceError || generalError}
          </p>
        )}

        <div className="mt-[18px] grid grid-cols-2 gap-[7px]" dir="ltr">
          <button
            type="submit"
            disabled={submitDisabled}
            className="h-[43px] rounded-[8px] bg-gradient-to-l from-[#67d2cb] to-[#0fb8e8] text-[13px] font-semibold text-white transition disabled:cursor-not-allowed disabled:from-[#6b7280] disabled:to-[#4b5563] disabled:opacity-60"
          >
            {mode === "edit" ? "حفظ التعديل" : "إضافة"}
          </button>
          <button
            type="button"
            className="h-[43px] rounded-[8px] border border-[#0fb8e8] text-[13px] font-semibold text-[#12aee0]"
            onClick={onCancel}
          >
            إلغاء
          </button>
        </div>
      </form>
    </div>
  );
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
