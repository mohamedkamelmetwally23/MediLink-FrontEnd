import { ApiError, apiRequest } from "./apiClient";

const arabicWeekDays = {
  saturday: "\u0627\u0644\u0633\u0628\u062A",
  sunday: "\u0627\u0644\u0623\u062D\u062F",
  monday: "\u0627\u0644\u0625\u062B\u0646\u064A\u0646",
  tuesday: "\u0627\u0644\u062B\u0644\u0627\u062B\u0627\u0621",
  wednesday: "\u0627\u0644\u0623\u0631\u0628\u0639\u0627\u0621",
  thursday: "\u0627\u0644\u062E\u0645\u064A\u0633",
  friday: "\u0627\u0644\u062C\u0645\u0639\u0629",
};

const englishWeekDays = Object.fromEntries(
  Object.entries(arabicWeekDays).map(([english, arabic]) => [arabic, english]),
);

function unwrapData(response) {
  return response?.data ?? response ?? {};
}

function findArray(response, keys) {
  const roots = [response, unwrapData(response)];

  for (const root of roots) {
    if (Array.isArray(root)) return root;

    for (const key of keys) {
      if (Array.isArray(root?.[key])) return root[key];
    }
  }

  return [];
}

function findEntity(response, keys) {
  const roots = [response, unwrapData(response)];

  for (const root of roots) {
    if (!root || Array.isArray(root) || typeof root !== "object") continue;

    for (const key of keys) {
      if (root[key] && typeof root[key] === "object") return root[key];
    }
  }

  return unwrapData(response);
}

function getId(value) {
  return value?._id || value?.id || value?.user?._id || "";
}

function compactObject(value) {
  return Object.fromEntries(
    Object.entries(value).filter(([, item]) => {
      if (item === undefined || item === null) return false;
      if (typeof item === "string" && item.trim() === "") return false;
      if (Array.isArray(item) && item.length === 0) return false;
      return true;
    }),
  );
}

function normalizeStatus(value) {
  if (
    value === false ||
    value === 0 ||
    value === "inactive" ||
    value === "disabled" ||
    value === "blocked"
  ) {
    return "inactive";
  }

  return "active";
}

function normalizeNumber(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function joinName(value) {
  if (!value) return "";
  if (typeof value === "string") return value;

  return [value.firstName, value.lastName].filter(Boolean).join(" ").trim();
}

function splitName(name = "") {
  const [firstName = "", ...rest] = String(name).trim().split(/\s+/);
  return {
    firstName,
    lastName: rest.join(" "),
  };
}

export function normalizeWorkingDays(days = []) {
  return days.map((day) => arabicWeekDays[String(day).toLowerCase()] || day);
}

export function serializeWorkingDays(days = []) {
  return days.map((day) => englishWeekDays[day] || String(day).toLowerCase());
}

function normalizeTime(value) {
  if (!value) return "";

  const text = String(value).trim();
  const timeMatch = /^(\d{1,2}):(\d{2})$/.exec(text);

  if (timeMatch) {
    return `${String(Number(timeMatch[1])).padStart(2, "0")}:${timeMatch[2]}`;
  }

  const period = text.includes("\u0645") ? "pm" : text.includes("\u0635") ? "am" : "";
  const localizedMatch = /^(\d{1,2}):(\d{2})/.exec(text);

  if (!localizedMatch) return text;

  let hour = Number(localizedMatch[1]);
  const minute = localizedMatch[2];

  if (period === "pm" && hour < 12) hour += 12;
  if (period === "am" && hour === 12) hour = 0;

  return `${String(hour).padStart(2, "0")}:${minute}`;
}

function normalizeDate(value) {
  if (!value) return "";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);

  return date.toISOString().slice(0, 10);
}

function getBirthDatePayload(values, includeDefault = false) {
  if (values.birthDate) return values.birthDate;
  if (values.dateOfBirth) return values.dateOfBirth;
  if (values.year && values.month && values.day) {
    return `${values.year}-${String(values.month).padStart(2, "0")}-${String(
      values.day,
    ).padStart(2, "0")}`;
  }

  return includeDefault ? "1990-01-01" : "";
}

export function normalizeSpecialization(item = {}) {
  const raw = typeof item === "string" ? { name: item } : item;

  return {
    id: getId(raw),
    name: raw.name || raw.specializationName || raw.title || "",
    price:
      raw.consultationFee ??
      raw.price ??
      raw.fee ??
      raw.examinationPrice ??
      "",
    raw,
  };
}

