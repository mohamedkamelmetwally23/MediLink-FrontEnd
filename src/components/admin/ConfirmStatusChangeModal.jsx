export default function ConfirmStatusChangeModal({
  status,
  loading,
  error,
  onCancel,
  onConfirm,
}) {
  const isActive = status === "active";

  return (
    <div className="fixed inset-0 z-[90] grid place-items-center bg-black/30 p-4">
      <div
        className="w-full max-w-[490px] rounded-[14px] bg-white px-8 pb-7 pt-9 text-center shadow-[0_18px_55px_rgba(0,0,0,0.2)] dark:bg-[#414141]"
        dir="rtl"
      >
        <div className="mx-auto grid h-[68px] w-[68px] place-items-center rounded-full bg-[#ff3b3b] text-[42px] font-bold leading-none text-white">
          !
        </div>

        <h2 className="mt-7 text-[25px] font-bold text-[#333] dark:text-white">
          هل أنت متأكد من {isActive ? "حظر" : "تفعيل"} هذا العنصر؟
        </h2>
        <p className="mt-2 text-[16px] text-[#888] dark:text-gray-300">
          سيتم تحديث الحالة في قاعدة البيانات.
        </p>

        {error && <p className="mt-3 text-sm font-semibold text-red-500">{error}</p>}

        <div className="mt-6 grid grid-cols-2 gap-3" dir="ltr">
          <button
            type="button"
            disabled={loading}
            className="h-[45px] rounded-[8px] border border-[#ff3030] bg-transparent font-semibold text-[#ff3030] transition hover:bg-[#ff3030]/10 disabled:opacity-60"
            onClick={onConfirm}
          >
            {loading ? "جاري التحديث..." : "نعم"}
          </button>
          <button
            type="button"
            disabled={loading}
            className="h-[45px] rounded-[8px] bg-gradient-to-l from-[#67d2cb] to-[#0fb8e8] font-semibold text-white disabled:opacity-60"
            onClick={onCancel}
          >
            لا
          </button>
        </div>
      </div>
    </div>
  );
}
