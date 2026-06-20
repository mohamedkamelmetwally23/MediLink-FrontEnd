import { useEffect, useMemo, useState } from "react";
import { Eye, EyeOff, Pencil } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import avatar from "../../assets/patient departement/default-patient-avatar.svg";
import { validateStrongPassword } from "../../utils/passwordValidation";
import { clearAuthSession } from "../../services/authApi";
import {
  changePatientPassword,
  getCurrentAuthUser,
  getCurrentUser,
  getPatient,
  updateCurrentPatient,
  updateCurrentUserPhoto,
} from "../../services/medilinkApi";
import { PatientHomeFooter, PatientHomeHeader } from "./PatientHomePage";

const gradient = "bg-linear-to-b from-[#05ADE8] to-[#6CCCC8]";

function getPatientId(user) {
  return user?.patientId || user?.patient?._id || user?.patient?.id || user?.profile?._id || user?._id || user?.id || "";
}

function getProfile(user) {
  return user?.patient || user?.profile || user || {};
}

function splitBirthDate(value) {
  const date = value ? new Date(value) : null;
  if (!date || Number.isNaN(date.getTime())) return { day: "", month: "", year: "" };
  return {
    day: String(date.getDate()),
    month: String(date.getMonth() + 1),
    year: String(date.getFullYear()),
  };
}

function savePatientToSession(patient, photo = "") {
  const current = getCurrentAuthUser() || {};
  const next = {
    ...current,
    ...patient.raw,
    id: patient.userId || current.id,
    _id: patient.userId || current._id,
    firstName: patient.firstName,
    lastName: patient.lastName,
    phone: patient.phone,
    birthDate: patient.birthDate,
    gender: patient.gender,
    patientId: patient.id,
    photo: photo || current.photo || "",
  };
  localStorage.setItem("medilinkUser", JSON.stringify(next));
  window.dispatchEvent(new CustomEvent("medilink-user-updated", { detail: next }));
}

