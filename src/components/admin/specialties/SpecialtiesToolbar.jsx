import { Plus, Search, X } from "lucide-react";

export default function SpecialtiesToolbar({
  search,
  onSearchChange,
  onAddClick,
}) {
  return (
    <div className="mb-4 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
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

      <button
        type="button"
        className="inline-flex h-[52px] w-fit items-center gap-2 rounded-xl bg-gradient-to-l from-[#67d2cb] to-[#0fb8e8] px-5 font-semibold text-white"
        onClick={onAddClick}
      >
        <Plus size={20} />
        أضف تخصص
      </button>
    </div>
  );
}
