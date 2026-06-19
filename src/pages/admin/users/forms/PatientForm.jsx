import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { userStatuses } from "../usersData";
import { validatePatient } from "../validation";
import { Field, SelectInput, TextInput } from "./FormFields";
import UserFormShell from "./UserFormShell";

const initialValues = {
  firstName: "",
  lastName: "",
  gender: "male",
  role: "patient",
  phone: "",
  status: "active",
};

export default function PatientForm({
  initialData,
  onSubmit,
  returnTo = "/admin/users",
}) {
  const navigate = useNavigate();
  const [values, setValues] = useState({ ...initialValues, ...initialData });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const hasValidationErrors = Object.keys(validatePatient(values)).length > 0;
  const submitDisabled = isSubmitting || hasValidationErrors;

  const setField = (name, value) => {
    setValues((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: undefined }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const nextErrors = validatePatient(values);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length === 0) {
      setIsSubmitting(true);

      try {
        await onSubmit?.(values);
        navigate(returnTo);
      } catch (error) {
        setErrors({
          general: error.message || "تعذر حفظ بيانات المريض",
        });
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <UserFormShell
      title="تعديل بيانات مستخدم"
      subtitle="عدل بيانات المستخدم الأساسية."
      returnTo={returnTo}
    >
      <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-2">
        <Field label="الاسم الأول" error={errors.firstName}>
          <TextInput
            value={values.firstName}
            error={errors.firstName}
            onChange={(event) => setField("firstName", event.target.value)}
          />
        </Field>

        <Field label="الاسم الأخير" error={errors.lastName}>
          <TextInput
            value={values.lastName}
            error={errors.lastName}
            onChange={(event) => setField("lastName", event.target.value)}
          />
        </Field>

        <Field label="الجنس" error={errors.gender}>
          <SelectInput
            value={values.gender}
            error={errors.gender}
            onChange={(event) => setField("gender", event.target.value)}
          >
            <option value="male">ذكر</option>
            <option value="female">أنثى</option>
          </SelectInput>
        </Field>

        <Field label="الدور">
          <SelectInput value={values.role} disabled>
            <option value="patient">مريض</option>
          </SelectInput>
        </Field>

        <Field label="رقم الهاتف" error={errors.phone}>
          <TextInput
            value={values.phone}
            error={errors.phone}
            inputMode="numeric"
            onChange={(event) => setField("phone", event.target.value)}
          />
        </Field>

        <Field label="الحالة" error={errors.status}>
          <SelectInput
            value={values.status}
            error={errors.status}
            onChange={(event) => setField("status", event.target.value)}
          >
            {Object.entries(userStatuses).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </SelectInput>
        </Field>

        {errors.general && (
          <p className="text-center text-sm font-semibold text-red-500 lg:col-span-2">
            {errors.general}
          </p>
        )}

        <div className="mt-2 grid gap-4 lg:col-span-2 lg:grid-cols-2" dir="ltr">
          <button
            type="submit"
            disabled={submitDisabled}
            className="h-[54px] rounded-xl bg-gradient-to-l from-[#67d2cb] to-[#0fb8e8] font-semibold text-white transition disabled:cursor-not-allowed disabled:from-[#6b7280] disabled:to-[#4b5563] disabled:opacity-60"
          >
            حفظ التعديلات
          </button>
          <button
            type="button"
            disabled={isSubmitting}
            onClick={() => navigate(returnTo)}
            className="h-[54px] rounded-xl border-2 border-cyan-400 font-semibold text-cyan-500"
          >
            إلغاء
          </button>
        </div>
      </form>
    </UserFormShell>
  );
}
