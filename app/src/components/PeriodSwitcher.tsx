import { useEffect, useRef } from "react";
import { useWalletStore } from "../store/useWalletStore";

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export default function PeriodSwitcher() {
  const month = useWalletStore((s) => s.month);
  const year = useWalletStore((s) => s.year);
  const setMonth = useWalletStore((s) => s.setMonth);
  const setYear = useWalletStore((s) => s.setYear);

  // The strip scrolls, but nothing dragged the selected month into view: on a
  // phone you would open the app in September and see January.
  // Nothing has happened in the future, so there is nothing to look at there.
  // The control stops rather than letting you wander into empty years and
  // wonder whether the data failed to load.
  const currentYear = new Date().getFullYear();
  const canGoForward = year < currentYear;

  const activeRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    activeRef.current?.scrollIntoView({ block: "nearest", inline: "center" });
  }, [month]);

  // Year and months line up because they are built the same way, not because
  // an offset was tuned until it looked right: same font size, same pb-2, same
  // kind of box, all sitting on the row's rule. Matching boxes of different
  // shapes — a padded pill against bare text — is what left the two baselines
  // 5.7px apart before, and any hand-picked margin would drift again the next
  // time a font or size changed.
  return (
    <div className="flex items-stretch gap-3 sm:gap-4 border-b border-stone-100">
      {/* The transparent border matches the months' border-b-2, so both boxes
          end at exactly the same place instead of one pixel apart. */}
      <div className="flex items-center gap-0.5 shrink-0 pb-2 border-b-2 border-transparent">
        <button
          onClick={() => setYear(year - 1)}
          aria-label="Previous year"
          className="w-6 h-6 flex items-center justify-center rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
        >
          ‹
        </button>
        <span className="text-sm font-semibold text-stone-600 tabular-nums px-1">
          {year}
        </span>
        <button
          onClick={() => setYear(year + 1)}
          disabled={!canGoForward}
          aria-label="Next year"
          title={canGoForward ? undefined : "Nothing recorded past this year"}
          className={`w-6 h-6 flex items-center justify-center rounded-lg transition-colors ${
            canGoForward
              ? "text-stone-400 hover:text-stone-700 hover:bg-stone-100"
              : "text-stone-200 cursor-not-allowed"
          }`}
        >
          ›
        </button>
      </div>

      <div className="flex items-stretch gap-3 overflow-x-auto scrollbar-none flex-1">
        {MONTHS.map((m, i) => {
          const isActive = i + 1 === month;
          return (
            <button
              key={m}
              ref={isActive ? activeRef : null}
              onClick={() => setMonth(i + 1)}
              className={`shrink-0 pb-2 text-sm transition-colors border-b-2 whitespace-nowrap ${
                isActive
                  ? "font-semibold text-stone-800 border-amber-500"
                  : "font-normal text-stone-400 border-transparent hover:text-stone-600"
              }`}
            >
              {m}
            </button>
          );
        })}
      </div>
    </div>
  );
}
