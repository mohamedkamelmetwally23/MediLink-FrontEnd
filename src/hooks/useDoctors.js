import { useCallback, useEffect, useState } from "react";
import { API_ORIGIN } from "../services/apiClient";
import { listDoctors } from "../services/medilinkApi";
import image1 from "../assets/landingPage/12 1.png";
import image2 from "../assets/landingPage/12 1 (1).png";
import image3 from "../assets/landingPage/12 1 (2).png";
import image4 from "../assets/landingPage/12 1 (3).png";
import image5 from "../assets/landingPage/12 1 (4).png";
import image6 from "../assets/landingPage/12 1 (5).png";

const fallbackImages = [image1, image2, image3, image4, image5, image6];

function resolveImageUrl(image) {
  if (!image || typeof image !== "string") return "";
  if (/^(https?:|data:|blob:)/i.test(image)) return image;
  return `${API_ORIGIN.replace(/\/$/, "")}/${image.replace(/^\/+/, "")}`;
}

export function getDoctorName(doctor) {
  const name = [doctor.firstName, doctor.lastName].filter(Boolean).join(" ").trim();
  return name ? `د. ${name.replace(/^د\.\s*/, "")}` : "طبيب ميديلينك";
}

export function getDoctorImage(doctor, index = 0) {
  return resolveImageUrl(doctor.image) || fallbackImages[index % fallbackImages.length];
}

export function getDoctorRating(doctor) {
  const rating = Number(doctor.rating);
  return rating > 0 ? Math.min(5, rating) : 4.5;
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
