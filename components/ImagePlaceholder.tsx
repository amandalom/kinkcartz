import { placeholderFor } from "@/lib/placeholder";

export function ImagePlaceholder({ name, className }: { name: string; className?: string }) {
  const { background, letter } = placeholderFor(name);
  return (
    <div
      className={`flex items-center justify-center rounded-lg ${className ?? ""}`}
      style={{ background }}
    >
      <span className="font-display text-4xl text-white/25">{letter}</span>
    </div>
  );
}
