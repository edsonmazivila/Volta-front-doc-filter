'use client'
import React, { useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui'
import { FormField, Input } from '@/components/auth/form-field'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { formatDate } from '@/lib/utils'
import {
  updateCompanyAction,
  createPayScheduleAction,
  updatePayScheduleAction,
  deletePayScheduleAction,
  createLeavePolicyAction,
  updateLeavePolicyAction,
  deleteLeavePolicyAction,
} from '@/lib/services/company'
import { Edit, Trash2, Upload } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import Image from 'next/image'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { CompanyDocumentsSection } from '@/components/company/company-documents-section'
import type { CompanyDocumentsResponse } from '@/lib/services/company'
import { toast } from 'sonner'
import { useLingui } from '@lingui/react'
import { msg } from '@lingui/core/macro'

interface CompanyProfileProps {
	company: {
		id: string
		name: string
		legal_name?: string
		tax_id?: string
		email?: string
		phone?: string
		website?: string
		address_line1?: string
		address_line2?: string
		city?: string
		state?: string
		postal_code?: string
		country?: string
		logo?: string
	}
	paySchedules: { id: string, name: string, frequency: string, start_date: string, is_active: boolean }[]
	leavePolicies: { id: string, name: string, description?: string, policy_type: string, leave_type: string, annual_allocation_days: number, accrual_rate: number, accrual_frequency: string, allow_carry_over: boolean, max_carry_over_days: number, carry_over_expiry_months: number, min_request_days: number, max_request_days: number, max_consecutive_days: number, min_advance_notice_days: number, requires_manager_approval: boolean, requires_hr_approval: boolean, auto_approval_threshold: number, allow_half_days: boolean, allow_negative_balance: boolean, effective_date: string, is_active: boolean }[]
	companyDocuments?: CompanyDocumentsResponse
}

export function CompanyProfile({ company, paySchedules, leavePolicies, companyDocuments }: CompanyProfileProps) {
	const searchParams = useSearchParams()
	const router = useRouter()
	const { i18n } = useLingui()
	const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'basic')

	const [editOpen, setEditOpen] = useState(false)
	const [psOpen, setPsOpen] = useState(false)
	const [lpOpen, setLpOpen] = useState(false)

	const [form, setForm] = useState({
		name: company.name || '',
		legal_name: company.legal_name || '',
		tax_id: company.tax_id || '',
		email: company.email || '',
		phone: company.phone || '',
		website: company.website || '',
		address_line1: company.address_line1 || '',
		address_line2: company.address_line2 || '',
		city: company.city || '',
		state: company.state || '',
		postal_code: company.postal_code || '',
		country: company.country || '',
	})

	const [psForm, setPsForm] = useState({ name: '', frequency: 'monthly', start_date: '', is_active: true })
	const [lpForm, setLpForm] = useState({
		name: '',
		description: '',
		policy_type: 'company',
		leave_type: 'vacation',
		annual_allocation_days: 0,
		accrual_rate: 0,
		accrual_frequency: 'monthly',
		allow_carry_over: false,
		max_carry_over_days: 0,
		carry_over_expiry_months: 0,
		min_request_days: 0,
		max_request_days: 0,
		max_consecutive_days: 0,
		min_advance_notice_days: 0,
		requires_manager_approval: false,
		requires_hr_approval: false,
		auto_approval_threshold: 0,
		allow_half_days: false,
		allow_negative_balance: false,
		effective_date: '',
		is_active: true,
	})
	const [saving, setSaving] = useState(false)
	const [error, setError] = useState<string | null>(null)

	// Local state to avoid full page reloads on delete
	const [paySchedulesState, setPaySchedulesState] = useState(paySchedules)
	const [leavePoliciesState, setLeavePoliciesState] = useState(leavePolicies)
	const [deletePolicyOpen, setDeletePolicyOpen] = useState(false)
	const [deletePolicyTarget, setDeletePolicyTarget] = useState<{ id: string, name: string } | null>(null)
	const [deletePayScheduleOpen, setDeletePayScheduleOpen] = useState(false)
	const [deletePayScheduleTarget, setDeletePayScheduleTarget] = useState<{ id: string, name: string } | null>(null)
	const [deletingPolicy, setDeletingPolicy] = useState(false)
	const [deletingPaySchedule, setDeletingPaySchedule] = useState(false)
	const [editingPolicyId, setEditingPolicyId] = useState<string | null>(null)
	const [editingPayScheduleId, setEditingPayScheduleId] = useState<string | null>(null)

	async function handleDeletePayScheduleConfirm() {
		if (!deletePayScheduleTarget) return
		setDeletingPaySchedule(true)
		try {
			await deletePayScheduleAction(deletePayScheduleTarget.id)
			setPaySchedulesState(prev => prev.filter(x => x.id !== deletePayScheduleTarget.id))
			toast.success(i18n._(msg`Pay schedule deleted`))
			setDeletePayScheduleOpen(false)
			setDeletePayScheduleTarget(null)
		} catch (err) {
			const message = err instanceof Error ? err.message : i18n._(msg`Failed to delete pay schedule`)
			toast.error(message)
		} finally {
			setDeletingPaySchedule(false)
		}
	}

	async function handleDeletePolicyConfirm() {
		if (!deletePolicyTarget) return
		setDeletingPolicy(true)
		try {
			await deleteLeavePolicyAction(deletePolicyTarget.id)
			setLeavePoliciesState(prev => prev.filter(x => x.id !== deletePolicyTarget.id))
			toast.success(i18n._(msg`Leave policy deleted`))
			setDeletePolicyOpen(false)
			setDeletePolicyTarget(null)
		} catch (err) {
			const message = err instanceof Error ? err.message : i18n._(msg`Failed to delete leave policy`)
			toast.error(message)
		} finally {
			setDeletingPolicy(false)
		}
	}

	async function handleCompanySave() {
		setSaving(true)
		setError(null)
		try {
			const formData = new FormData()
			Object.entries(form).forEach(([key, value]) => formData.append(key, value))
			const result = await updateCompanyAction(null, formData)
			
			if (result.errors) {
				const allErrors = Object.entries(result.errors)
					.map(([key, messages]) => `${key}: ${messages?.join(', ')}`)
					.join('; ')
				const errorMsg = result.errors._form?.[0] || allErrors || 'Failed to save company'
				setError(errorMsg)
				setSaving(false)
				return
			}
			
			if (result.success) {
				window.location.reload()
			} else {
				setError('Save failed - no success confirmation from server')
				setSaving(false)
			}
		} catch (err) {
			const errorMsg = err instanceof Error ? err.message : 'An error occurred'
			setError(errorMsg)
			setSaving(false)
		}
	}

	async function handleCreatePaySchedule() {
		setSaving(true)
		try {
			const formData = new FormData()
			formData.append('name', psForm.name)
			formData.append('frequency', psForm.frequency)
			formData.append('start_date', psForm.start_date)
			formData.append('is_active', String(psForm.is_active))
			const result = await createPayScheduleAction(null, formData)
			if (result.success && result.data) {
				// Extract the new pay schedule from the response
				const responseData = result.data as Record<string, unknown>
				const newSchedule = (responseData?.pay_schedule || responseData) as Record<string, unknown>
				if (newSchedule?.id) {
					// Update local state immediately
					setPaySchedulesState(prev => [...prev, {
						id: String(newSchedule.id),
						name: String(newSchedule.name || psForm.name),
						frequency: String(newSchedule.frequency || psForm.frequency),
						start_date: String(newSchedule.start_date || psForm.start_date),
						is_active: Boolean(newSchedule.is_active ?? psForm.is_active)
					}])
					toast.success(i18n._(msg`Pay schedule created successfully`))
					setPsOpen(false)
					setPsForm({ name: '', frequency: 'monthly', start_date: '', is_active: true })
					router.refresh()
				}
			} else {
				toast.error(result.errors?._form?.[0] || i18n._(msg`Failed to create pay schedule`))
			}
		} catch {
			toast.error(i18n._(msg`Failed to create pay schedule`))
		} finally {
			setSaving(false)
		}
	}

	async function handleCreateLeavePolicy() {
		console.log('=== CREATE LEAVE POLICY START ===')
		console.log('Form data:', lpForm)
		
		setSaving(true)
		try {
			const formData = new FormData()
			Object.entries(lpForm).forEach(([key, value]) => {
				console.log(`Appending ${key}:`, value, `(type: ${typeof value})`)
				formData.append(key, String(value))
			})
			
			console.log('FormData entries:')
			for (const [key, value] of formData.entries()) {
				console.log(`  ${key}: ${value}`)
			}
			
			console.log('Calling createLeavePolicyAction...')
			const result = await createLeavePolicyAction(null, formData)
			console.log('Server response:', result)
			
			if (result.success) {
				console.log('Success! Reloading page...')
				toast.success(i18n._(msg`Leave policy created successfully`))
				window.location.reload()
			} else if (result.errors) {
				console.error('Validation errors:', result.errors)
				const errorMsg = result.errors._form?.[0] || Object.entries(result.errors).map(([k, v]) => `${k}: ${v?.join(', ')}`).join('; ') || i18n._(msg`Failed to create leave policy`)
				toast.error(errorMsg)
				setSaving(false)
			} else {
				console.error('Unknown response format:', result)
				toast.error(i18n._(msg`Unexpected response from server`))
				setSaving(false)
			}
		} catch (err) {
			console.error('Exception during create:', err)
			toast.error(i18n._(msg`Failed to create leave policy`) + ': ' + (err instanceof Error ? err.message : i18n._(msg`Unknown error`)))
			setSaving(false)
		}
		console.log('=== CREATE LEAVE POLICY END ===')
	}

	return (
		<>
			<div className='glass rounded-xl overflow-hidden'>
		<Tabs value={activeTab} onValueChange={setActiveTab} className='w-full'>
			<div className='flex items-center justify-between'>
				<TabsList>
					<TabsTrigger value='basic'>{i18n._(msg`Basic Information`)}</TabsTrigger>
					<TabsTrigger value='policies'>{i18n._(msg`Leave Policies`)}</TabsTrigger>
					<TabsTrigger value='schedules'>{i18n._(msg`Pay Schedules`)}</TabsTrigger>
					</TabsList>
				</div>

				<TabsContent value='basic'>
					<div className='flex items-center justify-between mt-4'>
					<h3 className='text-sm font-medium text-foreground'>{i18n._(msg`Company Information`)}</h3>
						<Button onClick={() => setEditOpen(true)}>{i18n._(msg`Edit`)}</Button>
					</div>
					<div className='mt-3 grid grid-cols-1 md:grid-cols-[auto,1fr] gap-6'>
						<div className='flex flex-col items-start gap-3'>
							{company.logo ? (
								<div className='h-24 w-24 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden'>
									<Image src={company.logo} alt={i18n._(msg`Company Logo`)} className='max-h-full max-w-full object-contain' width={96} height={96} />
								</div>
							) : (
								<div className='h-24 w-24 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-muted-foreground'>{i18n._(msg`Logo`)}</div>
							)}
							<label className='text-xs text-muted-foreground inline-flex items-center gap-2 cursor-pointer hover:text-foreground transition-colors'>
								<Upload className='h-3.5 w-3.5' />
								<span>{i18n._(msg`Upload logo`)}</span>
								<input type='file' accept='image/*' className='hidden' onChange={async (e)=>{
									const file = e.target.files?.[0]
									if (!file) return
									try {
										const formData = new FormData()
										formData.append('logo', file)
										const res = await fetch('/api/company/logo', { method: 'POST', body: formData, credentials: 'include' })
										if (!res.ok) {
											const error = await res.json().catch(() => ({}))
											toast.error(error.error || i18n._(msg`Failed to upload logo`))
											return
										}
										toast.success(i18n._(msg`Logo uploaded successfully`))
										router.refresh()
									} catch {
										toast.error(i18n._(msg`Failed to upload logo`))
									}
								}} />
							</label>
						</div>
						<div className='grid grid-cols-1 md:grid-cols-2 gap-3 text-foreground'>
							<div><div className='text-xs text-muted-foreground'>{i18n._(msg`Company Name`)}</div><div>{company.name || '—'}</div></div>
							<div><div className='text-xs text-muted-foreground'>{i18n._(msg`Legal Name`)}</div><div>{company.legal_name || '—'}</div></div>
							<div><div className='text-xs text-muted-foreground'>{i18n._(msg`Tax ID`)}</div><div>{company.tax_id || '—'}</div></div>
							<div><div className='text-xs text-muted-foreground'>{i18n._(msg`Email`)}</div><div>{company.email || '—'}</div></div>
							<div><div className='text-xs text-muted-foreground'>{i18n._(msg`Phone`)}</div><div>{company.phone || '—'}</div></div>
							<div><div className='text-xs text-muted-foreground'>{i18n._(msg`Website`)}</div><div>{company.website || '—'}</div></div>
							<div className='md:col-span-2'><div className='text-xs text-muted-foreground'>{i18n._(msg`Address`)}</div><div>{[company.address_line1, company.address_line2, company.city, company.state, company.postal_code, company.country].filter(Boolean).join(', ') || '—'}</div></div>
						</div>
					</div>

					{/* Company Documents - only visible on Basic tab */}
					{companyDocuments && (
						<div className='mt-6 border-t border-white/10 pt-6'>
							<h3 className='text-sm font-medium text-foreground mb-2'>{i18n._(msg`Company Documents`)}</h3>
							<CompanyDocumentsSection
								documents={companyDocuments.documents}
								total={companyDocuments.total}
							/>
						</div>
					)}
				</TabsContent>

				<TabsContent value='policies'>
					<div className='flex items-center justify-between mt-4'>
						<h3 className='text-sm font-medium text-foreground'>{i18n._(msg`Company Leave Policies`)}</h3>
					<Button onClick={() => { setEditingPolicyId(null); setLpForm({ name: '', description: '', policy_type: 'company', leave_type: 'vacation', annual_allocation_days: 0, accrual_rate: 0, accrual_frequency: 'monthly', allow_carry_over: false, max_carry_over_days: 0, carry_over_expiry_months: 0, min_request_days: 0, max_request_days: 0, max_consecutive_days: 0, min_advance_notice_days: 0, requires_manager_approval: false, requires_hr_approval: false, auto_approval_threshold: 0, allow_half_days: false, allow_negative_balance: false, effective_date: '', is_active: true }); setLpOpen(true) }}>{i18n._(msg`Create`)}</Button>
					</div>
                        <div className='mt-3 space-y-2'>
						{leavePoliciesState.length ? leavePoliciesState.map(p => (
                                <div key={p.id} className='border border-white/10 rounded-lg p-3 flex items-center justify-between'>
                                    <div className='flex-1 min-w-0'>
										<div className='text-foreground font-medium'>{p.name}</div>
										<div className='text-xs text-muted-foreground capitalize mt-0.5'>
											{i18n._(msg`Type`)}: {p.leave_type} • {i18n._(msg`Allocation`)}: {p.annual_allocation_days} {i18n._(msg`days/year`)}
											{p.description && <span className='block mt-1'>{p.description}</span>}
										</div>
										<div className='text-xs text-muted-foreground mt-1 flex flex-wrap gap-2'>
											{p.requires_manager_approval && <span className='inline-flex items-center px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-500'>{i18n._(msg`Manager Approval`)}</span>}
											{p.requires_hr_approval && <span className='inline-flex items-center px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-500'>{i18n._(msg`HR Approval`)}</span>}
											{p.allow_half_days && <span className='inline-flex items-center px-1.5 py-0.5 rounded bg-green-500/10 text-green-500'>{i18n._(msg`Half Days`)}</span>}
											{!p.is_active && <span className='inline-flex items-center px-1.5 py-0.5 rounded bg-red-500/10 text-red-500'>{i18n._(msg`Inactive`)}</span>}
										</div>
                                    </div>
                                    <div className='flex items-center gap-2 shrink-0'>
									<Button variant='outline' onClick={()=>{ setEditingPolicyId(p.id); setLpOpen(true); setLpForm({ name: p.name, description: p.description || '', policy_type: p.policy_type, leave_type: p.leave_type, annual_allocation_days: p.annual_allocation_days, accrual_rate: p.accrual_rate, accrual_frequency: p.accrual_frequency, allow_carry_over: p.allow_carry_over, max_carry_over_days: p.max_carry_over_days, carry_over_expiry_months: p.carry_over_expiry_months, min_request_days: p.min_request_days, max_request_days: p.max_request_days, max_consecutive_days: p.max_consecutive_days, min_advance_notice_days: p.min_advance_notice_days, requires_manager_approval: p.requires_manager_approval, requires_hr_approval: p.requires_hr_approval, auto_approval_threshold: p.auto_approval_threshold, allow_half_days: p.allow_half_days, allow_negative_balance: p.allow_negative_balance, effective_date: p.effective_date.split('T')[0], is_active: p.is_active }) }} className='h-8 px-2'><Edit className='h-4 w-4' /></Button>
										<Button variant='destructive' onClick={()=>{ setDeletePolicyTarget({ id: p.id, name: p.name }); setDeletePolicyOpen(true) }} className='h-8 px-2'><Trash2 className='h-4 w-4' /></Button>
                                    </div>
                                </div>
						)) : (<div className='text-muted-foreground text-sm'>{i18n._(msg`No leave policies found.`)}</div>)}
                        </div>
				</TabsContent>

				<TabsContent value='schedules'>
					<div className='flex items-center justify-between mt-4'>
						<h3 className='text-sm font-medium text-foreground'>{i18n._(msg`Pay Schedules`)}</h3>
					<Button onClick={() => { setEditingPayScheduleId(null); setPsForm({ name: '', frequency: 'monthly', start_date: '', is_active: true }); setPsOpen(true) }}>{i18n._(msg`Create`)}</Button>
					</div>
                        <div className='mt-3 space-y-2'>
                            {paySchedulesState.length ? paySchedulesState.map(s => (
                                <div key={s.id} className='border border-white/10 rounded-lg p-3 flex items-center justify-between'>
                                    <div>
										<div className='text-foreground'>{s.name}</div>
										<div className='text-xs text-muted-foreground'>{i18n._(msg`Frequency`)}: {s.frequency} • {i18n._(msg`Start`)}: {formatDate(s.start_date)} • {s.is_active ? i18n._(msg`Active`) : i18n._(msg`Inactive`)}</div>
                                    </div>
                                    <div className='flex items-center gap-2'>
									<Button variant='outline' onClick={()=>{ setEditingPayScheduleId(s.id); setPsOpen(true); setPsForm({ name: s.name, frequency: s.frequency, start_date: (s.start_date || '').split('T')[0], is_active: s.is_active }) }} className='h-8 px-2'><Edit className='h-4 w-4' /></Button>
                                        <Button variant='destructive' onClick={() => { setDeletePayScheduleTarget({ id: s.id, name: s.name }); setDeletePayScheduleOpen(true) }} className='h-8 px-2'><Trash2 className='h-4 w-4' /></Button>
                                    </div>
                                </div>
							)) : (<div className='text-muted-foreground text-sm'>{i18n._(msg`No pay schedules found.`)}</div>)}
                        </div>
				</TabsContent>
			</Tabs>

			{/* Edit Company Dialog */}
			<Dialog open={editOpen} onOpenChange={setEditOpen}>
				<DialogContent className='sm:max-w-2xl'>
					<DialogHeader><DialogTitle>{i18n._(msg`Edit Company`)}</DialogTitle></DialogHeader>
					{error && (
						<div className='bg-red-500/10 border border-red-500/20 text-red-500 px-4 py-2 rounded-lg text-sm'>
							{error}
						</div>
					)}
					<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
						<FormField label={i18n._(msg`Company Name`)} className='md:col-span-2'>
							<Input value={form.name} onChange={(e)=>setForm({ ...form, name: e.target.value })} />
						</FormField>
						<FormField label={i18n._(msg`Legal Name`)} className='md:col-span-2'>
							<Input value={form.legal_name} onChange={(e)=>setForm({ ...form, legal_name: e.target.value })} />
						</FormField>
						<FormField label={i18n._(msg`Tax ID`)}>
							<Input value={form.tax_id} onChange={(e)=>setForm({ ...form, tax_id: e.target.value })} />
						</FormField>
						<FormField label={i18n._(msg`Email`)}>
							<Input type='email' value={form.email} onChange={(e)=>setForm({ ...form, email: e.target.value })} />
						</FormField>
						<FormField label={i18n._(msg`Phone`)}>
							<Input type='tel' value={form.phone} onChange={(e)=>setForm({ ...form, phone: e.target.value })} />
						</FormField>
						<FormField label={i18n._(msg`Website`)}>
							<Input type='url' value={form.website} onChange={(e)=>setForm({ ...form, website: e.target.value })} placeholder='https://' />
						</FormField>
						<FormField label={i18n._(msg`Address Line 1`)} className='md:col-span-2'>
							<Input value={form.address_line1} onChange={(e)=>setForm({ ...form, address_line1: e.target.value })} />
						</FormField>
						<FormField label={i18n._(msg`Address Line 2`)} className='md:col-span-2'>
							<Input value={form.address_line2} onChange={(e)=>setForm({ ...form, address_line2: e.target.value })} />
						</FormField>
						<FormField label={i18n._(msg`City`)}>
							<Input value={form.city} onChange={(e)=>setForm({ ...form, city: e.target.value })} />
						</FormField>
						<FormField label={i18n._(msg`State / Province`)}>
							<Input value={form.state} onChange={(e)=>setForm({ ...form, state: e.target.value })} />
						</FormField>
						<FormField label={i18n._(msg`Postal Code`)}>
							<Input value={form.postal_code} onChange={(e)=>setForm({ ...form, postal_code: e.target.value })} />
						</FormField>
						<FormField label={i18n._(msg`Country`)}>
							<Input value={form.country} onChange={(e)=>setForm({ ...form, country: e.target.value })} />
						</FormField>
					</div>
					<div className='flex justify-end gap-2 pt-4'>
						<Button variant='ghost' onClick={()=>setEditOpen(false)}>{i18n._(msg`Cancel`)}</Button>
						<Button onClick={handleCompanySave} disabled={saving}>{saving ? i18n._(msg`Saving…`) : i18n._(msg`Save`)}</Button>
					</div>
				</DialogContent>
			</Dialog>

			{/* Create Pay Schedule */}
			<Dialog open={psOpen} onOpenChange={setPsOpen}>
				<DialogContent className='sm:max-w-lg'>
				<DialogHeader><DialogTitle>{editingPayScheduleId ? i18n._(msg`Edit Pay Schedule`) : i18n._(msg`Create Pay Schedule`)}</DialogTitle></DialogHeader>
                    <div className='grid gap-3'>
                        <FormField label={i18n._(msg`Name`)}><Input value={psForm.name} onChange={(e)=>setPsForm({ ...psForm, name: e.target.value })} /></FormField>
                        <FormField label={i18n._(msg`Frequency`)}>
                            <Select value={psForm.frequency} onValueChange={(v)=>setPsForm({ ...psForm, frequency: v })}>
                                <SelectTrigger className='w-full bg-neutral-900/90 text-white border-white/20'>
                                    <SelectValue placeholder={i18n._(msg`Select frequency`)} />
                                </SelectTrigger>
                                <SelectContent className='bg-neutral-900 text-white border-white/10'>
                                    <SelectItem value='weekly'>{i18n._(msg`Weekly`)}</SelectItem>
                                    <SelectItem value='biweekly'>{i18n._(msg`Biweekly`)}</SelectItem>
                                    <SelectItem value='semimonthly'>{i18n._(msg`Semi-monthly`)}</SelectItem>
                                    <SelectItem value='monthly'>{i18n._(msg`Monthly`)}</SelectItem>
                                </SelectContent>
                            </Select>
                        </FormField>
                        <FormField label={i18n._(msg`Start Date`)}><Input type='date' value={psForm.start_date} onChange={(e)=>setPsForm({ ...psForm, start_date: e.target.value })} /></FormField>
                        <FormField label={i18n._(msg`Active`)}>
                            <div className='flex items-center gap-2'>
                                <input type='checkbox' checked={psForm.is_active} onChange={(e)=>setPsForm({ ...psForm, is_active: e.target.checked })} className='w-4 h-4' />
                                <span className='text-sm'>{i18n._(msg`Active`)}</span>
                            </div>
                        </FormField>
                    </div>
					<div className='flex justify-end gap-2 pt-4'>
						<Button variant='ghost' onClick={()=>{ setPsOpen(false); setEditingPayScheduleId(null); setPsForm({ name: '', frequency: 'monthly', start_date: '', is_active: true }) }}>{i18n._(msg`Cancel`)}</Button>
						<Button onClick={async ()=>{ 
							if (editingPayScheduleId) { 
								setSaving(true)
								const formData = new FormData()
								formData.append('name', psForm.name)
								formData.append('frequency', psForm.frequency)
								formData.append('start_date', psForm.start_date)
								formData.append('is_active', String(psForm.is_active))
								const result = await updatePayScheduleAction(editingPayScheduleId, null, formData)
								setSaving(false)
								if (result.success) {
									// Convert date to ISO format for state (YYYY-MM-DD -> YYYY-MM-DDTHH:mm:ssZ)
									const isoDate = psForm.start_date && !psForm.start_date.includes('T') 
										? `${psForm.start_date}T00:00:00Z` 
										: psForm.start_date
									// Update local state immediately
									setPaySchedulesState(prev => prev.map(s => 
										s.id === editingPayScheduleId 
											? { ...s, name: psForm.name, frequency: psForm.frequency, start_date: isoDate, is_active: psForm.is_active }
											: s
									))
									toast.success(i18n._(msg`Pay schedule updated successfully`))
									setPsOpen(false)
									setEditingPayScheduleId(null)
									setPsForm({ name: '', frequency: 'monthly', start_date: '', is_active: true })
									router.refresh()
								} else {
									toast.error(result.errors?._form?.[0] || i18n._(msg`Failed to update pay schedule`))
								}
							} else {
								await handleCreatePaySchedule()
							}
						}} disabled={saving}>{saving ? i18n._(msg`Saving…`) : i18n._(msg`Save`)}</Button>
					</div>
				</DialogContent>
			</Dialog>

			{/* Create/Edit Leave Policy */}
			<Dialog open={lpOpen} onOpenChange={setLpOpen}>
				<DialogContent className='sm:max-w-3xl max-h-[90vh] overflow-y-auto'>
					<DialogHeader><DialogTitle>{editingPolicyId ? i18n._(msg`Edit Leave Policy`) : i18n._(msg`Create Leave Policy`)}</DialogTitle></DialogHeader>
                    <div className='grid gap-4'>
						{/* Basic Information */}
						<div className='space-y-3'>
							<h4 className='text-sm font-medium'>{i18n._(msg`Basic Information`)}</h4>
							<div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
								<FormField label={i18n._(msg`Policy Name`)} required>
									<Input value={lpForm.name} onChange={(e)=>setLpForm({ ...lpForm, name: e.target.value })} placeholder={i18n._(msg`e.g., Annual Leave`)} />
								</FormField>
								<FormField label={i18n._(msg`Leave Type`)} required>
									<Select value={lpForm.leave_type} onValueChange={(v)=>setLpForm({ ...lpForm, leave_type: v })}>
										<SelectTrigger className='w-full bg-background border-input'>
											<SelectValue placeholder={i18n._(msg`Select leave type`)} />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value='vacation'>{i18n._(msg`Vacation`)}</SelectItem>
											<SelectItem value='sick'>{i18n._(msg`Sick Leave`)}</SelectItem>
											<SelectItem value='personal'>{i18n._(msg`Personal Leave`)}</SelectItem>
											<SelectItem value='maternity'>{i18n._(msg`Maternity Leave`)}</SelectItem>
											<SelectItem value='paternity'>{i18n._(msg`Paternity Leave`)}</SelectItem>
											<SelectItem value='bereavement'>{i18n._(msg`Bereavement Leave`)}</SelectItem>
											<SelectItem value='emergency'>{i18n._(msg`Emergency Leave`)}</SelectItem>
										</SelectContent>
									</Select>
								</FormField>
								<FormField label={i18n._(msg`Effective Date`)} required className='md:col-span-2'>
									<Input type='date' value={lpForm.effective_date} onChange={(e)=>setLpForm({ ...lpForm, effective_date: e.target.value })} />
								</FormField>
								<FormField label={i18n._(msg`Description`)} className='md:col-span-2'>
									<textarea
										value={lpForm.description}
										onChange={(e)=>setLpForm({ ...lpForm, description: e.target.value })}
										rows={2}
										placeholder={i18n._(msg`Optional description or notes`)}
										className='w-full px-3 py-2 text-sm border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors resize-none'
									/>
								</FormField>
							</div>
						</div>

						{/* Allocation & Accrual */}
						<div className='space-y-3 pt-3 border-t'>
							<h4 className='text-sm font-medium'>{i18n._(msg`Allocation & Accrual`)}</h4>
							<div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
								<FormField label={i18n._(msg`Annual Allocation (days)`)} required>
									<Input type='number' min='0' value={lpForm.annual_allocation_days} onChange={(e)=>setLpForm({ ...lpForm, annual_allocation_days: Number(e.target.value) })} />
								</FormField>
								<FormField label={i18n._(msg`Accrual Rate (per month)`)} required>
									<Input type='number' min='0' step='0.1' value={lpForm.accrual_rate} onChange={(e)=>setLpForm({ ...lpForm, accrual_rate: Number(e.target.value) })} />
								</FormField>
							</div>
						</div>

						{/* Carry Over Settings */}
						<div className='space-y-3 pt-3 border-t'>
							<h4 className='text-sm font-medium'>{i18n._(msg`Carry Over Settings`)}</h4>
							<div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
								<div className='md:col-span-2 flex items-center gap-2'>
									<input
										type='checkbox'
										id='allow_carry_over'
										checked={lpForm.allow_carry_over}
										onChange={(e)=>setLpForm({ ...lpForm, allow_carry_over: e.target.checked })}
										className='h-4 w-4 rounded border-input'
									/>
									<label htmlFor='allow_carry_over' className='text-sm cursor-pointer'>{i18n._(msg`Allow carry over to next period`)}</label>
								</div>
								{lpForm.allow_carry_over && (
									<>
										<FormField label={i18n._(msg`Max Carry Over Days`)}>
											<Input type='number' min='0' value={lpForm.max_carry_over_days} onChange={(e)=>setLpForm({ ...lpForm, max_carry_over_days: Number(e.target.value) })} />
										</FormField>
										<FormField label={i18n._(msg`Carry Over Expiry (months)`)}>
											<Input type='number' min='0' value={lpForm.carry_over_expiry_months} onChange={(e)=>setLpForm({ ...lpForm, carry_over_expiry_months: Number(e.target.value) })} />
										</FormField>
									</>
								)}
							</div>
						</div>

						{/* Request Limits */}
						<div className='space-y-3 pt-3 border-t'>
							<h4 className='text-sm font-medium'>{i18n._(msg`Request Limits`)}</h4>
							<div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
								<FormField label={i18n._(msg`Min Request Days`)}>
									<Input type='number' min='0' value={lpForm.min_request_days} onChange={(e)=>setLpForm({ ...lpForm, min_request_days: Number(e.target.value) })} />
								</FormField>
								<FormField label={i18n._(msg`Max Request Days`)}>
									<Input type='number' min='0' value={lpForm.max_request_days} onChange={(e)=>setLpForm({ ...lpForm, max_request_days: Number(e.target.value) })} />
								</FormField>
								<FormField label={i18n._(msg`Max Consecutive Days`)}>
									<Input type='number' min='0' value={lpForm.max_consecutive_days} onChange={(e)=>setLpForm({ ...lpForm, max_consecutive_days: Number(e.target.value) })} />
								</FormField>
								<FormField label={i18n._(msg`Min Advance Notice (days)`)}>
									<Input type='number' min='0' value={lpForm.min_advance_notice_days} onChange={(e)=>setLpForm({ ...lpForm, min_advance_notice_days: Number(e.target.value) })} />
								</FormField>
							</div>
						</div>

						{/* Approval & Options */}
						<div className='space-y-3 pt-3 border-t'>
							<h4 className='text-sm font-medium'>{i18n._(msg`Approval & Options`)}</h4>
							<div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
								<div className='flex items-center gap-2'>
									<input
										type='checkbox'
										id='requires_manager_approval'
										checked={lpForm.requires_manager_approval}
										onChange={(e)=>setLpForm({ ...lpForm, requires_manager_approval: e.target.checked })}
										className='h-4 w-4 rounded border-input'
									/>
									<label htmlFor='requires_manager_approval' className='text-sm cursor-pointer'>{i18n._(msg`Requires Manager Approval`)}</label>
								</div>
								<div className='flex items-center gap-2'>
									<input
										type='checkbox'
										id='requires_hr_approval'
										checked={lpForm.requires_hr_approval}
										onChange={(e)=>setLpForm({ ...lpForm, requires_hr_approval: e.target.checked })}
										className='h-4 w-4 rounded border-input'
									/>
									<label htmlFor='requires_hr_approval' className='text-sm cursor-pointer'>{i18n._(msg`Requires HR Approval`)}</label>
								</div>
								<div className='flex items-center gap-2'>
									<input
										type='checkbox'
										id='allow_half_days'
										checked={lpForm.allow_half_days}
										onChange={(e)=>setLpForm({ ...lpForm, allow_half_days: e.target.checked })}
										className='h-4 w-4 rounded border-input'
									/>
									<label htmlFor='allow_half_days' className='text-sm cursor-pointer'>{i18n._(msg`Allow Half Days`)}</label>
								</div>
								<div className='flex items-center gap-2'>
									<input
										type='checkbox'
										id='allow_negative_balance'
										checked={lpForm.allow_negative_balance}
										onChange={(e)=>setLpForm({ ...lpForm, allow_negative_balance: e.target.checked })}
										className='h-4 w-4 rounded border-input'
									/>
									<label htmlFor='allow_negative_balance' className='text-sm cursor-pointer'>{i18n._(msg`Allow Negative Balance`)}</label>
								</div>
								<div className='flex items-center gap-2'>
									<input
										type='checkbox'
										id='is_active'
										checked={lpForm.is_active}
										onChange={(e)=>setLpForm({ ...lpForm, is_active: e.target.checked })}
										className='h-4 w-4 rounded border-input'
									/>
									<label htmlFor='is_active' className='text-sm cursor-pointer font-medium'>{i18n._(msg`Active Policy`)}</label>
								</div>
							</div>
						</div>
                    </div>
					<div className='flex justify-end gap-2 pt-4 border-t'>
						<Button variant='ghost' onClick={()=>{ setLpOpen(false); setEditingPolicyId(null); setLpForm({ name: '', description: '', policy_type: 'company', leave_type: 'vacation', annual_allocation_days: 0, accrual_rate: 0, accrual_frequency: 'monthly', allow_carry_over: false, max_carry_over_days: 0, carry_over_expiry_months: 0, min_request_days: 0, max_request_days: 0, max_consecutive_days: 0, min_advance_notice_days: 0, requires_manager_approval: false, requires_hr_approval: false, auto_approval_threshold: 0, allow_half_days: false, allow_negative_balance: false, effective_date: '', is_active: true }) }}>{i18n._(msg`Cancel`)}</Button>
						<Button onClick={async ()=>{ if (editingPolicyId) { const formData = new FormData(); Object.entries(lpForm).forEach(([key, value]) => formData.append(key, String(value))); await updateLeavePolicyAction(editingPolicyId, null, formData); window.location.href = `?tab=${activeTab}` } else { await handleCreateLeavePolicy() } }} disabled={saving}>{saving ? i18n._(msg`Saving…`) : i18n._(msg`Save`)}</Button>
					</div>
				</DialogContent>
			</Dialog>
		</div>

		{/* Delete Leave Policy Confirmation */}
		<AlertDialog open={deletePolicyOpen} onOpenChange={setDeletePolicyOpen}>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>{i18n._(msg`Delete leave policy?`)}</AlertDialogTitle>
					<AlertDialogDescription>
						{i18n._(msg`This action cannot be undone. This will permanently delete ${deletePolicyTarget?.name ?? ''}.`)}
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel disabled={deletingPolicy}>{i18n._(msg`Cancel`)}</AlertDialogCancel>
					<AlertDialogAction onClick={handleDeletePolicyConfirm} disabled={deletingPolicy} className='bg-destructive text-destructive-foreground hover:bg-destructive/90'>
						{deletingPolicy ? i18n._(msg`Deleting…`) : i18n._(msg`Delete`)}
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>

		{/* Delete Pay Schedule Confirmation */}
		<AlertDialog open={deletePayScheduleOpen} onOpenChange={setDeletePayScheduleOpen}>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>{i18n._(msg`Delete pay schedule?`)}</AlertDialogTitle>
					<AlertDialogDescription>
						{i18n._(msg`This action cannot be undone. This will permanently delete ${deletePayScheduleTarget?.name ?? ''}.`)}
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel disabled={deletingPaySchedule}>{i18n._(msg`Cancel`)}</AlertDialogCancel>
					<AlertDialogAction onClick={handleDeletePayScheduleConfirm} disabled={deletingPaySchedule} className='bg-destructive text-destructive-foreground hover:bg-destructive/90'>
						{deletingPaySchedule ? i18n._(msg`Deleting…`) : i18n._(msg`Delete`)}
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
		</>
	)
}


