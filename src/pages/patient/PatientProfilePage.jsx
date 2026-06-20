import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { Cigarette, FileText, Plus, Search, TestTube2, Ruler, Scale, X } from "lucide-react";
import { toast } from "react-toastify";
import avatar from "../../assets/patient departement/Avatar.png";
import {
  getCurrentAuthUser,
  getMyPatientProfile,
  listAppointments,
  uploadPatientMedicalFiles,
  updateAppointmentStatus,
} from "../../services/medilinkApi";
import { includesSearchText } from "../../utils/searchText";
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

function currentPatientId(user) {
  return user?.patientId || user?.patient?._id || user?.patient?.id || user?.profile?._id || user?._id || user?.id || "";
}

function getMedicalFileId(file, index = 0) {
  return String(
    file?._id ||
      file?.fileId ||
      file?.id ||
      file?.url ||
      `medical-file-${index}`,
  );
}

function getMedicalFileName(file, index = 0, savedNames = {}) {
  return (
    file?.name ||
    file?.fileName ||
    file?.filename ||
    file?.originalName ||
    file?.originalname ||
    savedNames[getMedicalFileId(file, index)] ||
    `ملف طبي ${index + 1}`
  );
}

function readMedicalFileNames(patientId) {
  if (!patientId) return {};

  try {
    return JSON.parse(
      localStorage.getItem(`medilink-medical-file-names-${patientId}`) || "{}",
    );
  } catch {
    return {};
  }
}

function saveMedicalFileNames(patientId, names) {
  if (!patientId) return;
  localStorage.setItem(
    `medilink-medical-file-names-${patientId}`,
    JSON.stringify(names),
  );
}

function buildPatient(user, apiPatient) {
  const source = apiPatient || user?.patient || user?.profile || user || {};
  return {
    id: source.id || source._id || currentPatientId(user),
    name: source.name || [source.firstName, source.lastName].filter(Boolean).join(" ") || "خالد طارق",
    phone: source.phone || source.phoneNumber || source.mobile || "0107338300",
    image: source.profileImage || source.image || source.avatar || avatar,
    status: source.status === "inactive" ? "غير مفعل" : "مفعل",
    height: source.tall ?? source.height ?? "غير متوفر",
    weight: source.weight || 70,
    bloodType: source.bloodType || "غير متوفر",
    smoker:
      source.smoking === true || source.smoker === true
        ? "نعم"
        : source.smoking === false || source.smoker === false
          ? "لا"
          : source.smoking || source.smoker || "غير متوفر",
    diseases: source.chronicConditions || [],
    allergies: source.allergies || [],
    medicines: source.chronicMedications || [],
  };
}

export default function PatientProfilePage() {
  const navigate = useNavigate();
  const { patientId: routePatientId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const [authUser] = useState(() => getCurrentAuthUser());
  const { doctors } = useDoctors();
  const [patient, setPatient] = useState(() => buildPatient(authUser));
  const requestedTab = searchParams.get("tab");
  const activeTab = tabs.some((tab) => tab.id === requestedTab) ? requestedTab : "extra";
  const [search, setSearch] = useState("");
  const [appointments, setAppointments] = useState([]);
  const [files, setFiles] = useState([]);
  const [previewFile, setPreviewFile] = useState(null);

  useEffect(() => {
    let mounted = true;
    const patientId = routePatientId || currentPatientId(authUser);

    Promise.all([
      getMyPatientProfile().catch(() => null),
      listAppointments().catch(() => []),
    ]).then(([patientResult, appointmentResult]) => {
      if (!mounted) return;
      setPatient(buildPatient(authUser, patientResult));
      setFiles(
        patientResult?.medicalFiles?.map((file, index) => ({
          id: getMedicalFileId(file, index),
          name: getMedicalFileName(
            file,
            index,
            readMedicalFileNames(patientId),
          ),
          src: file.url || file.src || "",
        })) || [],
      );
      setAppointments(
        appointmentResult.filter((appointment) =>
          !patientId || !appointment.patientId || String(appointment.patientId) === String(patientId),
        ),
      );
    });

    return () => {
      mounted = false;
    };
  }, [authUser, routePatientId]);

  const changeTab = (tabId) => {
    setSearch("");
    setSearchParams({ tab: tabId }, { replace: true });
  };

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
          <ProfileTabs activeTab={activeTab} onChange={changeTab} />

          <div className="mt-6">
            {activeTab !== "extra" && (
              <div className="mb-6 flex flex-col-reverse gap-4 sm:flex-row sm:items-center sm:justify-between">
                {activeTab === "files" ? (
                  <UploadButton
                    onUploaded={async (selectedFiles) => {
                      const profile = await getMyPatientProfile();
                      const currentIds = new Set(files.map((file) => file.id));
                      const newFiles = profile.medicalFiles.filter(
                        (file, index) =>
                          !currentIds.has(getMedicalFileId(file, index)),
                      );
                      const savedNames = readMedicalFileNames(routePatientId);

                      newFiles.forEach((file, index) => {
                        const selectedFile = selectedFiles[index];
                        if (selectedFile) {
                          savedNames[getMedicalFileId(file, index)] =
                            selectedFile.name;
                        }
                      });
                      saveMedicalFileNames(routePatientId, savedNames);

                      setFiles(
                        profile.medicalFiles.map((file, index) => ({
                          id: getMedicalFileId(file, index),
                          name: getMedicalFileName(file, index, savedNames),
                          src: file.url || file.src || "",
                        })),
                      );
                    }}
                  />
                ) : <span />}
                <SearchBox value={search} onChange={setSearch} />
              </div>
            )}

            {activeTab === "extra" && <ExtraInfo patient={patient} />}
            {activeTab === "files" && (
              <MedicalFiles files={files} search={search} onPreview={setPreviewFile} />
            )}
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
            <button type="button" onClick={() => navigate(`/patient/${routePatientId}/patientinformation?edit=true`)} className="rounded-xl border-2 border-[#20B7D5] py-3 font-bold text-[#20B7D5]">تعديل البيانات</button>
            <button type="button" onClick={() => toast.info("حذف الحساب يحتاج تأكيدًا من إدارة النظام")} className="rounded-xl border-2 border-red-600 py-3 font-bold text-red-600">حذف الحساب</button>
          </div>
        </section>
      </main>
      {previewFile && (
        <div
          className="fixed inset-0 z-[100] grid place-items-center bg-black/75 p-4"
          onClick={() => setPreviewFile(null)}
        >
          <button
            type="button"
            aria-label="إغلاق المعاينة"
            className="absolute left-5 top-5 grid size-11 place-items-center rounded-full bg-white/15 text-white"
            onClick={() => setPreviewFile(null)}
          >
            <X size={25} />
          </button>
          <img
            src={previewFile.src}
            alt={previewFile.name}
            className="max-h-[88vh] max-w-[92vw] rounded-xl object-contain shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          />
        </div>
      )}
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
        {values.length > 0 ? (
          values.map((value) => <span key={value} className="rounded-xl bg-[#EAF9FB] px-5 py-2 text-[#20B7D5] dark:bg-[#31504E] dark:text-[#B9F0EC]">{value}</span>)
        ) : (
          <span className="text-sm text-[#999] dark:text-[#BBB]">لا توجد بيانات</span>
        )}
      </div>
    </section>
  );
}

