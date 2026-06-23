import { LogOut, X } from "lucide-react";
import { createPortal } from "react-dom";

export default function LogoutConfirmModal({ open, onCancel, onConfirm }) {
  if (!open) return null;

  const modal = (
    <div
      className="fixed inset-0 z-[1000] grid place-items-center bg-black/45 px-4"
      dir="rtl"
      role="dialog"
      aria-modal="true"
      aria-labelledby="logout-confirm-title"
    >
      <div className="w-full max-w-[420px] rounded-2xl bg-white p-6 text-center shadow-[0_24px_70px_rgba(0,0,0,0.28)] dark:bg-[#383838]">
        <button
          type="button"
          className="mr-auto grid size-9 place-items-center rounded-full text-[#777] transition hover:bg-[#F2F2F2] dark:text-[#D8D8D8] dark:hover:bg-white/10"
          onClick={onCancel}
          aria-label="إغلاق"
        >
          <X size={20} />
        </button>

        <div className="mx-auto mt-1 grid size-16 place-items-center rounded-full bg-red-50 text-[#D92727] dark:bg-red-950/25">
          <LogOut size={30} strokeWidth={1.8} />
        </div>

        <h2 id="logout-confirm-title" className="mt-5 text-xl font-bold text-[#333333] dark:text-[#F0F0F0]">
          هل أنت متأكد من تسجيل الخروج من هذا الحساب؟
        </h2>

        <div className="mt-7 grid grid-cols-2 gap-3">
          <button
            type="button"
            className="min-h-11 rounded-xl border border-[#D8D8D8] px-4 font-bold text-[#555555] transition hover:bg-[#F7F7F7] dark:border-[#5A5A5A] dark:text-[#F0F0F0] dark:hover:bg-white/10"
            onClick={onCancel}
          >
            إلغاء
          </button>
          <button
            type="button"
            className="min-h-11 rounded-xl bg-[#D92727] px-4 font-bold text-white transition hover:bg-[#B91F1F]"
            onClick={onConfirm}
          >
            تسجيل الخروج
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}
