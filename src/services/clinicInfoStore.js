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
    appointmentDuration: "30",
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

function findClinicInfo(response, visited = new WeakSet()) {
  if (!response || typeof response !== "object" || visited.has(response)) {
    return {};
  }

  visited.add(response);

  if (
    ["address", "phone", "email", "name", "description"].some(
      (key) => key in response,
    )
  ) {
    return response;
  }

  for (const value of Object.values(response)) {
    const clinicInfo = findClinicInfo(value, visited);
    if (Object.keys(clinicInfo).length > 0) return clinicInfo;
  }

  return {};
}

function normalizeClinicInfo(response) {
  const data = findClinicInfo(response);
  const schedule = data.schedule || {};

  return {
    name: data.name || data.clinicName || "",
    address: data.address || data.location || "",
    description: data.description || data.about || "",
    phone: data.phone || data.phoneNumber || data.mobile || "",
    email: data.email || data.clinicEmail || "",
    schedule: {
      appointmentDuration:
        schedule.appointmentDuration ??
        schedule.duration ??
        schedule.appointmentDurationInMinutes ??
        "",
      maxAppointmentsPerDay:
        schedule.maxAppointmentsPerDay ?? schedule.dailyLimit ?? "",
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
    appointmentDuration:
      data.appointmentDuration ??
      data.duration ??
      data.appointmentDurationInMinutes ??
      "",
    maxAppointmentsPerDay: data.maxAppointmentsPerDay ?? data.dailyLimit ?? "",
    workingDays: Array.isArray(data.workingDays) ? data.workingDays : [],
  };
}

export async function loadClinicInfo() {
  const currentInfo = readClinicInfo();
  const [response, scheduleResponse] = await Promise.all([
    apiRequest("/clinic/informations"),
    apiRequest("/clinic/schedule").catch(() => null),
  ]);

  const backendInfo = normalizeClinicInfo(response);
  const backendSchedule = scheduleResponse
    ? normalizeSchedule(scheduleResponse)
    : {};
  const info = {
    ...defaultClinicInfo,
    ...currentInfo,
    ...Object.fromEntries(
      Object.entries(backendInfo).filter(
        ([key, value]) => key === "schedule" || value !== "",
      ),
    ),
    schedule: {
      ...defaultClinicInfo.schedule,
      ...currentInfo.schedule,
      ...backendInfo.schedule,
      ...backendSchedule,
    },
  };

  saveClinicInfo(info);
  return info;
}

export async function updateClinicInfo(info) {
  const currentInfo = readClinicInfo();
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
    ...currentInfo,
    ...normalizeClinicInfo(response),
    ...payload,
    schedule: currentInfo.schedule,
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
    let mounted = true;

    loadClinicInfo()
      .then((info) => {
        if (mounted) setClinicInfo(info);
      })
      .catch(() => null);

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
      mounted = false;
      window.removeEventListener("medilink-clinic-info-change", handleChange);
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  return clinicInfo;
}
