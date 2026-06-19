import { useEffect, useState } from "react";
import { ApiError, apiRequest } from "./apiClient";

export const clinicInfoStorageKey = "medilink-clinic-info";

export const defaultClinicInfo = {
  name: "",
  address: "القاهرة، مصر",
  description: "",
  phone: "015 5677 3899",
  email: "info@medilink.com",
  schedule: {
    appointmentDuration: "",
    maxAppointmentsPerDay: "",
    workingDays: [],
  },
};

const backendWorkingDayNames = {
  sat: "السبت",
  sun: "الاحد",
  mon: "الاثنين",
  tue: "الثلاثاء",
  wed: "الاربعاء",
  thu: "الخميس",
  fri: "الجمعة",
};

const workingDayAliases = {
  السبت: "sat",
  الاحد: "sun",
  الأحد: "sun",
  الاثنين: "mon",
  الإثنين: "mon",
  الثلاثاء: "tue",
  الاربعاء: "wed",
  الأربعاء: "wed",
  الخميس: "thu",
  الجمعة: "fri",
  الجمعه: "fri",
};

function readClinicInfo() {
  if (typeof localStorage === "undefined") return defaultClinicInfo;

  try {
    return {
      ...defaultClinicInfo,
      ...JSON.parse(localStorage.getItem(clinicInfoStorageKey) || "{}"),
    };
  } catch {
    return defaultClinicInfo;
  }
}

export function saveClinicInfo(info) {
  if (typeof localStorage === "undefined") return;

  const nextInfo = {
    ...defaultClinicInfo,
    ...info,
  };

  localStorage.setItem(clinicInfoStorageKey, JSON.stringify(nextInfo));
  window.dispatchEvent(
    new CustomEvent("medilink-clinic-info-change", { detail: nextInfo }),
  );
}

function normalizeClinicInfo(response) {
  const data = response?.data?.clinic || response?.data?.information || response?.data || response?.clinic || response?.information || response || {};
  const schedule = data.schedule || response?.data?.schedule || response?.schedule || {};

  return {
    name: data.name || "",
    address: data.address || "",
    description: data.description || "",
    phone: data.phone || "",
    email: data.email || "",
    schedule: {
      appointmentDuration: schedule.appointmentDuration ?? "",
      maxAppointmentsPerDay: schedule.maxAppointmentsPerDay ?? "",
      workingDays: Array.isArray(schedule.workingDays)
        ? schedule.workingDays
        : [],
    },
  };
}

function normalizeSchedule(response) {
  const data =
    response?.data?.clinic?.schedule ||
    response?.data?.schedule ||
    response?.schedule ||
    response?.data ||
    response ||
    {};

  return {
    appointmentDuration: data.appointmentDuration ?? "",
    maxAppointmentsPerDay: data.maxAppointmentsPerDay ?? "",
    workingDays: Array.isArray(data.workingDays) ? data.workingDays : [],
  };
}

export async function loadClinicInfo() {
  const response = await apiRequest("/clinic/informations");
  const info = {
    ...defaultClinicInfo,
    ...normalizeClinicInfo(response),
  };

  saveClinicInfo(info);
  return info;
}

export async function updateClinicInfo(info) {
  const payload = {
    name: info.name?.trim(),
    address: info.address?.trim(),
    description: info.description?.trim(),
    phone: info.phone?.trim(),
    email: info.email?.trim(),
  };
  let response;

  try {
    response = await apiRequest("/clinic/informations", {
      method: "PATCH",
      body: payload,
    });
  } catch (error) {
    if (!(error instanceof ApiError) || ![404, 405].includes(error.status)) throw error;

    response = await apiRequest("/clinic/informations", {
      method: "PUT",
      body: payload,
    });
  }

  const updatedInfo = {
    ...payload,
    ...normalizeClinicInfo(response),
  };
  saveClinicInfo(updatedInfo);
  return updatedInfo;
}

export function getWorkingDayId(dayName) {
  return workingDayAliases[String(dayName || "").trim()] || "";
}

export function getBackendWorkingDayName(dayId) {
  return backendWorkingDayNames[dayId] || String(dayId || "");
}

export async function updateClinicSchedule(appointmentSettings, workingDays) {
  const payload = {
    appointmentDuration: Number(appointmentSettings.duration || 0),
    maxAppointmentsPerDay:
      appointmentSettings.dailyLimit === ""
        ? undefined
        : Number(appointmentSettings.dailyLimit),
    workingDays: workingDays.map((day) => ({
      day: getBackendWorkingDayName(day.id),
      isActive: Boolean(day.active),
      startTime: day.active ? day.from : "",
      endTime: day.active ? day.to : "",
    })),
  };

  const response = await apiRequest("/clinic/schedule", {
    method: "PATCH",
    body: payload,
  });
  const currentInfo = readClinicInfo();
  const nextInfo = {
    ...currentInfo,
    schedule: normalizeSchedule(response),
  };

  saveClinicInfo(nextInfo);
  return nextInfo.schedule;
}

export function useClinicInfo() {
  const [clinicInfo, setClinicInfo] = useState(readClinicInfo);

  useEffect(() => {
    const handleChange = (event) => {
      setClinicInfo(event.detail || readClinicInfo());
    };
    const handleStorage = (event) => {
      if (event.key === clinicInfoStorageKey) {
        setClinicInfo(readClinicInfo());
      }
    };

    window.addEventListener("medilink-clinic-info-change", handleChange);
    window.addEventListener("storage", handleStorage);

    return () => {
      window.removeEventListener("medilink-clinic-info-change", handleChange);
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  return clinicInfo;
}
