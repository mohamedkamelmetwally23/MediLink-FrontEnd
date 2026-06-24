import { useEffect, useRef, useState } from "react";
import {
  FiCalendar,
  FiCheck,
  FiCreditCard,
  FiDollarSign,
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
  bookAppointmentByPatient,
  getBookedAppointmentsForPatient,
  getCurrentAuthUser,
  isAppointmentSlotAvailable,
  listDoctorAvailableSlots,
  listDoctors,
} from "../services/medilinkApi";
import { includesSearchText, normalizeSearchText } from "../utils/searchText";
import ThemeLogo from "./ThemeLogo";
import ProfileAvatar from "./ProfileAvatar";

// ─── constants ───────────────────────────────────────────────────────────────

const SYSTEM_PROMPT =
  "أنت مساعد ودود اسمه «مساعد ميديلينك». بتتكلم عربي مصري عادي وبسيط. " +
  "بتجاوب على أي سؤال يسألك عنه المريض بهدوء واحترام. " +
  "متشخصش التشخيص النهائي — دايمًا قول «لازم تروح الدكتور للتأكد». " +
  "لو حد سأل عن تخفيف الألم أو الانزعاج قبل موعد الدكتور، قدم نصائح منزلية عامة وآمنة زي: الراحة، شرب مية كتير، كمادة دافية أو باردة، الجلوس بوضعية مريحة. " +
  "وضح دايمًا إن دي نصائح مؤقتة للتخفيف بس وإن الدكتور هو الأساس للعلاج. " +
  "متوصفش أدوية أو جرعات محددة أبدًا. " +
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
  return (
    doctor.specialty ||
    doctor.specializationName ||
    doctor.specialization?.name ||
    (typeof doctor.specialization === "string" ? doctor.specialization : "") ||
    "طبيب عام"
  );
}

function getDoctorImageUrl(doctor) {
  return doctor.image || doctor.photo || "";
}

function toChatDoctor(doctor) {
  return {
    ...doctor,
    id: doctor.id || doctor._id || "",
    name: getDoctorName(doctor),
    specialty: getDoctorSpecialty(doctor),
    image: getDoctorImageUrl(doctor),
    consultationFee:
      doctor.consultationFee ||
      doctor.specialization?.consultationFee ||
      doctor.price ||
      doctor.fee ||
      null,
  };
}

function getSpecialtyOptions(doctors) {
  return [...new Set(doctors.map(getDoctorSpecialty).filter(Boolean))];
}

