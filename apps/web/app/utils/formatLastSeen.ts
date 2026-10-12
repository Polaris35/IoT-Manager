import { DateTime } from "luxon";
export function formatLastSeen(timestampMillis: number): string {
  const dt = DateTime.fromMillis(timestampMillis);
  const relative = dt.toRelative();

  if (
    !relative ||
    relative.includes("0 seconds") ||
    (relative.includes("minute") && relative.match(/^0|in 0/))
  ) {
    return "Just now";
  }

  return relative;
}
