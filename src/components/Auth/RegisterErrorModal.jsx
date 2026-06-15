import { useNavigate } from "react-router-dom";

export default function RegisterErrorModal({ isOpen, onClose, onLogin }) {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleLoginClick = () => {
    if (onLogin) {
      onLogin();
    } else {
      navigate("/login");
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/35 px-4">
      <div className="w-full max-w-[430px] rounded-xl bg-white px-6 py-7 text-center shadow-xl dark:bg-[#252525]">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#C51F26] text-3xl font-bold text-white">
          !
        </div>

        <h2 className="mb-2 text-xl font-bold text-[#C51F26]">
          هذا الرقم مسجل بالفعل
        </h2>

        <p className="mx-auto mb-5 max-w-[360px] text-xs leading-5 text-gray-600 dark:text-[#D2D2D2]">
          يبدو أن رقم الهاتف الذي أدخلته مستخدم بالفعل، يمكنك تسجيل الدخول إلى
          حسابك أو استخدام رقم هاتف آخر لإنشاء حساب جديد.
        </p>

        <button
          type="button"
          onClick={handleLoginClick}
          className="btn mb-3 h-11 w-full rounded-lg border-none bg-gradient-to-r from-[#05ADE8] to-[#6CCCC8] text-white hover:from-[#05ADE8] hover:to-[#6CCCC8]"
        >
          تسجيل دخول
        </button>

        <button
          type="button"
          onClick={onClose}
          className="btn h-11 w-full rounded-lg border border-[#05ADE8] bg-white text-[#05ADE8] hover:bg-white dark:bg-[#252525] dark:hover:bg-[#303030]"
        >
          استخدام رقم آخر
        </button>
      </div>
    </div>
  );
}
