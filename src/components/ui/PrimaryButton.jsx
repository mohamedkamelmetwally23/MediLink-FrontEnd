export default function PrimaryButton({
  children,
  disabled = false,
  type = "submit",
}) {
  return (
    <button
      type={type}
      disabled={disabled}
      className={
        disabled
          ? "btn h-12 w-full rounded-lg border-none bg-gray-300 text-sm font-normal text-white hover:bg-gray-300"
          : "btn h-12 w-full rounded-lg border-none bg-gradient-to-r from-[#05ADE8] to-[#6CCCC8] text-sm font-normal text-white hover:from-[#05ADE8] hover:to-[#6CCCC8]"
      }
    >
      {children}
    </button>
  );
}
