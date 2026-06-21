import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Check, CircleAlert, CreditCard, FileText, Image as ImageIcon, Plus, Smartphone, Trash2, WalletCards } from "lucide-react";
import { FaStar } from "react-icons/fa";
import { toast } from "react-toastify";
import { getDoctorImage, getDoctorName, getDoctorRating } from "../../hooks/useDoctors";
import {
  createAppointment,
  createPaidDemoAppointment,
  getDoctor,
  listDoctorAvailableSlots,
} from "../../services/medilinkApi";
import { PatientHomeFooter, PatientHomeHeader } from "./PatientHomePage";

const gradient = "bg-linear-to-b from-[#05ADE8] to-[#6CCCC8]";
const weekDays = ["الأحد", "الإثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];
const monthNames = ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"];

function dateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatTime(value) {
  const [hourText, minutes = "00"] = String(value || "09:00").split(":");
  const hour = Number(hourText);
  return `${hour % 12 || 12}:${minutes} ${hour >= 12 ? "م" : "ص"}`;
}

function isAvailableSlot(status) {
  const normalizedStatus = String(status || "")
    .trim()
    .toLowerCase();

  return ["متاح", "available", "open", "free"].includes(normalizedStatus);
}

export default function PatientBookingPage() {
  const { doctorId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [doctor, setDoctor] = useState(location.state?.doctor || null);
  const [loading, setLoading] = useState(!location.state?.doctor);
  const [availableSlotDays, setAvailableSlotDays] = useState([]);
  const [step, setStep] = useState(1);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [reason, setReason] = useState("");
  const [reasonSubmitted, setReasonSubmitted] = useState(false);
  const [files, setFiles] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState("clinic");
  const [submitting, setSubmitting] = useState(false);
  const [createdAppointment, setCreatedAppointment] = useState(null);

  useEffect(() => {
    let mounted = true;
    Promise.all([
      location.state?.doctor ? Promise.resolve(location.state.doctor) : getDoctor(doctorId),
      listDoctorAvailableSlots(doctorId),
    ]).then(([doctorResult, slotDays]) => {
      if (!mounted) return;
      setDoctor(doctorResult);
      setAvailableSlotDays(slotDays);
    }).catch((error) => {
      if (mounted) toast.error(error.message || "تعذر تحميل بيانات الحجز");
    }).finally(() => {
      if (mounted) setLoading(false);
    });
    return () => { mounted = false; };
  }, [doctorId, location.state]);

  const submitAppointment = async (paymentDetails = {}) => {
    setSubmitting(true);
    const appointmentValues = {
      doctorId: doctor.id,
      doctorName: getDoctorName(doctor),
      specialization: doctor.specializationId || doctor.specialty,
      specialty: doctor.specialty,
      date: selectedDate,
      time: selectedTime,
      reason,
      files,
      paymentMethod,
      paymentDetails,
      paymentStatus: paymentMethod === "card" ? "paid" : "pay_at_clinic",
      status: "pending",
    };

    try {
      const appointment = await createAppointment(appointmentValues);
      setCreatedAppointment(appointment);
      setStep(4);
      toast.success("تم تأكيد طلب الحجز بنجاح");
    } catch (error) {
      if ([401, 403, 404, 405].includes(error?.status)) {
        try {
          const appointment = await createPaidDemoAppointment({
            ...appointmentValues,
            payment: {
              amount: doctor.consultationFee || 100,
              currency: "EGP",
              method: paymentMethod,
              status: paymentMethod === "card" ? "paid_demo" : "pay_at_clinic",
            },
          });
          setCreatedAppointment(appointment);
          setStep(4);
          toast.success("تم تأكيد الحجز بنجاح");
          return;
        } catch (fallbackError) {
          toast.error(fallbackError.message || "تعذر إتمام الحجز");
          return;
        }
      }

      toast.error(error.message || "تعذر إتمام الحجز");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || !doctor) {
    return <div className="min-h-screen bg-white dark:bg-[#2E2E2E]" dir="rtl"><PatientHomeHeader /><div className="mx-auto my-16 h-[650px] max-w-[1200px] skeleton rounded-3xl" /></div>;
  }

  return (
    <div className="min-h-screen bg-white text-[#333] dark:bg-[#2E2E2E] dark:text-[#F0F0F0]" dir="rtl">
      <PatientHomeHeader />
      <main className="mx-auto w-full max-w-[1280px] px-4 py-10 sm:px-6 lg:px-10">
        <BookingStepper step={step} />
        {step === 1 && <DateTimeStep doctor={doctor} availableSlotDays={availableSlotDays} selectedDate={selectedDate} selectedTime={selectedTime} onDateChange={(value) => { setSelectedDate(value); setSelectedTime(""); }} onTimeChange={setSelectedTime} onNext={() => setStep(2)} />}
        {step === 2 && <ReasonStep reason={reason} setReason={setReason} submitted={reasonSubmitted} files={files} setFiles={setFiles} onPrevious={() => setStep(1)} onNext={() => { setReasonSubmitted(true); if (reason.trim().length >= 3 && reason.trim().length <= 150) setStep(3); }} />}
        {step === 3 && <PaymentStep doctor={doctor} paymentMethod={paymentMethod} setPaymentMethod={setPaymentMethod} submitting={submitting} onPrevious={() => setStep(2)} onConfirm={submitAppointment} />}
        {step === 4 && <ConfirmationStep doctor={doctor} appointment={createdAppointment} date={selectedDate} time={selectedTime} paymentMethod={paymentMethod} onDone={() => navigate("/patient/doctors")} />}
      </main>
      <PatientHomeFooter />
    </div>
  );
}

function BookingStepper({ step }) {
  const labels = ["التاريخ والوقت", "سبب الزيارة والملفات الطبية", "طريقة الدفع", "تأكيد الحجز"];
  return (
    <section className="mb-14 overflow-x-auto pb-2">
      <div className="mx-auto flex min-w-[700px] max-w-[1000px] items-start">
        {labels.map((label, index) => {
          const number = index + 1;
          const completed = step > number;
          const active = step === number;
          return (
            <div key={label} className="relative flex flex-1 flex-col items-center text-center">
              {index > 0 && <span className={`absolute right-[-50%] top-5 h-0.5 w-full ${step >= number ? "bg-[#22B7D5]" : "bg-[#C9C9C9] dark:bg-[#555]"}`} />}
              <span className={`relative z-10 grid size-11 place-items-center rounded-full border-2 text-lg ${completed ? "border-[#22B7D5] bg-[#22B7D5] text-white" : active ? "border-[#22B7D5] bg-white text-[#22B7D5] dark:bg-[#2E2E2E]" : "border-[#B6B6B6] bg-white text-[#999] dark:bg-[#2E2E2E]"}`}>
                {completed ? <Check size={22} /> : number}
              </span>
              <span className={`mt-3 text-sm font-bold lg:text-lg ${active ? "text-[#20B7D5]" : "text-[#888] dark:text-[#BBB]"}`}>{label}</span>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function DoctorStrip({ doctor }) {
  const rating = getDoctorRating(doctor);
  return (
    <section className="grid items-center gap-5 overflow-hidden rounded-3xl bg-[#EFFBFA] p-5 dark:bg-[#354746] sm:grid-cols-[180px_1fr_auto] sm:px-8">
      <img src={getDoctorImage(doctor)} alt={getDoctorName(doctor)} className="mx-auto h-40 w-44 object-contain object-bottom" />
      <div className="text-center sm:text-right">
        <h2 className="text-2xl font-extrabold sm:text-3xl">{getDoctorName(doctor)}</h2>
        <p className="mt-2 text-lg text-[#888] dark:text-[#C9D6D5]">{doctor.specialty || "طب عام"}</p>
        <div className="mt-3 flex items-center justify-center gap-2 sm:justify-start"><span className="flex gap-1 text-[#FFB800]">{Array.from({ length: 5 }).map((_, i) => <FaStar key={i} className={i < Math.round(rating) ? "" : "opacity-25"} />)}</span><strong>{rating.toFixed(1)}</strong></div>
      </div>
      <div className="rounded-2xl bg-[#DDF5F3] px-7 py-5 text-center dark:bg-[#2D5A57]"><strong className="text-xl">سعر الكشف</strong><p className="mt-2 text-lg">{doctor.consultationFee || 100} جنيه</p></div>
    </section>
  );
}

function DateTimeStep({ doctor, availableSlotDays, selectedDate, selectedTime, onDateChange, onTimeChange, onNext }) {
  const canContinue = Boolean(selectedDate && selectedTime);
  const selectedDay = availableSlotDays.find(
    (slotDay) => slotDay.date === selectedDate,
  );
  const slotDaysByDate = new Map(
    availableSlotDays.map((slotDay) => [slotDay.date, slotDay]),
  );
  const dates = Array.from({ length: 7 }, (_, offset) => {
    const dateObject = new Date();
    dateObject.setHours(12, 0, 0, 0);
    dateObject.setDate(dateObject.getDate() + offset);
    const date = dateKey(dateObject);
    const slotDay = slotDaysByDate.get(date);

    return {
      date,
      dateObject,
      day: slotDay?.day || weekDays[dateObject.getDay()],
      available: Boolean(slotDay),
    };
  });
  const headingDate =
    dates.find((slotDay) => slotDay.date === selectedDate)?.dateObject ||
    dates[0].dateObject;

  return (
    <div>
      <header className="mb-8 text-right"><h1 className="text-3xl font-extrabold">اختر التاريخ والوقت</h1><p className="mt-2 text-[#777] dark:text-[#C8C8C8]">اختر التاريخ والوقت المناسب واحجز موعدك بسهولة</p></header>
      <DoctorStrip doctor={doctor} />
      <section className="mt-8 rounded-2xl bg-white p-5 shadow-[0_4px_20px_rgba(0,0,0,.1)] dark:bg-[#383838] sm:p-8">
        <h3 className="mb-6 text-xl font-bold">{headingDate ? `${monthNames[headingDate.getMonth()]} ${headingDate.getFullYear()}` : "المواعيد المتاحة"}</h3>
        {dates.length > 0 ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
          {dates.map((slotDay) => {
            const value = slotDay.date;
            const date = slotDay.dateObject;
            const active = value === selectedDate;
            return <button key={value} type="button" disabled={!slotDay.available} onClick={() => onDateChange(value)} className={`rounded-xl border-2 px-3 py-4 text-center transition ${active ? "border-[#20B7D5] bg-[#EFFBFA] dark:bg-[#2D5552]" : "border-transparent bg-[#F8F8F8] hover:border-[#20B7D5]/50 dark:bg-[#444]"} disabled:cursor-not-allowed disabled:border-transparent disabled:bg-[#F1F1F1] disabled:text-[#AAA] dark:disabled:bg-[#444]`}><span className="block text-sm">{slotDay.day}</span><strong className="mt-2 block text-3xl">{date.getDate()}</strong></button>;
          })}
          </div>
        ) : (
          <p className="py-8 text-center text-[#888] dark:text-[#BBB]">لا توجد أيام متاحة للحجز حاليًا.</p>
        )}
      </section>
      <section className="mt-8 rounded-2xl bg-white p-5 shadow-[0_4px_20px_rgba(0,0,0,.1)] dark:bg-[#383838] sm:p-8">
        <h3 className="mb-6 text-xl font-bold">الأوقات المتاحة</h3>
        {!selectedDate ? (
          <p className="py-8 text-center text-[#888] dark:text-[#BBB]">اختر يومًا لعرض مواعيده.</p>
        ) : selectedDay?.slots?.length ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {selectedDay.slots.map((slot, index) => {
              const available = isAvailableSlot(slot.status);
              return (
                <button
                  key={`${slot.time}-${index}`}
                  type="button"
                  disabled={!available}
                  onClick={() => onTimeChange(slot.time)}
                  className={`rounded-xl border-2 py-3 font-semibold ${
                    selectedTime === slot.time
                      ? "border-[#20B7D5] bg-[#EFFBFA] dark:bg-[#2D5552]"
                      : "border-transparent bg-[#EFFBFA] dark:bg-[#354746]"
                  } disabled:cursor-not-allowed disabled:border-transparent disabled:bg-[#F1F1F1] disabled:text-[#AAA] dark:disabled:bg-[#444]`}
                >
                  {formatTime(slot.time)}
                  {!available && <span className="mr-2 text-xs no-underline">(محجوز)</span>}
                </button>
              );
            })}
          </div>
        ) : (
          <p className="py-8 text-center text-[#888] dark:text-[#BBB]">لا توجد أوقات لهذا اليوم.</p>
        )}
      </section>
      <button type="button" disabled={!canContinue} onClick={onNext} className={`mt-10 w-full rounded-xl py-3.5 text-lg font-bold text-white disabled:cursor-not-allowed disabled:bg-[#BDBDBD] ${canContinue ? gradient : ""}`}>التالي</button>
    </div>
  );
}

function ReasonStep({ reason, setReason, submitted, files, setFiles, onPrevious, onNext }) {
  const inputRef = useRef(null);
  const reasonLength = reason.trim().length;
  const reasonIsValid = reasonLength >= 3 && reasonLength <= 150;
  const reasonError =
    submitted && reasonLength === 0
      ? "من فضلك أدخل سبب الزيارة"
      : submitted && reasonLength < 3
      ? "سبب الزيارة يجب ألا يقل عن 3 أحرف"
      : submitted && reasonLength > 150
        ? "سبب الزيارة يجب ألا يزيد عن 150 حرفًا"
        : "";
  const previews = useMemo(() => files.map((file) => ({ file, id: `${file.name}-${file.size}-${file.lastModified}`, url: file.type.startsWith("image/") ? URL.createObjectURL(file) : "" })), [files]);
  useEffect(() => () => previews.forEach((item) => item.url && URL.revokeObjectURL(item.url)), [previews]);
  const addFiles = (list) => {
    const valid = Array.from(list).filter((file) => {
      if (file.size > 10 * 1024 * 1024) { toast.error(`${file.name}: الحد الأقصى 10 ميجابايت`); return false; }
      return ["image/png", "image/jpeg", "application/pdf"].includes(file.type);
    });
    setFiles((current) => [...current, ...valid.filter((file) => !current.some((old) => old.name === file.name && old.size === file.size && old.lastModified === file.lastModified))]);
    if (inputRef.current) inputRef.current.value = "";
  };
  return (
    <div>
      <header className="mb-8 text-right"><h1 className="text-3xl font-extrabold">سبب الزيارة والملفات الطبية</h1><p className="mt-2 text-[#777] dark:text-[#C8C8C8]">ساعد طبيبك على فهم حالتك بشكل أفضل وإرفاق أي ملفات طبية متعلقة بحالتك.</p></header>
      <label className={`mb-2 block font-bold ${reasonError ? "text-red-600" : ""}`}>سبب الزيارة</label>
      <textarea
        value={reason}
        minLength={3}
        maxLength={150}
        aria-invalid={Boolean(reasonError)}
        aria-describedby={reasonError ? "visit-reason-error" : undefined}
        onChange={(event) => setReason(event.target.value)}
        rows={4}
        placeholder="اكتب الأعراض أو المشكلة التي ترغب في استشارة الطبيب بشأنها..."
        className={`w-full resize-none rounded-2xl border bg-[#FAFAFA] p-4 outline-none transition dark:bg-[#383838] ${
          reasonError
            ? "border-red-500 focus:border-red-500 dark:border-red-500"
            : "border-[#E6E6E6] focus:border-[#20B7D5] dark:border-[#555]"
        }`}
      />
      <div className="mt-2 flex items-center justify-between text-sm">
        {reasonError ? (
          <p id="visit-reason-error" className="font-semibold text-red-600 dark:text-red-400">
            {reasonError}
          </p>
        ) : (
          <span className="text-[#888] dark:text-[#BBB]">من 3 إلى 150 حرفًا</span>
        )}
        <span className="text-[#888] dark:text-[#BBB]">{reason.length}/150</span>
      </div>
      <label className="mb-2 mt-8 block font-bold">الملفات الطبية (اختياري)</label>
      <div onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); addFiles(e.dataTransfer.files); }} className="rounded-2xl border-2 border-dashed border-[#D8D8D8] bg-[#FAFAFA] p-6 dark:border-[#555] dark:bg-[#383838]">
        <input ref={inputRef} type="file" multiple accept=".png,.jpg,.jpeg,.pdf" className="hidden" onChange={(e) => addFiles(e.target.files || [])} />
        {previews.length ? <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          <button type="button" onClick={() => inputRef.current?.click()} className="grid min-h-32 place-items-center rounded-xl border-2 border-dashed border-[#CCC] text-[#999]"><Plus size={40} /></button>
          {previews.map((item) => <div key={item.id} className="group relative min-h-32 overflow-hidden rounded-xl bg-[#EEE] dark:bg-[#444]">{item.url ? <img src={item.url} alt={item.file.name} className="h-32 w-full object-cover" /> : <div className="grid h-32 place-items-center p-3 text-center"><FileText size={34} /><span className="line-clamp-2 text-xs">{item.file.name}</span></div>}<button type="button" onClick={() => setFiles((current) => current.filter((file) => `${file.name}-${file.size}-${file.lastModified}` !== item.id))} className="absolute left-2 top-2 grid size-8 place-items-center rounded-full bg-black/60 text-white"><Trash2 size={16} /></button></div>)}
        </div> : <button type="button" onClick={() => inputRef.current?.click()} className="w-full py-8 text-center text-[#999]"><ImageIcon size={40} className="mx-auto mb-3" /><strong><span className="text-[#20B7D5]">اضغط للاختيار</span> أو اسحب الملفات هنا</strong><small className="mt-2 block">الحد الأقصى 10 ميجابايت لكل ملف — PNG, JPG, PDF</small></button>}
      </div>
      <div className="mt-10 grid gap-4 sm:grid-cols-2"><button type="button" onClick={onPrevious} className="rounded-xl border-2 border-[#20B7D5] py-3.5 font-bold text-[#20B7D5]">السابق</button><button type="button" disabled={!reasonIsValid} onClick={onNext} className={`rounded-xl py-3.5 font-bold text-white disabled:cursor-not-allowed disabled:bg-[#BDBDBD] ${reasonIsValid ? gradient : ""}`}>تخطي/متابعة</button></div>
    </div>
  );
}

function PaymentStep({ doctor, paymentMethod, setPaymentMethod, submitting, onPrevious, onConfirm }) {
  const [card, setCard] = useState({ number: "", expiry: "", cvc: "", holder: "" });
  const fee = doctor.consultationFee || 100;
  const cardComplete =
    card.number.replace(/\s/g, "").length === 16 &&
    /^\d{2}\/(0?[1-9]|1[0-2])$/.test(card.expiry) &&
    card.cvc.length === 3 &&
    card.holder.trim().length >= 3;
  const canContinue = paymentMethod === "clinic" || (paymentMethod === "card" && cardComplete);

  const updateCard = (key, value) => {
    let nextValue = value;
    if (key === "number") {
      nextValue = value.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim();
    }
    if (key === "expiry") {
      const digits = value.replace(/\D/g, "").slice(0, 4);
      nextValue = digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits;
    }
    if (key === "cvc") nextValue = value.replace(/\D/g, "").slice(0, 3);
    setCard((current) => ({ ...current, [key]: nextValue }));
  };

  const handleConfirm = () => {
    if (!canContinue) {
      toast.info("أكمل بيانات البطاقة البنكية أولًا");
      return;
    }
    onConfirm(
      paymentMethod === "card"
        ? { cardLastFour: card.number.replace(/\s/g, "").slice(-4), cardHolder: card.holder.trim() }
        : {},
    );
  };

  return (
    <div>
      <header className="mb-8 text-right">
        <h1 className="text-3xl font-extrabold sm:text-4xl">اختر طريقة الدفع</h1>
        <p className="mt-2 text-[#666] dark:text-[#C8C8C8]">اختر طريقة الدفع المناسبة لك.</p>
      </header>

      <div className="grid gap-6 lg:grid-cols-2 lg:items-stretch">
        <section className="rounded-2xl bg-white p-5 shadow-[0_4px_22px_rgba(0,0,0,.12)] dark:bg-[#383838] sm:p-8">
          <h2 className="mb-6 text-2xl font-bold">اختر طريقة الدفع</h2>
          <div className="space-y-4">
            <PaymentChoice active={paymentMethod === "clinic"} onClick={() => setPaymentMethod("clinic")} icon={WalletCards} title="الدفع في العيادة" badge="عند الوصول" />
            <PaymentChoice active={paymentMethod === "card"} onClick={() => setPaymentMethod("card")} icon={CreditCard} title="بطاقة بنكية" badge="VISA" />
            <PaymentChoice disabled icon={Smartphone} title="محفظة إلكترونية" badge="قريبًا" />
            <PaymentChoice disabled icon={CreditCard} title="إنستا باي" badge="قريبًا" />
          </div>
          <div className="mt-16 border-t border-[#E5E5E5] pt-6 text-left dark:border-[#555] sm:mt-24">
            <strong className="text-2xl">السعر: <span className="font-medium">{fee} جنيه</span></strong>
          </div>
        </section>

        <section className="rounded-2xl bg-white p-5 shadow-[0_4px_22px_rgba(0,0,0,.12)] dark:bg-[#383838] sm:p-8">
          <h2 className="mb-6 text-2xl font-bold">معلومات الدفع</h2>
          {paymentMethod === "card" ? (
            <>
              <div className={`relative mx-auto mb-8 aspect-[1.62/1] w-full max-w-[360px] overflow-hidden rounded-2xl p-6 text-white shadow-lg ${gradient}`}>
                <span className="absolute -left-12 top-0 h-full w-44 rounded-full bg-white/15" />
                <div className="relative flex h-full flex-col justify-between">
                  <div className="flex items-start justify-between text-2xl font-black"><span className="rounded-md bg-[#F7C84B] px-3 py-1 text-sm text-[#775B00]">CHIP</span><span>VISA</span></div>
                  <strong className="text-xl tracking-[.16em] sm:text-2xl">{card.number || "•••• •••• •••• 2345"}</strong>
                  <div className="flex justify-between text-xs"><span><small className="block opacity-80">Card Holder</small>{card.holder || "YOUR NAME"}</span><span><small className="block opacity-80">Expiry</small>{card.expiry || "YY/MM"}</span></div>
                </div>
              </div>
              <CardField label="رقم البطاقة" value={card.number} onChange={(value) => updateCard("number", value)} placeholder="1234 1234 1234 1234" inputMode="numeric" />
              <div className="mt-4 grid grid-cols-2 gap-3">
                <CardField label="تاريخ الانتهاء" value={card.expiry} onChange={(value) => updateCard("expiry", value)} placeholder="سنة/شهر" inputMode="numeric" />
                <CardField label="CVC" value={card.cvc} onChange={(value) => updateCard("cvc", value)} placeholder="123" inputMode="numeric" />
              </div>
              <div className="mt-4"><CardField label="اسم حامل البطاقة" value={card.holder} onChange={(value) => updateCard("holder", value)} placeholder="ادخل الاسم هنا" /></div>
            </>
          ) : (
            <div className="flex min-h-[430px] flex-col items-center justify-center rounded-2xl bg-[#EFFBFA] p-8 text-center dark:bg-[#354746]">
              <span className="grid size-20 place-items-center rounded-full bg-white text-[#20B7D5] shadow-sm dark:bg-[#414141]"><WalletCards size={38} /></span>
              <h3 className="mt-6 text-2xl font-bold">الدفع داخل العيادة</h3>
              <p className="mt-3 max-w-sm leading-7 text-[#607573] dark:text-[#D5E5E3]">يمكنك تأكيد الحجز الآن ودفع قيمة الكشف عند وصولك إلى العيادة.</p>
            </div>
          )}
        </section>
      </div>

      <div className="mt-8 flex items-start gap-3 rounded-xl bg-[#EFFBFA] p-4 text-sm leading-7 text-[#3C6864] dark:bg-[#354746] dark:text-[#D5E5E3] sm:p-5">
        <CircleAlert className="mt-1 shrink-0" size={20} />
        <div><strong>سياسة الإلغاء</strong><p>يمكنك إلغاء الحجز مجانًا قبل موعد الزيارة بـ 6 ساعات أو أكثر. عند الإلغاء قبل الموعد بأقل من 6 ساعات قد تُطبق سياسة العيادة.</p></div>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <button type="button" onClick={onPrevious} className="rounded-xl border-2 border-[#20B7D5] py-3.5 font-bold text-[#20B7D5]">السابق</button>
        <button type="button" disabled={submitting || !canContinue} onClick={handleConfirm} className={`rounded-xl py-3.5 font-bold text-white disabled:bg-[#BDBDBD] ${canContinue ? gradient : ""}`}>{submitting ? "جاري تأكيد الحجز..." : "التالي"}</button>
      </div>
    </div>
  );
}

function PaymentChoice({ active = false, disabled = false, icon: Icon, title, badge, onClick }) {
  return (
    <button type="button" disabled={disabled} onClick={onClick} className={`flex min-h-20 w-full items-center gap-4 rounded-xl border-2 px-5 text-right transition ${active ? "border-[#20B7D5] bg-[#F7FFFF] dark:bg-[#354746]" : "border-[#E8E8E8] dark:border-[#555]"} disabled:opacity-50`}>
      <Icon className={active ? "text-[#20B7D5]" : "text-[#777] dark:text-[#CCC]"} />
      <strong className="flex-1 text-lg">{title}</strong>
      <span className="font-bold text-[#2360A8] dark:text-[#80B7ED]">{badge}</span>
    </button>
  );
}

function CardField({ label, value, onChange, placeholder, inputMode }) {
  return (
    <label className="block">
      <span className="mb-2 block font-bold">{label}</span>
      <input value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} inputMode={inputMode} className="h-13 w-full rounded-xl border border-transparent bg-[#F1F1F1] px-4 text-left outline-none transition placeholder:text-[#AAA] focus:border-[#20B7D5] dark:bg-[#454545]" dir="ltr" />
    </label>
  );
}

function ConfirmationStep({ doctor, appointment, date, time, paymentMethod, onDone }) {
  const paidByCard = paymentMethod === "card";
  const bookingNumber = String(appointment?.id || "1258").replace(/^demo-/, "").slice(-8);
  return (
    <section className="text-center">
      <div className="relative mx-auto h-[360px] w-full max-w-[500px] sm:h-[430px]">
        <span className="absolute left-[14%] top-[36%] h-36 w-24 rounded-l-full border-[28px] border-l-0 border-[#D5D5D5] dark:border-[#555]" />
        <span className="absolute right-[14%] top-[12%] h-44 w-40 rounded-r-[90px] bg-[#20B7D8]" />
        <span className="absolute right-[12%] bottom-[12%] h-40 w-44 rounded-t-[90px] rounded-bl-2xl bg-[#D5D5D5] dark:bg-[#555]" />
        <span className="absolute left-[18%] bottom-[8%] size-28 rounded-full bg-[#85D7E7]" />
        <span className="absolute left-[20%] top-[14%] size-12 rounded-full bg-[#2360A8]" />
        <span className={`absolute left-1/2 top-1/2 z-10 grid size-56 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full text-white shadow-xl sm:size-72 ${gradient}`}><Check size={120} strokeWidth={1.5} className="sm:size-40" /></span>
      </div>
      <h1 className="text-3xl font-extrabold sm:text-4xl">{paidByCard ? "تم تأكيد الدفع بنجاح" : "تم تأكيد الحجز بنجاح"}</h1>
      <p className="mx-auto mt-3 max-w-2xl text-[#666] dark:text-[#CCC]">تم حجز موعدك بنجاح وسيتم إرسال تفاصيل الموعد إلى تطبيق الرسائل الخاص بك.</p>
      <div className="mx-auto mt-8 grid max-w-md grid-cols-[auto_1fr] gap-x-6 gap-y-3 rounded-2xl bg-[#EFFBFA] p-6 text-right dark:bg-[#354746]">
        <strong>رقم الحجز:</strong><span>#{bookingNumber}</span>
        <strong>التاريخ:</strong><span>{new Date(`${date}T12:00:00`).toLocaleDateString("ar-EG", { day: "numeric", month: "long", year: "numeric" })}</span>
        <strong>الوقت:</strong><span>{formatTime(time)}</span>
        <strong>الطبيب:</strong><span>{getDoctorName(doctor)}</span>
      </div>
      <div className="mx-auto mt-8 flex max-w-4xl items-start justify-center gap-3 rounded-xl bg-[#EFFBFA] p-4 text-sm leading-7 text-[#3C6864] dark:bg-[#354746] dark:text-[#D5E5E3]">
        <CircleAlert className="mt-1 shrink-0" size={20} />
        <p>سيتم إرسال إشعار تلقائي لك عندما يتبقى مريضان فقط قبل دورك داخل العيادة لمساعدتك على الوصول في الوقت المناسب.</p>
      </div>
      <button type="button" onClick={onDone} className={`mt-10 w-full rounded-xl py-3.5 font-bold text-white ${gradient}`}>التالي</button>
    </section>
  );
}
