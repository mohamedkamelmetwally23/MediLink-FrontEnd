export default function DoctorsSelectionBar({
  selectedCount,
  onDeleteSelected,
  onClearSelection,
}) {
  if (selectedCount === 0) {
    return null;
  }

  return (
    <div className="mb-4 flex flex-col gap-3 rounded-xl border border-cyan-200 bg-cyan-50 p-4 text-cyan-900 dark:border-cyan-500/40 dark:bg-cyan-500/10 dark:text-cyan-100 sm:flex-row sm:items-center sm:justify-between">
      <span className="font-semibold">تم تحديد {selectedCount} طبيب</span>
      <div className="flex gap-2">
        <button
          type="button"
          className="rounded-lg bg-red-500 px-4 py-2 text-sm font-semibold text-white"
          onClick={onDeleteSelected}
        >
          امسح كل اللي متحدد
        </button>
        <button
          type="button"
          className="rounded-lg border border-cyan-300 px-4 py-2 text-sm font-semibold"
          onClick={onClearSelection}
        >
          إلغاء التحديد
        </button>
      </div>
    </div>
  );
}
