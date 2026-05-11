interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger";
}

export default function Button({ variant = "primary", className = "", ...props }: ButtonProps) {
  const variants = {
    primary: "bg-amber-600 hover:bg-amber-700 text-white",
    secondary: "bg-stone-100 hover:bg-stone-200 text-stone-600",
    danger: "bg-rose-50 hover:bg-rose-100 text-rose-500",
  };

  return (
    <button
      className={`px-4 py-2 rounded-2xl text-sm font-medium transition-colors ${variants[variant]} ${className}`}
      {...props}
    />
  );
}
