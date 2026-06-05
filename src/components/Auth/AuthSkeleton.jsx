export default function AuthSkeleton({ title = "جاري التحميل..." }) {
  return (
    <section className="flex w-full items-center justify-center bg-white px-6 py-10 dark:bg-[#252525] lg:basis-1/2 lg:min-h-full lg:px-10">
      <div className="w-full max-w-[430px]" dir="rtl">
        <div className="mb-10 text-center">
          <div className="skeleton mx-auto mb-3 h-8 w-40 rounded-md" />
          <p className="text-sm text-gray-500 dark:text-[#D2D2D2]">{title}</p>
        </div>

        <div className="space-y-4">
          <div className="skeleton h-12 w-full rounded-lg" />
          <div className="skeleton h-12 w-full rounded-lg" />
          <div className="grid grid-cols-6 gap-2">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="skeleton h-11 rounded-lg" />
            ))}
          </div>
          <div className="skeleton mt-6 h-12 w-full rounded-lg" />
        </div>
      </div>
    </section>
  );
}
