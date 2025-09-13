export function buildAvatarUrl(seed?: string): string {
  const safeSeed = encodeURIComponent((seed || 'user').toString());
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${safeSeed}`;
}
