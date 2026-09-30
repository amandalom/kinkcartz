import Link from "next/link";

export function FilterPill({
  href,
  active,
  icon,
  children,
}: {
  href: string;
  active: boolean;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={`inline-flex flex-shrink-0 items-center gap-1.5 rounded-full border px-4 py-2 text-xs font-medium transition ${
        active
          ? "border-accent bg-accent text-white"
          : "border-white/10 bg-surface text-zinc-300 hover:border-white/20 hover:text-white"
      }`}
    >
      {icon}
      {children}
    </Link>
  );
}
