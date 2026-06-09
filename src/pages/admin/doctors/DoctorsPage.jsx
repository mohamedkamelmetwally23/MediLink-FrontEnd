import { useMemo, useState } from "react";
import ConfirmDoctorDeleteModal from "../../../components/admin/doctors/ConfirmDoctorDeleteModal";
import DoctorsPagination from "../../../components/admin/doctors/DoctorsPagination";
import DoctorsSelectionBar from "../../../components/admin/doctors/DoctorsSelectionBar";
import DoctorsTable from "../../../components/admin/doctors/DoctorsTable";
import DoctorsToolbar from "../../../components/admin/doctors/DoctorsToolbar";
import { useUsersStore } from "../users/useUsersStore";

const pageSize = 10;

export default function DoctorsPage() {
  const {
    users,
    deleteUsers: removeDoctors,
    toggleUserStatus,
  } = useUsersStore();
  const [selectedIds, setSelectedIds] = useState([]);
  const [search, setSearch] = useState("");
  const [specialtyFilter, setSpecialtyFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [pendingDelete, setPendingDelete] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  const doctors = useMemo(
    () => users.filter((user) => user.role === "doctor"),
    [users],
  );

  const filteredDoctors = useMemo(() => {
    const query = search.trim();

    return doctors.filter((doctor) => {
      const fullName = `${doctor.firstName} ${doctor.lastName}`;

      return (
        (!query ||
          fullName.includes(query) ||
          doctor.phone.includes(query) ||
          doctor.specialty?.includes(query)) &&
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

  const deleteDoctors = (ids) => {
    removeDoctors(ids);
    setSelectedIds((current) => current.filter((id) => !ids.includes(id)));
    setPendingDelete(null);
  };

  return (
    <section>
      <header className="flex min-h-[120px] items-end justify-start bg-white px-6 pb-8 shadow-sm dark:bg-[#3a3a3a] lg:px-8">
        <div className="text-right">
          <h1 className="text-2xl font-bold lg:text-3xl">الأطباء</h1>
          <p className="mt-3 text-sm text-gray-500 dark:text-gray-300">
            متابعة بيانات الأطباء وتخصصاتهم وحجوزاتهم.
          </p>
        </div>
      </header>

      <div className="p-4 sm:p-6 lg:p-8">
        <DoctorsToolbar
          search={search}
          specialtyFilter={specialtyFilter}
          statusFilter={statusFilter}
          onSearchChange={(value) =>
            resetToFirstPage(() => setSearch(value))
          }
          onSpecialtyChange={(value) =>
            resetToFirstPage(() => setSpecialtyFilter(value))
          }
          onStatusChange={(value) =>
            resetToFirstPage(() => setStatusFilter(value))
          }
        />

        <DoctorsSelectionBar
          selectedCount={selectedIds.length}
          onDeleteSelected={() => setPendingDelete(selectedIds)}
          onClearSelection={() => setSelectedIds([])}
        />

        <div className="overflow-hidden rounded-xl bg-white shadow-[0_0_20px_rgba(0,0,0,0.06)] dark:bg-[#3b3b3b]">
          <DoctorsTable
            doctors={pageDoctors}
            filteredCount={filteredDoctors.length}
            selectedIds={selectedIds}
            allVisibleSelected={allVisibleSelected}
            onToggleAllVisible={toggleAllVisible}
            onToggleDoctor={toggleDoctor}
            onToggleStatus={toggleUserStatus}
            onDeleteDoctor={setPendingDelete}
          />

          {filteredDoctors.length > 0 && (
            <DoctorsPagination
              currentPage={safeCurrentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          )}
        </div>
      </div>

      {pendingDelete && (
        <ConfirmDoctorDeleteModal
          count={pendingDelete.length}
          onCancel={() => setPendingDelete(null)}
          onConfirm={() => deleteDoctors(pendingDelete)}
        />
      )}
    </section>
  );
}
