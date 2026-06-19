import { Link, useParams } from "react-router-dom";
import ReceptionistForm from "../users/forms/ReceptionistForm";
import { useUsersStore } from "../users/useUsersStore";

export default function EditReceptionistPage() {
  const { receptionistId } = useParams();
  const { getUser, updateUser } = useUsersStore();
  const receptionist = getUser(receptionistId);

  if (!receptionist || receptionist.role !== "receptionist") {
    return (
      <section className="grid min-h-screen place-items-center p-6 text-center">
        <div>
          <h1 className="mb-3 text-2xl font-bold">موظف الاستقبال غير موجود</h1>
          <Link
            className="font-semibold text-cyan-500"
            to="/admin/receptionists"
          >
            الرجوع إلى موظفين الاستقبال
          </Link>
        </div>
      </section>
    );
  }

  const handleSubmit = (values) => updateUser(receptionistId, values);

  return (
    <ReceptionistForm
      mode="edit"
      initialData={receptionist}
      onSubmit={handleSubmit}
      returnTo="/admin/receptionists"
      title="تعديل موظف استقبال"
      subtitle="عدل بيانات الموظف ودوره ومواعيد العمل."
    />
  );
}