export function normalizeDoctor(item = {}) {
  const user = item.user || item.account || item;
  const specialization =
    item.specialization || item.speciality || item.specialty || item.specializationId;
  const normalizedSpecialization =
    typeof specialization === "object"
      ? normalizeSpecialization(specialization)
      : { id: specialization || "", name: item.specializationName || item.specialty || "" };

  return {
    id: getId(item),
    userId: getId(user),
    firstName: user.firstName || item.firstName || splitName(item.name).firstName,
    lastName: user.lastName || item.lastName || splitName(item.name).lastName,
    gender: user.gender || item.gender || "male",
    birthDate: user.birthDate || item.birthDate || "",
    phone: user.phone || item.phone || "",
    role: "doctor",
    status: normalizeStatus(item.status ?? user.status ?? item.isActive ?? user.isActive),
    specialty: normalizedSpecialization.name,
    specializationId: normalizedSpecialization.id,
    consultationFee: normalizedSpecialization.price,
    experience: item.experienceYears ?? item.experience ?? "",
    experienceYears: item.experienceYears ?? item.experience ?? "",
    workDays: normalizeWorkingDays(item.workingDays || item.workDays || []),
    workingDays: item.workingDays || serializeWorkingDays(item.workDays || []),
    workStart: normalizeTime(item.startTime || item.workStart || ""),
    workEnd: normalizeTime(item.endTime || item.workEnd || ""),
    appointmentsCount:
      item.appointmentsCount ?? item.caseCount ?? item.casesCount ?? item.appointments?.length ?? 0,
    raw: item,
  };
}

export function normalizeReceptionist(item = {}) {
  const user = item.user || item.account || item;

  return {
    id: getId(item),
    userId: getId(user),
    firstName: user.firstName || item.firstName || splitName(item.name).firstName,
    lastName: user.lastName || item.lastName || splitName(item.name).lastName,
    gender: user.gender || item.gender || "male",
    birthDate: user.birthDate || item.birthDate || "",
    phone: user.phone || item.phone || "",
    role: "receptionist",
    status: normalizeStatus(item.status ?? user.status ?? item.isActive ?? user.isActive),
    education: item.education || item.qualification || "",
    workDays: normalizeWorkingDays(item.workingDays || item.workDays || []),
    workingDays: item.workingDays || serializeWorkingDays(item.workDays || []),
    workStart: normalizeTime(item.startTime || item.workStart || ""),
    workEnd: normalizeTime(item.endTime || item.workEnd || ""),
    raw: item,
  };
}

export function normalizePatient(item = {}) {
  const user = item.user || item.account || item;
  const name = item.name || joinName(user) || joinName(item);
  const nameParts = splitName(name);

  return {
    id: getId(item),
    userId: getId(user),
    firstName: user.firstName || item.firstName || nameParts.firstName,
    lastName: user.lastName || item.lastName || nameParts.lastName,
    name,
    gender: user.gender || item.gender || "",
    birthDate: user.birthDate || item.birthDate || "",
    phone: user.phone || item.phone || "",
    role: "patient",
    status: normalizeStatus(item.status ?? user.status ?? item.isActive ?? user.isActive),
    casesCount:
      item.casesCount ??
      item.caseCount ??
      item.appointmentsCount ??
      item.appointments?.length ??
      0,
    appointmentsCount: item.appointmentsCount ?? item.appointments?.length ?? 0,
    registrationDate: normalizeDate(item.createdAt || user.createdAt || ""),
    raw: item,
  };
}

export function normalizeAppointment(item = {}) {
  const patient = item.patient || item.patientId || item.user || {};
  const doctor = item.doctor || item.doctorId || {};
  const specialization =
    item.specialization || item.specialty || doctor.specialization || {};
  const date =
    item.date ||
    item.appointmentDate ||
    item.day ||
    item.startDate ||
    item.createdAt ||
    "";
  const time = normalizeTime(item.time || item.appointmentTime || item.startTime || "");

  return {
    id: getId(item),
    patientId: getId(patient),
    doctorId: getId(doctor),
    patient: joinName(patient) || item.patientName || item.name || "",
    doctor: joinName(doctor) || item.doctorName || "",
    specialty:
      (typeof specialization === "object" ? specialization.name : specialization) || "",
    phone: patient.phone || item.phone || "",
    date: normalizeDate(date),
    time,
    status: normalizeAppointmentStatus(item.status || item.bookingStatus),
    payment: normalizePaymentStatus(item.payment || item.paymentStatus),
    raw: item,
  };
}

function normalizeAppointmentStatus(status = "") {
  const value = String(status).toLowerCase();

  if (["completed", "done", "finished"].includes(value)) return "completed";
  if (["cancelled", "canceled", "rejected"].includes(value)) return "cancelled";
  if (["pending", "waiting", "reserved"].includes(value)) return "pending";
  return "confirmed";
}

function normalizePaymentStatus(status = "") {
  const value = String(status).toLowerCase();

  if (["refunded", "refund"].includes(value)) return "refunded";
  if (["unpaid", "failed"].includes(value)) return "unpaid";
  if (["waiting", "pending"].includes(value)) return "waiting";
  return "paid";
}

