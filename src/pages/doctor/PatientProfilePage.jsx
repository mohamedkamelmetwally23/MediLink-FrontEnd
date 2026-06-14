import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowRight,
  CalendarDays,
  ClipboardPlus,
  Droplets,
  Search,
  Stethoscope,
  X,
} from "lucide-react";
import patientImage from "../../assets/landingPage/admin.png";

const patients = {
  1: {
    name: "محمد علي",
    phone: "01237652086",
    age: "35 سنة",
    gender: "ذكر",
    lastVisit: "2026/05/01",
    registrationDate: "2025/04/10",
  },
  2: {
    name: "سما محمد",
    phone: "01237652086",
    age: "29 سنة",
    gender: "أنثى",
    lastVisit: "2026/05/01",
    registrationDate: "2025/04/10",
  },
  5: {
    name: "خالد طارق",
    phone: "01237652086",
    age: "35 سنة",
    gender: "ذكر",
    lastVisit: "2026/05/01",
    registrationDate: "2025/04/10",
  },
};

const fallbackPatient = patients[5];

const stats = [
  { label: "مواعيد", value: "160", icon: CalendarDays },
  { label: "كشف", value: "70", icon: ClipboardPlus },
  { label: "تحاليل", value: "50", icon: Droplets },
  { label: "متابعة", value: "7 أيام", icon: Stethoscope },
];

const tabs = [
  { id: "followup", label: "معلومات إضافية" },
  { id: "records", label: "السجل المرضي" },
  { id: "prescriptions", label: "الوصفات الطبية" },
];

const prescriptions = [
  {
    date: "2026/يونيه/30",
    medicine: "Ventolin",
    dose: "1 حباية",
    duration: "كل 6 ساعات",
    period: "3 أيام",
  },
  {
    date: "2026/يونيه/30",
    medicine: "Paracetamol",
    dose: "1 حباية",
    duration: "كل 8 ساعات",
    period: "7 أيام",
  },
  {
    date: "2026/يونيه/3",
    medicine: "Ventolin",
    dose: "1 حباية",
    duration: "كل 6 ساعات",
    period: "3 أيام",
  },
  {
    date: "2026/يونيه/3",
    medicine: "Panacetamol",
    dose: "1 حباية",
    duration: "كل 8 ساعات",
    period: "7 أيام",
  },
  {
    date: "2025/ديسمبر/24",
    medicine: "Ventolin",
    dose: "1 حباية",
    duration: "كل 6 ساعات",
    period: "3 أيام",
  },
  {
    date: "2025/ديسمبر/24",
    medicine: "Panacetamol",
    dose: "1 حباية",
    duration: "كل 8 ساعات",
    period: "7 أيام",
  },
];

const medicalRecords = [
  {
    date: "2026/مايو/17",
    title: "حساسية شديدة",
    summary: "ملاحظات: سعال شديد واحمرار في الأنف والعينين",
  },
  {
    date: "2025/ديسمبر/12",
    title: "حساسية شديدة",
    summary: "ملاحظات: سعال شديد واحمرار في الأنف والعينين",
  },
  {
    date: "2025/نوفمبر/12",
    title: "حساسية شديدة",
    summary: "ملاحظات: سعال شديد واحمرار في الأنف والعينين",
  },
  {
    date: "2025/أكتوبر/12",
    title: "حساسية شديدة",
    summary: "ملاحظات: سعال شديد واحمرار في الأنف والعينين",
  },
];

const followupData = {
  diseases: [
    "السكري (النوع الثاني)",
    "ارتفاع ضغط الدم",
    "ارتفاع ضغط الدم",
    "السكري (النوع الثاني)",
    "السكري (النوع الثاني)",
  ],
  allergies: ["أكزيما", "حساسية اللاكتوز"],
  medicines: ["ميتفورمين", "كوفالون", "لوراتادين"],
};

