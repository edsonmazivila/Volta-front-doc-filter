'use client'
import type { TeamBalanceItem } from '@/lib/services/leaves'
import { User } from 'lucide-react'

interface TeamBalancesTableProps {
  teamBalances: TeamBalanceItem[]
}

export function TeamBalancesTable({ teamBalances }: TeamBalancesTableProps) {
  if (teamBalances.length === 0) {
    return (
      <div className="text-center py-12 bg-card border border-[var(--border)] rounded-lg">
        <p className="text-muted-foreground">No team balances available</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto bg-card border border-[var(--border)] rounded-lg">
      <table className="min-w-full divide-y divide-[var(--border)]">
        <thead>
          <tr className="bg-muted/50">
            <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Employee
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Vacation
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Sick
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Personal
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Other
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[var(--border)]">
          {teamBalances.map((member) => {
            const vacationBalance = member.balances.find(b => b.leave_type === 'vacation')
            const sickBalance = member.balances.find(b => b.leave_type === 'sick')
            const personalBalance = member.balances.find(b => b.leave_type === 'personal')
            const otherBalances = member.balances.filter(b =>
              !['vacation', 'sick', 'personal'].includes(b.leave_type)
            )

            return (
              <tr key={member.employee_id} className="hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary">
                      <User className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-sm font-medium">{member.employee_name}</div>
                      {member.employee_email && (
                        <div className="text-xs text-muted-foreground">{member.employee_email}</div>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="text-sm font-medium">
                    {vacationBalance ? vacationBalance.remaining_days.toFixed(1) : '0.0'}
                  </div>
                  {vacationBalance?.pending_days ? (
                    <div className="text-xs text-muted-foreground">
                      Pending: {vacationBalance.pending_days.toFixed(1)}
                    </div>
                  ) : null}
                </td>
                <td className="px-4 py-3">
                  <div className="text-sm font-medium">
                    {sickBalance ? sickBalance.remaining_days.toFixed(1) : '0.0'}
                  </div>
                  {sickBalance?.pending_days ? (
                    <div className="text-xs text-muted-foreground">
                      Pending: {sickBalance.pending_days.toFixed(1)}
                    </div>
                  ) : null}
                </td>
                <td className="px-4 py-3">
                  <div className="text-sm font-medium">
                    {personalBalance ? personalBalance.remaining_days.toFixed(1) : '0.0'}
                  </div>
                  {personalBalance?.pending_days ? (
                    <div className="text-xs text-muted-foreground">
                      Pending: {personalBalance.pending_days.toFixed(1)}
                    </div>
                  ) : null}
                </td>
                <td className="px-4 py-3">
                  {otherBalances.length > 0 ? (
                    <div className="space-y-1">
                      {otherBalances.map((balance) => (
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
  )
}
