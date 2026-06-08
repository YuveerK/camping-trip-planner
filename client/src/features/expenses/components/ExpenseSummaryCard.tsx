import { clsx } from 'clsx';
import { Card, CardBody } from '../../../components/ui/Card';
import type { ExpenseSummary } from '../../../types';
import { formatCurrency } from '../../../utils/format';

export function ExpenseSummaryCard({ summary }: { summary?: ExpenseSummary }) {
  if (!summary) return null;

  return (
    <Card className="mb-4 bg-gradient-to-r from-earth-50 to-forest-50">
      <CardBody>
        <div className="text-center mb-3">
          <p className="text-xs text-stone-500 uppercase tracking-wide">Total spend</p>
          <p className="text-3xl font-bold text-stone-800">{formatCurrency(summary.totalAmount)}</p>
        </div>
        {summary.perMemberBalance.length > 0 && (
          <div className="flex flex-col gap-2">
            {summary.perMemberBalance.map((balance) => (
              <div key={balance.memberId} className="flex items-center justify-between text-sm">
                <span className="text-stone-600">{balance.name}</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-stone-400">paid {formatCurrency(balance.paid)}</span>
                  <span className={clsx('font-semibold text-xs px-2 py-0.5 rounded-full', balance.net > 0 ? 'bg-forest-100 text-forest-700' : balance.net < 0 ? 'bg-red-100 text-red-700' : 'bg-stone-100 text-stone-500')}>
                    {balance.net > 0 ? `+${formatCurrency(balance.net)}` : balance.net < 0 ? formatCurrency(balance.net) : 'Even'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardBody>
    </Card>
  );
}
