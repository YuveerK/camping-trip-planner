import type { TripMember } from '../types';

export function getMemberDisplayName(member: TripMember): string {
  return member.user?.name ?? member.invitedName ?? member.invitedEmail ?? 'Unknown';
}

export function formatCurrency(amount: number | string): string {
  return `R ${Number(amount).toFixed(2)}`;
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function getTotalClaimed(claims: { claimedQuantity: number }[]): number {
  return claims.reduce((sum, c) => sum + c.claimedQuantity, 0);
}

export function getPackedCount(claims: { isPacked: boolean }[]): number {
  return claims.filter((c) => c.isPacked).length;
}
