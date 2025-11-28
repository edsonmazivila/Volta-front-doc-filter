'use client'

import React, { useActionState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useToast } from '@/components/ui/toast'
import { createDepartmentAction, updateDepartmentAction, type Department } from '@/lib/services/departments'
import { useLingui } from '@lingui/react'
import { msg } from '@lingui/core/macro'

interface DepartmentFormProps {
	department?: Department
	onCancel: () => void
	onSuccess: () => void
	managers?: Array<{ id: string; full_name: string }>
}

export function DepartmentForm({ department, onCancel, onSuccess, managers = [] }: DepartmentFormProps) {
	const { showToast } = useToast()
	const { i18n } = useLingui()
	const isEditing = !!department

	const [createState, createAction, createPending] = useActionState(
		createDepartmentAction,
		null
	)

	const [updateState, updateAction, updatePending] = useActionState(
		department ? updateDepartmentAction.bind(null, department.id) : createDepartmentAction,
		null
	)

	const state = isEditing ? updateState : createState
	const action = isEditing ? updateAction : createAction
	const pending = isEditing ? updatePending : createPending

	// Stabilize callbacks to avoid effect loops from changing function identities
	const onSuccessRef = React.useRef(onSuccess)
	const showToastRef = React.useRef(showToast)
	const isEditingRef = React.useRef(isEditing)
	const i18nRef = React.useRef(i18n)

	React.useEffect(() => {
		onSuccessRef.current = onSuccess
		showToastRef.current = showToast
		isEditingRef.current = isEditing
		i18nRef.current = i18n
	}, [onSuccess, showToast, isEditing, i18n])

	// Only react to success flag change to prevent infinite re-renders
	const isSuccess = !!(state && 'success' in state && state.success)
	React.useEffect(() => {
		if (!isSuccess) return
		showToastRef.current({
			type: 'success',
			message: isEditingRef.current
				? i18nRef.current._(msg`Department updated successfully`)
				: i18nRef.current._(msg`Department created successfully`),
			title: i18nRef.current._(msg`Success`),
		})
		onSuccessRef.current()
	}, [isSuccess])

	return (
		<form action={action} className='space-y-4'>
			<div>
				<label htmlFor='name' className='block text-sm font-medium text-foreground mb-1'>
					{i18n._(msg`Department Name`)} <span className='text-red-500'>*</span>
				</label>
				<Input
					id='name'
					name='name'
					type='text'
					defaultValue={department?.name}
					placeholder={i18n._(msg`e.g. Engineering, Sales, HR`)}
					required
				/>
				{state && 'errors' in state && state.errors?.name && (
					<p className='text-sm text-red-600 mt-1'>{state.errors.name[0]}</p>
				)}
			</div>

			<div>
				<label htmlFor='description' className='block text-sm font-medium text-foreground mb-1'>
					{i18n._(msg`Description`)}
				</label>
				<textarea
					id='description'
					name='description'
					defaultValue={department?.description}
					placeholder={i18n._(msg`Brief description of the department`)}
					rows={3}
					className='w-full px-3 py-2 border border-input rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring'
				/>
				{state && 'errors' in state && state.errors?.description && (
					<p className='text-sm text-red-600 mt-1'>{state.errors.description[0]}</p>
				)}
			</div>

			<div>
				<label htmlFor='manager_id' className='block text-sm font-medium text-foreground mb-1'>
					{i18n._(msg`Department Manager`)}
				</label>
				<select
					id='manager_id'
					name='manager_id'
					defaultValue={department?.manager_id || ''}
					className='w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring'
				>
					<option value=''>{i18n._(msg`No manager assigned`)}</option>
					{managers.map((manager) => (
						<option key={manager.id} value={manager.id}>
							{manager.full_name}
						</option>
					))}
				</select>
			</div>

			<div className='flex items-center gap-2'>
				{/* Ensure a value is always submitted when checkbox is unchecked */}
				<input type='hidden' name='is_active' value='false' />
				<input
					id='is_active'
					name='is_active'
					type='checkbox'
					defaultChecked={department?.is_active ?? true}
					value='true'
					className='w-4 h-4 text-primary border-input rounded focus:ring-ring'
				/>
				<label htmlFor='is_active' className='text-sm font-medium text-foreground'>
					{i18n._(msg`Active`)}
				</label>
			</div>

			{state && 'errors' in state && state.errors?._form && (
				<div className='p-3 rounded-md bg-red-50 dark:bg-red-900/20'>
					<p className='text-sm text-red-600 dark:text-red-400'>{state.errors._form[0]}</p>
				</div>
			)}

			<div className='flex justify-end gap-3 pt-4'>
				<Button type='button' variant='outline' onClick={onCancel} disabled={pending}>
					{i18n._(msg`Cancel`)}
				</Button>
				<Button type='submit' disabled={pending}>
					{pending
						? i18n._(msg`Saving...`)
						: isEditing
							? i18n._(msg`Update Department`)
							: i18n._(msg`Create Department`)}
				</Button>
			</div>
		</form>
	)
}
