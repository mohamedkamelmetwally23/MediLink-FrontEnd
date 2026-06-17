import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Check,
  Pause,
  Pencil,
  Play,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";
import patientImage from "../../assets/landingPage/admin.png";
import cigaretteIcon from "../../assets/doctor departement/ph_cigarette.png";
import bloodIcon from "../../assets/doctor departement/hugeicons_blood.png";
import scaleIcon from "../../assets/doctor departement/ion_scale-outline.png";
import heightIcon from "../../assets/doctor departement/Group 640 (1).png";
import recordIcon from "../../assets/doctor departement/Monotone add.png";
import xrayImageOne from "../../assets/doctor departement/image 12.png";
import reportImage from "../../assets/doctor departement/image 12 (1).png";
import xrayImageTwo from "../../assets/doctor departement/image 12 (2).png";
import xrayImageThree from "../../assets/doctor departement/image 12 (3).png";
import xrayImageFour from "../../assets/doctor departement/image 12 (4).png";
import { useUsersStore } from "../admin/users/useUsersStore";

const defaultPatient = {
  name: "خالد طارق",
  role: "مريض",
  status: "مفعل",
  gender: "ذكر",
  age: "33 سنة",
  phone: "0107338300",
  birthDate: "2003-05-01",
  registeredAt: "2026-04-10",
  height: "166",
  weight: "70",
  bloodType: "O+",
  smoker: "نعم",
};

const fallbackPatients = {
  1: {
    ...defaultPatient,
    name: "محمد علي",
    phone: "01237652086",
    age: "35 سنة",
  },
  2: {
    ...defaultPatient,
    name: "سما محمد",
    phone: "01237652086",
    age: "29 سنة",
    gender: "أنثى",
  },
  5: defaultPatient,
};

function getAgeFromBirthDate(birthDate) {
  if (!birthDate) return "";

  const date = new Date(birthDate);
  if (Number.isNaN(date.getTime())) return "";

  const today = new Date();
  let age = today.getFullYear() - date.getFullYear();
  const monthDiff = today.getMonth() - date.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < date.getDate())) {
    age -= 1;
  }

  return `${age} سنة`;
}

function buildPatientFromUser(user) {
  if (!user) return null;

  const name = user.name || `${user.firstName || ""} ${user.lastName || ""}`.trim();

  return {
    ...defaultPatient,
    name: name || defaultPatient.name,
    phone: user.phone || defaultPatient.phone,
    birthDate: user.birthDate || defaultPatient.birthDate,
    registeredAt: user.createdAt || user.registrationDate || defaultPatient.registeredAt,
    height: user.height || defaultPatient.height,
    weight: user.weight || defaultPatient.weight,
    bloodType: user.bloodType || defaultPatient.bloodType,
    smoker: user.smoker || defaultPatient.smoker,
    age: getAgeFromBirthDate(user.birthDate) || user.age || defaultPatient.age,
    gender:
      user.gender === "female"
        ? "أنثى"
        : user.gender === "male"
          ? "ذكر"
          : defaultPatient.gender,
    status: user.status === "inactive" ? "غير مفعل" : defaultPatient.status,
  };
}

const menuItems = [
  { id: "booking", label: "تفاصيل الحجز" },
  { id: "info", label: "معلومات المريض" },
  { id: "files", label: "الملفات الطبية" },
  { id: "records", label: "السجل الطبي" },
  { id: "medicines", label: "الأدوية والجرعات السابقة" },
];

const steps = [
  { number: 5, label: "ملخص" },
  { number: 4, label: "المراجعة" },
  { number: 3, label: "الأدوية والجرعات" },
  { number: 2, label: "التشخيص" },
  { number: 1, label: "ملف المريض" },
];

const medicalRecords = [
  {
    id: 1,
    date: "2026/مايو/3",
    title: "حساسية شديدة",
    summary: "ملاحظات: سعال شديد واحتقان في الأنف والحنجرة",
    diagnosis: "التهاب خفيف بالجهاز التنفسي العلوي مصحوب باحتقان بالحلق وسعال متقطع.",
    notes:
      "يعاني المريض من عطس متكرر واحتقان بالأنف، وتم وصف العلاج المناسب مع تجنب مسببات الحساسية قدر الإمكان.\n\nينصح بالراحة وشرب السوائل بكثرة مع متابعة الأعراض خلال الأيام القادمة، والعودة للفحص في حال استمرار الأعراض أو تفاقمها.",
  },
  {
    id: 2,
    date: "2026/فبراير/24",
    title: "حساسية موسمية",
    summary: "ملاحظات: تجنب مسببات الحساسية",
    diagnosis: "حساسية موسمية مع احتقان متكرر في الأنف.",
    notes: "تمت التوصية بمضاد حساسية يومي وتجنب الأتربة والروائح النفاذة.",
  },
  {
    id: 3,
    date: "2026/يناير/30",
    title: "حساسية شديدة",
    summary: "ملاحظات: سعال شديد واحتقان في الأنف والحنجرة",
    diagnosis: "التهاب بالحلق مع أعراض حساسية حادة.",
    notes: "تحتاج الحالة لمتابعة بعد ثلاثة أيام في حال استمرار السعال.",
  },
  {
    id: 4,
    date: "2026/يناير/3",
    title: "التهاب الجيوب الأنفية",
    summary: "ملاحظة: سعال شديد واحتقان في الأنف",
    diagnosis: "التهاب جيوب أنفية متوسط.",
    notes: "استخدام بخاخ الأنف حسب الجرعة وشرب سوائل دافئة.",
  },
  {
    id: 5,
    date: "2025/ديسمبر/12",
    title: "حساسية شديدة",
    summary: "ملاحظات: سعال شديد واحتقان في الأنف والحنجرة",
    diagnosis: "حساسية صدرية خفيفة.",
    notes: "تم وصف موسع شعب عند اللزوم ومراجعة الأعراض بعد أسبوع.",
  },
];

const followupData = {
  diseases: ["السكري (النوع الثاني)", "ارتفاع ضغط الدم"],
  allergies: ["أكزيما", "حساسية اللاكتوز"],
  medicines: ["ميتفورمين", "كورتيزون", "لوراتادين"],
};

const prescriptions = [
  {
    date: "2026/يناير/30",
    rows: [
      ["Vontolin", "حباية 1", "كل 6 ساعات", "3 أيام"],
      ["Paracetamol", "حباية 1", "كل 8 ساعات", "7 أيام"],
    ],
  },
  {
    date: "2026/يناير/3",
    rows: [
      ["Vontolin", "حباية 1", "كل 6 ساعات", "3 أيام"],
      ["Paracetamol", "حباية 1", "كل 8 ساعات", "7 أيام"],
    ],
  },
  {
    date: "2025/ديسمبر/24",
    rows: [
      ["Vontolin", "حباية 1", "كل 6 ساعات", "3 أيام"],
      ["Paracetamol", "حباية 1", "كل 8 ساعات", "7 أيام"],
    ],
  },
];

