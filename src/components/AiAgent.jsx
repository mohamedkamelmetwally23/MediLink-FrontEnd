import { useEffect, useRef, useState } from "react";
import {
  FiCalendar,
  FiCheckCircle,
  FiClock,
  FiCreditCard,
  FiMic,
  FiSend,
  FiThumbsDown,
  FiThumbsUp,
  FiUser,
  FiVolume2,
  FiX,
} from "react-icons/fi";
import { FaStar } from "react-icons/fa";
import { toast } from "react-toastify";
import {
  requestTriage,
  sendToChatProxy,
  transcribeAudio,
} from "../services/chatApi";
import {
  createPaidDemoAppointment,
  demoDepositPayment,
  getCurrentAuthUser,
  isAppointmentSlotAvailable,
  listAppointments,
  listDoctors,
} from "../services/medilinkApi";
import { includesSearchText, normalizeSearchText } from "../utils/searchText";
import ThemeLogo from "./ThemeLogo";
import doctorImage1 from "../assets/landingPage/12 1.png";
import doctorImage2 from "../assets/landingPage/12 1 (1).png";
import doctorImage3 from "../assets/landingPage/12 1 (2).png";

const demoDoctors = [
  {
    id: "demo-internal",
    name: "د. عادل محمد",
    specialty: "باطنة",
    consultationFee: 350,
    image: doctorImage2,
  },
  {
    id: "demo-derma",
    name: "د. ندى حسين",
    specialty: "جلدية",
    consultationFee: 300,
    image: doctorImage1,
  },
  {
    id: "demo-ortho",
    name: "د. عبد الله محمود",
    specialty: "عظام",
    consultationFee: 400,
    image: doctorImage3,
  },
];

const initialMessages = [
  {
    id: "welcome",
    type: "assistant",
    text: "مرحبا، أنا مساعدك الذكي. اكتب الأعراض أو اطلب حجز كشف، ولو الموعد فاضي هتقدر تدفع الديبوزت ويتأكد الحجز فورًا.",
  },
];

const specialtyRules = [
  {
    specialty: "باطنة",
    keywords: [
      "مغص",
      "بطن",
      "قولون",
      "معدة",
      "قيء",
      "اسهال",
      "إسهال",
      "سكر",
      "ضغط",
      "حرارة",
      "حمى",
      "صداع",
      "تعب",
    ],
  },
  {
    specialty: "جلدية",
    keywords: [
      "جلد",
      "حبوب",
      "حكة",
      "طفح",
      "شعر",
      "اكزيما",
      "إكزيما",
      "حساسية",
      "تصبغات",
    ],
  },
  {
    specialty: "عظام",
    keywords: [
      "عظم",
      "عظام",
      "ركبة",
      "ظهر",
      "ظهري",
      "ضهر",
      "ضهري",
      "كتف",
      "كسر",
      "مفصل",
      "الم",
      "ألم",
      "رقبة",
      "فقرات",
      "عمود",
    ],
  },
  {
    specialty: "أسنان",
    keywords: ["سن", "أسنان", "اسنان", "ضرس", "لثة", "تسوس"],
  },
  {
    specialty: "أطفال",
    keywords: ["طفل", "أطفال", "اطفال", "رضيع", "ابني", "بنتي"],
  },
  {
    specialty: "أنف وأذن",
    keywords: ["أنف", "اذن", "أذن", "حلق", "جيوب", "زكام", "سمع"],
  },
];

const bookingWords = ["احجز", "حجز", "موعد", "ميعاد", "كشف", "دكتور", "طبيب"];
const appointmentsWords = ["حجوزاتي", "مواعيدي", "حجزت", "الحجوزات"];
const triageWords = [
  "أعراض",
  "اعراض",
  "مش عارف",
  "اروح فين",
  "أروح فين",
  "تخصص",
  "تعبان",
  "حاسس",
  "وجع",
  "الم",
  "ألم",
  "عندي",
];
const outOfScopeResponse =
  "\u0623\u0642\u062f\u0631 \u0623\u0633\u0627\u0639\u062f\u0643 \u0641\u064a \u0627\u0644\u0623\u0633\u0626\u0644\u0629 \u0627\u0644\u0637\u0628\u064a\u0629 \u0641\u0642\u0637: \u0627\u0644\u0623\u0639\u0631\u0627\u0636\u060c \u0627\u0644\u062a\u062e\u0635\u0635 \u0627\u0644\u0645\u0646\u0627\u0633\u0628\u060c \u0627\u0644\u0623\u0637\u0628\u0627\u0621\u060c \u0623\u0648 \u062d\u062c\u0632 \u0643\u0634\u0641 \u0641\u064a MediLink.";
