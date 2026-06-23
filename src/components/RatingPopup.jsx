import { useState } from "react";
import { FaRegStar, FaStar, FaStarHalfAlt } from "react-icons/fa";

function StarRating({ value, onChange }) {
  const [hovered, setHovered] = useState(0);
  const display = hovered || value;

  const getStarValue = (star, event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    return x < rect.width / 2 ? star - 0.5 : star;
  };

  return (
    <div className="flex gap-2" dir="ltr">
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = display >= star;
        const half = !filled && display >= star - 0.5;
        return (
          <button
            key={star}
            type="button"
            className="transition-transform hover:scale-110 focus:outline-none"
            onMouseMove={(e) => setHovered(getStarValue(star, e))}
            onMouseLeave={() => setHovered(0)}
            onClick={(e) => onChange(getStarValue(star, e))}
          >
            {filled ? (
              <FaStar className="text-[42px] text-[#FFC107]" />
            ) : half ? (
              <FaStarHalfAlt className="text-[42px] text-[#FFC107]" />
            ) : (
              <FaRegStar className="text-[42px] text-[#D9D9D9]" />
            )}
          </button>
        );
      })}
    </div>
  );
}

export default function RatingPopup({
  appointment,
  remainingCount = 1,
  onSubmit,
  onSkip,
}) {
  const [rating, setRating] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const doctorName = appointment?.doctor || appointment?.doctorName || "الطبيب";

  const handleSubmit = async () => {
    if (!rating) return;
    setLoading(true);
    setError("");
    try {
      await onSubmit({ appointmentId: appointment.id, stars: rating, comment: "" });
    } catch {
      setError("حدث خطأ أثناء الإرسال، حاول مرة أخرى");
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[1000] grid place-items-center bg-black/45 px-4"
      dir="rtl"
      role="dialog"
      aria-modal="true"
    >
      <div className="w-full max-w-[440px] rounded-2xl bg-white px-8 py-8 text-center shadow-[0_24px_70px_rgba(0,0,0,0.28)] dark:bg-[#383838]">
        <p className="text-[20px] font-bold leading-7 text-[#333] dark:text-white">
          قيّم تجربتك مع الطبيب
        </p>
        <p className="mt-2 text-[16px] font-semibold text-[#555] dark:text-gray-200">
          د. {doctorName}
        </p>
        {remainingCount > 1 && (
          <p className="mt-1 text-[13px] text-[#888] dark:text-gray-400">
            متبقي {remainingCount} تقييمات
          </p>
        )}

        <div className="my-6 flex justify-center">
          <StarRating value={rating} onChange={setRating} />
        </div>

        {rating > 0 && (
          <p className="text-[14px] font-semibold text-[#f2aa00]">
            تقييمك: {rating} من 5
          </p>
        )}

        {error && (
          <p className="mt-2 text-sm font-semibold text-red-500">{error}</p>
        )}

        <div className="mt-5 grid grid-cols-2 gap-3" dir="ltr">
          <button
            type="button"
            disabled={loading || !rating}
            onClick={handleSubmit}
            className="h-[48px] rounded-xl bg-gradient-to-l from-[#67d2cb] to-[#0fb8e8] text-[16px] font-semibold text-white transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "جاري الإرسال..." : "إرسال"}
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={onSkip}
            className="h-[48px] rounded-xl border border-[#0fb8e8] text-[16px] font-semibold text-[#0fb8e8] transition hover:bg-[#0fb8e8]/10 disabled:opacity-60"
          >
            تخطى
          </button>
        </div>
      </div>
    </div>
  );
}
