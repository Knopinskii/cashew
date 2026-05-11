interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export default function Input({ label, error, className = "", ...props }: InputProps) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label className="block text-xs font-medium text-stone-400 uppercase tracking-wide">{label}</label>
      )}
      <input
        className={`w-full border rounded-2xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 ${
          error ? "border-rose-300" : "border-stone-200"
        } ${className}`}
        {...props}
      />
      {error && <p className="text-xs text-rose-500">{error}</p>}
    </div>
  );
}
