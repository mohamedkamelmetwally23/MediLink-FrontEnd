import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import {
  Check,
  FileText,
  Image as ImageIcon,
  Mail,
  MapPin,
  Phone,
  Plus,
  Search,
  X,
} from "lucide-react";
import { FaFacebookF, FaInstagram, FaLinkedinIn } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import ThemeLogo from "../../components/ThemeLogo";
import avatar from "../../assets/landingPage/doctor1.png";
import patientVector from "../../assets/patient departement/Vector.png";
import {
  completePatientProfile,
  getMyPatientProfile,
} from "../../services/medilinkApi";
import { useSpecializations } from "../../hooks/useSpecializations";
import { useClinicInfo } from "../../services/clinicInfoStore";

const gradient = "bg-linear-to-b from-[#13B5DF] to-[#64CAC6]";

const steps = [
  { key: "info", title: "معلومات عنك", number: 1 },
  { key: "chronic", title: "أمراض مزمنة", number: 2 },
  { key: "allergies", title: "حساسيات", number: 3 },
  { key: "medications", title: "أدوية", number: 4 },
  { key: "files", title: "ملفات طبية", number: 5 },
];

const checklistScreens = {
  chronic: {
    title: "هل لديك أمراض مزمنة؟",
    none: "لا أعاني من أي أمراض",
    add: "أمراض أخرى؟",
    options: ["ضغط الدم", "السكري (نوع أول)", "السكري (نوع ثاني)", "أمراض القلب", "الربو", "أمراض الغدة الدرقية"],
    defaults: ["ضغط الدم", "السكري (نوع أول)"],
  },
  allergies: {
    title: "هل لديك أي حساسية؟",
    none: "لا أعاني من أي حساسية",
    add: "حساسيات أخرى؟",
    options: ["حساسية لاكتوز", "حساسية غلوتين", "حساسية الغبار"],
    defaults: ["حساسية لاكتوز", "حساسية غلوتين"],
  },
  medications: {
    title: "ما هي الأدوية التي تتناولها حالياً؟",
    none: "لا أتناول أي أدوية",
    add: "أدوية أخرى؟",
    options: ["كورتيزون", "بروفين", "بنادول"],
    defaults: ["كورتيزون", "بروفين"],
  },
};

const bloodTypes = ["A-", "A+", "O-", "B+", "B-", "AB+", "AB-", "O+"];

function getMedicalFileId(file, index = 0) {
  return String(
    file?._id ||
      file?.fileId ||
      file?.id ||
      file?.url ||
      `medical-file-${index}`,
  );
}

function saveUploadedFileNames(patientId, medicalFiles, uploadedFiles, previousIds) {
  if (!patientId || uploadedFiles.length === 0) return;

  const storageKey = `medilink-medical-file-names-${patientId}`;
  let savedNames = {};

  try {
    savedNames = JSON.parse(localStorage.getItem(storageKey) || "{}");
  } catch {
    savedNames = {};
  }

  medicalFiles
    .filter((file, index) => !previousIds.has(getMedicalFileId(file, index)))
    .forEach((file, index) => {
      if (uploadedFiles[index]) {
        savedNames[getMedicalFileId(file, index)] = uploadedFiles[index].name;
      }
    });

  localStorage.setItem(storageKey, JSON.stringify(savedNames));
}

const cardClass =
  "w-full max-w-[920px] rounded-[10px] bg-white shadow-[0_4px_18px_rgba(0,0,0,0.12)] dark:bg-[#383838] dark:shadow-[0_10px_28px_rgba(0,0,0,0.34)]";
const headingClass =
  "m-0 text-right text-[clamp(27px,2.4vw,36px)] font-semibold leading-[1.35] text-[#333333] dark:text-[#F0F0F0]";
const primaryButtonClass = `inline-flex min-h-[54px] items-center justify-center rounded-[9px] border-0 ${gradient} px-6 text-[17px] font-semibold text-white transition hover:-translate-y-0.5 hover:shadow-[0_10px_18px_rgba(32,184,213,0.14)]`;
const secondaryButtonClass =
  "inline-flex min-h-[54px] items-center justify-center rounded-[9px] border border-[#05ADE8] bg-transparent px-6 text-[17px] font-semibold text-[#21B9D9] transition hover:-translate-y-0.5 hover:shadow-[0_10px_18px_rgba(32,184,213,0.14)]";

