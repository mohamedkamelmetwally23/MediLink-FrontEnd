import { Link } from "react-router-dom";
import { Plus, Search, X } from "lucide-react";
import { specialties } from "../../../pages/admin/users/usersData";
import { doctorStatusLabels } from "./doctorStatusLabels";

export default function DoctorsToolbar({
  search,
  specialtyFilter,
  statusFilter,
  onSearchChange,
  onSpecialtyChange,
  onStatusChange,
}) {
  return (
    <div className="mb-4 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex flex-col gap-3 sm:flex-row">
        <select
          value={specialtyFilter}
          onChange={(event) => onSpecialtyChange(event.target.value)}
          className="h-[52px] rounded-xl border border-gray-200 bg-white px-4 outline-none dark:border-white/30 dark:bg-[#454545]"
        >
          <option value="">كل التخصصات</option>
          {specialties.map((specialty) => (
            <option key={specialty} value={specialty}>
              {specialty}
            </option>
          ))}
        </select>

        <select
          value={statusFilter}
          onChange={(event) => onStatusChange(event.target.value)}
          className="h-[52px] rounded-xl border border-gray-200 bg-white px-4 outline-none dark:border-white/30 dark:bg-[#454545]"
        >
          <option value="">كل الحالات</option>
          {Object.entries(doctorStatusLabels).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>

        <label className="flex h-[52px] w-full items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 text-gray-500 dark:border-white/30 dark:bg-[#454545] dark:text-gray-200 lg:w-[260px]">
          <Search size={20} />
          <input
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            className="w-full bg-transparent outline-none"
            placeholder="ابحث هنا..."
          />
          {search && (
            <button
              type="button"
              aria-label="مسح البحث"
              onClick={() => onSearchChange("")}
            >
              <X size={16} />
            </button>
          )}
        </label>
      </div>

      <Link
        to="/admin/doctors/new"
        className="inline-flex h-[52px] w-fit items-center gap-2 rounded-xl bg-gradient-to-l from-[#67d2cb] to-[#0fb8e8] px-5 font-semibold text-white"
      >
        <Plus size={20} />
        أضف طبيب
      </Link>
    </div>
  );
}
