import { useEffect, useRef, useState } from "react";
import { Activity, Clock3, LoaderCircle, ShieldCheck, UserRound } from "lucide-react";

const ACTIVITIES_BATCH_SIZE = 10;
const LOAD_MORE_DELAY_MS = 1200;

function formatActivityDate(value) {
  if (!value) return "";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);

  return new Intl.DateTimeFormat("ar-EG", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function ActivityState({ children, compact }) {
  return (
    <div
      className={`grid place-items-center px-4 text-center font-medium text-[#666] dark:text-gray-200 ${
        compact ? "h-[219px] text-[16px]" : "min-h-[620px] text-[20px]"
      }`}
    >
      {children}
    </div>
  );
}

export default function ActivityList({
  activities,
  loading = false,
  error = "",
  compact = false,
  showRole = true,
  showActorName = true,
  insetItems = true,
}) {
  const [visibleCount, setVisibleCount] = useState(ACTIVITIES_BATCH_SIZE);
  const [loadingMore, setLoadingMore] = useState(false);
  const loadMoreRef = useRef(null);
  const loadingMoreRef = useRef(false);
  const loadMoreTimerRef = useRef(null);

  useEffect(() => {
    if (compact || loading || error || visibleCount >= activities.length) {
      return undefined;
    }

    const loadMoreElement = loadMoreRef.current;
    if (!loadMoreElement) return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || loadingMoreRef.current) return;

        observer.disconnect();
        loadingMoreRef.current = true;
        setLoadingMore(true);
        loadMoreTimerRef.current = setTimeout(() => {
          setVisibleCount((currentCount) =>
            Math.min(currentCount + ACTIVITIES_BATCH_SIZE, activities.length),
          );
          loadingMoreRef.current = false;
          setLoadingMore(false);
        }, LOAD_MORE_DELAY_MS);
      },
      { rootMargin: "40px 0px" },
    );

    observer.observe(loadMoreElement);
    return () => {
      observer.disconnect();
      if (loadMoreTimerRef.current) {
        clearTimeout(loadMoreTimerRef.current);
        loadMoreTimerRef.current = null;
      }
    };
  }, [activities.length, compact, error, loading, visibleCount]);

  if (loading) {
    return <ActivityState compact={compact}>جاري تحميل النشاطات...</ActivityState>;
  }

  if (error) {
    return <ActivityState compact={compact}>{error}</ActivityState>;
  }

  if (activities.length === 0) {
    return (
      <ActivityState compact={compact}>
        لا يوجد نشاط من قاعدة البيانات حتى الآن
      </ActivityState>
    );
  }

  const visibleActivities = compact
    ? activities.slice(0, 3)
    : activities.slice(0, visibleCount);
  const hasMoreActivities = !compact && visibleCount < activities.length;

  return (
    <div
      className={
        compact
          ? "h-[238px] overflow-hidden"
          : "divide-y divide-[#edf1f3] dark:divide-white/10"
      }
    >
      {visibleActivities.map((activityItem, index) => {
        const formattedDate = formatActivityDate(activityItem.createdAt);

        return (
          <article
            key={`${activityItem.id}-${index}`}
            className={`flex items-start gap-3 text-right ${
              compact
                ? "border-b border-[#edf1f3] py-3 last:border-0 dark:border-white/10"
                : `${insetItems ? "px-4 sm:px-6" : ""} py-5 transition hover:bg-[#f8fcfd] dark:hover:bg-white/5`
            }`}
            dir="rtl"
          >
            <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#e8fafd] text-[#25b8d1]">
              <Activity size={18} strokeWidth={2} />
            </span>

            <div className="min-w-0 flex-1">
              <p
                className={`font-semibold leading-6 text-[#333] dark:text-white ${
                  compact ? "truncate text-[14px]" : "text-[16px]"
                }`}
                title={activityItem.description}
              >
                {activityItem.description}
              </p>

              {((showActorName && activityItem.actorName) ||
                (showRole && activityItem.actorRole) ||
                formattedDate) && (
                <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-[12px] text-[#8a8a8a] dark:text-gray-300">
                  {showActorName && activityItem.actorName && (
                    <span className="flex items-center gap-1">
                      <UserRound size={13} />
                      {activityItem.actorName}
                    </span>
                  )}
                  {showRole && activityItem.actorRole && (
                    <span className="flex items-center gap-1 text-[#22a9c2] dark:text-[#60d7ea]">
                      <ShieldCheck size={13} />
                      {activityItem.actorRole}
                    </span>
                  )}
                  {formattedDate && (
                    <time
                      className="flex items-center gap-1"
                      dateTime={activityItem.createdAt}
                    >
                      <Clock3 size={13} />
                      {formattedDate}
                    </time>
                  )}
                </div>
              )}
            </div>
          </article>
        );
      })}

      {hasMoreActivities && (
        <div
          ref={loadMoreRef}
          className="flex min-h-[72px] items-center justify-center gap-2 py-5 text-center text-[14px] font-medium text-[#8a8a8a] dark:text-gray-300"
        >
          {loadingMore ? (
            <>
              <LoaderCircle className="animate-spin text-[#25b8d1]" size={19} />
              <span>جاري تحميل نشاطات إضافية...</span>
            </>
          ) : (
            "مرّر لعرض نشاطات أكثر..."
          )}
        </div>
      )}
    </div>
  );
}
