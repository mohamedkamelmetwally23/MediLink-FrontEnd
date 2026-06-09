export default function ConfirmDoctorDeleteModal({ count, onCancel, onConfirm }) {
  return (
    <div className="fixed inset-0 z-[60] grid place-items-center bg-black/45 p-4">
      <div className="w-full max-w-[350px] rounded-xl bg-white p-6 text-center shadow-2xl dark:bg-[#454545]">
        <div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-full bg-red-700 text-3xl font-bold text-white">
          !
        </div>
        <h2 className="mb-5 text-xl font-bold text-red-700 dark:text-red-300">
          {count > 1
            ? `هل أنت متأكد من حذف ${count} أطباء؟`
            : "هل أنت متأكد من حذف هذا الطبيب؟"}
        </h2>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            className="h-11 rounded-lg border-2 border-cyan-400 font-semibold text-cyan-500"
            onClick={onConfirm}
          >
            نعم
          </button>
          <button
            type="button"
            className="h-11 rounded-lg bg-gradient-to-l from-[#67d2cb] to-[#0fb8e8] font-semibold text-white"
            onClick={onCancel}
          >
            لا
          </button>
        </div>
      </div>
    </div>
  );
}
