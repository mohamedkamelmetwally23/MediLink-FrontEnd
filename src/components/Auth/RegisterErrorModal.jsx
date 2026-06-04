export default function RegisterErrorModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/35">
      <div className="w-full max-w-[430px] rounded-xl bg-white px-6 py-7 text-center shadow-xl">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#C51F26] text-3xl font-bold text-white">
          !
        </div>

        <h2 className="mb-2 text-xl font-bold text-[#C51F26]">
          هذا الرقم مسجل بالفعل
        </h2>

        <p className="mx-auto mb-5 max-w-[360px] text-xs leading-5 text-gray-600">
          يبدو أن رقم الهاتف الذي أدخلته مستخدم بالفعل، يمكنك تسجيل الدخول إلى
          حسابك أو استخدام رقم هاتف آخر لإنشاء حساب جديد.
        </p>

        <button
          type="button"
          className="btn mb-3 h-11 w-full rounded-lg border-none bg-gradient-to-r from-[#05ADE8] to-[#6CCCC8] text-white hover:from-[#05ADE8] hover:to-[#6CCCC8]"
        >
          تسجيل دخول
        </button>

        <button
          type="button"
          onClick={onClose}
          className="btn h-11 w-full rounded-lg border border-[#05ADE8] bg-white text-[#05ADE8] hover:bg-white"
        >
          استخدام رقم آخر
        </button>
      </div>
    </div>
  );
}