export default function DoctorPatientProfilePage() {
  const navigate = useNavigate();
  const { patientId } = useParams();
  const [activeTab, setActiveTab] = useState("followup");
  const [search, setSearch] = useState("");
  const patient = patients[patientId] || fallbackPatient;

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
      return;
    }

    navigate("/doctor/patients");
  };

  return (
    <section className="min-h-screen bg-[#f8fbfc] text-[#333] dark:bg-[#2f2f2f] dark:text-white">
      <header className="relative flex min-h-[100px] items-start justify-start bg-white px-4 pt-[20px] shadow-[0_1px_8px_rgba(0,0,0,0.03)] dark:bg-[#3a3a3a] sm:px-6 lg:px-[24px]">
        <div className="text-right">
          <h1 className="text-[20px] font-bold leading-7 text-[#333] dark:text-white">
            ملف المريض
          </h1>
          <p className="mt-1 text-[11px] leading-5 text-[#8a8a8a] dark:text-gray-300">
            المرضى / ملف المريض
          </p>
        </div>

        <button
          type="button"
          className="absolute left-5 top-[26px] flex items-center gap-[6px] text-[11px] font-bold text-[#30bfd6] lg:left-[24px]"
          onClick={handleBack}
        >
          <ArrowRight size={13} strokeWidth={2} />
          رجوع
        </button>
      </header>

      <main className="px-4 pb-[28px] pt-[22px] sm:px-6 lg:px-[24px]">
        <section
          className="grid gap-[16px] xl:grid-cols-[250px_minmax(0,1fr)]"
          dir="ltr"
        >
          <PatientInfoCard patient={patient} />

          <div className="space-y-[14px]" dir="rtl">
            <ProfileCard patient={patient} />
            <StatsGrid />
          </div>
        </section>

        <section className="mt-[18px]">
          <Tabs activeTab={activeTab} onTabChange={setActiveTab} />

          <div className="mt-[20px] flex justify-end">
            <SearchBox value={search} onChange={setSearch} />
          </div>

          <div className="mt-[18px] min-h-[285px]">
            {activeTab === "prescriptions" && (
              <PrescriptionsTab search={search} />
            )}
            {activeTab === "records" && <MedicalRecordsTab search={search} />}
            {activeTab === "followup" && <FollowupTab search={search} />}
          </div>
        </section>
      </main>
    </section>
  );
}

function PatientInfoCard({ patient }) {
  const rows = [
    { label: "آخر الكشف", value: patient.lastVisit },
    { label: "العمر", value: patient.age },
    { label: "الجنس", value: patient.gender },
    { label: "رقم الهاتف", value: patient.phone },
    { label: "تاريخ التسجيل", value: patient.registrationDate },
  ];

  return (
    <section
      className="rounded-[8px] bg-white px-[18px] py-[22px] shadow-[0_4px_18px_rgba(0,0,0,0.08)] dark:bg-[#505050]"
      dir="rtl"
    >
      <h2 className="mb-[14px] text-right text-[13px] font-bold text-[#333] dark:text-white">
        معلومات المريض
      </h2>

      {rows.map((row) => (
        <div
          key={row.label}
          className="flex h-[34px] items-center justify-between border-b border-[#eeeeee] text-[10px] text-[#555] last:border-b-0 dark:border-white/15 dark:text-gray-200"
        >
          <span>{row.label}</span>
          <span>{row.value}</span>
        </div>
      ))}
    </section>
  );
}

function ProfileCard({ patient }) {
  return (
    <section className="grid min-h-[176px] place-items-center rounded-[8px] bg-white px-6 py-[16px] text-center shadow-[0_4px_18px_rgba(0,0,0,0.08)] dark:bg-[#505050]">
      <div>
        <div className="mx-auto h-[104px] w-[104px] overflow-hidden rounded-full border-[4px] border-[#eeeeee]">
          <img
            src={patientImage}
            alt={patient.name}
            className="h-full w-full object-cover"
          />
        </div>
        <h2 className="mt-[10px] text-[15px] font-bold leading-5 text-[#333] dark:text-white">
          {patient.name}
        </h2>
        <div className="mt-[4px] flex items-center justify-center gap-[6px] text-[9px] text-[#8a8a8a]">
          <span>مريض</span>
          <span className="h-[7px] w-[7px] rounded-full bg-[#26c461]" />
        </div>
      </div>
    </section>
  );
}

