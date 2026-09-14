import { useEffect, useRef } from "react";
import { useWalletStore } from "../store/useWalletStore";

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

export default function PeriodSwitcher() {
  const month = useWalletStore((s) => s.month);
  const year = useWalletStore((s) => s.year);
  const setMonth = useWalletStore((s) => s.setMonth);
  const setYear = useWalletStore((s) => s.setYear);

  // The strip scrolls, but nothing dragged the selected month into view: on a
  // phone you would open the app in September and see January.
  const activeRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    activeRef.current?.scrollIntoView({ block: "nearest", inline: "center" });
  }, [month]);

  return (
    <div className="flex items-center gap-2 sm:gap-3">
      {/* Year stepper. Replaces the old static "Period ›" chip, which was
          decoration: the store had a year all along with no way to change it. */}
      <div className="flex items-center gap-0.5 shrink-0 bg-stone-100 rounded-2xl px-1 py-1">
        <button
          onClick={() => setYear(year - 1)}
          aria-label="Previous year"
          className="w-7 h-7 flex items-center justify-center rounded-xl text-stone-400 hover:text-stone-700 hover:bg-white transition-colors"
        >
          ‹
        </button>
        <span className="text-xs font-semibold text-stone-600 tabular-nums px-0.5">
          {year}
        </span>
        <button
          onClick={() => setYear(year + 1)}
          aria-label="Next year"
          className="w-7 h-7 flex items-center justify-center rounded-xl text-stone-400 hover:text-stone-700 hover:bg-white transition-colors"
        >
          ›
        </button>
      </div>

      {/* No baseline rule: it ran under the months but not under the year chip,
          which sat 5px taller and crossed it. An active pill has nothing to
          line up with, and matches how the navbar marks the current page. */}
      <div className="flex items-center gap-1 overflow-x-auto scrollbar-none flex-1">
        {MONTHS.map((m, i) => {
          const isActive = i + 1 === month;
          return (
            <button
              key={m}
              ref={isActive ? activeRef : null}
              onClick={() => setMonth(i + 1)}
              className={`shrink-0 px-3 py-1.5 rounded-2xl text-sm transition-colors whitespace-nowrap ${
                isActive
                  ? "font-semibold text-amber-700 bg-amber-50"
                  : "font-normal text-stone-400 hover:text-stone-700 hover:bg-stone-50"
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
