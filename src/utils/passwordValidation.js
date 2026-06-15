export const passwordRules = [
  "استخدم ما لا يقل عن 8 إلى 12 حرفاً.",
  "استخدم خليطاً من الأحرف والأرقام والرموز.",
  "استخدم حرفاً كبيراً واحداً على الأقل",
];

export function validateStrongPassword(password) {
  if (!password) {
    return "كلمة المرور مطلوبة";
  }

  const errors = [];

  if (password.length < 8 || password.length > 12) {
    errors.push(passwordRules[0]);
  }

  if (!/[A-Z]/.test(password)) {
    errors.push(passwordRules[2]);
  }

  if (!/\d/.test(password) || !/[^A-Za-z0-9]/.test(password)) {
    errors.push(passwordRules[1]);
  }

  return errors.length ? errors : "";
}
