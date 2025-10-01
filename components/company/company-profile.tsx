'use client'
import React, { useState } from 'react'
import { Button } from '@/components/ui'
import { FormField, Input } from '@/components/auth/form-field'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { CompanyService, LeavePoliciesService, PaySchedulesService } from '@/lib/services/company'
import { Edit, Trash2, Upload } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface CompanyProfileProps {
	company: {
		id: string
		name: string
		registration_number?: string
		tax_number?: string
		address_line1?: string
		address_line2?: string
		city?: string
		state?: string
		postal_code?: string
		country?: string
		bank_name?: string
		bank_account?: string
		bank_iban?: string
		bank_swift?: string
	}
	paySchedules: { id: string, name: string, frequency: string, start_date: string, is_active: boolean }[]
	leavePolicies: { id: string, name: string, leave_type: string, annual_allocation_days: number }[]
}

export function CompanyProfile({ company, paySchedules, leavePolicies }: CompanyProfileProps) {
	const [editOpen, setEditOpen] = useState(false)
	const [psOpen, setPsOpen] = useState(false)
	const [lpOpen, setLpOpen] = useState(false)

	const [form, setForm] = useState({
		name: company.name || '',
		registration_number: company.registration_number || '',
		tax_number: company.tax_number || '',
		address_line1: company.address_line1 || '',
		address_line2: company.address_line2 || '',
		city: company.city || '',
		state: company.state || '',
		postal_code: company.postal_code || '',
		country: company.country || '',
		bank_name: company.bank_name || '',
		bank_account: company.bank_account || '',
		bank_iban: company.bank_iban || '',
		bank_swift: company.bank_swift || '',
	})

	const [psForm, setPsForm] = useState({ name: '', frequency: 'monthly', start_date: '' })
	const [lpForm, setLpForm] = useState({ name: '', leave_type: 'annual', annual_allocation_days: 0 })
	const [saving, setSaving] = useState(false)

	async function handleCompanySave() {
		setSaving(true)
		try { await CompanyService.update(form); window.location.reload() } finally { setSaving(false); setEditOpen(false) }
	}

	async function handleCreatePaySchedule() {
		setSaving(true)
		try { await PaySchedulesService.create(psForm); window.location.reload() } finally { setSaving(false); setPsOpen(false) }
	}

	async function handleCreateLeavePolicy() {
		setSaving(true)
		try { await LeavePoliciesService.create(lpForm); window.location.reload() } finally { setSaving(false); setLpOpen(false) }
	}

	return (
		<div className='glass rounded-xl p-4'>
			<Tabs defaultValue='basic' className='w-full'>
				<div className='flex items-center justify-between'>
					<TabsList>
						<TabsTrigger value='basic'>Basic Information</TabsTrigger>
						<TabsTrigger value='policies'>Leave Policies</TabsTrigger>
						<TabsTrigger value='schedules'>Pay Schedules</TabsTrigger>
					</TabsList>
				</div>

				<TabsContent value='basic'>
					<div className='flex items-center justify-between mt-4'>
						<h3 className='text-sm font-medium text-white'>Company Information</h3>
						<Button onClick={() => setEditOpen(true)}>Edit</Button>
					</div>
					<div className='mt-3 grid grid-cols-1 md:grid-cols-[auto,1fr] gap-6'>
						<div className='flex flex-col items-start gap-3'>
                        <div className='h-24 w-24 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-neutral-400'>Logo</div>
							<label className='text-xs text-neutral-300 inline-flex items-center gap-2 cursor-pointer'>
                            <Upload className='h-3.5 w-3.5' />
                            <span>Upload logo</span>
                            <input type='file' accept='image/*' className='hidden' onChange={async (e)=>{
                                const file = e.target.files?.[0]
                                if (!file) return
                                const formData = new FormData()
                                formData.append('logo', file)
                                await fetch('/api/company/logo', { method: 'POST', body: formData, credentials: 'include' })
                                window.location.reload()
                            }} />
                        </label>
                    </div>
						<div className='grid grid-cols-1 md:grid-cols-2 gap-3 text-neutral-300'>
							<div><div className='text-xs text-neutral-400'>Name</div><div>{company.name || '—'}</div></div>
							<div><div className='text-xs text-neutral-400'>Reg. Number</div><div>{company.registration_number || '—'}</div></div>
							<div><div className='text-xs text-neutral-400'>Tax Number</div><div>{company.tax_number || '—'}</div></div>
							<div><div className='text-xs text-neutral-400'>Country</div><div>{company.country || '—'}</div></div>
							<div className='md:col-span-2'><div className='text-xs text-neutral-400'>Address</div><div>{[company.address_line1, company.address_line2, company.city, company.state, company.postal_code].filter(Boolean).join(', ') || '—'}</div></div>
						</div>
					</div>
				</TabsContent>

				<TabsContent value='policies'>
					<div className='flex items-center justify-between mt-4'>
						<h3 className='text-sm font-medium text-white'>Company Leave Policies</h3>
						<Button onClick={() => setLpOpen(true)}>Create</Button>
					</div>
                        <div className='mt-3 space-y-2'>
                            {leavePolicies.length ? leavePolicies.map(p => (
                                <div key={p.id} className='border border-white/10 rounded-lg p-3 flex items-center justify-between'>
                                    <div>
                                        <div className='text-white'>{p.name}</div>
                                        <div className='text-xs text-neutral-400 capitalize'>Type: {p.leave_type} • Allocation: {p.annual_allocation_days} days</div>
                                    </div>
                                    <div className='flex items-center gap-2'>
                                        <Button variant='outline' onClick={()=>{ setLpOpen(true); setLpForm({ name: p.name, leave_type: p.leave_type, annual_allocation_days: p.annual_allocation_days }) }} className='h-8 px-2'><Edit className='h-4 w-4' /></Button>
                                        <Button variant='destructive' onClick={async ()=>{ await LeavePoliciesService.remove(p.id); window.location.reload() }} className='h-8 px-2'><Trash2 className='h-4 w-4' /></Button>
                                    </div>
                                </div>
                            )) : (<div className='text-neutral-400 text-sm'>No leave policies found.</div>)}
                        </div>
				</TabsContent>

				<TabsContent value='schedules'>
					<div className='flex items-center justify-between mt-4'>
						<h3 className='text-sm font-medium text-white'>Pay Schedules</h3>
						<Button onClick={() => setPsOpen(true)}>Create</Button>
					</div>
                        <div className='mt-3 space-y-2'>
                            {paySchedules.length ? paySchedules.map(s => (
                                <div key={s.id} className='border border-white/10 rounded-lg p-3 flex items-center justify-between'>
                                    <div>
                                        <div className='text-white'>{s.name}</div>
                                        <div className='text-xs text-neutral-400'>Frequency: {s.frequency} • Start: {s.start_date} • {s.is_active ? 'Active' : 'Inactive'}</div>
                                    </div>
                                    <div className='flex items-center gap-2'>
                                        <Button variant='outline' onClick={()=>{ setPsOpen(true); setPsForm({ name: s.name, frequency: s.frequency, start_date: (s.start_date || '').slice(0,10) }) }} className='h-8 px-2'><Edit className='h-4 w-4' /></Button>
                                        <Button variant='destructive' onClick={async ()=>{ await PaySchedulesService.remove(s.id); window.location.reload() }} className='h-8 px-2'><Trash2 className='h-4 w-4' /></Button>
                                    </div>
                                </div>
                            )) : (<div className='text-neutral-400 text-sm'>No pay schedules found.</div>)}
                        </div>
				</TabsContent>
			</Tabs>

			{/* Edit Company Dialog */}
			<Dialog open={editOpen} onOpenChange={setEditOpen}>
				<DialogContent className='sm:max-w-2xl'>
					<DialogHeader><DialogTitle>Edit Company</DialogTitle></DialogHeader>
					<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
						<FormField label='Name'>
							<Input value={form.name} onChange={(e)=>setForm({ ...form, name: e.target.value })} />
						</FormField>
						<FormField label='Registration Number'>
							<Input value={form.registration_number} onChange={(e)=>setForm({ ...form, registration_number: e.target.value })} />
						</FormField>
						<FormField label='Tax Number'>
							<Input value={form.tax_number} onChange={(e)=>setForm({ ...form, tax_number: e.target.value })} />
						</FormField>
						<FormField label='Country'>
							<Input value={form.country} onChange={(e)=>setForm({ ...form, country: e.target.value })} />
						</FormField>
						<FormField label='Address Line 1' className='md:col-span-2'>
							<Input value={form.address_line1} onChange={(e)=>setForm({ ...form, address_line1: e.target.value })} />
						</FormField>
						<FormField label='Address Line 2' className='md:col-span-2'>
							<Input value={form.address_line2} onChange={(e)=>setForm({ ...form, address_line2: e.target.value })} />
						</FormField>
						<FormField label='City'>
							<Input value={form.city} onChange={(e)=>setForm({ ...form, city: e.target.value })} />
						</FormField>
						<FormField label='State'>
							<Input value={form.state} onChange={(e)=>setForm({ ...form, state: e.target.value })} />
						</FormField>
						<FormField label='Postal Code'>
							<Input value={form.postal_code} onChange={(e)=>setForm({ ...form, postal_code: e.target.value })} />
						</FormField>
						<FormField label='Bank Name'>
							<Input value={form.bank_name} onChange={(e)=>setForm({ ...form, bank_name: e.target.value })} />
						</FormField>
						<FormField label='Bank Account'>
							<Input value={form.bank_account} onChange={(e)=>setForm({ ...form, bank_account: e.target.value })} />
						</FormField>
						<FormField label='IBAN'>
							<Input value={form.bank_iban} onChange={(e)=>setForm({ ...form, bank_iban: e.target.value })} />
						</FormField>
						<FormField label='SWIFT'>
							<Input value={form.bank_swift} onChange={(e)=>setForm({ ...form, bank_swift: e.target.value })} />
						</FormField>
					</div>
					<div className='flex justify-end gap-2 pt-4'>
						<Button variant='ghost' onClick={()=>setEditOpen(false)}>Cancel</Button>
						<Button onClick={handleCompanySave} disabled={saving}>{saving ? 'Saving…' : 'Save'}</Button>
					</div>
				</DialogContent>
			</Dialog>

			{/* Create Pay Schedule */}
			<Dialog open={psOpen} onOpenChange={setPsOpen}>
				<DialogContent className='sm:max-w-lg'>
					<DialogHeader><DialogTitle>Create Pay Schedule</DialogTitle></DialogHeader>
                    <div className='grid gap-3'>
                        <FormField label='Name'><Input value={psForm.name} onChange={(e)=>setPsForm({ ...psForm, name: e.target.value })} /></FormField>
                        <FormField label='Frequency'>
                            <Select value={psForm.frequency} onValueChange={(v)=>setPsForm({ ...psForm, frequency: v })}>
                                <SelectTrigger className='w-full bg-neutral-900/90 text-white border-white/20'>
                                    <SelectValue placeholder='Select frequency' />
                                </SelectTrigger>
                                <SelectContent className='bg-neutral-900 text-white border-white/10'>
                                    <SelectItem value='weekly'>Weekly</SelectItem>
                                    <SelectItem value='biweekly'>Biweekly</SelectItem>
                                    <SelectItem value='semimonthly'>Semi-monthly</SelectItem>
                                    <SelectItem value='monthly'>Monthly</SelectItem>
                                </SelectContent>
                            </Select>
                        </FormField>
                        <FormField label='Start Date'><Input type='date' value={psForm.start_date} onChange={(e)=>setPsForm({ ...psForm, start_date: e.target.value })} /></FormField>
                    </div>
					<div className='flex justify-end gap-2 pt-4'>
                        <Button variant='ghost' onClick={()=>setPsOpen(false)}>Cancel</Button>
                        <Button onClick={async ()=>{ if (paySchedules.find(x=>x.name===psForm.name)) { const id = (paySchedules.find(x=>x.name===psForm.name) as any).id; await PaySchedulesService.update(id, psForm) } else { await handleCreatePaySchedule() } }} disabled={saving}>{saving ? 'Saving…' : 'Save'}</Button>
					</div>
				</DialogContent>
			</Dialog>

			{/* Create Leave Policy */}
			<Dialog open={lpOpen} onOpenChange={setLpOpen}>
				<DialogContent className='sm:max-w-lg'>
					<DialogHeader><DialogTitle>Create Leave Policy</DialogTitle></DialogHeader>
                    <div className='grid gap-3'>
                        <FormField label='Name'><Input value={lpForm.name} onChange={(e)=>setLpForm({ ...lpForm, name: e.target.value })} /></FormField>
                        <FormField label='Type'><Input value={lpForm.leave_type} onChange={(e)=>setLpForm({ ...lpForm, leave_type: e.target.value })} /></FormField>
                        <FormField label='Annual Allocation (days)'><Input type='number' value={lpForm.annual_allocation_days} onChange={(e)=>setLpForm({ ...lpForm, annual_allocation_days: Number(e.target.value) })} /></FormField>
                    </div>
					<div className='flex justify-end gap-2 pt-4'>
                        <Button variant='ghost' onClick={()=>setLpOpen(false)}>Cancel</Button>
                        <Button onClick={async ()=>{ if (leavePolicies.find(x=>x.name===lpForm.name)) { const id = (leavePolicies.find(x=>x.name===lpForm.name) as any).id; await LeavePoliciesService.update(id, lpForm) } else { await handleCreateLeavePolicy() } }} disabled={saving}>{saving ? 'Saving…' : 'Save'}</Button>
					</div>
				</DialogContent>
			</Dialog>
		</div>
	)
}


