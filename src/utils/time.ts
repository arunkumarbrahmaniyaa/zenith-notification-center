export const isToday = (timestamp: number): boolean => {
  const d = new Date(timestamp);
  const now = new Date();
  return d.toDateString() === now.toDateString();
};

export const isYesterday = (timestamp: number): boolean => {
  const d = new Date(timestamp);
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return d.toDateString() === yesterday.toDateString();
};

export const relativeTime = (timestamp: number): string => {
  const diff = Date.now() - timestamp;
  const minute = 60_000;
  const hour = 60 * minute;
  const day = 24 * hour;

  if (diff < minute) return "Just now";
  if (diff < hour) return `${Math.floor(diff / minute)}m ago`;
  if (diff < day) return `${Math.floor(diff / hour)}h ago`;
  return `${Math.floor(diff / day)}d ago`;
};