function StatsGrid() {
  return (
    <div className="grid grid-cols-2 gap-[10px] md:grid-cols-4">
      {stats.map((stat) => (
        <section
          key={stat.label}
          className="grid min-h-[86px] place-items-center rounded-[8px] bg-white px-3 py-3 text-center shadow-[0_4px_18px_rgba(0,0,0,0.08)] dark:bg-[#505050]"
        >
          <div>
            <stat.icon
              size={21}
              strokeWidth={1.8}
              className="mx-auto text-[#26bed6]"
            />
            <p className="mt-[7px] text-[10px] font-bold leading-4 text-[#26bed6]">
              {stat.label}
            </p>
            <p className="text-[11px] font-bold leading-4 text-[#26bed6]">
              {stat.value}
            </p>
          </div>
        </section>
      ))}
    </div>
  );
}

function Tabs({ activeTab, onTabChange }) {
  return (
    <div className="grid h-[36px] grid-cols-3 border-b border-[#d7d7d7] text-[11px] font-bold text-[#b5b5b5] dark:border-white/15">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          className={`relative transition ${
            activeTab === tab.id ? "text-[#26bed6]" : "hover:text-[#26bed6]"
          }`}
          onClick={() => onTabChange(tab.id)}
        >
          {tab.label}
          {activeTab === tab.id && (
            <span className="absolute inset-x-0 bottom-[-1px] mx-auto h-[2px] w-full bg-[#26bed6]" />
          )}
        </button>
      ))}
    </div>
  );
}

function SearchBox({ value, onChange }) {
  return (
    <label
      className="flex h-[37px] w-full items-center gap-[8px] rounded-[7px] border border-[#d7d7d7] bg-[#fbfbfb] px-[11px] text-[#9a9a9a] dark:border-white/20 dark:bg-[#454545] dark:text-gray-200 sm:w-[245px]"
      dir="ltr"
    >
      {value && (
        <button
          type="button"
          aria-label="مسح البحث"
          className="grid h-5 w-5 place-items-center"
          onClick={() => onChange("")}
        >
          <X size={13} strokeWidth={1.7} />
        </button>
      )}
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="min-w-0 flex-1 bg-transparent text-right text-[10px] outline-none placeholder:text-[#9a9a9a]"
        placeholder="إبحث هنا..."
        dir="rtl"
      />
      <Search size={15} strokeWidth={1.7} />
    </label>
  );
}

