import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

export const arrowButtonClass =
  "inline-grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#3d3d3d] text-[#05ADE8] shadow-sm transition hover:bg-[#4a4a4a] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#05ADE8] disabled:cursor-not-allowed disabled:opacity-40";

export function ArrowGlyph({ size = 18, className = "" }) {
  return <ArrowLeft size={size} strokeWidth={2.25} className={className} />;
}

export function ArrowButton({
  to,
  onClick,
  className = "",
  ariaLabel = "Back",
  children,
  type = "button",
  ...props
}) {
  const classes = `${arrowButtonClass} ${className}`.trim();
  const content = children || <ArrowGlyph />;

  if (to) {
    return (
      <Link to={to} className={classes} aria-label={ariaLabel} {...props}>
        {content}
      </Link>
    );
  }

  return (
    <button
      type={type}
      onClick={onClick}
      className={classes}
      aria-label={ariaLabel}
      {...props}
    >
      {content}
    </button>
  );
}

export function ArrowBadge({ className = "", children }) {
  return (
    <span className={`${arrowButtonClass} ${className}`.trim()}>
      {children || <ArrowGlyph />}
    </span>
  );
}
