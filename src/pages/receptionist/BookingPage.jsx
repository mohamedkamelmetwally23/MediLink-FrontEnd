import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock3,
  CreditCard,
  HandCoins,
  Search,
  ShieldCheck,
  WalletCards,
  UserRound,
} from "lucide-react";
import {
  bookAppointmentByReceptionist,
  listDoctorAvailableSlots,
  listDoctors,
  listPatients,
} from "../../services/medilinkApi";
import { includesSearchText } from "../../utils/searchText";

const steps = [
  "معلومات المريض",
  "تفاصيل الحجز",
  "طريقة الدفع",
  "تأكيد الحجز",
];

const fallbackTimes = [
  "09:00",
  "09:30",
  "10:00",
  "10:30",
  "11:00",
  "11:30",
  "12:00",
  "12:30",
  "13:00",
  "14:00",
  "14:30",
  "15:00",
];

const paymentOptions = [
  {
    id: "cash",
    label: "دفع كاش داخل العيادة",
    icon: HandCoins,
    hint: "",
  },
  {
    id: "card",
    label: "بطاقة بنكية",
    icon: CreditCard,
    hint: "",
  },
  {
    id: "wallet",
    label: "محفظة إلكترونية",
    icon: WalletCards,
    hint: "",
  },
  {
    id: "instapay",
    label: "انستا باي",
    icon: ShieldCheck,
    hint: "",
  },
];

const months = [
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

function getPersonName(person = {}) {
  return (
    person.name ||
    [person.firstName, person.lastName].filter(Boolean).join(" ").trim()
  );
}

function padDatePart(value) {
  return String(value).padStart(2, "0");
}

function getBirthDateInputValue({ day, month, year }) {
  if (!day || !month || !year) return "";

  return `${year}-${padDatePart(month)}-${padDatePart(day)}`;
}

function splitPatientName(name = "") {
  const [firstName = "", ...rest] = String(name).trim().split(/\s+/);

  return {
    firstName,
    lastName: rest.join(" "),
  };
}

function getIsoDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatApiDate(value) {
  const date = parseDate(value);
  return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
}

function addDays(date, days) {
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + days);
  return nextDate;
}

function parseDate(value) {
  if (!value) return new Date();

  const normalizedDate = String(value).includes("T")
    ? new Date(value)
    : new Date(`${value}T12:00:00`);

  return Number.isNaN(normalizedDate.getTime()) ? new Date() : normalizedDate;
}

function formatDate(value, options = {}) {
  return parseDate(value).toLocaleDateString("ar-EG", {
    day: "numeric",
    month: "long",
    year: "numeric",
    ...options,
  });
}

function formatTime(value) {
  const [rawHour = "0", minute = "00"] = String(value || "").split(":");
  const hour = Number(rawHour);
  const hour12 = hour % 12 || 12;
  const period = hour >= 12 ? "م" : "ص";

  return `${hour12}:${minute} ${period}`;
}

function formatMonthYear(value) {
  const date = parseDate(value);
  const month = date.toLocaleDateString("ar-EG", { month: "long" });

  return `${month} ${date.getFullYear()}`;
}

function normalizeGender(value) {
  const gender = String(value || "").trim().toLowerCase();

  if (gender === "female" || gender === "أنثى" || gender === "انثى") {
    return "female";
  }

  if (gender === "male" || gender === "ذكر") {
    return "male";
  }

  return "";
}

function normalizeSlotStatus(status = "") {
  return String(status).trim().toLowerCase();
}

function isSlotAvailable(slot) {
  if (slot?.available === false || slot?.booked === true || slot?.isBooked === true) {
    return false;
  }

  const status = normalizeSlotStatus(slot?.status);

  return ![
    "booked",
    "confirmed",
    "pending",
    "reserved",
    "busy",
    "closed",
    "full",
    "unavailable",
    "not available",
    "not_available",
    "cancelled",
    "canceled",
    "محجوز",
    "تم الحجز",
    "مؤكد",
    "قيد الانتظار",
    "ممتلئ",
    "غير متاح",
  ].includes(status);
}

function isSlotAvailableForDate(slot, date, now = new Date()) {
  if (!isSlotAvailable(slot)) return false;
  if (!date || getIsoDate(parseDate(date)) !== getIsoDate(now)) return true;

  const slotMinutes = parseTimeMinutes(slot?.time);
  if (slotMinutes === null) return false;

  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  return slotMinutes >= currentMinutes;
}

function normalizePhone(value = "") {
  return String(value).replace(/\D/g, "");
}

function getPhoneSearchKeys(value = "") {
  const phone = normalizePhone(value);
  if (!phone) return [];

  const keys = new Set([phone]);

  if (phone.startsWith("20") && phone.length === 12) {
    keys.add(`0${phone.slice(2)}`);
  }

  if (phone.startsWith("0") && phone.length === 11) {
    keys.add(`20${phone.slice(1)}`);
  }

  if (phone.length >= 10) {
    keys.add(phone.slice(-10));
  }

  return Array.from(keys);
}

function getPatientPhone(patient = {}) {
  const raw = patient.raw || {};
  const profile =
    raw.patientProfile || raw.patientprofile || raw.profile || raw.patient || {};
  const user = raw.user || raw.account || profile.user || profile.account || {};

  return (
    patient.phone ||
    user.phone ||
    user.phoneNumber ||
    user.mobile ||
    profile.phone ||
    profile.phoneNumber ||
    profile.mobile ||
    raw.phone ||
    raw.phoneNumber ||
    raw.mobile ||
    raw.patientPhone ||
    ""
  );
}

function findPatientByPhone(patients, phone) {
  const inputKeys = getPhoneSearchKeys(phone);
  if (!inputKeys.some((key) => key.length >= 10)) return null;

  return (
    patients.find((patient) => {
      const patientKeys = getPhoneSearchKeys(getPatientPhone(patient));
      return inputKeys.some(
        (inputKey) =>
          inputKey.length >= 10 &&
          patientKeys.some(
            (patientKey) =>
              patientKey === inputKey ||
              (patientKey.length >= 10 &&
                patientKey.slice(-10) === inputKey.slice(-10)),
          ),
      );
    }) || null
  );
}

