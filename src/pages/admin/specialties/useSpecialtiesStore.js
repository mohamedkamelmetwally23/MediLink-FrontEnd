import { useState } from "react";
import { specialties as initialSpecialties } from "../users/usersData";

const STORAGE_KEY = "medilink-admin-specialties";

function normalizeSpecialtyName(name) {
  return name.trim().replace(/\s+/g, " ");
}

function loadSpecialties() {
  try {
    const savedSpecialties = localStorage.getItem(STORAGE_KEY);
    if (!savedSpecialties) {
      return initialSpecialties;
    }

    return JSON.parse(savedSpecialties);
  } catch {
    return initialSpecialties;
  }
}

function persistSpecialties(nextSpecialties) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(nextSpecialties));
}

export function useSpecialtiesStore() {
  const [specialties, setSpecialties] = useState(loadSpecialties);

  const commitSpecialties = (getNextSpecialties) => {
    setSpecialties((currentSpecialties) => {
      const nextSpecialties = getNextSpecialties(currentSpecialties);
      persistSpecialties(nextSpecialties);
      return nextSpecialties;
    });
  };

  const addSpecialty = (name) => {
    const normalizedName = normalizeSpecialtyName(name);
    commitSpecialties((currentSpecialties) => [normalizedName, ...currentSpecialties]);
  };

  const updateSpecialty = (oldName, nextName) => {
    const normalizedName = normalizeSpecialtyName(nextName);
    commitSpecialties((currentSpecialties) =>
      currentSpecialties.map((specialty) =>
        specialty === oldName ? normalizedName : specialty,
      ),
    );
  };

  const deleteSpecialties = (names) => {
    const namesSet = new Set(names);
    commitSpecialties((currentSpecialties) =>
      currentSpecialties.filter((specialty) => !namesSet.has(specialty)),
    );
  };

  return {
    specialties,
    addSpecialty,
    updateSpecialty,
    deleteSpecialties,
  };
}

export function validateSpecialtyName(name, specialties, currentName = "") {
  const normalizedName = normalizeSpecialtyName(name);

  if (!normalizedName) {
    return "اسم التخصص مطلوب";
  }

  if (normalizedName.length < 2) {
    return "اسم التخصص يجب أن يكون حرفين على الأقل";
  }

  const duplicate = specialties.some(
    (specialty) => specialty !== currentName && specialty === normalizedName,
  );

  if (duplicate) {
    return "هذا التخصص موجود بالفعل";
  }

  return "";
}
