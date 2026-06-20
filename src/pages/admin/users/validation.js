import { validateStrongPassword } from "../../../utils/passwordValidation";

const arabicNamePattern = /^[\u0600-\u06FF\s.]{2,}$/;
const phonePattern = /^01[0125][0-9]{8}$/;
const nameMaxLength = 30;

function getWorkTimeMinutes(time) {
  const twentyFourHourMatch = /^(\d{1,2}):(\d{2})$/.exec(time);

  if (twentyFourHourMatch) {
    return Number(twentyFourHourMatch[1]) * 60 + Number(twentyFourHourMatch[2]);
  }

  const twelveHourMatch = /^(\d{1,2}):(\d{2})\s*(\S+)$/.exec(time);

  if (!twelveHourMatch) {
    return Number.NaN;
  }

  const [, hourText, minuteText, period] = twelveHourMatch;
  const isPm = period.includes("\u0645");
  let hour = Number(hourText) % 12;

  if (isPm) {
    hour += 12;
  }

  return hour * 60 + Number(minuteText);
}

function validatePassword(values, errors, options) {
  const shouldValidatePassword =
    options.requirePassword || values.password || values.confirmPassword;

  if (!shouldValidatePassword) {
    return;
  }

  const passwordError = validateStrongPassword(values.password);
  if (passwordError) {
    errors.password = passwordError;
  }

  if (values.confirmPassword !== values.password) {
    errors.confirmPassword = "تأكيد كلمة المرور غير مطابق.";
  }
}

function getAge(birthDate) {
  const date = new Date(`${birthDate}T00:00:00`);
  if (Number.isNaN(date.getTime())) return Number.NaN;

  const today = new Date();
  let age = today.getFullYear() - date.getFullYear();
  const monthDifference = today.getMonth() - date.getMonth();

  if (
    monthDifference < 0 ||
    (monthDifference === 0 && today.getDate() < date.getDate())
  ) {
    age -= 1;
  }

  return age;
}

function validateNameLengths(values, errors) {
  if (!errors.firstName && values.firstName.trim().length > nameMaxLength) {
    errors.firstName = `الاسم الأول لا يزيد عن ${nameMaxLength} حرف.`;
  }

  if (!errors.lastName && values.lastName.trim().length > nameMaxLength) {
    errors.lastName = `الاسم الأخير لا يزيد عن ${nameMaxLength} حرف.`;
  }
}

export function validateBaseUser(values, options = { requirePassword: true }) {
  const errors = {};

  if (!arabicNamePattern.test(values.firstName.trim())) {
    errors.firstName = "الاسم الأول يجب أن يكون عربيا ولا يقل عن حرفين.";
  }

  if (!arabicNamePattern.test(values.lastName.trim())) {
    errors.lastName = "الاسم الأخير يجب أن يكون عربيا ولا يقل عن حرفين.";
  }

  validateNameLengths(values, errors);

  if (!values.gender) {
    errors.gender = "اختر الجنس.";
  }

  if (!values.role) {
    errors.role = "اختر الدور.";
  }

  if (!options.ignoreBirthDate && (options.requireBirthDate || values.birthDate)) {
    const minAge = options.minAge ?? 18;
    const maxAge = options.maxAge ?? 75;
    const age = getAge(values.birthDate);

    if (!values.birthDate) {
      errors.birthDate = "اختر تاريخ الميلاد.";
    } else if (!Number.isInteger(age) || age < minAge || age > maxAge) {
      errors.birthDate = `يجب أن يكون العمر من ${minAge} إلى ${maxAge} سنة.`;
    }
  }

  if (!phonePattern.test(String(values.phone || "").trim())) {
    errors.phone = "رقم الهاتف يجب أن يكون رقم مصري صحيح مكون من 11 رقم.";
  }

  if (options.requireStatus !== false && !values.status) {
    errors.status = "اختر الحالة.";
  }

  if (!values.workDays?.length) {
    errors.workDays = "اختر يوم عمل واحد على الأقل.";
  }

  if (!values.workStart) {
    errors.workStart = "اختر بداية مواعيد العمل.";
  }

  if (!values.workEnd) {
    errors.workEnd = "اختر نهاية مواعيد العمل.";
  }

  if (
    values.workStart &&
    values.workEnd &&
    getWorkTimeMinutes(values.workStart) >= getWorkTimeMinutes(values.workEnd)
  ) {
    errors.workEnd = "نهاية مواعيد العمل يجب أن تكون بعد البداية.";
  }

  validatePassword(values, errors, options);

  return errors;
}

export function validateDoctor(values, options) {
  const errors = validateBaseUser(values, options);
  const age = values.birthDate ? getAge(values.birthDate) : Number.NaN;

  if (!values.specialty) {
    errors.specialty = "اختر التخصص.";
  }

  const experienceText = String(values.experience ?? "").trim();
  const experience = Number(experienceText);
  if (!experienceText) {
    errors.experience = "سنوات الخبرة مطلوبة";
  } else if (!Number.isInteger(experience) || experience < 0 || experience > 60) {
    errors.experience = "ادخل رقم صحيح";
  } else if (Number.isInteger(age) && experience > age) {
    errors.experience = "سنوات الخبرة لا يمكن أن تكون أكبر من العمر.";
  }

  return errors;
}

export function validateReceptionist(values, options) {
  const errors = validateBaseUser(values, options);
  const educationText = String(values.education || "").trim();

  if (educationText.length < 3) {
    errors.education = "اكتب المؤهل الدراسي بشكل صحيح.";
  }

  return errors;
}

export function validatePatient(values) {
  const errors = {};

  if (!arabicNamePattern.test(values.firstName.trim())) {
    errors.firstName = "الاسم الأول يجب أن يكون عربيا ولا يقل عن حرفين.";
  }

  if (!arabicNamePattern.test(values.lastName.trim())) {
    errors.lastName = "الاسم الأخير يجب أن يكون عربيا ولا يقل عن حرفين.";
  }

  validateNameLengths(values, errors);

  if (!phonePattern.test(values.phone.trim())) {
    errors.phone = "رقم الهاتف يجب أن يكون رقم مصري صحيح مكون من 11 رقم.";
  }

  if (!values.status) {
    errors.status = "اختر الحالة.";
  }

  return errors;
}