const medicalDomainWords = [
  ...bookingWords,
  ...appointmentsWords,
  ...triageWords,
  "\u0635\u062d\u0629",
  "\u0635\u062d\u064a",
  "\u0645\u0631\u0636",
  "\u0645\u0631\u064a\u0636",
  "\u062a\u0639\u0628",
  "\u0627\u0631\u0647\u0627\u0642",
  "\u0625\u0631\u0647\u0627\u0642",
  "\u0639\u064a\u0627\u062f\u0629",
  "\u0643\u0644\u064a\u0646\u064a\u0643",
  "\u0639\u0644\u0627\u062c",
  "\u062f\u0648\u0627",
  "\u062f\u0648\u0627\u0621",
  "\u0623\u062f\u0648\u064a\u0629",
  "\u0627\u062f\u0648\u064a\u0629",
  "\u062a\u062d\u0627\u0644\u064a\u0644",
  "\u0623\u0634\u0639\u0629",
  "\u0627\u0634\u0639\u0629",
  "\u0636\u063a\u0637",
  "\u0633\u0643\u0631",
  "\u0643\u062d\u0629",
  "\u0633\u062e\u0648\u0646\u064a\u0629",
  "\u062d\u0645\u0649",
  "\u0637\u0648\u0627\u0631\u0626",
  "\u0625\u0633\u0639\u0627\u0641",
  "\u0627\u0633\u0639\u0627\u0641",
  "\u062c\u0631\u062d",
  "\u0646\u0632\u064a\u0641",
  "\u062a\u0646\u0641\u0633",
  "\u0635\u062f\u0631",
  "\u0642\u0644\u0628",
  "\u0645\u0639\u062f\u0629",
  "\u0628\u0637\u0646",
  "\u062c\u0644\u062f",
  "\u0623\u0633\u0646\u0627\u0646",
  "\u0627\u0633\u0646\u0627\u0646",
];
const slotTimes = [
  "09:00",
  "09:30",
  "10:00",
  "10:30",
  "11:00",
  "11:30",
  "12:00",
  "12:30",
  "13:00",
  "13:30",
  "14:00",
  "14:30",
  "15:00",
  "15:30",
  "16:00",
  "16:30",
  "17:00",
];

const arabicWeekDays = {
  saturday: "السبت",
  sunday: "الأحد",
  monday: "الإثنين",
  tuesday: "الثلاثاء",
  wednesday: "الأربعاء",
  thursday: "الخميس",
  friday: "الجمعة",
};

