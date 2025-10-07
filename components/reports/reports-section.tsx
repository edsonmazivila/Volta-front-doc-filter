'use client'
import { useState } from 'react'
import type { ReportsListItem, PayrollChartData, EmployeeMetricsData, TaxTrendData } from '@/lib/services/reports'
import { Button } from '@/components/ui'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { PayrollLineChart, DoughnutChart, StackedBarChart } from './charts'
import { User, UserCheck, Clock3, Percent } from 'lucide-react'
import { Card } from '@/components/dashboard/card'

interface ReportsSectionProps {
	initialReports: ReportsListItem[]
	initialPayroll: PayrollChartData
	initialEmployee: EmployeeMetricsData
	initialTax: TaxTrendData
}

export function ReportsSection({ initialReports, initialPayroll, initialEmployee, initialTax }: ReportsSectionProps) {
	const [period, setPeriod] = useState('monthly')
	const [reports] = useState(initialReports)

	return (
		<div className='grid gap-4'>
			<div className='flex items-center justify-between gap-3 flex-wrap'>
				<h2 className='text-sm font-medium'>Overview</h2>
				<div className='flex items-center gap-2'>
					<select className='border rounded-md px-2 py-2 bg-background' value={period} onChange={(e) => setPeriod(e.target.value)}>
						<option value='monthly'>Monthly</option>
						<option value='quarterly'>Quarterly</option>
						<option value='yearly'>Yearly</option>
					</select>
					<Button variant='outline'>Export</Button>
				</div>
			</div>

			<div className='grid grid-cols-1 lg:grid-cols-2 gap-4'>
				<Card>
					<div className='flex items-center justify-between'>
						<h3 className='text-sm font-medium'>Payroll Totals</h3>
						<div className='flex items-center gap-2'>
							<Button size='sm' variant='outline'>PNG</Button>
							<Button size='sm' variant='outline'>PDF</Button>
							<Button size='sm' variant='outline'>CSV</Button>
						</div>
					</div>
					<PayrollLineChart labels={initialPayroll.labels} total={initialPayroll.totalPayroll} net={initialPayroll.netPay} className='w-full h-[300px]' />
				</Card>
				<Card>
					<div className='flex items-center justify-between'>
						<h3 className='text-sm font-medium'>Tax Liability</h3>
						<div className='flex items-center gap-2'>
							<Button size='sm' variant='outline'>PNG</Button>
							<Button size='sm' variant='outline'>PDF</Button>
							<Button size='sm' variant='outline'>CSV</Button>
						</div>
					</div>
					<StackedBarChart labels={initialTax.labels}
						datasets={[
							{ label: 'Federal', color: '#3b82f6', data: initialTax.federalTax || [] },
							{ label: 'State', color: '#1e40af', data: initialTax.stateTax || [] },
							{ label: 'Social Sec', color: '#10b981', data: initialTax.socialSecurity || [] },
							{ label: 'Medicare', color: '#059669', data: initialTax.medicare || [] },
							{ label: 'FUTA', color: '#f59e0b', data: initialTax.futa || [] },
							{ label: 'SUTA', color: '#d97706', data: initialTax.suta || [] },
						]}
						className='w-full h-[300px]'
					/>
				</Card>
			</div>

			<div className='grid grid-cols-1 lg:grid-cols-2 gap-4'>
				<Card className='lg:col-span-2'>
					<h3 className='text-sm font-medium mb-3'>Employee Metrics</h3>
					<div className='grid grid-cols-2 gap-4 w-full'>
						<div className='rounded-xl border border-[var(--border)] bg-white/5 px-3 py-3 backdrop-blur-sm hover:bg-white/10 transition-colors'>
							<div className='flex items-center justify-between mb-1'>
								<span className='text-[11px] uppercase tracking-wide text-muted-foreground'>Total</span>
								<span className='inline-flex h-8 w-8 items-center justify-center rounded-lg bg-white/10'><User className='h-4 w-4' /></span>
							</div>
							<div className='text-2xl font-semibold'>{initialEmployee.summary?.totalEmployees ?? 0}</div>
						</div>
						<div className='rounded-xl border border-[var(--border)] bg-white/5 px-3 py-3 backdrop-blur-sm hover:bg-white/10 transition-colors'>
							<div className='flex items-center justify-between mb-1'>
								<span className='text-[11px] uppercase tracking-wide text-muted-foreground'>Active</span>
								<span className='inline-flex h-8 w-8 items-center justify-center rounded-lg bg-white/10'><UserCheck className='h-4 w-4' /></span>
							</div>
							<div className='text-2xl font-semibold'>{initialEmployee.summary?.activeEmployees ?? 0}</div>
						</div>

						<div className='rounded-xl border border-[var(--border)] bg-white/5 px-3 py-3 backdrop-blur-sm hover:bg-white/10 transition-colors'>
							<div className='flex items-center justify-between mb-1'>
								<span className='text-[11px] uppercase tracking-wide text-muted-foreground'>Avg Tenure</span>
								<span className='inline-flex h-8 w-8 items-center justify-center rounded-lg bg-white/10'><Clock3 className='h-4 w-4' /></span>
							</div>
							<div className='text-2xl font-semibold'>{(initialEmployee.summary?.avgTenure ?? 0).toFixed(1)}<span className='text-sm ml-1'>years</span></div>
						</div>
						<div className='rounded-xl border border-[var(--border)] bg-white/5 px-3 py-3 backdrop-blur-sm hover:bg-white/10 transition-colors'>
							<div className='flex items-center justify-between mb-1'>
								<span className='text-[11px] uppercase tracking-wide text-muted-foreground'>Turnover</span>
								<span className='inline-flex h-8 w-8 items-center justify-center rounded-lg bg-white/10'><Percent className='h-4 w-4' /></span>
							</div>
							<div className='text-2xl font-semibold'>{(initialEmployee.summary?.turnoverRate ?? 0).toFixed(0)}<span className='text-sm ml-0.5'>%</span></div>
						</div>
					</div>
				</Card>
				<Card>
					<div className='flex items-center justify-between mb-2'>
						<h3 className='text-sm font-medium'>Employment Types</h3>
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
						<h3 className='text-sm font-medium'>Department Distribution</h3>
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
				<div className='pb-3 flex items-center justify-between'>
					<h3 className='text-sm font-medium'>Recent Reports</h3>
					<Button id='toggleReportsTable' variant='outline' size='sm'>Hide Table</Button>
				</div>
				<div id='recent-reports' className='overflow-x-auto rounded-xl border border-[var(--border)]'>
					<table className='w-full text-sm'>
						<thead className='text-left text-muted-foreground'>
							<tr>
								<th className='py-3 px-3'>Report Name</th>
								<th className='py-3 px-3'>Date</th>
								<th className='py-3 px-3'>Type</th>
								<th className='py-3 px-3'>Actions</th>
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
												<Button variant='outline' aria-label='Actions'>
													<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='currentColor' className='h-4 w-4'>
														<path d='M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM18 10a2 2 0 11-4 0 2 2 0 014 0z' />
													</svg>
												</Button>
											</DropdownMenuTrigger>
											<DropdownMenuContent align='end'>
												<DropdownMenuItem>View</DropdownMenuItem>
												<DropdownMenuItem>Download</DropdownMenuItem>
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


