import { useEffect, useMemo, useRef, useState } from "react";
import { Cigarette, FileText, Plus, Search, TestTube2, Ruler, Scale, X } from "lucide-react";
import { toast } from "react-toastify";
import avatar from "../../assets/patient departement/Avatar.png";
import xrayOne from "../../assets/doctor departement/image 12.png";
import reportImage from "../../assets/doctor departement/image 12 (1).png";
import xrayTwo from "../../assets/doctor departement/image 12 (2).png";
import {
  getCurrentAuthUser,
  getPatient,
  listAppointments,
  updateAppointmentStatus,
} from "../../services/medilinkApi";
import { getDoctorImage, getDoctorName, useDoctors } from "../../hooks/useDoctors";
import { PatientHomeFooter, PatientHomeHeader } from "./PatientHomePage";

const tabs = [
  { id: "extra", label: "معلومات إضافية" },
  { id: "files", label: "الملفات الطبية" },
  { id: "records", label: "السجل المرضي" },
  { id: "prescriptions", label: "الوصفات الطبية" },
  { id: "appointments", label: "المواعيد المحجوزة" },
];

const records = [
  { id: 1, title: "حساسية شديدة", notes: "سعال شديد واحتقان في الأنف والحنجرة", date: "12 ديسمبر 2025" },
  { id: 2, title: "حساسية موسمية", notes: "عطس متكرر واحتقان بالأنف", date: "24 فبراير 2026" },
  { id: 3, title: "التهاب الجيوب الأنفية", notes: "احتقان متوسط مع صداع متقطع", date: "3 يناير 2026" },
  { id: 4, title: "حساسية شديدة", notes: "سعال شديد واحتقان في الأنف والحنجرة", date: "30 يناير 2026" },
];

const prescriptions = [
  { date: "30 يناير 2026", rows: [["Vontolin", "حباية 1", "كل 6 ساعات", "3 أيام"], ["Paracetamol", "حباية 1", "كل 8 ساعات", "7 أيام"]] },
  { date: "3 يناير 2026", rows: [["Vontolin", "حباية 1", "كل 6 ساعات", "3 أيام"], ["Paracetamol", "حباية 1", "كل 8 ساعات", "7 أيام"]] },
  { date: "24 ديسمبر 2025", rows: [["Vontolin", "حباية 1", "كل 6 ساعات", "3 أيام"], ["Paracetamol", "حباية 1", "كل 8 ساعات", "7 أيام"]] },
];

const initialFiles = [
  { id: "sample-1", name: "20042026.PNG", src: xrayOne },
  { id: "sample-2", name: "20042026.PNG", src: xrayTwo },
  { id: "sample-3", name: "20042026.PNG", src: reportImage },
  { id: "sample-4", name: "20042026.PNG", src: xrayTwo },
  { id: "sample-5", name: "20042026.PNG", src: reportImage },
  { id: "sample-6", name: "20042026.PNG", src: xrayOne },
];

function currentPatientId(user) {
  return user?.patientId || user?.patient?._id || user?.patient?.id || user?.profile?._id || user?._id || user?.id || "";
}

function buildPatient(user, apiPatient) {
  const source = apiPatient || user?.patient || user?.profile || user || {};
  return {
    id: source.id || source._id || currentPatientId(user),
    name: source.name || [source.firstName, source.lastName].filter(Boolean).join(" ") || "خالد طارق",
    phone: source.phone || source.phoneNumber || source.mobile || "0107338300",
    image: source.profileImage || source.image || source.avatar || avatar,
    status: source.status === "inactive" ? "غير مفعل" : "مفعل",
    height: source.height || 166,
    weight: source.weight || 70,
    bloodType: source.bloodType || "O+",
    smoker: source.smoker || "نعم",
    diseases: source.chronicDiseases || source.diseases || ["السكري (النوع الثاني)", "ارتفاع ضغط الدم"],
    allergies: source.allergies || ["أكزيما", "حساسية اللاكتوز"],
    medicines: source.medications || source.medicines || ["ميتفورمين", "كورتيزون", "لوراتادين"],
  };
}

