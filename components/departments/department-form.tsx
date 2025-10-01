'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useToast } from '@/components/ui/toast'

export interface DepartmentFormData {
	name: string
	description: string
	manager_id: string | null
	is_active: boolean
}

interface DepartmentFormProps {
	initialData?: Partial<DepartmentFormData>
	onSubmit: (data: DepartmentFormData) => Promise<void>
	onCancel: () => void
	managers?: Array<{ id: string; first_name: string; last_name: string }>
}

export function DepartmentForm({ initialData, onSubmit, onCancel, managers = [] }: DepartmentFormProps) {
	const [formData, setFormData] = useState<DepartmentFormData>({
		name: initialData?.name || '',
		description: initialData?.description || '',
		manager_id: initialData?.manager_id || null,
		is_active: initialData?.is_active ?? true,
	})
	const [loading, setLoading] = useState(false)
	const { showToast } = useToast()

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()

		if (!formData.name.trim()) {
			showToast({
				type: 'error',
				title: 'Validation Error',
				message: 'Department name is required',
			})
			return
		}

		try {
			setLoading(true)
			await onSubmit(formData)
		} catch (error) {
			console.error('Form submission error:', error)
		} finally {
			setLoading(false)
		}
	}

	return (
		<form onSubmit={handleSubmit} className='space-y-4'>
			<div>
				<label htmlFor='name' className='block text-sm font-medium text-foreground mb-1'>
					Department Name <span className='text-red-500'>*</span>
				</label>
				<Input
					id='name'
					type='text'
					value={formData.name}
					onChange={(e) => setFormData({ ...formData, name: e.target.value })}
					placeholder='e.g. Engineering, Sales, HR'
					required
				/>
			</div>

			<div>
				<label htmlFor='description' className='block text-sm font-medium text-foreground mb-1'>
					Description
				</label>
				<textarea
					id='description'
					value={formData.description}
					onChange={(e) => setFormData({ ...formData, description: e.target.value })}
					placeholder='Brief description of the department'
					rows={3}
					className='w-full px-3 py-2 border border-input rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring'
				/>
			</div>

			<div>
				<label htmlFor='manager_id' className='block text-sm font-medium text-foreground mb-1'>
					Department Manager
				</label>
				<select
					id='manager_id'
					value={formData.manager_id || ''}
					onChange={(e) => setFormData({ ...formData, manager_id: e.target.value || null })}
					className='w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring'
				>
					<option value=''>No manager assigned</option>
					{managers.map((manager) => (
						<option key={manager.id} value={manager.id}>
							{manager.first_name} {manager.last_name}
						</option>
					))}
				</select>
			</div>

			<div className='flex items-center gap-2'>
				<input
					id='is_active'
					type='checkbox'
					checked={formData.is_active}
					onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
					className='w-4 h-4 text-primary border-input rounded focus:ring-ring'
				/>
				<label htmlFor='is_active' className='text-sm font-medium text-foreground'>
					Active
				</label>
			</div>

			<div className='flex justify-end gap-3 pt-4'>
				<Button type='button' variant='outline' onClick={onCancel} disabled={loading}>
					Cancel
				</Button>
				<Button type='submit' disabled={loading}>
					{loading ? 'Saving...' : initialData ? 'Update Department' : 'Create Department'}
				</Button>
			</div>
		</form>
	)
}