function UploadButton({ onUploaded }) {
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);

  const addFiles = async (selected) => {
    const files = Array.from(selected);
    if (!files.length) return;

    setUploading(true);
    try {
      await uploadPatientMedicalFiles(files);
      await onUploaded?.(files);
      toast.success("تمت إضافة الملف الطبي بنجاح");
    } catch (error) {
      toast.error(error.message || "تعذر رفع الملف الطبي");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };
  return (
    <>
      <input ref={inputRef} type="file" accept=".png,.jpg,.jpeg,.pdf" multiple className="hidden" onChange={(event) => addFiles(event.target.files || [])} />
      <button type="button" disabled={uploading} onClick={() => inputRef.current?.click()} className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-linear-to-b from-[#05ADE8] to-[#6CCCC8] px-5 font-bold text-white disabled:opacity-60"><Plus size={20} />{uploading ? "جاري الرفع..." : "أضف ملف جديد"}</button>
    </>
  );
}

function MedicalFiles({ files, search, onPreview }) {
  const filtered = files.filter((file) => includesSearchText(file.name, search));
  return filtered.length ? (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {filtered.map((file) => (
        <article key={file.id} className="flex min-h-44 items-center justify-between gap-4 rounded-2xl bg-white p-4 shadow-[0_4px_18px_rgba(0,0,0,.1)] dark:bg-[#424242]">
          <strong className="break-all text-left">{file.name}</strong>
          {file.src ? (
            <button type="button" onClick={() => onPreview(file)}>
              <img src={file.src} alt={file.name} className="h-36 w-28 cursor-zoom-in rounded-xl object-cover" />
            </button>
          ) : <FileText size={54} className="text-[#20B7D5]" />}
        </article>
      ))}
    </div>
  ) : <EmptyState />;
}

function MedicalRecords({ search }) {
  const filtered = records.filter((record) =>
    includesSearchText(`${record.title} ${record.notes}`, search),
  );
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
    prescription.rows.some((row) => includesSearchText(row.join(" "), search)),
  );
  return filtered.length ? (
    <div className="space-y-8">
      {filtered.map((prescription) => (
        <section key={prescription.date}>
          <h3 className="mb-3 text-[#20B7D5]">{prescription.date}</h3>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[650px] border-separate border-spacing-x-3 border-spacing-y-2 text-right sm:border-spacing-x-4">
              <thead><tr>{["اسم الدواء", "الجرعة", "ميعاد الجرعة", "المدة"].map((title) => <th key={title} className="px-4 py-2">{title}</th>)}</tr></thead>
              <tbody>{prescription.rows.map((row) => <tr key={row.join("-")}>{row.map((cell) => <td key={cell} className="rounded-xl bg-[#F8F8F8] px-4 py-3 dark:bg-[#454545]">{cell}</td>)}</tr>)}</tbody>
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
    return includesSearchText(
      `${appointment.doctor} ${doctor?.specialty || appointment.specialty}`,
      search,
    );
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
