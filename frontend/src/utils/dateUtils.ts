export const formatDistanceToNow = (
  date: Date,
  options?: { addSuffix?: boolean }
) => {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return options?.addSuffix ? "just now" : "now";
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    const suffix = options?.addSuffix ? "ago" : "";
    return `${diffInMinutes}m${suffix}`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    const suffix = options?.addSuffix ? "ago" : "";
    return `${diffInMinutes}h${suffix}`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    const suffix = options?.addSuffix ? " ago" : "";
    return `${diffInDays}d${suffix}`;
  }

  const diffInWeeks = Math.floor(diffInDays / 7);
  const suffix = options?.addSuffix ? " ago" : "";
  return `${diffInWeeks}w${suffix}`;
};
