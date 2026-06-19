import { Link, useParams } from "react-router-dom";
import { useUsersStore } from "./useUsersStore";
import DoctorForm from "./forms/DoctorForm";
import PatientForm from "./forms/PatientForm";
import ReceptionistForm from "./forms/ReceptionistForm";

export default function EditUserPage() {
  const { userId } = useParams();
  const { getUser, loading, updateUser } = useUsersStore();
  const user = getUser(userId);

  if (loading) {
    return (
      <section className="grid min-h-screen place-items-center p-6 text-center">
        <h1 className="text-2xl font-bold">جاري التحميل...</h1>
      </section>
    );
  }

  if (!user) {
    return (
      <section className="grid min-h-screen place-items-center p-6 text-center">
        <div>
          <h1 className="mb-3 text-2xl font-bold">المستخدم غير موجود</h1>
          <Link className="font-semibold text-cyan-500" to="/admin/users">
            الرجوع إلى المستخدمين
          </Link>
        </div>
      </section>
    );
  }

  const handleSubmit = (values) => updateUser(user.id, values);

  if (user.role === "doctor") {
    return (
      <DoctorForm mode="edit" initialData={user} onSubmit={handleSubmit} />
    );
  }

  if (user.role === "receptionist") {
    return (
      <ReceptionistForm
        mode="edit"
        initialData={user}
        onSubmit={handleSubmit}
      />
    );
  }

  return <PatientForm initialData={user} onSubmit={handleSubmit} />;
}
