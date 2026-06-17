import { useEffect, useState } from "react";

export const clinicInfoStorageKey = "medilink-clinic-info";

export const defaultClinicInfo = {
  name: "",
  address: "القاهرة، مصر",
  description: "",
  phone: "015 5677 3899",
  email: "info@medilink.com",
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