export default function DoctorPatientProfilePage({ startExam = false }) {
  const { patientId } = useParams();
  const { getUser } = useUsersStore();
  const [consultationStep, setConsultationStep] = useState(() =>
    startExam ? "diagnosis" : "patient",
  );
  const [activeSection, setActiveSection] = useState("info");
  const [profileTab, setProfileTab] = useState("records");
  const [profileSearch, setProfileSearch] = useState("");
  const [selectedRecordId, setSelectedRecordId] = useState(null);
  const [diagnosis, setDiagnosis] = useState(
    "التهاب خفيف بالجهاز التنفسي العلوي مصحوب باحتقان بالحلق وسعال متقطع.",
  );
  const [notes, setNotes] = useState(
    "يعاني المريض من عطس متكرر واحتقان بالأنف، وتم وصف العلاج المناسب مع تجنب مسببات الحساسية قدر الإمكان.\nينصح بالراحة وشرب السوائل بكثرة مع متابعة الأعراض خلال الأيام القادمة، والعودة للفحص في حال استمرار الأعراض أو تفاقمها.",
  );
  const [medicineDate, setMedicineDate] = useState("2025-06-22");
  const [medicineRows, setMedicineRows] = useState([
    {
      id: 1,
      name: "Vontolin",
      dose: "حباية 1",
      schedule: "كل 6 ساعات",
      duration: "3 أيام",
    },
    {
      id: 2,
      name: "Paracetamol",
      dose: "حباية 1",
      schedule: "كل 8 ساعات",
      duration: "7 أيام",
    },
    {
      id: 3,
      name: "Panadol",
      dose: "حباية 1",
      schedule: "كل 12 ساعات",
      duration: "عند اللزوم",
    },
  ]);
  const [reviewDate, setReviewDate] = useState("2025-06-22");
  const [reviewNotes, setReviewNotes] = useState(
    "في حالة الإستجابة للدواء واختفاء الأعراض لا داعي للمراجعة",
  );
  const selectedRecord = useMemo(
    () => medicalRecords.find((record) => record.id === selectedRecordId),
    [selectedRecordId],
  );
  const storedPatient = getUser(patientId);
  const patient =
    buildPatientFromUser(storedPatient) ||
    fallbackPatients[patientId] ||
    defaultPatient;

  if (!startExam) {
    return (
      <PatientProfileDetails
        patient={patient}
        activeTab={profileTab}
        search={profileSearch}
        onTabChange={setProfileTab}
        onSearchChange={setProfileSearch}
      />
    );
  }

  const openSection = (sectionId) => {
    setActiveSection(sectionId);
    if (sectionId !== "records") {
      setSelectedRecordId(null);
    }
  };

  const openRecord = (recordId) => {
    setActiveSection("records");
    setSelectedRecordId(recordId);
  };

  return (
    <section className="min-h-screen bg-white text-[#333] dark:bg-[#2e2e2e] dark:text-white">
      <main className="min-h-screen w-full px-3 pb-[24px] pt-[34px] sm:px-6 sm:pb-[34px] sm:pt-[48px] xl:px-[32px] 2xl:px-[48px]">
        <Stepper currentStep={consultationStep} />

        {consultationStep === "patient" && (
          <>
            <div className="mt-[32px] grid w-full gap-[16px] lg:mt-[69px] lg:grid-cols-[320px_minmax(0,1fr)] xl:grid-cols-[376px_minmax(0,1fr)] 2xl:grid-cols-[390px_minmax(0,1fr)]">
              <ConsultationMenu activeSection={activeSection} onSectionChange={openSection} />

              <section className="min-w-0">
                {activeSection !== "records" || !selectedRecord ? (
                  <PatientCard patient={patient} />
                ) : (
                  <BackButton onClick={() => setSelectedRecordId(null)} />
                )}

                <div className="mt-[18px] min-h-[360px] sm:mt-[31px] lg:min-h-[560px]">
                  {activeSection === "booking" && <BookingDetails />}
                  {activeSection === "info" && <PatientInformation />}
                  {activeSection === "files" && <MedicalFiles large />}
                  {activeSection === "records" && !selectedRecord && (
                    <MedicalRecords onOpenRecord={openRecord} />
                  )}
                  {activeSection === "records" && selectedRecord && (
                    <MedicalRecordDetails record={selectedRecord} />
                  )}
                  {activeSection === "medicines" && <PreviousMedicines />}
                </div>
              </section>
            </div>

            <button
              type="button"
              className="mt-[21px] h-[52px] w-full rounded-[10px] bg-gradient-to-l from-[#67cbc5] to-[#0aace0] text-[16px] font-medium text-white shadow-sm transition hover:brightness-105 sm:text-[18px]"
              onClick={() => setConsultationStep("diagnosis")}
            >
              التالي
            </button>
          </>
        )}

        {consultationStep === "diagnosis" && (
          <DiagnosisStep
            diagnosis={diagnosis}
            notes={notes}
            onDiagnosisChange={setDiagnosis}
            onNotesChange={setNotes}
            onBack={() => setConsultationStep("patient")}
            onNext={() => setConsultationStep("medicines")}
          />
        )}

        {consultationStep === "medicines" && (
          <MedicinesStep
            diagnosis={diagnosis}
            notes={notes}
            onNotesChange={setNotes}
            date={medicineDate}
            onDateChange={setMedicineDate}
            medicineRows={medicineRows}
            onMedicineRowsChange={setMedicineRows}
            onBack={() => setConsultationStep("diagnosis")}
            onNext={() => setConsultationStep("review")}
          />
        )}

        {consultationStep === "review" && (
          <ReviewAppointmentStep
            reviewDate={reviewDate}
            onReviewDateChange={setReviewDate}
            reviewNotes={reviewNotes}
            onReviewNotesChange={setReviewNotes}
            onBack={() => setConsultationStep("medicines")}
            onNext={() => setConsultationStep("summary")}
          />
        )}

        {consultationStep === "summary" && (
          <SummaryStep
            diagnosis={diagnosis}
            notes={notes}
            medicineRows={medicineRows}
            reviewDate={reviewDate}
            reviewNotes={reviewNotes}
            onBack={() => setConsultationStep("review")}
          />
        )}
      </main>
    </section>
  );
}

const profileTabs = [
  { id: "extra", label: "معلومات إضافية" },
  { id: "records", label: "السجل المرضي" },
  { id: "prescriptions", label: "الوصفات الطبية" },
];

function PatientProfileDetails({
  patient,
  activeTab,
  search,
  onTabChange,
  onSearchChange,
}) {
  return (
    <section className="min-h-screen bg-white text-[#333] dark:bg-[#2e2e2e] dark:text-white">
      <header
        className="flex min-h-[118px] items-start justify-between bg-white px-4 pb-[24px] pt-[34px] shadow-[0_1px_8px_rgba(0,0,0,0.03)] dark:bg-[#343434] sm:px-8 lg:px-[32px]"
        dir="ltr"
      >
        <Link
          to="/doctor/patients"
          className="mt-[15px] flex items-center gap-[12px] text-[18px] font-medium text-[#22bada] transition hover:text-[#0aa7cf]"
        >
          <ArrowRight size={18} strokeWidth={2} />
          رجوع
        </Link>

        <div className="text-right" dir="rtl">
          <h1 className="text-[26px] font-bold leading-9 text-[#333] dark:text-white">
            ملف المريض
          </h1>
          <p className="mt-1 text-[14px] leading-5 text-[#8b8b8b] dark:text-gray-300">
            المرضى / ملف المريض
          </p>
        </div>
      </header>

      <main className="px-4 pb-[36px] pt-[31px] sm:px-8 lg:px-[32px]">
        <section className="grid gap-[24px] xl:grid-cols-[432px_minmax(0,1fr)]" dir="ltr">
          <PatientInfoPanel patient={patient} />

          <div className="space-y-[35px]" dir="rtl">
            <PatientIdentityCard patient={patient} />
            <PatientVitals patient={patient} />
          </div>
        </section>

        <PatientProfileTabs
          activeTab={activeTab}
          search={search}
          onTabChange={onTabChange}
          onSearchChange={onSearchChange}
        />
      </main>
    </section>
  );
}