export function PatientEditProfilePage() {
  const navigate = useNavigate();
  const { patientId: routePatientId } = useParams();
  const [authUser] = useState(() => getCurrentAuthUser());
  const profile = getProfile(authUser);
  const initialBirthDate = splitBirthDate(profile.birthDate);
  const [form, setForm] = useState({
    firstName: profile.firstName || "",
    lastName: profile.lastName || "",
    phone: profile.phone || profile.phoneNumber || "",
    gender: profile.gender || "male",
    ...initialBirthDate,
  });
  const [image, setImage] = useState(profile.photo || profile.profileImage || profile.image || profile.avatar || avatar);
  const [photoFile, setPhotoFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const patientId = routePatientId || getPatientId(authUser);

  useEffect(() => {
    let mounted = true;
    if (!patientId) return undefined;
    Promise.all([
      getPatient(patientId),
      getCurrentUser().catch(() => null),
    ]).then(([patient, currentUser]) => {
      if (!mounted) return;
      const birth = splitBirthDate(patient.birthDate);
      setForm({
        firstName: patient.firstName || "",
        lastName: patient.lastName || "",
        phone: patient.phone || "",
        gender: patient.gender || "male",
        ...birth,
      });
      if (currentUser?.photo || patient.image) {
        setImage(currentUser?.photo || patient.image);
      }
    }).catch(() => {});
    return () => {
      mounted = false;
    };
  }, [patientId]);

  const years = useMemo(
    () => Array.from({ length: 100 }, (_, index) => String(new Date().getFullYear() - index)),
    [],
  );
  const canSave = form.firstName.trim() && form.lastName.trim() && form.phone.trim() && form.day && form.month && form.year;

  const handleImage = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setPhotoFile(file);
    setImage(URL.createObjectURL(file));
  };

  const save = async () => {
    if (!canSave || !patientId) return;
    setSaving(true);
    try {
      const patient = await updateCurrentPatient({
        ...form,
        birthDate: new Date(
          Number(form.year),
          Number(form.month) - 1,
          Number(form.day),
        ).toISOString(),
      });
      let photo = "";

      if (photoFile) {
        const currentUser = await updateCurrentUserPhoto(photoFile);
        photo = currentUser?.photo || "";
        if (photo) setImage(photo);
      } else {
        const currentUser = await getCurrentUser().catch(() => null);
        photo = currentUser?.photo || "";
      }

      savePatientToSession(patient, photo);
      toast.success("تم حفظ التعديلات بنجاح");
      navigate(`/patient/${encodeURIComponent(patientId)}/profile`);
    } catch (error) {
      toast.error(error.message || "تعذر حفظ التعديلات");
    } finally {
      setSaving(false);
    }
  };

  return (
    <PatientSettingsShell>
      <section className="grid gap-8 lg:grid-cols-[1fr_240px] lg:items-start">
        <div className="order-2 lg:order-1">
          <div className="grid gap-5 sm:grid-cols-2">
            <EditField label="الاسم الأول" value={form.firstName} onChange={(value) => setForm((current) => ({ ...current, firstName: value }))} />
            <EditField label="الاسم الأخير" value={form.lastName} onChange={(value) => setForm((current) => ({ ...current, lastName: value }))} />
          </div>

          <label className="mt-6 block font-bold">تاريخ الميلاد</label>
          <div className="mt-2 grid grid-cols-3 gap-3">
            <SelectField value={form.day} onChange={(value) => setForm((current) => ({ ...current, day: value }))} options={Array.from({ length: 31 }, (_, index) => String(index + 1))} placeholder="اليوم" />
            <SelectField value={form.month} onChange={(value) => setForm((current) => ({ ...current, month: value }))} options={Array.from({ length: 12 }, (_, index) => String(index + 1))} placeholder="الشهر" />
            <SelectField value={form.year} onChange={(value) => setForm((current) => ({ ...current, year: value }))} options={years} placeholder="السنة" />
          </div>

          <fieldset className="mt-6">
            <legend className="mb-2 font-bold">الجنس</legend>
            <div className="grid grid-cols-2 gap-3">
              {[["male", "ذكر"], ["female", "أنثى"]].map(([value, label]) => (
                <button key={value} type="button" onClick={() => setForm((current) => ({ ...current, gender: value }))} className={`h-13 rounded-xl border-2 ${form.gender === value ? "border-[#20B7D5] text-[#20B7D5]" : "border-[#D5D5D5] dark:border-[#555]"}`}>{label}</button>
              ))}
            </div>
          </fieldset>

          <div className="mt-6"><EditField label="رقم الهاتف" value={form.phone} onChange={(value) => setForm((current) => ({ ...current, phone: value.replace(/\D/g, "") }))} inputMode="tel" /></div>

          <button type="button" onClick={() => navigate(`/patient/${encodeURIComponent(patientId)}/profile/change-password`)} className={`mt-8 h-13 w-full rounded-xl font-bold text-white ${gradient}`}>تغيير كلمة المرور</button>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <button type="button" onClick={() => navigate(-1)} className="h-13 rounded-xl border-2 border-[#20B7D5] font-bold text-[#20B7D5]">إلغاء</button>
            <button type="button" disabled={!canSave || saving} onClick={save} className={`h-13 rounded-xl font-bold text-white disabled:bg-[#BDBDBD] ${canSave ? gradient : ""}`}>{saving ? "جاري الحفظ..." : "حفظ التعديلات"}</button>
          </div>
        </div>

        <label className="relative order-1 mx-auto block cursor-pointer lg:order-2">
          <img src={image} alt="صورة المريض" className="size-44 rounded-full border-[6px] border-[#EFEFEF] object-cover sm:size-52" />
          <span className="absolute bottom-3 right-3 grid size-10 place-items-center rounded-full bg-[#20B7D5] text-white"><Pencil size={19} /></span>
          <input type="file" accept="image/*" className="hidden" onChange={handleImage} />
        </label>
      </section>
    </PatientSettingsShell>
  );
}

