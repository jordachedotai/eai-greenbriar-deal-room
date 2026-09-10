// Date helpers. Every date is an ISO calendar date (YYYY-MM-DD) or ISO datetime.
// Nothing here reads the wall clock. `today` always comes from the saved state.

const DAY_MS = 86_400_000;

export function toDate(iso: string): Date {
  return new Date(iso.length === 10 ? `${iso}T12:00:00Z` : iso);
}

export function addDays(isoDate: string, days: number): string {
  const d = toDate(isoDate);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

export function daysBetween(fromIso: string, toIso: string): number {
  const a = Date.UTC(...ymd(fromIso));
  const b = Date.UTC(...ymd(toIso));
  return Math.round((b - a) / DAY_MS);
}

function ymd(iso: string): [number, number, number] {
  const [y, m, d] = iso.slice(0, 10).split("-").map(Number);
  return [y, m - 1, d];
}

export function dayIndex(day0: string, today: string): number {
  return daysBetween(day0, today);
}

export type DealClock = { daysToIc: number; daysToBid: number; dayIndex: number; today: string };

export function dealClock(s: { day0: string; today: string; icDate: string; bidDate: string }): DealClock {
  return {
    daysToIc: daysBetween(s.today, s.icDate),
    daysToBid: daysBetween(s.today, s.bidDate),
    dayIndex: dayIndex(s.day0, s.today),
    today: s.today,
  };
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function fmtDate(iso: string): string {
  const [y, m, d] = ymd(iso);
  return `${MONTHS[m]} ${d}`;
}

export function fmtLongDate(iso: string): string {
  const [y, m, d] = ymd(iso);
  const wd = WEEKDAYS[new Date(Date.UTC(y, m, d)).getUTCDay()];
  return `${wd}, ${MONTHS[m]} ${d}, ${y}`;
}

export function fmtDateTime(iso: string): string {
  const d = new Date(iso);
  const h = d.getUTCHours();
  const min = d.getUTCMinutes().toString().padStart(2, "0");
  const ampm = h >= 12 ? "pm" : "am";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${fmtDate(iso)}, ${h12}:${min} ${ampm}`;
}

// Due within the next seven days, inclusive of today.
export function isDueThisWeek(dueDate: string, today: string): boolean {
  const n = daysBetween(today, dueDate);
  return n >= 0 && n <= 7;
}

export function isOverdue(dueDate: string, today: string): boolean {
  return daysBetween(today, dueDate) < 0;
}
