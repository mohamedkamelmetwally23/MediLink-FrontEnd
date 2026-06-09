import { useEffect, useState } from "react";

export default function SpecialtyFormModal({
  mode,
  initialName = "",
  error,
  onSubmit,
  onCancel,
}) {
  const [name, setName] = useState(initialName);

  useEffect(() => {
    setName(initialName);
  }, [initialName]);

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
            className={`mb-2 block font-semibold ${
              error ? "text-red-500" : "text-[#111] dark:text-white"
            }`}
          >
            اسم التخصص
            <span className="mr-1 text-red-500">*</span>
          </span>
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            className={`h-[52px] w-full rounded-xl border bg-[#eee] px-4 text-[#333] outline-none transition dark:bg-[#505050] dark:text-white ${
              error ? "border-red-500" : "border-transparent focus:border-cyan-400"
            }`}
            placeholder="اكتب الاسم هنا"
          />
        </label>

        {error && <p className="mt-4 text-center font-semibold text-red-500">{error}</p>}

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
