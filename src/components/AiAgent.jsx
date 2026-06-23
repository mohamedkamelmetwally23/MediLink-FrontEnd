import { useEffect, useRef, useState } from "react";
import {
  FiCalendar,
  FiCheckCircle,
  FiClock,
  FiCreditCard,
  FiMic,
  FiSend,
  FiUser,
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
import defaultDoctorAvatar from "../assets/landingPage/doctor1.png";

// ─── constants ───────────────────────────────────────────────────────────────

const SYSTEM_PROMPT =
  "أنت مساعد طبي ودود اسمه «مساعد ميديلينك». بتتكلم عربي مصري عادي وبسيط. " +
  "بتجاوب على الأسئلة الطبية بس: أعراض، أمراض، علاج، أدوية، تخصصات. " +
  "متشخصش التشخيص النهائي — دايمًا قول «لازم تروح الدكتور للتأكد». " +
  "لو السؤال مش طبي قول بهدوء: «أنا متخصص في الحاجات الطبية بس، تقدر تسألني عن أي عَرَض أو مرض». " +
  "لو حد سأل عن تخصص مش موجود في العيادة، اذكر الأقسام المتاحة وساعده يختار الأنسب. " +
  "كن ودود ومتعاطف وجاوب بشكل مختصر وواضح.";

const bookingWords = ["احجز", "حجز", "موعد", "ميعاد", "كشف", "دكتور", "طبيب"];
const appointmentsWords = ["حجوزاتي", "مواعيدي", "حجزت", "الحجوزات"];

const arabicWeekDays = {
  saturday: "السبت",
  sunday: "الأحد",
  monday: "الإثنين",
  tuesday: "الثلاثاء",
  wednesday: "الأربعاء",
  thursday: "الخميس",
  friday: "الجمعة",
};

const slotTimes = [
  "09:00","09:30","10:00","10:30","11:00","11:30",
  "12:00","12:30","13:00","13:30","14:00","14:30",
  "15:00","15:30","16:00","16:30","17:00",
];

// ─── helpers ─────────────────────────────────────────────────────────────────

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
  const n = normalizeText(text);
  return words.some((w) => n.includes(normalizeText(w)));
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
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
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

  for (let offset = 1; offset <= 14 && dates.length < 5; offset++) {
    const date = new Date(today);
    date.setDate(today.getDate() + offset);
    const englishDay = date.toLocaleDateString("en-US", { weekday: "long" }).toLowerCase();
    const arabicDay = date.toLocaleDateString("ar-EG", { weekday: "long" }).toLowerCase();
    if (
      hasSpecificDays &&
      !allowedDays.has(englishDay) &&
      !allowedDays.has(arabicWeekDays[englishDay]?.toLowerCase()) &&
      !allowedDays.has(arabicDay)
    ) continue;
    dates.push(getIsoDate(date));
  }
  return dates;
}

