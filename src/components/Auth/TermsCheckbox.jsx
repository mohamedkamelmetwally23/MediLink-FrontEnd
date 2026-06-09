import { Link } from "react-router-dom";

export default function TermsCheckbox() {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4">
      <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-900 dark:text-[#F0F0F0]">
        <input
          type="checkbox"
          className="checkbox checkbox-xs rounded border-gray-400"
        />
        <span>أوافق على جميع</span>
      </label>

      <div className="flex items-center gap-2 text-sm">
        <Link
          to="/terms"
          className="font-semibold text-[#05ADE8] underline underline-offset-4"
        >
          الشروط
        </Link>
        <span>و</span>
        <Link
          to="/conditions"
          className="font-semibold text-[#05ADE8] underline underline-offset-4"
        >
          الأحكام
        </Link>
      </div>
    </div>
  );
}
