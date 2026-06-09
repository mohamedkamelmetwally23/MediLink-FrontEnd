import DoctorForm from "../users/forms/DoctorForm";
import { useUsersStore } from "../users/useUsersStore";

export default function AddDoctorPage() {
  const { addUser } = useUsersStore();

  return (
    <DoctorForm
      onSubmit={addUser}
      returnTo="/admin/doctors"
      title="إضافة طبيب"
      subtitle="متابعة بيانات الأطباء وتخصصاتهم وحجوزاتهم."
    />
  );
}
