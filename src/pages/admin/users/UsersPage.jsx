import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Ban,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Search,
  X,
} from "lucide-react";
import CustomSelect from "../../../components/admin/CustomSelect";
import { includesSearchText } from "../../../utils/searchText";
import { userStatuses } from "./usersData";
import { useUsersStore } from "./useUsersStore";

const pageSize = 10;

function getUserDisplayName(user) {
  const fullName = [user.firstName, user.lastName].filter(Boolean).join(" ").trim();
  return fullName || user.name || user.raw?.name || "";
}

function hasUserDisplayName(user) {
  return getUserDisplayName(user).trim().length > 0;
}

function normalizeActiveValue(value) {
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value !== 0;

  if (typeof value === "string") {
    const normalizedValue = value.trim().toLowerCase();
    return !["false", "0", "inactive", "disabled", "blocked", "not active"].includes(
      normalizedValue,
    );
  }

  return null;
}

function getUserActiveStatus(user) {
  const activeValue = [
    user?.active,
    user?.isActive,
    user?.raw?.active,
    user?.raw?.isActive,
    user?.raw?.user?.active,
    user?.raw?.user?.isActive,
  ]
    .map(normalizeActiveValue)
    .find((value) => value !== null);

  return activeValue === false ? "inactive" : "active";
}

