import { useMemo, useState } from "react";
import ConfirmSpecialtyDeleteModal from "../../../components/admin/specialties/ConfirmSpecialtyDeleteModal";
import SpecialtiesPagination from "../../../components/admin/specialties/SpecialtiesPagination";
import SpecialtiesSelectionBar from "../../../components/admin/specialties/SpecialtiesSelectionBar";
import SpecialtiesTable from "../../../components/admin/specialties/SpecialtiesTable";
import SpecialtiesToolbar from "../../../components/admin/specialties/SpecialtiesToolbar";
import SpecialtyFormModal from "../../../components/admin/specialties/SpecialtyFormModal";
import { useUsersStore } from "../users/useUsersStore";
import {
  useSpecialtiesStore,
  validateSpecialtyName,
} from "./useSpecialtiesStore";

const pageSize = 7;

function getDoctorAppointmentsCount(doctor) {
  return doctor.appointmentsCount ?? doctor.caseCount ?? 0;
}

export default function SpecialtiesPage() {
  const { users, updateUsersSpecialty, clearUsersSpecialties } = useUsersStore();
  const {
    specialties,
    addSpecialty,
    updateSpecialty,
    deleteSpecialties,
  } = useSpecialtiesStore();
  const [selectedNames, setSelectedNames] = useState([]);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [formState, setFormState] = useState(null);
  const [formError, setFormError] = useState("");
  const [pendingDelete, setPendingDelete] = useState(null);

  const doctors = useMemo(
    () => users.filter((user) => user.role === "doctor"),
    [users],
  );

  const specialtiesStats = useMemo(
    () =>
      specialties.map((name) => {
        const specialtyDoctors = doctors.filter((doctor) => doctor.specialty === name);

        return {
          name,
          doctorsCount: specialtyDoctors.length,
          appointmentsCount: specialtyDoctors.reduce(
            (total, doctor) => total + getDoctorAppointmentsCount(doctor),
            0,
          ),
        };
      }),
    [specialties, doctors],
  );

  const filteredSpecialties = useMemo(() => {
    const query = search.trim();

    return specialtiesStats.filter((specialty) =>
      !query ? true : specialty.name.includes(query),
    );
  }, [specialtiesStats, search]);

  const totalPages = Math.max(1, Math.ceil(filteredSpecialties.length / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const pageSpecialties = filteredSpecialties.slice(
    (safeCurrentPage - 1) * pageSize,
    safeCurrentPage * pageSize,
  );
  const visibleNames = pageSpecialties.map((specialty) => specialty.name);
  const allVisibleSelected =
    visibleNames.length > 0 &&
    visibleNames.every((name) => selectedNames.includes(name));

  const openForm = (mode, name = "") => {
    setFormState({ mode, name });
    setFormError("");
  };

  const closeForm = () => {
    setFormState(null);
    setFormError("");
  };

  const handleSubmitSpecialty = (name) => {
    const error = validateSpecialtyName(
      name,
      specialties,
      formState?.mode === "edit" ? formState.name : "",
    );

    if (error) {
      setFormError(error);
      return;
    }

    if (formState.mode === "edit") {
      const normalizedName = name.trim().replace(/\s+/g, " ");
      updateSpecialty(formState.name, name);
      updateUsersSpecialty(formState.name, normalizedName);
      setSelectedNames((current) =>
        current.map((item) => (item === formState.name ? normalizedName : item)),
      );
    } else {
      addSpecialty(name);
      setCurrentPage(1);
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

  const removeSpecialties = (names) => {
    deleteSpecialties(names);
    clearUsersSpecialties(names);
    setSelectedNames((current) => current.filter((name) => !names.includes(name)));
    setPendingDelete(null);
  };

  return (
    <section>
      <header className="flex min-h-[120px] items-end justify-start bg-white px-6 pb-8 shadow-sm dark:bg-[#3a3a3a] lg:px-8">
        <div className="text-right">
          <h1 className="text-2xl font-bold lg:text-3xl">التخصصات</h1>
          <p className="mt-3 text-sm text-gray-500 dark:text-gray-300">
            تنظيم التخصصات الطبية وإضافة أو تعديل أو حذف التخصصات المتاحة.
          </p>
        </div>
      </header>

      <div className="p-4 sm:p-6 lg:p-8">
        <SpecialtiesToolbar
          search={search}
          onSearchChange={(value) => {
            setSearch(value);
            setCurrentPage(1);
          }}
          onAddClick={() => openForm("create")}
        />

        <SpecialtiesSelectionBar
          selectedCount={selectedNames.length}
          onDeleteSelected={() => setPendingDelete(selectedNames)}
          onClearSelection={() => setSelectedNames([])}
        />

        <div className="overflow-hidden rounded-xl bg-white shadow-[0_0_20px_rgba(0,0,0,0.06)] dark:bg-[#3b3b3b]">
          <SpecialtiesTable
            specialties={pageSpecialties}
            filteredCount={filteredSpecialties.length}
            selectedNames={selectedNames}
            allVisibleSelected={allVisibleSelected}
            onToggleAllVisible={toggleAllVisible}
            onToggleSpecialty={toggleSpecialty}
            onEditSpecialty={(name) => openForm("edit", name)}
            onDeleteSpecialty={setPendingDelete}
          />

          {filteredSpecialties.length > 0 && (
            <SpecialtiesPagination
              currentPage={safeCurrentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          )}
        </div>
      </div>

      {formState && (
        <SpecialtyFormModal
          mode={formState.mode}
          initialName={formState.name}
          error={formError}
          onSubmit={handleSubmitSpecialty}
          onCancel={closeForm}
        />
      )}

      {pendingDelete && (
        <ConfirmSpecialtyDeleteModal
          count={pendingDelete.length}
          onCancel={() => setPendingDelete(null)}
          onConfirm={() => removeSpecialties(pendingDelete)}
        />
      )}
    </section>
  );
}
