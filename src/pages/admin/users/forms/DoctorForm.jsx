import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { timeOptions, userStatuses, workDays } from "../usersData";
import { useSpecialtiesStore } from "../../specialties/useSpecialtiesStore";
import { validateDoctor } from "../validation";
import {
  Field,
  PasswordInput,
  SelectInput,
  TextInput,
  WorkDaysPicker,
  WorkHoursRange,
} from "./FormFields";
import UserFormShell from "./UserFormShell";

const initialValues = {
  firstName: "",
  lastName: "",
  gender: "male",
  role: "doctor",
  phone: "",
  status: "active",
  specialty: "",
  experience: "",
  workDays: ["السبت", "الإثنين", "الأربعاء"],
  workStart: "",
  workEnd: "",
  password: "",
  confirmPassword: "",
};

export default function DoctorForm({
  mode = "create",
  initialData,
  onSubmit,
  returnTo = "/admin/users",
  title,
  subtitle,
}) {
  const navigate = useNavigate();
  const { specialties } = useSpecialtiesStore();
  const [values, setValues] = useState({ ...initialValues, ...initialData });
  const [errors, setErrors] = useState({});

  const setField = (name, value) => {
    setValues((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: undefined }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const nextErrors = validateDoctor(values, {
      requirePassword: mode === "create",
    });
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length === 0) {
      onSubmit?.(values);
      navigate(returnTo);
    }
  };

  return (
    <UserFormShell
      title={title || (mode === "edit" ? "تعديل بيانات مستخدم" : "إضافة مستخدم")}
      subtitle={
        subtitle ||
        (mode === "edit"
          ? "عدل بيانات المستخدم ودوره ومواعيد العمل."
          : "أدخل بيانات المستخدم ودوره ومواعيد العمل لإضافته إلى النظام.")
      }
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

        <Field label="الدور" error={errors.role}>
          <SelectInput value={values.role} error={errors.role} disabled>
            <option value="doctor">طبيب</option>
          </SelectInput>
        </Field>

        <Field label="رقم الهاتف" error={errors.phone} className="lg:col-span-2">
          <TextInput
            value={values.phone}
            error={errors.phone}
            inputMode="numeric"
            onChange={(event) => setField("phone", event.target.value)}
          />
        </Field>

        <Field label="سنوات خبرة" error={errors.experience}>
          <TextInput
            value={values.experience}
            error={errors.experience}
            inputMode="numeric"
            onChange={(event) => setField("experience", event.target.value)}
          />
        </Field>

        <Field label="التخصص" error={errors.specialty}>
          <SelectInput
            value={values.specialty}
            error={errors.specialty}
            onChange={(event) => setField("specialty", event.target.value)}
          >
            <option value="">اختر التخصص</option>
            {specialties.map((specialty) => (
              <option key={specialty} value={specialty}>
                {specialty}
              </option>
            ))}
          </SelectInput>
        </Field>

        <Field label="أيام العمل" error={errors.workDays}>
          <WorkDaysPicker
            value={values.workDays}
            options={workDays}
            error={errors.workDays}
            onChange={(nextValue) => setField("workDays", nextValue)}
          />
        </Field>

        <div>
          <span className="mb-2 block text-right font-semibold text-[#111] dark:text-white">
            ساعات العمل
            <span className="mr-1 text-red-500">*</span>
          </span>
          <WorkHoursRange
            start={values.workStart}
            end={values.workEnd}
            options={timeOptions}
            startError={errors.workStart}
            endError={errors.workEnd}
            onStartChange={(nextValue) => setField("workStart", nextValue)}
            onEndChange={(nextValue) => setField("workEnd", nextValue)}
          />
        </div>

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

        <span className="hidden lg:block" />

        <Field label="كلمة المرور" error={errors.password} className="lg:col-span-2">
          <PasswordInput
            value={values.password}
            error={errors.password}
            placeholder={mode === "edit" ? "اتركها فارغة لو مش هتغيرها" : ""}
            onChange={(event) => setField("password", event.target.value)}
          />
        </Field>

        <Field
          label="تأكيد كلمة المرور"
          error={errors.confirmPassword}
          className="lg:col-span-2"
        >
          <PasswordInput
            value={values.confirmPassword}
            error={errors.confirmPassword}
            onChange={(event) => setField("confirmPassword", event.target.value)}
          />
        </Field>

        <div className="mt-2 grid gap-4 lg:col-span-2 lg:grid-cols-2">
          <button
            type="submit"
            className="h-[54px] rounded-xl bg-gradient-to-l from-[#67d2cb] to-[#0fb8e8] font-semibold text-white"
          >
            {mode === "edit" ? "حفظ التعديلات" : "إنشاء الحساب"}
          </button>
          <button
            type="button"
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
