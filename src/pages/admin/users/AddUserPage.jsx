import { useState } from "react";
import DoctorForm from "./forms/DoctorForm";
import ReceptionistForm from "./forms/ReceptionistForm";
import { useUsersStore } from "./useUsersStore";

export default function AddUserPage() {
  const [role, setRole] = useState("doctor");
  const { addUser } = useUsersStore();

  return (
    <div>
      <div className="absolute lg:fixed left-30 top-25 lg:left-24 lg:top-6 z-20 flex rounded-xl border border-gray-200 bg-white p-1 shadow-sm dark:border-white/20 dark:bg-[#454545]">
        <button
          type="button"
          onClick={() => setRole("doctor")}
          className={`rounded-lg px-4 py-2 text-sm font-semibold ${
            role === "doctor"
              ? "bg-cyan-400 text-white"
              : "text-gray-500 dark:text-gray-200"
          }`}
        >
          طبيب
        </button>
        <button
          type="button"
          onClick={() => setRole("receptionist")}
          className={`rounded-lg px-4 py-2 text-sm font-semibold ${
            role === "receptionist"
              ? "bg-cyan-400 text-white"
              : "text-gray-500 dark:text-gray-200"
          }`}
        >
          استقبال
        </button>
      </div>

      {role === "doctor" ? (
        <DoctorForm onSubmit={addUser} />
      ) : (
        <ReceptionistForm onSubmit={addUser} />
      )}
    </div>
  );
}