export default function PatientProfilePage() {
  const [authUser] = useState(() => getCurrentAuthUser());
  const { doctors } = useDoctors();
  const [patient, setPatient] = useState(() => buildPatient(authUser));
  const [activeTab, setActiveTab] = useState("extra");
  const [search, setSearch] = useState("");
  const [appointments, setAppointments] = useState([]);
  const [files, setFiles] = useState(initialFiles);

  useEffect(() => {
    let mounted = true;
    const patientId = currentPatientId(authUser);

    Promise.all([
      patientId ? getPatient(patientId).catch(() => null) : Promise.resolve(null),
      listAppointments().catch(() => []),
    ]).then(([patientResult, appointmentResult]) => {
      if (!mounted) return;
      setPatient(buildPatient(authUser, patientResult));
      setAppointments(
        appointmentResult.filter((appointment) =>
          !patientId || !appointment.patientId || String(appointment.patientId) === String(patientId),
        ),
      );
    });

    return () => {
      mounted = false;
    };
  }, [authUser]);

  const doctorById = useMemo(
    () => new Map(doctors.map((doctor) => [String(doctor.id), doctor])),
    [doctors],
  );

  const cancelAppointment = async (appointment) => {
    try {
      await updateAppointmentStatus(appointment.id, "cancelled");
      setAppointments((current) =>
        current.map((item) => item.id === appointment.id ? { ...item, status: "cancelled" } : item),
      );
      toast.success("تم إلغاء الموعد");
    } catch (error) {
      toast.error(error.message || "تعذر إلغاء الموعد");
    }
  };

  return (
    <div className="min-h-screen bg-[#FCFCFC] text-[#333] dark:bg-[#2E2E2E] dark:text-[#F0F0F0]" dir="rtl">
      <PatientHomeHeader />
      <main className="mx-auto w-full max-w-[1280px] px-4 py-12 sm:px-6 md:py-16 lg:px-10">
        <section className="rounded-2xl bg-white px-4 py-10 shadow-[0_4px_24px_rgba(0,0,0,.1)] dark:bg-[#383838] sm:px-8 md:px-12">
          <PatientSummary patient={patient} />
          <PatientStats patient={patient} />
          <ProfileTabs activeTab={activeTab} onChange={setActiveTab} />

          <div className="mt-6">
            {activeTab !== "extra" && (
              <div className="mb-6 flex flex-col-reverse gap-4 sm:flex-row sm:items-center sm:justify-between">
                {activeTab === "files" ? <UploadButton setFiles={setFiles} /> : <span />}
                <SearchBox value={search} onChange={setSearch} />
              </div>
            )}

            {activeTab === "extra" && <ExtraInfo patient={patient} />}
            {activeTab === "files" && <MedicalFiles files={files} search={search} />}
            {activeTab === "records" && <MedicalRecords search={search} />}
            {activeTab === "prescriptions" && <Prescriptions search={search} />}
            {activeTab === "appointments" && (
              <Appointments
                appointments={appointments}
                doctorById={doctorById}
                search={search}
                onCancel={cancelAppointment}
              />
            )}
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <button type="button" onClick={() => toast.info("سيتم فتح نموذج تعديل البيانات قريبًا")} className="rounded-xl border-2 border-[#20B7D5] py-3 font-bold text-[#20B7D5]">تعديل البيانات</button>
            <button type="button" onClick={() => toast.info("حذف الحساب يحتاج تأكيدًا من إدارة النظام")} className="rounded-xl border-2 border-red-600 py-3 font-bold text-red-600">حذف الحساب</button>
          </div>
        </section>
      </main>
      <PatientHomeFooter />
    </div>
  );
}

function PatientSummary({ patient }) {
  return (
    <header className="text-center">
      <img src={patient.image} alt={patient.name} className="mx-auto size-36 rounded-full border-[6px] border-[#EFEFEF] object-cover sm:size-44 md:size-52" />
      <h1 className="mt-5 text-2xl font-extrabold sm:text-3xl">{patient.name}</h1>
      <div className="mt-2 flex items-center justify-center gap-3 text-[#777] dark:text-[#CCC]">
        <span>{patient.phone}</span>
        <span className="rounded-md bg-green-50 px-2 py-1 text-xs text-green-700 dark:bg-green-950/30 dark:text-green-300">{patient.status}</span>
      </div>
    </header>
  );
}

