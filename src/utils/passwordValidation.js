export const passwordRulesText =
  "كلمة المرور يجب ألا تقل عن 8 أحرف وتحتوي على حرف كبير ورقم";

export function validateStrongPassword(password) {
  if (!password) {
    return "كلمة المرور مطلوبة";
  }

  if (password.length < 8 || !/[A-Z]/.test(password) || !/\d/.test(password)) {
    return passwordRulesText;
  }

  return "";
}
