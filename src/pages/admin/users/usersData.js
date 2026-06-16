export const userRoles = {
  doctor: "طبيب",
  receptionist: "موظف استقبال",
  patient: "مريض",
};

export const userStatuses = {
  active: "مفعل",
  inactive: "غير مفعل",
};

export const specialtyAliases = {
  أسنان: "الفم والأسنان",
  "فم وأسنان": "الفم والأسنان",
  "الفم والأسنان": "الفم والأسنان",
  باطنة: "أمراض الباطنة",
  "أمراض الباطنة": "أمراض الباطنة",
  أطفال: "الأطفال",
  الأطفال: "الأطفال",
  عيون: "طب العيون",
  "طب العيون": "طب العيون",
  جلدية: "جلدية وتجميل",
  "جلدية وتجميل": "جلدية وتجميل",
  "مخ وأعصاب": "مخ وأعصاب",
  "أنف وأذن": "أنف وأذن",
};

function foldArabicText(text = "") {
  return text
    .trim()
    .normalize("NFKC")
    .replace(/\u0640/g, "")
    .replace(/\p{M}/gu, "")
    .replace(/[\u0622\u0623\u0625\u0671]/g, "\u0627")
    .replace(/\u0649/g, "\u064A")
    .replace(/\s+/g, " ");
}

export function normalizeSpecialtyLabel(specialty = "") {
  const normalized = specialty.trim().replace(/\s+/g, " ");
  const folded = foldArabicText(normalized);
  const alias = Object.entries(specialtyAliases).find(
    ([aliasName]) => foldArabicText(aliasName) === folded,
  );

  return alias?.[1] || normalized;
}

export const workDays = [
  "السبت",
  "الأحد",
  "الإثنين",
  "الثلاثاء",
  "الأربعاء",
  "الخميس",
  "الجمعة",
];

export const timeOptions = Array.from({ length: 48 }, (_, index) => {
  const hour24 = Math.floor(index / 2);
  const minutes = index % 2 === 0 ? "00" : "30";

  return `${String(hour24).padStart(2, "0")}:${minutes}`;
});

