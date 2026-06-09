function SkeletonLine({ className = "" }) {
  return <div className={`skeleton ${className}`} />;
}

function AdminSkeleton() {
  return (
    <div className="flex min-h-screen bg-[#f8f8f8] dark:bg-[#2f2f2f]">
      <aside className="hidden w-[300px] shrink-0 bg-white dark:bg-[#3a3a3a] lg:block">
        <div className="h-[227px] bg-gradient-to-b from-[#0fb8e8] to-[#63d5df]" />
        <div className="mx-auto mt-8 h-28 w-28 rounded-full bg-white p-2 dark:bg-[#3a3a3a]">
          <SkeletonLine className="h-full w-full rounded-full" />
        </div>
        <div className="mx-8 mt-8 space-y-4">
          {Array.from({ length: 6 }).map((_, index) => (
            <SkeletonLine key={index} className="h-11 rounded-xl" />
          ))}
        </div>
      </aside>

      <main className="min-w-0 flex-1">
        <header className="flex min-h-[120px] items-end bg-white px-8 pb-8 shadow-sm dark:bg-[#3a3a3a]">
          <div className="w-full max-w-md space-y-3">
            <SkeletonLine className="h-8 w-48 rounded-lg" />
            <SkeletonLine className="h-4 w-full rounded-lg" />
          </div>
        </header>

        <section className="p-4 sm:p-6 lg:p-8">
          <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:justify-between">
            <SkeletonLine className="h-[52px] w-full rounded-xl lg:w-[310px]" />
            <SkeletonLine className="h-[52px] w-40 rounded-xl" />
          </div>

          <div className="overflow-hidden rounded-xl bg-white p-6 shadow-[0_0_20px_rgba(0,0,0,0.06)] dark:bg-[#3b3b3b]">
            <SkeletonLine className="mb-5 h-12 rounded-lg" />
            <div className="space-y-4">
              {Array.from({ length: 8 }).map((_, index) => (
                <SkeletonLine key={index} className="h-11 rounded-lg" />
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

function AuthRouteSkeleton() {
  return (
    <main className="flex min-h-screen w-full items-center justify-center bg-[#D3E0E4] p-4 dark:bg-[#151515]">
      <div className="flex w-full max-w-[1200px] flex-col overflow-hidden rounded-[2rem] bg-white shadow-[0_25px_80px_-35px_rgba(0,0,0,0.25)] dark:bg-[#252525] lg:min-h-[760px] lg:flex-row-reverse">
        <div className="hidden w-1/2 bg-[#f0f0f0] p-10 dark:bg-[#3a3a3a] lg:block">
          <SkeletonLine className="h-full rounded-[2rem]" />
        </div>
        <div className="grid flex-1 place-items-center p-8">
          <div className="w-full max-w-[420px] space-y-5">
            <SkeletonLine className="mx-auto h-9 w-48 rounded-lg" />
            <SkeletonLine className="mx-auto h-4 w-64 rounded-lg" />
            {Array.from({ length: 5 }).map((_, index) => (
              <SkeletonLine key={index} className="h-12 rounded-lg" />
            ))}
            <SkeletonLine className="h-12 rounded-lg" />
          </div>
        </div>
      </div>
    </main>
  );
}

function LandingRouteSkeleton() {
  return (
    <main className="min-h-screen bg-white px-4 py-5 dark:bg-[#2E2E2E]">
      <div className="mx-auto max-w-7xl space-y-8">
        <div className="flex items-center justify-between">
          <SkeletonLine className="h-10 w-32 rounded-lg" />
          <div className="hidden gap-3 md:flex">
            {Array.from({ length: 5 }).map((_, index) => (
              <SkeletonLine key={index} className="h-8 w-20 rounded-lg" />
            ))}
          </div>
          <div className="flex gap-2">
            <SkeletonLine className="h-10 w-24 rounded-lg" />
            <SkeletonLine className="h-10 w-24 rounded-lg" />
          </div>
        </div>

        <section className="grid min-h-[520px] gap-8 md:grid-cols-2 md:items-center">
          <div className="space-y-5">
            <SkeletonLine className="h-14 w-4/5 rounded-lg" />
            <SkeletonLine className="h-14 w-3/5 rounded-lg" />
            <SkeletonLine className="h-5 w-full rounded-lg" />
            <SkeletonLine className="h-5 w-11/12 rounded-lg" />
            <div className="flex gap-3">
              <SkeletonLine className="h-12 w-36 rounded-lg" />
              <SkeletonLine className="h-12 w-36 rounded-lg" />
            </div>
          </div>
          <SkeletonLine className="mx-auto aspect-square w-full max-w-[420px] rounded-full" />
        </section>
      </div>
    </main>
  );
}

export default function RouteSkeleton({ pathname }) {
  if (pathname.startsWith("/admin")) return <AdminSkeleton />;
  if (
    pathname.startsWith("/login") ||
    pathname.startsWith("/register") ||
    pathname.startsWith("/forgot-password")
  ) {
    return <AuthRouteSkeleton />;
  }

  return <LandingRouteSkeleton />;
}