function PatientHeader() {
  return (
    <header
      className="sticky top-0 z-20 mx-auto grid min-h-[86px] w-[min(1320px,calc(100%_-_160px))] grid-cols-[220px_1fr_220px] items-center gap-6 rounded-b-[14px] bg-white/95 shadow-[0_4px_12px_rgba(0,0,0,0.08)] backdrop-blur-xl dark:bg-[#383838]/95 max-lg:w-[min(980px,calc(100%_-_32px))] max-lg:grid-cols-[auto_1fr_auto] max-md:relative max-md:min-h-0 max-md:w-full max-md:grid-cols-[1fr_auto] max-md:p-[14px_18px]"
      dir="rtl"
    >
      <Link to="/" className="justify-self-end max-md:justify-self-start" aria-label="MediLink">
        <ThemeLogo className="h-auto w-[150px] object-contain max-lg:w-[132px]" />
      </Link>

      <nav
        className="flex justify-center gap-[clamp(24px,4vw,58px)] text-[21px] font-bold text-[#333333] dark:text-[#F0F0F0] max-lg:gap-6 max-lg:text-lg max-md:col-span-full max-md:row-start-2 max-md:justify-start max-md:gap-5 max-md:overflow-x-auto max-md:py-2 max-md:text-base max-md:[scrollbar-width:none]"
        aria-label="روابط MediLink"
      >
        <Link className="transition hover:text-[#25B8D7]" to="/">
          الرئيسية
        </Link>
        <a className="transition hover:text-[#25B8D7]" href="#appointments">
          المواعيد
        </a>
        <a className="transition hover:text-[#25B8D7]" href="#ai">
          مساعد AI
        </a>
        <a className="transition hover:text-[#25B8D7]" href="#contact">
          تواصل معنا
        </a>
      </nav>

      <div className="flex items-center justify-start gap-[18px] max-md:col-start-2 max-md:row-start-1">
        <button type="button" className="grid size-12 place-items-center bg-transparent text-[#333333] dark:text-[#F0F0F0]" aria-label="بحث">
          <Search size={32} strokeWidth={1.8} />
        </button>
        <img src={avatar} alt="" className="size-[46px] rounded-full object-cover" />
      </div>
    </header>
  );
}

function PatientFooter() {
  const { patientId } = useParams();
  const clinicInfo = useClinicInfo();
  const { specialties } = useSpecializations();
  const specialtiesSectionHref = `/patient/${encodeURIComponent(
    patientId || "",
  )}/home#specialties`;

  return (
    <footer id="contact" className="bg-white shadow-[0_-7px_20px_rgba(0,0,0,0.04)] dark:bg-[#343434]" dir="rtl">
      <div className="mx-auto grid w-[min(1320px,calc(100%_-_110px))] grid-cols-[1.35fr_1fr_1.15fr] items-start gap-12 py-[72px] max-lg:w-[min(980px,calc(100%_-_40px))] max-lg:grid-cols-2 max-md:w-[min(520px,calc(100%_-_32px))] max-md:grid-cols-1 max-md:gap-7 max-md:py-10">
        <section>
          <ThemeLogo className="mb-6 w-40 object-contain" />
          <p className="m-0 max-w-[290px] text-[17px] font-semibold leading-tight text-[#333333] dark:text-[#F0F0F0]">
            نظام متكامل لإدارة العيادات والمراكز الطبية وتقديم أفضل تجربة للمرضى والأطباء
          </p>
          <div className="mt-7 flex gap-6 text-[22px] text-[#2DBBD8]">
            <FaLinkedinIn />
            <FaInstagram />
            <FaXTwitter />
            <FaFacebookF />
          </div>
        </section>

        <section>
          <h3 className="mb-5 text-lg font-extrabold text-[#333333] dark:text-[#F0F0F0]">التخصصات</h3>
          {specialties.slice(0, 5).map((specialty) => (
            <Link
              key={specialty.id || specialty.name}
              to={`/patient/doctors?specialty=${encodeURIComponent(specialty.name)}`}
              className="mb-[15px] block text-[17px] font-semibold text-[#333333] transition hover:text-[#25B8D7] dark:text-[#F0F0F0]"
            >
              {specialty.name}
            </Link>
          ))}
          <Link
            to={specialtiesSectionHref}
            className="block text-[17px] font-bold text-[#25B8D7] transition hover:underline hover:underline-offset-4"
          >
            عرض المزيد
          </Link>
        </section>

        <section>
          <h3 className="mb-5 text-lg font-extrabold text-[#333333] dark:text-[#F0F0F0]">تواصل معنا</h3>
          <p className="mb-[15px] flex items-center gap-3 text-[17px] font-semibold text-[#333333] dark:text-[#F0F0F0]">
            <Phone size={18} fill="currentColor" />
            <span>{clinicInfo.phone}</span>
          </p>
          <p className="mb-[15px] flex items-center gap-3 text-[17px] font-semibold text-[#333333] dark:text-[#F0F0F0]">
            <Mail size={18} fill="currentColor" />
            <span className="break-all">{clinicInfo.email}</span>
          </p>
          <p className="mb-[15px] flex items-center gap-3 text-[17px] font-semibold text-[#333333] dark:text-[#F0F0F0]">
            <MapPin size={20} fill="currentColor" />
            <span>{clinicInfo.address}</span>
          </p>
        </section>
      </div>
    </footer>
  );
}

