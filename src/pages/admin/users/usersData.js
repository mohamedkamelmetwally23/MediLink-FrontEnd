export const userRoles = {
  doctor: "طبيب",
  receptionist: "موظف استقبال",
  patient: "مريض",
};

export const userStatuses = {
  active: "مفعل",
  inactive: "غير مفعل",
};

export const initialUsers = [
  {
    id: 1,
    firstName: "محمد",
    lastName: "حسن",
    phone: "01237652086",
    role: "patient",
    status: "active",
  },
  {
    id: 2,
    firstName: "مروة",
    lastName: "خالد",
    phone: "01237652086",
    role: "doctor",
    status: "active",
    specialty: "مخ وأعصاب",
    caseCount: 234,
    experience: 8,
    workDays: ["السبت", "الإثنين", "الأربعاء"],
    workStart: "09:00",
    workEnd: "15:00",
  },
  {
    id: 3,
    firstName: "نور",
    lastName: "باسم",
    phone: "01237652086",
    role: "receptionist",
    status: "active",
    education: "كلية آداب جامعة المنصورة",
    workDays: ["السبت", "الإثنين", "الأربعاء"],
    workStart: "09:00",
    workEnd: "15:00",
  },
  {
    id: 4,
    firstName: "علي",
    lastName: "يوسف",
    phone: "01237652086",
    role: "patient",
    status: "inactive",
  },
  {
    id: 5,
    firstName: "حمد",
    lastName: "شعبان",
    phone: "01237652086",
    role: "patient",
    status: "inactive",
  },
  {
    id: 6,
    firstName: "د.مروة",
    lastName: "خالد",
    phone: "01237652086",
    role: "doctor",
    status: "active",
    specialty: "أسنان",
    caseCount: 43,
    experience: 5,
    workDays: ["الأحد", "الثلاثاء", "الخميس"],
    workStart: "10:00",
    workEnd: "18:00",
  },
  {
    id: 7,
    firstName: "بسملة",
    lastName: "خالد",
    phone: "01237652086",
    role: "receptionist",
    status: "active",
    education: "معهد نظم معلومات",
    workDays: ["السبت", "الأحد", "الإثنين"],
    workStart: "15:00",
    workEnd: "21:00",
  },
  {
    id: 8,
    firstName: "د.ماهر",
    lastName: "طاهر علي",
    phone: "01237652086",
    role: "doctor",
    status: "active",
    specialty: "باطنة",
    caseCount: 87,
    experience: 10,
    workDays: ["السبت", "الإثنين", "الأربعاء"],
    workStart: "09:30",
    workEnd: "17:30",
  },
  {
    id: 9,
    firstName: "سلوى",
    lastName: "حمدي",
    phone: "01237652086",
    role: "patient",
    status: "inactive",
  },
  {
    id: 10,
    firstName: "د.أماني",
    lastName: "الظريف",
    phone: "01237652086",
    role: "doctor",
    status: "active",
    specialty: "جلدية",
    caseCount: 91,
    experience: 6,
    workDays: ["الثلاثاء", "الأربعاء", "الخميس"],
    workStart: "12:00",
    workEnd: "20:00",
  },
  {
    id: 11,
    firstName: "د.سارة",
    lastName: "هيثم",
    phone: "01237652086",
    role: "doctor",
    status: "active",
    specialty: "أطفال",
    caseCount: 134,
    experience: 7,
    workDays: ["السبت", "الإثنين", "الأربعاء"],
    workStart: "11:00",
    workEnd: "19:00",
  },
];

export const workDays = [
  "السبت",
  "الأحد",
  "الإثنين",
  "الثلاثاء",
  "الأربعاء",
  "الخميس",
];

export const timeOptions = Array.from({ length: 48 }, (_, index) => {
  const hour24 = Math.floor(index / 2);
  const minutes = index % 2 === 0 ? "00" : "30";

  const period = hour24 >= 12 ? "م" : "ص";
  const hour12 = hour24 % 12 || 12;

  return `${hour12}:${minutes} ${period}`;
});

export const specialties = [
  "مخ وأعصاب",
  "أسنان",
  "جلدية",
  "باطنة",
  "أطفال",
  "عيون",
];
