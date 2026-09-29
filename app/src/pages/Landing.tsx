import { Link } from "react-router-dom";
import { Button } from "../components/ui";

const FEATURES = [
  {
    title: "Multiple wallets",
    body: "Track separate wallets in different currencies — cash, cards, savings — without mixing the numbers.",
  },
  {
    title: "Fixed vs. varying categories",
    body: "Rent and a phone bill only need a paid/not-paid check. Groceries need a pace. The plan treats each one differently instead of pretending they're the same kind of number.",
  },
  {
    title: "Reports that compare, not just list",
    body: "Every month is measured against the same stretch of the previous one and the long-run average — cut at the same day, so a half-finished month never looks better than it is.",
  },
  {
    title: "Built mobile-first",
    body: "A bottom tab bar, two-tap delete, skeleton loading — designed to be used standing at a checkout, not just at a desk.",
  },
];

const STEPS = [
  { n: "01", label: "Create a wallet", body: "Give it a name and a currency." },
  { n: "02", label: "Add categories", body: "Mark each one fixed or varying — rent behaves differently from coffee." },
  { n: "03", label: "Log as you spend", body: "A transaction takes one tap once you're used to it." },
  { n: "04", label: "Check the plan", body: "See what's left, what's overdue, and how this month compares." },
];

const STACK = [
  { group: "Backend", items: ["Django", "Django REST Framework", "PostgreSQL", "Gunicorn"] },
  { group: "Frontend", items: ["React", "TypeScript", "Tailwind CSS", "Vite"] },
  { group: "Infra", items: ["Docker", "Caddy on a VPS", "Cloudflare Pages"] },
];

const NOTES = [
  "Categories split into fixed and varying — the report and the plan page agree on what kind of thing each one is, rather than drawing one progress bar for both a rent payment and a grocery bill.",
  "Isolation is tested, not assumed: a user can't read, edit, or spend from another user's wallet — asserted by the test suite, not left to the serializer to get right by accident.",
  "Settings read from the environment (DEBUG, ALLOWED_HOSTS, SECRET_KEY, DATABASE_URL) — the same image runs locally and in production; only the .env differs.",
];

const UPCOMING = [
  {
    title: "Funds",
    body: "Auto-split what's left at month end across savings goals — a rainy-day fund, a vacation, a target.",
  },
  {
    title: "Telegram bot",
    body: "Log a transaction from a chat message instead of opening the app.",
  },
  {
    title: "Receipt scanning",
    body: "Photograph a receipt and let Claude Vision suggest the date, amount, and category.",
  },
  {
    title: "Shared budgets",
    body: "Invite a partner into a wallet — shared and personal expenses side by side.",
  },
  {
    title: "Deeper analytics",
    body: "Once there's enough history to trust: trends across months, category insights, spending predictions.",
  },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-stone-50 text-stone-800">
      {/* Nav */}
      <div className="border-b border-stone-100 bg-white">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <span className="text-lg font-semibold text-stone-900 tracking-tight">
            Cashew
          </span>
          <Link to="/login">
            <Button variant="secondary">Log in</Button>
          </Link>
        </div>
      </div>

      {/* Hero */}
      <div className="max-w-3xl mx-auto px-6 pt-16 pb-14 text-center">
        <h1 className="text-3xl sm:text-4xl font-semibold text-stone-900 tracking-tight">
          A personal finance tracker
          <br className="hidden sm:block" /> I built and use every day.
        </h1>
        <p className="mt-4 text-stone-500 max-w-xl mx-auto">
          Wallets, spending limits, and reports that actually compare
          one month to the next — not a spreadsheet, not a demo.
        </p>
        <div className="mt-8 flex items-center justify-center gap-3">
          <Link to="/login">
            <Button className="px-6 py-3">Log in</Button>
          </Link>
          <a
            href="https://github.com/Knopinskii/cashew"
            target="_blank"
            rel="noreferrer"
          >
            <Button variant="secondary" className="px-6 py-3">
              View source
            </Button>
          </a>
        </div>
      </div>

      {/* How it works */}
      <div className="max-w-2xl mx-auto px-6 pb-16">
        <h2 className="text-xs font-medium text-stone-400 uppercase tracking-widest mb-4 px-1">
          How it works
        </h2>
        <div className="bg-white rounded-2xl shadow-sm divide-y divide-stone-50">
          {STEPS.map((s) => (
            <div key={s.n} className="flex items-start gap-4 px-5 py-4">
              <span className="text-xs font-semibold text-amber-600 tabular-nums pt-0.5">
                {s.n}
              </span>
              <div>
                <p className="text-sm font-medium text-stone-800">
                  {s.label}
                </p>
                <p className="text-sm text-stone-500 mt-0.5">{s.body}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Features */}
      <div className="max-w-2xl mx-auto px-6 pb-16">
        <h2 className="text-xs font-medium text-stone-400 uppercase tracking-widest mb-4 px-1">
          Features
        </h2>
        <div className="grid sm:grid-cols-2 gap-4">
          {FEATURES.map((f) => (
            <div key={f.title} className="bg-white rounded-2xl shadow-sm p-5">
              <p className="text-sm font-semibold text-stone-800 mb-1.5">
                {f.title}
              </p>
              <p className="text-sm text-stone-500 leading-relaxed">
                {f.body}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Why */}
      <div className="max-w-2xl mx-auto px-6 pb-16">
        <div className="bg-white rounded-3xl shadow-sm p-8">
          <h2 className="text-sm font-medium text-stone-400 uppercase tracking-wide mb-3">
            Why I built this
          </h2>
          <p className="text-stone-600 leading-relaxed">
            Most budgeting apps I tried were either too simple to be useful
            or too complex to open twice. Cashew is neither — it's a small
            tool I actually reach for daily to log what I spend, see whether
            a category is still under its limit, and check how this month
            is shaping up against the last one. It isn't a portfolio piece
            I stopped touching after the demo; it's the thing tracking my
            own money right now.
          </p>
        </div>
      </div>

      {/* Built with */}
      <div className="max-w-2xl mx-auto px-6 pb-16">
        <h2 className="text-xs font-medium text-stone-400 uppercase tracking-widest mb-4 px-1">
          Built with
        </h2>
        <div className="bg-white rounded-2xl shadow-sm p-6 space-y-5">
          <div className="grid sm:grid-cols-3 gap-5">
            {STACK.map((s) => (
              <div key={s.group}>
                <p className="text-xs font-medium text-stone-400 uppercase tracking-wide mb-2">
                  {s.group}
                </p>
                <ul className="space-y-1">
                  {s.items.map((item) => (
                    <li key={item} className="text-sm text-stone-700">
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="pt-5 border-t border-stone-100 space-y-3">
            {NOTES.map((n) => (
              <p key={n} className="text-xs text-stone-500 leading-relaxed">
                {n}
              </p>
            ))}
          </div>

          <a
            href="https://github.com/Knopinskii/cashew"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-amber-700 hover:text-amber-800 transition-colors"
          >
            View source on GitHub →
          </a>
        </div>
      </div>

      {/* Upcoming */}
      <div className="max-w-2xl mx-auto px-6 pb-16">
        <h2 className="text-xs font-medium text-stone-400 uppercase tracking-widest mb-4 px-1">
          What's next
        </h2>
        <div className="bg-white rounded-2xl shadow-sm divide-y divide-stone-50">
          {UPCOMING.map((u) => (
            <div key={u.title} className="px-5 py-4">
              <p className="text-sm font-medium text-stone-800">{u.title}</p>
              <p className="text-sm text-stone-500 mt-0.5">{u.body}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="pb-16" />
    </div>
  );
}
