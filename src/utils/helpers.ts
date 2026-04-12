// ─── Currency Formatting ─────────────────────────────────────────────────────

export function formatCurrency(amount: number, showSign = false): string {
  const abs = Math.abs(amount);
  const formatted = abs.toLocaleString('en-IN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });

  if (showSign && amount !== 0) {
    return amount > 0 ? `+₹${formatted}` : `-₹${formatted}`;
  }

  return `₹${formatted}`;
}

export function formatAmount(amount: number): string {
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
  if (amount >= 1000) return `₹${(amount / 1000).toFixed(1)}K`;
  return `₹${Math.abs(amount).toLocaleString('en-IN')}`;
}

// ─── Date Formatting ──────────────────────────────────────────────────────────

export function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export function formatDateShort(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
  });
}

export function formatRelativeTime(iso: string): string {
  const now = new Date();
  const date = new Date(iso);
  const diffMs = now.getTime() - date.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  const diffWeeks = Math.floor(diffDays / 7);
  const diffMonths = Math.floor(diffDays / 30);

  if (diffSecs < 60) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffWeeks === 1) return '1 week ago';
  if (diffWeeks < 5) return `${diffWeeks} weeks ago`;
  if (diffMonths === 1) return '1 month ago';
  return `${diffMonths} months ago`;
}

export function toISODate(date: Date): string {
  return date.toISOString().substring(0, 10);
}

export function todayISO(): string {
  return toISODate(new Date());
}

// ─── Name Helpers ─────────────────────────────────────────────────────────────

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(w => w[0]?.toUpperCase() ?? '')
    .slice(0, 2)
    .join('');
}

export function getAvatarColor(name: string): { bg: string; text: string } {
  const colors = [
    { bg: '#e8f5e9', text: '#1b5e20' },
    { bg: '#e3f2fd', text: '#0d47a1' },
    { bg: '#fce4ec', text: '#880e4f' },
    { bg: '#fff3e0', text: '#e65100' },
    { bg: '#f3e5f5', text: '#4a148c' },
    { bg: '#e0f7fa', text: '#006064' },
    { bg: '#fafafa', text: '#212121' },
  ];

  const idx = name.charCodeAt(0) % colors.length;
  return colors[idx];
}

// ─── Balance Helpers ──────────────────────────────────────────────────────────

export function getBalanceLabel(netBalance: number): string {
  if (netBalance < 0) return 'They Owe You';
  if (netBalance > 0) return 'You Owe Them';
  return 'All Settled ✓';
}

export function getBalanceDirectionLabel(netBalance: number): string {
  if (netBalance < 0) return 'You Gave';
  if (netBalance > 0) return 'You Got';
  return 'Settled';
}

export function isSettled(netBalance: number): boolean {
  return Math.abs(netBalance) < 0.01;
}
