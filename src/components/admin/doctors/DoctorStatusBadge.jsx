import { doctorStatusLabels } from "./doctorStatusLabels";

export default function DoctorStatusBadge({ status }) {
  const active = status === "active";

  return (
    <span
      className={`w-fit rounded-lg px-3 py-1 text-xs font-semibold ${
        active
          ? "bg-emerald-50 text-emerald-600 dark:bg-white dark:text-emerald-700"
          : "bg-red-50 text-red-500 dark:bg-white dark:text-red-600"
      }`}
    >
      {doctorStatusLabels[status]}
    </span>
  );
}