function PatientStats({ patient }) {
  const stats = [
    { label: "الطول", value: patient.height, icon: Ruler },
    { label: "الوزن", value: patient.weight, icon: Scale },
    { label: "فصيلة الدم", value: patient.bloodType, icon: TestTube2 },
    { label: "مدخن", value: patient.smoker, icon: Cigarette },
  ];
  return (
    <section className="mx-auto mt-8 grid max-w-[1050px] grid-cols-2 gap-4 lg:grid-cols-4">
      {stats.map(({ label, value, icon: Icon }) => (
        <article key={label} className="flex min-h-36 flex-col items-center justify-center rounded-2xl bg-white p-4 text-center shadow-[0_5px_20px_rgba(0,0,0,.1)] dark:bg-[#424242] sm:min-h-44">
          <Icon size={42} strokeWidth={1.8} className="text-[#20B7D5]" />
          <p className="mt-3 text-[#20B7D5]">{label}</p>
          <strong className="mt-2 text-xl text-[#20B7D5]">{value}</strong>
        </article>
      ))}
    </section>
  );
}

function ProfileTabs({ activeTab, onChange }) {
  return (
    <nav className="mt-8 flex overflow-x-auto border-b border-[#D2D2D2]" aria-label="أقسام الملف الشخصي">
      {tabs.map((tab) => (
        <button key={tab.id} type="button" onClick={() => onChange(tab.id)} className={`min-w-[155px] flex-1 border-b-[3px] px-3 py-3 font-bold transition ${activeTab === tab.id ? "border-[#20B7D5] text-[#20B7D5]" : "border-transparent text-[#B7B7B7] hover:text-[#20B7D5]"}`}>{tab.label}</button>
      ))}
    </nav>
  );
}

function SearchBox({ value, onChange }) {
  return (
    <label className="flex h-12 w-full items-center gap-2 rounded-xl border border-[#DADADA] px-4 text-[#999] dark:border-[#555] sm:w-72">
      <Search size={20} />
      <input value={value} onChange={(event) => onChange(event.target.value)} placeholder="ابحث هنا..." className="min-w-0 flex-1 bg-transparent outline-none" />
      {value && <button type="button" onClick={() => onChange("")}><X size={17} /></button>}
    </label>
  );
}

function ExtraInfo({ patient }) {
  return (
    <div className="space-y-7">
      <TagGroup title="الأمراض المزمنة" values={patient.diseases} />
      <TagGroup title="الحساسيات" values={patient.allergies} />
      <TagGroup title="الأدوية" values={patient.medicines} />
    </div>
  );
}

function TagGroup({ title, values }) {
  return (
    <section>
      <h2 className="mb-3 font-bold">{title}</h2>
      <div className="flex flex-wrap gap-3">
        {values.map((value) => <span key={value} className="rounded-xl bg-[#EAF9FB] px-5 py-2 text-[#20B7D5] dark:bg-[#31504E] dark:text-[#B9F0EC]">{value}</span>)}
      </div>
    </section>
  );
}

