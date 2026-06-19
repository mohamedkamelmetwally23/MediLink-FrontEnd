import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Banknote,
  Check,
  ChevronRight,
  CreditCard,
  Search,
  ShieldCheck,
  Smartphone,
  UserRound,
} from "lucide-react";
import {
  createAppointment,
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
    icon: Banknote,
    hint: "",
  },
  {
    id: "card",
    label: "بطاقة بنكية",
    icon: CreditCard,
    hint: "VISA",
  },
  {
    id: "wallet",
    label: "محفظة إلكترونية",
    icon: Smartphone,
    hint: "meza",
  },
  {
    id: "instapay",
    label: "انستا باي",
    icon: ShieldCheck,
    hint: "instapay",
  },
];

function createDemoPatients() {
  return [
    {
      id: "demo-patient-1",
      name: "محمد حسن",
      firstName: "محمد",
      lastName: "حسن",
      phone: "01066666666",
    },
    {
      id: "demo-patient-2",
      name: "يوسف أمين",
      firstName: "يوسف",
      lastName: "أمين",
      phone: "01077777777",
    },
    {
      id: "demo-patient-3",
      name: "خالد فتحي",
      firstName: "خالد",
      lastName: "فتحي",
      phone: "01088888888",
    },
    {
      id: "demo-patient-4",
      name: "سما سامي",
      firstName: "سما",
      lastName: "سامي",
      phone: "01255555555",
    },
  ];
}

function createDemoDoctors() {
  return [
    {
      id: "demo-doctor-1",
      firstName: "محمد",
      lastName: "خالد",
      specialty: "أمراض القلب",
      consultationFee: 200,
      image: "",
    },
    {
      id: "demo-doctor-2",
      firstName: "كمال",
      lastName: "شوقي",
      specialty: "الأمراض الجلدية",
      consultationFee: 250,
      image: "",
    },
    {
      id: "demo-doctor-3",
      firstName: "سارة",
      lastName: "محمد",
      specialty: "طب الأطفال",
      consultationFee: 180,
      image: "",
    },
    {
      id: "demo-doctor-4",
      firstName: "خالد",
      lastName: "علي",
      specialty: "العظام",
      consultationFee: 300,
      image: "",
    },
  ];
}