function getDoctorBookingIds(doctor) {
  const value = doctor || {};

  return Array.from(
    new Set(
      [
        value.profileId,
        value.doctorProfileId,
        value.raw?.doctorProfile?._id,
        value.raw?.doctorProfile?.id,
        value.raw?.profile?._id,
        value.raw?.profile?.id,
        value.raw?._id,
        value.raw?.id,
        value.doctorId,
        value.id,
        value.userId,
        value.raw?.user?._id,
        value.raw?.user?.id,
      ]
        .filter(Boolean)
        .map(String),
    ),
  );
}

function getDoctorBookingId(doctor) {
  return getDoctorBookingIds(doctor)[0] || "";
}

function parseTimeMinutes(value = "") {
  const [hours, minutes = "0"] = String(value || "").split(":").map(Number);

  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) return null;
  return hours * 60 + minutes;
}

function formatTimeValue(minutes) {
  const hours = Math.floor(minutes / 60);
  const restMinutes = minutes % 60;

  return `${String(hours).padStart(2, "0")}:${String(restMinutes).padStart(2, "0")}`;
}

function normalizeDayKey(value = "") {
  return String(value)
    .replace(/[إأآا]/g, "ا")
    .replace(/ة/g, "ه")
    .replace(/\s+/g, "")
    .trim()
    .toLowerCase();
}

function createDoctorTimeSlots(doctor = {}) {
  const start = parseTimeMinutes(
    doctor.workStart || doctor.startTime || doctor.raw?.startTime || "09:00",
  );
  const end = parseTimeMinutes(
    doctor.workEnd || doctor.endTime || doctor.raw?.endTime || "17:00",
  );

  if (start === null || end === null || end <= start) {
    return fallbackTimes;
  }

  const slots = [];
  for (let minutes = start; minutes < end; minutes += 30) {
    slots.push(formatTimeValue(minutes));
  }

  return slots.length ? slots : fallbackTimes;
}

function buildDoctorScheduleDays(doctor, count = 14) {
  if (!doctor) return [];

  const workingDays = doctor.workDays || doctor.workingDays || doctor.raw?.workingDays || [];
  const workingDayKeys = new Set(workingDays.map(normalizeDayKey).filter(Boolean));
  const times = createDoctorTimeSlots(doctor);
  const days = [];
  const today = new Date();

  for (let index = 0; index < count && days.length < 7; index += 1) {
    const date = addDays(today, index);
    const dayName = date.toLocaleDateString("ar-EG", { weekday: "long" });
    const isWorkingDay =
      workingDayKeys.size === 0 || workingDayKeys.has(normalizeDayKey(dayName));

    if (!isWorkingDay) continue;

    days.push({
      date: getIsoDate(date),
      dayName,
      dayNumber: date.getDate(),
      slots: times.map((time) => ({ time, status: "available" })),
    });
  }

  return days;
}

function getBirthDateParts(value) {
  if (!value) return { day: "", month: "", year: "" };

  const date = parseDate(value);
  if (Number.isNaN(date.getTime())) {
    return { day: "", month: "", year: "" };
  }

  return {
    day: String(date.getDate()),
    month: String(date.getMonth() + 1),
    year: String(date.getFullYear()),
  };
}

function getPatientBirthDateParts(patient = {}) {
  const raw = patient.raw || {};
  const profile =
    raw.patientProfile || raw.patientprofile || raw.profile || raw.patient || {};
  const user = raw.user || raw.account || profile.user || profile.account || {};
  const birthDate =
    patient.birthDate ||
    user.birthDate ||
    user.dateOfBirth ||
    profile.birthDate ||
    profile.dateOfBirth ||
    raw.birthDate ||
    raw.dateOfBirth ||
    raw.dob;
  const parsedBirthDate = getBirthDateParts(birthDate);

  if (parsedBirthDate.day && parsedBirthDate.month && parsedBirthDate.year) {
    return parsedBirthDate;
  }

  return {
    day: String(
      patient.birthDay ||
        patient.dayOfBirth ||
        patient.day ||
        user.birthDay ||
        user.dayOfBirth ||
        user.day ||
        profile.birthDay ||
        profile.dayOfBirth ||
        profile.day ||
        raw.birthDay ||
        raw.dayOfBirth ||
        raw.day ||
        "",
    ),
    month: String(
      patient.birthMonth ||
        patient.monthOfBirth ||
        patient.month ||
        user.birthMonth ||
        user.monthOfBirth ||
        user.month ||
        profile.birthMonth ||
        profile.monthOfBirth ||
        profile.month ||
        raw.birthMonth ||
        raw.monthOfBirth ||
        raw.month ||
        "",
    ),
    year: String(
      patient.birthYear ||
        patient.yearOfBirth ||
        patient.year ||
        user.birthYear ||
        user.yearOfBirth ||
        user.year ||
        profile.birthYear ||
        profile.yearOfBirth ||
        profile.year ||
        raw.birthYear ||
        raw.yearOfBirth ||
        raw.year ||
        "",
    ),
  };
}

