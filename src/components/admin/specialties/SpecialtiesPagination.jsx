import { ChevronLeft, ChevronsLeft } from "lucide-react";

export default function SpecialtiesPagination({
  currentPage,
  totalPages,
  onPageChange,
}) {
  const pages = Array.from({ length: totalPages }, (_, index) => index + 1);

  return (
    <div className="flex flex-wrap items-center justify-center gap-3 py-5 font-semibold">
      <button
        type="button"
        aria-label="الصفحة الأولى"
        disabled={currentPage === 1}
        className="rotate-180 disabled:cursor-not-allowed disabled:opacity-40"
        onClick={() => onPageChange(1)}
      >
        <ChevronsLeft size={18} />
      </button>
      <button
        type="button"
        aria-label="الصفحة السابقة"
        disabled={currentPage === 1}
        className="rotate-180 disabled:cursor-not-allowed disabled:opacity-40"
        onClick={() => onPageChange(currentPage - 1)}
      >
        <ChevronLeft size={18} />
      </button>

      {pages.map((page) => (
        <button
          key={page}
          type="button"
          className={`grid h-8 w-8 place-items-center rounded-full ${
            page === currentPage ? "bg-cyan-400 text-white" : ""
          }`}
          onClick={() => onPageChange(page)}
        >
          {page}
        </button>
      ))}

      <button
        type="button"
        aria-label="الصفحة التالية"
        disabled={currentPage === totalPages}
        className="disabled:cursor-not-allowed disabled:opacity-40"
        onClick={() => onPageChange(currentPage + 1)}
      >
        <ChevronLeft size={18} />
      </button>
      <button
        type="button"
        aria-label="الصفحة الأخيرة"
        disabled={currentPage === totalPages}
        className="disabled:cursor-not-allowed disabled:opacity-40"
        onClick={() => onPageChange(totalPages)}
      >
        <ChevronsLeft size={18} />
      </button>
    </div>
  );
}