function UploadButton({ setFiles }) {
  const inputRef = useRef(null);
  const addFiles = (selected) => {
    const next = Array.from(selected).map((file) => ({
      id: `${file.name}-${file.size}-${file.lastModified}`,
      name: file.name,
      src: file.type.startsWith("image/") ? URL.createObjectURL(file) : "",
    }));
    setFiles((current) => [...current, ...next]);
  };
  return (
    <>
      <input ref={inputRef} type="file" accept=".png,.jpg,.jpeg,.pdf" multiple className="hidden" onChange={(event) => addFiles(event.target.files || [])} />
      <button type="button" onClick={() => inputRef.current?.click()} className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-linear-to-b from-[#05ADE8] to-[#6CCCC8] px-5 font-bold text-white"><Plus size={20} />أضف ملف جديد</button>
    </>
  );
}

function MedicalFiles({ files, search }) {
  const filtered = files.filter((file) => file.name.toLowerCase().includes(search.toLowerCase()));
  return filtered.length ? (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {filtered.map((file) => (
        <article key={file.id} className="flex min-h-44 items-center justify-between gap-4 rounded-2xl bg-white p-4 shadow-[0_4px_18px_rgba(0,0,0,.1)] dark:bg-[#424242]">
          <strong className="break-all text-left">{file.name}</strong>
          {file.src ? <img src={file.src} alt={file.name} className="h-36 w-28 rounded-xl object-cover" /> : <FileText size={54} className="text-[#20B7D5]" />}
        </article>
      ))}
    </div>
  ) : <EmptyState />;
}

function MedicalRecords({ search }) {
  const filtered = records.filter((record) => `${record.title} ${record.notes}`.includes(search));
  return filtered.length ? (
    <div className="space-y-4">
      {filtered.map((record) => (
        <article key={record.id} className="flex flex-col gap-4 rounded-2xl bg-white p-5 shadow-[0_4px_18px_rgba(0,0,0,.1)] dark:bg-[#424242] sm:flex-row sm:items-center sm:justify-between">
          <div><h3 className="font-bold">{record.title}</h3><p className="mt-1 text-sm text-[#666] dark:text-[#CCC]">ملاحظات: {record.notes}</p></div>
          <time className="rounded-lg bg-[#EFFBFA] px-3 py-1 text-xs text-[#537673] dark:bg-[#31504E]">{record.date}</time>
        </article>
      ))}
    </div>
  ) : <EmptyState />;
}

function Prescriptions({ search }) {
  const filtered = prescriptions.filter((prescription) =>
    prescription.rows.some((row) => row.join(" ").toLowerCase().includes(search.toLowerCase())),
  );
  return filtered.length ? (
    <div className="space-y-8">
      {filtered.map((prescription) => (
        <section key={prescription.date}>
          <h3 className="mb-3 text-[#20B7D5]">{prescription.date}</h3>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[650px] border-separate border-spacing-y-2 text-right">
              <thead><tr>{["اسم الدواء", "الجرعة", "ميعاد الجرعة", "المدة"].map((title) => <th key={title} className="px-4 py-2">{title}</th>)}</tr></thead>
              <tbody>{prescription.rows.map((row) => <tr key={row.join("-")}>{row.map((cell) => <td key={cell} className="bg-[#F8F8F8] px-4 py-3 first:rounded-r-xl last:rounded-l-xl dark:bg-[#454545]">{cell}</td>)}</tr>)}</tbody>
            </table>
          </div>
        </section>
      ))}
    </div>
  ) : <EmptyState />;
}

function Appointments({ appointments, doctorById, search, onCancel }) {
  const filtered = appointments.filter((appointment) => {
    const doctor = doctorById.get(String(appointment.doctorId));
    return `${appointment.doctor} ${doctor?.specialty || appointment.specialty}`.toLowerCase().includes(search.toLowerCase());
  });
  return filtered.length ? (
    <div className="space-y-5">
      {filtered.map((appointment) => {
        const doctor = doctorById.get(String(appointment.doctorId));
        const status = appointment.status || "pending";
        return (
          <article key={appointment.id} className={`grid gap-5 rounded-2xl p-5 shadow-[0_4px_18px_rgba(0,0,0,.1)] sm:grid-cols-[120px_1fr_auto] sm:items-center ${status === "pending" ? "bg-[#EFFBFA] dark:bg-[#354746]" : "bg-white dark:bg-[#424242]"}`}>
            <img src={doctor ? getDoctorImage(doctor) : avatar} alt={doctor ? getDoctorName(doctor) : appointment.doctor} className="mx-auto h-28 w-28 rounded-xl object-contain" />
            <div className="text-center sm:text-right"><h3 className="text-xl font-bold">{doctor ? getDoctorName(doctor) : appointment.doctor || "طبيب ميديلينك"}</h3><p className="mt-1 text-[#666] dark:text-[#CCC]">{doctor?.specialty || appointment.specialty}</p></div>
            <div className="text-center sm:text-left">
              <span className={`rounded-lg px-3 py-1 text-xs ${status === "cancelled" ? "bg-red-50 text-red-600 dark:bg-red-950/30" : status === "completed" ? "bg-green-50 text-green-700 dark:bg-green-950/30" : "bg-[#DFF4F1] text-[#47716F] dark:bg-[#31504E]"}`}>{status === "cancelled" ? "ملغي" : status === "completed" ? "تم الانتهاء" : "قيد الانتظار"}</span>
              <p className="mt-3 text-sm">{appointment.date} - {appointment.time}</p>
              {status !== "cancelled" && status !== "completed" && <button type="button" onClick={() => onCancel(appointment)} className="mt-3 rounded-lg border border-red-500 px-5 py-2 text-sm text-red-600">إلغاء الحجز</button>}
            </div>
          </article>
        );
      })}
    </div>
  ) : <EmptyState />;
}

function EmptyState() {
  return <div className="rounded-2xl bg-[#F8F8F8] p-12 text-center text-[#888] dark:bg-[#424242] dark:text-[#CCC]">لا توجد بيانات مطابقة حاليًا.</div>;
}
