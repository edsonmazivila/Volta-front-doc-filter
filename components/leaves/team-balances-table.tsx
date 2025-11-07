'use client'
import type { TeamBalanceItem } from '@/lib/services/leaves'
import { User } from 'lucide-react'

interface TeamBalancesTableProps {
  teamBalances: TeamBalanceItem[]
}

export function TeamBalancesTable({ teamBalances }: TeamBalancesTableProps) {
  if (teamBalances.length === 0) {
    return (
      <div className="glass rounded-xl overflow-hidden">
        <div className="text-center py-12">
          <p className="text-muted-foreground">No team balances available</p>
        </div>
      </div>
    )
  }

  const grouped = teamBalances.reduce<Record<string, TeamBalanceItem[]>>((acc, item) => {
    const key = item.employee_id
    if (!acc[key]) acc[key] = []
    acc[key].push(item)
    return acc
  }, {})

  const getBalance = (items: TeamBalanceItem[], type: string) =>
    items.find(b => b.leave_type === type)

  const getOtherBalances = (items: TeamBalanceItem[]) =>
    items.filter(b => !['vacation', 'sick', 'personal'].includes(b.leave_type))

  return (
    <div className="glass rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b border-[var(--border)] text-neutral-400">
            <tr>
              <th className="text-left p-3">Employee</th>
              <th className="text-left p-3">Vacation</th>
              <th className="text-left p-3">Sick</th>
              <th className="text-left p-3">Personal</th>
              <th className="text-left p-3">Other</th>
            </tr>
          </thead>
          <tbody>
            {Object.values(grouped).map((items) => {
              const sample = items[0]
              const vacation = getBalance(items, 'vacation')
              const sick = getBalance(items, 'sick')
              const personal = getBalance(items, 'personal')
              const other = getOtherBalances(items)

              return (
                <tr key={sample.employee_id} className="border-b border-[var(--border)] hover:bg-muted/50 transition-colors">
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary">
                        <User className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-sm font-medium">{sample.employee_name}</div>
                        {sample.employee_email && (
                          <div className="text-xs text-muted-foreground">{sample.employee_email}</div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="p-3">
                    <div className="text-sm font-medium">
                      {vacation ? vacation.remaining_days.toFixed(1) : '0.0'}
                    </div>
                    {vacation?.pending_days ? (
                      <div className="text-xs text-muted-foreground">
                        Pending: {vacation.pending_days.toFixed(1)}
                      </div>
                    ) : null}
                  </td>
                  <td className="p-3">
                    <div className="text-sm font-medium">
                      {sick ? sick.remaining_days.toFixed(1) : '0.0'}
                    </div>
                    {sick?.pending_days ? (
                      <div className="text-xs text-muted-foreground">
                        Pending: {sick.pending_days.toFixed(1)}
                      </div>
                    ) : null}
                  </td>
                  <td className="p-3">
                    <div className="text-sm font-medium">
                      {personal ? personal.remaining_days.toFixed(1) : '0.0'}
                    </div>
                    {personal?.pending_days ? (
                      <div className="text-xs text-muted-foreground">
                        Pending: {personal.pending_days.toFixed(1)}
                      </div>
                    ) : null}
                  </td>
                  <td className="p-3">
                    {other.length > 0 ? (
                      <div className="space-y-1">
                        {other.map((balance) => (
                          <div key={balance.leave_type} className="text-sm">
                            <span className="capitalize text-muted-foreground">{balance.leave_type}:</span>{' '}
                            <span className="font-medium">{balance.remaining_days.toFixed(1)}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <span className="text-sm text-muted-foreground">—</span>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
