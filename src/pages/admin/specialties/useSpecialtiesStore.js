import { useEffect, useMemo, useState } from "react";
import {
  createSpecialization,
  deleteSpecialization,
  listSpecializations,
  listSpecializationsFromDoctors,
  updateSpecialization,
} from "../../../services/medilinkApi";
import { normalizeSpecialtyLabel } from "../users/usersData";

function normalizeSpecialtyName(name) {
  return normalizeSpecialtyLabel(name);
}

function normalizeSpecialtyPrice(price) {
  return String(price ?? "").replace(/[^\d]/g, "");
}

const specialtyNameMaxLength = 50;
const specialtyNamePattern = /^[\u0600-\u06FF\s/&\u060C-]+$/;

function toSpecialtyItem(value) {
  if (typeof value === "string") {
    return {
      id: "",
      name: normalizeSpecialtyName(value),
      price: "",
    };
  }

    return {
      id: value.id || value._id || "",
      name: normalizeSpecialtyName(value.name || ""),
      price: normalizeSpecialtyPrice(value.price ?? value.consultationFee ?? ""),
    };
  }

function normalizeSpecialtyItems(items) {
  const itemMap = new Map();

  items.map(toSpecialtyItem).forEach((item) => {
    if (!item.name) return;
    itemMap.set(item.name, item);
  });

  return Array.from(itemMap.values());
}

export function useSpecialtiesStore() {
  const [specialtyItems, setSpecialtyItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const specialties = useMemo(
    () => specialtyItems.map((specialty) => specialty.name),
    [specialtyItems],
  );

  const commitSpecialties = (getNextSpecialties) => {
    setSpecialtyItems((currentSpecialties) => {
      const nextSpecialties = getNextSpecialties(currentSpecialties);
      return nextSpecialties;
    });
  };

  const refreshSpecialties = async () => {
    setLoading(true);
    setError("");

    try {
      const fetchedSpecialties = await listSpecializations().catch(() =>
        listSpecializationsFromDoctors(),
      );

      commitSpecialties(() => normalizeSpecialtyItems(fetchedSpecialties));
    } catch (requestError) {
      setError(requestError.message || "");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;

    listSpecializations()
      .catch(() => listSpecializationsFromDoctors())
      .then((fetchedSpecialties) => {
        if (!mounted) return;
        commitSpecialties(() => normalizeSpecialtyItems(fetchedSpecialties));
      })
      .catch((requestError) => {
        if (mounted) {
          setError(requestError.message || "");
        }
      })
      .finally(() => {
        if (mounted) {
          setLoading(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

  const addSpecialty = async (name, price = "") => {
    const normalizedName = normalizeSpecialtyName(name);
    const normalizedPrice = normalizeSpecialtyPrice(price);
    const createdSpecialty = await createSpecialization({
      name: normalizedName,
      price: normalizedPrice,
    });
    const nextSpecialty = toSpecialtyItem({
      ...createdSpecialty,
      name: createdSpecialty.name || normalizedName,
      price: createdSpecialty.price || normalizedPrice,
    });

    commitSpecialties((currentSpecialties) => [nextSpecialty, ...currentSpecialties]);
    return nextSpecialty;
  };

  const updateSpecialty = async (oldName, nextName, price = "") => {
    const normalizedName = normalizeSpecialtyName(nextName);
    const normalizedPrice = normalizeSpecialtyPrice(price);
    const currentSpecialty = specialtyItems.find(
      (specialty) => specialty.name === oldName,
    );
    const updatedSpecialty = currentSpecialty?.id
      ? await updateSpecialization(currentSpecialty.id, {
          name: normalizedName,
          price: normalizedPrice,
        })
      : { ...currentSpecialty, name: normalizedName, price: normalizedPrice };
    const nextSpecialty = toSpecialtyItem({
      ...updatedSpecialty,
      id: updatedSpecialty.id || currentSpecialty?.id || "",
      name: updatedSpecialty.name || normalizedName,
      price: updatedSpecialty.price || normalizedPrice,
    });

    commitSpecialties((currentSpecialties) =>
      currentSpecialties.map((specialty) =>
        specialty.name === oldName ? nextSpecialty : specialty,
      ),
    );

    return nextSpecialty;
  };

  const deleteSpecialties = async (names) => {
    const namesSet = new Set(names);
    const targetSpecialties = specialtyItems.filter((specialty) =>
      namesSet.has(specialty.name),
    );

    await Promise.all(
      targetSpecialties.map((specialty) => deleteSpecialization(specialty)),
    );

    commitSpecialties((currentSpecialties) =>
      currentSpecialties.filter((specialty) => !namesSet.has(specialty.name)),
    );
  };

  const getSpecialtyId = (name) =>
    specialtyItems.find((specialty) => specialty.name === name)?.id || "";

  const getSpecialtyPrice = (name) =>
    specialtyItems.find((specialty) => specialty.name === name)?.price || "";

  return {
    specialties,
    specialtyItems,
    loading,
    error,
    refreshSpecialties,
    addSpecialty,
    updateSpecialty,
    deleteSpecialties,
    getSpecialtyId,
    getSpecialtyPrice,
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

  if (normalizedName.length > specialtyNameMaxLength) {
    return `\u0627\u0633\u0645 \u0627\u0644\u062a\u062e\u0635\u0635 \u0644\u0627 \u064a\u0632\u064a\u062f \u0639\u0646 ${specialtyNameMaxLength} \u062d\u0631\u0641`;
  }

  if (!specialtyNamePattern.test(normalizedName)) {
    return "\u0627\u0633\u0645 \u0627\u0644\u062a\u062e\u0635\u0635 \u064a\u062c\u0628 \u0623\u0646 \u064a\u0643\u0648\u0646 \u0628\u0627\u0644\u0644\u063a\u0629 \u0627\u0644\u0639\u0631\u0628\u064a\u0629";
  }

  const duplicate = specialties.some(
    (specialty) => specialty !== currentName && specialty === normalizedName,
  );

  if (duplicate) {
    return "هذا التخصص موجود بالفعل";
  }

  return "";
}
