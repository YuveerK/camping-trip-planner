import { format, formatDistanceToNow, parseISO } from 'date-fns';

export function formatDate(date: string | Date | null | undefined, fmt = 'MMM d, yyyy'): string {
  if (!date) return '—';
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, fmt);
}

export function formatRelative(date: string | Date): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return formatDistanceToNow(d, { addSuffix: true });
}

export function formatDateRange(start?: string | null, end?: string | null): string {
  if (!start && !end) return 'Dates TBD';
  if (start && !end) return formatDate(start);
  if (!start && end) return formatDate(end);
  return `${formatDate(start)} – ${formatDate(end)}`;
}

export function toDatetimeLocal(iso?: string | null): string {
  if (!iso) return '';
  const d = parseISO(iso);
  return format(d, "yyyy-MM-dd'T'HH:mm");
}

export function toISO(local: string): string {
  return new Date(local).toISOString();
}