function doctorPayload(values, mode = "create") {
  const payload = {
    firstName: values.firstName?.trim(),
    lastName: values.lastName?.trim(),
    gender: values.gender,
    phone: values.phone?.trim(),
    birthDate: getBirthDatePayload(values, mode === "create"),
    role: "doctor",
    specialization: values.specializationId || values.specialtyId || values.specialty,
    experienceYears: normalizeNumber(values.experience ?? values.experienceYears, 0),
    workingDays: serializeWorkingDays(values.workDays || values.workingDays || []),
    startTime: normalizeTime(values.workStart || values.startTime),
    endTime: normalizeTime(values.workEnd || values.endTime),
    password: values.password,
    confirmPassword: values.confirmPassword,
    confirmpassword: values.confirmPassword,
  };

  if (mode === "edit" && !payload.password) {
    delete payload.password;
    delete payload.confirmPassword;
    delete payload.confirmpassword;
  }

  return compactObject(payload);
}

function receptionistPayload(values, mode = "create") {
  const payload = {
    firstName: values.firstName?.trim(),
    lastName: values.lastName?.trim(),
    gender: values.gender,
    phone: values.phone?.trim(),
    birthDate: getBirthDatePayload(values),
    role: "receptionist",
    education: values.education,
    workingDays: serializeWorkingDays(values.workDays || values.workingDays || []),
    startTime: normalizeTime(values.workStart || values.startTime),
    endTime: normalizeTime(values.workEnd || values.endTime),
    password: values.password,
    confirmPassword: values.confirmPassword,
    confirmpassword: values.confirmPassword,
  };

  if (mode === "edit" && !payload.password) {
    delete payload.password;
    delete payload.confirmPassword;
    delete payload.confirmpassword;
  }

  return compactObject(payload);
}

function patientPayload(values) {
  return compactObject({
    firstName: values.firstName?.trim(),
    lastName: values.lastName?.trim(),
    gender: values.gender,
    phone: values.phone?.trim(),
    birthDate: getBirthDatePayload(values),
    role: "patient",
    status: values.status,
    isActive: values.status ? values.status === "active" : undefined,
  });
}

export async function listDoctors() {
  const response = await apiRequest("/doctors");
  return findArray(response, ["doctors", "doctor"]).map(normalizeDoctor);
}

export async function getDoctor(id) {
  const response = await apiRequest(`/doctors/${id}`);
  return normalizeDoctor(findEntity(response, ["doctor"]));
}

export async function createDoctor(values) {
  const response = await apiRequest("/doctors", {
    method: "POST",
    body: doctorPayload(values, "create"),
  });
  return normalizeDoctor(findEntity(response, ["doctor"]));
}

export async function updateDoctor(id, values) {
  const response = await apiRequest(`/doctors/${id}`, {
    method: "PATCH",
    body: doctorPayload(values, "edit"),
  });
  return normalizeDoctor(findEntity(response, ["doctor"]));
}

export async function deleteDoctor(id) {
  return apiRequest(`/doctors/${id}`, { method: "DELETE" });
}

export async function listSpecializations() {
  const response = await apiRequest("/specializations");
  return findArray(response, [
    "specializations",
    "specialization",
    "specialties",
    "specialty",
  ]).map(normalizeSpecialization);
}

export async function listSpecializationsFromDoctors() {
  const doctors = await listDoctors();
  const byName = new Map();

  doctors.forEach((doctor) => {
    if (!doctor.specialty) return;
    byName.set(doctor.specialty, {
      id: doctor.specializationId,
      name: doctor.specialty,
      price: doctor.consultationFee,
    });
  });

  return Array.from(byName.values()).map(normalizeSpecialization);
}

export async function createSpecialization(values) {
  const response = await apiRequest("/specializations", {
    method: "POST",
    body: compactObject({
      name: values.name,
      consultationFee: normalizeNumber(values.price, 0),
    }),
  });

  return normalizeSpecialization(findEntity(response, ["specialization", "specialty"]));
}

export async function updateSpecialization(id, values) {
  const response = await apiRequest(`/specializations/${id}`, {
    method: "PUT",
    body: compactObject({
      name: values.name,
      consultationFee: normalizeNumber(values.price, 0),
    }),
  });

  return normalizeSpecialization(findEntity(response, ["specialization", "specialty"]));
}

export async function deleteSpecialization(id) {
  return apiRequest(`/specializations/${id}`, { method: "DELETE" });
}

export async function listPatients() {
  const response = await apiRequest("/patients");
  return findArray(response, ["patients", "patient", "users"]).map(normalizePatient);
}