function PatientInfoPanel({ patient }) {
  const info = [
    { label: "تاريخ الميلاد", value: formatProfileDate(patient.birthDate) },
    { label: "العمر", value: patient.age || defaultPatient.age },
    { label: "الجنس", value: patient.gender || defaultPatient.gender },
    { label: "رقم الهاتف", value: patient.phone || defaultPatient.phone },
    { label: "تاريخ التسجيل", value: formatProfileDate(patient.registeredAt) },
  ];

  return (
    <aside className="min-h-[544px] rounded-[10px] bg-white px-[16px] py-[32px] text-right shadow-[0_5px_22px_rgba(0,0,0,0.10)] dark:bg-[#3d3d3d] sm:px-[16px] lg:px-[16px]">
      <h2 className="mb-[31px] text-center text-[27px] font-semibold leading-10 text-[#444] dark:text-white">
        معلومات المريض
      </h2>

      <div className="mx-auto max-w-[400px]">
        {info.map((item) => (
          <div
            key={item.label}
            className="flex h-[59px] items-center justify-between border-b border-[#d0d0d0] text-[16px] text-[#666] dark:border-white/15 dark:text-gray-200"
            dir="rtl"
          >
            <span className="font-medium text-[#444] dark:text-white">{item.label}</span>
            <span>{item.value}</span>
          </div>
        ))}
      </div>
    </aside>
  );
}

function PatientIdentityCard({ patient }) {
  return (
    <article className="grid min-h-[338px] place-items-center rounded-[10px] bg-white px-6 py-[23px] text-center shadow-[0_5px_22px_rgba(0,0,0,0.10)] dark:bg-[#3d3d3d]">
      <div>
        <div className="mx-auto h-[205px] w-[205px] overflow-hidden rounded-full border-[7px] border-[#eeeeee] bg-[#f5f5f5] dark:border-[#555] dark:bg-[#454545]">
          <img src={patientImage} alt={patient.name} className="h-full w-full object-cover" />
        </div>

        <h2 className="mt-[22px] text-[28px] font-bold leading-10 text-[#333] dark:text-white">
          {patient.name}
        </h2>
        <div className="mt-[4px] flex items-center justify-center gap-[13px] text-[14px] text-[#777] dark:text-gray-300">
          <span>مريض</span>
          <span className="rounded-[6px] bg-[#e3faea] px-[8px] py-[2px] text-[10px] font-bold text-[#249f4e] dark:bg-[#254d34] dark:text-[#9cf0b4]">
            مفعل
          </span>
        </div>
      </div>
    </article>
  );
}

function PatientVitals({ patient }) {
  const vitals = [
    {
      label: "الطول",
      value: patient.height || defaultPatient.height,
      icon: heightIcon,
      className: "h-[47px] w-[62px]",
    },
    {
      label: "الوزن",
      value: patient.weight || defaultPatient.weight,
      icon: scaleIcon,
      className: "h-[38px] w-[38px]",
    },
    {
      label: "فصيلة الدم",
      value: patient.bloodType || defaultPatient.bloodType,
      icon: bloodIcon,
      className: "h-[41px] w-[41px]",
    },
    {
      label: "مدخن",
      value: patient.smoker || defaultPatient.smoker,
      icon: cigaretteIcon,
      className: "h-[40px] w-[40px]",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-[12px] sm:grid-cols-4">
      {vitals.map((item) => (
        <article
          key={item.label}
          className="grid h-[172px] place-items-center rounded-[10px] bg-white text-center shadow-[0_5px_22px_rgba(0,0,0,0.10)] dark:bg-[#3d3d3d]"
        >
          <div className="text-[#2abed7]">
            <img
              src={item.icon}
              alt=""
              className={`mx-auto object-contain ${item.className}`}
            />
            <p className="mt-[17px] text-[16px] leading-6">{item.label}</p>
            <p className="mt-[8px] text-[20px] font-bold leading-7">{item.value}</p>
          </div>
        </article>
      ))}
    </div>
  );
}

function PatientProfileTabs({
  activeTab,
  search,
  onTabChange,
  onSearchChange,
}) {
  return (
    <section className="mt-[29px]">
      <div className="grid grid-cols-3 border-b border-[#cfcfcf] text-center text-[16px] font-bold text-[#bebebe] dark:border-white/15 dark:text-gray-400 sm:text-[20px]">
        {profileTabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={`relative h-[45px] transition hover:text-[#22bada] ${
              activeTab === tab.id ? "text-[#22bada]" : ""
            }`}
            onClick={() => onTabChange(tab.id)}
          >
            {tab.label}
            {activeTab === tab.id && (
              <span className="absolute bottom-[-1px] left-0 h-[3px] w-full rounded-full bg-[#22bada]" />
            )}
          </button>
        ))}
      </div>

      <div className="mt-[34px] flex justify-start">
        <PatientProfileSearch value={search} onChange={onSearchChange} />
      </div>

      <div className="mt-[38px]">
        {activeTab === "records" && <ProfileMedicalRecords search={search} />}
        {activeTab === "prescriptions" && <ProfilePrescriptions search={search} />}
        {activeTab === "extra" && <ProfileExtraInfo search={search} />}
      </div>
    </section>
  );
}

function PatientProfileSearch({ value, onChange }) {
  return (
    <label className="flex h-[52px] w-full max-w-[260px] items-center gap-[10px] rounded-[10px] border border-[#d7d7d7] bg-white px-[12px] text-[#a0a0a0] shadow-[0_2px_8px_rgba(0,0,0,0.04)] dark:border-white/15 dark:bg-[#3d3d3d] dark:text-gray-300">
      <Search size={18} strokeWidth={1.7} />
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="ابحث هنا..."
        className="min-w-0 flex-1 bg-transparent text-right text-[14px] text-[#555] outline-none placeholder:text-[#aaa] dark:text-white dark:placeholder:text-gray-400"
      />
      {value && (
        <button
          type="button"
          aria-label="مسح البحث"
          className="text-[#999] transition hover:text-[#333] dark:hover:text-white"
          onClick={() => onChange("")}
        >
          <X size={15} strokeWidth={1.7} />
        </button>
      )}
    </label>
  );
}

function ProfileMedicalRecords({ search }) {
  const records = filterItems(medicalRecords, search, (record) =>
    [record.date, record.title, record.summary].join(" "),
  );

  return (
    <div className="space-y-[9px]">
      {records.map((record) => (
        <article
          key={record.id}
          className="grid min-h-[91px] gap-[12px] rounded-[10px] bg-white px-[16px] py-[15px] text-right shadow-[0_5px_22px_rgba(0,0,0,0.08)] dark:bg-[#3d3d3d] sm:grid-cols-[120px_minmax(0,1fr)] sm:items-center sm:px-[32px]"
          dir="ltr"
        >
          <span className="w-fit rounded-full bg-[#f0fbfb] px-[8px] py-[4px] text-left text-[10px] text-[#607070] dark:bg-[#244b50] dark:text-gray-200">
            {record.date}
          </span>
          <div dir="rtl">
            <h3 className="text-[17px] font-bold leading-7 text-[#111] dark:text-white">
              {record.title}
            </h3>
            <p className="mt-[4px] text-[12px] leading-5 text-[#333] dark:text-gray-300">
              {record.summary}
            </p>
          </div>
        </article>
      ))}
    </div>
  );
}

