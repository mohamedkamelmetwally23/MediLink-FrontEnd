import { ApiError, apiRequest } from "./apiClient";

const arabicWeekDays = {
  saturday: "\u0627\u0644\u0633\u0628\u062A",
  sunday: "\u0627\u0644\u0627\u062D\u062F",
  monday: "\u0627\u0644\u0627\u062B\u0646\u064A\u0646",
  tuesday: "\u0627\u0644\u062B\u0644\u0627\u062B\u0627\u0621",
  wednesday: "\u0627\u0644\u0627\u0631\u0628\u0639\u0627\u0621",
  thursday: "\u0627\u0644\u062E\u0645\u064A\u0633",
  friday: "\u0627\u0644\u062C\u0645\u0639\u0647",
};

const weekDayAliases = {
  "\u0627\u0644\u0623\u062D\u062F": arabicWeekDays.sunday,
  "\u0627\u0644\u0625\u062B\u0646\u064A\u0646": arabicWeekDays.monday,
  "\u0627\u0644\u0623\u0631\u0628\u0639\u0627\u0621": arabicWeekDays.wednesday,
  "\u0627\u0644\u062C\u0645\u0639\u0629": arabicWeekDays.friday,
};

function unwrapData(response) {
  return response?.data ?? response ?? {};
}

function findArray(response, keys) {
  const roots = [
    response,
    unwrapData(response),
    response?.data?.data,
    response?.data?.result,
    response?.result,
  ];

  for (const root of roots) {
    if (Array.isArray(root)) return root;

    for (const key of keys) {
      if (Array.isArray(root?.[key])) return root[key];
      if (Array.isArray(root?.data?.[key])) return root.data[key];
    }
  }

  return [];
}

function findEntity(response, keys) {
  const roots = [
    response,
    unwrapData(response),
    response?.data?.data,
    response?.data?.result,
    response?.result,
  ];

  for (const root of roots) {
    if (!root || Array.isArray(root) || typeof root !== "object") continue;

    for (const key of keys) {
      if (root[key] && typeof root[key] === "object") return root[key];
      if (root.data?.[key] && typeof root.data[key] === "object")
        return root.data[key];
    }
  }

  return unwrapData(response);
}

async function requestFirst(paths, options = {}) {
  let lastError;
  const retryStatuses = options.retryStatuses || [400, 404, 405];
  const requestOptions = { ...options };
  delete requestOptions.retryStatuses;

  for (const path of paths) {
    try {
      return await apiRequest(path, requestOptions);
    } catch (error) {
      lastError = error;

      if (
        !(error instanceof ApiError) ||
        !retryStatuses.includes(error.status)
      ) {
        throw error;
      }
    }
  }

  throw lastError;
}

async function listFromPaths(paths, keys) {
  const response = await requestFirst(paths);
  return findArray(response, keys);
}

async function entityFromPaths(paths, keys) {
  const response = await requestFirst(paths);
  return findEntity(response, keys);
}

function getId(value) {
  if (typeof value === "string") return value;
  return value?._id || value?.id || value?.user?._id || "";
}

function getSpecializationId(value) {
  if (typeof value === "string") return value;
  return (
    value?._id ||
    value?.id ||
    value?.specializationId ||
    value?.specialityId ||
    value?.specialtyId ||
    ""
  );
}

function getProfileUserId(value) {
  const profile =
    value?.doctorProfile || value?.doctor || value?.profile || value;
  const user =
    profile?.user ||
    profile?.account ||
    profile?.userId ||
    value?.user ||
    value?.account ||
    value?.userId;
  return typeof user === "string" ? user : getId(user);
}

function getCreatedAt(value = {}) {
  return (
    value?.createdAt ||
    value?.user?.createdAt ||
    value?.account?.createdAt ||
    value?.doctor?.createdAt ||
    value?.doctor?.user?.createdAt ||
    value?.doctorProfile?.createdAt ||
    value?.doctorProfile?.user?.createdAt ||
    value?.profile?.createdAt ||
    value?.profile?.user?.createdAt ||
    value?.specialization?.createdAt ||
    value?.speciality?.createdAt ||
    value?.specialty?.createdAt ||
    value?.doctor?.specialization?.createdAt ||
    value?.doctorProfile?.specialization?.createdAt ||
    value?.profile?.specialization?.createdAt ||
    value?.data?.createdAt ||
    value?.data?.user?.createdAt ||
    value?.data?.specialization?.createdAt ||
    ""
  );
}

function getDoctorUpdateIds(id, values = {}, currentDoctor = {}) {
  return Array.from(
    new Set(
      [
        currentDoctor.profileId,
        values.profileId,
        currentDoctor.raw?._id,
        values.raw?._id,
        getId(currentDoctor.raw?.doctorProfile),
        getId(values.raw?.doctorProfile),
        id,
        getProfileUserId(currentDoctor.raw),
        getProfileUserId(values.raw),
        currentDoctor.raw?.user?._id,
        currentDoctor.raw?.user?.id,
        values.raw?.user?._id,
        values.raw?.user?.id,
        values.userId,
        currentDoctor.userId,
      ]
        .filter(Boolean)
        .map(String),
    ),
  );
}