function createId(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = String(reader.result || "");
      resolve(result.split(",")[1] || "");
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

function normalizeText(text) {
  return normalizeSearchText(text);
}

function containsAny(text, words) {
  const normalized = normalizeText(text);
  return words.some((word) => normalized.includes(normalizeText(word)));
}

function isMedicalDomainMessage(text) {
  return containsAny(text, medicalDomainWords) || Boolean(matchSpecialty(text));
}

function matchSpecialty(text) {
  const normalized = normalizeText(text);
  return specialtyRules.find((rule) =>
    rule.keywords.some((keyword) => normalized.includes(normalizeText(keyword))),
  )?.specialty;
}

function getDoctorName(doctor) {
  return doctor.name || [doctor.firstName, doctor.lastName].filter(Boolean).join(" ").trim();
}

function getDoctorSpecialty(doctor) {
  return doctor.specialty || doctor.specializationName || "طبيب عام";
}

function getDoctorImage(doctor, index) {
  return doctor.image || [doctorImage2, doctorImage1, doctorImage3][index % 3];
}

function toChatDoctor(doctor, index) {
  return {
    ...doctor,
    id: doctor.id || doctor._id || `demo-doctor-${index}`,
    name: getDoctorName(doctor) || demoDoctors[index % demoDoctors.length].name,
    specialty: getDoctorSpecialty(doctor),
    image: getDoctorImage(doctor, index),
    consultationFee: doctor.consultationFee || doctor.price || doctor.fee || "",
  };
}

function toMinutes(time) {
  const match = /^(\d{1,2}):(\d{2})$/.exec(time || "");
  if (!match) return null;
  return Number(match[1]) * 60 + Number(match[2]);
}

function isSlotWithinWorkday(doctor, time) {
  const start = toMinutes(doctor.workStart || doctor.startTime);
  const end = toMinutes(doctor.workEnd || doctor.endTime);
  const slot = toMinutes(time);

  if (start === null || end === null || slot === null || end <= start) return true;
  return slot >= start && slot < end;
}

function getIsoDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getDoctorDayNames(doctor) {
  return new Set(
    [...(doctor.workingDays || []), ...(doctor.workDays || [])]
      .map((day) => arabicWeekDays[String(day).toLowerCase()] || day)
      .map((day) => String(day).toLowerCase()),
  );
}

function getNextClinicDates(doctor) {
  const allowedDays = getDoctorDayNames(doctor);
  const hasSpecificDays = allowedDays.size > 0;
  const dates = [];
  const today = new Date();

  for (let offset = 1; offset <= 14 && dates.length < 5; offset += 1) {
    const date = new Date(today);
    date.setDate(today.getDate() + offset);

    const englishDay = date.toLocaleDateString("en-US", { weekday: "long" }).toLowerCase();
    const arabicDay = date.toLocaleDateString("ar-EG", { weekday: "long" }).toLowerCase();

    if (
      hasSpecificDays &&
      !allowedDays.has(englishDay) &&
      !allowedDays.has(arabicWeekDays[englishDay]?.toLowerCase()) &&
      !allowedDays.has(arabicDay)
    ) {
      continue;
    }

    dates.push(getIsoDate(date));
  }

  return dates;
}

function buildSlotsForDoctor(doctor, appointments) {
  const slots = [];

  for (const date of getNextClinicDates(doctor)) {
    for (const time of slotTimes) {
      if (!isSlotWithinWorkday(doctor, time)) continue;
      if (!isAppointmentSlotAvailable({ doctorId: doctor.id, date, time }, appointments)) {
        continue;
      }

      slots.push({ date, time });
      if (slots.length === 3) return slots;
    }
  }

  return slots;
}

function formatDate(date) {
  if (!date) return "";
  const parsed = new Date(`${date}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return date;

  return parsed.toLocaleDateString("ar-EG", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

function formatTime(time) {
  const minutes = toMinutes(time);
  if (minutes === null) return time;

  const hour24 = Math.floor(minutes / 60);
  const minute = String(minutes % 60).padStart(2, "0");
  const hour12 = hour24 % 12 || 12;
  const period = hour24 >= 12 ? "م" : "ص";
  return `${hour12}:${minute} ${period}`;
}

function getSpecialtyOptions(doctors) {
  const fromDb = [
    ...new Set(doctors.map((doctor) => getDoctorSpecialty(doctor)).filter(Boolean)),
  ];

  if (fromDb.length > 0) return fromDb;
  return [...new Set(demoDoctors.map((doctor) => doctor.specialty))];
}

// Internal medicine is the sensible "preliminary check" fallback when the
// medically-correct specialty is not offered by the clinic.
function getPreliminarySpecialty(options) {
  return options.find((option) => normalizeText(option).includes("باطن")) || "";
}

// Match GPT's free-text answer back to one of the real specialty names.
function resolveSpecialty(raw, options) {
  const normalized = normalizeText(raw);
  if (!normalized || normalized.includes("عام")) return "";

  return (
    options.find((option) => normalizeText(option) === normalized) ||
    options.find(
      (option) =>
        normalizeText(option).includes(normalized) ||
        normalized.includes(normalizeText(option)),
    ) ||
    ""
  );
}

function getAvailableDoctorRecommendations(specialty, doctors, appointments) {
  const sourceDoctors = doctors.length > 0 ? doctors : demoDoctors;
  const chatDoctors = sourceDoctors.map(toChatDoctor);
  const preferredDoctors = specialty
    ? chatDoctors.filter(
        (doctor) =>
          normalizeText(doctor.specialty).includes(normalizeText(specialty)) ||
          normalizeText(specialty).includes(normalizeText(doctor.specialty)),
      )
    : chatDoctors;
  const selectedDoctors = preferredDoctors.length > 0 ? preferredDoctors : chatDoctors;

  return {
    specialty,
    doctors: selectedDoctors.slice(0, 3).map((doctor) => ({
      ...doctor,
      slots: buildSlotsForDoctor(doctor, appointments),
    })),
  };
}

function getProfileFromUser(user) {
  return user?.patient || user?.profile || user || {};
}

function getUserId(user) {
  const profile = getProfileFromUser(user);
  return (
    user?.patientId ||
    profile?._id ||
    profile?.id ||
    user?._id ||
    user?.id ||
    ""
  );
}

function getUserName(user) {
  const profile = getProfileFromUser(user);
  return (
    profile?.name ||
    [profile?.firstName, profile?.lastName].filter(Boolean).join(" ").trim() ||
    "مريض ميديلينك"
  );
}

function getUserPhone(user) {
  const profile = getProfileFromUser(user);
  return profile?.phone || profile?.phoneNumber || profile?.mobile || "";
}

function buildInitialMessages(user) {
  if (!user) return initialMessages;

  const patientName = getUserName(user);

  return initialMessages.map((item) =>
    item.id === "welcome"
      ? {
          ...item,
          text: `مرحبًا ${patientName}، أنا مساعدك الذكي. اكتب الأعراض أو اطلب حجز كشف، وهتابع معاك بناءً على بيانات حسابك وحجوزاتك.`,
        }
      : item,
  );
}

function filterPatientAppointments(appointments, user) {
  const patientId = String(getUserId(user));
  const phone = getUserPhone(user);
  const name = getUserName(user);

  return appointments.filter((appointment) => {
    return (
      (patientId && String(appointment.patientId) === patientId) ||
      (phone && appointment.phone === phone) ||
      (name && includesSearchText(appointment.patient, name))
    );
  });
}

function describeChatError(error) {
  const code = error?.code;
  const status = error?.status;

  if (error?.kind === "network") {
    return "تعذر الاتصال بالخادم. تأكد إن السيرفر شغّال وإن النت متصل، وجرّب تاني.";
  }

  if (code === "insufficient_quota") {
    return "رصيد OpenAI خلص. أضف رصيد/billing للحساب من platform.openai.com عشان المساعد يرد على الأسئلة الطبية. وتقدر تكمل الحجز وترشيح التخصصات عادي.";
  }

  if (status === 401 || code === "invalid_api_key") {
    return "مفتاح OpenAI غير صالح. حدّث OPENAI_API_KEY في إعدادات السيرفر ثم أعد التشغيل.";
  }

  if (status === 429) {
    return "في ضغط على المساعد دلوقتي، استنى ثواني وجرّب تاني.";
  }

  if (status === 500) {
    return "إعداد OpenAI ناقص على السيرفر. تأكد إن OPENAI_API_KEY متضبط ثم أعد تشغيل السيرفر.";
  }

  return "المساعد مش متاح للأسئلة العامة دلوقتي. تقدر تكمل الحجز وترشيح التخصصات من قواعد الموقع.";
}

function buildHistory(messages) {
  return messages
    .filter((item) => ["assistant", "user"].includes(item.type) && item.text)
    .slice(-8)
    .map((item) => ({
      role: item.type === "user" ? "user" : "assistant",
      content: item.text,
    }));
}

function AssistantAvatar() {
  return (
    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#DDF6FD] text-[10px] font-bold text-[#05ADE8]">
      AI
    </span>
  );
}

function UserAvatar() {
  return (
    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gray-200 text-gray-500 dark:bg-[#3A3A3A] dark:text-[#D2D2D2]">
      <FiUser className="h-4 w-4" />
    </span>
  );
}

function DoctorCards({ doctors, onPickSlot }) {
  return (
    <div className="grid grid-cols-1 gap-2">
      {doctors.map((doctor) => (
        <div
          key={doctor.id}
          className="rounded-lg border border-gray-100 bg-white p-2 shadow-sm dark:border-[#3A3A3A] dark:bg-[#303030]"
        >
          <div className="flex items-center gap-2">
            <img
              src={doctor.image}
              alt={doctor.name}
              className="h-14 w-14 shrink-0 object-contain"
            />
            <div className="min-w-0 flex-1">
              <p className="truncate text-[12px] font-semibold text-gray-900 dark:text-[#F0F0F0]">
                {doctor.name}
              </p>
              <p className="truncate text-[11px] text-gray-500 dark:text-[#D2D2D2]">
                {doctor.specialty}
              </p>
              <div className="mt-1 flex gap-0.5 text-[10px] text-yellow-400">
                {[1, 2, 3, 4, 5].map((star) => (
                  <FaStar key={star} />
                ))}
              </div>
            </div>
          </div>

          <div className="mt-2 flex flex-wrap gap-1.5">
            {doctor.slots.length > 0 ? (
              doctor.slots.map((slot) => (
                <button
                  key={`${slot.date}-${slot.time}`}
                  type="button"
                  onClick={() => onPickSlot(doctor, slot)}
                  className="inline-flex h-8 items-center gap-1 rounded-full border border-[#BFEAF8] px-2 text-[11px] font-semibold text-[#05ADE8] transition hover:bg-[#EAF8FC]"
                >
                  <FiClock className="h-3 w-3" />
                  {formatDate(slot.date)} - {formatTime(slot.time)}
                </button>
              ))
            ) : (
              <span className="rounded-full bg-gray-100 px-2 py-1 text-[11px] text-gray-500 dark:bg-[#3A3A3A] dark:text-[#D2D2D2]">
                لا توجد مواعيد متاحة قريبًا
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

function PaymentCard({ booking, isProcessing, onPay }) {
  return (
    <div className="rounded-lg border border-[#BFEAF8] bg-white p-3 shadow-sm dark:border-[#3A3A3A] dark:bg-[#303030]">
      <div className="flex items-start gap-2">
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#EAF8FC] text-[#05ADE8]">
          <FiCreditCard className="h-4 w-4" />
        </span>
        <div className="min-w-0 flex-1 text-right">
          <p className="text-sm font-semibold text-gray-900 dark:text-[#F0F0F0]">
            دفع الديبوزت
          </p>
          <p className="mt-1 text-xs leading-5 text-gray-500 dark:text-[#D2D2D2]">
            {booking.doctor.name} - {formatDate(booking.slot.date)} -{" "}
            {formatTime(booking.slot.time)}
          </p>
          <p className="text-xs font-semibold text-[#05ADE8]">
            {demoDepositPayment.amount} {demoDepositPayment.currency}
          </p>
        </div>
      </div>

      <button
        type="button"
        disabled={isProcessing}
        onClick={() => onPay(booking)}
        className="mt-3 inline-flex h-9 w-full items-center justify-center gap-2 rounded-full bg-linear-to-r from-[#05ADE8] to-[#6CCCC8] px-4 text-xs font-semibold text-white shadow-sm disabled:cursor-not-allowed disabled:opacity-70"
      >
        <FiCheckCircle className="h-4 w-4" />
        {isProcessing ? "جاري تأكيد الدفع..." : "تأكيد الدفع"}
      </button>
    </div>
  );
}

function AppointmentsList({ appointments }) {
  if (appointments.length === 0) {
    return (
      <div className="rounded-2xl rounded-tr-sm border border-gray-100 bg-white px-3 py-2 text-sm leading-6 text-gray-700 shadow-sm dark:border-[#3A3A3A] dark:bg-[#303030] dark:text-[#F0F0F0]">
        لا توجد حجوزات مسجلة لحسابك حتى الآن.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {appointments.map((appointment) => (
        <div
          key={appointment.id}
          className="rounded-lg border border-gray-100 bg-white p-3 text-right shadow-sm dark:border-[#3A3A3A] dark:bg-[#303030]"
        >
          <p className="text-sm font-semibold text-gray-900 dark:text-[#F0F0F0]">
            {appointment.doctor || "طبيب ميديلينك"}
          </p>
          <p className="mt-1 text-xs text-gray-500 dark:text-[#D2D2D2]">
            {formatDate(appointment.date)} - {formatTime(appointment.time)}
          </p>
          <p className="mt-1 text-xs font-semibold text-[#129a55]">
            مؤكد - ديبوزت مدفوع
          </p>
        </div>
      ))}
    </div>
  );
}

function Message({ message, onPickSlot, onPayDeposit, pendingPaymentId }) {
  if (message.type === "user") {
    return (
      <div className="flex items-start justify-end gap-2">
        <div className="max-w-[78%] rounded-2xl rounded-tr-sm bg-[#EAF8FC] px-3 py-2 text-sm leading-6 text-gray-800 dark:bg-[#303030] dark:text-[#F0F0F0]">
          {message.text}
        </div>
        <UserAvatar />
      </div>
    );
  }

  return (
    <div className="flex items-start gap-2">
      <AssistantAvatar />
      <div className="max-w-[82%] space-y-2">
        {message.type === "assistant" && (
          <div className="rounded-2xl rounded-tr-sm border border-gray-100 bg-white px-3 py-2 text-sm leading-6 text-gray-700 shadow-sm dark:border-[#3A3A3A] dark:bg-[#303030] dark:text-[#F0F0F0]">
            {message.text}
          </div>
        )}

        {message.type === "doctors" && (
          <DoctorCards doctors={message.doctors} onPickSlot={onPickSlot} />
        )}
        {message.type === "payment" && (
          <PaymentCard
            booking={message.booking}
            isProcessing={pendingPaymentId === message.booking.id}
            onPay={onPayDeposit}
          />
        )}
        {message.type === "appointments" && (
          <AppointmentsList appointments={message.appointments} />
        )}

        <div className="flex items-center gap-2 text-gray-400">
          <FiVolume2 className="h-3.5 w-3.5" />
          <FiThumbsUp className="h-3.5 w-3.5" />
          <FiThumbsDown className="h-3.5 w-3.5" />
        </div>
      </div>
    </div>
  );
}

export default function AiAgent({ onClose }) {
  const [currentUser, setCurrentUser] = useState(() => getCurrentAuthUser());
  const isLoggedIn = Boolean(currentUser);
  const [isSending, setIsSending] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const [pendingPaymentId, setPendingPaymentId] = useState("");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState(() =>
    buildInitialMessages(getCurrentAuthUser()),
  );
  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);

  useEffect(() => {
    const syncCurrentUser = () => {
      const nextUser = getCurrentAuthUser();
      setCurrentUser(nextUser);
      setMessages(buildInitialMessages(nextUser));
    };

    window.addEventListener("storage", syncCurrentUser);
    window.addEventListener("medilink-auth-change", syncCurrentUser);

    return () => {
      window.removeEventListener("storage", syncCurrentUser);
      window.removeEventListener("medilink-auth-change", syncCurrentUser);
    };
  }, []);

  useEffect(() => {
    if (!isLoggedIn) return undefined;

    let isMounted = true;
    const timer = window.setTimeout(async () => {
      setIsLoadingData(true);

      const [doctorsResult, appointmentsResult] = await Promise.allSettled([
        listDoctors(),
        listAppointments(),
      ]);

      if (!isMounted) return;

      if (doctorsResult.status === "fulfilled") {
        setDoctors(doctorsResult.value);
      }

      if (appointmentsResult.status === "fulfilled") {
        setAppointments(appointmentsResult.value);
      }

      setIsLoadingData(false);
    }, 0);

    return () => {
      isMounted = false;
      window.clearTimeout(timer);
    };
  }, [isLoggedIn]);

  const handlePickSlot = (doctor, slot) => {
    const booking = {
      id: createId("payment"),
      doctor,
      slot,
    };

    setMessages((prev) => [
      ...prev,
      {
        id: createId("assistant"),
        type: "assistant",
        text: "الموعد فاضي. ادفع الديبوزت لتأكيد الحجز فورًا.",
      },
      {
        id: createId("payment-card"),
        type: "payment",
        booking,
      },
    ]);
  };

  const handlePayDeposit = async (booking) => {
    setPendingPaymentId(booking.id);

    try {
      const appointment = await createPaidDemoAppointment({
        patientId: getUserId(currentUser),
        patientName: getUserName(currentUser),
        patientPhone: getUserPhone(currentUser),
        doctorId: booking.doctor.id,
        doctorName: booking.doctor.name,
        specialization: booking.doctor.specialty,
        date: booking.slot.date,
        time: booking.slot.time,
        payment: demoDepositPayment,
      });

      setAppointments((current) => [appointment, ...current]);
      setMessages((prev) => [
        ...prev,
        {
          id: createId("assistant"),
          type: "assistant",
          text: `تم تأكيد الحجز مع ${booking.doctor.name} يوم ${formatDate(
            booking.slot.date,
          )} الساعة ${formatTime(
            booking.slot.time,
          )}. الديبوزت اتسجل كمدفوع.`,
        },
      ]);
      toast.success("تم تأكيد الحجز");
    } catch (error) {
      const text = error.message || "تعذر تأكيد الحجز، اختر موعدًا آخر";
      toast.error(text);
      setMessages((prev) => [
        ...prev,
        {
          id: createId("assistant"),
          type: "assistant",
          text,
        },
      ]);
    } finally {
      setPendingPaymentId("");
    }
  };

  const handleAppointmentsRequest = () => {
    const patientAppointments = filterPatientAppointments(appointments, currentUser);

    setMessages((prev) => [
      ...prev,
      {
        id: createId("assistant"),
        type: "assistant",
        text: "دي الحجوزات المسجلة لحسابك.",
      },
      {
        id: createId("appointments"),
        type: "appointments",
        appointments: patientAppointments,
      },
    ]);
  };

  const handleRecommendationRequest = async (text) => {
    const loadingId = createId("assistant-loading");
    setMessages((prev) => [
      ...prev,
      {
        id: loadingId,
        type: "assistant",
        text: "بحدد التخصص المناسب...",
      },
    ]);

    const specialtyOptions = getSpecialtyOptions(doctors);
    let triage;

    try {
      triage = await requestTriage(text, specialtyOptions);
    } catch {
      // fall back to keyword matching if GPT triage is unavailable
      const keyword = matchSpecialty(text) || "";
      triage = { needed: keyword, specialty: keyword, available: Boolean(keyword) };
    }

    const matched = resolveSpecialty(
      triage.specialty || (triage.available ? triage.needed : ""),
      specialtyOptions,
    );

    let specialtyText;
    let specialtyForDoctors;

    if (matched) {
      specialtyText = `أقرب تخصص مناسب غالبًا: ${matched}. اختر موعدًا فاضيًا، وبعد دفع الديبوزت هيتأكد الحجز مباشرة. هذا ترشيح إرشادي وليس تشخيصًا نهائيًا.`;
      specialtyForDoctors = matched;
    } else if (triage.needed) {
      const preliminary = getPreliminarySpecialty(specialtyOptions);
      specialtyText = preliminary
        ? `للأسف العيادة حاليًا مفيهاش دكتور ${triage.needed}. تقدر تحجز كشف باطنة كبداية للفحص المبدئي أو تتواصل مع الاستقبال. دي أقرب الخيارات المتاحة:`
        : `للأسف العيادة حاليًا مفيهاش دكتور ${triage.needed}. تقدر تتواصل مع الاستقبال لمساعدتك.`;
      specialtyForDoctors = preliminary;
    } else {
      specialtyText =
        "رشحت لك أقرب الأطباء المتاحين. اختر موعدًا فاضيًا، وبعد دفع الديبوزت هيتأكد الحجز مباشرة.";
      specialtyForDoctors = "";
    }

    const recommendation = getAvailableDoctorRecommendations(
      specialtyForDoctors,
      doctors,
      appointments,
    );
    const skipDoctorCards = Boolean(!matched && triage.needed && !specialtyForDoctors);

    setMessages((prev) => {
      const updated = prev.map((item) =>
        item.id === loadingId ? { ...item, text: specialtyText } : item,
      );

      if (skipDoctorCards) return updated;

      return [
        ...updated,
        {
          id: createId("doctors"),
          type: "doctors",
          doctors: recommendation.doctors,
        },
      ];
    });
  };

  const handleOpenAiQuestion = async (text, history) => {
    const loadingId = createId("assistant-loading");

    setMessages((prev) => [
      ...prev,
      {
        id: loadingId,
        type: "assistant",
        text: "جاري تجهيز الرد...",
      },
    ]);

    try {
      const response = await sendToChatProxy(text, history);
      setMessages((prev) =>
        prev.map((item) =>
          item.id === loadingId
            ? {
                ...item,
                text:
                  response.text ||
                  "أقدر أساعدك بمعلومة عامة أو أرشح لك تخصص مناسب للحجز.",
              }
            : item,
        ),
      );
    } catch (error) {
      const text = describeChatError(error);
      setMessages((prev) =>
        prev.map((item) =>
          item.id === loadingId
            ? {
                ...item,
                text,
              }
            : item,
        ),
      );
    }
  };

  const handleTranscription = async (blob, mimeType) => {
    if (!blob || blob.size === 0) {
      toast.warning("لم يُسجّل صوت، حاول تاني");
      return;
    }

    setIsTranscribing(true);
    try {
      const base64 = await blobToBase64(blob);
      const text = await transcribeAudio(base64, mimeType);
      const trimmed = text.trim();

      if (!trimmed) {
        toast.warning("لم أتمكن من فهم التسجيل، حاول تاني");
        return;
      }

      await handleSend(trimmed);
    } catch (error) {
      toast.error(describeChatError(error));
    } finally {
      setIsTranscribing(false);
    }
  };

  const startRecording = async () => {
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") {
      toast.error("متصفحك لا يدعم التسجيل الصوتي");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      audioChunksRef.current = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data);
      };

      recorder.onstop = async () => {
        stream.getTracks().forEach((track) => track.stop());
        const blob = new Blob(audioChunksRef.current, {
          type: recorder.mimeType || "audio/webm",
        });
        await handleTranscription(blob, recorder.mimeType);
      };

      mediaRecorderRef.current = recorder;
      recorder.start();
      setIsRecording(true);
      toast.info("جاري التسجيل... اضغط الميكروفون للإيقاف");
    } catch {
      toast.error("تعذر الوصول للميكروفون، تأكد من السماح بالإذن");
    }
  };

  const stopRecording = () => {
    const recorder = mediaRecorderRef.current;
    if (recorder && recorder.state !== "inactive") {
      recorder.stop();
    }
    setIsRecording(false);
  };

  const handleMicClick = () => {
    if (!isLoggedIn) {
      toast.warning("سجل دخولك لاستخدام المساعد الذكي");
      return;
    }

    if (isTranscribing) return;

    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const handleSend = async (overrideText) => {
    if (!isLoggedIn) {
      toast.warning("سجل دخولك لاستخدام المساعد الذكي");
      return;
    }

    const sourceText = typeof overrideText === "string" ? overrideText : message;
    const trimmedMessage = sourceText.trim();
    if (!trimmedMessage) {
      toast.warning("اكتب رسالتك أولًا");
      return;
    }

    const userMessage = {
      id: createId("user"),
      type: "user",
      text: trimmedMessage,
    };
    const history = buildHistory(messages);

    setMessages((prev) => [...prev, userMessage]);
    setMessage("");
    setIsSending(true);

    try {
      if (containsAny(trimmedMessage, appointmentsWords)) {
        handleAppointmentsRequest();
        return;
      }

      if (
        containsAny(trimmedMessage, bookingWords) ||
        containsAny(trimmedMessage, triageWords) ||
        matchSpecialty(trimmedMessage)
      ) {
        await handleRecommendationRequest(trimmedMessage);
        return;
      }

      if (!isMedicalDomainMessage(trimmedMessage)) {
        setMessages((prev) => [
          ...prev,
          {
            id: createId("assistant"),
            type: "assistant",
            text: outOfScopeResponse,
          },
        ]);
        return;
      }

      await handleOpenAiQuestion(trimmedMessage, history);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div
      className="flex h-full flex-col overflow-hidden bg-white text-right text-gray-900 dark:bg-[#252525] dark:text-[#F0F0F0]"
      dir="rtl"
    >
      <header className="flex h-14 shrink-0 items-center justify-between border-b border-gray-100 px-4 dark:border-[#3A3A3A]">
        <div className="flex items-center gap-1" dir="ltr">
          <button
            type="button"
            onClick={onClose}
            aria-label="إغلاق المساعد الذكي"
            className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-gray-200 text-gray-500 transition hover:border-[#05ADE8] hover:text-[#05ADE8] dark:border-[#3A3A3A] dark:text-[#D2D2D2]"
          >
            <FiX className="h-3.5 w-3.5" />
          </button>
        </div>

        <ThemeLogo alt="ميديلينك" className="h-8 w-auto object-contain" />
      </header>

      <main className="relative flex-1 overflow-y-auto bg-[#F5FBFD] px-4 py-4 dark:bg-[#1F1F1F]">
        <div className={!isLoggedIn ? "opacity-60" : ""}>
          <div className="space-y-4">
            {messages.map((chatMessage) => (
              <Message
                key={chatMessage.id}
                message={chatMessage}
                onPickSlot={handlePickSlot}
                onPayDeposit={handlePayDeposit}
                pendingPaymentId={pendingPaymentId}
              />
            ))}
          </div>
        </div>

        {!isLoggedIn && (
          <div className="absolute inset-x-4 top-4 rounded-2xl border border-[#05ADE8]/25 bg-white/95 p-4 text-center text-sm shadow-lg dark:bg-[#252525]/95">
            <p className="font-semibold text-gray-900 dark:text-[#F0F0F0]">
              المساعد الذكي متاح داخل حساب المريض
            </p>
            <p className="mt-1 text-xs leading-5 text-gray-500 dark:text-[#D2D2D2]">
              سجل دخولك من صفحة الدخول، وبعدها هعرف بياناتك وحجوزاتك تلقائيًا.
            </p>
          </div>
        )}
      </main>

      <footer className="shrink-0 border-t border-gray-100 bg-white p-3 dark:border-[#3A3A3A] dark:bg-[#252525]">
        <div className="rounded-2xl border border-gray-200 bg-white px-3 py-2 shadow-sm dark:border-[#3A3A3A] dark:bg-[#303030]">
          <input
            type="text"
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !isSending) {
                event.preventDefault();
                handleSend();
              }
            }}
            placeholder={
              isRecording
                ? "جاري التسجيل... اضغط الميكروفون للإيقاف"
                : isTranscribing
                  ? "جاري تحويل الصوت إلى نص..."
                  : isLoadingData
                    ? "جاري تحميل المواعيد..."
                    : "اكتب الأعراض أو اطلب حجز كشف..."
            }
            className="h-9 w-full bg-transparent text-right text-sm outline-none placeholder:text-gray-400 dark:text-[#F0F0F0]"
          />

          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-1 text-gray-400">
              <button
                type="button"
                onClick={handleMicClick}
                disabled={isTranscribing}
                aria-label={isRecording ? "إيقاف التسجيل" : "تسجيل صوتي"}
                className={`inline-flex h-7 w-7 items-center justify-center rounded-full transition disabled:cursor-not-allowed disabled:opacity-60 ${
                  isRecording
                    ? "animate-pulse bg-red-500 text-white"
                    : "hover:bg-[#EAF8FC] hover:text-[#05ADE8]"
                }`}
              >
                <FiMic className="h-4 w-4" />
              </button>
            </div>

            <button
              type="button"
              onClick={() => handleSend()}
              disabled={isSending}
              className="inline-flex h-9 items-center gap-1 rounded-full bg-linear-to-r from-[#05ADE8] to-[#6CCCC8] px-4 text-xs font-semibold text-white shadow-sm transition hover:from-[#05ADE8] hover:to-[#6CCCC8] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSending ? "جاري..." : "إرسال"}
              <FiSend className="h-3.5 w-3.5 rotate-180" />
            </button>
          </div>

          <div className="mt-2 flex items-center gap-2 text-[10px] text-gray-400">
            <FiCalendar className="h-3 w-3" />
            <span>الحجز يتأكد فورًا بعد دفع الديبوزت إذا كان الموعد فاضيًا.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
