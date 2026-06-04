export default function TermsCheckbox() {
  return (
    <div className="flex items-center justify-between gap-4">
      <a href="#" className="text-sm font-semibold text-gray-900 underline">
        الشروط والأحكام
      </a>

      <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-900">
        <input
          type="checkbox"
          className="checkbox checkbox-xs rounded border-gray-400"
        />
        <span>أوافق على جميع الشروط والأحكام</span>
      </label>
    </div>
  );
}