function buildSlotsForDoctor(doctor, appointments) {
  const slots = [];
  for (const date of getNextClinicDates(doctor)) {
    for (const time of slotTimes) {
      if (!isSlotWithinWorkday(doctor, time)) continue;
      if (!isAppointmentSlotAvailable({ doctorId: doctor.id, date, time }, appointments)) continue;
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
  return parsed.toLocaleDateString("ar-EG", { weekday: "short", day: "numeric", month: "short" });
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

function getDoctorName(doctor) {
  return (
    doctor.name ||
    [doctor.firstName, doctor.lastName].filter(Boolean).join(" ").trim() ||
    "طبيب ميديلينك"
  );
}

function getDoctorSpecialty(doctor) {
  return doctor.specialty || doctor.specializationName || "طبيب عام";
}

function getDoctorImageUrl(doctor) {
  return doctor.image || doctor.photo || defaultDoctorAvatar;
}

function toChatDoctor(doctor) {
  return {
    ...doctor,
    id: doctor.id || doctor._id || "",
    name: getDoctorName(doctor),
    specialty: getDoctorSpecialty(doctor),
    image: getDoctorImageUrl(doctor),
    consultationFee: doctor.consultationFee || doctor.price || doctor.fee || null,
  };
}

function getSpecialtyOptions(doctors) {
  return [...new Set(doctors.map(getDoctorSpecialty).filter(Boolean))];
}

function resolveSpecialty(raw, options) {
  const normalized = normalizeText(raw);
  if (!normalized || normalized.includes("عام")) return "";
  return (
    options.find((o) => normalizeText(o) === normalized) ||
    options.find(
      (o) =>
        normalizeText(o).includes(normalized) ||
        normalized.includes(normalizeText(o)),
    ) ||
    ""
  );
}

function getAvailableDoctorRecommendations(specialty, doctors, appointments) {
  const chatDoctors = doctors.map(toChatDoctor);
  const filtered = specialty
    ? chatDoctors.filter(
        (d) =>
          normalizeText(d.specialty).includes(normalizeText(specialty)) ||
          normalizeText(specialty).includes(normalizeText(d.specialty)),
      )
    : chatDoctors;
  const selected = filtered.length > 0 ? filtered : chatDoctors;
  return selected.slice(0, 3).map((d) => ({ ...d, slots: buildSlotsForDoctor(d, appointments) }));
}

function getProfileFromUser(user) {
  return user?.patient || user?.profile || user || {};
}

function getUserId(user) {
  const p = getProfileFromUser(user);
  return user?.patientId || p?._id || p?.id || user?._id || user?.id || "";
}

function getUserName(user) {
  const p = getProfileFromUser(user);
  return (
    p?.name ||
    [p?.firstName, p?.lastName].filter(Boolean).join(" ").trim() ||
    "مريض ميديلينك"
  );
}

function getUserPhone(user) {
  const p = getProfileFromUser(user);
  return p?.phone || p?.phoneNumber || p?.mobile || "";
}

function buildInitialMessages(user) {
  const name = user ? getUserName(user) : "";
  return [
    {
      id: "welcome",
      type: "assistant",
      text: name
        ? `أهلًا ${name}! 😊 أنا مساعدك الطبي في ميديلينك. سألني عن أي عَرَض أو مرض وهساعدك تفهم الوضع وتعرف تروح أنهي دكتور.`
        : "أهلًا! أنا مساعدك الطبي في ميديلينك. سألني عن أي عَرَض أو مرض وهساعدك.",
    },
  ];
}

function filterPatientAppointments(appointments, user) {
  const patientId = String(getUserId(user));
  const phone = getUserPhone(user);
  const name = getUserName(user);
  return appointments.filter(
    (a) =>
      (patientId && String(a.patientId) === patientId) ||
      (phone && a.phone === phone) ||
      (name && includesSearchText(a.patient, name)),
  );
}

function describeChatError(error) {
  if (error?.kind === "network") return "تعذر الاتصال بالسيرفر، تأكد من الإنترنت وجرب تاني.";
  if (error?.code === "insufficient_quota") return "المساعد الذكي وصل للحد المسموح، جرب بعدين.";
  if (error?.status === 401 || error?.code === "invalid_api_key") return "إعداد المساعد الذكي غير مكتمل، تواصل مع الدعم.";
  if (error?.status === 429) return "في ضغط على المساعد دلوقتي، استنى شوية وجرب تاني.";
  return "المساعد الذكي مش متاح دلوقتي، تقدر تسأل من خلال الحجز المباشر.";
}

function buildHistory(messages) {
  const history = messages
    .filter((m) => ["assistant", "user"].includes(m.type) && m.text)
    .slice(-8)
    .map((m) => ({ role: m.type === "user" ? "user" : "assistant", content: m.text }));
  return [{ role: "system", content: SYSTEM_PROMPT }, ...history];
}

// ─── sub-components ──────────────────────────────────────────────────────────

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
  if (doctors.length === 0) {
    return (
      <div className="rounded-2xl rounded-tr-sm border border-gray-100 bg-white px-3 py-2 text-sm leading-6 text-gray-500 shadow-sm dark:border-[#3A3A3A] dark:bg-[#303030] dark:text-[#D2D2D2]">
        مفيش أطباء متاحين في هذا التخصص دلوقتي.
      </div>
    );
  }

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
              className="h-14 w-14 shrink-0 rounded-full object-cover"
            />
            <div className="min-w-0 flex-1">
              <p className="truncate text-[12px] font-semibold text-gray-900 dark:text-[#F0F0F0]">
                {doctor.name}
              </p>
              <p className="truncate text-[11px] text-gray-500 dark:text-[#D2D2D2]">
                {doctor.specialty}
              </p>
              {doctor.consultationFee && (
                <p className="text-[11px] font-semibold text-[#05ADE8]">
                  {doctor.consultationFee} ج.م
                </p>
              )}
              <div className="mt-0.5 flex gap-0.5 text-[10px] text-yellow-400">
                {[1, 2, 3, 4, 5].map((s) => <FaStar key={s} />)}
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
          <p className="text-sm font-semibold text-gray-900 dark:text-[#F0F0F0]">تأكيد الحجز</p>
          <p className="mt-1 text-xs leading-5 text-gray-500 dark:text-[#D2D2D2]">
            {booking.doctor.name} — {formatDate(booking.slot.date)} — {formatTime(booking.slot.time)}
          </p>
          {booking.doctor.consultationFee && (
            <p className="text-xs font-semibold text-[#05ADE8]">
              رسوم الكشف: {booking.doctor.consultationFee} ج.م
            </p>
          )}
        </div>
      </div>

      <button
        type="button"
        disabled={isProcessing}
        onClick={() => onPay(booking)}
        className="mt-3 inline-flex h-9 w-full items-center justify-center gap-2 rounded-full bg-linear-to-r from-[#05ADE8] to-[#6CCCC8] px-4 text-xs font-semibold text-white shadow-sm disabled:cursor-not-allowed disabled:opacity-70"
      >
        <FiCheckCircle className="h-4 w-4" />
        {isProcessing ? "جاري التأكيد..." : "تأكيد الحجز"}
      </button>
    </div>
  );
}

function AppointmentsList({ appointments }) {
  if (appointments.length === 0) {
    return (
      <div className="rounded-2xl rounded-tr-sm border border-gray-100 bg-white px-3 py-2 text-sm leading-6 text-gray-700 shadow-sm dark:border-[#3A3A3A] dark:bg-[#303030] dark:text-[#F0F0F0]">
        مفيش حجوزات مسجلة لحسابك لحد دلوقتي.
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
            {formatDate(appointment.date)} — {formatTime(appointment.time)}
          </p>
          <p className="mt-1 text-xs font-semibold capitalize text-[#129a55]">
            {appointment.status === "completed" ? "مكتمل" : "مؤكد"}
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
      </div>
    </div>
  );
}

// ─── main component ───────────────────────────────────────────────────────────

export default function AiAgent({ onClose, initialMessage }) {
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
  const [messages, setMessages] = useState(() => buildInitialMessages(getCurrentAuthUser()));
  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);

  useEffect(() => {
    const sync = () => {
      const next = getCurrentAuthUser();
      setCurrentUser(next);
      setMessages(buildInitialMessages(next));
    };
    window.addEventListener("storage", sync);
    window.addEventListener("medilink-auth-change", sync);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener("medilink-auth-change", sync);
    };
  }, []);

  useEffect(() => {
    if (!isLoggedIn) return undefined;
    let mounted = true;
    const timer = window.setTimeout(async () => {
      setIsLoadingData(true);
      const [doctorsResult, appointmentsResult] = await Promise.allSettled([
        listDoctors(),
        listAppointments(),
      ]);
      if (!mounted) return;
      if (doctorsResult.status === "fulfilled") setDoctors(doctorsResult.value);
      if (appointmentsResult.status === "fulfilled") setAppointments(appointmentsResult.value);
      setIsLoadingData(false);
    }, 0);
    return () => {
      mounted = false;
      window.clearTimeout(timer);
    };
  }, [isLoggedIn]);

  // ── booking flow ────────────────────────────────────────────────────────────

  const handlePickSlot = (doctor, slot) => {
    const booking = { id: createId("payment"), doctor, slot };
    setMessages((prev) => [
      ...prev,
      { id: createId("assistant"), type: "assistant", text: "الموعد متاح! تأكيد الحجز؟" },
      { id: createId("payment-card"), type: "payment", booking },
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
      setAppointments((prev) => [appointment, ...prev]);
      setMessages((prev) => [
        ...prev,
        {
          id: createId("assistant"),
          type: "assistant",
          text: `تم تأكيد الحجز مع ${booking.doctor.name} يوم ${formatDate(booking.slot.date)} الساعة ${formatTime(booking.slot.time)} ✅`,
        },
      ]);
      toast.success("تم تأكيد الحجز");
    } catch (error) {
      const msg = error.message || "تعذر تأكيد الحجز، اختر موعدًا آخر";
      toast.error(msg);
      setMessages((prev) => [
        ...prev,
        { id: createId("assistant"), type: "assistant", text: msg },
      ]);
    } finally {
      setPendingPaymentId("");
    }
  };

  // ── message handlers ────────────────────────────────────────────────────────

  const handleAppointmentsRequest = () => {
    const patientAppointments = filterPatientAppointments(appointments, currentUser);
    setMessages((prev) => [
      ...prev,
      { id: createId("assistant"), type: "assistant", text: "دي حجوزاتك المسجلة:" },
      { id: createId("appointments"), type: "appointments", appointments: patientAppointments },
    ]);
  };

  const handleBookingRequest = async (text) => {
    const loadingId = createId("assistant-loading");
    setMessages((prev) => [
      ...prev,
      { id: loadingId, type: "assistant", text: "بحدد التخصص المناسب ليك..." },
    ]);

    const specialtyOptions = getSpecialtyOptions(doctors);
    let triage;

    try {
      triage = await requestTriage(text, specialtyOptions);
    } catch {
      triage = { needed: "", specialty: "", available: false };
    }

    const matched = resolveSpecialty(
      triage.specialty || (triage.available ? triage.needed : ""),
      specialtyOptions,
    );

    let responseText;
    let doctorsToShow = [];

    if (matched) {
      responseText = `التخصص المناسب ليك هو: **${matched}**. اختار موعد مناسب:`;
      doctorsToShow = getAvailableDoctorRecommendations(matched, doctors, appointments);
    } else if (triage.needed) {
      const allSpecialties = specialtyOptions.join("، ");
      responseText = allSpecialties
        ? `مش عندنا دكتور ${triage.needed} في العيادة دلوقتي. الأقسام المتاحة عندنا: ${allSpecialties}. تقدر تحجز مع أي منهم:`
        : `مش عندنا دكتور ${triage.needed} في العيادة دلوقتي. تواصل مع الاستقبال للمساعدة.`;
      doctorsToShow = allSpecialties
        ? getAvailableDoctorRecommendations("", doctors, appointments)
        : [];
    } else {
      responseText = "اتفضل الأطباء المتاحين:";
      doctorsToShow = getAvailableDoctorRecommendations("", doctors, appointments);
    }

    setMessages((prev) => {
      const updated = prev.map((m) => (m.id === loadingId ? { ...m, text: responseText } : m));
      if (doctorsToShow.length === 0) return updated;
      return [
        ...updated,
        { id: createId("doctors"), type: "doctors", doctors: doctorsToShow },
      ];
    });
  };

  const handleMedicalQuestion = async (text, history) => {
    const loadingId = createId("assistant-loading");
    setMessages((prev) => [
      ...prev,
      { id: loadingId, type: "assistant", text: "بفكر..." },
    ]);

    try {
      const response = await sendToChatProxy(text, history);
      setMessages((prev) =>
        prev.map((m) =>
          m.id === loadingId
            ? { ...m, text: response.text || "مش قادر أجاوب دلوقتي، جرب تاني." }
            : m,
        ),
      );
    } catch (error) {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === loadingId ? { ...m, text: describeChatError(error) } : m,
        ),
      );
    }
  };

  // ── voice ───────────────────────────────────────────────────────────────────

  const handleTranscription = async (blob, mimeType) => {
    if (!blob || blob.size === 0) { toast.warning("لم يُسجّل صوت، حاول تاني"); return; }
    setIsTranscribing(true);
    try {
      const base64 = await blobToBase64(blob);
      const text = await transcribeAudio(base64, mimeType);
      const trimmed = text.trim();
      if (!trimmed) { toast.warning("لم أتمكن من فهم التسجيل، حاول تاني"); return; }
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
      recorder.ondataavailable = (e) => { if (e.data.size > 0) audioChunksRef.current.push(e.data); };
      recorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(audioChunksRef.current, { type: recorder.mimeType || "audio/webm" });
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
    if (recorder && recorder.state !== "inactive") recorder.stop();
    setIsRecording(false);
  };

  const handleMicClick = () => {
    if (!isLoggedIn) { toast.warning("سجل دخولك لاستخدام المساعد"); return; }
    if (isTranscribing) return;
    if (isRecording) stopRecording(); else startRecording();
  };

  // ── send ────────────────────────────────────────────────────────────────────

  const handleSend = async (overrideText) => {
    if (!isLoggedIn) { toast.warning("سجل دخولك لاستخدام المساعد"); return; }
    const sourceText = typeof overrideText === "string" ? overrideText : message;
    const trimmed = sourceText.trim();
    if (!trimmed) { toast.warning("اكتب رسالتك الأول"); return; }

    const userMessage = { id: createId("user"), type: "user", text: trimmed };
    const history = buildHistory(messages);
    setMessages((prev) => [...prev, userMessage]);
    setMessage("");
    setIsSending(true);

    try {
      if (containsAny(trimmed, appointmentsWords)) {
        handleAppointmentsRequest();
        return;
      }
      if (containsAny(trimmed, bookingWords)) {
        await handleBookingRequest(trimmed);
        return;
      }
      await handleMedicalQuestion(trimmed, history);
    } finally {
      setIsSending(false);
    }
  };

  // ── auto-send initial message when opened from external button ───────────────

  const initialSentRef = useRef(false);
  useEffect(() => {
    if (!initialMessage || !isLoggedIn || initialSentRef.current) return;
    initialSentRef.current = true;
    const timer = window.setTimeout(() => handleSend(initialMessage), 600);
    return () => window.clearTimeout(timer);
  }, [initialMessage, isLoggedIn]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── render ──────────────────────────────────────────────────────────────────

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
            aria-label="إغلاق المساعد"
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
            {messages.map((m) => (
              <Message
                key={m.id}
                message={m}
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
              المساعد الطبي متاح داخل حساب المريض
            </p>
            <p className="mt-1 text-xs leading-5 text-gray-500 dark:text-[#D2D2D2]">
              سجل دخولك وهيعرف بياناتك وحجوزاتك تلقائيًا.
            </p>
          </div>
        )}
      </main>

      <footer className="shrink-0 border-t border-gray-100 bg-white p-3 dark:border-[#3A3A3A] dark:bg-[#252525]">
        <div className="rounded-2xl border border-gray-200 bg-white px-3 py-2 shadow-sm dark:border-[#3A3A3A] dark:bg-[#303030]">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !isSending) { e.preventDefault(); handleSend(); }
            }}
            placeholder={
              isRecording
                ? "جاري التسجيل... اضغط الميكروفون للإيقاف"
                : isTranscribing
                  ? "جاري تحويل الصوت إلى نص..."
                  : isLoadingData
                    ? "جاري تحميل البيانات..."
                    : "اسأل عن أي عَرَض أو مرض..."
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
              className="inline-flex h-9 items-center gap-1 rounded-full bg-linear-to-r from-[#05ADE8] to-[#6CCCC8] px-4 text-xs font-semibold text-white shadow-sm transition disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSending ? "جاري..." : "إرسال"}
              <FiSend className="h-3.5 w-3.5 rotate-180" />
            </button>
          </div>

          <div className="mt-2 flex items-center gap-2 text-[10px] text-gray-400">
            <FiCalendar className="h-3 w-3" />
            <span>اسأل عن أي عَرَض، أو اطلب حجز موعد مع دكتور.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
