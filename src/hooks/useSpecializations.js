import { useEffect, useState } from "react";
import specialtyTooth from "../assets/landingPage/lets-icons_tooth-light.png";
import specialtyStomach from "../assets/landingPage/healthicons_stomach-outline.png";
import specialtyChild from "../assets/landingPage/hugeicons_kid.png";
import specialtySkin from "../assets/landingPage/streamline-ultimate_hair-skin.png";
import specialtyNose from "../assets/landingPage/healthicons_nose-outline.png";
import specialtyBrain from "../assets/landingPage/Vector.png";
import specialtyEye from "../assets/landingPage/vaadin_eye.png";
import {
  listSpecializations,
  listSpecializationsFromDoctors,
} from "../services/medilinkApi";
import { normalizeSearchText } from "../utils/searchText";

const specialtyCatalog = [
  { label: "الفم والأسنان", image: specialtyTooth, aliases: ["أسنان", "طب الأسنان"] },
  { label: "الباطنة", image: specialtyStomach, aliases: ["أمراض الباطنة"] },
  { label: "الأطفال", image: specialtyChild, aliases: ["طب الأطفال"] },
  { label: "الجلدية والتجميل", image: specialtySkin, aliases: ["الجلدية"] },
  { label: "أنف وأذن", image: specialtyNose, aliases: ["أنف وأذن وحنجرة"] },
  { label: "مخ وأعصاب", image: specialtyBrain, aliases: ["المخ والأعصاب"] },
  { label: "العيون", image: specialtyEye, aliases: ["طب العيون"] },
];

const specialtyImages = specialtyCatalog.map((specialty) => specialty.image);

function getCatalogIndex(name) {
  const normalizedName = normalizeSearchText(name);

  return specialtyCatalog.findIndex((specialty) =>
    [specialty.label, ...specialty.aliases].some(
      (alias) => normalizeSearchText(alias) === normalizedName,
    ),
  );
}

function withSpecialtyVisuals(items) {
  const uniqueItems = new Map();

  items.forEach((specialty) => {
    const name = specialty?.name?.trim();
    if (!name) return;

    const normalizedName = normalizeSearchText(name);
    if (!uniqueItems.has(normalizedName)) {
      uniqueItems.set(normalizedName, specialty);
    }
  });

  return Array.from(uniqueItems.values())
    .map((specialty, index) => {
      const catalogIndex = getCatalogIndex(specialty.name);

      return {
        ...specialty,
        image:
          catalogIndex >= 0
            ? specialtyCatalog[catalogIndex].image
            : specialtyImages[index % specialtyImages.length],
        order: catalogIndex >= 0 ? catalogIndex : specialtyCatalog.length + index,
      };
    })
    .sort((first, second) => first.order - second.order);
}

const fallbackSpecialties = specialtyCatalog.map((specialty, index) => ({
  id: specialty.label,
  name: specialty.label,
  image: specialty.image,
  order: index,
}));

export function useSpecializations() {
  const [specialties, setSpecialties] = useState(fallbackSpecialties);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    listSpecializations()
      .catch(() => listSpecializationsFromDoctors())
      .then((items) => {
        if (!mounted) return;

        const nextSpecialties = withSpecialtyVisuals(items);
        setSpecialties(
          nextSpecialties.length > 0 ? nextSpecialties : fallbackSpecialties,
        );
      })
      .catch((requestError) => {
        if (!mounted) return;
        setError(requestError.message || "تعذر تحميل التخصصات");
        setSpecialties(fallbackSpecialties);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  return { specialties, loading, error };
}
