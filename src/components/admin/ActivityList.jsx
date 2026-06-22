import { Activity, Clock3, UserRound } from "lucide-react";

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
}) {
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

  const visibleActivities = compact ? activities.slice(0, 4) : activities;

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
                : "px-4 py-5 transition hover:bg-[#f8fcfd] dark:hover:bg-white/5 sm:px-6"
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

              {(activityItem.actorName || formattedDate) && (
                <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-[12px] text-[#8a8a8a] dark:text-gray-300">
                  {activityItem.actorName && (
                    <span className="flex items-center gap-1">
                      <UserRound size={13} />
                      {activityItem.actorName}
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
    </div>
  );
}
