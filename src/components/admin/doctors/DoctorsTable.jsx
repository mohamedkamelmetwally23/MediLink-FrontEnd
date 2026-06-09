import { Link } from "react-router-dom";
import { Ban, ChevronLeft, Edit3, Trash2 } from "lucide-react";
import DoctorStatusBadge from "./DoctorStatusBadge";

function getCaseCount(doctor) {
  return doctor.caseCount ?? doctor.casesCount ?? doctor.appointmentsCount ?? 0;
}

export default function DoctorsTable({
  doctors,
  filteredCount,
  selectedIds,
  allVisibleSelected,
  onToggleAllVisible,
  onToggleDoctor,
  onToggleStatus,
  onDeleteDoctor,
}) {
  return (
    <div className="overflow-x-auto">
      <div className="min-w-[900px]">
        <div className="grid grid-cols-[70px_1.3fr_1.1fr_1fr_1fr_190px] items-center bg-[#f5f5f5] px-6 py-4 font-semibold dark:bg-[#4a4a4a]">
          <button
            type="button"
            aria-label="تحديد كل الأطباء في الصفحة الحالية"
            className={`h-5 w-5 rounded border ${
              allVisibleSelected
                ? "border-cyan-400 bg-cyan-400"
                : "border-gray-400"
            }`}
            onClick={onToggleAllVisible}
          />
          <span>الاسم</span>
          <span>التخصص</span>
          <span>عدد الحالات</span>
          <span>حالة</span>
          <span />
        </div>

        {filteredCount === 0 ? (
          <div className="grid min-h-[360px] place-items-center text-lg font-semibold">
            لا يوجد أطباء حتى الآن
          </div>
        ) : (
          doctors.map((doctor) => {
            const selected = selectedIds.includes(doctor.id);
            const fullName = `${doctor.firstName} ${doctor.lastName}`;

            return (
              <div
                key={doctor.id}
                className={`grid grid-cols-[70px_1.3fr_1.1fr_1fr_1fr_190px] items-center border-b border-gray-200 px-6 py-4 transition dark:border-white/20 ${
                  selected ? "bg-cyan-50 dark:bg-cyan-500/10" : ""
                }`}
              >
                <button
                  type="button"
                  aria-label={`تحديد ${fullName}`}
                  className={`grid h-5 w-5 place-items-center rounded border text-sm ${
                    selected
                      ? "border-cyan-400 bg-cyan-400 text-white"
                      : "border-gray-400"
                  }`}
                  onClick={() => onToggleDoctor(doctor.id)}
                >
                  {selected ? "✓" : ""}
                </button>
                <span>{fullName}</span>
                <span>{doctor.specialty || "غير محدد"}</span>
                <span>{getCaseCount(doctor)}</span>
                <DoctorStatusBadge status={doctor.status} />
                <div className="flex items-center gap-4 text-gray-700 dark:text-gray-100">
                
                  <button
                    type="button"
                    aria-label="تغيير حالة الطبيب"
                    onClick={() => onToggleStatus(doctor.id)}
                  >
                    <Ban
                      size={22}
                      className={
                        doctor.status === "active"
                          ? "text-gray-700 dark:text-gray-100"
                          : "text-red-500"
                      }
                    />
                  </button>
                  <button
                    type="button"
                    aria-label="حذف الطبيب"
                    onClick={() => onDeleteDoctor([doctor.id])}
                  >
                    <Trash2 size={22} className="text-red-600" />
                  </button>
                    <Link
                    to={`/admin/doctors/${doctor.id}/edit`}
                    aria-label="تعديل بيانات الطبيب"
                  >
                    <Edit3 size={22} className="dark:text-yellow-400" />
                  </Link>
                  <ChevronLeft size={22} className="mr-8" />
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
