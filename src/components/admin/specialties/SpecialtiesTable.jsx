import { Edit3, Trash2 } from "lucide-react";
import { ArrowBadge } from "../../ui/ArrowButton";

export default function SpecialtiesTable({
  specialties,
  filteredCount,
  selectedNames,
  allVisibleSelected,
  onToggleAllVisible,
  onToggleSpecialty,
  onEditSpecialty,
  onDeleteSpecialty,
}) {
  return (
    <div className="overflow-x-auto">
      <div className="min-w-[760px]">
        <div className="grid grid-cols-[70px_1.4fr_1fr_190px] items-center bg-[#f5f5f5] px-6 py-4 font-semibold dark:bg-[#4a4a4a]">
          <button
            type="button"
            aria-label="تحديد كل التخصصات في الصفحة الحالية"
            className={`h-5 w-5 rounded border ${
              allVisibleSelected
                ? "border-cyan-400 bg-cyan-400"
                : "border-gray-400"
            }`}
            onClick={onToggleAllVisible}
          />
          <span>اسم التخصص</span>
          <span>عدد الأطباء</span>
          <span />
        </div>

        {filteredCount === 0 ? (
          <div className="grid min-h-[360px] place-items-center text-lg font-semibold">
            لا يوجد تخصصات حتى الآن
          </div>
        ) : (
          specialties.map((specialty) => {
            const selected = selectedNames.includes(specialty.name);

            return (
              <div
                key={specialty.name}
                className={`grid grid-cols-[70px_1.4fr_1fr_190px] items-center border-b border-gray-200 px-6 py-4 transition dark:border-white/20 ${
                  selected ? "bg-cyan-50 dark:bg-cyan-500/10" : ""
                }`}
              >
                <button
                  type="button"
                  aria-label={`تحديد ${specialty.name}`}
                  className={`grid h-5 w-5 place-items-center rounded border text-sm ${
                    selected
                      ? "border-cyan-400 bg-cyan-400 text-white"
                      : "border-gray-400"
                  }`}
                  onClick={() => onToggleSpecialty(specialty.name)}
                >
                  {selected ? "✓" : ""}
                </button>
                <span>{specialty.name}</span>
                <span>{specialty.doctorsCount}</span>
                <div className="flex items-center gap-4 text-gray-700 dark:text-gray-100">
                  <button
                    type="button"
                    aria-label="تعديل التخصص"
                    onClick={() => onEditSpecialty(specialty.name)}
                  >
                    <Edit3 size={22} className="dark:text-yellow-400" />
                  </button>
                  <button
                    type="button"
                    aria-label="حذف التخصص"
                    onClick={() => onDeleteSpecialty([specialty.name])}
                  >
                    <Trash2 size={22} className="text-red-600" />
                  </button>
                  <ArrowBadge className="mr-8" />
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
