import { Link, useParams } from "react-router-dom";
import DoctorForm from "../users/forms/DoctorForm";
import { useUsersStore } from "../users/useUsersStore";

export default function EditDoctorPage() {
  const { doctorId } = useParams();
  const { getUser, updateUser } = useUsersStore();
  const doctor = getUser(doctorId);

  if (!doctor || doctor.role !== "doctor") {
    return (
      <section className="grid min-h-screen place-items-center p-6 text-center">
        <div>
          <h1 className="mb-3 text-2xl font-bold">الطبيب غير موجود</h1>
          <Link className="font-semibold text-cyan-500" to="/admin/doctors">
            الرجوع إلى الأطباء
          </Link>
        </div>
      </section>
    );
  }

  const handleSubmit = (values) => updateUser(doctorId, values);

  return (
    <DoctorForm
      mode="edit"
      initialData={doctor}
      onSubmit={handleSubmit}
      returnTo="/admin/doctors"
      title="تعديل بيانات الأطباء"
      subtitle="متابعة بيانات الأطباء وتخصصاتهم وحجوزاتهم."
    />
  );
}