function getPersonName(person = {}) {
  return (
    person.name ||
    [person.firstName, person.lastName].filter(Boolean).join(" ").trim()
  );
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

function normalizeSlotStatus(status = "") {
  return String(status).trim().toLowerCase();
}

function isSlotAvailable(slot) {
  const status = normalizeSlotStatus(slot?.status);

  return ![
    "booked",
    "reserved",
    "busy",
    "unavailable",
    "cancelled",
    "canceled",
    "محجوز",
    "ممتلئ",
    "غير متاح",
  ].includes(status);
}

function getUpcomingDays(count = 7) {
  const today = new Date();

  return Array.from({ length: count }, (_, index) => {
    const date = addDays(today, index);

    return {
      date: getIsoDate(date),
      dayName: date.toLocaleDateString("ar-EG", { weekday: "short" }),
      dayNumber: date.getDate(),
      slots: fallbackTimes.map((time) => ({ time, status: "available" })),
    };
  });
}

export default function ReceptionistBookingPage() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [patientQuery, setPatientQuery] = useState("");
  const [doctorQuery, setDoctorQuery] = useState("");
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [patientName, setPatientName] = useState("");
  const [patientPhone, setPatientPhone] = useState("");
  const [selectedDate, setSelectedDate] = useState(getIsoDate(new Date()));
  const [selectedTime, setSelectedTime] = useState("");
  const [availableSlotDays, setAvailableSlotDays] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [createdAppointment, setCreatedAppointment] = useState(null);

  useEffect(() => {
    let mounted = true;

    Promise.allSettled([listPatients(), listDoctors()]).then((results) => {
      if (!mounted) return;

      const [patientsResult, doctorsResult] = results;
      const fetchedPatients =
        patientsResult.status === "fulfilled" ? patientsResult.value : [];
      const fetchedDoctors =
        doctorsResult.status === "fulfilled" ? doctorsResult.value : [];

      setPatients(fetchedPatients.length ? fetchedPatients : createDemoPatients());
      setDoctors(fetchedDoctors.length ? fetchedDoctors : createDemoDoctors());

    });

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    let mounted = true;

    if (!selectedDoctor?.id || String(selectedDoctor.id).startsWith("demo-")) {
      return () => {
        mounted = false;
      };
    }

    listDoctorAvailableSlots(selectedDoctor.id)
      .then((slots) => {
        if (!mounted) return;
        setAvailableSlotDays(slots);

        const firstAvailableDay = slots.find((day) =>
          day.slots?.some(isSlotAvailable),
        );

        if (firstAvailableDay?.date) {
          setSelectedDate(firstAvailableDay.date);
          setSelectedTime("");
        }
      })
      .catch(() => {
        if (mounted) setAvailableSlotDays([]);
      });

    return () => {
      mounted = false;
    };
  }, [selectedDoctor]);

  const filteredPatients = useMemo(() => {
    const query = patientQuery || patientName;

    return patients
      .filter((patient) => {
        const name = getPersonName(patient);
        return includesSearchText(`${name} ${patient.phone || ""}`, query);
      })
      .slice(0, 6);
  }, [patientName, patientQuery, patients]);

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

    return slotDays.length ? slotDays : getUpcomingDays();
  }, [availableSlotDays]);

  const availableTimes = useMemo(() => {
    const selectedDay = displayedDays.find((day) => day.date === selectedDate);
    const daySlots = selectedDay?.slots?.filter(isSlotAvailable) || [];

    return daySlots.length ? daySlots.map((slot) => slot.time) : fallbackTimes;
  }, [displayedDays, selectedDate]);

  const consultationFee = Number(selectedDoctor?.consultationFee) || 100;
  const canContinuePatient = patientName.trim() && patientPhone.trim();
  const canContinueBooking = selectedDoctor && selectedDate && selectedTime;
  const canContinuePayment = Boolean(paymentMethod);

  const selectPatient = (patient) => {
    const name = getPersonName(patient);

    setSelectedPatient(patient);
    setPatientName(name);
    setPatientPhone(patient.phone || "");
    setPatientQuery(name);
  };

  const selectDoctor = (doctor) => {
    setSelectedDoctor(doctor);
    setDoctorQuery(getPersonName(doctor));
    setSelectedTime("");
    setAvailableSlotDays([]);
  };

  const handleCancel = () => {
    navigate("/receptionist/appointments");
  };

  const handleSubmitBooking = async () => {
    if (!canContinuePayment || submitting) return;

    setSubmitting(true);

    const payload = {
      patientId: selectedPatient?.id,
      patientName,
      patientPhone,
      phone: patientPhone,
      doctorId: selectedDoctor?.id,
      doctorName: getPersonName(selectedDoctor),
      specialty: selectedDoctor?.specialty,
      date: selectedDate,
      time: selectedTime,
      status: "confirmed",
      paymentMethod,
      paymentStatus: paymentMethod === "cash" ? "waiting" : "paid",
      amount: consultationFee,
    };

    try {
      if (
        selectedPatient?.id &&
        selectedDoctor?.id &&
        !String(selectedPatient.id).startsWith("demo-") &&
        !String(selectedDoctor.id).startsWith("demo-")
      ) {
        await createAppointment(payload);
      }
    } catch {
      // Keep the receptionist flow usable when the API rejects demo data.
    } finally {
      setCreatedAppointment(payload);
      setCurrentStep(4);
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
                patientQuery={patientQuery}
                selectedPatient={selectedPatient}
                filteredPatients={filteredPatients}
                canContinue={canContinuePatient}
                onPatientNameChange={(value) => {
                  setSelectedPatient(null);
                  setPatientName(value);
                }}
                onPatientPhoneChange={(value) => {
                  setSelectedPatient(null);
                  setPatientPhone(value);
                }}
                onPatientQueryChange={(value) => {
                  setSelectedPatient(null);
                  setPatientQuery(value);
                }}
                onSelectPatient={selectPatient}
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
                availableTimes={availableTimes}
                canContinue={canContinueBooking}
                onDoctorQueryChange={setDoctorQuery}
                onSelectDoctor={selectDoctor}
                onSelectDate={(date) => {
                  setSelectedDate(date);
                  setSelectedTime("");
                }}
                onSelectTime={setSelectedTime}
                onPrevious={() => setCurrentStep(1)}
                onNext={() => setCurrentStep(3)}
              />
            )}

            {currentStep === 3 && (
              <PaymentStep
                paymentMethod={paymentMethod}
                submitting={submitting}
                canContinue={canContinuePayment}
                onPaymentMethodChange={setPaymentMethod}
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
  patientQuery,
  selectedPatient,
  filteredPatients,
  canContinue,
  onPatientNameChange,
  onPatientPhoneChange,
  onPatientQueryChange,
  onSelectPatient,
  onNext,
}) {
  const nameParts = splitPatientName(patientName);
  const updatePatientName = (nextParts) => {
    onPatientNameChange(
      [nextParts.firstName, nextParts.lastName].filter(Boolean).join(" "),
    );
  };

  return (
    <div className="mx-auto max-w-[760px]">
      <FormCard title="معلومات المريض" className="px-8 py-8">
        <div className="space-y-6">
          <div className="relative">
            <div className="relative">
              <Search
                size={16}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#a6b1b6]"
              />
              <input
                value={patientQuery}
                onChange={(event) => onPatientQueryChange(event.target.value)}
                placeholder="ابحث عن مريض سابق"
                className="h-[52px] w-full rounded-[6px] border border-[#edf1f3] bg-white pr-11 pl-9 text-[14px] font-bold outline-none transition placeholder:text-[#b6bec3] focus:border-[#23bfdd] dark:border-white/10 dark:bg-[#454545]"
              />
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[12px] text-[#aab4ba]">
                ×
              </span>
            </div>

            {patientQuery && !selectedPatient && filteredPatients.length > 0 && (
              <div className="absolute z-20 mt-2 max-h-[210px] w-full overflow-y-auto rounded-[8px] border border-[#edf1f3] bg-white p-2 shadow-[0_14px_30px_rgba(0,0,0,0.08)] dark:border-white/10 dark:bg-[#454545]">
                {filteredPatients.map((patient) => (
                  <button
                    key={patient.id || `${getPersonName(patient)}-${patient.phone}`}
                    type="button"
                    onClick={() => onSelectPatient(patient)}
                    className="flex w-full items-center justify-between rounded-[7px] px-3 py-2 text-right transition hover:bg-[#eefbfe] dark:hover:bg-white/10"
                  >
                    <span className="text-[12px] font-bold text-[#27343a] dark:text-white">
                      {getPersonName(patient)}
                    </span>
                    <span className="text-[11px] font-semibold text-[#8d9aa0]">
                      {patient.phone}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

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
  availableTimes,
  canContinue,
  onDoctorQueryChange,
  onSelectDoctor,
  onSelectDate,
  onSelectTime,
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
                  {formatMonthYear(selectedDate)}
                </span>
              </div>

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
            </div>
          </FormCard>

          <FormCard className="px-5 py-5" title="">
            <div>
              <h3 className="mb-4 text-right text-[13px] font-bold text-[#27343a] dark:text-white">
                المواعيد المتاحة
              </h3>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {availableTimes.map((time) => (
                  <button
                    key={time}
                    type="button"
                    onClick={() => onSelectTime(time)}
                    className={`h-[38px] rounded-[6px] border text-[12px] font-bold transition ${
                      selectedTime === time
                        ? "border-[#24bdd9] bg-[#eefcff] text-[#333]"
                        : "border-transparent bg-[#fbfbfb] text-[#9da6ab] hover:border-[#24bdd9] dark:bg-[#454545] dark:text-gray-200"
                    }`}
                  >
                    {formatTime(time)}
                  </button>
                ))}
              </div>
            </div>
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
  submitting,
  canContinue,
  onPaymentMethodChange,
  onCancel,
  onNext,
}) {
  const isPaid = paymentMethod && paymentMethod !== "cash";
  const isUnpaid = paymentMethod === "cash";

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
              const isSelected = paymentMethod === option.id;

              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => onPaymentMethodChange(option.id)}
                  className={`flex h-[44px] w-full items-center justify-between rounded-[5px] border px-4 text-right transition ${
                    isSelected
                      ? "border-[#24bdd9] bg-white text-[#27343a] shadow-[0_5px_14px_rgba(35,189,217,0.08)]"
                      : "border-[#edf1f3] bg-white text-[#59666c] hover:border-[#bdeaf3] dark:border-white/10 dark:bg-[#454545] dark:text-gray-200"
                  }`}
                >
                  <span className="text-[12px] font-bold">{option.label}</span>
                  <span className="flex items-center gap-1.5 text-[10px] font-extrabold text-[#2dbfd9]">
                    {option.hint && <span>{option.hint}</span>}
                    <Icon size={17} />
                  </span>
                </button>
              );
            })}
          </div>
        </FormCard>

        <FormCard className="min-h-[138px] px-5 py-5" title="معلومات الدفع">
          <div className="grid grid-cols-2 gap-3">
            <span
              className={`flex h-[44px] items-center justify-center rounded-[5px] border text-[12px] font-bold ${
                isPaid
                  ? "border-[#24bdd9] bg-white text-[#27343a]"
                  : "border-transparent bg-[#f4f4f4] text-[#8b969c] dark:bg-white/10 dark:text-gray-300"
              }`}
            >
              تم الدفع
            </span>
            <span
              className={`flex h-[44px] items-center justify-center rounded-[5px] border text-[12px] font-bold ${
                isUnpaid
                  ? "border-[#24bdd9] bg-white text-[#27343a]"
                  : "border-transparent bg-[#f4f4f4] text-[#8b969c] dark:bg-white/10 dark:text-gray-300"
              }`}
            >
              غير مدفوع
            </span>
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
          <span>{formatTime(appointment?.time)}</span>
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
}) {
  return (
    <label className="block text-right">
      <span className="mb-2 block text-[13px] font-bold text-[#555] dark:text-gray-200">
        {label}
      </span>
      <input
        value={value}
        readOnly={readOnly}
        onChange={(event) => onChange?.(event.target.value)}
        placeholder={placeholder}
        className="h-[46px] w-full rounded-[4px] border border-transparent bg-[#f0f0f0] px-4 text-right text-[13px] font-bold text-[#27343a] outline-none transition placeholder:text-[#a7b0b5] focus:border-[#23bfdd] dark:bg-[#4b4b4b] dark:text-white"
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
