import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Check,
  ClipboardPlus,
  Image as ImageIcon,
  Mail,
  MapPin,
  Phone,
  Plus,
  Search,
} from "lucide-react";
import { FaFacebookF, FaInstagram, FaLinkedinIn } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import logo from "../../assets/landingPage/logo.png";
import avatar from "../../assets/landingPage/doctor1.png";
import sampleReport from "../../assets/doctor departement/image 12.png";
import sampleXray from "../../assets/doctor departement/image 12 (1).png";
import "./patient-onboarding.css";

const steps = [
  { key: "info", title: "معلومات عنك", number: 1 },
  { key: "chronic", title: "أمراض مزمنة", number: 2 },
  { key: "allergies", title: "حساسيات", number: 3 },
  { key: "medications", title: "أدوية", number: 4 },
  { key: "files", title: "ملفات طبية", number: 5 },
];

const footerColumns = [
  {
    title: "روابط سريعة",
    links: ["الرئيسية", "من نحن", "خدماتنا", "التخصصات", "الأطباء"],
  },
  {
    title: "خدماتنا",
    links: ["حجز موعد", "الاستشارات", "الملفات الطبية", "المتابعة والتنبيهات", "الدعم الفني"],
  },
  {
    title: "التخصصات",
    links: ["الباطنة", "الأطفال", "الجلدية", "الفم والأسنان", "المخ والأعصاب"],
  },
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

function PatientHeader() {
  return (
    <header className="patient-header" dir="rtl">
      <Link to="/" className="patient-logo-link" aria-label="MediLink">
        <img src={logo} alt="MediLink" />
      </Link>

      <nav className="patient-nav" aria-label="روابط MediLink">
        <Link to="/">الرئيسية</Link>
        <a href="#appointments">المواعيد</a>
        <a href="#ai">مساعد AI</a>
        <a href="#contact">تواصل معنا</a>
      </nav>

      <div className="patient-header-tools">
        <button type="button" className="patient-icon-button" aria-label="بحث">
          <Search size={32} strokeWidth={1.8} />
        </button>
        <img src={avatar} alt="" className="patient-avatar" />
      </div>
    </header>
  );
}

function PatientFooter() {
  return (
    <footer id="contact" className="patient-footer" dir="rtl">
      <div className="patient-footer-inner">
        <section className="patient-footer-brand">
          <img src={logo} alt="MediLink" />
          <p>نظام متكامل لإدارة العيادات والمراكز الطبية وتقديم أفضل تجربة للمرضى والأطباء</p>
          <div className="patient-socials">
            <FaLinkedinIn />
            <FaInstagram />
            <FaXTwitter />
            <FaFacebookF />
          </div>
        </section>

        {footerColumns.map((column) => (
          <section key={column.title} className="patient-footer-column">
            <h3>{column.title}</h3>
            {column.links.map((link) => (
              <a href="#top" key={link}>
                {link}
              </a>
            ))}
          </section>
        ))}

        <section className="patient-footer-contact">
          <h3>تواصل معنا</h3>
          <p>
            <Phone size={18} fill="currentColor" /> 015 5677 3899
          </p>
          <p>
            <Mail size={18} fill="currentColor" /> info@medilink.com
          </p>
          <p>
            <MapPin size={20} fill="currentColor" /> القاهرة، مصر
          </p>
        </section>
      </div>
    </footer>
  );
}

function ProgressSteps({ currentIndex }) {
  return (
    <div className="patient-steps" aria-label="خطوات إعداد الملف الطبي">
      {steps.map((step, index) => {
        const completed = index < currentIndex;
        const active = index === currentIndex;

        return (
          <div
            key={step.key}
            className={`patient-step ${active ? "is-active" : ""} ${completed ? "is-complete" : ""}`}
          >
            <div className="patient-step-line" />
            <div className="patient-step-mark">
              {completed ? <Check size={28} strokeWidth={2.4} /> : active ? <span /> : step.number}
            </div>
            <strong>{step.title}</strong>
          </div>
        );
      })}
    </div>
  );
}

function WelcomeScreen({ onNext }) {
  return (
    <section className="patient-card patient-welcome">
      <div className="patient-briefcase" aria-hidden="true">
        <span />
        <ClipboardPlus size={126} strokeWidth={1.7} />
      </div>
      <h1>مرحباً بك في Medilink</h1>
      <p>لنساعدك بشكل أفضل، نحتاج لبعض المعلومات الصحية الأساسية لتقديم تجربة طبية أدق وأسرع</p>
      <button type="button" className="patient-primary-button" onClick={onNext}>
        إبدأ الآن
      </button>
    </section>
  );
}

function InfoScreen({ data, setData, onNext }) {
  return (
    <section className="patient-card patient-form-card">
      <h1>يرغب الطبيب بمعرفة بعض المعلومات عنك</h1>

      <div className="patient-range-row">
        <label htmlFor="height">ما هو طولك (سم)</label>
        <div className="patient-range-wrap">
          <input
            id="height"
            type="range"
            min="25"
            max="150"
            value={data.height}
            onChange={(event) => setData((current) => ({ ...current, height: event.target.value }))}
          />
          <output style={{ insetInlineStart: `${((data.height - 25) / 125) * 100}%` }}>{data.height}</output>
          <div className="patient-range-ticks">
            <span>150</span>
            <span>125</span>
            <span>100</span>
            <span>75</span>
            <span>50</span>
            <span>25</span>
          </div>
        </div>
      </div>

      <div className="patient-range-row">
        <label htmlFor="weight">ما هو وزنك (كجم)</label>
        <div className="patient-range-wrap">
          <input
            id="weight"
            type="range"
            min="100"
            max="200"
            value={data.weight}
            onChange={(event) => setData((current) => ({ ...current, weight: event.target.value }))}
          />
          <output style={{ insetInlineStart: `${((data.weight - 100) / 100) * 100}%` }}>{data.weight}</output>
          <div className="patient-range-ticks">
            <span>200</span>
            <span>180</span>
            <span>160</span>
            <span>140</span>
            <span>120</span>
            <span>100</span>
          </div>
        </div>
      </div>

      <div className="patient-field-block">
        <h2>هل أنت مدخن</h2>
        <div className="patient-segmented">
          {["نعم", "لا"].map((value) => (
            <button
              type="button"
              key={value}
              className={data.smoker === value ? "is-selected" : ""}
              onClick={() => setData((current) => ({ ...current, smoker: value }))}
            >
              {value}
            </button>
          ))}
        </div>
      </div>

      <div className="patient-field-block">
        <h2>ما هي فصيلة دمك</h2>
        <div className="patient-blood-grid">
          {bloodTypes.map((type) => (
            <button
              type="button"
              key={type}
              className={data.bloodType === type ? "is-selected" : ""}
              onClick={() => setData((current) => ({ ...current, bloodType: type }))}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      <div className="patient-actions patient-actions-single">
        <button type="button" className="patient-primary-button" onClick={onNext}>
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

  return (
    <section className="patient-card patient-check-card">
      <div className="patient-check-content">
        <h1>{config.title}</h1>

        <label className="patient-checkbox-row">
          <input type="checkbox" checked={noneSelected} onChange={() => toggle(config.none)} />
          <span>{config.none}</span>
        </label>

        {config.options.map((option) => (
          <label className={`patient-checkbox-row ${noneSelected ? "is-muted" : ""}`} key={option}>
            <input
              type="checkbox"
              checked={!noneSelected && selected.includes(option)}
              disabled={noneSelected}
              onChange={() => toggle(option)}
            />
            <span>{option}</span>
          </label>
        ))}

        <button type="button" className={`patient-add-row ${noneSelected ? "is-muted" : ""}`} disabled={noneSelected}>
          <Plus size={20} />
          {config.add}
        </button>
      </div>

      <WizardActions onNext={onNext} onPrevious={onPrevious} />
    </section>
  );
}

function FilesScreen({ files, setFiles, onNext, onPrevious }) {
  const previews = useMemo(() => {
    if (files.length > 0) {
      return files.map((file) => ({
        name: file.name,
        src: file.type.startsWith("image/") ? URL.createObjectURL(file) : sampleReport,
        loading: false,
      }));
    }

    return [];
  }, [files]);

  return (
    <section className="patient-card patient-files-card">
      <div className="patient-card-heading">
        <h1>هل ترغب في رفع ملفات طبية؟</h1>
        <p>يمكنك رفع تحاليل، أشعة، تقارير طبية وصفات سابقة</p>
      </div>

      <label className={`patient-upload-zone ${previews.length ? "has-files" : ""}`}>
        <input
          type="file"
          multiple
          accept=".png,.jpg,.jpeg,.pdf"
          onChange={(event) => setFiles(Array.from(event.target.files ?? []))}
        />
        {previews.length ? (
          <div className="patient-preview-row">
            <div className="patient-upload-add">
              <Plus size={46} />
            </div>
            <div className="patient-file-thumb is-loading">
              <img src={sampleReport} alt="" />
              <strong>يتم التحميل</strong>
              <span />
            </div>
            <div className="patient-file-thumb">
              <img src={sampleXray} alt="" />
            </div>
            {previews.slice(0, 2).map((preview) => (
              <div className="patient-file-thumb" key={preview.name}>
                <img src={preview.src} alt="" />
              </div>
            ))}
          </div>
        ) : (
          <div className="patient-upload-empty">
            <ImageIcon size={38} />
            <p>
              <span>اضغط للاختيار</span> أو اسحب الملفات هنا
            </p>
            <small>الحد الأقصى 10 ميجابايت لكل ملف PNG, JPG, PDF</small>
          </div>
        )}
      </label>

      <WizardActions onNext={onNext} onPrevious={onPrevious} />
    </section>
  );
}

function SuccessScreen() {
  return (
    <section className="patient-success">
      <div className="patient-success-art" aria-hidden="true">
        <span className="shape shape-1" />
        <span className="shape shape-2" />
        <span className="shape shape-3" />
        <span className="shape shape-4" />
        <span className="shape shape-5" />
        <div>
          <Check size={190} strokeWidth={1.2} />
        </div>
      </div>
      <h1>تم إعداد ملفك الطبي بنجاح</h1>
      <p>يمكنك الآن حجز المواعيد، متابعة سجلك الطبي، والحصول على توصيات طبية أكثر دقة.</p>
      <Link to="/" className="patient-primary-button">
        إبدأ استخدام Medilink
      </Link>
    </section>
  );
}

function WizardActions({ onNext, onPrevious }) {
  return (
    <div className="patient-actions">
      <button type="button" className="patient-secondary-button" onClick={onPrevious}>
        السابق
      </button>
      <button type="button" className="patient-primary-button" onClick={onNext}>
        التالي
      </button>
    </div>
  );
}

export default function PatientOnboardingPage() {
  const [screenIndex, setScreenIndex] = useState(0);
  const [info, setInfo] = useState({ height: 75, weight: 165, smoker: "لا", bloodType: "A+" });
  const [checks, setChecks] = useState({
    chronic: checklistScreens.chronic.defaults,
    allergies: checklistScreens.allergies.defaults,
    medications: checklistScreens.medications.defaults,
  });
  const [files, setFiles] = useState([]);

  const currentStepIndex = Math.max(0, Math.min(screenIndex - 1, steps.length - 1));
  const isWizard = screenIndex > 0 && screenIndex < 6;

  const goNext = () => setScreenIndex((current) => Math.min(current + 1, 6));
  const goPrevious = () => setScreenIndex((current) => Math.max(current - 1, 1));

  return (
    <div id="top" className="patient-page" dir="rtl">
      <PatientHeader />

      <main className="patient-main">
        {isWizard && <ProgressSteps currentIndex={currentStepIndex} />}

        {screenIndex === 0 && <WelcomeScreen onNext={goNext} />}
        {screenIndex === 1 && <InfoScreen data={info} setData={setInfo} onNext={goNext} />}
        {screenIndex === 2 && (
          <ChecklistScreen
            screen="chronic"
            values={checks}
            setValues={setChecks}
            onNext={goNext}
            onPrevious={goPrevious}
          />
        )}
        {screenIndex === 3 && (
          <ChecklistScreen
            screen="allergies"
            values={checks}
            setValues={setChecks}
            onNext={goNext}
            onPrevious={goPrevious}
          />
        )}
        {screenIndex === 4 && (
          <ChecklistScreen
            screen="medications"
            values={checks}
            setValues={setChecks}
            onNext={goNext}
            onPrevious={goPrevious}
          />
        )}
        {screenIndex === 5 && <FilesScreen files={files} setFiles={setFiles} onNext={goNext} onPrevious={goPrevious} />}
        {screenIndex === 6 && <SuccessScreen />}
      </main>

      <PatientFooter />
    </div>
  );
}
