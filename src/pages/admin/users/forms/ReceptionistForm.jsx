import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { timeOptions, userStatuses, workDays } from "../usersData";
import { validateReceptionist } from "../validation";
import {
  DateInput,
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
  birthDate: "",
  role: "receptionist",
  phone: "",
  status: "active",
  education: "",
  workDays: ["السبت", "الاثنين", "الاربعاء"],
  workStart: "",
  workEnd: "",
  password: "",
  confirmPassword: "",
};

function getDateYearsAgo(years, daysToAdd = 0) {
  const today = new Date();
  const targetYear = today.getFullYear() - years;
  const month = today.getMonth();
  const day = Math.min(
    today.getDate(),
    new Date(targetYear, month + 1, 0).getDate(),
  );
  const date = new Date(targetYear, month, day + daysToAdd);

  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export default function ReceptionistForm({
  mode = "create",
  initialData,
  onSubmit,
  returnTo = "/admin/users",
  title,
  subtitle,
}) {
  const navigate = useNavigate();
  const [values, setValues] = useState({ ...initialValues, ...initialData });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const setField = (name, value) => {
    setValues((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: undefined }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const nextErrors = validateReceptionist(values, {
      requirePassword: mode === "create",
      requireBirthDate: mode === "create",
    });
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length === 0) {
      setIsSubmitting(true);

      try {
        await onSubmit?.(values);
        navigate(returnTo);
      } catch (error) {
        setErrors({
          general: error.message || "تعذر حفظ بيانات موظف الاستقبال",
        });
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <UserFormShell
      title={title || (mode === "edit" ? "تعديل بيانات مستخدم" : "إضافة مستخدم")}
      returnTo={returnTo}
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
            <option value="receptionist">موظف استقبال</option>
          </SelectInput>
        </Field>

        {mode === "create" && (
          <Field label="تاريخ الميلاد" error={errors.birthDate} className="lg:col-span-2">
            <DateInput
              value={values.birthDate}
              min={getDateYearsAgo(76, 1)}
              max={getDateYearsAgo(18)}
              error={errors.birthDate}
              onChange={(event) => setField("birthDate", event.target.value)}
            />
          </Field>
        )}

        <Field label="رقم الهاتف" error={errors.phone} className="lg:col-span-2">
          <TextInput
            value={values.phone}
            error={errors.phone}
            inputMode="numeric"
            disabled={mode === "edit"}
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

        <Field label="التعليم" error={errors.education}>
          <TextInput
            value={values.education}
            error={errors.education}
            onChange={(event) => setField("education", event.target.value)}
          />
        </Field>

        <div>
          <span className="mb-2 block text-right font-semibold text-[#111] dark:text-white">
            أيام العمل
          </span>
          <WorkDaysPicker
            value={values.workDays}
            options={workDays}
            error={errors.workDays}
            onChange={(nextValue) => setField("workDays", nextValue)}
          />
        </div>

        <div>
          <span className="mb-2 block text-right font-semibold text-[#111] dark:text-white">
            ساعات العمل
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

        {mode === "create" && (
          <>
            <Field label="كلمة المرور" error={errors.password} className="lg:col-span-2">
              <PasswordInput
                value={values.password}
                error={errors.password}
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
          </>
        )}

        {errors.general && (
          <p className="text-center text-sm font-semibold text-red-500 lg:col-span-2">
            {errors.general}
          </p>
        )}

        <div className="mt-2 grid gap-4 lg:col-span-2 lg:grid-cols-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="h-[54px] rounded-xl bg-gradient-to-l from-[#67d2cb] to-[#0fb8e8] font-semibold text-white"
          >
            {mode === "edit" ? "حفظ التعديلات" : "إنشاء الحساب"}
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
