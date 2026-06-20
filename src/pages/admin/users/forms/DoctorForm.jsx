import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { timeOptions, workDays } from "../usersData";
import { useSpecialtiesStore } from "../../specialties/useSpecialtiesStore";
import { validateDoctor } from "../validation";
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
  role: "doctor",
  phone: "",
  status: "active",
  specialty: "",
  experience: "",
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

function hasCreateInput(values) {
  return [
    values.firstName,
    values.lastName,
    values.birthDate,
    values.phone,
    values.specialty,
    values.experience,
    values.workStart,
    values.workEnd,
    values.password,
    values.confirmPassword,
  ].some((value) => String(value || "").trim()) ||
    values.gender !== initialValues.gender ||
    JSON.stringify(values.workDays || []) !== JSON.stringify(initialValues.workDays);
}

export default function DoctorForm({
  mode = "create",
  initialData,
  onSubmit,
  returnTo = "/admin/users",
  title,
  subtitle,
}) {
  const navigate = useNavigate();
  const { specialties, getSpecialtyId } = useSpecialtiesStore();
  const [values, setValues] = useState({ ...initialValues, ...initialData });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const validationOptions = {
    requirePassword: mode === "create",
    requireBirthDate: mode === "create",
    ignoreBirthDate: mode === "edit",
    minAge: 27,
    requireStatus: mode === "create",
  };
  const submitDisabled = isSubmitting || (mode === "create" && !hasCreateInput(values));

  const setField = (name, value) => {
    setValues((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: undefined }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const nextErrors = validateDoctor(values, validationOptions);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      const messages = Object.values(nextErrors).flat().filter(Boolean);
      setErrors({
        ...nextErrors,
        general: messages.length
          ? messages.join(" ")
          : "راجع البيانات المطلوبة قبل الحفظ.",
      });
      return;
    }

    if (Object.keys(nextErrors).length === 0) {
      setIsSubmitting(true);

      try {
        await onSubmit?.({
          ...values,
          specializationId: getSpecialtyId(values.specialty),
        });
        navigate(returnTo);
      } catch (error) {
        setErrors({
          general: error.message || "تعذر حفظ بيانات الطبيب",
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
            maxLength={30}
            onChange={(event) => setField("firstName", event.target.value)}
          />
        </Field>

        <Field label="الاسم الأخير" error={errors.lastName}>
          <TextInput
            value={values.lastName}
            error={errors.lastName}
            maxLength={30}
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

        {mode === "create" && (
          <Field label="تاريخ الميلاد" error={errors.birthDate} className="lg:col-span-2">
            <DateInput
              value={values.birthDate}
              min={getDateYearsAgo(76, 1)}
              max={getDateYearsAgo(27)}
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

        <div className="grid gap-2 lg:col-span-2 lg:grid-cols-[210px_1fr]">
          <Field label="سنوات الخبرة" error={errors.experience}>
            <div className="relative">
              <TextInput
                value={values.experience}
                error={errors.experience}
                inputMode="numeric"
                className="pl-16"
                onChange={(event) => setField("experience", event.target.value)}
              />
              <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#333] dark:text-white">
                أعوام
              </span>
            </div>
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
        </div>

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

        <div className="mt-2 grid gap-4 lg:col-span-2 lg:grid-cols-2" dir="ltr">
          <button
            type="submit"
            disabled={submitDisabled}
            className="h-[54px] rounded-xl bg-gradient-to-l from-[#67d2cb] to-[#0fb8e8] font-semibold text-white transition disabled:cursor-not-allowed disabled:from-[#6b7280] disabled:to-[#4b5563] disabled:opacity-60"
          >
            {isSubmitting
              ? "جاري الحفظ..."
              : mode === "edit"
                ? "حفظ التعديلات"
                : "إنشاء الحساب"}
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
