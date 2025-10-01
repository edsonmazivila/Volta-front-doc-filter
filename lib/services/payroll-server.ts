'use server'
import { getAuthCookieHeader } from '@/lib/auth/server-utils'
import { API_BASE_URL } from '@/lib/config'
import { handleServiceError } from '@/lib/http/error-handler'

export interface PayrollRunItem {
	id: string
	periodStart: string
	periodEnd: string
	payDate?: string
	status?: string
	totalHours?: number
	grossAmount?: number
	netAmount?: number
	employeesCount?: number
}

interface PayrollListResponseShape {
	data?: unknown[]
	payroll?: unknown[]
	items?: unknown[]
}

export async function fetchPayrollRuns(): Promise<PayrollRunItem[]> {
	try {
		const cookieHeader = await getAuthCookieHeader()
		const headers: Record<string, string> = { 'Content-Type': 'application/json' }
		if (cookieHeader) headers['Cookie'] = cookieHeader

		// Prefer JSON APIs when available; fall back to legacy HTML endpoints until backend exposes JSON
		// Expected future primary endpoints: /api/payroll or /api/payroll/history returning an array of runs
		const candidates = [
			`${API_BASE_URL}/api/payroll`,
			`${API_BASE_URL}/api/payroll/history`,
			`${API_BASE_URL}/payroll/history`,
		]
		let raw: unknown[] = []
		for (const url of candidates) {
			const res = await fetch(url, {
				method: 'GET',
				headers: {
					...headers,
					'Accept': 'application/json, text/plain;q=0.9, */*;q=0.1',
				},
				cache: 'no-store',
			})
			if (!res.ok) continue
			const contentType = res.headers.get('content-type') || ''
			if (!contentType.includes('application/json')) {
				// Legacy HTML parsing: extract payDate, employees, gross, net, status, and id from action buttons
				// When backend provides JSON, replace this branch with direct JSON parsing and remove regex parsing below
				const html = await res.text().catch(() => '')
				if (!html) continue
				const rows = Array.from(html.matchAll(/<tr>[\s\S]*?<\/tr>/g)).slice(1) // skip header
				raw = rows.map((m) => {
					const row = m[0]
					const payDate = (row.match(/<td[^>]*>\s*([0-9]{4}-[0-9]{2}-[0-9]{2})\s*<\/td>/) || [,''])[1]
					const employees = Number(((row.match(/<td[^>]*>\s*([0-9]+)\s*<\/td>/g) || [])[1] || '').replace(/<[^>]+>/g,'').replace(/\D+/g,'')) || 0
					const grossText = ((row.match(/<td[^>]*>\s*\$[^<]*<\/td>/g) || [])[0] || '').replace(/<[^>]+>/g,'')
					const netText = ((row.match(/<td[^>]*>\s*\$[^<]*<\/td>/g) || [])[1] || '').replace(/<[^>]+>/g,'')
					const gross = parseFloat((grossText || '').replace(/[^0-9.-]/g,'')) || 0
					const net = parseFloat((netText || '').replace(/[^0-9.-]/g,'')) || 0
					const status = (row.match(/<span[^>]*>\s*([^<]+)\s*<\/span>/) || [,''])[1]
					const idMatch = row.match(/downloadPayrollReport\('([a-f0-9-]+)'/i) || row.match(/downloadBCI\('([a-f0-9-]+)'/i) || row.match(/downloadTabela\('([a-f0-9-]+)'/i)
					const id = idMatch ? idMatch[1] : ''
					return {
						id,
						periodStart: '',
						periodEnd: '',
						payDate,
						status,
						totalHours: 0,
						grossAmount: gross || 0,
						netAmount: net || 0,
						employeesCount: employees || 0,
					}
				})
				break
			}
			const json: PayrollListResponseShape = await res.json().catch(() => ({ }))
			raw = (json.data || (json as any).runs || (json as any).history || json.payroll || json.items || []) as unknown[]
			if (Array.isArray(raw) && raw.length >= 0) break
		}

		// Normalize various possible backend field names to the UI shape
		return (raw as any[]).map((r) => ({
			id: String(r.id ?? r.run_id ?? r.uuid ?? ''),
			periodStart: String(r.pay_period_start ?? r.periodStart ?? r.period_start ?? r.start ?? ''),
			periodEnd: String(r.pay_period_end ?? r.periodEnd ?? r.period_end ?? r.end ?? ''),
			payDate: r.pay_date ? String(r.pay_date) : undefined,
			status: r.status ? String(r.status) : undefined,
			totalHours: Number(r.total_hours ?? r.totalHours ?? 0) || 0,
			grossAmount: Number(r.gross_amount ?? r.grossAmount ?? 0) || 0,
			netAmount: (r as any).net_amount !== undefined || (r as any).netAmount !== undefined ? (Number((r as any).net_amount ?? (r as any).netAmount) || 0) : undefined,
			employeesCount: (r as any).employees_count !== undefined || (r as any).employeesCount !== undefined ? (Number((r as any).employees_count ?? (r as any).employeesCount) || 0) : undefined,
		}))
	} catch (error) {
		return handleServiceError(error, 'fetchPayrollRuns', 'Failed to load payroll runs')
	}
}

export interface PayrollStats {
	totalEmployees: number
	gross: number
	net: number
	taxes: number
}

export async function fetchPayrollStats(): Promise<PayrollStats> {
	try {
		const cookieHeader = await getAuthCookieHeader()
		const baseHeaders: Record<string, string> = { 'Content-Type': 'application/json' }
		if (cookieHeader) baseHeaders['Cookie'] = cookieHeader

		// Employees total
		let totalEmployees = 0
		try {
			const res = await fetch(`${API_BASE_URL}/api/employees/stats`, { method: 'GET', headers: baseHeaders, cache: 'no-store' })
			if (res.ok) {
				const d = await res.json().catch(() => ({}))
				totalEmployees = Number(d?.total ?? d?.data?.total ?? 0) || 0
			}
		} catch {}

		// Payroll amounts – prefer JSON stats; gracefully parse legacy HTML cards while JSON is unavailable
		let gross = 0, net = 0, taxes = 0
		const candidates = [
			`${API_BASE_URL}/api/payroll/stats`,
			`${API_BASE_URL}/payroll/stats`,
		]
		for (const url of candidates) {
			try {
				const res = await fetch(url, {
					method: 'GET',
					headers: { ...baseHeaders, 'Accept': 'application/json, text/plain;q=0.9, */*;q=0.1' },
					cache: 'no-store',
				})
				if (!res.ok) continue
				const contentType = res.headers.get('content-type') || ''
				if (!contentType.includes('application/json')) {
					// Legacy HTML cards parsing: extract numbers from the four summary cards
					// When backend returns JSON, this branch can be removed
					const html = await res.text().catch(() => '')
					if (!html) continue
					const getAfter = (label: string) => {
						const idx = html.indexOf(label)
						if (idx === -1) return ''
						const slice = html.slice(idx, idx + 400)
						const m = slice.match(/<div[^>]*class=[^>]*text-3xl[^>]*>\s*([^<]+)\s*<\/div>/)
						return m ? m[1] : ''
					}
					const totalEmpText = getAfter('Total Employees')
					const grossText = getAfter('Gross Payroll')
					const netText = getAfter('Net Payroll')
					const taxText = getAfter('Tax Withholding')
					const toNum = (s: string) => Number(parseFloat((s || '').replace(/[^0-9.-]/g, '')) || 0)
					const toInt = (s: string) => Number(((s || '').replace(/[^0-9]/g, '')) || 0)
					totalEmployees = toInt(totalEmpText) || totalEmployees
					gross = toNum(grossText) || gross
					net = toNum(netText) || net
					taxes = toNum(taxText) || taxes
					break
				}
				const data = await res.json().catch(() => null as any)
				if (!data) continue
				const container = (data.data ?? data) as any
				const g = container.gross ?? container.total_gross ?? container.monthly_total ?? 0
				const n = container.net ?? container.net_pay ?? 0
				const t = container.taxes ?? container.tax_withholding ?? container.tax ?? 0
				gross = Number(g) || gross
				net = Number(n) || net
				taxes = Number(t) || taxes
				break
			} catch {}
		}

		return { totalEmployees, gross, net, taxes }
	} catch (error) {
		return handleServiceError(error, 'fetchPayrollStats', 'Failed to load payroll stats')
	}
}


