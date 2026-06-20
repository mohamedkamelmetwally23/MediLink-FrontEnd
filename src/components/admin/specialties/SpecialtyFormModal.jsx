import { useState } from "react";

const errorTextClass = "text-[#ff4f4f]";
const errorBorderClass = "border-[#ff5c5c]";

export default function SpecialtyFormModal({
  mode,
  initialName = "",
  error,
  onSubmit,
  onCancel,
}) {
  const [name, setName] = useState(initialName);

  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit(name);
  };

  return (
    <div className="fixed inset-0 z-[60] grid place-items-center bg-black/35 p-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-[468px] rounded-xl bg-white p-6 shadow-2xl dark:bg-[#454545]"
      >
        <h2 className="mb-8 text-center text-2xl font-bold">
          {mode === "edit" ? "تعديل التخصص" : "إضافة تخصص جديد"}
        </h2>

        <label className="block text-right">
          <span
            className={`mb-1.5 block text-[14px] font-medium ${
              error ? errorTextClass : "text-[#111] dark:text-white"
            }`}
          >
            اسم التخصص
            <span className={`mr-1 ${errorTextClass}`}>*</span>
          </span>
          <input
            value={name}
            maxLength={50}
            onChange={(event) => setName(event.target.value)}
            className={`h-[52px] w-full rounded-[10px] border bg-[#eee] px-4 text-[#333] outline-none transition dark:bg-[#505050] dark:text-white ${
              error ? errorBorderClass : "border-transparent focus:border-cyan-400"
            }`}
            placeholder="اكتب الاسم هنا"
          />
        </label>

        {error && <p className={`mt-3 text-center text-[12px] font-medium leading-[1.35] ${errorTextClass}`}>{error}</p>}

        <div className="mt-5 grid gap-2 sm:grid-cols-2">
          <button
            type="submit"
            className="h-11 rounded-lg bg-gradient-to-l from-[#67d2cb] to-[#0fb8e8] font-semibold text-white"
          >
            {mode === "edit" ? "حفظ التعديل" : "إضافة"}
          </button>
          <button
            type="button"
            className="h-11 rounded-lg border-2 border-cyan-400 font-semibold text-cyan-500"
            onClick={onCancel}
          >
            إلغاء
          </button>
        </div>
      </form>
    </div>
  );
}
