import ReceptionistForm from "../users/forms/ReceptionistForm";
import { useUsersStore } from "../users/useUsersStore";

export default function AddReceptionistPage() {
  const { addUser } = useUsersStore();

  return (
    <ReceptionistForm
      onSubmit={addUser}
      returnTo="/admin/receptionists"
      title="إضافة موظف استقبال"
      subtitle="أدخل بيانات الموظف ودوره ومواعيد العمل لإضافته إلى النظام."
    />
  );
}
