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
          {teamBalances.map((member) => {
            const vacationBalance = member.balances.find(b => b.leave_type === 'vacation')
            const sickBalance = member.balances.find(b => b.leave_type === 'sick')
            const personalBalance = member.balances.find(b => b.leave_type === 'personal')
            const otherBalances = member.balances.filter(b =>
              !['vacation', 'sick', 'personal'].includes(b.leave_type)
            )

            return (
              <tr key={member.employee_id} className="border-b border-[var(--border)] hover:bg-muted/50 transition-colors">
                <td className="p-3">
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
                <td className="p-3">
                  <div className="text-sm font-medium">
                    {vacationBalance ? vacationBalance.remaining_days.toFixed(1) : '0.0'}
                  </div>
                  {vacationBalance?.pending_days ? (
                    <div className="text-xs text-muted-foreground">
                      Pending: {vacationBalance.pending_days.toFixed(1)}
                    </div>
                  ) : null}
                </td>
                <td className="p-3">
                  <div className="text-sm font-medium">
                    {sickBalance ? sickBalance.remaining_days.toFixed(1) : '0.0'}
                  </div>
                  {sickBalance?.pending_days ? (
                    <div className="text-xs text-muted-foreground">
                      Pending: {sickBalance.pending_days.toFixed(1)}
                    </div>
                  ) : null}
                </td>
                <td className="p-3">
                  <div className="text-sm font-medium">
                    {personalBalance ? personalBalance.remaining_days.toFixed(1) : '0.0'}
                  </div>
                  {personalBalance?.pending_days ? (
                    <div className="text-xs text-muted-foreground">
                      Pending: {personalBalance.pending_days.toFixed(1)}
                    </div>
                  ) : null}
                </td>
                <td className="p-3">
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
    </div>
  )
}
