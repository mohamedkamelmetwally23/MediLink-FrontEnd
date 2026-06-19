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
    price: value.price ?? value.consultationFee ?? "",
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
    const createdSpecialty = await createSpecialization({
      name: normalizedName,
      price,
    });
    const nextSpecialty = toSpecialtyItem({
      ...createdSpecialty,
      name: createdSpecialty.name || normalizedName,
      price: createdSpecialty.price || price,
    });

    commitSpecialties((currentSpecialties) => [nextSpecialty, ...currentSpecialties]);
    return nextSpecialty;
  };

  const updateSpecialty = async (oldName, nextName, price = "") => {
    const normalizedName = normalizeSpecialtyName(nextName);
    const currentSpecialty = specialtyItems.find(
      (specialty) => specialty.name === oldName,
    );
    const updatedSpecialty = currentSpecialty?.id
      ? await updateSpecialization(currentSpecialty.id, {
          name: normalizedName,
          price,
        })
      : { ...currentSpecialty, name: normalizedName, price };
    const nextSpecialty = toSpecialtyItem({
      ...updatedSpecialty,
      id: updatedSpecialty.id || currentSpecialty?.id || "",
      name: updatedSpecialty.name || normalizedName,
      price: updatedSpecialty.price || price,
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
    return "يرجى إدخال بيانات صحيحة";
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
