import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ChevronLeft,
  ChevronsLeft,
  Edit3,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { userRoles, userStatuses } from "./usersData";
import { useUsersStore } from "./useUsersStore";

const pageSize = 8;

export default function UsersPage() {
  const { users, deleteUsers: removeUsers } = useUsersStore();
  const [selectedIds, setSelectedIds] = useState([]);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [pendingDelete, setPendingDelete] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  const filteredUsers = useMemo(() => {
    const query = search.trim();

    return users.filter((user) => {
      const fullName = `${user.firstName} ${user.lastName}`;
      return (
        (!query || fullName.includes(query) || user.phone.includes(query)) &&
        (!roleFilter || user.role === roleFilter) &&
        (!statusFilter || user.status === statusFilter)
      );
    });
  }, [users, search, roleFilter, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const pageUsers = filteredUsers.slice(
    (safeCurrentPage - 1) * pageSize,
    safeCurrentPage * pageSize,
  );
  const visibleIds = pageUsers.map((user) => user.id);
  const selectedCount = selectedIds.length;
  const allVisibleSelected =
    visibleIds.length > 0 && visibleIds.every((id) => selectedIds.includes(id));

  const toggleUser = (id) => {
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

  const deleteUsers = (ids) => {
    removeUsers(ids);
    setSelectedIds((current) => current.filter((id) => !ids.includes(id)));
    setPendingDelete(null);
  };

  return (
    <section>
      <header className="flex min-h-[120px] items-end justify-start bg-white px-6 pb-8 shadow-sm dark:bg-[#3a3a3a] lg:px-8">
        <div className="text-right">
          <h1 className="text-2xl font-bold lg:text-3xl">المستخدمون</h1>
          <p className="text-sm text-gray-500 dark:text-gray-300 mt-3">
            عرض وإدارة جميع حسابات المرضى والأطباء وموظفي الاستقبال.
          </p>
        </div>
      </header>

      <div className="p-4 sm:p-6 lg:p-8">
        <div className="mb-4 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-col gap-3 sm:flex-row">
            <select
              value={roleFilter}
              onChange={(event) => {
                setRoleFilter(event.target.value);
                setCurrentPage(1);
              }}
              className="h-[52px] rounded-xl border border-gray-200 bg-white px-4 outline-none dark:border-white/30 dark:bg-[#454545]"
            >
              <option value="">كل الأدوار</option>
              {Object.entries(userRoles).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={(event) => {
                setStatusFilter(event.target.value);
                setCurrentPage(1);
              }}
              className="h-[52px] rounded-xl border border-gray-200 bg-white px-4 outline-none dark:border-white/30 dark:bg-[#454545]"
            >
              <option value="">كل الحالات</option>
              {Object.entries(userStatuses).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>

            <label className="flex h-[52px] w-full items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 text-gray-500 dark:border-white/30 dark:bg-[#454545] dark:text-gray-200 lg:w-[260px]">
              <Search size={20} />
              <input
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setCurrentPage(1);
                }}
                className="w-full bg-transparent outline-none"
                placeholder="ابحث هنا..."
              />
              {search && (
                <button
                  type="button"
                  aria-label="مسح البحث"
                  onClick={() => {
                    setSearch("");
                    setCurrentPage(1);
                  }}
                >
                  <X size={16} />
                </button>
              )}
            </label>
          </div>
          <Link
            to="/admin/users/new"
            className="inline-flex h-[52px] w-fit items-center gap-2 rounded-xl bg-gradient-to-l from-[#67d2cb] to-[#0fb8e8] px-5 font-semibold text-white"
          >
            <Plus size={20} />
            أضف مستخدم
          </Link>
        </div>

        {selectedCount > 0 && (
          <div className="mb-4 flex flex-col gap-3 rounded-xl border border-cyan-200 bg-cyan-50 p-4 text-cyan-900 dark:border-cyan-500/40 dark:bg-cyan-500/10 dark:text-cyan-100 sm:flex-row sm:items-center sm:justify-between">
            <span className="font-semibold">تم تحديد {selectedCount} عنصر</span>
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
          <div className="overflow-x-auto">
            <div className="min-w-[860px]">
              <div className="grid grid-cols-[70px_1.4fr_1fr_1fr_1fr_170px] items-center bg-[#f5f5f5] px-6 py-4 font-semibold dark:bg-[#4a4a4a]">
                <button
                  type="button"
                  aria-label="تحديد كل المستخدمين في الصفحة الحالية"
                  className={`h-5 w-5 rounded border ${
                    allVisibleSelected
                      ? "border-cyan-400 bg-cyan-400"
                      : "border-gray-400"
                  }`}
                  onClick={toggleAllVisible}
                />
                <span>الاسم</span>
                <span>رقم الهاتف</span>
                <span>الدور</span>
                <span>الحالة</span>
                <span />
              </div>

              {filteredUsers.length === 0 ? (
                <div className="grid min-h-[360px] place-items-center text-lg font-semibold">
                  لا يوجد مستخدمين حتى الآن
                </div>
              ) : (
                pageUsers.map((user) => {
                  const selected = selectedIds.includes(user.id);

                  return (
                    <div
                      key={user.id}
                      className={`grid grid-cols-[70px_1.4fr_1fr_1fr_1fr_170px] items-center border-b border-gray-200 px-6 py-4 transition dark:border-white/20 ${
                        selected ? "bg-cyan-50 dark:bg-cyan-500/10" : ""
                      }`}
                    >
                      <button
                        type="button"
                        aria-label={`تحديد ${user.firstName} ${user.lastName}`}
                        className={`grid h-5 w-5 place-items-center rounded border text-sm ${
                          selected
                            ? "border-cyan-400 bg-cyan-400 text-white"
                            : "border-gray-400"
                        }`}
                        onClick={() => toggleUser(user.id)}
                      >
                        {selected ? "✓" : ""}
                      </button>
                      <span>
                        {user.firstName} {user.lastName}
                      </span>
                      <span dir="ltr" className="text-right">
                        {user.phone}
                      </span>
                      <span>{userRoles[user.role]}</span>
                      <StatusBadge status={user.status} />
                      <div className="flex items-center gap-4 text-gray-700 dark:text-gray-100">
                        <Link
                          to={`/admin/users/${user.id}/edit`}
                          aria-label="تعديل المستخدم"
                        >
                          <Edit3 size={22} className="dark:text-yellow-400" />
                        </Link>
                        <button
                          type="button"
                          aria-label="حذف المستخدم"
                          onClick={() => setPendingDelete([user.id])}
                        >
                          <Trash2 size={22} className="text-red-600" />
                        </button>
                        <ChevronLeft size={22} className="mr-15" />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {filteredUsers.length > 0 && (
            <Pagination
              currentPage={safeCurrentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          )}
        </div>
      </div>

      {pendingDelete && (
        <ConfirmDeleteModal
          count={pendingDelete.length}
          onCancel={() => setPendingDelete(null)}
          onConfirm={() => deleteUsers(pendingDelete)}
        />
      )}
    </section>
  );
}

function StatusBadge({ status }) {
  const active = status === "active";

  return (
    <span
      className={`w-fit rounded-lg px-3 py-1 text-xs font-semibold ${
        active
          ? "bg-emerald-50 text-emerald-600 dark:bg-white dark:text-emerald-700"
          : "bg-red-50 text-red-500 dark:bg-white dark:text-red-600"
      }`}
    >
      {userStatuses[status]}
    </span>
  );
}

function Pagination({ currentPage, totalPages, onPageChange }) {
  const pages = Array.from({ length: totalPages }, (_, index) => index + 1);

  return (
    <div className="flex flex-wrap items-center justify-center gap-3 py-5 font-semibold">
      <button
        type="button"
        aria-label="الصفحة الأولى"
        disabled={currentPage === 1}
        className="rotate-180 disabled:cursor-not-allowed disabled:opacity-40"
        onClick={() => onPageChange(1)}
      >
        <ChevronsLeft size={18} />
      </button>
      <button
        type="button"
        aria-label="الصفحة السابقة"
        disabled={currentPage === 1}
        className="rotate-180 disabled:cursor-not-allowed disabled:opacity-40"
        onClick={() => onPageChange(currentPage - 1)}
      >
        <ChevronLeft size={18} />
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
        className=" disabled:cursor-not-allowed disabled:opacity-40"
        onClick={() => onPageChange(currentPage + 1)}
      >
        <ChevronLeft size={18} />
      </button>
      <button
        type="button"
        aria-label="الصفحة الأخيرة"
        disabled={currentPage === totalPages}
        className=" disabled:cursor-not-allowed disabled:opacity-40"
        onClick={() => onPageChange(totalPages)}
      >
        <ChevronsLeft size={18} />
      </button>
    </div>
  );
}

function ConfirmDeleteModal({ count, onCancel, onConfirm }) {
  return (
    <div className="fixed inset-0 z-[60] grid place-items-center bg-black/45 p-4">
      <div className="w-full max-w-[350px] rounded-xl bg-white p-6 text-center shadow-2xl dark:bg-[#454545]">
        <div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-full bg-red-700 text-3xl font-bold text-white">
          !
        </div>
        <h2 className="mb-5 text-xl font-bold text-red-700 dark:text-red-300">
          {count > 1
            ? `هل أنت متأكد من حذف ${count} عناصر؟`
            : "هل أنت متأكد من حذف هذا العنصر؟"}
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
