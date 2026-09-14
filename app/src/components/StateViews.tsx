import { Button } from "./ui";
import Skeleton from "./ui/Skeleton";

/** Failed requests need a way out that is not "reload the page" — on a phone
 *  with flaky signal this is the common case, not the rare one. */
export function ErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry?: () => void;
}) {
  return (
    <div className="flex flex-col items-center gap-3 py-12">
      <p className="text-sm text-rose-500">{message}</p>
      {onRetry && (
        <Button variant="secondary" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  );
}

/** Empty is a dead end unless it offers the next step. */
export function EmptyState({
  title,
  hint,
  actionLabel,
  onAction,
}: {
  title: string;
  hint?: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <div className="flex flex-col items-center gap-2 py-12 px-6 text-center">
      <p className="text-sm font-medium text-stone-500">{title}</p>
      {hint && <p className="text-xs text-stone-400 max-w-xs">{hint}</p>}
      {actionLabel && onAction && (
        <Button className="mt-2" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}

export function SummaryCardsSkeleton() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
      <Skeleton className="h-24 col-span-2 sm:col-span-1" />
      <Skeleton className="h-24" />
      <Skeleton className="h-24" />
    </div>
  );
}

export function TransactionListSkeleton() {
  return (
    <div className="space-y-5">
      {[0, 1].map((group) => (
        <div key={group}>
          <Skeleton className="h-3 w-32 mb-2 rounded-lg" />
          <Skeleton className="h-28" />
        </div>
      ))}
    </div>
  );
}

export function PlanSkeleton() {
  return (
    <div className="space-y-4">
      {[0, 1, 2].map((row) => (
        <Skeleton key={row} className="h-24" />
      ))}
    </div>
  );
}

export function SettingsSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-18" />
      <Skeleton className="h-40" />
      <Skeleton className="h-40" />
      <Skeleton className="h-40" />
    </div>
  );
}
