'use client'
import { useState } from 'react'
import type { ReportsListItem, PayrollChartData, EmployeeMetricsData, TaxTrendData } from '@/lib/services/reports'
import { Button } from '@/components/ui'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu'
import { Download, FileImage, FileText, FileSpreadsheet, ChevronDown } from 'lucide-react'
import { PayrollLineChart, DoughnutChart, StackedBarChart } from './charts'
import { User, UserCheck, Clock3, Percent } from 'lucide-react'
import { Card } from '@/components/dashboard/card'
import { useLingui } from "@lingui/react"
import { msg } from "@lingui/core/macro"

interface ReportsSectionProps {
	initialReports: ReportsListItem[]
	initialPayroll: PayrollChartData
	initialEmployee: EmployeeMetricsData
	initialTax: TaxTrendData
}

// Download dropdown component
function DownloadDropdown({ chartName }: { chartName: string }) {
	const { i18n } = useLingui()
	const handleDownload = (format: string) => {
		// TODO: Implement actual download functionality
		console.log(`Downloading ${chartName} as ${format}`)
	}

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button size='sm' variant='outline' className='gap-2 hover:bg-accent'>
					<Download className='h-4 w-4' />
					{i18n._(msg`Download`)}
					<ChevronDown className='h-3 w-3 opacity-50' />
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align='end' className='w-48'>
				<DropdownMenuItem onClick={() => handleDownload('PNG')} className='cursor-pointer'>
					<FileImage className='h-4 w-4 mr-2' />
					{i18n._(msg`PNG Image`)}
				</DropdownMenuItem>
				<DropdownMenuItem onClick={() => handleDownload('PDF')} className='cursor-pointer'>
					<FileText className='h-4 w-4 mr-2' />
					{i18n._(msg`PDF Document`)}
				</DropdownMenuItem>
				<DropdownMenuSeparator />
				<DropdownMenuItem onClick={() => handleDownload('CSV')} className='cursor-pointer'>
					<FileSpreadsheet className='h-4 w-4 mr-2' />
					{i18n._(msg`CSV Data`)}
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	)
}

