import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Check, CreditCard, FileText, Image as ImageIcon, Plus, Trash2, WalletCards } from "lucide-react";
import { FaStar } from "react-icons/fa";
import { toast } from "react-toastify";
import { getDoctorImage, getDoctorName, getDoctorRating } from "../../hooks/useDoctors";
import { createAppointment, getDoctor, listDoctorAppointments } from "../../services/medilinkApi";
import { PatientHomeFooter, PatientHomeHeader } from "./PatientHomePage";

const gradient = "bg-linear-to-b from-[#05ADE8] to-[#6CCCC8]";
const weekDays = ["الأحد", "الإثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];
const monthNames = ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"];

function dateKey(date) {
  return date.toISOString().slice(0, 10);
}

function formatTime(value) {
  const [hourText, minutes = "00"] = String(value || "09:00").split(":");
  const hour = Number(hourText);
  return `${hour % 12 || 12}:${minutes} ${hour >= 12 ? "م" : "ص"}`;
}

function generateSlots(start = "09:00", end = "15:00") {
  const [startHour, startMinute] = start.split(":").map(Number);
  const [endHour, endMinute] = end.split(":").map(Number);
  let cursor = startHour * 60 + startMinute;
  const limit = endHour * 60 + endMinute;
  const result = [];
  while (cursor < limit && result.length < 16) {
    result.push(`${String(Math.floor(cursor / 60)).padStart(2, "0")}:${String(cursor % 60).padStart(2, "0")}`);
    cursor += 30;
  }
  return result.length ? result : ["09:00", "09:30", "10:00", "10:30", "11:00", "11:30"];
}

export default function PatientBookingPage() {
  const { doctorId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [doctor, setDoctor] = useState(location.state?.doctor || null);
  const [loading, setLoading] = useState(!location.state?.doctor);
  const [appointments, setAppointments] = useState([]);
  const [step, setStep] = useState(1);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [reason, setReason] = useState("");
  const [files, setFiles] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState("clinic");
  const [submitting, setSubmitting] = useState(false);
  const [createdAppointment, setCreatedAppointment] = useState(null);

  useEffect(() => {
    let mounted = true;
    Promise.all([
      location.state?.doctor ? Promise.resolve(location.state.doctor) : getDoctor(doctorId),
      listDoctorAppointments(doctorId).catch(() => []),
    ]).then(([doctorResult, appointmentResult]) => {
      if (!mounted) return;
      setDoctor(doctorResult);
      setAppointments(appointmentResult);
    }).catch((error) => {
      if (mounted) toast.error(error.message || "تعذر تحميل بيانات الحجز");
    }).finally(() => {
      if (mounted) setLoading(false);
    });
    return () => { mounted = false; };
  }, [doctorId, location.state]);

  const submitAppointment = async () => {
    setSubmitting(true);
    try {
      const appointment = await createAppointment({
        doctorId: doctor.id,
        doctorName: getDoctorName(doctor),
        specialization: doctor.specializationId || doctor.specialty,
        specialty: doctor.specialty,
        date: selectedDate,
        time: selectedTime,
        reason,
        files,
        paymentMethod,
        status: "pending",
      });
      setCreatedAppointment(appointment);
      setStep(4);
      toast.success("تم تأكيد طلب الحجز بنجاح");
    } catch (error) {
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
        {step === 1 && <DateTimeStep doctor={doctor} appointments={appointments} selectedDate={selectedDate} selectedTime={selectedTime} onDateChange={(value) => { setSelectedDate(value); setSelectedTime(""); }} onTimeChange={setSelectedTime} onNext={() => selectedDate && selectedTime ? setStep(2) : toast.info("اختر التاريخ والوقت أولًا")} />}
        {step === 2 && <ReasonStep reason={reason} setReason={setReason} files={files} setFiles={setFiles} onPrevious={() => setStep(1)} onNext={() => reason.trim() ? setStep(3) : toast.info("اكتب سبب الزيارة أولًا")} />}
        {step === 3 && <PaymentStep doctor={doctor} paymentMethod={paymentMethod} setPaymentMethod={setPaymentMethod} submitting={submitting} onPrevious={() => setStep(2)} onConfirm={submitAppointment} />}
        {step === 4 && <ConfirmationStep doctor={doctor} appointment={createdAppointment} date={selectedDate} time={selectedTime} onDone={() => navigate("/patient/doctors")} />}
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

function DateTimeStep({ doctor, appointments, selectedDate, selectedTime, onDateChange, onTimeChange, onNext }) {
  const dates = useMemo(() => {
    const allowed = new Set(doctor.workDays || []);
    return Array.from({ length: 21 }, (_, offset) => {
      const date = new Date();
      date.setHours(12, 0, 0, 0);
      date.setDate(date.getDate() + offset);
      return date;
    }).filter((date) => !allowed.size || allowed.has(weekDays[date.getDay()])).slice(0, 7);
  }, [doctor.workDays]);
  const slots = generateSlots(doctor.workStart, doctor.workEnd);
  const booked = new Set(appointments.filter((item) => item.date === selectedDate && item.status !== "cancelled").map((item) => item.time));

  return (
    <div>
      <header className="mb-8 text-right"><h1 className="text-3xl font-extrabold">اختر التاريخ والوقت</h1><p className="mt-2 text-[#777] dark:text-[#C8C8C8]">اختر التاريخ والوقت المناسب واحجز موعدك بسهولة</p></header>
      <DoctorStrip doctor={doctor} />
      <section className="mt-8 rounded-2xl bg-white p-5 shadow-[0_4px_20px_rgba(0,0,0,.1)] dark:bg-[#383838] sm:p-8">
        <h3 className="mb-6 text-xl font-bold">{dates[0] ? `${monthNames[dates[0].getMonth()]} ${dates[0].getFullYear()}` : "المواعيد المتاحة"}</h3>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
          {dates.map((date) => {
            const value = dateKey(date);
            const active = value === selectedDate;
            return <button key={value} type="button" onClick={() => onDateChange(value)} className={`rounded-xl border-2 px-3 py-4 text-center transition ${active ? "border-[#20B7D5] bg-[#EFFBFA] dark:bg-[#2D5552]" : "border-transparent bg-[#F8F8F8] hover:border-[#20B7D5]/50 dark:bg-[#444]"}`}><span className="block text-sm">{weekDays[date.getDay()]}</span><strong className="mt-2 block text-3xl">{date.getDate()}</strong></button>;
          })}
        </div>
      </section>
      <section className="mt-8 rounded-2xl bg-white p-5 shadow-[0_4px_20px_rgba(0,0,0,.1)] dark:bg-[#383838] sm:p-8">
        <h3 className="mb-6 text-xl font-bold">الأوقات المتاحة</h3>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {slots.map((slot) => {
            const disabled = !selectedDate || booked.has(slot);
            return <button key={slot} type="button" disabled={disabled} onClick={() => onTimeChange(slot)} className={`rounded-xl border-2 py-3 font-semibold ${selectedTime === slot ? "border-[#20B7D5] bg-[#EFFBFA] dark:bg-[#2D5552]" : "border-transparent bg-[#EFFBFA] dark:bg-[#354746]"} disabled:bg-[#F4F4F4] disabled:text-[#AAA] dark:disabled:bg-[#444]`}>{formatTime(slot)}</button>;
          })}
        </div>
      </section>
      <button type="button" onClick={onNext} className={`mt-10 w-full rounded-xl py-3.5 text-lg font-bold text-white ${gradient}`}>التالي</button>
    </div>
  );
}

function ReasonStep({ reason, setReason, files, setFiles, onPrevious, onNext }) {
  const inputRef = useRef(null);
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
      <label className="mb-2 block font-bold">سبب الزيارة</label>
      <textarea value={reason} onChange={(event) => setReason(event.target.value)} rows={4} placeholder="اكتب الأعراض أو المشكلة التي ترغب في استشارة الطبيب بشأنها..." className="w-full resize-none rounded-2xl border border-[#E6E6E6] bg-[#FAFAFA] p-4 outline-none transition focus:border-[#20B7D5] dark:border-[#555] dark:bg-[#383838]" />
      <label className="mb-2 mt-8 block font-bold">الملفات الطبية (اختياري)</label>
      <div onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); addFiles(e.dataTransfer.files); }} className="rounded-2xl border-2 border-dashed border-[#D8D8D8] bg-[#FAFAFA] p-6 dark:border-[#555] dark:bg-[#383838]">
        <input ref={inputRef} type="file" multiple accept=".png,.jpg,.jpeg,.pdf" className="hidden" onChange={(e) => addFiles(e.target.files || [])} />
        {previews.length ? <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          <button type="button" onClick={() => inputRef.current?.click()} className="grid min-h-32 place-items-center rounded-xl border-2 border-dashed border-[#CCC] text-[#999]"><Plus size={40} /></button>
          {previews.map((item) => <div key={item.id} className="group relative min-h-32 overflow-hidden rounded-xl bg-[#EEE] dark:bg-[#444]">{item.url ? <img src={item.url} alt={item.file.name} className="h-32 w-full object-cover" /> : <div className="grid h-32 place-items-center p-3 text-center"><FileText size={34} /><span className="line-clamp-2 text-xs">{item.file.name}</span></div>}<button type="button" onClick={() => setFiles((current) => current.filter((file) => `${file.name}-${file.size}-${file.lastModified}` !== item.id))} className="absolute left-2 top-2 grid size-8 place-items-center rounded-full bg-black/60 text-white"><Trash2 size={16} /></button></div>)}
        </div> : <button type="button" onClick={() => inputRef.current?.click()} className="w-full py-8 text-center text-[#999]"><ImageIcon size={40} className="mx-auto mb-3" /><strong><span className="text-[#20B7D5]">اضغط للاختيار</span> أو اسحب الملفات هنا</strong><small className="mt-2 block">الحد الأقصى 10 ميجابايت لكل ملف — PNG, JPG, PDF</small></button>}
      </div>
      <div className="mt-10 grid gap-4 sm:grid-cols-2"><button type="button" onClick={onPrevious} className="rounded-xl border-2 border-[#20B7D5] py-3.5 font-bold text-[#20B7D5]">السابق</button><button type="button" onClick={onNext} className={`rounded-xl py-3.5 font-bold text-white ${gradient}`}>تخطي/متابعة</button></div>
    </div>
  );
}

function PaymentStep({ doctor, paymentMethod, setPaymentMethod, submitting, onPrevious, onConfirm }) {
  const methods = [{ id: "clinic", icon: WalletCards, title: "الدفع في العيادة", text: "ادفع قيمة الكشف عند الوصول" }, { id: "card", icon: CreditCard, title: "بطاقة بنكية", text: "سيتم تجهيز الدفع الإلكتروني لاحقًا" }];
  return <div><header className="mb-8"><h1 className="text-3xl font-extrabold">اختر طريقة الدفع</h1><p className="mt-2 text-[#777] dark:text-[#CCC]">قيمة الكشف: {doctor.consultationFee || 100} جنيه</p></header><div className="grid gap-5 md:grid-cols-2">{methods.map(({ id, icon: Icon, title, text }) => <button key={id} type="button" onClick={() => setPaymentMethod(id)} className={`flex items-center gap-5 rounded-2xl border-2 p-6 text-right ${paymentMethod === id ? "border-[#20B7D5] bg-[#EFFBFA] dark:bg-[#354746]" : "border-[#E5E5E5] dark:border-[#555]"}`}><span className="grid size-14 place-items-center rounded-xl bg-[#E1F7F5] text-[#20B7D5] dark:bg-[#2D5552]"><Icon /></span><span><strong className="text-xl">{title}</strong><small className="mt-1 block text-[#777] dark:text-[#CCC]">{text}</small></span></button>)}</div><div className="mt-10 grid gap-4 sm:grid-cols-2"><button type="button" onClick={onPrevious} className="rounded-xl border-2 border-[#20B7D5] py-3.5 font-bold text-[#20B7D5]">السابق</button><button type="button" disabled={submitting} onClick={onConfirm} className={`rounded-xl py-3.5 font-bold text-white disabled:opacity-60 ${gradient}`}>{submitting ? "جاري تأكيد الحجز..." : "تأكيد الحجز"}</button></div></div>;
}

function ConfirmationStep({ doctor, appointment, date, time, onDone }) {
  return <section className="mx-auto max-w-2xl rounded-3xl bg-white p-7 text-center shadow-[0_8px_30px_rgba(0,0,0,.12)] dark:bg-[#383838] sm:p-12"><span className={`mx-auto grid size-24 place-items-center rounded-full text-white ${gradient}`}><Check size={54} /></span><h1 className="mt-7 text-3xl font-extrabold">تم إرسال طلب الحجز بنجاح</h1><p className="mt-3 text-[#777] dark:text-[#CCC]">موعدك مع {getDoctorName(doctor)}</p><div className="mt-7 rounded-2xl bg-[#EFFBFA] p-5 dark:bg-[#354746]"><p>{new Date(`${date}T12:00:00`).toLocaleDateString("ar-EG", { dateStyle: "full" })}</p><strong className="mt-2 block text-xl">{formatTime(time)}</strong>{appointment?.id && <small className="mt-2 block">رقم الحجز: {appointment.id}</small>}</div><button type="button" onClick={onDone} className={`mt-8 w-full rounded-xl py-3.5 font-bold text-white ${gradient}`}>العودة إلى الأطباء</button></section>;
}
