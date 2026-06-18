import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import {
  loadClinicInfo,
  updateClinicInfo,
  useClinicInfo,
} from "../../../services/clinicInfoStore";
import { timeOptions } from "../users/usersData";

const tabs = [
  { id: "info", label: "معلومات العيادة" },
  { id: "payment", label: "إعدادات الدفع" },
  { id: "hours", label: "أيام وساعات العمل" },
];

const initialPayment = {
  offerPercentage: "",
  consultationPrice: "",
  followUpPrice: "",
  refundOnCancel: false,
  bookingGraceHours: "",
  lateCancelDiscount: "",
  paymentMethods: {
    cash: false,
    card: false,
    instapay: false,
    wallet: false,
  },
  hasDiscounts: false,
  discountPercentage: "",
  discountedVisitPrice: "",
};

const initialWorkingDays = [
  { id: "sat", name: "السبت", active: false, from: "", to: "" },
  { id: "sun", name: "الأحد", active: false, from: "", to: "" },
  { id: "mon", name: "الإثنين", active: false, from: "", to: "" },
  { id: "tue", name: "الثلاثاء", active: false, from: "", to: "" },
  { id: "wed", name: "الأربعاء", active: false, from: "", to: "" },
  { id: "thu", name: "الخميس", active: false, from: "", to: "" },
  { id: "fri", name: "الجمعة", active: false, from: "", to: "" },
];

const initialAppointmentSettings = {
  duration: "",
  dailyLimit: "",
};

const inputClass =
  "h-11 w-full rounded-md border border-transparent bg-[#f1f1f1] px-4 text-sm text-[#333] outline-none transition placeholder:text-gray-400 focus:border-[#16B9E7] dark:bg-[#505050] dark:text-white";

const buttonClass =
  "h-11 rounded-lg text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#16B9E7]";

