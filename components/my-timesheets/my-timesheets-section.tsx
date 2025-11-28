'use client'
import { useState, useMemo } from 'react'
import { Plus, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { TimesheetCard } from './timesheet-card'
import { TimesheetFormDialog } from './timesheet-form-dialog'
import type { MyTimesheet } from '@/lib/types/my-timesheets'
import { useLingui } from "@lingui/react"
import { msg } from "@lingui/core/macro"

interface MyTimesheetsSectionProps {
  timesheets: MyTimesheet[]
}

export function MyTimesheetsSection({ timesheets }: MyTimesheetsSectionProps) {
  const { i18n } = useLingui()
  const [formDialogOpen, setFormDialogOpen] = useState(false)
  const [selectedTimesheet, setSelectedTimesheet] = useState<MyTimesheet | null>(null)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  const filteredTimesheets = useMemo(() => {
    return timesheets.filter((ts) => {
      const matchesSearch = !search ||
        ts.period_start.includes(search) ||
        ts.period_end.includes(search) ||
        ts.notes?.toLowerCase().includes(search.toLowerCase())

      const matchesStatus = statusFilter === 'all' || ts.status === statusFilter

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
            <h2 className="text-2xl font-bold">{i18n._(msg`My Timesheets`)}</h2>
            <p className="text-sm text-muted-foreground mt-1">
              {i18n._(msg`Manage your timesheet submissions`)}
            </p>
          </div>
          <Button onClick={handleNewTimesheet}>
            <Plus className="w-4 h-4 mr-2" />
            {i18n._(msg`New Timesheet`)}
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder={i18n._(msg`Search timesheets...`)}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-md border border-[var(--border)] bg-background text-foreground text-sm"
            />
          </div>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[180px] bg-background border border-[var(--border)]">
              <SelectValue placeholder={i18n._(msg`All Statuses`)} />
            </SelectTrigger>
            <SelectContent className="bg-background border border-[var(--border)]">
              <SelectItem value="all">{i18n._(msg`All Statuses`)}</SelectItem>
              <SelectItem value="draft">{i18n._(msg`Draft`)}</SelectItem>
              <SelectItem value="submitted">{i18n._(msg`Submitted`)}</SelectItem>
              <SelectItem value="approved">{i18n._(msg`Approved`)}</SelectItem>
              <SelectItem value="rejected">{i18n._(msg`Rejected`)}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-card border border-[var(--border)] rounded-lg p-4">
            <div className="text-2xl font-bold">{timesheets.length}</div>
            <div className="text-sm text-muted-foreground">{i18n._(msg`Total`)}</div>
          </div>
          <div className="bg-card border border-[var(--border)] rounded-lg p-4">
            <div className="text-2xl font-bold">
              {timesheets.filter((ts) => ts.status === 'draft').length}
            </div>
            <div className="text-sm text-muted-foreground">{i18n._(msg`Draft`)}</div>
          </div>
          <div className="bg-card border border-[var(--border)] rounded-lg p-4">
            <div className="text-2xl font-bold">
              {timesheets.filter((ts) => ts.status === 'submitted').length}
            </div>
            <div className="text-sm text-muted-foreground">{i18n._(msg`Submitted`)}</div>
          </div>
          <div className="bg-card border border-[var(--border)] rounded-lg p-4">
            <div className="text-2xl font-bold">
              {timesheets.filter((ts) => ts.status === 'approved').length}
            </div>
            <div className="text-sm text-muted-foreground">{i18n._(msg`Approved`)}</div>
          </div>
        </div>

        {/* Timesheet List */}
        {filteredTimesheets.length === 0 ? (
          <div className="text-center py-12 bg-card border border-[var(--border)] rounded-lg">
            <p className="text-muted-foreground">{i18n._(msg`No timesheets found`)}</p>
            <Button onClick={handleNewTimesheet} variant="outline" className="mt-4">
              <Plus className="w-4 h-4 mr-2" />
              {i18n._(msg`Create Your First Timesheet`)}
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