function getReceptionistUpdateIds(id, values = {}, currentReceptionist = {}) {
  return Array.from(
    new Set(
      [
        currentReceptionist.profileId,
        values.profileId,
        currentReceptionist.raw?._id,
        values.raw?._id,
        id,
        currentReceptionist.userId,
        values.userId,
        getProfileUserId(currentReceptionist.raw),
        getProfileUserId(values.raw),
        currentReceptionist.raw?.user?._id,
        currentReceptionist.raw?.user?.id,
        values.raw?.user?._id,
        values.raw?.user?.id,
      ]
        .filter(Boolean)
        .map(String),
    ),
  );
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
  const normalizedValue =
    typeof value === "string" ? value.trim().toLowerCase() : value;

  if (
    normalizedValue === false ||
    normalizedValue === 0 ||
    normalizedValue === "0" ||
    normalizedValue === "false" ||
    normalizedValue === "inactive" ||
    normalizedValue === "disabled" ||
    normalizedValue === "blocked" ||
    normalizedValue === "not active" ||
    normalizedValue === "notactive"
  ) {
    return "inactive";
  }

  return "active";
}

function normalizeNumber(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function normalizeStringList(value) {
  const normalizeItem = (item) => {
    if (Array.isArray(item)) return item.flatMap(normalizeItem);
    if (item === undefined || item === null) return [];

    if (typeof item === "string") {
      const text = item.trim();
      if (!text) return [];

      if (
        (text.startsWith("[") && text.endsWith("]")) ||
        (text.startsWith('"') && text.endsWith('"'))
      ) {
        try {
          return normalizeItem(JSON.parse(text));
        } catch {
          return [text.replace(/^["'[\]\s]+|["'[\]\s]+$/g, "")];
        }
      }

      return [text];
    }

    return [String(item)];
  };

  return [...new Set(normalizeItem(value).filter(Boolean))];
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

function normalizeUserRole(role) {
  const value = String(role || "")
    .trim()
    .toLowerCase();

  if (["patient", "user", "مريض"].includes(value)) return "patient";
  if (["doctor", "dr", "طبيب"].includes(value)) return "doctor";
  if (
    ["receptionist", "reception", "موظف استقبال", "موظف_استقبال"].includes(
      value,
    )
  ) {
    return "receptionist";
  }

  return value;
}

function normalizeBaseUser(item = {}) {
  return {
    id: getId(item),
    firstName: item.firstName || splitName(item.name).firstName,
    lastName: item.lastName || splitName(item.name).lastName,
    gender: item.gender || "",
    birthDate: item.birthDate || "",
    createdAt: getCreatedAt(item),
    phone: item.phone || item.phoneNumber || item.mobile || "",
    role: normalizeUserRole(item.role || item.userRole),
    active:
      normalizeStatus(item.active ?? item.isActive ?? item.status) === "active",
    status: normalizeStatus(item.active ?? item.isActive ?? item.status),
    raw: item,
  };
}

function mergeProfileUser(profile, usersById) {
  const userId = getProfileUserId(profile);
  const user = usersById.get(String(userId));

  if (!user) return profile;

  return {
    ...profile,
    user: {
      ...user.raw,
      _id: user.id,
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      gender: user.gender,
      birthDate: user.birthDate,
      createdAt: user.createdAt || getCreatedAt(user.raw),
      phone: user.phone,
      role: user.role,
      active: user.active,
      status: user.status,
    },
  };
}

export function normalizeWorkingDays(days = []) {
  return days.map((day) => {
    const value = String(day);
    return (
      arabicWeekDays[value.toLowerCase()] || weekDayAliases[value] || value
    );
  });
}

export function serializeWorkingDays(days = []) {
  return normalizeWorkingDays(days);
}

function normalizeTime(value) {
  if (!value) return "";

  const text = String(value).trim();
  const timeMatch = /^(\d{1,2}):(\d{2})$/.exec(text);

  if (timeMatch) {
    return `${String(Number(timeMatch[1])).padStart(2, "0")}:${timeMatch[2]}`;
  }

  const period = text.includes("\u0645")
    ? "pm"
    : text.includes("\u0635")
      ? "am"
      : "";
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
    id: getSpecializationId(raw),
    name: raw.name || raw.specializationName || raw.title || "",
    price:
      raw.consultationFee ?? raw.price ?? raw.fee ?? raw.examinationPrice ?? "",
    raw,
  };
}

export function normalizeDoctor(item = {}) {
  const profile = item.doctorProfile || item.doctor || item.profile || item;
  const user = profile.user || item.user || item.account || item;
  const specialization =
    profile.specialization ||
    profile.speciality ||
    profile.specialty ||
    profile.specializationId ||
    item.specialization ||
    item.speciality ||
    item.specialty ||
    item.specializationId;
  const normalizedSpecialization =
    typeof specialization === "object"
      ? normalizeSpecialization(specialization)
      : {
          id: specialization || "",
          name:
            profile.specializationName ||
            profile.specialty ||
            item.specializationName ||
            item.specialty ||
            "",
        };

  return {
    id: getProfileUserId(profile) || getProfileUserId(item) || getId(user),
    profileId: getId(profile),
    userId: getProfileUserId(profile) || getProfileUserId(item) || getId(user),
    firstName:
      user.firstName ||
      profile.firstName ||
      item.firstName ||
      splitName(profile.name || item.name).firstName,
    lastName:
      user.lastName ||
      profile.lastName ||
      item.lastName ||
      splitName(profile.name || item.name).lastName,
    gender: user.gender || profile.gender || item.gender || "male",
    birthDate: user.birthDate || profile.birthDate || item.birthDate || "",
    registrationDate: normalizeDate(
      getCreatedAt(user) || getCreatedAt(profile) || getCreatedAt(item),
    ),
    phone: user.phone || profile.phone || item.phone || "",
    role: "doctor",
    status: normalizeStatus(
      profile.active ??
        item.active ??
        user.active ??
        profile.status ??
        item.status ??
        user.status ??
        profile.isActive ??
        item.isActive ??
        user.isActive,
    ),
    specialty: normalizedSpecialization.name,
    specializationId: normalizedSpecialization.id,
    consultationFee: normalizedSpecialization.price,
    experience:
      profile.experienceYears ??
      profile.experience ??
      item.experienceYears ??
      item.experience ??
      "",
    experienceYears:
      profile.experienceYears ??
      profile.experience ??
      item.experienceYears ??
      item.experience ??
      "",
    workDays: normalizeWorkingDays(
      profile.workingDays ||
        profile.workDays ||
        item.workingDays ||
        item.workDays ||
        [],
    ),
    workingDays:
      profile.workingDays ||
      serializeWorkingDays(
        profile.workDays || item.workingDays || item.workDays || [],
      ),
    workStart: normalizeTime(
      profile.startTime ||
        profile.workStart ||
        item.startTime ||
        item.workStart ||
        "",
    ),
    workEnd: normalizeTime(
      profile.endTime || profile.workEnd || item.endTime || item.workEnd || "",
    ),
    appointmentsCount:
      profile.appointmentsCount ??
      item.appointmentsCount ??
      profile.caseCount ??
      item.caseCount ??
      profile.casesCount ??
      item.casesCount ??
      profile.appointments?.length ??
      item.appointments?.length ??
      0,
    image:
      profile.profileImage ||
      profile.image ||
      profile.imageUrl ||
      profile.photo ||
      profile.avatar ||
      item.profileImage ||
      item.image ||
      item.imageUrl ||
      item.photo ||
      item.avatar ||
      user.profileImage ||
      user.image ||
      user.imageUrl ||
      user.photo ||
      user.avatar ||
      "",
    rating: normalizeNumber(
      profile.rating ??
        item.rating ??
        profile.averageRating ??
        item.averageRating ??
        profile.avgRating ??
        item.avgRating ??
        profile.ratingsAverage ??
        item.ratingsAverage ??
        profile.reviewAverage ??
        item.reviewAverage ??
        0,
      0,
    ),
    reviewsCount: normalizeNumber(
      profile.reviewsCount ??
        item.reviewsCount ??
        profile.ratingsCount ??
        item.ratingsCount ??
        profile.reviewCount ??
        item.reviewCount ??
        profile.reviews?.length ??
        item.reviews?.length ??
        0,
      0,
    ),
    available:
      profile.available ??
      item.available ??
      profile.isAvailable ??
      item.isAvailable ??
      profile.acceptingAppointments ??
      item.acceptingAppointments ??
      normalizeStatus(
        profile.status ??
          item.status ??
          user.status ??
          profile.isActive ??
          item.isActive ??
          user.isActive,
      ) === "active",
    raw: item,
  };
}

export function normalizeReceptionist(item = {}) {
  const user = item.user || item.account || item;
  const status = normalizeStatus(
    item.status ??
      item.active ??
      item.isActive ??
      user.active ??
      user.status ??
      user.isActive ??
      "",
  );

  return {
    id: getProfileUserId(item) || getId(user) || getId(item),
    profileId: getId(item),
    userId: getProfileUserId(item) || getId(user),
    firstName:
      user.firstName || item.firstName || splitName(item.name).firstName,
    lastName: user.lastName || item.lastName || splitName(item.name).lastName,
    gender: user.gender || item.gender || "male",
    birthDate: user.birthDate || item.birthDate || "",
    phone: user.phone || item.phone || "",
    role: "receptionist",
    active: status === "active",
    status,
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
  const status = normalizeStatus(
    user.active ??
      user.status ??
      user.isActive ??
      item.active ??
      item.status ??
      item.isActive,
  );

  return {
    id: getId(item),
    userId: getProfileUserId(item) || getId(user),
    firstName: user.firstName || item.firstName || nameParts.firstName,
    lastName: user.lastName || item.lastName || nameParts.lastName,
    name,
    gender: user.gender || item.gender || "",
    birthDate: user.birthDate || item.birthDate || "",
    phone: user.phone || item.phone || "",
    height: item.tall ?? user.tall ?? item.height ?? user.height ?? "",
    weight: item.weight ?? user.weight ?? "",
    bloodType: item.bloodType || user.bloodType || "",
    smoker: item.smoking ?? user.smoking ?? item.smoker ?? user.smoker ?? "",
    chronicConditions: normalizeStringList(
      item.chronicConditions || user.chronicConditions || [],
    ),
    allergies: normalizeStringList(item.allergies || user.allergies || []),
    chronicMedications: normalizeStringList(
      item.chronicMedications || user.chronicMedications || [],
    ),
    medicalFiles: item.medicalFiles || user.medicalFiles || [],
    role: "patient",
    active: status === "active",
    status,
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

export async function listBaseUsers() {
  const items = await listFromPaths(["/users"], ["users", "user"]);
  return items.map(normalizeBaseUser);
}

async function withHydratedUsers(items) {
  const needsUserHydration = items.some((item) => {
    if (typeof item?.user === "string") return true;

    const user = item?.user || item?.account;
    const userId = getProfileUserId(item);

    if (userId && !getCreatedAt(item)) return true;

    return (
      user &&
      typeof user === "object" &&
      (!user.createdAt ||
        (user.active === undefined &&
          user.isActive === undefined &&
          user.status === undefined))
    );
  });

  if (!needsUserHydration) return items;

  try {
    const users = await listBaseUsers();
    const usersById = new Map(users.map((user) => [String(user.id), user]));
    return items.map((item) => mergeProfileUser(item, usersById));
  } catch {
    return items;
  }
}

export function normalizeAppointment(item = {}) {
  const patient = item.patient || item.patientId || item.user || {};
  const patientUser =
    patient && typeof patient === "object"
      ? patient.user || patient.account || patient
      : {};
  const doctor = item.doctor || item.doctorId || {};
  const doctorUser =
    doctor && typeof doctor === "object"
      ? doctor.user || doctor.account || doctor
      : {};
  const specialization =
    item.specialization || item.specialty || doctor.specialization || {};
  const date =
    item.date ||
    item.appointmentDate ||
    item.day ||
    item.startDate ||
    item.createdAt ||
    "";
  const time = normalizeTime(
    item.time || item.appointmentTime || item.startTime || "",
  );

  return {
    id: getId(item),
    patientId: getId(patient),
    doctorId: getId(doctor),
    patient:
      joinName(patientUser) ||
      joinName(patient) ||
      item.patientName ||
      item.name ||
      "",
    doctor: joinName(doctorUser) || joinName(doctor) || item.doctorName || "",
    specialty:
      (typeof specialization === "object"
        ? specialization.name
        : specialization) || "",
    phone: patientUser.phone || patient.phone || item.phone || "",
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
    phone: mode === "create" ? values.phone?.trim() : undefined,
    birthDate: getBirthDatePayload(values, mode === "create"),
    role: mode === "create" ? "doctor" : undefined,
    specialization:
      values.specializationId || values.specialtyId || values.specialty,
    experienceYears: normalizeNumber(
      values.experience ?? values.experienceYears,
      0,
    ),
    workingDays: serializeWorkingDays(
      values.workDays || values.workingDays || [],
    ),
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
    phone: mode === "create" ? values.phone?.trim() : undefined,
    birthDate: getBirthDatePayload(values, mode === "create"),
    education: values.education,
    status: mode === "create" ? "student" : values.status,
    workingDays: serializeWorkingDays(
      values.workDays || values.workingDays || [],
    ),
    startTime: normalizeTime(values.workStart || values.startTime),
    endTime: normalizeTime(values.workEnd || values.endTime),
    password: values.password,
    confirmPassword: values.confirmPassword,
  };

  if (mode === "edit" && !payload.password) {
    delete payload.password;
    delete payload.confirmPassword;
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
  const response = await requestFirst(
    [
      "/doctors?limit=500",
      "/doctorprofiles?limit=500",
      "/doctorProfiles?limit=500",
      "/doctor-profiles?limit=500",
    ],
    {
      retryStatuses: [400, 403, 404, 405],
    },
  );
  const doctors = findArray(response, [
    "doctors",
    "doctor",
    "doctorprofiles",
    "doctorProfiles",
    "profiles",
  ]);
  const hydratedDoctors = await withHydratedUsers(doctors);
  return hydratedDoctors.map(normalizeDoctor);
}

export async function getDoctor(id) {
  const doctor = await entityFromPaths(
    [
      `/doctors/${id}`,
      `/doctorprofiles/${id}`,
      `/doctorProfiles/${id}`,
      `/doctor-profiles/${id}`,
    ],
    ["doctor", "doctorprofile", "doctorProfile", "profile"],
  );
  const [hydratedDoctor] = await withHydratedUsers([doctor]);
  return normalizeDoctor(hydratedDoctor);
}

function getCurrentDoctorCandidateIds() {
  const user = getCurrentAuthUser();

  return Array.from(
    new Set(
      [
        user?.doctorId,
        user?.doctorProfile?._id,
        user?.doctorProfile?.id,
        user?.doctor?._id,
        user?.doctor?.id,
        user?.profile?._id,
        user?.profile?.id,
        user?.user?._id,
        user?.user?.id,
        user?._id,
        user?.id,
      ]
        .filter(Boolean)
        .map(String),
    ),
  );
}

function getDoctorLookupIds(doctor = {}) {
  const value = doctor || {};

  return Array.from(
    new Set(
      [
        value.id,
        value.profileId,
        value.userId,
        value.raw?._id,
        value.raw?.id,
        value.raw?.user?._id,
        value.raw?.user?.id,
        value.raw?.doctorProfile?._id,
        value.raw?.doctorProfile?.id,
        value.raw?.profile?._id,
        value.raw?.profile?.id,
      ]
        .filter(Boolean)
        .map(String),
    ),
  );
}

function doctorMatchesIds(doctor, ids) {
  const idsSet = new Set(ids.map(String));
  return getDoctorLookupIds(doctor).some((id) => idsSet.has(id));
}

export async function getCurrentDoctorProfile() {
  const currentIds = getCurrentDoctorCandidateIds();

  if (currentIds.length === 0) return null;

  try {
    const doctors = await listDoctors();
    const matchedDoctor = doctors.find((doctor) =>
      doctorMatchesIds(doctor, currentIds),
    );

    if (matchedDoctor) return matchedDoctor;
  } catch {
    // Fall back to direct lookups below when listing is unavailable.
  }

  for (const id of currentIds) {
    try {
      return await getDoctor(id);
    } catch {
      // Try the next possible id from the auth payload.
    }
  }

  return null;
}

function normalizeAvailableSlotDay(item = {}) {
  const slots = Array.isArray(item.slots)
    ? item.slots
    : Array.isArray(item.availableSlots)
      ? item.availableSlots
      : Array.isArray(item.times)
        ? item.times
        : [];

  return {
    date: normalizeDate(item.date || item.dayDate || item.appointmentDate),
    day: item.day || item.name || "",
    slots: slots
      .map((slot) => {
        const value = typeof slot === "string" ? { time: slot } : slot || {};

        return {
          time: normalizeTime(
            value.time || value.startTime || value.appointmentTime || "",
          ),
          status: value.status || value.state || "available",
          raw: slot,
        };
      })
      .filter((slot) => slot.time),
    raw: item,
  };
}

export async function listDoctorAvailableSlots(doctorId) {
  if (!doctorId) return [];

  const slots = await listFromPaths(
    [
      `/doctors/${doctorId}/available-slots`,
      `/doctorprofiles/${doctorId}/available-slots`,
      `/doctorProfiles/${doctorId}/available-slots`,
      `/doctor-profiles/${doctorId}/available-slots`,
    ],
    ["slots", "availableSlots", "days"],
  );

  return slots.map(normalizeAvailableSlotDay);
}

export async function listCurrentDoctorAvailableSlots(doctor) {
  const lookupIds = [
    ...getDoctorLookupIds(doctor),
    ...getCurrentDoctorCandidateIds(),
  ];

  for (const id of Array.from(new Set(lookupIds.filter(Boolean)))) {
    try {
      return await listDoctorAvailableSlots(id);
    } catch (error) {
      if (
        !(error instanceof ApiError) ||
        ![400, 404, 405].includes(error.status)
      ) {
        throw error;
      }
    }
  }

  return [];
}

export async function createDoctor(values) {
  const response = await requestFirst(["/doctors"], {
    method: "POST",
    body: doctorPayload(values, "create"),
  });
  return normalizeDoctor(findEntity(response, ["doctor"]));
}

export async function updateDoctor(id, values, currentDoctor) {
  const doctorIds = getDoctorUpdateIds(id, values, currentDoctor);

  if (doctorIds.length === 0) {
    throw new ApiError("تعذر تحديد رقم الطبيب");
  }

  const body = doctorPayload(values, "edit");
  const doctorPaths = [
    ...doctorIds.map((doctorId) => `/doctors/${doctorId}`),
    ...doctorIds.flatMap((doctorId) => [
      `/doctorprofiles/${doctorId}`,
      `/doctorProfiles/${doctorId}`,
      `/doctor-profiles/${doctorId}`,
    ]),
  ];

  const response = await requestFirst(doctorPaths, {
    method: "PATCH",
    body,
  });
  return normalizeDoctor(findEntity(response, ["doctor"]));
}

export async function deleteDoctor(id) {
  return requestFirst([`/doctors/${id}`, `/doctorprofiles/${id}`], {
    method: "DELETE",
  });
}

export async function listSpecializations() {
  const specializations = await listFromPaths(
    ["/specializations", "/specialties"],
    ["specializations", "specialization", "specialties", "specialty"],
  );
  return specializations.map(normalizeSpecialization);
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
  const response = await requestFirst(["/specializations", "/specialties"], {
    method: "POST",
    body: compactObject({
      name: values.name,
      consultationFee: normalizeNumber(values.price, 0),
    }),
  });

  return normalizeSpecialization(
    findEntity(response, ["specialization", "specialty"]),
  );
}

export async function updateSpecialization(id, values) {
  const response = await requestFirst(
    [`/specializations/${id}`, `/specialties/${id}`],
    {
      method: "PUT",
      body: compactObject({
        name: values.name,
        consultationFee: normalizeNumber(values.price, 0),
      }),
    },
  );

  return normalizeSpecialization(
    findEntity(response, ["specialization", "specialty"]),
  );
}

export async function deleteSpecialization(specialization) {
  const id = getSpecializationId(specialization);

  if (!id) {
    throw new ApiError("تعذر تحديد التخصص المراد حذفه");
  }

  return requestFirst([`/specializations/${id}`, `/specialties/${id}`], {
    method: "DELETE",
  });
}

export async function listPatients() {
  const response = await apiRequest("/patient?limit=500");
  const patients = findArray(response, [
    "patients",
    "patient",
    "allPatients",
    "allPatient",
    "users",
    "patientprofiles",
    "patientProfiles",
    "profiles",
  ]);
  const hydratedPatients = await withHydratedUsers(patients);
  return hydratedPatients.map(normalizePatient);
}

export async function getPatient(id) {
  const patient = await entityFromPaths(
    [
      `/patient/getPatientById/${id}`,
      `/patient/${id}`,
      `/patients/${id}`,
      `/patientprofiles/${id}`,
      `/patientProfiles/${id}`,
      `/patient-profiles/${id}`,
    ],
    ["patient", "patientprofile", "patientProfile", "profile", "user"],
  );
  const [hydratedPatient] = await withHydratedUsers([patient]);
  return normalizePatient(hydratedPatient);
}

export async function getMyPatientProfile() {
  const response = await apiRequest("/patient/my-profile");
  const patient = findEntity(response, [
    "patient",
    "patientProfile",
    "profile",
    "user",
  ]);

  return normalizePatient(patient);
}

export async function getCurrentUser() {
  const response = await apiRequest("/users/me");
  return findEntity(response, ["user", "profile"]);
}

export async function updatePatient(id, values) {
  const response = await requestFirst(
    [`/patient/${id}`, `/patients/${id}`, `/patientprofiles/${id}`],
    {
      method: "PATCH",
      body: patientPayload(values),
    },
  );
  return normalizePatient(findEntity(response, ["patient", "user"]));
}

export async function updateCurrentPatient(values) {
  const response = await apiRequest("/users/updateMe", {
    method: "PATCH",
    body: {
      firstName: values.firstName?.trim(),
      lastName: values.lastName?.trim(),
      gender: values.gender,
      birthDate: values.birthDate,
      phone: values.phone?.trim(),
    },
  });

  return normalizePatient(findEntity(response, ["patient", "user", "profile"]));
}

export async function updateCurrentUserPhoto(photo) {
  const formData = new FormData();
  formData.append("photo", photo);

  await apiRequest("/users/updateMe", {
    method: "PATCH",
    body: formData,
  });

  return getCurrentUser();
}

export async function changePatientPassword(values) {
  return apiRequest("/users/updatePassword", {
    method: "PATCH",
    body: {
      password: values.currentPassword,
      newpassword: values.newPassword,
      confirmnewpassword: values.confirmPassword,
    },
  });
}

export async function deletePatient(id) {
  return requestFirst(
    [
      `/patient/deletePatientById/${id}`,
      `/patient/${id}`,
      `/patients/${id}`,
      `/patientprofiles/${id}`,
    ],
    {
      method: "DELETE",
    },
  );
}

export async function listReceptionists() {
  const receptionists = await listFromPaths(
    ["/receptionist?limit=500", "/receptionists?limit=500"],
    ["receptionists", "receptionist", "reseptionists", "reseptionist", "users"],
  );
  const hydratedReceptionists = await withHydratedUsers(receptionists);
  return hydratedReceptionists.map(normalizeReceptionist);
}

export async function getReceptionist(id) {
  const receptionist = await entityFromPaths(
    [`/receptionist/${id}`, `/receptionists/${id}`],
    ["receptionist", "reseptionist"],
  );
  const [hydratedReceptionist] = await withHydratedUsers([receptionist]);
  return normalizeReceptionist(hydratedReceptionist);
}

export async function createReceptionist(values) {
  const response = await requestFirst(["/receptionist"], {
    method: "POST",
    body: receptionistPayload(values, "create"),
  });
  return normalizeReceptionist(
    findEntity(response, ["receptionist", "reseptionist"]),
  );
}

export async function updateReceptionist(id, values, currentReceptionist) {
  const receptionistIds = getReceptionistUpdateIds(
    id,
    values,
    currentReceptionist,
  );
  const paths = [
    ...receptionistIds.flatMap((receptionistId) => [
      `/receptionist/${receptionistId}`,
      `/reseptionist/${receptionistId}`,
      `/receptionists/${receptionistId}`,
      `/reseptionists/${receptionistId}`,
    ]),
  ];

  const response = await requestFirst(
    paths,
    {
      method: "PATCH",
      body: receptionistPayload(values, "edit"),
      retryStatuses: [404, 405],
    },
  );
  return normalizeReceptionist(
    findEntity(response, ["receptionist", "reseptionist"]),
  );
}

export async function deleteReceptionist(id) {
  return requestFirst([`/receptionist/${id}`, `/receptionists/${id}`], {
    method: "DELETE",
  });
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

  const response = await requestFirst(
    ["/patient", "/patients", "/patientprofiles"],
    {
      method: "POST",
      body: patientPayload(values),
    },
  );
  return normalizePatient(findEntity(response, ["patient", "user"]));
}

export async function updateUser(id, values, currentUser) {
  const role = values.role || currentUser?.role;

  if (role === "doctor") return updateDoctor(id, values, currentUser);
  if (role === "receptionist") return updateReceptionist(id, values, currentUser);
  return updatePatient(id, values);
}

export async function deleteUser(user) {
  if (user.role === "doctor") return deleteDoctor(user.id);
  if (user.role === "receptionist") return deleteReceptionist(user.id);
  return deletePatient(user.id);
}

export async function toggleUserActiveStatus(user, options = {}) {
  const nextActive = user.status !== "active";
  const statusNote = nextActive ? "" : String(options.note || "").trim();
  const statusPayload = compactObject({
    active: nextActive,
    status: nextActive ? "active" : "inactive",
    statusNote,
    inactiveNote: statusNote,
    note: statusNote,
  });

  if (user.role === "patient") {
    const patientIds = Array.from(
      new Set(
        [
          user.userId,
          getProfileUserId(user.raw),
          user.raw?.user?._id,
          user.raw?.user?.id,
          user.raw?._id,
          user.profileId,
          user.id,
        ]
          .filter(Boolean)
          .map(String),
      ),
    );

    if (patientIds.length === 0) {
      throw new ApiError("تعذر تحديد رقم المريض في قاعدة البيانات");
    }

    return requestFirst(
      patientIds.map((id) => `/patient/${id}/active`),
      {
        method: "PATCH",
      },
    );
  }

  if (user.role === "receptionist") {
    const receptionistId =
      user.userId ||
      getProfileUserId(user.raw) ||
      user.raw?.user?._id ||
      user.raw?.user?.id;

    if (!receptionistId) {
      throw new ApiError("تعذر تحديد رقم موظف الاستقبال في قاعدة البيانات");
    }

    const response = await apiRequest(`/users/${receptionistId}`, {
      method: "PATCH",
      body: statusPayload,
    });

    return {
      ...(response && typeof response === "object" ? response : {}),
      active: nextActive,
    };
  }

  const userId =
    user.userId ||
    getProfileUserId(user.raw) ||
    user.raw?.user?._id ||
    user.raw?.user?.id ||
    user.id;

  if (!userId) {
    throw new ApiError("تعذر تحديد رقم المستخدم في قاعدة البيانات");
  }

  const response = await apiRequest(`/users/${userId}`, {
    method: "PATCH",
    body: statusPayload,
  });

  return {
    ...response,
    active: nextActive,
  };
}

const demoAppointmentsStorageKey = "medilink-demo-appointments";

export const demoDepositPayment = {
  amount: 100,
  currency: "EGP",
  method: "demo",
  status: "paid_demo",
};

function readDemoAppointments() {
  if (typeof localStorage === "undefined") return [];

  try {
    const stored = JSON.parse(
      localStorage.getItem(demoAppointmentsStorageKey) || "[]",
    );
    return Array.isArray(stored) ? stored : [];
  } catch {
    return [];
  }
}

function writeDemoAppointments(appointments) {
  if (typeof localStorage === "undefined") return;
  localStorage.setItem(
    demoAppointmentsStorageKey,
    JSON.stringify(appointments),
  );
}

function mergeAppointments(primaryAppointments, demoAppointments) {
  const byId = new Map();

  [...primaryAppointments, ...demoAppointments].forEach((appointment) => {
    if (!appointment?.id) return;
    byId.set(String(appointment.id), appointment);
  });

  return Array.from(byId.values());
}

function getAppointmentSlotKey(values = {}) {
  return [
    String(values.doctorId || values.doctor || "").trim(),
    normalizeDate(values.date || values.appointmentDate || values.day),
    normalizeTime(values.time || values.appointmentTime || values.startTime),
  ].join("|");
}

function getCurrentPatientId() {
  const user = getCurrentAuthUser();
  return (
    user?.patientId ||
    user?.patient?._id ||
    user?.patient?.id ||
    user?.profile?._id ||
    user?._id ||
    user?.id ||
    ""
  );
}

function getCurrentPatientName() {
  const user = getCurrentAuthUser();
  const profile = user?.patient || user?.profile || user;
  return joinName(profile) || profile?.name || "مريض ميديلينك";
}

function getCurrentPatientPhone() {
  const user = getCurrentAuthUser();
  const profile = user?.patient || user?.profile || user;
  return profile?.phone || profile?.phoneNumber || profile?.mobile || "";
}

function buildDemoAppointment(values) {
  const patientId = values.patientId || values.patient || getCurrentPatientId();
  const doctorId = values.doctorId || values.doctor;
  const date = normalizeDate(
    values.date || values.appointmentDate || values.day,
  );
  const time = normalizeTime(
    values.time || values.appointmentTime || values.startTime,
  );
  const deposit = {
    ...demoDepositPayment,
    ...(values.deposit || values.payment || {}),
  };

  return {
    _id: `demo-${Date.now()}`,
    patientId,
    doctorId,
    patientName: values.patientName || getCurrentPatientName(),
    doctorName: values.doctorName || values.doctorLabel || "",
    specialty:
      values.specialty ||
      values.specialization ||
      values.specializationName ||
      "",
    phone: values.phone || values.patientPhone || getCurrentPatientPhone(),
    date,
    time,
    status: values.status || "confirmed",
    paymentStatus: deposit.status,
    depositAmount: deposit.amount,
    currency: deposit.currency,
    amount: values.amount || deposit.amount,
    payment: deposit,
    source: "demo",
    createdAt: new Date().toISOString(),
  };
}

export function isAppointmentSlotAvailable(values, appointments = []) {
  const targetSlot = getAppointmentSlotKey(values);

  if (!targetSlot || targetSlot.startsWith("|")) return false;

  return !appointments.some((appointment) => {
    if (appointment.status === "cancelled") return false;
    return getAppointmentSlotKey(appointment) === targetSlot;
  });
}

export async function listAppointments() {
  const response = await requestFirst(
    [
      "/appointment?limit=500",
      "/appointment",
      "/appointment/getAllAppointments",
      "/appointments?limit=500",
      "/appointments",
      "/appointments/getAllAppointments",
      "/booking?limit=500",
      "/bookings?limit=500",
    ],
    {
      retryStatuses: [400, 403, 404, 405],
    },
  );
  const appointments = findArray(response, [
    "allAppointments",
    "appointments",
    "appointment",
    "bookings",
    "reservations",
  ]);

  return appointments.map(normalizeAppointment);
}

export async function listDoctorAppointments(doctorId) {
  if (!doctorId) return listAppointments();

  const doctorDemoAppointments = readDemoAppointments()
    .map(normalizeAppointment)
    .filter((appointment) => appointment.doctorId === String(doctorId));

  const paths = [
    `/appointment/doctor/${doctorId}`,
    `/appointment/doctors/${doctorId}`,
    `/appointments/doctor/${doctorId}`,
    `/appointments/doctors/${doctorId}`,
    `/appointment?doctor=${doctorId}`,
    `/appointments?doctor=${doctorId}`,
  ];

  for (const path of paths) {
    try {
      const response = await apiRequest(path);
      const appointments = findArray(response, [
        "appointments",
        "appointment",
        "bookings",
        "reservations",
      ]).map(normalizeAppointment);

      return mergeAppointments(appointments, doctorDemoAppointments);
    } catch (error) {
      if (
        error instanceof ApiError &&
        error.status !== 404 &&
        error.status !== 403 &&
        error.status !== 400 &&
        doctorDemoAppointments.length > 0
      ) {
        return doctorDemoAppointments;
      }

      if (
        !(error instanceof ApiError) ||
        (error.status !== 404 && error.status !== 403 && error.status !== 400)
      ) {
        throw error;
      }
    }
  }

  const appointments = await listAppointments();
  return appointments.filter(
    (appointment) => appointment.doctorId === String(doctorId),
  );
}

export async function deleteAppointment(id) {
  if (String(id).startsWith("demo-")) {
    writeDemoAppointments(
      readDemoAppointments().filter(
        (appointment) => getId(appointment) !== String(id),
      ),
    );
    return { deleted: true };
  }

  return requestFirst([`/appointments/${id}`, `/appointment/${id}`], {
    method: "DELETE",
  });
}

export async function createAppointment(values) {
  const payload = compactObject({
    patientId: values.patientId || values.patient || values.patientId,
    doctorId: values.doctorId || values.doctor || values.doctorId,
    specialization:
      values.specialization || values.specialty || values.specializationId,
    date: values.date || values.appointmentDate || values.day,
    time: values.time || values.appointmentTime || values.startTime,
    phone: values.phone || values.patientPhone || undefined,
    reason: values.reason || values.visitReason || values.notes,
    notes: values.notes || values.reason || values.visitReason,
    paymentMethod: values.paymentMethod,
    paymentStatus: values.paymentStatus,
    cardLastFour: values.paymentDetails?.cardLastFour,
    status: values.status || "pending",
  });

  let body = payload;

  if (Array.isArray(values.files) && values.files.length > 0) {
    const formData = new FormData();

    Object.entries(payload).forEach(([key, value]) => {
      formData.append(key, value);
    });
    values.files.forEach((file) => {
      formData.append("medicalFiles", file);
    });

    body = formData;
  }

  const response = await requestFirst(
    ["/appointment", "/appointments", "/booking", "/bookings"],
    {
      method: "POST",
      body,
    },
  );

  return normalizeAppointment(
    findEntity(response, ["appointment", "booking", "reservation"]),
  );
}

export async function completePatientProfile(values) {
  const payload = {
    bloodType: values.bloodType || "",
    tall: Number(values.height),
    weight: Number(values.weight),
    smoking: values.smoking === true,
    chronicMedications: values.chronicMedications || [],
    allergies: values.allergies || [],
    chronicConditions: values.chronicConditions || [],
    favoriteDoctors: values.favoriteDoctors || [],
  };
  const medicalFiles = values.medicalFiles || [];

  const profileResponse = await apiRequest("/patient/complete-profile", {
    method: "PATCH",
    body: payload,
  });

  if (medicalFiles.length > 0) {
    await uploadPatientMedicalFiles(medicalFiles);
  }

  return profileResponse;
}

export async function uploadPatientMedicalFiles(files) {
  const formData = new FormData();

  Array.from(files || []).forEach((file) => {
    formData.append("medicalFiles", file);
  });

  return apiRequest("/patient/complete-profile", {
    method: "PATCH",
    body: formData,
  });
}

export async function createPaidDemoAppointment(values) {
  let appointments;

  try {
    appointments = await listAppointments();
  } catch {
    appointments = readDemoAppointments().map(normalizeAppointment);
  }

  const payment = {
    ...demoDepositPayment,
    ...(values.payment || {}),
  };
  const nextAppointment = {
    ...values,
    status: "confirmed",
    payment,
    paymentStatus: payment.status,
    depositAmount: payment.amount,
    currency: payment.currency,
  };

  if (!isAppointmentSlotAvailable(nextAppointment, appointments)) {
    throw new ApiError("هذا الموعد غير متاح الآن، اختر موعدًا آخر", {
      status: 409,
    });
  }

  const demoAppointment = buildDemoAppointment(nextAppointment);
  writeDemoAppointments([...readDemoAppointments(), demoAppointment]);
  return normalizeAppointment(demoAppointment);
}

export async function updateAppointmentStatus(id, status) {
  const payload = compactObject({ status });

  if (String(id).startsWith("demo-")) {
    const appointments = readDemoAppointments();
    const updatedAppointments = appointments.map((appointment) =>
      getId(appointment) === String(id)
        ? { ...appointment, status }
        : appointment,
    );
    const updatedAppointment = updatedAppointments.find(
      (appointment) => getId(appointment) === String(id),
    );

    writeDemoAppointments(updatedAppointments);
    return normalizeAppointment(updatedAppointment);
  }

  const response = await requestFirst(
    [
      `/appointment/${id}`,
      `/appointments/${id}`,
      `/booking/${id}`,
      `/bookings/${id}`,
    ],
    {
      method: "PATCH",
      body: payload,
    },
  );

  return normalizeAppointment(
    findEntity(response, ["appointment", "booking", "reservation"]),
  );
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
