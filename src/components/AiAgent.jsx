import { useState } from "react";
import { toast } from "react-toastify";

export default function AiAgent() {
  const [message, setMessage] = useState("");

  const handleSend = () => {
    if (!message.trim()) {
      toast.warning("اكتب رسالتك أولًا");
      return;
    }

    toast.success("تم إرسال الرسالة للمساعد الذكي");
    setMessage("");
  };

  return (
    <section className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="flex flex-col items-center gap-4 text-center">
        <h2 className="text-3xl font-semibold dark:text-[#F0F0F0] sm:text-4xl">
          <span className="text-[#05ADE8]">مساعدك الذكي</span> للرعاية الصحية
        </h2>
        <p className="max-w-2xl leading-7 text-[#6D6D6D] dark:text-[#D2D2D2]">
          اسأل عن الأعراض أو التخصصات أو الأطباء، والمساعد الذكي يساعدك في
          الوصول للخدمة المناسبة بسرعة.
        </p>

        <div className="mt-4 w-full rounded-xl border-4 border-[#05ADE8] bg-white dark:bg-[#252525]">
          <textarea
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            placeholder="اكتب رسالتك هنا..."
            className="min-h-28 w-full resize-none bg-transparent p-4 text-right outline-none placeholder:text-gray-400 dark:text-[#F0F0F0]"
          />

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-cyan-100 p-3 dark:border-[#3C3C3C]">
            <button
              type="button"
              onClick={() => toast.info("رفع الملفات سيكون متاحًا قريبًا")}
              className="btn btn-ghost btn-sm"
            >
              إضافة ملف
            </button>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => toast.info("التسجيل الصوتي سيكون متاحًا قريبًا")}
                className="btn btn-ghost btn-sm"
              >
                تسجيل صوتي
              </button>
              <button
                type="button"
                onClick={handleSend}
                className="btn btn-sm border-none bg-linear-to-r from-[#05ADE8] to-[#6CCCC8] px-6 text-white dark:text-black"
              >
                إرسال
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
