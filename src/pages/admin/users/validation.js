import { validateStrongPassword } from "../../../utils/passwordValidation";

const arabicNamePattern = /^[\u0600-\u06FF\s.]{2,}$/;
const phonePattern = /^01[0125][0-9]{8}$/;

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

export function validateBaseUser(values, options = { requirePassword: true }) {
  const errors = {};

  if (!arabicNamePattern.test(values.firstName.trim())) {
    errors.firstName = "الاسم الأول يجب أن يكون عربيا ولا يقل عن حرفين.";
  }

  if (!arabicNamePattern.test(values.lastName.trim())) {
    errors.lastName = "الاسم الأخير يجب أن يكون عربيا ولا يقل عن حرفين.";
  }

  if (!values.gender) {
    errors.gender = "اختر الجنس.";
  }

  if (!values.role) {
    errors.role = "اختر الدور.";
  }

  if (!phonePattern.test(values.phone.trim())) {
    errors.phone = "رقم الهاتف يجب أن يكون رقم مصري صحيح مكون من 11 رقم.";
  }

  if (!values.status) {
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

  if (!values.specialty) {
    errors.specialty = "اختر التخصص.";
  }

  const experienceText = String(values.experience ?? "").trim();
  const experience = Number(experienceText);
  if (!experienceText) {
    errors.experience = "سنوات الخبرة مطلوبة";
  } else if (!Number.isInteger(experience) || experience < 0 || experience > 60) {
    errors.experience = "ادخل رقم صحيح";
  }

  return errors;
}

export function validateReceptionist(values, options) {
  const errors = validateBaseUser(values, options);

  if (values.education.trim().length < 3) {
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

  if (!phonePattern.test(values.phone.trim())) {
    errors.phone = "رقم الهاتف يجب أن يكون رقم مصري صحيح مكون من 11 رقم.";
  }

  if (!values.status) {
    errors.status = "اختر الحالة.";
  }

  return errors;
}