function resolveSpecialty(raw, options) {
  const normalized = normalizeText(raw);
  if (!normalized || normalized.includes("عام")) return "";
  // 1. Exact match
  const exact = options.find((o) => normalizeText(o) === normalized);
  if (exact) return exact;
  // 2. Substring match (one fully contains the other)
  const sub = options.find(
    (o) => normalizeText(o).includes(normalized) || normalized.includes(normalizeText(o)),
  );
  if (sub) return sub;
  // 3. Word-level match — any meaningful word from the query appears in the specialty
  const words = normalized.split(/\s+/).filter((w) => w.length > 2);
  if (!words.length) return "";
  return options.find((o) => {
    const on = normalizeText(o);
    return words.some((w) => on.includes(w));
  }) || "";
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
  const selected = filtered.length > 0 ? filtered : (specialty ? [] : chatDoctors);
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

function getUserImage(user) {
  const p = getProfileFromUser(user);
  return p?.photo || p?.image || p?.avatar || user?.photo || user?.image || "";
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

// ─── inline booking helpers ───────────────────────────────────────────────────

const arabicWeekDaysFull = ["الأحد", "الإثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];
const dayShort = { "الأحد": "أحد", "الإثنين": "إثن", "الثلاثاء": "ثلا", "الأربعاء": "أرب", "الخميس": "خمس", "الجمعة": "جمع", "السبت": "سبت" };

function dateKey(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function isSlotAvailable(status) {
  return ["متاح", "available", "open", "free"].includes(String(status || "").trim().toLowerCase());
}

function isSlotPast(date, time) {
  const [year, month, day] = String(date || "").split("-").map(Number);
  const [hours, minutes = 0] = String(time || "").split(":").map(Number);
  if (![year, month, day, hours, minutes].every(Number.isFinite)) return false;
  return new Date(year, month - 1, day, hours, minutes) <= new Date();
}

function isSlotSelectable(slot, fallbackDate = "") {
  const slotDate = slot.date || fallbackDate;
  return isSlotAvailable(slot.status) && !isSlotPast(slotDate, slot.time);
}

// ─── inline booking stepper ───────────────────────────────────────────────────


// ─── inline booking flow ──────────────────────────────────────────────────────

function InlineBookingFlow({ booking, onUpdate, onConfirm }) {
  const {
    step = 1,
    doctor,
    availableSlotDays = [],
    selectedDate = "",
    selectedTime = "",
    reason = "",
    paymentMethod = "clinic",
    submitting = false,
    done = false,
    appointment = null,
    loadingSlots = false,
  } = booking;

  const slotDaysByDate = new Map(availableSlotDays.map((d) => [d.date, d]));
  const dates = Array.from({ length: 7 }, (_, offset) => {
    const dateObj = new Date();
    dateObj.setHours(12, 0, 0, 0);
    dateObj.setDate(dateObj.getDate() + offset);
    const date = dateKey(dateObj);
    const slotDay = slotDaysByDate.get(date);
    return {
      date,
      dayNum: dateObj.getDate(),
      day: slotDay?.day || arabicWeekDaysFull[dateObj.getDay()],
      available: Boolean(slotDay?.slots?.some((s) => isSlotSelectable(s, date))),
    };
  });

  const selectedDay = availableSlotDays.find((d) => d.date === selectedDate);
  const availableSlots = (selectedDay?.slots || []).filter((s) => isSlotSelectable(s, selectedDate));

  return (
    <div className="w-full overflow-hidden rounded-2xl border border-[#BFEAF8] bg-white shadow-sm dark:border-[#3A3A3A] dark:bg-[#303030]">
      {/* Doctor header — gradient with photo */}
      <div className="relative bg-linear-to-r from-[#05ADE8] to-[#6CCCC8] px-3 pb-3 pt-3">
        <div className="flex items-center gap-3">
          <ProfileAvatar
            src={doctor.image}
            alt={doctor.name}
            className="h-12 w-12 shrink-0 rounded-full border-2 border-white/60 object-cover shadow-md"
          />
          <div className="min-w-0 flex-1">
            <p className="truncate text-[13px] font-bold text-white">{doctor.name}</p>
            <p className="truncate text-[11px] text-white/80">{doctor.specialty}</p>
          </div>
          {doctor.consultationFee && (
            <span className="shrink-0 rounded-full bg-white/20 px-2.5 py-1 text-[10px] font-bold text-white backdrop-blur-sm">
              {doctor.consultationFee} ج.م
            </span>
          )}
        </div>
      </div>

      <div className="p-3">

      {/* ── Step 1: Date & Time ── */}
      {step === 1 && (
        <div>
          {loadingSlots ? (
            <p className="py-4 text-center text-[11px] text-gray-400">جاري تحميل المواعيد...</p>
          ) : (
            <>
              <p className="mb-2 text-[11px] font-semibold text-gray-700 dark:text-[#D2D2D2]">اختار التاريخ</p>
              <div className="grid grid-cols-7 gap-1">
                {dates.map((d) => (
                  <button
                    key={d.date}
                    type="button"
                    disabled={!d.available}
                    onClick={() => onUpdate({ selectedDate: d.date, selectedTime: "" })}
                    className={`rounded-lg py-2 text-center transition
                      ${d.date === selectedDate ? "bg-[#05ADE8] text-white" : d.available ? "bg-gray-100 hover:bg-[#EAF8FC] dark:bg-[#3A3A3A]" : "cursor-not-allowed bg-gray-50 text-gray-300 dark:bg-[#2A2A2A]"}`}
                  >
                    <span className="block text-[8px] leading-tight">{dayShort[d.day] ?? d.day.slice(0, 3)}</span>
                    <strong className="block text-xs">{d.dayNum}</strong>
                  </button>
                ))}
              </div>

              {selectedDate && (
                <div className="mt-3">
                  <p className="mb-2 text-[11px] font-semibold text-gray-700 dark:text-[#D2D2D2]">اختار الوقت</p>
                  {availableSlots.length > 0 ? (
                    <div className="grid grid-cols-3 gap-1.5">
                      {availableSlots.map((slot) => (
                        <button
                          key={slot.time}
                          type="button"
                          onClick={() => onUpdate({ selectedTime: slot.time })}
                          className={`rounded-lg py-1.5 text-[10px] font-semibold transition
                            ${slot.time === selectedTime ? "bg-[#05ADE8] text-white" : "bg-[#EAF8FC] text-[#05ADE8] hover:bg-[#D0F0FC]"}`}
                        >
                          {formatTime(slot.time)}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <p className="py-2 text-center text-[11px] text-gray-400">لا توجد أوقات لهذا اليوم</p>
                  )}
                </div>
              )}
            </>
          )}

          <button
            type="button"
            disabled={!selectedDate || !selectedTime}
            onClick={() => onUpdate({ step: 2 })}
            className="mt-3 w-full rounded-full bg-linear-to-r from-[#05ADE8] to-[#6CCCC8] py-2 text-[11px] font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40"
          >
            التالي
          </button>
        </div>
      )}

      {/* ── Step 2: Visit Reason ── */}
      {step === 2 && (
        <div>
          <p className="mb-2 text-[11px] font-semibold text-gray-700 dark:text-[#D2D2D2]">سبب الزيارة</p>
          <textarea
            value={reason}
            onChange={(e) => onUpdate({ reason: e.target.value })}
            placeholder="اكتب الأعراض أو المشكلة التي تريد استشارة الطبيب بشأنها..."
            rows={3}
            maxLength={150}
            className="w-full resize-none rounded-xl border border-gray-200 bg-gray-50 p-2.5 text-[11px] outline-none transition focus:border-[#05ADE8] dark:border-[#555] dark:bg-[#3A3A3A] dark:text-[#F0F0F0]"
          />
          <p className="mt-1 text-right text-[9px] text-gray-400">{reason.length}/150</p>
          <div className="mt-2 grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => onUpdate({ step: 1 })}
              className="rounded-full border-2 border-[#05ADE8] py-2 text-[11px] font-semibold text-[#05ADE8]"
            >
              السابق
            </button>
            <button
              type="button"
              disabled={reason.trim().length < 3}
              onClick={() => onUpdate({ step: 3 })}
              className="rounded-full bg-linear-to-r from-[#05ADE8] to-[#6CCCC8] py-2 text-[11px] font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40"
            >
              التالي
            </button>
          </div>
        </div>
      )}

      {/* ── Step 3: Payment ── */}
      {step === 3 && (
        <div>
          <p className="mb-2 text-[11px] font-semibold text-gray-700 dark:text-[#D2D2D2]">طريقة الدفع</p>
          <div className="space-y-2">
            <button
              type="button"
              onClick={() => onUpdate({ paymentMethod: "clinic" })}
              className={`flex w-full items-center gap-3 rounded-xl border-2 px-3 py-2.5 text-right transition
                ${paymentMethod === "clinic" ? "border-[#05ADE8] bg-[#EAF8FC] dark:bg-[#1F3A3F]" : "border-gray-200 dark:border-[#555]"}`}
            >
              <FiDollarSign className={`h-4 w-4 shrink-0 ${paymentMethod === "clinic" ? "text-[#05ADE8]" : "text-gray-400"}`} />
              <div>
                <p className="text-[11px] font-semibold">الدفع في العيادة</p>
                <p className="text-[9px] text-gray-400">ادفع عند الوصول</p>
              </div>
              {paymentMethod === "clinic" && <FiCheck className="mr-auto h-4 w-4 text-[#05ADE8]" />}
            </button>
            <button
              type="button"
              onClick={() => onUpdate({ paymentMethod: "card" })}
              className={`flex w-full items-center gap-3 rounded-xl border-2 px-3 py-2.5 text-right transition
                ${paymentMethod === "card" ? "border-[#05ADE8] bg-[#EAF8FC] dark:bg-[#1F3A3F]" : "border-gray-200 dark:border-[#555]"}`}
            >
              <FiCreditCard className={`h-4 w-4 shrink-0 ${paymentMethod === "card" ? "text-[#05ADE8]" : "text-gray-400"}`} />
              <div>
                <p className="text-[11px] font-semibold">بطاقة بنكية</p>
                <p className="text-[9px] text-gray-400">VISA / Mastercard</p>
              </div>
              {paymentMethod === "card" && <FiCheck className="mr-auto h-4 w-4 text-[#05ADE8]" />}
            </button>
          </div>

          <div className="mt-3 rounded-lg bg-[#EAF8FC] p-2 text-[10px] text-gray-500 dark:bg-[#1F3A3F]">
            <p><strong>الموعد:</strong> {formatDate(selectedDate)} — {formatTime(selectedTime)}</p>
            {doctor.consultationFee && <p><strong>سعر الكشف:</strong> {doctor.consultationFee} ج.م</p>}
          </div>

          <div className="mt-3 grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => onUpdate({ step: 2 })}
              className="rounded-full border-2 border-[#05ADE8] py-2 text-[11px] font-semibold text-[#05ADE8]"
            >
              السابق
            </button>
            <button
              type="button"
              disabled={submitting}
              onClick={onConfirm}
              className="rounded-full bg-linear-to-r from-[#05ADE8] to-[#6CCCC8] py-2 text-[11px] font-semibold text-white disabled:opacity-70"
            >
              {submitting ? "جاري التأكيد..." : "تأكيد الحجز"}
            </button>
          </div>
        </div>
      )}

      {/* ── Step 4: Confirmation ── */}
      {step === 4 && done && (
        <div className="text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-linear-to-r from-[#05ADE8] to-[#6CCCC8] text-white">
            <FiCheck className="h-7 w-7" />
          </div>
          <p className="text-sm font-bold text-gray-900 dark:text-[#F0F0F0]">تم تأكيد الحجز ✅</p>
          <div className="mt-3 space-y-1.5 rounded-xl bg-[#EAF8FC] p-3 text-right text-[11px] dark:bg-[#1F3A3F]">
            <div className="flex justify-between gap-2">
              <span className="text-gray-400 shrink-0">الطبيب</span>
              <span className="font-semibold truncate">{doctor.name}</span>
            </div>
            <div className="flex justify-between gap-2">
              <span className="text-gray-400 shrink-0">التاريخ</span>
              <span className="font-semibold">{formatDate(selectedDate)}</span>
            </div>
            <div className="flex justify-between gap-2">
              <span className="text-gray-400 shrink-0">الوقت</span>
              <span className="font-semibold">{formatTime(selectedTime)}</span>
            </div>
            {appointment?.id && (
              <div className="flex justify-between gap-2">
                <span className="text-gray-400 shrink-0">رقم الحجز</span>
                <span className="font-semibold text-[#05ADE8]">#{String(appointment.id).replace(/^demo-/, "").slice(-6)}</span>
              </div>
            )}
          </div>
        </div>
      )}
      </div>
    </div>
  );
}

// ─── markdown renderer ────────────────────────────────────────────────────────

function renderInline(str) {
  const parts = str.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={i}>{part.slice(2, -2)}</strong>;
    }
    return part;
  });
}

function renderMarkdown(text) {
  if (!text) return null;
  const lines = text.split("\n");
  const elements = [];
  let listItems = [];
  let listType = null;

  const flushList = () => {
    if (!listItems.length) return;
    const Tag = listType === "ol" ? "ol" : "ul";
    const cls = listType === "ol"
      ? "list-decimal space-y-1 pr-5 my-1"
      : "list-disc space-y-1 pr-5 my-1";
    elements.push(<Tag key={`list-${elements.length}`} className={cls}>{listItems}</Tag>);
    listItems = [];
    listType = null;
  };

  lines.forEach((line, i) => {
    const numbered = /^(\d+)[.)]\s+(.+)$/.exec(line);
    const bullet = /^[-•*]\s+(.+)$/.exec(line);

    if (numbered) {
      if (listType !== "ol") { flushList(); listType = "ol"; }
      listItems.push(<li key={i} className="leading-6">{renderInline(numbered[2])}</li>);
    } else if (bullet) {
      if (listType !== "ul") { flushList(); listType = "ul"; }
      listItems.push(<li key={i} className="leading-6">{renderInline(bullet[1])}</li>);
    } else {
      flushList();
      if (line.trim()) {
        elements.push(<p key={i} className="leading-6">{renderInline(line)}</p>);
      } else if (elements.length > 0) {
        elements.push(<div key={`br-${i}`} className="h-1" />);
      }
    }
  });

  flushList();
  return <div className="space-y-0.5 text-sm">{elements}</div>;
}

// ─── sub-components ──────────────────────────────────────────────────────────

function AssistantAvatar() {
  return (
    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-[#05ADE8] to-[#6CCCC8] text-[10px] font-bold text-white shadow-sm">
      AI
    </span>
  );
}

function UserAvatar({ image }) {
  const [imgError, setImgError] = useState(false);
  if (image && !imgError) {
    return (
      <img
        src={image}
        alt="صورة المريض"
        onError={() => setImgError(true)}
        className="h-8 w-8 shrink-0 rounded-full object-cover shadow-sm"
      />
    );
  }
  return (
    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-gray-300 to-gray-400 text-white dark:from-[#4A4A4A] dark:to-[#3A3A3A]">
      <FiUser className="h-4 w-4" />
    </span>
  );
}

function DoctorCards({ doctors, onBookDoctor }) {
  if (doctors.length === 0) {
    return (
      <div className="rounded-2xl border border-gray-100 bg-white px-3 py-3 text-sm text-gray-500 shadow-sm dark:border-[#3A3A3A] dark:bg-[#2A2A2A] dark:text-[#D2D2D2]">
        مفيش أطباء متاحين في هذا التخصص دلوقتي.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-3">
      {doctors.map((doctor) => (
        <div
          key={doctor.id}
          className="overflow-hidden rounded-2xl border border-[#BFEAF8] bg-white shadow-md dark:border-[#3A3A3A] dark:bg-[#2A2A2A]"
        >
          {/* Gradient header with doctor image overlapping */}
          <div className="relative h-16 bg-linear-to-r from-[#05ADE8] to-[#6CCCC8]">
            <ProfileAvatar
              src={doctor.image}
              alt={doctor.name}
              className="absolute -bottom-6 right-3 h-16 w-16 rounded-full border-[3px] border-white object-cover shadow-md dark:border-[#2A2A2A]"
            />
          </div>

          {/* Body */}
          <div className="px-3 pb-3 pt-8 text-right">
            <p className="text-[13px] font-bold text-gray-900 dark:text-[#F0F0F0]">
              {doctor.name}
            </p>
            <p className="mt-0.5 text-[11px] text-gray-500 dark:text-[#A0A0A0]">
              {doctor.specialty}
            </p>
            <div className="mt-1.5 flex items-center justify-end gap-2">
              <div className="flex gap-0.5 text-[10px] text-yellow-400">
                {[1, 2, 3, 4, 5].map((s) => <FaStar key={s} />)}
              </div>
              {doctor.consultationFee && (
                <span className="rounded-full bg-[#EAF8FC] px-2 py-0.5 text-[10px] font-bold text-[#05ADE8] dark:bg-[#1A3A40]">
                  {doctor.consultationFee} ج.م
                </span>
              )}
            </div>

            <button
              type="button"
              onClick={() => onBookDoctor(doctor)}
              className="mt-3 inline-flex h-9 w-full items-center justify-center gap-1.5 rounded-xl bg-linear-to-r from-[#05ADE8] to-[#6CCCC8] text-[12px] font-bold text-white shadow-sm transition hover:opacity-90 hover:shadow-md"
            >
              <FiCalendar className="h-3.5 w-3.5" />
              احجز مع الدكتور
            </button>
          </div>
        </div>
      ))}
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

  const statusMap = {
    confirmed: { label: "مؤكد", color: "text-[#05ADE8] bg-[#EAF8FC]" },
    completed: { label: "مكتمل", color: "text-green-600 bg-green-50" },
    cancelled: { label: "ملغي", color: "text-red-500 bg-red-50" },
    pending:   { label: "قيد الانتظار", color: "text-yellow-600 bg-yellow-50" },
  };

  return (
    <div className="space-y-2.5">
      {appointments.map((appt) => {
        const st = statusMap[appt.status] || { label: appt.status || "مؤكد", color: "text-[#05ADE8] bg-[#EAF8FC]" };
        return (
          <div
            key={appt.id}
            className="overflow-hidden rounded-2xl border border-[#BFEAF8] bg-white shadow-md dark:border-[#3A3A3A] dark:bg-[#2A2A2A]"
          >
            <div className="bg-linear-to-r from-[#05ADE8]/10 to-[#6CCCC8]/10 px-3 py-2 border-b border-[#E0F5FD] dark:border-[#3A3A3A]">
              <div className="flex items-center justify-between gap-2">
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${st.color}`}>
                  {st.label}
                </span>
                <p className="text-[13px] font-bold text-gray-900 dark:text-[#F0F0F0]">
                  {appt.doctor || "طبيب ميديلينك"}
                </p>
              </div>
              {appt.specialty && (
                <p className="mt-0.5 text-right text-[11px] text-gray-500 dark:text-[#A0A0A0]">{appt.specialty}</p>
              )}
            </div>
            <div className="flex items-center justify-between px-3 py-2 text-right">
              <span className="text-[11px] text-gray-500 dark:text-[#A0A0A0]">{formatTime(appt.time)}</span>
              <span className="text-[12px] font-semibold text-gray-700 dark:text-[#D2D2D2]">{formatDate(appt.date)}</span>
            </div>
            {appt.reason && (
              <p className="border-t border-gray-100 px-3 py-1.5 text-right text-[11px] text-gray-500 dark:border-[#3A3A3A] dark:text-[#A0A0A0]">
                {appt.reason}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}

function Message({ message, onBookDoctor, onBookingUpdate, onBookingConfirm, userImage }) {
  if (message.type === "user") {
    return (
      <div className="flex items-end justify-end gap-2">
        <div className="max-w-[78%] rounded-2xl rounded-br-sm bg-linear-to-r from-[#05ADE8] to-[#6CCCC8] px-3.5 py-2.5 text-sm leading-6 text-white shadow-md">
          {message.text}
        </div>
        <UserAvatar image={userImage} />
      </div>
    );
  }

  return (
    <div className="flex items-end gap-2">
      <AssistantAvatar />
      <div className="max-w-[90%] w-full space-y-2">
        {message.type === "assistant" && (
          <div className="rounded-2xl rounded-bl-sm border border-gray-100 bg-white px-3.5 py-2.5 text-sm text-gray-700 shadow-md dark:border-[#3A3A3A] dark:bg-[#2A2A2A] dark:text-[#F0F0F0]">
            {renderMarkdown(message.text)}
          </div>
        )}
        {message.type === "doctors" && (
          <DoctorCards doctors={message.doctors} onBookDoctor={onBookDoctor} />
        )}
        {message.type === "booking" && (
          <InlineBookingFlow
            booking={message}
            onUpdate={(updates) => onBookingUpdate(message.id, updates)}
            onConfirm={() => onBookingConfirm(message)}
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

const CHAT_STORAGE_KEY = (uid) => `medilink-chat-v1-${uid}`;

function loadStoredMessages(user) {
  const uid = getUserId(user);
  if (!uid) return buildInitialMessages(user);
  try {
    const raw = localStorage.getItem(CHAT_STORAGE_KEY(uid));
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {
    // ignore parse errors
  }
  return buildInitialMessages(user);
}

export default function AiAgent({ onClose, initialMessage }) {
  const [currentUser, setCurrentUser] = useState(() => getCurrentAuthUser());
  const isLoggedIn = Boolean(currentUser);
  const [isSending, setIsSending] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState(() => loadStoredMessages(getCurrentAuthUser()));
  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    const sync = () => {
      const next = getCurrentAuthUser();
      setCurrentUser(next);
      setMessages(loadStoredMessages(next));
    };
    window.addEventListener("storage", sync);
    window.addEventListener("medilink-auth-change", sync);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener("medilink-auth-change", sync);
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Save chat history to localStorage whenever messages change
  useEffect(() => {
    const uid = getUserId(currentUser);
    if (!uid) return;
    try {
      const toSave = messages
        .filter((m) => m.type !== "payment")
        .slice(-40);
      localStorage.setItem(CHAT_STORAGE_KEY(uid), JSON.stringify(toSave));
    } catch {
      // ignore storage errors
    }
  }, [messages, currentUser]);

  useEffect(() => {
    if (!isLoggedIn) return undefined;
    let mounted = true;
    const timer = window.setTimeout(async () => {
      setIsLoadingData(true);
      const [doctorsResult, appointmentsResult] = await Promise.allSettled([
        listDoctors(),
        getBookedAppointmentsForPatient(),
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

  const updateBookingMessage = (id, updates) => {
    setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, ...updates } : m)));
  };

  const confirmBooking = async (bookingMsg) => {
    updateBookingMessage(bookingMsg.id, { submitting: true });
    try {
      const appointment = await bookAppointmentByPatient({
        doctorId: bookingMsg.doctor.id,
        date: bookingMsg.selectedDate,
        slotTime: bookingMsg.selectedTime,
        reason: bookingMsg.reason,
        medicalFiles: [],
      });
      updateBookingMessage(bookingMsg.id, { step: 4, submitting: false, done: true, appointment });
      setAppointments((prev) => [appointment, ...prev]);
      toast.success("تم تأكيد الحجز بنجاح");
    } catch (error) {
      updateBookingMessage(bookingMsg.id, { submitting: false });
      toast.error(error.message || "تعذر إتمام الحجز");
    }
  };

  const handleBookDoctor = async (doctor) => {
    const msgId = createId("booking");
    setMessages((prev) => [
      ...prev,
      {
        id: msgId,
        type: "booking",
        doctor,
        availableSlotDays: [],
        step: 1,
        selectedDate: "",
        selectedTime: "",
        reason: "",
        paymentMethod: "clinic",
        submitting: false,
        done: false,
        appointment: null,
        loadingSlots: true,
      },
    ]);
    try {
      const slotDays = await listDoctorAvailableSlots(doctor.id);
      updateBookingMessage(msgId, { availableSlotDays: slotDays, loadingSlots: false });
    } catch {
      updateBookingMessage(msgId, { loadingSlots: false });
    }
  };

  // ── message handlers ────────────────────────────────────────────────────────

  const handleAppointmentsRequest = () => {
    setMessages((prev) => [
      ...prev,
      { id: createId("assistant"), type: "assistant", text: appointments.length > 0 ? "دي حجوزاتك المسجلة:" : "مفيش حجوزات مسجلة لحسابك لحد دلوقتي." },
      ...(appointments.length > 0
        ? [{ id: createId("appointments"), type: "appointments", appointments }]
        : []),
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

    // Try triage result, then fall back to direct text search against specialty list
    let matched = resolveSpecialty(
      triage.specialty || (triage.available ? triage.needed : ""),
      specialtyOptions,
    );
    if (!matched) matched = resolveSpecialty(text, specialtyOptions);

    let responseText;
    let doctorsToShow = [];

    if (matched) {
      doctorsToShow = getAvailableDoctorRecommendations(matched, doctors, appointments);
      if (doctorsToShow.length > 0) {
        responseText = `التخصص المناسب ليك هو: **${matched}**. اختار موعد مناسب:`;
      } else {
        responseText = `مفيش دكاترة متاحين في تخصص **${matched}** دلوقتي. تواصل مع الاستقبال للمساعدة.`;
      }
    } else if (triage.needed) {
      const allSpecialties = specialtyOptions.join("، ");
      responseText = allSpecialties
        ? `مش عندنا دكتور ${triage.needed} في العيادة دلوقتي.\nالأقسام المتاحة عندنا:\n${specialtyOptions.map((s) => `- ${s}`).join("\n")}\n\nقولي أنهي تخصص منهم محتاجه.`
        : `مش عندنا دكتور ${triage.needed} في العيادة دلوقتي. تواصل مع الاستقبال للمساعدة.`;
    } else {
      const allSpecialties = specialtyOptions.join("، ");
      responseText = allSpecialties
        ? `الأقسام المتاحة عندنا:\n${specialtyOptions.map((s) => `- ${s}`).join("\n")}\n\nقولي أنهي تخصص محتاجه وهجيبلك الدكاترة المتاحين.`
        : "مفيش أطباء متاحين دلوقتي. تواصل مع الاستقبال للمساعدة.";
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
      const responseText = response.text || "مش قادر أجاوب دلوقتي، جرب تاني.";

      setMessages((prev) => {
        const updated = prev.map((m) =>
          m.id === loadingId ? { ...m, text: responseText } : m,
        );
        // If user's message matches a known specialty, append doctor cards automatically
        const specialtyOptions = getSpecialtyOptions(doctors);
        const matched = resolveSpecialty(text, specialtyOptions);
        if (matched) {
          const doctorsToShow = getAvailableDoctorRecommendations(matched, doctors, appointments);
          if (doctorsToShow.length > 0) {
            return [
              ...updated,
              { id: createId("doctors"), type: "doctors", doctors: doctorsToShow },
            ];
          }
        }
        return updated;
      });
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

  // ── queue check ─────────────────────────────────────────────────────────────

  const handleQueueCheck = () => {
    const today = getIsoDate(new Date());
    const todayAll = appointments
      .filter((a) => a.date === today)
      .sort((a, b) => (toMinutes(a.time) || 0) - (toMinutes(b.time) || 0));

    const userAppts = filterPatientAppointments(todayAll, currentUser);
    const next = userAppts.find((a) => !isSlotPast(a.date, a.time));

    let text;
    if (!next) {
      text = "مفيش موعد ليك النهارده في الكلينيك.";
    } else {
      const before = todayAll.filter(
        (a) =>
          a.doctorId === next.doctorId &&
          (toMinutes(a.time) || 0) < (toMinutes(next.time) || 0),
      ).length;
      const waitMins = before * 15;
      text = `موعدك مع **${next.doctor || "الدكتور"}** الساعة **${formatTime(next.time)}**.\n\nفي ${before} مريض${before !== 1 ? " قبلك" : " قبلك"} — وقت الانتظار المتوقع **${waitMins} دقيقة** تقريباً.`;
    }

    setMessages((prev) => [
      ...prev,
      { id: createId("user"), type: "user", text: "وقت انتظاري كام؟" },
      { id: createId("assistant"), type: "assistant", text },
    ]);
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

      <main className="relative flex-1 overflow-y-auto bg-[#F0F9FD] px-4 py-4 dark:bg-[#1A1A1A]" style={{backgroundImage: "radial-gradient(circle at 20% 50%, rgba(5,173,232,0.04) 0%, transparent 60%), radial-gradient(circle at 80% 20%, rgba(108,204,200,0.04) 0%, transparent 50%)"}}>
        <div className={!isLoggedIn ? "opacity-60" : ""}>
          <div className="space-y-4">
            {messages.map((m) => (
              <Message
                key={m.id}
                message={m}
                onBookDoctor={handleBookDoctor}
                onBookingUpdate={updateBookingMessage}
                onBookingConfirm={confirmBooking}
                userImage={getUserImage(currentUser)}
              />
            ))}
            <div ref={messagesEndRef} />
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

      <footer className="shrink-0 border-t border-gray-100 bg-white dark:border-[#3A3A3A] dark:bg-[#252525]">
        {/* ── Quick action chips ── */}
        {isLoggedIn && (
          <div className="flex gap-2 overflow-x-auto px-3 pt-2.5 pb-1 scrollbar-none">
            {[
              { icon: "📅", label: "مواعيدي",       action: () => handleSend("مواعيدي") },
              { icon: "🏥", label: "احجز موعد",     action: () => handleSend("احجز موعد") },
              { icon: "⏳", label: "وقت انتظاري",   action: handleQueueCheck },
              { icon: "🤒", label: "عندي عرض",      action: () => { setMessage("عندي "); inputRef.current?.focus(); } },
            ].map((chip) => (
              <button
                key={chip.label}
                type="button"
                disabled={isSending}
                onClick={chip.action}
                className="shrink-0 rounded-full border border-[#BFEAF8] bg-white px-3 py-1 text-[11px] font-medium text-gray-600 transition hover:border-[#05ADE8] hover:bg-[#EAF8FC] hover:text-[#05ADE8] disabled:opacity-50 dark:border-[#3A3A3A] dark:bg-[#303030] dark:text-[#D2D2D2]"
              >
                {chip.icon} {chip.label}
              </button>
            ))}
          </div>
        )}

        <div className="rounded-2xl border border-gray-200 bg-white mx-3 mb-3 mt-1 px-3 py-2 shadow-sm dark:border-[#3A3A3A] dark:bg-[#303030]">
          <input
            ref={inputRef}
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
