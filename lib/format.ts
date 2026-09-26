const TZ = 'Asia/Makassar';

export const number = (value: number) => new Intl.NumberFormat('id-ID').format(value);

export const rupiah = (value: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(value);

/** Groups a phone number as 0812-3456-7890. Login strips the dashes, so the label can be typed back as shown. */
export function phoneLabel(value: string): string {
  const digits = value.replace(/\D/g, '').replace(/^62/, '0');
  return [digits.slice(0, 4), digits.slice(4, 8), digits.slice(8)].filter(Boolean).join('-') || value;
}

/** Badge text for a tier. Affari often leaves `JMember` empty, which reads as plain MEMBER. */
export const tierLabel = (tier: string) => (tier ? `${tier.toUpperCase()} MEMBER` : 'MEMBER');

/** Formats a YYYY-MM-DD string. Anchored at midday WITA so the day never slips. */
export const dateLabel = (value: string) =>
  new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'long', year: 'numeric', timeZone: TZ }).format(
    new Date(value + 'T12:00:00+08:00'),
  );

/** Today in WITA as YYYY-MM-DD. */
export function today(): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: TZ }).format(new Date());
}

/**
 * PRD §5.2: `tanggal` on /api/listhistoripoint means "since this date", so the
 * default reaches back far enough that a member sees a full year of activity.
 */
export function historySince(monthsBack = 18): string {
  const now = new Date();
  const from = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - monthsBack, 1));
  return from.toISOString().slice(0, 10);
}
