import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import {
  getWorkingDayId,
  loadClinicInfo,
  updateClinicSchedule,
  updateClinicInfo,
  useClinicInfo,
} from "../../../services/clinicInfoStore";
import CustomSelect from "../../../components/admin/CustomSelect";
import { timeOptions } from "../users/usersData";

const tabs = [
  { id: "info", label: "معلومات العيادة" },
  { id: "hours", label: "أيام وساعات العمل" },
];

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

function buildWorkingDaysFromSchedule(scheduleDays = []) {
  const daysById = new Map(
    scheduleDays
      .map((day) => [getWorkingDayId(day.day), day])
      .filter(([id]) => id),
  );

  return initialWorkingDays.map((day) => {
    const scheduleDay = daysById.get(day.id);

    if (!scheduleDay) return day;

    return {
      ...day,
      active: Boolean(scheduleDay.isActive),
      from: scheduleDay.startTime || "",
      to: scheduleDay.endTime || "",
    };
  });
}

function buildAppointmentSettingsFromSchedule(schedule = {}) {
  return {
    duration: schedule.appointmentDuration ?? "",
    dailyLimit: schedule.maxAppointmentsPerDay ?? "",
  };
}

function getTimeMinutes(time) {
  if (!time) return null;

  const [hours = "0", minutes = "0"] = String(time).split(":");
  return Number(hours) * 60 + Number(minutes);
}

function getWorkingHoursErrors(days, appointmentSettings) {
  const errors = [];
  const activeDays = days.filter((day) => day.active);
  const duration = Number(appointmentSettings.duration);

  if (!Number.isFinite(duration) || duration <= 0) {
    errors.push("مدة الموعد مطلوبة");
  }

  if (activeDays.length === 0) {
    errors.push("اختار يوم عمل واحد على الأقل");
  }

  activeDays.forEach((day) => {
    const from = getTimeMinutes(day.from);
    const to = getTimeMinutes(day.to);

    if (from === null || to === null) {
      errors.push(`حدد وقت البداية والنهاية ليوم ${day.name}`);
      return;
    }

    if (to <= from) {
      errors.push(`وقت النهاية لازم يكون بعد وقت البداية في يوم ${day.name}`);
    }
  });

  return errors;
}

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
        setWorkingDays(buildWorkingDaysFromSchedule(info.schedule?.workingDays));
        setAppointmentSettings(
          buildAppointmentSettingsFromSchedule(info.schedule),
        );
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

    if (activeTab === "hours") {
      const scheduleErrors = getWorkingHoursErrors(
        workingDays,
        appointmentSettings,
      );

      if (scheduleErrors.length > 0) {
        toast.error(scheduleErrors[0]);
        return;
      }

      setClinicSaving(true);
      try {
        const updatedSchedule = await updateClinicSchedule(
          appointmentSettings,
          workingDays,
        );
        setWorkingDays(
          buildWorkingDaysFromSchedule(updatedSchedule.workingDays),
        );
        setAppointmentSettings(
          buildAppointmentSettingsFromSchedule(updatedSchedule),
        );
        setClinicInfo((current) => ({
          ...current,
          schedule: updatedSchedule,
        }));
        setLoadedClinicInfo((current) => ({
          ...current,
          schedule: updatedSchedule,
        }));
        toast.success("تم حفظ أيام وساعات العمل بنجاح");
      } catch (error) {
        toast.error(error.message || "تعذر حفظ أيام وساعات العمل");
      } finally {
        setClinicSaving(false);
      }
      return;
    }

    toast.success("تم حفظ التغييرات بنجاح");
  };

  const cancelChanges = () => {
    if (activeTab === "info") setClinicInfo(loadedClinicInfo);
    if (activeTab === "hours") {
      setWorkingDays(
        buildWorkingDaysFromSchedule(loadedClinicInfo.schedule?.workingDays),
      );
      setAppointmentSettings(
        buildAppointmentSettingsFromSchedule(loadedClinicInfo.schedule),
      );
    }
  };

  return (
    <section className="min-h-screen bg-[#fbfbfb] text-[#333] dark:bg-[#2f2f2f] dark:text-white">
      <ClinicHeader />

      <div className="bg-white px-4 dark:bg-[#3a3a3a] sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-[1070px] grid-cols-2 border-b border-gray-300 text-center text-base font-bold text-gray-400 dark:border-white/15">
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

        {activeTab === "hours" && (
          <WorkingHoursForm
            days={workingDays}
            onDaysChange={setWorkingDays}
            appointmentSettings={appointmentSettings}
            onAppointmentSettingsChange={setAppointmentSettings}
            onSave={saveChanges}
            onCancel={cancelChanges}
            saving={clinicSaving}
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
          تحكم في معلومات العيادة وساعات العمل وإعدادات المواعيد.
        </p>
      </div>
    </header>
  );
}

function ClinicInfoForm({
  values,
  onChange,
  onSave,
  onCancel,
  loading,
  saving,
}) {
  const setField = (field, value) => {
    onChange((current) => ({ ...current, [field]: value }));
  };

  return (
    <FormCard className="max-w-[700px] gap-6 rounded-2xl p-9">
      {loading && (
        <p className="text-center text-sm text-[#777] dark:text-[#CCC]">
          جاري تحميل بيانات العيادة...
        </p>
      )}
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

      <ActionButtons
        onSave={onSave}
        onCancel={onCancel}
        disabled={loading || saving}
        saveLabel={saving ? "جاري الحفظ..." : "حفظ التغييرات"}
      />
    </FormCard>
  );
}

function WorkingHoursForm({
  days,
  onDaysChange,
  appointmentSettings,
  onAppointmentSettingsChange,
  onSave,
  onCancel,
  saving = false,
}) {
  const errors = getWorkingHoursErrors(days, appointmentSettings);
  const canSave = !saving && errors.length === 0;

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

        <div className="grid gap-3 border-t border-gray-200 pt-5 dark:border-white/10">
          <WorkSettingField
            label="مدة الموعد"
            unit="دقيقة"
            value={appointmentSettings.duration}
            onChange={(event) =>
              setAppointmentField("duration", event.target.value)
            }
          />
          {errors.length > 0 && (
            <p className="text-right text-sm font-semibold text-red-500">
              {errors[0]}
            </p>
          )}
        </div>

        <ActionButtons
          onSave={onSave}
          onCancel={onCancel}
          disabled={!canSave}
          saveLabel={saving ? "جاري الحفظ..." : "حفظ التغييرات"}
        />
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
  const options = [
    { value: "", label: "---" },
    ...timeOptions.map((time) => ({
      value: time,
      label: formatClinicTime(time),
    })),
  ];

  return (
    <div className="w-[148px]">
      <CustomSelect
        value={disabled ? "" : value}
        options={options}
        onChange={(nextValue) => onChange?.({ target: { value: nextValue } })}
        disabled={disabled}
        className="w-full"
        buttonClassName="flex h-10 w-full items-center gap-2 rounded-xl border border-white/10 bg-white/70 px-3 text-sm font-semibold text-[#333] shadow-sm outline-none transition hover:border-[#16B9E7]/60 focus-visible:border-[#16B9E7] focus-visible:ring-2 focus-visible:ring-[#16B9E7]/20 disabled:cursor-not-allowed disabled:bg-transparent disabled:opacity-60 dark:bg-[#505050] dark:text-white"
        menuClassName="rounded-xl border-white/10 p-1.5 shadow-[0_18px_45px_rgba(0,0,0,0.22)]"
      />
    </div>
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

function ActionButtons({
  onSave,
  onCancel,
  disabled = false,
  saveLabel = "حفظ التغييرات",
}) {
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