export async function getPatient(id) {
  const response = await apiRequest(`/patients/${id}`);
  return normalizePatient(findEntity(response, ["patient", "user"]));
}

export async function updatePatient(id, values) {
  const response = await apiRequest(`/patients/${id}`, {
    method: "PATCH",
    body: patientPayload(values),
  });
  return normalizePatient(findEntity(response, ["patient", "user"]));
}

export async function deletePatient(id) {
  return apiRequest(`/patients/${id}`, { method: "DELETE" });
}

export async function listReceptionists() {
  const response = await apiRequest("/receptionist");
  return findArray(response, [
    "receptionists",
    "receptionist",
    "reseptionists",
    "reseptionist",
    "users",
  ]).map(normalizeReceptionist);
}

export async function getReceptionist(id) {
  const response = await apiRequest(`/receptionist/${id}`);
  return normalizeReceptionist(findEntity(response, ["receptionist", "reseptionist"]));
}

export async function createReceptionist(values) {
  const response = await apiRequest("/receptionist", {
    method: "POST",
    body: receptionistPayload(values, "create"),
  });
  return normalizeReceptionist(findEntity(response, ["receptionist", "reseptionist"]));
}

export async function updateReceptionist(id, values) {
  const response = await apiRequest(`/receptionist/${id}`, {
    method: "PATCH",
    body: receptionistPayload(values, "edit"),
  });
  return normalizeReceptionist(findEntity(response, ["receptionist", "reseptionist"]));
}

export async function deleteReceptionist(id) {
  return apiRequest(`/receptionist/${id}`, { method: "DELETE" });
}

export async function listAllUsers() {
  const results = await Promise.allSettled([
    listDoctors(),
    listPatients(),
    listReceptionists(),
  ]);
  const users = results.flatMap((result) =>
    result.status === "fulfilled" ? result.value : [],
  );

  if (users.length === 0) {
    const rejection = results.find((result) => result.status === "rejected");
    if (rejection) throw rejection.reason;
  }

  return users;
}

export async function createUser(values) {
  if (values.role === "doctor") return createDoctor(values);
  if (values.role === "receptionist") return createReceptionist(values);

  const response = await apiRequest("/patients", {
    method: "POST",
    body: patientPayload(values),
  });
  return normalizePatient(findEntity(response, ["patient", "user"]));
}

export async function updateUser(id, values, currentUser) {
  const role = values.role || currentUser?.role;

  if (role === "doctor") return updateDoctor(id, values);
  if (role === "receptionist") return updateReceptionist(id, values);
  return updatePatient(id, values);
}

export async function deleteUser(user) {
  if (user.role === "doctor") return deleteDoctor(user.id);
  if (user.role === "receptionist") return deleteReceptionist(user.id);
  return deletePatient(user.id);
}

export async function toggleUserActiveStatus(user) {
  const nextStatus = user.status === "active" ? "inactive" : "active";
  const nextValues = { ...user, status: nextStatus };

  try {
    if (user.role === "patient") {
      return await apiRequest(`/patients/${user.id}/changeActiveStatus`, {
        method: "PATCH",
      });
    }
  } catch (error) {
    if (!(error instanceof ApiError) || error.status !== 404) throw error;
  }

  return updateUser(user.id, nextValues, user);
}

export async function listAppointments() {
  const response = await apiRequest("/appointment");
  return findArray(response, [
    "appointments",
    "appointment",
    "bookings",
    "reservations",
  ]).map(normalizeAppointment);
}

export async function listDoctorAppointments(doctorId) {
  if (!doctorId) return listAppointments();

  const paths = [
    `/appointment/doctor/${doctorId}`,
    `/appointment/doctors/${doctorId}`,
    `/appointment?doctor=${doctorId}`,
  ];

  for (const path of paths) {
    try {
      const response = await apiRequest(path);
      return findArray(response, [
        "appointments",
        "appointment",
        "bookings",
        "reservations",
      ]).map(normalizeAppointment);
    } catch (error) {
      if (!(error instanceof ApiError) || (error.status !== 404 && error.status !== 400)) {
        throw error;
      }
    }
  }

  const appointments = await listAppointments();
  return appointments.filter((appointment) => appointment.doctorId === String(doctorId));
}

export async function deleteAppointment(id) {
  return apiRequest(`/appointment/${id}`, { method: "DELETE" });
}

export function getCurrentAuthUser() {
  if (typeof localStorage === "undefined") return null;

  try {
    return JSON.parse(localStorage.getItem("medilinkUser") || "null");
  } catch {
    return null;
  }
}

export function getCurrentDoctorId() {
  const user = getCurrentAuthUser();
  return (
    user?.doctorId ||
    user?.doctor?._id ||
    user?.doctor?.id ||
    user?.profile?._id ||
    user?._id ||
    user?.id ||
    ""
  );
}
