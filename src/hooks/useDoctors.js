import { useCallback, useEffect, useState } from "react";
import { API_ORIGIN } from "../services/apiClient";
import { listDoctors } from "../services/medilinkApi";
import defaultDoctorAvatar from "../assets/patient departement/default-patient-avatar.svg";

function resolveImageUrl(image) {
  if (!image || typeof image !== "string") return "";
  if (/^(https?:|data:|blob:)/i.test(image)) return image;
  return `${API_ORIGIN.replace(/\/$/, "")}/${image.replace(/^\/+/, "")}`;
}

export function getDoctorName(doctor) {
  const name = [doctor.firstName, doctor.lastName].filter(Boolean).join(" ").trim();
  return name ? `د. ${name.replace(/^د\.\s*/, "")}` : "طبيب ميديلينك";
}

export function getDoctorImage(doctor) {
  return resolveImageUrl(doctor.image || doctor.photo) || defaultDoctorAvatar;
}

export { defaultDoctorAvatar };

export function getDoctorRating(doctor) {
  const rating = Number(
    doctor.ratingsAverage ??
      doctor.rating ??
      doctor.raw?.ratingsAverage ??
      doctor.raw?.doctorProfile?.ratingsAverage ??
      0,
  );

  return Number.isFinite(rating) ? Math.max(0, Math.min(5, rating)) : 0;
}

export function useDoctors() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDoctors = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const result = await listDoctors();
      setDoctors(result);
    } catch (requestError) {
      setError(requestError.message || "تعذر تحميل بيانات الأطباء");
      setDoctors([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    listDoctors()
      .then((result) => {
        if (mounted) setDoctors(result);
      })
      .catch((requestError) => {
        if (mounted) {
          setError(requestError.message || "تعذر تحميل بيانات الأطباء");
          setDoctors([]);
        }
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  return { doctors, loading, error, reload: loadDoctors };
}
