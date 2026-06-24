import { useEffect, useState } from "react";

export default function ProfileAvatar({ src, alt = "", className = "", onError }) {
  const [imageFailed, setImageFailed] = useState(false);

  useEffect(() => {
    setImageFailed(false);
  }, [src]);

  if (src && !imageFailed) {
    return (
      <img
        src={src}
        alt={alt}
        className={className}
        onError={(event) => {
          setImageFailed(true);
          onError?.(event);
        }}
      />
    );
  }

  return (
    <div
      aria-label={alt}
      className={`flex items-center justify-center bg-[#ddf0f4] text-[#7ab8c8] ${className}`}
    >
      <svg
        viewBox="0 0 24 24"
        fill="currentColor"
        className="h-[55%] w-[55%]"
        aria-hidden="true"
      >
        <path d="M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10zm0 2c-5.33 0-8 2.67-8 4v1h16v-1c0-1.33-2.67-4-8-4z" />
      </svg>
    </div>
  );
}
