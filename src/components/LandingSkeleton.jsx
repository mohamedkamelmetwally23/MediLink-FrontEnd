export default function LandingSkeleton() {
  return (
    <main className="min-h-screen bg-white px-4 py-4 dark:bg-[#2E2E2E]">
      <div className="mx-auto max-w-7xl space-y-8">
        <div className="flex items-center justify-between">
          <div className="skeleton h-10 w-32 rounded-lg" />
          <div className="hidden gap-3 md:flex">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="skeleton h-8 w-20 rounded-lg" />
            ))}
          </div>
          <div className="flex gap-2">
            <div className="skeleton h-10 w-24 rounded-lg" />
            <div className="skeleton h-10 w-24 rounded-lg" />
          </div>
        </div>

        <section className="grid min-h-[520px] gap-8 md:grid-cols-2 md:items-center">
          <div className="space-y-5">
            <div className="skeleton h-14 w-4/5 rounded-lg" />
            <div className="skeleton h-14 w-3/5 rounded-lg" />
            <div className="skeleton h-5 w-full rounded-lg" />
            <div className="skeleton h-5 w-11/12 rounded-lg" />
            <div className="flex gap-3">
              <div className="skeleton h-12 w-36 rounded-lg" />
              <div className="skeleton h-12 w-36 rounded-lg" />
            </div>
          </div>

          <div className="flex justify-center">
            <div className="skeleton aspect-square w-full max-w-[420px] rounded-full" />
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="skeleton h-32 rounded-xl" />
          ))}
        </section>

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="skeleton h-44 rounded-xl" />
          ))}
        </section>
      </div>
    </main>
  );
}