export default function ClinicManagementPage() {
  const [activeTab, setActiveTab] = useState("info");
  const savedClinicInfo = useClinicInfo();
  const [clinicInfo, setClinicInfo] = useState(savedClinicInfo);
  const [loadedClinicInfo, setLoadedClinicInfo] = useState(savedClinicInfo);
  const [clinicLoading, setClinicLoading] = useState(true);
  const [clinicSaving, setClinicSaving] = useState(false);
  const [payment, setPayment] = useState(initialPayment);
  const [workingDays, setWorkingDays] = useState(initialWorkingDays);
  const [appointmentSettings, setAppointmentSettings] = useState(
    initialAppointmentSettings,
  );

  useEffect(() => {
    let mounted = true;

    loadClinicInfo()
      .then((info) => {
        if (!mounted) return;
        setClinicInfo(info);
        setLoadedClinicInfo(info);
      })
      .catch((error) => {
        if (mounted) toast.error(error.message || "تعذر تحميل بيانات العيادة");
      })
      .finally(() => {
        if (mounted) setClinicLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const saveChanges = async () => {
    if (activeTab === "info") {
      setClinicSaving(true);
      try {
        const updatedInfo = await updateClinicInfo(clinicInfo);
        setClinicInfo(updatedInfo);
        setLoadedClinicInfo(updatedInfo);
        toast.success("تم حفظ بيانات العيادة بنجاح");
      } catch (error) {
        toast.error(error.message || "تعذر حفظ بيانات العيادة");
      } finally {
        setClinicSaving(false);
      }
      return;
    }

    toast.success("تم حفظ التغييرات بنجاح");
  };

  const cancelChanges = () => {
    if (activeTab === "info") setClinicInfo(loadedClinicInfo);
    if (activeTab === "payment") setPayment(initialPayment);
    if (activeTab === "hours") {
      setWorkingDays(initialWorkingDays);
      setAppointmentSettings(initialAppointmentSettings);
    }
  };

  return (
    <section className="min-h-screen bg-[#fbfbfb] text-[#333] dark:bg-[#2f2f2f] dark:text-white">
      <ClinicHeader />

      <div className="bg-white px-4 dark:bg-[#3a3a3a] sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-[1070px] grid-cols-3 border-b border-gray-300 text-center text-base font-bold text-gray-400 dark:border-white/15">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              className={`relative h-14 transition ${
                activeTab === tab.id
                  ? "text-[#16B9E7]"
                  : "hover:text-[#16B9E7] dark:text-gray-300"
              }`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
              {activeTab === tab.id && (
                <span className="absolute inset-x-4 bottom-0 h-0.5 rounded-full bg-[#16B9E7]" />
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 py-12 sm:px-6 lg:px-8">
        {activeTab === "info" && (
          <ClinicInfoForm
            values={clinicInfo}
            onChange={setClinicInfo}
            onSave={saveChanges}
            onCancel={cancelChanges}
            loading={clinicLoading}
            saving={clinicSaving}
          />
        )}

        {activeTab === "payment" && (
          <PaymentForm
            values={payment}
            onChange={setPayment}
            onSave={saveChanges}
            onCancel={cancelChanges}
          />
        )}

        {activeTab === "hours" && (
          <WorkingHoursForm
            days={workingDays}
            onDaysChange={setWorkingDays}
            appointmentSettings={appointmentSettings}
            onAppointmentSettingsChange={setAppointmentSettings}
            onSave={saveChanges}
            onCancel={cancelChanges}
          />
        )}
      </div>
    </section>
  );
}

function ClinicHeader() {
  return (
    <header className="flex min-h-[120px] items-center justify-between gap-6 bg-white px-6 py-8 shadow-sm dark:bg-[#3a3a3a] lg:px-8">
      <div className="text-right">
        <h1 className="text-2xl font-bold lg:text-3xl">إعدادات العيادة</h1>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-300">
          تحكم في معلومات العيادة وساعات العمل وإعدادات المواعيد والدفع.
        </p>
      </div>

    </header>
  );
}

function ClinicInfoForm({ values, onChange, onSave, onCancel, loading, saving }) {
  const setField = (field, value) => {
    onChange((current) => ({ ...current, [field]: value }));
  };

  return (
    <FormCard className="max-w-[700px] gap-6 rounded-2xl p-9">
      {loading && <p className="text-center text-sm text-[#777] dark:text-[#CCC]">جاري تحميل بيانات العيادة...</p>}
      <TextField
        label="اسم العيادة"
        value={values.name}
        onChange={(event) => setField("name", event.target.value)}
      />

      <div>
        <FormLabel>العنوان</FormLabel>
        <input
          value={values.address}
          onChange={(event) => setField("address", event.target.value)}
          className={inputClass}
        />
      </div>

      <TextField
        label="وصف العيادة"
        value={values.description}
        onChange={(event) => setField("description", event.target.value)}
      />

      <div className="grid gap-2 sm:grid-cols-2">
        <TextField
          label="رقم الهاتف"
          value={values.phone}
          inputMode="numeric"
          onChange={(event) => setField("phone", event.target.value)}
        />
        <TextField
          label="البريد الإلكتروني"
          value={values.email}
          dir="ltr"
          onChange={(event) => setField("email", event.target.value)}
        />
      </div>

      <ActionButtons onSave={onSave} onCancel={onCancel} disabled={loading || saving} saveLabel={saving ? "جاري الحفظ..." : "حفظ التغييرات"} />
    </FormCard>
  );
}

function PaymentForm({ values, onChange, onSave, onCancel }) {
  const setField = (field, value) => {
    onChange((current) => ({ ...current, [field]: value }));
  };

  const setMethod = (method, checked) => {
    onChange((current) => ({
      ...current,
      paymentMethods: {
        ...current.paymentMethods,
        [method]: checked,
      },
    }));
  };

  return (
    <FormCard className="max-w-[690px] gap-7 rounded-xl p-8 shadow-[0_3px_24px_rgba(0,0,0,0.12)]">
      <PaymentUnitField
        label="نسبة العروض"
        unit="%"
        value={values.offerPercentage}
        fullWidth
        onChange={(event) => setField("offerPercentage", event.target.value)}
      />

      <div className="grid items-start gap-7 md:grid-cols-3" dir="rtl">
        <PaymentChoiceGroup
          label="استرداد المبلغ عند الإلغاء"
          firstLabel="نعم"
          firstChecked={values.refundOnCancel}
          onFirstChange={() => setField("refundOnCancel", true)}
          secondLabel="لا"
          secondChecked={!values.refundOnCancel}
          onSecondChange={() => setField("refundOnCancel", false)}
        />
        <PaymentUnitField
          label="مهلة إلغاء الحجز"
          unit="ساعة"
          value={values.bookingGraceHours}
          onChange={(event) =>
            setField("bookingGraceHours", event.target.value)
          }
        />
        <PaymentUnitField
          label="نسبة الخصم عند الإلغاء المتأخر"
          unit="%"
          value={values.lateCancelDiscount}
          onChange={(event) =>
            setField("lateCancelDiscount", event.target.value)
          }
        />
      </div>

      <div className="grid w-full max-w-[350px] gap-4">
        <h2 className="text-right text-base font-semibold text-[#111] dark:text-white">
          طرق الدفع
        </h2>
        <div className="grid grid-cols-2 gap-x-12 gap-y-4">
          <PaymentCheckbox
            label="بطاقة بنكية"
            checked={values.paymentMethods.card}
            onChange={(event) => setMethod("card", event.target.checked)}
          />
          <PaymentCheckbox
            label="محفظة إلكترونية"
            checked={values.paymentMethods.wallet}
            onChange={(event) => setMethod("wallet", event.target.checked)}
          />
          <PaymentCheckbox
            label="انستا باي"
            checked={values.paymentMethods.instapay}
            onChange={(event) => setMethod("instapay", event.target.checked)}
          />
        </div>
      </div>

      <div className="border-t-2 border-gray-200 pt-7 dark:border-white/10">
        <div className="grid items-start gap-7 md:grid-cols-3" dir="rtl">
          <PaymentChoiceGroup
            label="هل يوجد خصومات"
            firstLabel="نعم"
            firstChecked={values.hasDiscounts}
            onFirstChange={() => setField("hasDiscounts", true)}
            secondLabel="لا"
            secondChecked={!values.hasDiscounts}
            onSecondChange={() => setField("hasDiscounts", false)}
          />
          <PaymentUnitField
            label="نسبة الخصم"
            unit="%"
            value={values.discountPercentage}
            disabled={!values.hasDiscounts}
            onChange={(event) =>
              setField("discountPercentage", event.target.value)
            }
          />
        </div>
      </div>

      <ActionButtons onSave={onSave} onCancel={onCancel} />
    </FormCard>
  );
}

function PaymentFieldLabel({ children, className = "text-right" }) {
  return (
    <span
      className={`mb-2 block whitespace-nowrap text-base font-semibold text-[#111] dark:text-white ${className}`}
    >
      {children}
    </span>
  );
}

function PaymentUnitField({
  label,
  unit,
  disabled = false,
  fullWidth = false,
  ...props
}) {
  return (
    <label
      className={fullWidth ? "block text-right" : "block text-center"}
      dir="rtl"
    >
      <PaymentFieldLabel className={fullWidth ? "text-right" : "text-center"}>
        {label}
      </PaymentFieldLabel>
      <div className={`relative ${fullWidth ? "w-full" : "mx-auto w-[104px]"}`}>
        <input
          {...props}
          disabled={disabled}
          inputMode="numeric"
          className="h-12 w-full rounded-xl border border-transparent bg-[#eeeeee] px-4 pl-11 text-right text-base text-[#4b4b4b] outline-none transition focus:border-[#16B9E7] disabled:opacity-60 dark:bg-[#505050] dark:text-white"
        />
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-base text-[#111] dark:text-white">
          {unit}
        </span>
      </div>
    </label>
  );
}

function PaymentChoiceGroup({
  label,
  firstLabel,
  firstChecked,
  onFirstChange,
  secondLabel,
  secondChecked,
  onSecondChange,
}) {
  return (
    <div className="text-center" dir="rtl">
      <PaymentFieldLabel className="text-right">{label}</PaymentFieldLabel>
      <div className="flex h-12 items-center justify-center gap-5">
        <PaymentRadio
          label={firstLabel}
          checked={firstChecked}
          onChange={onFirstChange}
        />
        <PaymentRadio
          label={secondLabel}
          checked={secondChecked}
          onChange={onSecondChange}
        />
      </div>
    </div>
  );
}

function PaymentRadio({ label, checked, onChange }) {
  return (
    <label
      className="flex items-center gap-3 text-base font-semibold text-[#333] dark:text-white"
      dir="rtl"
    >
      <span>{label}</span>
      <input
        type="radio"
        checked={checked}
        onChange={onChange}
        className="h-[18px] w-[18px] accent-[#47c2d6]"
      />
    </label>
  );
}

function PaymentCheckbox({ label, checked, onChange }) {
  return (
    <label
      className="flex items-center justify-start gap-3 text-base font-semibold text-[#333] dark:text-white"
      dir="rtl"
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="h-5 w-5 rounded border-gray-300 accent-[#47c2d6]"
      />
      <span>{label}</span>
    </label>
  );
}

function WorkingHoursForm({
  days,
  onDaysChange,
  appointmentSettings,
  onAppointmentSettingsChange,
  onSave,
  onCancel,
}) {
  const updateDay = (id, field, value) => {
    onDaysChange((current) =>
      current.map((day) =>
        day.id === id
          ? field === "active"
            ? {
                ...day,
                active: value,
                from: value ? day.from : "",
                to: value ? day.to : "",
              }
            : {
                ...day,
                [field]: value,
              }
          : day,
      ),
    );
  };

  const setAppointmentField = (field, value) => {
    onAppointmentSettingsChange((current) => ({ ...current, [field]: value }));
  };

  return (
    <div className="mx-auto grid max-w-[780px] gap-5">
      <FormCard className="max-w-none rounded-2xl p-6 shadow-[0_2px_20px_rgba(0,0,0,0.1)]">
        <div className="overflow-x-auto">
          <div className="min-w-[720px]" dir="ltr">
            <div className="grid h-14 grid-cols-[1fr_1fr_1.45fr] items-center bg-[#f7f7f7] px-8 text-base font-semibold dark:bg-[#454545]">
              <span className="text-center">إلى</span>
              <span className="text-center">من</span>
              <span className="grid grid-cols-[1fr_32px] items-center gap-6 text-right">
                <span>الأيام</span>
                <WorkCheckbox
                  aria-label="تحديد كل أيام العمل"
                  checked={days.every((day) => day.active)}
                  onChange={(event) =>
                    onDaysChange((current) =>
                      current.map((day) => ({
                        ...day,
                        active: event.target.checked,
                        from: event.target.checked ? day.from : "",
                        to: event.target.checked ? day.to : "",
                      })),
                    )
                  }
                />
              </span>
            </div>

            {days.map((day) => (
              <div
                key={day.id}
                className="grid h-14 grid-cols-[1fr_1fr_1.45fr] items-center border-b border-gray-200 px-8 text-base last:border-0 dark:border-white/10"
              >
                <div className="grid place-items-center">
                  <TimeSelect
                    value={day.to}
                    disabled={!day.active}
                    onChange={(event) =>
                      updateDay(day.id, "to", event.target.value)
                    }
                  />
                </div>
                <div className="grid place-items-center">
                  <TimeSelect
                    value={day.from}
                    disabled={!day.active}
                    onChange={(event) =>
                      updateDay(day.id, "from", event.target.value)
                    }
                  />
                </div>
                <div className="grid grid-cols-[1fr_32px] items-center gap-6">
                  <span className="text-right font-semibold">{day.name}</span>
                  <WorkCheckbox
                    aria-label={`تحديد ${day.name} كيوم عمل`}
                    checked={day.active}
                    onChange={(event) =>
                      updateDay(day.id, "active", event.target.checked)
                    }
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div
          className="grid gap-3 border-t border-gray-200 pt-5 dark:border-white/10 sm:grid-cols-2"
          dir="ltr"
        >
          <WorkSettingField
            label="الحد الأقصى للحجوزات لكل طبيب يوميا"
            unit="موعد"
            value={appointmentSettings.dailyLimit}
            onChange={(event) =>
              setAppointmentField("dailyLimit", event.target.value)
            }
          />
          <WorkSettingField
            label="مدة الموعد"
            unit="دقيقة"
            value={appointmentSettings.duration}
            onChange={(event) =>
              setAppointmentField("duration", event.target.value)
            }
          />
        </div>

        <ActionButtons onSave={onSave} onCancel={onCancel} />
      </FormCard>
    </div>
  );
}

function FormCard({ children, className = "" }) {
  return (
    <div
      className={`mx-auto grid gap-5 rounded-lg bg-white p-6 shadow-[0_0_18px_rgba(0,0,0,0.08)] dark:bg-[#3f3f3f] ${className}`}
    >
      {children}
    </div>
  );
}

function FormLabel({ children, className = "" }) {
  return (
    <span
      className={`mb-2 block text-right text-sm font-semibold text-[#111] dark:text-white ${className}`}
    >
      {children}
    </span>
  );
}

function TextField({ label, ...props }) {
  return (
    <label className="block text-right">
      <FormLabel>{label}</FormLabel>
      <input {...props} className={inputClass} />
    </label>
  );
}

function WorkSettingField({ label, unit, disabled = false, ...props }) {
  return (
    <label className="block text-right" dir="rtl">
      <span className="mb-2 block text-base font-semibold text-[#111] dark:text-white">
        {label}
      </span>
      <div className="relative">
        <input
          {...props}
          disabled={disabled}
          inputMode="numeric"
          className="h-11 w-full rounded-md border border-transparent bg-[#eeeeee] px-4 pl-16 text-right text-sm text-[#333] outline-none transition focus:border-[#16B9E7] disabled:opacity-60 dark:bg-[#505050] dark:text-white"
        />
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-gray-500 dark:text-gray-300">
          {unit}
        </span>
      </div>
    </label>
  );
}

function WorkCheckbox({ checked, onChange, "aria-label": ariaLabel }) {
  return (
    <label className="grid h-5 w-5 place-items-center">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        aria-label={ariaLabel}
        className="peer sr-only"
      />
      <span className="grid h-5 w-5 place-items-center rounded-[3px] border border-[#9d9d9d] bg-white text-[17px] font-bold leading-none text-transparent peer-checked:border-transparent peer-checked:bg-gradient-to-l peer-checked:from-[#66d1cb] peer-checked:to-[#13b7e8] peer-checked:text-white">
        {checked ? "✓" : ""}
      </span>
    </label>
  );
}

function TimeSelect({ disabled, value, onChange }) {
  return (
    <label className="block w-[136px]">
      <select
        value={disabled ? "" : value}
        onChange={onChange}
        disabled={disabled}
        className="h-9 w-full rounded-md border border-transparent bg-transparent px-2 text-center text-base text-[#333] outline-none transition focus:border-[#16B9E7] disabled:appearance-none disabled:bg-transparent disabled:text-[#333] dark:bg-[#505050] dark:text-white dark:disabled:bg-transparent dark:disabled:text-white [&>option]:bg-white [&>option]:text-[#333] dark:[&>option]:bg-[#505050] dark:[&>option]:text-white"
      >
        <option value="">---</option>
        {timeOptions.map((time) => (
          <option key={time} value={time}>
            {formatClinicTime(time)}
          </option>
        ))}
      </select>
    </label>
  );
}

function formatClinicTime(time) {
  if (!time) return "---";

  const [hourText = "0", minute = "00"] = time.split(":");
  const hour24 = Number(hourText);
  const hour12 = hour24 % 12 || 12;
  const period = hour24 >= 12 ? "م" : "ص";

  return `${hour12}:${minute} ${period}`;
}

function ActionButtons({ onSave, onCancel, disabled = false, saveLabel = "حفظ التغييرات" }) {
  return (
    <div className="grid gap-2 sm:grid-cols-2" dir="ltr">
      <button
        type="button"
        disabled={disabled}
        className={`${buttonClass} bg-gradient-to-l from-[#66d1cb] to-[#13b7e8] text-white`}
        onClick={onSave}
      >
        {saveLabel}
      </button>
      <button
        type="button"
        disabled={disabled}
        className={`${buttonClass} border border-[#16B9E7] text-[#16B9E7]`}
        onClick={onCancel}
      >
        إلغاء
      </button>
    </div>
  );
}