export default function UsersPage() {
  const {
    users,
    loading,
    error,
    toggleUserStatus,
  } = useUsersStore("patients");
  const [selectedIds, setSelectedIds] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [pendingStatusUser, setPendingStatusUser] = useState(null);
  const [statusRequestError, setStatusRequestError] = useState("");
  const [statusRequestLoading, setStatusRequestLoading] = useState(false);
  const [bulkBlockLoading, setBulkBlockLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const filteredUsers = useMemo(() => {
    const query = search.trim();

    return users.filter((user) => {
      const fullName = getUserDisplayName(user);

      return (
        user.role === "patient" &&
        hasUserDisplayName(user) &&
        (!query ||
          includesSearchText(fullName, query) ||
          includesSearchText(user.phone, query)) &&
        (!statusFilter || getUserActiveStatus(user) === statusFilter)
      );
    });
  }, [users, search, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const pageUsers = filteredUsers.slice(
    (safeCurrentPage - 1) * pageSize,
    safeCurrentPage * pageSize,
  );
  const visibleIds = pageUsers.map((user) => user.id);
  const selectedCount = selectedIds.length;
  const selectedUsers = users.filter((user) => selectedIds.includes(user.id));
  const allSelectedBlocked =
    selectedUsers.length > 0 &&
    selectedUsers.every((user) => getUserActiveStatus(user) === "inactive");
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

  const confirmToggleStatus = async () => {
    if (!pendingStatusUser) return;

    setStatusRequestLoading(true);
    setStatusRequestError("");

    try {
      await toggleUserStatus(pendingStatusUser.id);
      setPendingStatusUser(null);
    } catch (requestError) {
      setStatusRequestError(requestError.message || "تعذر تحديث حالة المريض");
    } finally {
      setStatusRequestLoading(false);
    }
  };

  const toggleSelectedUsersStatus = async () => {
    const targetSelectedIds = selectedUsers
      .filter((user) =>
        allSelectedBlocked
          ? getUserActiveStatus(user) === "inactive"
          : getUserActiveStatus(user) === "active",
      )
      .map((user) => user.id);

    if (targetSelectedIds.length === 0) {
      setSelectedIds([]);
      return;
    }

    setBulkBlockLoading(true);

    try {
      await Promise.all(targetSelectedIds.map((id) => toggleUserStatus(id)));
      setSelectedIds([]);
    } finally {
      setBulkBlockLoading(false);
    }
  };

  return (
    <section className="min-h-screen bg-white text-[#333] dark:bg-[#2f2f2f] dark:text-white">
      <PageHeader />

      <main className="px-4 pb-8 pt-[28px] sm:px-6 lg:px-[52px]">
        <div className="mb-[16px] flex justify-end" dir="ltr">
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
            onToggleStatus={toggleSelectedUsersStatus}
            blocking={bulkBlockLoading}
            unblock={allSelectedBlocked}
          />
        )}

        <section className="overflow-hidden bg-white dark:bg-[#505050]">
          <div className="overflow-x-auto">
            <div className="min-w-[980px]">
              <TableHeader
                allVisibleSelected={allVisibleSelected}
                onToggleAll={toggleAllVisible}
                statusFilter={statusFilter}
                onStatusChange={(value) => {
                  setStatusFilter(value);
                  setCurrentPage(1);
                }}
              />

              {loading ? (
                <TableState text="جاري تحميل المرضى..." />
              ) : error ? (
                <TableState text={error} />
              ) : filteredUsers.length === 0 ? (
                <TableState text="لا يوجد مرضى حتى الآن" />
              ) : (
                pageUsers.map((user) => (
                  <UserRow
                    key={user.id}
                    user={user}
                    selected={selectedIds.includes(user.id)}
                    onToggle={() => toggleUser(user.id)}
                    onToggleStatus={() => {
                      setStatusRequestError("");
                      setPendingStatusUser(user);
                    }}
                  />
                ))
              )}
            </div>
          </div>

          {filteredUsers.length > 0 && (
            <Pagination
              currentPage={safeCurrentPage}
              totalPages={totalPages}
              onPageChange={(page) => {
                setCurrentPage(Math.min(Math.max(page, 1), totalPages));
              }}
            />
          )}
        </section>
      </main>

      {pendingStatusUser && (
        <ConfirmStatusModal
          user={pendingStatusUser}
          error={statusRequestError}
          loading={statusRequestLoading}
          onCancel={() => {
            if (statusRequestLoading) return;
            setPendingStatusUser(null);
            setStatusRequestError("");
          }}
          onConfirm={confirmToggleStatus}
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
          المرضى
        </h1>
        <p className="mt-1 text-[16px] leading-5 text-[#8a8a8a] dark:text-gray-300">
          عرض وإدارة جميع حسابات المرضى.
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

function SelectionBar({ count, onClear, onToggleStatus, blocking, unblock }) {
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
          disabled={blocking}
          className={`flex h-[40px] items-center rounded-[11px] border px-[18px] text-[16px] font-semibold transition disabled:cursor-wait disabled:opacity-60 ${
            unblock
              ? "border-[#129a55] text-[#129a55] hover:bg-[#e8fff4] dark:hover:bg-emerald-500/10"
              : "border-[#ff2626] text-[#ff2626] hover:bg-[#fff0f0] dark:hover:bg-red-500/10"
          }`}
          onClick={onToggleStatus}
        >
          {blocking
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
  statusFilter,
  onStatusChange,
}) {
  return (
    <div className="grid h-[56px] grid-cols-[64px_1.6fr_1.35fr_1fr_118px_48px] items-center bg-[#f7f7f7] text-[17px] font-medium text-[#333] dark:bg-[#444] dark:text-white">
      <div className="flex justify-center">
        <Checkbox checked={allVisibleSelected} onClick={onToggleAll} />
      </div>
      <span className="text-center">الاسم</span>
      <span className="text-center">رقم الهاتف</span>
      <FilterSelect
        value={statusFilter}
        onChange={onStatusChange}
        label="الحالة"
      >
        <option value="">الحالة</option>
        {Object.entries(userStatuses).map(([value, label]) => (
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
      buttonClassName="relative flex h-full w-full items-center justify-center bg-transparent px-0 text-[17px] font-medium text-[#333] outline-none dark:text-white [&>span]:flex-none [&>span]:text-center [&>svg]:absolute [&>svg]:left-[18px]"
    >
      {children}
    </CustomSelect>
  );
}

function UserRow({ user, selected, onToggle, onToggleStatus }) {
  const activeStatus = getUserActiveStatus(user);

  return (
    <div
      className={`grid h-[56px] grid-cols-[64px_1.6fr_1.35fr_1fr_118px_48px] items-center border-b border-[#dddddd] text-[17px] text-[#2f2f2f] transition dark:border-white/15 dark:text-white ${
        selected ? "bg-[#eeeeee] dark:bg-white/10" : "bg-white dark:bg-[#505050]"
      }`}
    >
      <div className="flex justify-center">
        <Checkbox checked={selected} onClick={onToggle} />
      </div>
      <span className="truncate text-center">
        {getUserDisplayName(user)}
      </span>
      <span className="text-center" dir="ltr">
        {user.phone}
      </span>
      <div className="flex justify-center">
        <StatusBadge status={activeStatus} />
      </div>
      <div className="flex items-center justify-center gap-[18px]" dir="ltr">
        <button
          type="button"
          aria-label="تغيير حالة المستخدم"
          className={
            activeStatus === "inactive"
              ? "text-[#ff2020]"
              : "text-[#333] dark:text-white"
          }
          onClick={onToggleStatus}
        >
          <Ban size={23} strokeWidth={1.8} />
        </button>
      </div>
      <Link
        to={`/admin/users/${user.id}/profile`}
        aria-label="عرض المستخدم"
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
  const goToPage = (page) => onPageChange(Math.min(Math.max(page, 1), totalPages));

  return (
    <div className="flex h-[79px] items-center justify-center gap-[14px] text-[16px] font-bold text-[#333] dark:text-white">
      <button
        type="button"
        aria-label="الصفحة الأولى"
        disabled={currentPage === 1}
        className="grid h-9 w-9 place-items-center rounded-full transition hover:bg-[#eefbfd] disabled:cursor-not-allowed disabled:opacity-30 dark:hover:bg-white/10"
        onClick={() => goToPage(1)}
      >
        <ChevronsRight size={18} strokeWidth={1.7} />
      </button>
      <button
        type="button"
        aria-label="الصفحة السابقة"
        disabled={currentPage === 1}
        className="grid h-9 w-9 place-items-center rounded-full transition hover:bg-[#eefbfd] disabled:cursor-not-allowed disabled:opacity-30 dark:hover:bg-white/10"
        onClick={() => goToPage(currentPage - 1)}
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
            className={`grid h-9 w-9 place-items-center rounded-full transition ${
              page === currentPage
                ? "bg-[#38bfd7] text-white shadow-[0_8px_18px_rgba(56,191,215,0.25)]"
                : "hover:bg-[#eefbfd] dark:hover:bg-white/10"
            }`}
            onClick={() => goToPage(page)}
          >
            {page}
          </button>
        ),
      )}

      <button
        type="button"
        aria-label="الصفحة التالية"
        disabled={currentPage === totalPages}
        className="grid h-9 w-9 place-items-center rounded-full transition hover:bg-[#eefbfd] disabled:cursor-not-allowed disabled:opacity-30 dark:hover:bg-white/10"
        onClick={() => goToPage(currentPage + 1)}
      >
        <ChevronLeft size={18} strokeWidth={1.7} />
      </button>
      <button
        type="button"
        aria-label="الصفحة الأخيرة"
        disabled={currentPage === totalPages}
        className="grid h-9 w-9 place-items-center rounded-full transition hover:bg-[#eefbfd] disabled:cursor-not-allowed disabled:opacity-30 dark:hover:bg-white/10"
        onClick={() => goToPage(totalPages)}
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

function ConfirmStatusModal({ user, error, loading, onCancel, onConfirm }) {
  const isActive = getUserActiveStatus(user) === "active";

  return (
    <div className="fixed inset-0 z-[80] grid place-items-center bg-black/25 p-4">
      <div className="w-full max-w-[390px] rounded-[12px] bg-white px-[26px] pb-[18px] pt-[30px] text-center shadow-[0_16px_45px_rgba(0,0,0,0.18)] dark:bg-[#3f3f3f]">
        <div
          className={`mx-auto grid h-[54px] w-[54px] place-items-center rounded-full text-[30px] font-bold leading-none text-white ${
            isActive ? "bg-[#ff3b3b]" : "bg-[#22b66f]"
          }`}
        >
          !
        </div>
        <h2 className="mt-[20px] text-[21px] font-bold leading-7 text-[#333] dark:text-white">
          {isActive ? "هل أنت متأكد من حظر هذا العنصر" : "هل أنت متأكد من تفعيل هذا العنصر"}
        </h2>
        <p className="mt-2 text-[14px] text-[#777] dark:text-gray-300">
          سيتم تحديث الحالة في قاعدة البيانات.
        </p>
        {error && (
          <p className="mt-3 rounded-[8px] bg-[#fff0f0] px-3 py-2 text-[13px] font-medium text-[#d71919]">
            {error}
          </p>
        )}
        <div className="mt-[18px] grid grid-cols-2 gap-[6px]" dir="ltr">
          <button
            type="button"
            disabled={loading}
            className="h-[36px] rounded-[6px] border border-[#ff2626] bg-transparent text-[13px] font-semibold text-[#ff2626] transition hover:bg-[#ff2626]/10 disabled:opacity-60"
            onClick={onConfirm}
          >
            {loading ? "جاري الحفظ..." : "نعم"}
          </button>
          <button
            type="button"
            disabled={loading}
            className="h-[36px] rounded-[6px] bg-linear-to-l from-[#67d2cb] to-[#0fb8e8] text-[13px] font-semibold text-white transition hover:brightness-105 disabled:opacity-60"
            onClick={onCancel}
          >
            لا
          </button>
        </div>
      </div>
    </div>
  );
}
