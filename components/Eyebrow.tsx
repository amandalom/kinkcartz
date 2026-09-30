export function Eyebrow({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <p className={`text-[11px] font-semibold uppercase tracking-[0.16em] text-gold ${className ?? ""}`}>
      {children}
    </p>
  );
}