export function PatientChangePasswordPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [visible, setVisible] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);
  const passwordError = validateStrongPassword(form.newPassword);
  const mismatch = form.confirmPassword && form.newPassword !== form.confirmPassword;
  const canSubmit = form.currentPassword && !passwordError && form.confirmPassword && !mismatch;

  const submit = async () => {
    setSubmitted(true);
    if (!canSubmit) return;
    setSaving(true);
    try {
      await changePatientPassword(form);
      toast.success("تم تغيير كلمة المرور بنجاح");
      clearAuthSession();
      navigate("/login", { replace: true });
    } catch (error) {
      toast.error(error.message || "تعذر تغيير كلمة المرور");
    } finally {
      setSaving(false);
    }
  };

  return (
    <PatientSettingsShell compact>
      <h1 className="mb-8 text-center text-2xl font-extrabold sm:text-3xl">إنشاء كلمة مرور جديدة</h1>
      <div className="mx-auto max-w-2xl space-y-5">
        <PasswordField label="كلمة المرور القديمة" value={form.currentPassword} visible={visible.current} onToggle={() => setVisible((current) => ({ ...current, current: !current.current }))} onChange={(value) => setForm((current) => ({ ...current, currentPassword: value }))} />
        <PasswordField label="كلمة المرور الجديدة" value={form.newPassword} visible={visible.new} invalid={submitted && Boolean(passwordError)} onToggle={() => setVisible((current) => ({ ...current, new: !current.new }))} onChange={(value) => setForm((current) => ({ ...current, newPassword: value }))} />
        <PasswordField label="تأكيد كلمة المرور الجديدة" value={form.confirmPassword} visible={visible.confirm} invalid={submitted && Boolean(mismatch)} onToggle={() => setVisible((current) => ({ ...current, confirm: !current.confirm }))} onChange={(value) => setForm((current) => ({ ...current, confirmPassword: value }))} />

        {submitted && passwordError && (
          <ul className="list-disc space-y-1 pr-5 text-sm text-red-600">
            {(Array.isArray(passwordError) ? passwordError : [passwordError]).map((error) => <li key={error}>{error}</li>)}
          </ul>
        )}
        {submitted && mismatch && <p className="text-center text-sm font-semibold text-red-600">كلمة المرور الجديدة غير مطابقة لتأكيد كلمة المرور</p>}

        <div className="grid gap-3 pt-3 sm:grid-cols-2">
          <button type="button" onClick={() => navigate(-1)} className="h-13 rounded-xl border-2 border-[#20B7D5] font-bold text-[#20B7D5]">إلغاء</button>
          <button type="button" disabled={!canSubmit || saving} onClick={submit} className={`h-13 rounded-xl font-bold text-white disabled:bg-[#BDBDBD] ${canSubmit ? gradient : ""}`}>{saving ? "جاري التغيير..." : "تغيير كلمة المرور"}</button>
        </div>
      </div>
    </PatientSettingsShell>
  );
}

function PatientSettingsShell({ children, compact = false }) {
  return (
    <div className="min-h-screen bg-[#FCFCFC] text-[#333] dark:bg-[#2E2E2E] dark:text-[#F0F0F0]" dir="rtl">
      <PatientHomeHeader />
      <main className="mx-auto w-full max-w-[1120px] px-4 py-12 sm:px-6 md:py-20 lg:px-8">
        <section className={`rounded-2xl bg-white p-5 shadow-[0_4px_24px_rgba(0,0,0,.1)] dark:bg-[#383838] sm:p-8 md:p-12 ${compact ? "lg:px-24" : ""}`}>{children}</section>
      </main>
      <PatientHomeFooter />
    </div>
  );
}

function EditField({ label, value, onChange, inputMode }) {
  return (
    <label className="block">
      <span className="mb-2 block font-bold">{label}</span>
      <input value={value} onChange={(event) => onChange(event.target.value)} inputMode={inputMode} className="h-13 w-full rounded-xl border border-transparent bg-[#F1F1F1] px-4 outline-none focus:border-[#20B7D5] dark:bg-[#454545]" />
    </label>
  );
}

function SelectField({ value, onChange, options, placeholder }) {
  return (
    <select value={value} onChange={(event) => onChange(event.target.value)} className="h-13 min-w-0 rounded-xl border border-transparent bg-[#F1F1F1] px-3 outline-none focus:border-[#20B7D5] dark:bg-[#454545]">
      <option value="">{placeholder}</option>
      {options.map((option) => <option key={option} value={option}>{option}</option>)}
    </select>
  );
}

function PasswordField({ label, value, visible, invalid, onToggle, onChange }) {
  return (
    <label className="block">
      <span className={`mb-2 block font-bold ${invalid ? "text-red-600" : ""}`}>{label}</span>
      <span className={`flex h-13 items-center rounded-xl border bg-[#F1F1F1] px-4 dark:bg-[#454545] ${invalid ? "border-red-500" : "border-transparent focus-within:border-[#20B7D5]"}`}>
        <input type={visible ? "text" : "password"} value={value} onChange={(event) => onChange(event.target.value)} className="min-w-0 flex-1 bg-transparent outline-none" autoComplete={label.includes("القديمة") ? "current-password" : "new-password"} />
        <button type="button" aria-label={visible ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"} aria-pressed={visible} onClick={onToggle} className="grid h-8 w-8 place-items-center text-[#999] transition hover:text-[#20B7D5]">{visible ? <Eye size={20} /> : <EyeOff size={20} />}</button>
      </span>
    </label>
  );
}
