
'use client'
import { useState, useMemo } from 'react'
import { Plus, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { TimesheetCard } from './timesheet-card'
import { TimesheetFormDialog } from './timesheet-form-dialog'
import type { MyTimesheet } from '@/lib/types/my-timesheets'

interface MyTimesheetsSectionProps {
  timesheets: MyTimesheet[]
}

export function MyTimesheetsSection({ timesheets }: MyTimesheetsSectionProps) {
  const [formDialogOpen, setFormDialogOpen] = useState(false)
  const [selectedTimesheet, setSelectedTimesheet] = useState<MyTimesheet | null>(null)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('')

  const filteredTimesheets = useMemo(() => {
    return timesheets.filter((ts) => {
      const matchesSearch = !search ||
        ts.period_start.includes(search) ||
        ts.period_end.includes(search) ||
        ts.notes?.toLowerCase().includes(search.toLowerCase())

      const matchesStatus = !statusFilter || ts.status === statusFilter

      return matchesSearch && matchesStatus
    })
  }, [timesheets, search, statusFilter])

  function handleEdit(timesheet: MyTimesheet) {
    setSelectedTimesheet(timesheet)
    setFormDialogOpen(true)
  }

  function handleCloseDialog() {
    setFormDialogOpen(false)
    setSelectedTimesheet(null)
  }

  function handleNewTimesheet() {
    setSelectedTimesheet(null)
    setFormDialogOpen(true)
  }

  return (
    <>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">My Timesheets</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Manage your timesheet submissions
            </p>
          </div>
          <Button onClick={handleNewTimesheet}>
            <Plus className="w-4 h-4 mr-2" />
            New Timesheet
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search timesheets..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-md border border-[var(--border)] bg-background text-foreground text-sm"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-md border border-[var(--border)] bg-background text-foreground text-sm"
          >
            <option value="">All Statuses</option>
            <option value="draft">Draft</option>
            <option value="submitted">Submitted</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-card border border-[var(--border)] rounded-lg p-4">
            <div className="text-2xl font-bold">{timesheets.length}</div>
            <div className="text-sm text-muted-foreground">Total</div>
          </div>
          <div className="bg-card border border-[var(--border)] rounded-lg p-4">
            <div className="text-2xl font-bold">
              {timesheets.filter((ts) => ts.status === 'draft').length}
            </div>
            <div className="text-sm text-muted-foreground">Draft</div>
          </div>
          <div className="bg-card border border-[var(--border)] rounded-lg p-4">
            <div className="text-2xl font-bold">
              {timesheets.filter((ts) => ts.status === 'submitted').length}
            </div>
            <div className="text-sm text-muted-foreground">Submitted</div>
          </div>
          <div className="bg-card border border-[var(--border)] rounded-lg p-4">
            <div className="text-2xl font-bold">
              {timesheets.filter((ts) => ts.status === 'approved').length}
            </div>
            <div className="text-sm text-muted-foreground">Approved</div>
          </div>
        </div>

        {/* Timesheet List */}
        {filteredTimesheets.length === 0 ? (
          <div className="text-center py-12 bg-card border border-[var(--border)] rounded-lg">
            <p className="text-muted-foreground">No timesheets found</p>
            <Button onClick={handleNewTimesheet} variant="outline" className="mt-4">
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Timesheet
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTimesheets.map((timesheet) => (
              <TimesheetCard
                key={timesheet.id}
                timesheet={timesheet}
                onEdit={handleEdit}
              />
            ))}
          </div>
        )}
      </div>

      <TimesheetFormDialog
        open={formDialogOpen}
        onOpenChange={handleCloseDialog}
        timesheet={selectedTimesheet}
      />
    </>
  )
}