export default function ReceptionistBookingPage() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [doctorQuery, setDoctorQuery] = useState("");
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [patientName, setPatientName] = useState("");
  const [patientPhone, setPatientPhone] = useState("");
  const [patientGender, setPatientGender] = useState("");
  const [birthDay, setBirthDay] = useState("");
  const [birthMonth, setBirthMonth] = useState("");
  const [birthYear, setBirthYear] = useState("");
  const [bookingReason, setBookingReason] = useState("");
  const [selectedDate, setSelectedDate] = useState(getIsoDate(new Date()));
  const [selectedTime, setSelectedTime] = useState("");
  const [availableSlotDays, setAvailableSlotDays] = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [slotsError, setSlotsError] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [paymentStatus, setPaymentStatus] = useState("paid");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [createdAppointment, setCreatedAppointment] = useState(null);
  const [currentDateTime, setCurrentDateTime] = useState(() => new Date());

  useEffect(() => {
    let mounted = true;

    Promise.allSettled([listPatients(), listDoctors()]).then((results) => {
      if (!mounted) return;

      const [patientsResult, doctorsResult] = results;
      const fetchedPatients =
        patientsResult.status === "fulfilled" ? patientsResult.value : [];
      const fetchedDoctors =
        doctorsResult.status === "fulfilled" ? doctorsResult.value : [];

      setPatients(fetchedPatients);
      setDoctors(fetchedDoctors);

    });

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setCurrentDateTime(new Date());
    }, 60_000);

    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    let mounted = true;

    const doctorIds = getDoctorBookingIds(selectedDoctor);

    setSelectedDate("");
    setSelectedTime("");
    setAvailableSlotDays([]);
    setSlotsError("");

    if (doctorIds.length === 0 || doctorIds.some((id) => id.startsWith("demo-"))) {
      setSlotsLoading(false);
      return () => {
        mounted = false;
      };
    }

    setSlotsLoading(true);

    listDoctorAvailableSlots(doctorIds)
      .then((slots) => {
        if (!mounted) return;
        const hasApiSlots = slots.some((day) => day.slots?.length > 0);
        const nextSlots = hasApiSlots ? slots : buildDoctorScheduleDays(selectedDoctor);

        setAvailableSlotDays(nextSlots);

        const firstAvailableDay = nextSlots.find((day) =>
          day.slots?.some((slot) =>
            isSlotAvailableForDate(slot, day.date, new Date()),
          ),
        );

        if (firstAvailableDay?.date) {
          setSelectedDate(firstAvailableDay.date);
          setSelectedTime("");
        }

        if (!firstAvailableDay) {
          setSlotsError("لا توجد مواعيد متاحة لهذا الطبيب حاليا");
        }
      })
      .catch((error) => {
        if (!mounted) return;

        const fallbackDays = buildDoctorScheduleDays(selectedDoctor);
        setAvailableSlotDays(fallbackDays);

        const firstAvailableDay = fallbackDays.find((day) =>
          day.slots?.some((slot) =>
            isSlotAvailableForDate(slot, day.date, new Date()),
          ),
        );

        if (firstAvailableDay?.date) {
          setSelectedDate(firstAvailableDay.date);
          setSelectedTime("");
          setSlotsError("");
        } else {
          setSlotsError(error.message || "تعذر تحميل مواعيد الطبيب");
        }
      })
      .finally(() => {
        if (mounted) setSlotsLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [selectedDoctor]);

  const filteredDoctors = useMemo(
    () =>
      doctors
        .filter((doctor) =>
          includesSearchText(
            `${getPersonName(doctor)} ${doctor.specialty || ""}`,
            doctorQuery,
          ),
        )
        .slice(0, 6),
    [doctorQuery, doctors],
  );

  const displayedDays = useMemo(() => {
    if (!selectedDoctor) return [];

    const slotDays = availableSlotDays
      .filter((day) => day.date)
      .map((day) => ({
        date: day.date,
        dayName: parseDate(day.date).toLocaleDateString("ar-EG", {
          weekday: "short",
        }),
        dayNumber: parseDate(day.date).getDate(),
        slots: day.slots || [],
      }))
      .slice(0, 7);

    return slotDays;
  }, [availableSlotDays, selectedDoctor]);

  const selectedDaySlots = useMemo(() => {
    if (!selectedDoctor || !selectedDate) return [];

    const selectedDay = displayedDays.find((day) => day.date === selectedDate);

    return selectedDay?.slots || [];
  }, [displayedDays, selectedDate, selectedDoctor]);

  const consultationFee = Number(selectedDoctor?.consultationFee) || 100;
  const patientNameParts = splitPatientName(patientName);
  const canContinuePatient = Boolean(
    patientNameParts.firstName &&
      patientNameParts.lastName &&
      patientPhone.trim() &&
      patientGender &&
      birthDay &&
      birthMonth &&
      birthYear,
  );
  const canContinueBooking =
    selectedDoctor &&
    selectedDate &&
    selectedTime &&
    bookingReason.trim() &&
    selectedDaySlots.some(
      (slot) =>
        slot.time === selectedTime &&
        isSlotAvailableForDate(slot, selectedDate, currentDateTime),
    );
  const canContinuePayment = Boolean(
    paymentStatus && (paymentStatus === "unpaid" || paymentMethod),
  );

  const fillPatientFields = useCallback((patient, phoneValue = "") => {
    const name = getPersonName(patient);
    const birthDate = getPatientBirthDateParts(patient);

    setSelectedPatient(patient);
    setPatientName(name);
    setPatientPhone(phoneValue || getPatientPhone(patient));
    setPatientGender(normalizeGender(patient.gender));
    setBirthDay(birthDate.day);
    setBirthMonth(birthDate.month);
    setBirthYear(birthDate.year);
  }, []);

  const handlePatientPhoneChange = (value) => {
    const matchedPatient = findPatientByPhone(patients, value);

    if (matchedPatient) {
      fillPatientFields(matchedPatient, value);
      return;
    }

    if (selectedPatient) {
      setPatientName("");
      setPatientGender("");
      setBirthDay("");
      setBirthMonth("");
      setBirthYear("");
    }

    setSelectedPatient(null);
    setPatientPhone(value);
  };

  useEffect(() => {
    if (selectedPatient || !patientPhone.trim()) return;

    const matchedPatient = findPatientByPhone(patients, patientPhone);
    if (matchedPatient) {
      fillPatientFields(matchedPatient, patientPhone);
    }
  }, [fillPatientFields, patientPhone, patients, selectedPatient]);

  const selectDoctor = (doctor) => {
    setSelectedDoctor(doctor);
    setDoctorQuery(getPersonName(doctor));
    setSelectedDate("");
    setSelectedTime("");
    setAvailableSlotDays([]);
    setSlotsError("");
  };

  const handleCancel = () => {
    navigate("/receptionist/appointments");
  };

  const handleSubmitBooking = async () => {
    if (!canContinuePayment || submitting) return;

    setSubmitting(true);
    setSubmitError("");

    const isPaidPayment = paymentStatus === "paid";
    const payload = {
      firstName: patientNameParts.firstName,
      lastName: patientNameParts.lastName,
      phone: patientPhone.trim(),
      gender: patientGender,
      day: Number(birthDay),
      month: Number(birthMonth),
      year: Number(birthYear),
      doctorId: getDoctorBookingId(selectedDoctor),
      date: formatApiDate(selectedDate),
      slotTime: selectedTime,
      reason: bookingReason.trim(),
      paymentMethod: isPaidPayment ? paymentMethod : "unpaid",
      paymentStatus,
      amount: isPaidPayment ? consultationFee : 0,
    };

    const completeBooking = (created = {}) => {
      setCreatedAppointment({
        ...created,
        ...payload,
        id: created.id || created._id || payload.id,
        doctorName: created.doctor || getPersonName(selectedDoctor),
        patientName: created.patient || patientName,
        slotTime: created.time || created.slotTime || payload.slotTime,
        paymentMethod: payload.paymentMethod,
        paymentStatus,
        amount: payload.amount,
      });
      setCurrentStep(4);
    };

    try {
      const created = await bookAppointmentByReceptionist(payload);
      completeBooking(created);
    } catch (error) {
      setSubmitError(error.message || "تعذر تأكيد الحجز");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f7fcfd] px-4 py-0 text-[#27343a] dark:bg-[#2b2b2b] dark:text-white sm:px-6 lg:px-10">
      <section className="mx-auto min-h-screen max-w-[1180px] bg-white shadow-[0_16px_45px_rgba(21,66,80,0.08)] dark:bg-[#3a3a3a]">
        <header className="flex min-h-[92px] flex-col gap-4 border-b border-[#eef2f3] px-6 py-6 dark:border-white/10 sm:flex-row-reverse sm:items-start sm:justify-between lg:px-9">
          <button
            type="button"
            onClick={handleCancel}
            className="order-2 flex w-fit items-center gap-2 text-[12px] font-bold text-[#19b9d8] sm:order-1"
          >
            <ChevronRight size={15} strokeWidth={2} />
            <span>إلغاء</span>
          </button>

          <div className="order-1 text-right sm:order-2">
            <h1 className="text-[22px] font-extrabold text-[#202c33] dark:text-white">
              إضافة حجز لمريض
            </h1>
            <p className="mt-1 text-[12px] font-medium text-[#9aa5aa] dark:text-gray-300">
              إنشاء موعد جديد للمريض وتحديد الطبيب والوقت وطريقة الدفع.
            </p>
          </div>
        </header>

        <div className="px-5 py-8 sm:px-7 lg:px-12">
          <BookingStepper currentStep={currentStep} />

          <div className="mt-10">
            {currentStep === 1 && (
              <PatientStep
                patientName={patientName}
                patientPhone={patientPhone}
                patientGender={patientGender}
                birthDay={birthDay}
                birthMonth={birthMonth}
                birthYear={birthYear}
                canContinue={canContinuePatient}
                onPatientNameChange={(value) => {
                  setSelectedPatient(null);
                  setPatientName(value);
                }}
                onPatientPhoneChange={handlePatientPhoneChange}
                onPatientGenderChange={setPatientGender}
                onBirthDayChange={setBirthDay}
                onBirthMonthChange={setBirthMonth}
                onBirthYearChange={setBirthYear}
                onNext={() => setCurrentStep(2)}
              />
            )}

            {currentStep === 2 && (
              <BookingDetailsStep
                doctors={filteredDoctors}
                doctorQuery={doctorQuery}
                selectedDoctor={selectedDoctor}
                displayedDays={displayedDays}
                selectedDate={selectedDate}
                selectedTime={selectedTime}
                reason={bookingReason}
                selectedDaySlots={selectedDaySlots}
                currentDateTime={currentDateTime}
                slotsLoading={slotsLoading}
                slotsError={slotsError}
                canContinue={canContinueBooking}
                onDoctorQueryChange={setDoctorQuery}
                onSelectDoctor={selectDoctor}
                onSelectDate={(date) => {
                  setSelectedDate(date);
                  setSelectedTime("");
                }}
                onSelectTime={setSelectedTime}
                onReasonChange={setBookingReason}
                onPrevious={() => setCurrentStep(1)}
                onNext={() => setCurrentStep(3)}
              />
            )}

            {currentStep === 3 && (
              <PaymentStep
                paymentMethod={paymentMethod}
                paymentStatus={paymentStatus}
                submitting={submitting}
                error={submitError}
                canContinue={canContinuePayment}
                onPaymentMethodChange={setPaymentMethod}
                onPaymentStatusChange={setPaymentStatus}
                onCancel={() => setCurrentStep(2)}
                onNext={handleSubmitBooking}
              />
            )}

            {currentStep === 4 && (
              <SuccessStep
                appointment={createdAppointment}
                onDone={() => navigate("/receptionist/appointments")}
              />
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

function BookingStepper({ currentStep }) {
  return (
    <div className="relative mx-auto max-w-[900px]">
      <div className="absolute left-[7%] right-[7%] top-[16px] h-[2px] bg-[#2dbfd9] dark:bg-[#2dbfd9]" />
      <div
        className="absolute right-[7%] top-[16px] h-[2px] bg-[#2dbfd9] transition-all"
        style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 86}%` }}
      />

      <div className="relative grid grid-cols-4 gap-2">
        {steps.map((label, index) => {
          const stepNumber = index + 1;
          const isDone = currentStep > stepNumber;
          const isActive = currentStep === stepNumber;

          return (
            <div key={label} className="flex flex-col items-center gap-2 text-center">
              <div
                className={`flex h-9 w-9 items-center justify-center rounded-full border-2 text-[13px] font-bold transition ${
                  isDone
                    ? "border-[#38bfd8] bg-[#38bfd8] text-white"
                    : isActive
                      ? "border-[#38bfd8] bg-white text-[#38bfd8] dark:bg-[#3a3a3a]"
                      : "border-[#bde5ee] bg-white text-[#38bfd8] dark:bg-[#3a3a3a]"
                }`}
              >
                {isDone ? (
                  <Check size={17} strokeWidth={3} />
                ) : isActive ? (
                  <span className="h-3 w-3 rounded-full bg-[#38bfd8]" />
                ) : (
                  stepNumber
                )}
              </div>
              <span
                className={`text-[18px] font-bold ${
                  isDone
                    ? "text-[#24bdd9]"
                    : isActive
                      ? "text-[#333] dark:text-white"
                    : "text-[#9ca8ad] dark:text-gray-300"
                }`}
              >
                {label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function PatientStep({
  patientName,
  patientPhone,
  patientGender,
  birthDay,
  birthMonth,
  birthYear,
  canContinue,
  onPatientNameChange,
  onPatientPhoneChange,
  onPatientGenderChange,
  onBirthDayChange,
  onBirthMonthChange,
  onBirthYearChange,
  onNext,
}) {
  const birthDateInputRef = useRef(null);
  const nameParts = splitPatientName(patientName);
  const updatePatientName = (nextParts) => {
    onPatientNameChange(
      [nextParts.firstName, nextParts.lastName].filter(Boolean).join(" "),
    );
  };
  const openBirthDatePicker = () => {
    const input = birthDateInputRef.current;

    if (!input) return;

    input.focus({ preventScroll: true });

    if (typeof input.showPicker === "function") {
      input.showPicker();
      return;
    }

    input.click();
  };
  const handleBirthDateChange = (event) => {
    const [year = "", month = "", day = ""] = event.target.value.split("-");

    onBirthDayChange(day ? String(Number(day)) : "");
    onBirthMonthChange(month ? String(Number(month)) : "");
    onBirthYearChange(year);
  };

  return (
    <div className="mx-auto max-w-[760px]">
      <FormCard title="معلومات المريض" className="px-8 py-8">
        <div className="space-y-6">
          <div className="grid gap-5 sm:grid-cols-2">
            <InputField
              label="الاسم الأول"
              value={nameParts.firstName}
              onChange={(value) =>
                updatePatientName({ ...nameParts, firstName: value })
              }
              placeholder="الاسم الأول"
            />
            <InputField
              label="الاسم الأخير"
              value={nameParts.lastName}
              onChange={(value) =>
                updatePatientName({ ...nameParts, lastName: value })
              }
              placeholder="الاسم الأخير"
            />
          </div>

          <InputField
            label="رقم الهاتف"
            value={patientPhone}
            onChange={onPatientPhoneChange}
            placeholder="010XXXXXXXX"
          />

          <div className="grid gap-5 sm:grid-cols-2">
            <GenderButtonField
              label="النوع"
              value={patientGender}
              onChange={onPatientGenderChange}
            />

            <BirthDateField
              inputRef={birthDateInputRef}
              day={birthDay}
              month={birthMonth}
              year={birthYear}
              onOpen={openBirthDatePicker}
              onChange={handleBirthDateChange}
            />
          </div>

          <PrimaryButton disabled={!canContinue} onClick={onNext}>
            التالي
          </PrimaryButton>
        </div>
      </FormCard>
    </div>
  );
}

function BookingDetailsStep({
  doctors,
  doctorQuery,
  selectedDoctor,
  displayedDays,
  selectedDate,
  selectedTime,
  reason,
  selectedDaySlots,
  currentDateTime,
  slotsLoading,
  slotsError,
  canContinue,
  onDoctorQueryChange,
  onSelectDoctor,
  onSelectDate,
  onSelectTime,
  onReasonChange,
  onPrevious,
  onNext,
}) {
  return (
    <div className="mx-auto max-w-[900px]">
      <div className="mb-5 text-center">
        <h2 className="text-[20px] font-extrabold text-[#263238] dark:text-white">
          اختر التاريخ والوقت
        </h2>
        <p className="mt-1 text-[12px] font-semibold text-[#9aa5aa] dark:text-gray-300">
          اختر التاريخ والوقت المناسب وحدد موعدك بسهولة
        </p>
      </div>

      <div className="grid items-start gap-5 lg:grid-cols-[330px_minmax(0,1fr)]">
        <FormCard className="h-fit min-h-[380px] px-4 py-4" title="اختر الطبيب">
          <div className="space-y-4">
            <div className="relative">
              <Search
                size={15}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#a6b1b6]"
              />
              <input
                value={doctorQuery}
                onChange={(event) => onDoctorQueryChange(event.target.value)}
                placeholder="ابحث عن طبيب هنا..."
                className="h-[38px] w-full rounded-[6px] border border-[#edf1f3] bg-white pr-9 pl-8 text-[12px] font-bold outline-none placeholder:text-[#b6bec3] focus:border-[#23bfdd] dark:border-white/10 dark:bg-[#454545]"
              />
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[12px] text-[#aab4ba]">
                ×
              </span>
            </div>

            <div className="max-h-[300px] space-y-2.5 overflow-y-auto pr-1">
              {doctors.map((doctor) => {
                const isSelected = selectedDoctor?.id === doctor.id;
                const fee = Number(doctor.consultationFee) || 100;

                return (
                  <button
                    key={doctor.id || getPersonName(doctor)}
                    type="button"
                    onClick={() => onSelectDoctor(doctor)}
                    className={`flex w-full items-center gap-2.5 rounded-[6px] border px-2.5 py-2 text-right transition ${
                      isSelected
                        ? "border-[#24bdd9] bg-[#effcff]"
                        : "border-[#edf1f3] bg-white hover:border-[#bdeaf3] hover:bg-[#f8fdfe] dark:border-white/10 dark:bg-[#454545]"
                    }`}
                  >
                    <DoctorAvatar doctor={doctor} />
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-[12px] font-extrabold text-[#27343a] dark:text-white">
                        د. {getPersonName(doctor)}
                      </div>
                      <div className="mt-1 truncate text-[11px] font-semibold text-[#8f9aa0]">
                        {doctor.specialty || "تخصص عام"}
                      </div>
                      <div className="mt-1 text-[10px] font-bold text-[#f5b400]">
                        ★★★★★
                      </div>
                    </div>
                    <span className="rounded-[4px] bg-[#eaf8fb] px-2 py-1.5 text-center text-[9px] font-bold leading-4 text-[#5f6b71]">
                      سعر الكشف
                      <br />
                      {fee} جنيه
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </FormCard>

        <div className="space-y-5">
          <FormCard className="px-5 py-5" title="">
            <div>
              <div className="mb-3 flex items-center justify-end">
                <span className="text-[13px] font-bold text-[#27343a] dark:text-white">
                  {selectedDate ? formatMonthYear(selectedDate) : "المواعيد"}
                </span>
              </div>

              {slotsLoading ? (
                <p className="py-8 text-center text-[12px] font-bold text-[#9ca8ad]">
                  جاري تحميل مواعيد الطبيب...
                </p>
              ) : !selectedDoctor ? (
                <p className="py-8 text-center text-[12px] font-bold text-[#9ca8ad]">
                  اختر طبيبا لعرض المواعيد المتاحة
                </p>
              ) : displayedDays.length > 0 ? (
                <div className="grid grid-cols-4 gap-2 sm:grid-cols-7">
                  {displayedDays.map((day) => (
                    <button
                      key={day.date}
                      type="button"
                      onClick={() => onSelectDate(day.date)}
                      className={`min-h-[78px] rounded-[5px] border px-2 py-3 text-center transition ${
                        selectedDate === day.date
                          ? "border-[#24bdd9] bg-[#eefcff] text-[#222]"
                          : "border-transparent bg-[#fbfbfb] text-[#9ca8ad] hover:border-[#bdeaf3] dark:bg-[#454545] dark:text-gray-200"
                      }`}
                    >
                      <div className="text-[11px] font-bold">{day.dayName}</div>
                      <div className="mt-2 text-[18px] font-extrabold">
                        {day.dayNumber}
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <p className="py-8 text-center text-[12px] font-bold text-[#9ca8ad]">
                  {slotsError || "لا توجد أيام متاحة لهذا الطبيب"}
                </p>
              )}
            </div>
          </FormCard>

          <FormCard className="px-5 py-5" title="">
            <div>
              <h3 className="mb-4 text-right text-[13px] font-bold text-[#27343a] dark:text-white">
                المواعيد المتاحة
              </h3>
              {slotsLoading ? (
                <p className="py-8 text-center text-[12px] font-bold text-[#9ca8ad]">
                  جاري تحميل المواعيد...
                </p>
              ) : !selectedDoctor ? (
                <p className="py-8 text-center text-[12px] font-bold text-[#9ca8ad]">
                  اختر طبيبا أولا
                </p>
              ) : !selectedDate ? (
                <p className="py-8 text-center text-[12px] font-bold text-[#9ca8ad]">
                  اختر يوما لعرض الأوقات المتاحة
                </p>
              ) : selectedDaySlots.length > 0 ? (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {selectedDaySlots.map((slot, index) => {
                    const available = isSlotAvailableForDate(
                      slot,
                      selectedDate,
                      currentDateTime,
                    );
                    const selected = selectedTime === slot.time && available;

                    return (
                      <button
                        key={`${slot.time}-${index}`}
                        type="button"
                        disabled={!available}
                        onClick={() => {
                          if (available) onSelectTime(slot.time);
                        }}
                        className={`h-[38px] rounded-[6px] border text-[12px] font-bold transition ${
                          selected
                            ? "border-[#24bdd9] bg-[#eefcff] text-[#333]"
                            : available
                              ? "border-transparent bg-[#fbfbfb] text-[#9da6ab] hover:border-[#24bdd9] dark:bg-[#454545] dark:text-gray-200"
                              : "cursor-not-allowed border-transparent bg-[#f3f3f3] text-[#c1c8cc] opacity-60 dark:bg-[#3f3f3f] dark:text-gray-500"
                        }`}
                      >
                        {formatTime(slot.time)}
                      </button>
                    );
                  })}
                </div>
              ) : (
                <p className="py-8 text-center text-[12px] font-bold text-[#9ca8ad]">
                  لا توجد أوقات متاحة لهذا اليوم
                </p>
              )}
            </div>
          </FormCard>

          <FormCard className="px-5 py-5" title="">
            <TextAreaField
              label="سبب الزيارة"
              value={reason}
              onChange={onReasonChange}
              placeholder="اكتب سبب الزيارة هنا"
            />
          </FormCard>
        </div>
      </div>

      <WizardActions
        canContinue={canContinue}
        cancelLabel="السابق"
        onCancel={onPrevious}
        onNext={onNext}
      />
    </div>
  );
}

function PaymentStep({
  paymentMethod,
  paymentStatus,
  submitting,
  error,
  canContinue,
  onPaymentMethodChange,
  onPaymentStatusChange,
  onCancel,
  onNext,
}) {
  const isPaid = paymentStatus === "paid";
  const isUnpaid = paymentStatus === "unpaid";

  return (
    <div className="mx-auto max-w-[900px]">
      <div className="mb-7 text-center">
        <h2 className="text-[20px] font-extrabold text-[#263238] dark:text-white">
          اختر طريقة الدفع
        </h2>
        <p className="mt-1 text-[12px] font-semibold text-[#9aa5aa] dark:text-gray-300">
          اختر طريقة الدفع المناسبة لك
        </p>
      </div>

      <div className="grid items-start gap-5 lg:grid-cols-2">
        <FormCard className="min-h-[292px] px-5 py-5" title="اختر طريقة الدفع">
          <div className="space-y-4">
            {paymentOptions.map((option) => {
              const Icon = option.icon;
              const isSelected = isPaid && paymentMethod === option.id;

              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => {
                    onPaymentMethodChange(option.id);
                    onPaymentStatusChange("paid");
                  }}
                  className={`flex min-h-[56px] w-full items-center justify-between gap-3 rounded-[8px] border px-4 text-right transition ${
                    isSelected
                      ? "border-[#24bdd9] bg-[#f0fcff] text-[#27343a] shadow-[0_8px_18px_rgba(35,189,217,0.12)] dark:bg-[#24484b] dark:text-white"
                      : "border-[#edf1f3] bg-white text-[#59666c] hover:border-[#bdeaf3] hover:bg-[#fbfeff] dark:border-white/10 dark:bg-[#454545] dark:text-gray-200"
                  }`}
                >
                  <span className="text-[13px] font-bold">{option.label}</span>
                  <span className="flex items-center gap-2 text-[10px] font-extrabold text-[#2dbfd9]">
                    {option.hint && <span>{option.hint}</span>}
                    <span className="grid h-9 w-9 place-items-center rounded-[9px] bg-[#e8fbff] text-[#10b7d8] dark:bg-white/10">
                      <Icon size={22} strokeWidth={2.1} />
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        </FormCard>

        <FormCard className="min-h-[138px] px-5 py-5" title="معلومات الدفع">
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => onPaymentStatusChange("paid")}
              className={`flex h-[52px] items-center justify-center gap-2 rounded-[8px] border text-[13px] font-bold transition ${
                isPaid
                  ? "border-[#24bdd9] bg-[#f0fcff] text-[#27343a] shadow-[0_8px_18px_rgba(35,189,217,0.1)] dark:bg-[#24484b] dark:text-white"
                  : "border-transparent bg-[#f4f4f4] text-[#8b969c] hover:bg-[#eefbfc] dark:bg-white/10 dark:text-gray-300"
              }`}
            >
              <CheckCircle2 size={20} strokeWidth={2.2} />
              <span>مدفوع</span>
            </button>
            <button
              type="button"
              onClick={() => onPaymentStatusChange("unpaid")}
              className={`flex h-[52px] items-center justify-center gap-2 rounded-[8px] border text-[13px] font-bold transition ${
                isUnpaid
                  ? "border-[#f6b63a] bg-[#fff8e8] text-[#7c5a10] shadow-[0_8px_18px_rgba(246,182,58,0.12)] dark:bg-[#4b422a] dark:text-[#ffd782]"
                  : "border-transparent bg-[#f4f4f4] text-[#8b969c] hover:bg-[#fff8e8] dark:bg-white/10 dark:text-gray-300"
              }`}
            >
              <Clock3 size={20} strokeWidth={2.2} />
              <span>غير مدفوع</span>
            </button>
          </div>
        </FormCard>
      </div>

      <WizardActions
        canContinue={canContinue && !submitting}
        cancelLabel="السابق"
        nextLabel={submitting ? "جار الحفظ..." : "التالي"}
        onCancel={onCancel}
        onNext={onNext}
      />
      {error && (
        <p className="mt-3 text-center text-[12px] font-bold text-[#ff4d4d]">
          {error}
        </p>
      )}
    </div>
  );
}

function SuccessStep({ appointment, onDone }) {
  const bookingNumber =
    appointment?.id || appointment?._id || appointment?.appointmentId || "#1258";

  return (
    <div className="mx-auto max-w-[620px] pt-4 text-center">
      <div className="relative mx-auto flex h-[286px] w-[286px] items-center justify-center">
        <div className="absolute bottom-[22px] right-[30px] h-[96px] w-[178px] rounded-t-[88px] rounded-br-[12px] rounded-bl-[12px] bg-[#d7d9d9]" />
        <div className="absolute bottom-[34px] left-[48px] h-[76px] w-[76px] rounded-full bg-[#8be1ef]" />
        <div className="absolute right-[42px] top-[18px] h-[116px] w-[116px] rounded-tr-[58px] rounded-br-[58px] rounded-bl-[58px] bg-gradient-to-br from-[#15b5e8] to-[#62d0cb]" />
        <div className="absolute left-[28px] top-[44px] h-9 w-9 rounded-full bg-[#1f61ad]" />
        <div className="absolute right-[14px] top-[120px] h-7 w-7 rounded-full bg-[#d0d3d4]" />
        <div className="relative flex h-[190px] w-[190px] items-center justify-center rounded-full bg-gradient-to-br from-[#12b9e9] to-[#65d1cc] text-white shadow-[0_18px_34px_rgba(35,189,217,0.24)]">
          <Check size={96} strokeWidth={3.3} />
        </div>
      </div>

      <h2 className="-mt-1 text-[22px] font-extrabold text-[#27343a] dark:text-white">
        تم تأكيد الحجز بنجاح
      </h2>
      <p className="mt-2 text-[12px] font-semibold text-[#5f676b] dark:text-gray-300">
        تم حجز الموعد بنجاح وسيتم إرسال تفاصيل الموعد إلى تطبيق الرسائل الخاص بالمريض.
      </p>

      <div
        className="mx-auto mt-5 w-full max-w-[286px] rounded-[5px] bg-[#eefbfc] px-8 py-4 text-[11px] font-bold text-[#55666e] dark:bg-white/10 dark:text-gray-200"
        dir="rtl"
      >
        <div className="grid grid-cols-[auto_1fr] gap-x-8 gap-y-2 text-right">
          <span>رقم الحجز</span>
          <span>{String(bookingNumber).startsWith("#") ? bookingNumber : `#${bookingNumber}`}</span>
          <span>التاريخ</span>
          <span>{formatDate(appointment?.date)}</span>
          <span>الوقت</span>
          <span>{formatTime(appointment?.slotTime || appointment?.time)}</span>
          <span>الطبيب</span>
          <span>{appointment?.doctorName}</span>
        </div>
      </div>

      <div className="mx-auto mt-8 max-w-[560px]">
        <PrimaryButton onClick={onDone}>تم</PrimaryButton>
      </div>
    </div>
  );
}

function FormCard({ title, className = "", children }) {
  return (
    <section
      className={`rounded-[2px] border border-[#eef2f3] bg-white p-5 shadow-[0_5px_18px_rgba(35,67,77,0.12)] dark:border-white/10 dark:bg-[#404040] ${className}`}
    >
      {title && (
        <h2 className="mb-7 text-right text-[16px] font-bold text-[#333] dark:text-white">
          {title}
        </h2>
      )}
      {children}
    </section>
  );
}

function InputField({
  label,
  value,
  onChange,
  placeholder = "",
  readOnly = false,
  type = "text",
}) {
  return (
    <label className="block text-right">
      <span className="mb-2 block text-[13px] font-bold text-[#555] dark:text-gray-200">
        {label}
      </span>
      <input
        type={type}
        value={value}
        readOnly={readOnly}
        onChange={(event) => onChange?.(event.target.value)}
        placeholder={placeholder}
        inputMode={type === "number" ? "numeric" : undefined}
        className="h-[46px] w-full rounded-[4px] border border-transparent bg-[#f0f0f0] px-4 text-right text-[13px] font-bold text-[#27343a] outline-none transition placeholder:text-[#a7b0b5] focus:border-[#23bfdd] dark:bg-[#4b4b4b] dark:text-white"
      />
    </label>
  );
}

function BirthDateSegment({ value, placeholder, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex h-[46px] w-full items-center justify-end rounded-[8px] border border-transparent bg-[#f0f0f0] px-3 text-right text-[13px] font-bold text-[#27343a] outline-none transition hover:border-[#23bfdd] hover:bg-[#f4fcff] dark:bg-[#4b4b4b] dark:text-white"
    >
      <span className={value ? "" : "text-[#a7b0b5]"}>
        {value || placeholder}
      </span>
    </button>
  );
}

function BirthDateField({ inputRef, day, month, year, onOpen, onChange }) {
  const selectedMonth = month ? months[Number(month) - 1] : "";

  return (
    <div className="block text-right">
      <span className="mb-2 block text-[13px] font-bold text-[#555] dark:text-gray-200">
        تاريخ الميلاد
      </span>
      <div className="relative grid grid-cols-[1fr_1fr_1fr_46px] gap-3">
        <BirthDateSegment value={day} placeholder="اليوم" onClick={onOpen} />
        <BirthDateSegment
          value={selectedMonth}
          placeholder="الشهر"
          onClick={onOpen}
        />
        <BirthDateSegment value={year} placeholder="السنة" onClick={onOpen} />

        <button
          type="button"
          onClick={onOpen}
          aria-label="فتح تقويم تاريخ الميلاد"
          className="grid h-[46px] place-items-center rounded-[8px] border border-transparent bg-[#f0f0f0] text-[#66757c] outline-none transition hover:border-[#23bfdd] hover:text-[#0fb8e8] dark:bg-[#4b4b4b] dark:text-gray-200"
        >
          <CalendarDays size={19} strokeWidth={2} />
        </button>

        <input
          ref={inputRef}
          type="date"
          value={getBirthDateInputValue({ day, month, year })}
          onChange={onChange}
          min="1900-01-01"
          max={getIsoDate(new Date())}
          tabIndex={-1}
          aria-hidden="true"
          className="absolute left-3 top-1/2 h-px w-px -translate-y-1/2 opacity-0"
        />
      </div>
    </div>
  );
}

function GenderButtonField({ label, value, onChange }) {
  const options = [
    { value: "female", label: "أنثى" },
    { value: "male", label: "ذكر" },
  ];

  return (
    <div className="block text-right">
      <span className="mb-2 block text-[13px] font-bold text-[#555] dark:text-gray-200">
        {label}
      </span>
      <div className="grid grid-cols-2 gap-3">
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange?.(option.value)}
            className={
              value === option.value
                ? "h-[46px] rounded-[8px] border border-transparent bg-gradient-to-l from-[#67d2cb] to-[#0fb8e8] text-[13px] font-bold text-white shadow-[0_8px_18px_rgba(24,184,216,0.2)] transition hover:brightness-105"
                : "h-[46px] rounded-[8px] border border-[#d8d8d8] bg-white text-[13px] font-bold text-[#27343a] transition hover:border-[#23bfdd] hover:bg-[#f4fcff] dark:border-white/15 dark:bg-[#4b4b4b] dark:text-white dark:hover:bg-[#555]"
            }
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function TextAreaField({ label, value, onChange, placeholder = "" }) {
  return (
    <label className="block text-right">
      <span className="mb-2 block text-[13px] font-bold text-[#555] dark:text-gray-200">
        {label}
      </span>
      <textarea
        value={value}
        onChange={(event) => onChange?.(event.target.value)}
        placeholder={placeholder}
        rows={3}
        dir="rtl"
        className="min-h-[92px] w-full resize-none rounded-[4px] border border-transparent bg-[#f0f0f0] px-4 py-3 text-right text-[13px] font-bold text-[#27343a] outline-none transition placeholder:text-[#a7b0b5] focus:border-[#23bfdd] dark:bg-[#4b4b4b] dark:text-white"
      />
    </label>
  );
}

function PrimaryButton({ disabled = false, onClick, children }) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="h-[46px] w-full rounded-[6px] bg-gradient-to-l from-[#67d2cb] to-[#0fb8e8] text-[13px] font-bold text-white shadow-[0_9px_22px_rgba(24,184,216,0.22)] transition hover:brightness-105 disabled:cursor-not-allowed disabled:bg-none disabled:bg-[#c9c9c9] disabled:shadow-none disabled:hover:brightness-100"
    >
      {children}
    </button>
  );
}

function WizardActions({
  canContinue,
  cancelLabel = "إلغاء",
  nextLabel = "التالي",
  onCancel,
  onNext,
}) {
  return (
    <div className="mt-7 grid gap-3 sm:grid-cols-2">
      <button
        type="button"
        onClick={onCancel}
        className="h-[42px] rounded-[6px] border border-[#24bdd9] bg-white text-[13px] font-extrabold text-[#18aeca] transition hover:bg-[#f2fcff] dark:bg-transparent"
      >
        {cancelLabel}
      </button>
      <PrimaryButton disabled={!canContinue} onClick={onNext}>
        {nextLabel}
      </PrimaryButton>
    </div>
  );
}

function DoctorAvatar({ doctor }) {
  if (doctor.image) {
    return (
      <img
        src={doctor.image}
        alt={getPersonName(doctor)}
        className="h-11 w-11 rounded-full object-cover"
      />
    );
  }

  return (
    <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#eaf8fb] text-[#1ab6d2]">
      <UserRound size={21} />
    </span>
  );
}
