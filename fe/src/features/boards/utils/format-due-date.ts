export function formatDueDate(isoString: string, options?: { short?: boolean }) {
  const date = new Date(isoString);
  const hasTime = date.getHours() !== 12 || date.getMinutes() !== 0;

  if (options?.short) {
    // Task cards: "Jun 10" or "Jun 10, 3:30 PM"
    const dateStr = date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    if (!hasTime) return dateStr;
    const timeStr = date.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
    return `${dateStr}, ${timeStr}`;
  }

  // Sidebar: "Jun 10, 2026" or "Jun 10, 2026 at 3:30 PM"
  const dateStr = date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  if (!hasTime) return dateStr;
  const timeStr = date.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
  return `${dateStr} at ${timeStr}`;
}

export function isOverdue(isoString: string): boolean {
  return new Date(isoString) < new Date();
}
