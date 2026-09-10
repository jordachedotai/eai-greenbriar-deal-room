import { initials } from "@/lib/data";

export function Face({ name, size = 26, title }: { name: string; size?: number; title?: string }) {
  return (
    <span className="face" style={{ width: size, height: size, fontSize: Math.round(size * 0.42) }} title={title ?? name} aria-label={name}>
      {initials(name)}
    </span>
  );
}