function ProgressSteps({ currentIndex }) {
  return (
    <div
      className="relative mb-[58px] grid w-full max-w-[1280px] grid-cols-5 max-md:mb-8 max-md:flex max-md:overflow-x-auto max-md:px-1 max-md:pb-3 max-md:[scrollbar-width:none]"
      aria-label="خطوات إعداد الملف الطبي"
    >
      <div className="absolute left-[10%] right-[10%] top-7 h-1 bg-[#25B8D7] max-md:hidden" />
      {steps.map((step, index) => {
        const completed = index < currentIndex;
        const active = index === currentIndex;

        return (
          <div
            key={step.key}
            className={`relative flex min-w-0 flex-col items-center gap-3.5 text-center max-md:min-w-[120px] ${
              active || completed ? "text-[#25B8D7]" : "text-[#8F8F8F]"
            }`}
          >
            {index > 0 && (
              <div className="absolute left-[calc(50%_+_24px)] top-6 hidden h-1 w-[72px] bg-[#25B8D7] max-md:block" />
            )}
            <div
              className={`relative z-[1] grid size-14 place-items-center rounded-full border-4 border-[#25B8D7] text-xl font-bold max-md:size-12 max-md:border-[3px] max-md:text-[17px] ${
                completed ? "bg-[#25B8D7] text-white" : "bg-white text-[#25B8D7] dark:bg-[#383838]"
              }`}
            >
              {completed ? <Check size={28} strokeWidth={2.4} /> : active ? <span className="size-[19px] rounded-full bg-[#25B8D7]" /> : step.number}
            </div>
            <strong className="text-[clamp(20px,2.2vw,29px)] font-semibold leading-tight [overflow-wrap:anywhere] max-md:text-[17px]">
              {step.title}
            </strong>
          </div>
        );
      })}
    </div>
  );
}

function WelcomeScreen({ onNext }) {
  return (
    <section className={`${cardClass} flex min-h-[560px] flex-col items-center justify-center px-8 py-10 text-center max-md:min-h-0 max-md:px-[18px] max-md:py-7`}>
      <div className="relative mb-4 grid h-[250px] w-[214px] place-items-center max-md:h-[190px] max-md:w-[160px]" aria-hidden="true">
        <div className="absolute inset-x-0 top-7 bottom-0 rounded-[26px] bg-[#D0EEEE] dark:bg-[#31C2DF]/20" />
        <img src={patientVector} alt="" className="relative z-[1] w-[126px] max-md:w-24" />
      </div>
      <h1 className="m-0 text-[clamp(27px,2.4vw,36px)] font-semibold leading-[1.35] text-[#111111] dark:text-[#F0F0F0]">
        مرحباً بك في Medilink
      </h1>
      <p className="mb-11 mt-3.5 max-w-[760px] text-[clamp(20px,1.7vw,27px)] font-normal leading-[1.35] text-[#111111] dark:text-[#F0F0F0]">
        لنساعدك بشكل أفضل، قبل أن تبدأ نحتاج لبعض المعلومات الصحية الأساسية لتقديم تجربة طبية أدق وأسرع.
      </p>
      <button type="button" className={`${primaryButtonClass} w-full max-w-[820px]`} onClick={onNext}>
        إبدأ الآن
      </button>
    </section>
  );
}