export function ReportsSection({ initialReports, initialPayroll, initialEmployee, initialTax }: ReportsSectionProps) {
	const { i18n } = useLingui()
	const [period, setPeriod] = useState('monthly')
	const [reports] = useState(initialReports)

	return (
		<div className='grid gap-4'>
			<div className='flex items-center justify-between gap-3 flex-wrap'>
				<h2 className='text-sm font-medium'>{i18n._(msg`Overview`)}</h2>
				<div className='flex items-center gap-2'>
					<select className='border rounded-md px-2 py-2 bg-background' value={period} onChange={(e) => setPeriod(e.target.value)}>
						<option value='monthly'>{i18n._(msg`Monthly`)}</option>
						<option value='quarterly'>{i18n._(msg`Quarterly`)}</option>
						<option value='yearly'>{i18n._(msg`Yearly`)}</option>
					</select>
					<Button variant='outline'>{i18n._(msg`Export`)}</Button>
				</div>
			</div>

			<div className='grid grid-cols-1 lg:grid-cols-2 gap-4'>
				<Card>
					<div className='flex items-center justify-between'>
						<h3 className='text-sm font-medium'>{i18n._(msg`Payroll Totals`)}</h3>
						<DownloadDropdown chartName='Payroll Totals' />
					</div>
					<PayrollLineChart labels={initialPayroll.labels} total={initialPayroll.totalPayroll} net={initialPayroll.netPay} className='w-full h-[300px]' />
				</Card>
				<Card>
					<div className='flex items-center justify-between'>
						<h3 className='text-sm font-medium'>{i18n._(msg`Tax Liability`)}</h3>
						<DownloadDropdown chartName='Tax Liability' />
					</div>
					<StackedBarChart labels={initialTax.labels}
						datasets={[
							{ label: 'Federal', color: '#3b82f6', data: initialTax.federalTax || [] },
							{ label: 'State', color: '#8b5cf6', data: initialTax.stateTax || [] },
							{ label: 'Social Sec', color: '#06b6d4', data: initialTax.socialSecurity || [] },
							{ label: 'Medicare', color: '#10b981', data: initialTax.medicare || [] },
							{ label: 'FUTA', color: '#f59e0b', data: initialTax.futa || [] },
							{ label: 'SUTA', color: '#ef4444', data: initialTax.suta || [] },
						]}
						className='w-full h-[300px]'
					/>
				</Card>
			</div>

			<div className='grid grid-cols-1 lg:grid-cols-2 gap-4'>
				<Card className='lg:col-span-2'>
					<h3 className='text-sm font-medium mb-3'>{i18n._(msg`Employee Metrics`)}</h3>
					<div className='grid grid-cols-2 gap-4 w-full'>
						<div className='rounded-xl border border-[var(--border)] bg-white/5 px-3 py-3 backdrop-blur-sm hover:bg-white/10 transition-colors'>
							<div className='flex items-center justify-between mb-1'>
								<span className='text-[11px] uppercase tracking-wide text-muted-foreground'>{i18n._(msg`Total`)}</span>
								<span className='inline-flex h-8 w-8 items-center justify-center rounded-lg bg-white/10'><User className='h-4 w-4' /></span>
							</div>
							<div className='text-2xl font-semibold'>{initialEmployee.summary?.totalEmployees ?? 0}</div>
						</div>
						<div className='rounded-xl border border-[var(--border)] bg-white/5 px-3 py-3 backdrop-blur-sm hover:bg-white/10 transition-colors'>
							<div className='flex items-center justify-between mb-1'>
								<span className='text-[11px] uppercase tracking-wide text-muted-foreground'>{i18n._(msg`Active`)}</span>
								<span className='inline-flex h-8 w-8 items-center justify-center rounded-lg bg-white/10'><UserCheck className='h-4 w-4' /></span>
							</div>
							<div className='text-2xl font-semibold'>{initialEmployee.summary?.activeEmployees ?? 0}</div>
						</div>

						<div className='rounded-xl border border-[var(--border)] bg-white/5 px-3 py-3 backdrop-blur-sm hover:bg-white/10 transition-colors'>
							<div className='flex items-center justify-between mb-1'>
								<span className='text-[11px] uppercase tracking-wide text-muted-foreground'>{i18n._(msg`Avg Tenure`)}</span>
								<span className='inline-flex h-8 w-8 items-center justify-center rounded-lg bg-white/10'><Clock3 className='h-4 w-4' /></span>
							</div>
							<div className='text-2xl font-semibold'>{(initialEmployee.summary?.avgTenure ?? 0).toFixed(1)}<span className='text-sm ml-1'>{i18n._(msg`years`)}</span></div>
						</div>
						<div className='rounded-xl border border-[var(--border)] bg-white/5 px-3 py-3 backdrop-blur-sm hover:bg-white/10 transition-colors'>
							<div className='flex items-center justify-between mb-1'>
								<span className='text-[11px] uppercase tracking-wide text-muted-foreground'>{i18n._(msg`Turnover`)}</span>
								<span className='inline-flex h-8 w-8 items-center justify-center rounded-lg bg-white/10'><Percent className='h-4 w-4' /></span>
							</div>
							<div className='text-2xl font-semibold'>{(initialEmployee.summary?.turnoverRate ?? 0).toFixed(0)}<span className='text-sm ml-0.5'>%</span></div>
						</div>
					</div>
				</Card>
				<Card>
					<div className='flex items-center justify-between mb-2'>
						<h3 className='text-sm font-medium'>{i18n._(msg`Employment Types`)}</h3>
						<DownloadDropdown chartName='Employment Types' />
					</div>
					<div className='flex items-center gap-4'>
						<DoughnutChart labels={initialEmployee.employmentTypes.labels} data={initialEmployee.employmentTypes.data} className='w-[180px] h-[180px]' />
						<ul className='text-xs grid grid-cols-2 gap-2'>
							{initialEmployee.employmentTypes.labels.map((l, i) => (
								<li key={l} className='flex items-center gap-2'><span className='inline-block h-3 w-3 rounded-sm' style={{ backgroundColor: `hsl(${(i*57)%360} 70% 50%)` }} /> {l}: {initialEmployee.employmentTypes.data[i] ?? 0}</li>
							))}
						</ul>
					</div>
				</Card>
				<Card>
					<div className='flex items-center justify-between mb-2'>
						<h3 className='text-sm font-medium'>{i18n._(msg`Department Distribution`)}</h3>
						<DownloadDropdown chartName='Department Distribution' />
					</div>
					<div className='flex items-center gap-4'>
						<DoughnutChart labels={initialEmployee.departmentDistribution?.labels || []} data={initialEmployee.departmentDistribution?.data || []} className='w-[180px] h-[180px]' />
						<ul className='text-xs grid grid-cols-2 gap-2'>
							{(initialEmployee.departmentDistribution?.labels || []).map((l, i) => (
								<li key={l} className='flex items-center gap-2'><span className='inline-block h-3 w-3 rounded-sm' style={{ backgroundColor: `hsl(${(i*71)%360} 70% 50%)` }} /> {l}: {initialEmployee.departmentDistribution?.data[i] ?? 0}</li>
							))}
						</ul>
					</div>
				</Card>
			</div>

			<Card>
				<div className='pb-3'>
					<h3 className='text-sm font-medium'>{i18n._(msg`Recent Reports`)}</h3>
				</div>
				<div id='recent-reports' className='overflow-x-auto rounded-xl border border-[var(--border)]'>
					<table className='w-full text-sm'>
						<thead className='text-left text-muted-foreground'>
							<tr>
								<th className='py-3 px-3'>{i18n._(msg`Report Name`)}</th>
								<th className='py-3 px-3'>{i18n._(msg`Date`)}</th>
								<th className='py-3 px-3'>{i18n._(msg`Type`)}</th>
								<th className='py-3 px-3'>{i18n._(msg`Actions`)}</th>
							</tr>
						</thead>
						<tbody className='divide-y divide-[var(--border)]'>
							{reports.map(r => (
								<tr key={r.id} className='hover:bg-white/10 transition-colors'>
									<td className='py-3 px-3'>{r.name}</td>
									<td className='py-3 px-3 whitespace-nowrap'>{r.date?.slice(0,10)}</td>
									<td className='py-3 px-3'>{r.type}</td>
									<td className='py-3 px-3'>
										<DropdownMenu>
											<DropdownMenuTrigger asChild>
												<Button variant='outline' aria-label={i18n._(msg`Actions`)}>
													<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='currentColor' className='h-4 w-4'>
														<path d='M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM18 10a2 2 0 11-4 0 2 2 0 014 0z' />
													</svg>
												</Button>
											</DropdownMenuTrigger>
											<DropdownMenuContent align='end'>
												<DropdownMenuItem>{i18n._(msg`View`)}</DropdownMenuItem>
												<DropdownMenuItem>{i18n._(msg`Download`)}</DropdownMenuItem>
											</DropdownMenuContent>
										</DropdownMenu>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</Card>
		</div>
	)
}


