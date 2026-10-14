import { DashboardHomeShell } from '@/components/DashboardHomeShell';
import { NotificationListSkeleton } from '@/components/notifications/NotificationGroupedList';

/*
 * Route loading state with the page's anatomy (NotificationsPageClient): the same frame and column,
 * the title row, the chips (below lg), a day of placeholder rows, and the rail's outlined box from
 * lg. Literal colours: the News token scope does not exist yet.
 */
const BLOCK = 'animate-pulse rounded-md bg-black/[0.07] dark:bg-white/[0.08]';
const RAIL_BOX = 'shadow-[inset_0_0_0_1px_#d6dee3] dark:shadow-[inset_0_0_0_1px_#1f2226]';

export default function NotificationsLoading() {
  return (
    <DashboardHomeShell fullWidth>
      <div className="pb-24 pt-3 sm:px-8 sm:pt-5 md:px-12 lg:px-16 lg:pt-8">
        <div className="mx-auto grid w-full max-w-[600px] items-start gap-8 lg:max-w-[1240px] lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-10 xl:grid-cols-[minmax(0,1fr)_400px] xl:gap-12">
          <div className="flex w-full min-w-0 flex-col gap-3">
            <div className="flex min-h-12 items-center gap-3 px-5 sm:px-1" aria-hidden>
              <div className={`h-6 w-40 ${BLOCK}`} />
            </div>
            <div className="flex gap-2 overflow-hidden px-5 sm:px-0 lg:hidden" aria-hidden>
              {['w-12', 'w-24', 'w-24', 'w-20'].map((width, index) => (
                <div key={index} className={`h-9 shrink-0 !rounded-full ${BLOCK} ${width}`} />
              ))}
            </div>
            <div className="pt-3 lg:pt-1">
              <NotificationListSkeleton />
            </div>
          </div>
          <div className="hidden lg:block" aria-hidden>
            <div className={`h-[14rem] w-full ${RAIL_BOX}`} />
          </div>
        </div>
      </div>
    </DashboardHomeShell>
  );
}