function RangeField({ id, label, min, max, value, ticks, onChange }) {
  const progress = ((Number(value) - min) / (max - min)) * 100;
  const thumbCenterOffset = 8 - progress * 0.16;

  return (
    <div className="mt-8">
      <label htmlFor={id} className="mb-3.5 block text-right text-lg font-semibold text-[#333333] dark:text-[#F0F0F0]">
        {label}
      </label>
      <div className="relative pb-7">
        <input
          id={id}
          dir="rtl"
          type="range"
          min={min}
          max={max}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="h-1 w-full appearance-none rounded-full bg-linear-to-l from-[#25B8D7] to-[#CDEFF0] accent-[#25B8D7] [&::-webkit-slider-thumb]:size-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:bg-[#F5F5F5] [&::-webkit-slider-thumb]:shadow-[0_2px_8px_rgba(0,0,0,0.24)]"
        />
        <output
          className="absolute top-[-34px] grid h-6 min-w-7 translate-x-1/2 place-items-center rounded-[7px] bg-[#40BFD7] px-1 text-xs font-bold text-white"
          style={{ right: `calc(${progress}% + ${thumbCenterOffset}px)` }}
        >
          {value}
        </output>
        <div className="relative mt-2 h-4 text-[11px] text-[#D0D0D0]">
          {ticks.map((tick) => {
            const tickProgress = ((tick - min) / (max - min)) * 100;
            const transform =
              tickProgress === 0
                ? "none"
                : tickProgress === 100
                  ? "translateX(100%)"
                  : "translateX(50%)";

            return (
              <span
                key={tick}
                className="absolute top-0 whitespace-nowrap"
                style={{ right: `${tickProgress}%`, transform }}
              >
                {tick}
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function InfoScreen({ data, setData, onNext }) {
  return (
    <section className={`${cardClass} min-h-[440px] px-10 py-8 max-md:min-h-0 max-md:px-[18px] max-md:py-7`}>
      <h1 className={headingClass}>يرغب الطبيب بمعرفة بعض المعلومات عنك</h1>

      <RangeField
        id="height"
        label="ما هو طولك (سم)"
        min={25}
        max={220}
        value={data.height}
        ticks={[25, 50, 75, 100, 125, 150, 175, 200, 220]}
        onChange={(height) => setData((current) => ({ ...current, height }))}
      />

      <RangeField
        id="weight"
        label="ما هو وزنك (كجم)"
        min={0}
        max={200}
        value={data.weight}
        ticks={[0, 40, 80, 120, 160, 200]}
        onChange={(weight) => setData((current) => ({ ...current, weight }))}
      />

      <div className="mt-5">
        <h2 className="mb-3.5 text-right text-lg font-semibold text-[#333333] dark:text-[#F0F0F0]">هل أنت مدخن</h2>
        <div className="grid grid-cols-2 gap-2.5 max-md:grid-cols-1">
          {["نعم", "لا"].map((value) => (
            <button
              type="button"
              key={value}
              className={`h-[54px] rounded-[10px] border bg-white text-base text-[#333333] dark:bg-[#383838] dark:text-[#F0F0F0] ${
                data.smoker === value ? "border-2 border-[#05ADE8]" : "border-[#E8E8E8] dark:border-[#555555]"
              }`}
              onClick={() => setData((current) => ({ ...current, smoker: value }))}
            >
              {value}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-5">
        <h2 className="mb-3.5 text-right text-lg font-semibold text-[#333333] dark:text-[#F0F0F0]">ما هي فصيلة دمك</h2>
        <div className="flex flex-wrap justify-start gap-[30px] max-md:justify-center max-md:gap-3.5">
          {bloodTypes.map((type) => (
            <button
              type="button"
              key={type}
              className={`h-[54px] min-w-[54px] rounded-xl border bg-white text-lg font-bold text-[#25B8D7] shadow-[0_10px_24px_rgba(0,0,0,0.1)] dark:bg-[#383838] ${
                data.bloodType === type ? "border-[#25B8D7] shadow-none" : "border-transparent"
              }`}
              onClick={() => setData((current) => ({ ...current, bloodType: type }))}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-10 grid">
        <button type="button" className={primaryButtonClass} onClick={onNext}>
          التالي
        </button>
      </div>
    </section>
  );
}

function ChecklistScreen({ screen, values, setValues, onNext, onPrevious }) {
  const config = checklistScreens[screen];
  const selected = values[screen] ?? config.defaults;
  const noneSelected = selected.includes(config.none);
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customValue, setCustomValue] = useState("");
  const customItems = selected.filter(
    (item) => item !== config.none && !config.options.includes(item),
  );

  const toggle = (item) => {
    setValues((current) => {
      const list = current[screen] ?? [];
      if (item === config.none) {
        return { ...current, [screen]: list.includes(item) ? [] : [item] };
      }

      const withoutNone = list.filter((entry) => entry !== config.none);
      const next = withoutNone.includes(item)
        ? withoutNone.filter((entry) => entry !== item)
        : [...withoutNone, item];
      return { ...current, [screen]: next };
    });
  };

  const addCustomItem = () => {
    const item = customValue.trim();
    if (!item) return;

    setValues((current) => {
      const list = (current[screen] ?? []).filter(
        (entry) => entry !== config.none,
      );

      return {
        ...current,
        [screen]: list.includes(item) ? list : [...list, item],
      };
    });
    setCustomValue("");
  };

  const removeCustomItem = (item) => {
    setValues((current) => ({
      ...current,
      [screen]: (current[screen] ?? []).filter((entry) => entry !== item),
    }));
  };

  return (
    <section className={`${cardClass} flex min-h-[440px] flex-col justify-between px-10 py-8 max-md:min-h-0 max-md:px-[18px] max-md:py-7`}>
      <div className="w-full max-w-[360px]">
        <h1 className={headingClass}>{config.title}</h1>

        <label className="flex min-h-11 items-center justify-start gap-2.5 text-[17px] font-semibold text-[#333333] dark:text-[#F0F0F0]">
          <input className="size-[21px] accent-[#35BBD3]" type="checkbox" checked={noneSelected} onChange={() => toggle(config.none)} />
          <span>{config.none}</span>
        </label>

        {config.options.map((option) => (
          <label
            className={`flex min-h-11 items-center justify-start gap-2.5 text-[17px] font-semibold ${
              noneSelected ? "text-[#8A8A8A] dark:text-[#B8B8B8]" : "text-[#333333] dark:text-[#F0F0F0]"
            }`}
            key={option}
          >
            <input
              className="size-[21px] accent-[#35BBD3]"
              type="checkbox"
              checked={!noneSelected && selected.includes(option)}
              disabled={noneSelected}
              onChange={() => toggle(option)}
            />
            <span>{option}</span>
          </label>
        ))}

        <button
          type="button"
          className={`flex min-h-11 items-center justify-start gap-2.5 bg-transparent p-0 text-[17px] font-semibold ${
            noneSelected ? "text-[#8A8A8A] dark:text-[#B8B8B8]" : "text-[#333333] dark:text-[#F0F0F0]"
          }`}
          disabled={noneSelected}
          onClick={() => setShowCustomInput((current) => !current)}
        >
          <Plus size={20} className={`rounded-full text-white ${noneSelected ? "bg-[#777777]" : "bg-[#35BBD3]"}`} />
          {config.add}
        </button>

        {customItems.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {customItems.map((item) => (
              <span
                key={item}
                className="inline-flex items-center gap-2 rounded-lg bg-[#EAF9FC] px-3 py-2 text-sm font-semibold text-[#168DA5] dark:bg-[#35BBD3]/15 dark:text-[#7DDEEF]"
              >
                {item}
                <button
                  type="button"
                  aria-label={`حذف ${item}`}
                  onClick={() => removeCustomItem(item)}
                >
                  <X size={15} />
                </button>
              </span>
            ))}
          </div>
        )}

        {showCustomInput && !noneSelected && (
          <div className="mt-2">
            <div className="flex gap-2">
              <input
                value={customValue}
                onChange={(event) => setCustomValue(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    addCustomItem();
                  }
                }}
                placeholder={
                  screen === "chronic"
                    ? "اكتب اسم المرض"
                    : screen === "allergies"
                      ? "اكتب نوع الحساسية"
                      : "اكتب اسم الدواء"
                }
                className="h-10 min-w-0 flex-1 rounded-lg border border-[#35BBD3] bg-white px-3 text-right text-sm text-[#333] outline-none placeholder:text-[#999] dark:bg-[#454545] dark:text-white"
                autoFocus
              />
              <button
                type="button"
                onClick={addCustomItem}
                className="h-10 rounded-lg bg-[#35BBD3] px-4 text-sm font-semibold text-white disabled:opacity-50"
                disabled={!customValue.trim()}
              >
                إضافة
              </button>
            </div>

          </div>
        )}
      </div>

      <WizardActions onNext={onNext} onPrevious={onPrevious} />
    </section>
  );
}

function FilesScreen({
  files,
  setFiles,
  existingFiles,
  onNext,
  onPrevious,
  isSubmitting,
}) {
  const fileInputRef = useRef(null);
  const previews = useMemo(
    () =>
      files.map((file) => ({
        id: `${file.name}-${file.size}-${file.lastModified}`,
        name: file.name,
        type: file.type,
        src: file.type.startsWith("image/") ? URL.createObjectURL(file) : "",
      })),
    [files],
  );

  useEffect(() => {
    return () => {
      previews.forEach((preview) => {
        if (preview.src) URL.revokeObjectURL(preview.src);
      });
    };
  }, [previews]);

  const addFiles = (selectedFiles) => {
    const nextFiles = Array.from(selectedFiles);

    if (!nextFiles.length) return;

    setFiles((current) => {
      const existingIds = new Set(current.map((file) => `${file.name}-${file.size}-${file.lastModified}`));
      const uniqueFiles = nextFiles.filter(
        (file) => !existingIds.has(`${file.name}-${file.size}-${file.lastModified}`),
      );

      return [...current, ...uniqueFiles];
    });

    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeFile = (fileId) => {
    setFiles((current) => current.filter((file) => `${file.name}-${file.size}-${file.lastModified}` !== fileId));
  };

  return (
    <section className={`${cardClass} min-h-[440px] px-10 py-8 max-md:min-h-0 max-md:px-[18px] max-md:py-7`}>
      <div className="mb-8 text-right">
        <h1 className={headingClass}>هل ترغب في رفع ملفات طبية؟</h1>
        <p className="m-0 mt-1 text-base font-semibold text-[#8A8A8A] dark:text-[#B8B8B8]">يمكنك رفع تحاليل، أشعة، تقارير طبية وصفات سابقة</p>
      </div>

      <div
        className="grid min-h-[280px] place-items-center rounded-2xl border border-dashed border-[#D6D6D6] bg-[#F9F9F9]/45 p-7 dark:bg-white/5 max-md:min-h-[230px] max-md:p-4"
        onDragOver={(event) => event.preventDefault()}
        onDrop={(event) => {
          event.preventDefault();
          addFiles(event.dataTransfer.files);
        }}
      >
        <input ref={fileInputRef} className="hidden" type="file" multiple accept=".png,.jpg,.jpeg,.pdf" onChange={(event) => addFiles(event.target.files ?? [])} />

        {previews.length || existingFiles.length ? (
          <div className="flex flex-wrap justify-center gap-4">
            <button
              type="button"
              className="grid h-[132px] w-40 place-items-center rounded-xl border-2 border-dashed border-[#D5D5D5] text-[#A3A3A3] max-md:h-[106px] max-md:w-[126px]"
              onClick={() => fileInputRef.current?.click()}
              aria-label="إضافة ملف"
            >
              <Plus size={46} className="rounded-full bg-[#A3A3A3] p-2 text-white" />
            </button>

            {existingFiles.map((file, index) => (
              <div
                key={file._id || file.fileId || file.id || file.url || index}
                className="grid h-[132px] w-40 place-items-center overflow-hidden rounded-xl bg-[#F1F1F1] dark:bg-[#454545] max-md:h-[106px] max-md:w-[126px]"
              >
                {file.url ? (
                  <img
                    src={file.url}
                    alt={file.fileName || `ملف طبي ${index + 1}`}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex flex-col items-center gap-2 text-[#777] dark:text-[#D0D0D0]">
                    <FileText size={38} />
                    <span className="text-xs">ملف طبي {index + 1}</span>
                  </div>
                )}
              </div>
            ))}

            {previews.map((preview) => (
              <div key={preview.id} className="group relative grid h-[132px] w-40 place-items-center overflow-hidden rounded-xl bg-[#F1F1F1] dark:bg-[#454545] max-md:h-[106px] max-md:w-[126px]">
                {preview.src ? (
                  <img src={preview.src} alt={preview.name} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full flex-col items-center justify-center gap-2 p-3 text-center text-[#777777] dark:text-[#D0D0D0]">
                    <FileText size={38} />
                    <span className="line-clamp-2 text-xs font-semibold">{preview.name}</span>
                  </div>
                )}

                <button
                  type="button"
                  className="absolute left-2 top-2 grid size-8 place-items-center rounded-full bg-black/60 text-white opacity-100 transition hover:bg-[#E5484D] sm:opacity-0 sm:group-hover:opacity-100"
                  onClick={(event) => {
                    event.stopPropagation();
                    removeFile(preview.id);
                  }}
                  aria-label={`حذف ${preview.name}`}
                >
                  <X size={18} />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <button type="button" className="text-center text-[#9B9B9B]" onClick={() => fileInputRef.current?.click()}>
            <ImageIcon size={38} className="mx-auto mb-4" />
            <p className="m-0 text-base font-bold">
              <span className="text-[#23B8D8]">اضغط للاختيار</span> أو اسحب الملفات هنا
            </p>
            <small className="mt-1 block text-[13px]">الحد الأقصى 10 ميجابايت لكل ملف PNG, JPG, PDF</small>
          </button>
        )}
      </div>

      <WizardActions
        onNext={onNext}
        onPrevious={onPrevious}
        isSubmitting={isSubmitting}
        nextLabel="حفظ البيانات"
      />
    </section>
  );
}

function SuccessScreen({ patientId, isEditMode }) {
  return (
    <section className="flex min-h-[650px] w-full max-w-[1320px] flex-col items-center justify-center text-center">
      <div className="relative h-[450px] w-[470px] max-w-[90vw] max-md:h-[320px]" aria-hidden="true">
        <span className={`absolute left-[52%] top-7 h-[190px] w-[205px] rounded-r-[120px] ${gradient} max-md:h-[122px] max-md:w-[130px]`} />
        <span className="absolute bottom-[52px] left-[12%] size-40 rounded-full bg-[#8AD9E8] max-md:size-[110px]" />
        <span className="absolute right-0 bottom-[72px] h-[215px] w-[210px] rotate-[4deg] rounded-t-[120px] rounded-b-[18px] bg-[#D3D3D3] max-md:h-[140px] max-md:w-[135px]" />
        <span className="absolute left-[16%] top-[110px] h-[185px] w-[110px] rounded-l-[100px] border-[38px] border-l-0 border-[#D3D3D3] max-md:h-32 max-md:w-20 max-md:border-[26px] max-md:border-l-0" />
        <span className="absolute left-[18%] top-12 size-[62px] rounded-full bg-[#2360A8] max-md:size-11" />
        <div className={`absolute left-1/2 top-[42%] z-[2] grid size-[360px] -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full ${gradient} text-white max-md:size-[245px]`}>
          <Check size={190} strokeWidth={1.2} className="max-md:size-[132px]" />
        </div>
      </div>
      <h1 className="m-0 text-[clamp(27px,2.4vw,36px)] font-semibold leading-[1.35] text-[#333333] dark:text-[#F0F0F0]">
        {isEditMode ? "تم تعديل ملفك الطبي بنجاح" : "تم إعداد ملفك الطبي بنجاح"}
      </h1>
      <p className="mb-10 mt-2 text-xl font-semibold text-[#333333] dark:text-[#F0F0F0] max-md:text-[17px]">
        يمكنك الآن حجز المواعيد، متابعة سجلك الطبي، والحصول على توصيات طبية أكثر دقة.
      </p>
      <Link
        to={
          isEditMode
            ? `/patient/${encodeURIComponent(patientId)}/profile`
            : `/patient/${encodeURIComponent(patientId)}/home`
        }
        className={`${primaryButtonClass} w-full max-w-[820px]`}
      >
        {isEditMode ? "عرض الملف الشخصي" : "إبدأ استخدام Medilink"}
      </Link>
    </section>
  );
}

function WizardActions({
  onNext,
  onPrevious,
  isSubmitting = false,
  nextLabel = "التالي",
}) {
  return (
    <div className="mt-10 grid grid-cols-2 gap-[18px] max-md:grid-cols-1">
      <button type="button" className={`${secondaryButtonClass} max-md:order-2`} onClick={onPrevious}>
        السابق
      </button>
      <button
        type="button"
        disabled={isSubmitting}
        className={`${primaryButtonClass} disabled:cursor-not-allowed disabled:opacity-60`}
        onClick={onNext}
      >
        {isSubmitting ? "جاري الحفظ..." : nextLabel}
      </button>
    </div>
  );
}

export default function PatientOnboardingPage() {
  const { patientId } = useParams();
  const [searchParams] = useSearchParams();
  const isEditMode = searchParams.get("edit") === "true";
  const [screenIndex, setScreenIndex] = useState(isEditMode ? 1 : 0);
  const [info, setInfo] = useState({ height: 75, weight: 165, smoker: "لا", bloodType: "A+" });
  const [checks, setChecks] = useState({
    chronic: checklistScreens.chronic.defaults,
    allergies: checklistScreens.allergies.defaults,
    medications: checklistScreens.medications.defaults,
  });
  const [files, setFiles] = useState([]);
  const [existingFiles, setExistingFiles] = useState([]);
  const [profileLoading, setProfileLoading] = useState(isEditMode);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isEditMode) return undefined;

    let mounted = true;

    getMyPatientProfile()
      .then((patient) => {
        if (!mounted) return;

        setInfo({
          height: String(patient.height || 75),
          weight: String(patient.weight || 0),
          smoker: patient.smoker === true ? "نعم" : "لا",
          bloodType: patient.bloodType || "A+",
        });
        setChecks({
          chronic:
            patient.chronicConditions?.length > 0
              ? patient.chronicConditions
              : [checklistScreens.chronic.none],
          allergies:
            patient.allergies?.length > 0
              ? patient.allergies
              : [checklistScreens.allergies.none],
          medications:
            patient.chronicMedications?.length > 0
              ? patient.chronicMedications
              : [checklistScreens.medications.none],
        });
        setExistingFiles(patient.medicalFiles || []);
      })
      .catch((error) => {
        if (mounted) {
          toast.error(error.message || "تعذر تحميل بيانات الملف الطبي");
        }
      })
      .finally(() => {
        if (mounted) setProfileLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [isEditMode]);

  const currentStepIndex = Math.max(0, Math.min(screenIndex - 1, steps.length - 1));
  const isWizard = screenIndex > 0 && screenIndex < 6;

  const goNext = () => setScreenIndex((current) => Math.min(current + 1, 6));
  const goPrevious = () => setScreenIndex((current) => Math.max(current - 1, 1));

  const submitPatientInformation = async () => {
    const withoutNone = (screen) =>
      (checks[screen] || []).filter(
        (item) => item !== checklistScreens[screen].none,
      );

    setIsSubmitting(true);

    try {
      const previousProfile =
        files.length > 0
          ? await getMyPatientProfile().catch(() => null)
          : null;
      const previousFileIds = new Set(
        (previousProfile?.medicalFiles || []).map(getMedicalFileId),
      );

      await completePatientProfile({
        bloodType: info.bloodType,
        height: info.height,
        weight: info.weight,
        smoking: info.smoker === "نعم",
        chronicMedications: withoutNone("medications"),
        allergies: withoutNone("allergies"),
        chronicConditions: withoutNone("chronic"),
        favoriteDoctors: [],
        medicalFiles: files,
      });

      if (files.length > 0) {
        const updatedProfile = await getMyPatientProfile().catch(() => null);
        saveUploadedFileNames(
          patientId,
          updatedProfile?.medicalFiles || [],
          files,
          previousFileIds,
        );
      }

      localStorage.setItem(
        `medilink-patient-profile-completed-${patientId}`,
        "true",
      );
      setScreenIndex(6);
    } catch (error) {
      toast.error(error.message || "تعذر حفظ بيانات الملف الطبي");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div id="top" className="min-h-screen bg-white text-[#333333] dark:bg-[#2E2E2E] dark:text-[#F0F0F0]" dir="rtl">
      <PatientHeader />

      <main className="flex min-h-[690px] flex-col items-center px-6 py-[86px] max-md:min-h-0 max-md:px-4 max-md:py-9">
        {profileLoading ? (
          <div className={`${cardClass} grid min-h-[440px] place-items-center text-lg font-semibold`}>
            جاري تحميل بياناتك...
          </div>
        ) : (
          <>
        {isWizard && <ProgressSteps currentIndex={currentStepIndex} />}

        {screenIndex === 0 && <WelcomeScreen onNext={goNext} />}
        {screenIndex === 1 && <InfoScreen data={info} setData={setInfo} onNext={goNext} />}
        {screenIndex === 2 && (
          <ChecklistScreen
            key="chronic"
            screen="chronic"
            values={checks}
            setValues={setChecks}
            onNext={goNext}
            onPrevious={goPrevious}
          />
        )}
        {screenIndex === 3 && (
          <ChecklistScreen
            key="allergies"
            screen="allergies"
            values={checks}
            setValues={setChecks}
            onNext={goNext}
            onPrevious={goPrevious}
          />
        )}
        {screenIndex === 4 && (
          <ChecklistScreen
            key="medications"
            screen="medications"
            values={checks}
            setValues={setChecks}
            onNext={isEditMode ? submitPatientInformation : goNext}
            onPrevious={goPrevious}
          />
        )}
        {screenIndex === 5 && !isEditMode && (
          <FilesScreen
            files={files}
            setFiles={setFiles}
            existingFiles={existingFiles}
            onNext={submitPatientInformation}
            onPrevious={goPrevious}
            isSubmitting={isSubmitting}
          />
        )}
        {screenIndex === 6 && (
          <SuccessScreen patientId={patientId} isEditMode={isEditMode} />
        )}
          </>
        )}
      </main>

      <PatientFooter />
    </div>
  );
}