function PrescriptionsTab({ search }) {
  const filteredPrescriptions = useMemo(() => {
    const query = search.trim();

    if (!query) return prescriptions;

    return prescriptions.filter((item) =>
      [item.date, item.medicine, item.dose, item.duration, item.period].some(
        (value) => value.includes(query),
      ),
    );
  }, [search]);

  if (filteredPrescriptions.length === 0) {
    return <EmptyState text="لا يوجد وصفات طبية حتى الآن" />;
  }

  const groups = groupPrescriptionsByDate(filteredPrescriptions);

  return (
    <div className="space-y-[25px]">
      {groups.map(([date, items]) => (
        <section key={date} className="overflow-x-auto">
          <div className="min-w-[720px]">
            <p className="mb-[8px] text-right text-[10px] font-bold text-[#26bed6]">
              {date}
            </p>
            <div
              className="grid h-[28px] grid-cols-4 items-center rounded-[6px] text-[10px] font-bold text-[#555] dark:text-gray-200"
              dir="rtl"
            >
              <span className="px-[10px] text-right">اسم الدواء</span>
              <span className="px-[10px] text-right">الجرعة</span>
              <span className="px-[10px] text-right">ميعاد الجرعة</span>
              <span className="px-[10px] text-right">لمدة</span>
            </div>

            {items.map((item) => (
              <div
                key={`${item.date}-${item.medicine}-${item.period}`}
                className="grid h-[36px] grid-cols-4 items-center gap-[3px] text-[11px] text-[#333] dark:text-white"
                dir="rtl"
              >
                <span className="h-[28px] rounded-[6px] bg-[#f7f7f7] px-[10px] pt-[7px] text-right dark:bg-[#444]">
                  {item.medicine}
                </span>
                <span className="h-[28px] rounded-[6px] bg-[#f7f7f7] px-[10px] pt-[7px] text-right dark:bg-[#444]">
                  {item.dose}
                </span>
                <span className="h-[28px] rounded-[6px] bg-[#f7f7f7] px-[10px] pt-[7px] text-right dark:bg-[#444]">
                  {item.duration}
                </span>
                <span className="h-[28px] rounded-[6px] bg-[#f7f7f7] px-[10px] pt-[7px] text-right dark:bg-[#444]">
                  {item.period}
                </span>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

function groupPrescriptionsByDate(items) {
  return items.reduce((groups, item) => {
    const group = groups.find(([date]) => date === item.date);

    if (group) {
      group[1].push(item);
      return groups;
    }

    return [...groups, [item.date, [item]]];
  }, []);
}

function MedicalRecordsTab({ search }) {
  const records = useMemo(() => {
    const query = search.trim();

    if (!query) return medicalRecords;

    return medicalRecords.filter((item) =>
      [item.date, item.title, item.summary].some((value) => value.includes(query)),
    );
  }, [search]);

  if (records.length === 0) {
    return <EmptyState text="لا يوجد سجل مرضي حتى الآن" />;
  }

  return (
    <div className="space-y-[12px]">
      {records.map((record) => (
        <article
          key={`${record.date}-${record.title}`}
          className="grid min-h-[62px] grid-cols-[105px_minmax(0,1fr)] items-center gap-[18px] rounded-[7px] bg-white px-[16px] py-[10px] shadow-[0_3px_14px_rgba(0,0,0,0.08)] dark:bg-[#505050]"
          dir="ltr"
        >
          <span className="text-left text-[9px] font-bold text-[#26bed6]">
            {record.date}
          </span>
          <div className="min-w-0 text-right" dir="rtl">
            <h3 className="text-[12px] font-bold leading-5 text-[#333] dark:text-white">
              {record.title}
            </h3>
            <p className="mt-[2px] truncate text-[10px] leading-4 text-[#555] dark:text-gray-300">
              {record.summary}
            </p>
          </div>
        </article>
      ))}
    </div>
  );
}

function FollowupTab({ search }) {
  const sections = [
    { label: "الأمراض المزمنة", values: followupData.diseases },
    { label: "الحساسيات", values: followupData.allergies },
    { label: "الأدوية", values: followupData.medicines },
  ].map((section) => ({
    ...section,
    values: filterValues(section.values, search),
  }));

  const hasValues = sections.some((section) => section.values.length > 0);

  if (!hasValues) {
    return <FollowupEmpty />;
  }

  return (
    <div className="space-y-[30px] pt-[4px]" dir="rtl">
      {sections.map((section) => (
        <section
          key={section.label}
          className="text-right"
        >
          <h3 className="text-[11px] font-bold text-[#333] dark:text-white">
            {section.label}
          </h3>

          <div className="mt-[12px] flex flex-wrap justify-start gap-[8px]">
            {section.values.length === 0 ? (
              <span
                className="rounded-[7px] bg-[#eafbfd] px-[14px] py-[6px] text-[10px] font-bold text-[#25b8d1]"
              >
                لا يوجد
              </span>
            ) : (
              section.values.map((value, index) => (
                <span
                  key={`${value}-${index}`}
                  className="rounded-[7px] bg-[#eafbfd] px-[14px] py-[6px] text-[10px] font-bold text-[#25b8d1]"
                >
                  {value}
                </span>
              ))
            )}
          </div>

        </section>
      ))}
    </div>
  );
}

function filterValues(values, search) {
  const query = search.trim();

  if (!query) return values;

  return values.filter((value) => value.includes(query));
}

function FollowupEmpty() {
  const rows = [
    ["الأمراض المزمنة", "لا يوجد"],
    ["الحساسيات", "لا يوجد"],
    ["الأدوية", "لا يوجد"],
  ];

  return (
    <div className="space-y-[30px] pt-[4px] text-right" dir="rtl">
      {rows.map(([label, value]) => (
        <div key={label}>
          <h3 className="text-[11px] font-bold text-[#333] dark:text-white">
            {label}
          </h3>
          <div className="mt-[12px] flex justify-start">
            <span className="rounded-[7px] bg-[#eafbfd] px-[14px] py-[6px] text-[10px] font-bold text-[#25b8d1]">
              {value}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

function EmptyState({ text }) {
  return (
    <div className="grid min-h-[290px] place-items-center text-[13px] font-bold text-[#333] dark:text-white">
      {text}
    </div>
  );
}
