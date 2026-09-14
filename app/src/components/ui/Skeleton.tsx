/** Grey placeholder shaped like the content it stands in for, so nothing
 *  jumps when the real data arrives. */
export default function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div className={`bg-stone-200/70 rounded-2xl animate-pulse ${className}`} />
  );
}
