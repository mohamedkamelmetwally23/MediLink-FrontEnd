const arabicNamePattern = /^[\u0600-\u06FF\s.]{2,}$/;
const phonePattern = /^01[0125][0-9]{8}$/;

function validatePassword(values, errors, options) {
  const shouldValidatePassword =
    options.requirePassword || values.password || values.confirmPassword;

  if (!shouldValidatePassword) {
    return;
  }

  if (!values.password || values.password.length < 12) {
    errors.password = "كلمة المرور يجب ألا تقل عن 12 حرفا.";
  } else if (!/[a-zA-Z]/.test(values.password)) {
    errors.password = "كلمة المرور يجب أن تحتوي على حرف واحد على الأقل.";
  } else if (!/[0-9]/.test(values.password)) {
    errors.password = "كلمة المرور يجب أن تحتوي على رقم واحد على الأقل.";
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

  if (values.workStart && values.workEnd && values.workStart >= values.workEnd) {
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

  const experience = Number(values.experience);
  if (!Number.isInteger(experience) || experience < 0 || experience > 60) {
    errors.experience = "سنوات الخبرة يجب أن تكون بين 0 و60.";
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