function ProfilePrescriptions({ search }) {
  const groups = filterItems(prescriptions, search, (group) =>
    `${group.date} ${group.rows.flat().join(" ")}`,
  );

  return (
    <div className="space-y-[48px] overflow-x-auto pb-2 text-right">
      {groups.map((group) => (
        <section key={group.date} className="min-w-[680px]">
          <p className="mb-[25px] text-[15px] font-medium text-[#22bada]">
            {group.date}
          </p>
          <div className="grid grid-cols-4 gap-[8px] text-[15px] font-medium text-[#555] dark:text-gray-200">
            <span>اسم الدواء</span>
            <span>الجرعة</span>
            <span>معاد الجرعة</span>
            <span>لمدة</span>
          </div>
          <div className="mt-[8px] space-y-[8px]">
            {group.rows.map((row) => (
              <div
                key={`${group.date}-${row.join("-")}`}
                className="grid grid-cols-4 gap-[8px] text-[20px] text-[#333] dark:text-white"
              >
                {row.map((cell) => (
                  <span
                    key={cell}
                    className="rounded-[8px] bg-[#fafafa] px-[12px] py-[10px] dark:bg-[#444]"
                  >
                    {cell}
                  </span>
                ))}
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

function ProfileExtraInfo({ search }) {
  const groups = [
    { title: "الأمراض المزمنة", values: followupData.diseases },
    { title: "الحساسيات", values: followupData.allergies },
    { title: "الأدوية", values: followupData.medicines },
  ];
  const visibleGroups = groups
    .map((group) => ({
      ...group,
      values: filterItems(group.values, search, (value) => value),
    }))
    .filter((group) => group.values.length > 0 || !search.trim());

  return (
    <div className="space-y-[38px] pt-[2px] text-right">
      {visibleGroups.map((group) => (
        <section key={group.title}>
          <h3 className="mb-[13px] text-[16px] font-bold text-[#111] dark:text-white">
            {group.title}
          </h3>
          <div className="flex flex-wrap justify-start gap-[11px]">
            {group.values.map((value) => (
              <span
                key={value}
                className="rounded-[9px] bg-[#eafbfd] px-[27px] py-[10px] text-[16px] font-medium text-[#4bbdc7] dark:bg-[#244b50] dark:text-[#86e7ef]"
              >
                {value}
              </span>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

function filterItems(items, search, getText) {
  const query = search.trim().toLowerCase();
  if (!query) return items;

  return items.filter((item) => getText(item).toLowerCase().includes(query));
}

function Stepper({ currentStep }) {
  return (
    <div className="pb-2">
      <div className="mx-auto grid w-full max-w-[1120px] grid-cols-5 items-start gap-0" dir="ltr">
        {steps.map((step, index) => (
          <StepItem
            key={step.label}
            step={step}
            index={index}
            currentStep={currentStep}
          />
        ))}
      </div>
    </div>
  );
}

function StepItem({ step, index, currentStep }) {
  const isDone =
    (currentStep !== "patient" && step.number === 1) ||
    (["medicines", "review", "summary"].includes(currentStep) && step.number === 2) ||
    (["review", "summary"].includes(currentStep) && step.number === 3) ||
    (currentStep === "summary" && step.number === 4);
  const isActive =
    (currentStep === "patient" && step.number === 1) ||
    (currentStep === "diagnosis" && step.number === 2) ||
    (currentStep === "medicines" && step.number === 3) ||
    (currentStep === "review" && step.number === 4) ||
    (currentStep === "summary" && step.number === 5);

  return (
    <div className="relative text-center">
            {index < steps.length - 1 && (
              <span className="absolute left-[calc(50%+19px)] top-[15px] h-[2px] w-[62%] bg-[#30b9d6] dark:bg-[#5ad4de] sm:left-[calc(50%+31px)] sm:top-[21px] sm:h-[3px] sm:w-[66%] lg:left-[calc(50%+39px)] lg:top-[26px]" />
            )}
            <span
              className={`relative z-10 mx-auto grid h-[32px] w-[32px] place-items-center rounded-full border-[2px] border-[#31b9d6] text-[12px] sm:h-[44px] sm:w-[44px] sm:border-[3px] sm:text-[16px] lg:h-[54px] lg:w-[54px] lg:text-[20px] ${
                isDone
                  ? "bg-gradient-to-l from-[#67cbc5] to-[#0aace0] text-white"
                  : "bg-white text-[#28b9d6] dark:bg-[#2e2e2e]"
              } ${
                isActive && !isDone
                  ? "after:h-[11px] after:w-[11px] after:rounded-full after:bg-[#51c3d1] after:content-[''] sm:after:h-[15px] sm:after:w-[15px] lg:after:h-[19px] lg:after:w-[19px]"
                  : ""
              }`}
            >
              {isDone ? (
                <Check size={30} strokeWidth={2.6} />
              ) : isActive ? null : (
                step.number
              )}
            </span>
            <p
              className={`mt-[7px] px-0.5 text-[10px] font-bold leading-4 sm:mt-[10px] sm:text-[17px] sm:leading-7 lg:mt-[18px] lg:text-[24px] xl:text-[27px] ${
                isDone
                  ? "text-[#2ec1d8]"
                  : isActive
                    ? "text-[#3c3c3c] dark:text-white"
                    : "text-[#8f8f8f]"
              }`}
            >
              {step.label}
            </p>
    </div>
  );
}

function DiagnosisStep({
  diagnosis,
  notes,
  onDiagnosisChange,
  onNotesChange,
  onBack,
  onNext,
}) {
  const [isRecording, setIsRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    if (!isRecording) return undefined;

    const timer = window.setInterval(() => {
      setSeconds((current) => current + 1);
    }, 1000);

    return () => window.clearInterval(timer);
  }, [isRecording]);

  return (
    <section className="mt-[32px] min-h-[720px] lg:mt-[56px]">
      <div className="mx-auto flex w-full max-w-[760px] flex-col items-center">
        <button
          type="button"
          aria-label={isRecording ? "إيقاف التسجيل" : "بدء التسجيل"}
          className={`doctor-record-button grid h-[118px] w-[118px] place-items-center rounded-full transition sm:h-[156px] sm:w-[156px] ${
            isRecording ? "is-recording" : ""
          }`}
          onClick={() => setIsRecording((current) => !current)}
        >
          <img
            src={recordIcon}
            alt=""
            className="h-[34px] w-[34px] object-contain sm:h-[43px] sm:w-[43px]"
          />
        </button>

        <div className="mt-[18px] flex w-full max-w-[290px] items-center justify-between sm:mt-[23px]">
          <ControlButton
            label="إلغاء التسجيل"
            onClick={() => {
              setIsRecording(false);
              setSeconds(0);
            }}
          >
            <X size={23} strokeWidth={2.7} />
          </ControlButton>

          <span className="text-[18px] font-semibold text-[#333] dark:text-white sm:text-[20px]">
            {formatTime(seconds)}
          </span>

          <ControlButton
            label={isRecording ? "إيقاف مؤقت" : "استكمال التسجيل"}
            onClick={() => setIsRecording((current) => !current)}
          >
            {isRecording ? (
              <Pause size={22} fill="currentColor" strokeWidth={2.5} />
            ) : (
              <Play size={23} fill="currentColor" strokeWidth={2.2} />
            )}
          </ControlButton>
        </div>

        <Waveform isRecording={isRecording} />
      </div>

      <div className="mt-[30px] space-y-[16px] sm:mt-[37px]">
        <EditableMedicalField
          label="التشخيص"
          value={diagnosis}
          onChange={onDiagnosisChange}
          minHeight="min-h-[58px]"
          showEditButton
        />
        <EditableMedicalField
          label="ملاحظات"
          value={notes}
          onChange={onNotesChange}
          minHeight="min-h-[172px]"
          multiline
        />
      </div>

      <div className="mt-[48px] grid gap-[12px] sm:grid-cols-2" dir="ltr">
        <button
          type="button"
          className="flex h-[54px] items-center justify-center gap-[12px] rounded-[10px] bg-gradient-to-l from-[#67cbc5] to-[#0aace0] text-[16px] font-medium text-white shadow-sm transition hover:brightness-105 sm:text-[18px]"
          onClick={onNext}
        >
          <ArrowLeft size={23} strokeWidth={2.2} />
          التالي
        </button>
        <button
          type="button"
          className="flex h-[54px] items-center justify-center gap-[12px] rounded-[10px] border-2 border-[#12b8df] bg-white text-[16px] font-medium text-[#21bdd7] transition hover:bg-[#effcff] dark:bg-transparent dark:hover:bg-white/5 sm:text-[18px]"
          onClick={onBack}
        >
          السابق
          <ArrowRight size={23} strokeWidth={2.2} />
        </button>
      </div>
    </section>
  );
}

function MedicinesStep({
  diagnosis,
  notes,
  onNotesChange,
  date,
  onDateChange,
  medicineRows,
  onMedicineRowsChange,
  onBack,
  onNext,
}) {
  const dateInputRef = useRef(null);

  const updateMedicine = (id, key, value) => {
    onMedicineRowsChange((currentRows) =>
      currentRows.map((row) =>
        row.id === id ? { ...row, [key]: value } : row,
      ),
    );
  };

  const addMedicine = () => {
    onMedicineRowsChange((currentRows) => [
      ...currentRows,
      {
        id: Date.now(),
        name: "",
        dose: "",
        schedule: "",
        duration: "",
      },
    ]);
  };

  const deleteMedicine = (id) => {
    onMedicineRowsChange((currentRows) =>
      currentRows.length > 1
        ? currentRows.filter((row) => row.id !== id)
        : currentRows,
    );
  };

  return (
    <section className="mt-[38px] min-h-[720px] lg:mt-[82px]">
      <div className="grid gap-[22px] lg:grid-cols-[minmax(0,1fr)_minmax(260px,344px)] lg:items-end lg:gap-[48px]" dir="rtl">
        <div className="text-right">
          <label className="mb-[9px] block text-[15px] font-semibold text-[#111] dark:text-white">
            التشخيص
          </label>
          <input
            value={diagnosis}
            readOnly
            className="h-[52px] w-full rounded-[8px] bg-[#fafafa] px-[18px] text-right text-[18px] text-[#333] outline-none dark:bg-[#3d3d3d] dark:text-gray-100 sm:text-[20px]"
          />
        </div>

        <div className="text-right">
          <label className="mb-[9px] block text-[15px] font-semibold text-[#111] dark:text-white">
            التاريخ
          </label>
          <button
            type="button"
            className="grid h-[52px] w-full grid-cols-[44px_minmax(0,1fr)] items-center rounded-[8px] bg-[#fafafa] px-[14px] text-[#333] dark:bg-[#3d3d3d] dark:text-gray-100"
            dir="ltr"
            onClick={() => openDatePicker(dateInputRef)}
          >
            <CalendarDays size={23} strokeWidth={1.8} className="text-[#666] dark:text-gray-200" />
            <span className="text-right text-[18px] sm:text-[20px]" dir="ltr">
              {formatDisplayDate(date)}
            </span>
            <input
              ref={dateInputRef}
              type="date"
              value={date}
              onChange={(event) => onDateChange(event.target.value)}
              className="sr-only"
              tabIndex={-1}
            />
          </button>
        </div>
      </div>

      <section className="mt-[48px] text-right">
        <h2 className="mb-[23px] text-[20px] font-semibold text-[#333] dark:text-white">
          الأدوية والجرعات
        </h2>

        <div className="overflow-x-auto pb-2">
          <div className="min-w-[760px]">
            <div
              className="grid grid-cols-[44px_repeat(4,minmax(130px,1fr))] gap-[8px] pr-[44px] text-[15px] font-semibold text-[#111] dark:text-gray-200"
              dir="ltr"
            >
              <span />
              <span className="text-right">لمدة</span>
              <span className="text-right">معاد الجرعة</span>
              <span className="text-right">الجرعة</span>
              <span className="text-right">اسم الدواء</span>
            </div>

            <div className="mt-[10px] space-y-[8px]">
              {medicineRows.map((row) => (
                <div
                  key={row.id}
                  className="grid grid-cols-[44px_repeat(4,minmax(130px,1fr))] items-center gap-[8px]"
                  dir="ltr"
                >
                  <button
                    type="button"
                    aria-label="حذف الدواء"
                    className="grid h-[50px] place-items-center text-[#ff2626] transition hover:text-[#d51212]"
                    onClick={() => deleteMedicine(row.id)}
                  >
                    <Trash2 size={23} strokeWidth={1.8} />
                  </button>
                  <MedicineInput
                    value={row.duration}
                    onChange={(value) => updateMedicine(row.id, "duration", value)}
                  />
                  <MedicineInput
                    value={row.schedule}
                    onChange={(value) => updateMedicine(row.id, "schedule", value)}
                  />
                  <MedicineInput
                    value={row.dose}
                    onChange={(value) => updateMedicine(row.id, "dose", value)}
                  />
                  <MedicineInput
                    value={row.name}
                    onChange={(value) => updateMedicine(row.id, "name", value)}
                    dir="ltr"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        <button
          type="button"
          className="mt-[14px]  flex h-[52px] flex-row-reverse items-center gap-[8px] rounded-[10px] bg-gradient-to-l from-[#67cbc5] to-[#0aace0] px-[18px] text-[16px] font-medium text-white shadow-sm transition hover:brightness-105"
          onClick={addMedicine}
        >
          <Plus size={22} strokeWidth={2} />
          إضافة دواء
        </button>
      </section>

      <section className="mt-[61px] text-right">
        <label className="mb-[10px] block text-[17px] font-semibold text-[#111] dark:text-white">
          ملاحظات
        </label>
        <textarea
          value={notes}
          onChange={(event) => onNotesChange(event.target.value)}
          rows={3}
          className="min-h-[90px] w-full resize-none rounded-[8px] bg-[#fafafa] px-[18px] py-[16px] text-right text-[17px] leading-8 text-[#333] outline-none dark:bg-[#3d3d3d] dark:text-gray-100 sm:px-[31px] sm:text-[20px]"
        />
      </section>

      <div className="mt-[63px] grid gap-[12px] sm:grid-cols-2" dir="ltr">
        <button
          type="button"
          className="flex h-[54px] items-center justify-center gap-[12px] rounded-[10px] bg-gradient-to-l from-[#67cbc5] to-[#0aace0] text-[16px] font-medium text-white shadow-sm transition hover:brightness-105 sm:text-[18px]"
          onClick={onNext}
        >
          <ArrowLeft size={23} strokeWidth={2.2} />
          التالي
        </button>
        <button
          type="button"
          className="flex h-[54px] items-center justify-center gap-[12px] rounded-[10px] border-2 border-[#12b8df] bg-white text-[16px] font-medium text-[#21bdd7] transition hover:bg-[#effcff] dark:bg-transparent dark:hover:bg-white/5 sm:text-[18px]"
          onClick={onBack}
        >
          السابق
          <ArrowRight size={23} strokeWidth={2.2} />
        </button>
      </div>
    </section>
  );
}

function MedicineInput({ value, onChange, dir = "rtl" }) {
  return (
    <input
      value={value}
      onChange={(event) => onChange(event.target.value)}
      dir={dir}
      className="h-[52px] min-w-0 rounded-[8px] bg-[#fafafa] px-[14px] text-right text-[18px] text-[#333] outline-none dark:bg-[#3d3d3d] dark:text-gray-100 sm:text-[20px]"
    />
  );
}

function ReviewAppointmentStep({
  reviewDate,
  onReviewDateChange,
  reviewNotes,
  onReviewNotesChange,
  onBack,
  onNext,
}) {
  const reviewDateInputRef = useRef(null);

  return (
    <section className="mt-[48px] min-h-[720px] lg:mt-[82px]">
      <div className="w-full max-w-[544px] space-y-[31px] text-right">
        <div className="w-auto">
          <label className="mb-[9px] block text-[15px] font-semibold text-[#111] dark:text-white">
            التاريخ
          </label>
          <button
            type="button"
            className="grid h-[52px] w-full grid-cols-[44px_minmax(0,1fr)] items-center rounded-[8px] bg-[#fafafa] px-[14px] text-[#333] dark:bg-[#3d3d3d] dark:text-gray-100"
            dir="ltr"
            onClick={() => openDatePicker(reviewDateInputRef)}
          >
            <CalendarDays size={23} strokeWidth={1.8} className="text-[#666] dark:text-gray-200" />
            <span className="text-right text-[18px] sm:text-[20px]" dir="ltr">
              {formatDisplayDate(reviewDate)}
            </span>
            <input
              ref={reviewDateInputRef}
              type="date"
              value={reviewDate}
              onChange={(event) => onReviewDateChange(event.target.value)}
              className="sr-only"
              tabIndex={-1}
            />
          </button>
        </div>

        <div>
          <label className="mb-[10px] block text-[17px] font-semibold text-[#111] dark:text-white">
            ملاحظات
          </label>
          <textarea
            value={reviewNotes}
            onChange={(event) => onReviewNotesChange(event.target.value)}
            rows={2}
            className="min-h-[56px] w-full resize-none rounded-[8px] bg-[#fafafa] px-[18px] py-[12px] text-right text-[17px] leading-8 text-[#333] outline-none dark:bg-[#3d3d3d] dark:text-gray-100 sm:px-[31px] sm:text-[20px]"
          />
        </div>
      </div>

      <div className="mt-[180px] grid gap-[12px] sm:grid-cols-2 lg:mt-[499px]" dir="ltr">
        <button
          type="button"
          className="flex h-[54px] items-center justify-center gap-[12px] rounded-[10px] bg-gradient-to-l from-[#67cbc5] to-[#0aace0] text-[16px] font-medium text-white shadow-sm transition hover:brightness-105 sm:text-[18px]"
          onClick={onNext}
        >
          <ArrowLeft size={23} strokeWidth={2.2} />
          التالي
        </button>
        <button
          type="button"
          className="flex h-[54px] items-center justify-center gap-[12px] rounded-[10px] border-2 border-[#12b8df] bg-white text-[16px] font-medium text-[#21bdd7] transition hover:bg-[#effcff] dark:bg-transparent dark:hover:bg-white/5 sm:text-[18px]"
          onClick={onBack}
        >
          السابق
          <ArrowRight size={23} strokeWidth={2.2} />
        </button>
      </div>
    </section>
  );
}

function SummaryStep({
  diagnosis,
  notes,
  medicineRows,
  reviewDate,
  reviewNotes,
  onBack,
}) {
  return (
    <section className="mt-[48px] min-h-[720px] lg:mt-[82px]">
      <article className="grid min-h-[108px] items-center rounded-[10px] bg-white px-[22px] py-[18px] text-right shadow-[0_5px_22px_rgba(0,0,0,0.09)] dark:bg-[#3d3d3d] sm:grid-cols-[120px_minmax(0,1fr)] sm:px-[34px]" dir="ltr">
        <span className="text-left text-[10px] text-[#456] dark:text-gray-300">
          {formatDisplayDate(reviewDate)}
        </span>
        <div dir="rtl">
          <h2 className="text-[18px] font-bold leading-7 text-[#111] dark:text-white">
            {diagnosis}
          </h2>
          <p className="mt-[6px] text-[12px] leading-5 text-[#333] dark:text-gray-200">
            ملاحظات: {notes}
          </p>
        </div>
      </article>

      <section className="mt-[48px] rounded-[10px] bg-[#F0FAF9] px-[22px] py-[22px] text-right dark:bg-[#24484b] sm:px-[24px]">
        <h2 className="mb-[28px] text-[22px] font-semibold text-[#333] dark:text-white">
          الأدوية والجرعات
        </h2>

        <div className="overflow-x-auto pb-1">
          <div className="min-w-[720px]">
            <div className="grid grid-cols-4 gap-[8px] text-[16px] font-semibold text-[#111] dark:text-gray-100">
              <span>اسم الدواء</span>
              <span>الجرعة</span>
              <span>معاد الجرعة</span>
              <span>لمدة</span>
            </div>
            <div className="mt-[11px] space-y-[8px]">
              {medicineRows.map((row) => (
                <div
                  key={row.id}
                  className="grid grid-cols-4 gap-[8px] text-[18px] text-[#333] dark:text-white sm:text-[20px]"
                >
                  <SummaryCell>{row.name}</SummaryCell>
                  <SummaryCell>{row.dose}</SummaryCell>
                  <SummaryCell>{row.schedule}</SummaryCell>
                  <SummaryCell>{row.duration}</SummaryCell>
                </div>
              ))}
            </div>
          </div>
        </div>

        <h3 className="mb-[11px] mt-[27px] text-[16px] font-semibold text-[#111] dark:text-white">
          ملاحظات
        </h3>
        <div className="min-h-[90px] rounded-[8px] bg-[#FAFAFA] px-[22px] py-[17px] text-[18px] leading-8 text-[#333] dark:bg-[#3d3d3d] dark:text-gray-100 sm:text-[20px]">
          {notes}
        </div>
      </section>

      <section className="mt-[48px] rounded-[10px] bg-[#F0FAF9] px-[22px] py-[22px] text-right dark:bg-[#24484b] sm:px-[24px]">
        <h2 className="mb-[28px] text-[22px] font-semibold text-[#333] dark:text-white">
          المراجعة
        </h2>

        <div className="grid gap-[16px] lg:grid-cols-[minmax(260px,344px)_minmax(0,1fr)] lg:items-end">
          <div className="text-right">
            <label className="mb-[9px] block text-[15px] font-semibold text-[#111] dark:text-white">
              التاريخ
            </label>
            <div className="grid h-[52px] grid-cols-[44px_minmax(0,1fr)] items-center rounded-[8px] bg-[#FAFAFA] px-[14px] text-[#333] dark:bg-[#3d3d3d] dark:text-gray-100" dir="ltr">
              <CalendarDays size={23} strokeWidth={1.8} className="text-[#666] dark:text-gray-200" />
              <span className="text-right text-[18px] sm:text-[20px]" dir="ltr">
                {formatDisplayDate(reviewDate)}
              </span>
            </div>
          </div>

          <div className="text-right">
            <label className="mb-[9px] block text-[15px] font-semibold text-[#111] dark:text-white">
              ملاحظات
            </label>
            <div className="min-h-[52px] rounded-[8px] bg-[#FAFAFA] px-[18px] py-[12px] text-[18px] leading-8 text-[#333] dark:bg-[#3d3d3d] dark:text-gray-100 sm:px-[31px] sm:text-[20px]">
              {reviewNotes}
            </div>
          </div>
        </div>
      </section>

      <div className="mt-[60px] grid gap-[12px] sm:grid-cols-2" dir="ltr">
        <button
          type="button"
          className="flex h-[54px] items-center justify-center gap-[12px] rounded-[10px] bg-gradient-to-l from-[#67cbc5] to-[#0aace0] text-[15px] font-medium text-white shadow-sm transition hover:brightness-105 sm:text-[17px]"
        >
          <ArrowLeft size={23} strokeWidth={2.2} />
          إنهاء الزيارة وحفظ البيانات
        </button>
        <button
          type="button"
          className="flex h-[54px] items-center justify-center gap-[12px] rounded-[10px] border-2 border-[#12b8df] bg-white text-[16px] font-medium text-[#21bdd7] transition hover:bg-[#effcff] dark:bg-transparent dark:hover:bg-white/5 sm:text-[18px]"
          onClick={onBack}
        >
          السابق
          <ArrowRight size={23} strokeWidth={2.2} />
        </button>
      </div>
    </section>
  );
}

function SummaryCell({ children }) {
  return (
    <span className="rounded-[8px] bg-[#FAFAFA] px-[14px] py-[10px] dark:bg-[#3d3d3d]">
      {children}
    </span>
  );
}

function ControlButton({ label, onClick, children }) {
  return (
    <button
      type="button"
      aria-label={label}
      className="grid h-[52px] w-[52px] place-items-center rounded-full bg-[#edfafd] text-[#333] transition hover:bg-[#ddf4f8] hover:text-[#111] dark:bg-[#27494e] dark:text-white dark:hover:bg-[#e8f8fb] dark:hover:text-[#222] sm:h-[57px] sm:w-[57px]"
      onClick={onClick}
    >
      {children}
    </button>
  );
}

function Waveform({ isRecording }) {
  const bars = [
    26, 38, 24, 42, 30, 52, 36, 47, 58, 33, 49, 41, 53, 29, 37, 45, 31, 27, 35,
    48, 43, 55, 39, 34, 51, 60, 32, 44, 36, 28, 46, 54, 39, 50, 62, 35, 47, 41,
    33, 57, 45, 31, 52, 38, 26, 34, 43, 30, 40, 24,
  ];

  return (
      <div
      className={`mt-[29px] h-[82px] w-full max-w-[704px] overflow-hidden px-1 ${
        isRecording ? "is-recording" : "opacity-45"
      }`}
      aria-hidden="true"
      dir="ltr"
    >
      <div className="doctor-wave-track flex h-full w-[200%] items-center">
        {[0, 1].map((group) => (
          <div
            key={group}
            className="flex h-full w-1/2 shrink-0 items-center justify-around px-1"
          >
            {bars.map((height, index) => (
              <span
                key={`${group}-${height}-${index}`}
                className="doctor-wave-bar w-[3px] rounded-full"
                style={{ height }}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function EditableMedicalField({
  label,
  value,
  onChange,
  minHeight,
  multiline = false,
  showEditButton = false,
}) {
  return (
    <section className="text-right">
      <label className="mb-[10px] block text-[18px] font-semibold text-[#2f2f2f] dark:text-white sm:text-[20px]">
        {label}
      </label>
      <div className={`relative rounded-[8px] bg-[#fafafa] dark:bg-[#3d3d3d] ${minHeight}`}>
        <textarea
          value={value}
          onChange={(event) => onChange(event.target.value)}
          rows={multiline ? 5 : 2}
          className={`block w-full resize-none rounded-[8px] bg-transparent px-[18px] py-[13px] text-right text-[17px] leading-8 text-[#333] outline-none dark:text-gray-100 sm:px-[31px] sm:text-[20px] ${
            multiline ? "min-h-[172px]" : "min-h-[58px]"
          }`}
        />
        {(multiline || showEditButton) && (
          <button
            type="button"
            className="absolute bottom-[12px] left-[16px] flex h-[36px] items-center gap-[9px] rounded-[9px] border border-[#21bdd7] px-[15px] text-[14px] font-medium text-[#21bdd7] transition hover:bg-[#effcff] dark:hover:bg-white/5"
          >
            تعديل
            <Pencil size={17} strokeWidth={1.8} />
          </button>
        )}
      </div>
    </section>
  );
}

function formatTime(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `00:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function openDatePicker(inputRef) {
  const input = inputRef.current;

  if (!input) return;

  if (typeof input.showPicker === "function") {
    input.showPicker();
    return;
  }

  input.focus();
  input.click();
}

function formatDisplayDate(value) {
  if (!value) return "";

  const [year, month, day] = value.split("-");
  return `${Number(day)}/${Number(month)}/${year}`;
}

function formatProfileDate(value) {
  if (!value) return "";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  const monthNames = [
    "يناير",
    "فبراير",
    "مارس",
    "أبريل",
    "مايو",
    "يونيو",
    "يوليو",
    "أغسطس",
    "سبتمبر",
    "أكتوبر",
    "نوفمبر",
    "ديسمبر",
  ];

  return `${date.getDate()}/${monthNames[date.getMonth()]}/${date.getFullYear()}`;
}

function ConsultationMenu({ activeSection, onSectionChange }) {
  return (
    <aside className="overflow-hidden rounded-[10px] bg-white shadow-[0_5px_22px_rgba(0,0,0,0.09)] dark:bg-[#3d3d3d] lg:min-h-[784px]">
      <nav className="flex gap-0 overflow-x-auto p-[6px] text-center text-[15px] font-bold text-[#666] dark:text-gray-200 sm:text-[17px] lg:block lg:p-0 lg:pt-[8px] lg:text-[22px]">
        {menuItems.map((item) => (
          <button
            key={item.id}
            type="button"
            className={`h-[48px] min-w-[170px] rounded-[8px] px-3 transition lg:block lg:h-[74px] lg:w-full lg:min-w-0 lg:rounded-none ${
              activeSection === item.id
                ? "bg-[#eafaff] text-[#2ec1d8] dark:bg-[#254d52]"
                : "hover:bg-[#f5fcfd] hover:text-[#2ec1d8] dark:hover:bg-white/5"
            }`}
            onClick={() => onSectionChange(item.id)}
          >
            {item.label}
          </button>
        ))}
      </nav>
    </aside>
  );
}

function PatientCard({ patient }) {
  return (
    <section className="grid min-h-[205px] gap-4 rounded-[10px] bg-white px-[18px] py-[18px] shadow-[0_5px_22px_rgba(0,0,0,0.09)] dark:bg-[#3d3d3d] sm:grid-cols-[150px_minmax(0,1fr)] sm:items-center sm:px-[24px] md:grid-cols-[190px_minmax(0,1fr)] md:px-[31px]">
      <div className="h-[120px] w-[120px] overflow-hidden rounded-full border-[5px] border-[#eeeeee] justify-self-center dark:border-[#555] sm:h-[132px] sm:w-[132px] sm:justify-self-start md:h-[144px] md:w-[144px]">
        <img src={patientImage} alt={patient.name} className="h-full w-full object-cover" />
      </div>

      <div className="text-center sm:text-right">
        <h1 className="text-[23px] font-bold leading-9 text-[#2f2f2f] dark:text-white sm:text-[27px] sm:leading-10">
          {patient.name}
        </h1>
        <div className="mt-[7px] flex items-center justify-center gap-[13px] text-[14px] text-[#6d6d6d] dark:text-gray-300 sm:justify-start">
          <span>{patient.role}</span>
          <span className="rounded-[6px] bg-[#e2f8e9] px-[8px] py-[2px] text-[11px] font-bold text-[#229b4e] dark:bg-[#234f35] dark:text-[#8ee3aa]">
            {patient.status}
          </span>
        </div>
        <p className="mt-[17px] text-[17px] leading-7 text-[#6d6d6d] dark:text-gray-300">
          {patient.gender}
          <span className="mx-[18px]">{patient.age}</span>
        </p>
        <p className="mt-[4px] text-[17px] leading-7 text-[#6d6d6d] dark:text-gray-300">
          {patient.phone}
        </p>
      </div>
    </section>
  );
}

function BackButton({ onClick }) {
  return (
    <div className="flex h-[72px] items-center justify-start">
      <button
        type="button"
        className="flex items-center gap-[13px] text-[18px] font-semibold text-[#30bfd6]"
        onClick={onClick}
      >
        <ArrowLeft size={18} strokeWidth={2} />
        رجوع
      </button>
    </div>
  );
}

function PatientInformation() {
  const stats = [
    { label: "مدخن", value: "نعم", icon: cigaretteIcon, iconClass: "h-[30px] w-[30px] sm:h-[39px] sm:w-[39px]" },
    { label: "فصيلة الدم", value: "O+", icon: bloodIcon, iconClass: "h-[30px] w-[30px] sm:h-[39px] sm:w-[39px]" },
    { label: "الوزن", value: "70", icon: scaleIcon, iconClass: "h-[30px] w-[30px] sm:h-[39px] sm:w-[39px]" },
    { label: "الطول", value: "166", icon: heightIcon, iconClass: "h-[38px] w-[50px] sm:h-[48px] sm:w-[64px]" },
  ];

  return (
    <div className="space-y-[24px] sm:space-y-[31px]">
      <div className="grid grid-cols-2 gap-[10px] sm:gap-[12px] md:grid-cols-4">
        {stats.map((item) => (
          <article
            key={item.label}
            className="grid h-[132px] place-items-center rounded-[10px] bg-white text-center shadow-[0_5px_22px_rgba(0,0,0,0.09)] dark:bg-[#3d3d3d] sm:h-[154px] xl:h-[171px]"
          >
            <div className="text-[#27bfd8]">
              <img
                src={item.icon}
                alt=""
                className={`mx-auto object-contain ${item.iconClass}`}
              />
              <p className="mt-[12px] text-[14px] leading-6 sm:mt-[18px] sm:text-[16px]">{item.label}</p>
              <p className="mt-[5px] text-[17px] font-bold leading-7 sm:mt-[9px] sm:text-[20px]">{item.value}</p>
            </div>
          </article>
        ))}
      </div>

      <PatientTags title="الأمراض المزمنة" values={followupData.diseases} />
      <PatientTags title="الحساسيات" values={followupData.allergies} />
      <PatientTags title="الأدوية" values={followupData.medicines} />
    </div>
  );
}

function PatientTags({ title, values }) {
  return (
    <section className="text-right">
      <h2 className="text-[16px] font-bold text-[#333] dark:text-white">{title}</h2>
      <div className="mt-[13px] flex flex-wrap justify-start gap-[8px] sm:gap-[12px]">
        {values.map((value) => (
          <span
            key={value}
            className="rounded-[9px] bg-[#eafbfd] px-[16px] py-[8px] text-[14px] font-medium text-[#25bdd5] dark:bg-[#244d52] dark:text-[#70ddec] sm:px-[25px] sm:py-[10px] sm:text-[16px]"
          >
            {value}
          </span>
        ))}
      </div>
    </section>
  );
}

function MedicalRecords({ onOpenRecord }) {
  return (
    <div className="space-y-[9px]">
      {medicalRecords.map((record) => (
        <button
          key={record.id}
          type="button"
          className="grid min-h-[91px] w-full gap-[10px] rounded-[10px] bg-white px-[16px] py-[13px] text-right shadow-[0_5px_20px_rgba(0,0,0,0.08)] transition hover:-translate-y-0.5 hover:shadow-[0_9px_24px_rgba(0,0,0,0.11)] dark:bg-[#3d3d3d] sm:grid-cols-[110px_minmax(0,1fr)] sm:items-center sm:gap-[18px] sm:px-[31px]"
          dir="ltr"
          onClick={() => onOpenRecord(record.id)}
        >
          <span className="rounded-full bg-[#effcfc] px-[8px] py-[4px] text-left text-[10px] font-medium text-[#667] dark:bg-[#274d52] dark:text-gray-200">
            {record.date}
          </span>
          <span className="min-w-0 text-right" dir="rtl">
            <span className="block text-[17px] font-bold text-[#222] dark:text-white">
              {record.title}
            </span>
            <span className="mt-[6px] block truncate text-[12px] text-[#555] dark:text-gray-300">
              {record.summary}
            </span>
          </span>
        </button>
      ))}
    </div>
  );
}

function MedicalRecordDetails({ record }) {
  return (
    <section className="pt-[9px] text-right">
      <h2 className="text-[17px] font-semibold text-[#2f2f2f] dark:text-white sm:text-[19px]">التشخيص</h2>
      <div className="mt-[12px] rounded-[10px] bg-[#fafafa] px-[18px] py-[12px] text-[16px] leading-7 text-[#333] dark:bg-[#3d3d3d] dark:text-gray-100 sm:px-[29px] sm:py-[14px] sm:text-[20px] sm:leading-8">
        {record.diagnosis}
      </div>

      <h2 className="mt-[15px] text-[17px] font-semibold text-[#2f2f2f] dark:text-white sm:text-[19px]">
        ملاحظات
      </h2>
      <div className="mt-[12px] whitespace-pre-line rounded-[10px] bg-[#fafafa] px-[18px] py-[15px] text-[16px] leading-7 text-[#333] dark:bg-[#3d3d3d] dark:text-gray-100 sm:px-[29px] sm:py-[19px] sm:text-[20px] sm:leading-8">
        {record.notes}
      </div>
    </section>
  );
}

function PreviousMedicines() {
  return (
    <section className="overflow-x-auto text-right">
      <h2 className="mb-[18px] text-[19px] font-semibold text-[#333] dark:text-white sm:mb-[25px] sm:text-[23px]">
        الأدوية والجرعات السابقة
      </h2>

      <div className="min-w-[620px] space-y-[28px]">
        {prescriptions.map((group) => (
          <section key={group.date}>
            <p className="mb-[17px] text-[15px] font-medium text-[#28bfd8]">{group.date}</p>
            <div className="grid grid-cols-4 gap-[9px] text-[15px] font-semibold text-[#666] dark:text-gray-300">
              <span>اسم الدواء</span>
              <span>الجرعة</span>
              <span>معاد الجرعة</span>
              <span>لمدة</span>
            </div>
            <div className="mt-[8px] space-y-[8px]">
              {group.rows.map((row) => (
                <div
                  key={`${group.date}-${row.join("-")}`}
                  className="grid grid-cols-4 gap-[9px] text-[17px] text-[#333] dark:text-white sm:text-[20px]"
                >
                  {row.map((cell) => (
                    <span
                      key={cell}
                      className="rounded-[8px] bg-[#fafafa] px-[15px] py-[9px] dark:bg-[#3d3d3d]"
                    >
                      {cell}
                    </span>
                  ))}
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </section>
  );
}

function BookingDetails() {
  return (
    <section className="space-y-[31px] text-right">
      <div>
        <h2 className="mb-[10px] text-[17px] font-bold text-[#333] dark:text-white">
          سبب الزيارة
        </h2>
        <div className="rounded-[8px] bg-[#f1f1f1] px-[18px] py-[12px] text-[17px] text-[#333] dark:bg-[#3d3d3d] dark:text-white sm:px-[26px] sm:text-[21px]">
          سعال شديد وألم في الصدر
        </div>
      </div>

      <div>
        <h2 className="mb-[15px] text-[17px] font-bold text-[#333] dark:text-white">
          الملفات المرفقة
        </h2>
        <MedicalFiles compact />
      </div>
    </section>
  );
}

function MedicalFiles({ compact = false, large = false }) {
  const files = large
    ? [
        { type: "xray", image: xrayImageOne },
        { type: "report", image: reportImage },
        { type: "xray", image: xrayImageTwo },
        { type: "xray", image: xrayImageThree },
        { type: "xray", image: xrayImageFour },
        { type: "report", image: reportImage },
      ]
    : [
        { type: "report", image: reportImage },
        { type: "xray", image: xrayImageOne },
      ];

  return (
    <div className={`grid gap-[12px] ${large ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1 md:grid-cols-2"}`}>
      {files.map((file, index) => (
        <article
          key={`${file.type}-${index}`}
          className={`grid grid-cols-[minmax(0,1fr)_96px] items-center rounded-[10px] bg-white px-[16px] shadow-[0_5px_20px_rgba(0,0,0,0.09)] dark:bg-[#3d3d3d] sm:grid-cols-[minmax(0,1fr)_128px] sm:px-[26px] ${
            compact ? "h-[178px] sm:h-[202px]" : "h-[178px] sm:h-[202px]"
          }`}
        >
          <h3 className="self-start pt-[18px] text-left text-[16px] font-medium text-black dark:text-white sm:text-[20px]" dir="ltr">
            20042026.PNG
          </h3>
          <FilePreview file={file} />
        </article>
      ))}
    </div>
  );
}

function FilePreview({ file }) {
  return (
    <div className="h-[142px] w-[96px] overflow-hidden rounded-[10px] bg-[#eef3f5] shadow-inner sm:h-[170px] sm:w-[126px]">
      <img
        src={file.image}
        alt=""
        className="h-full w-full object-cover"
      />
    </div>
  );
}
