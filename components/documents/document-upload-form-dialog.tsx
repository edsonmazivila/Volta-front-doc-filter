'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useToastHelpers } from '@/components/ui/toast'
import { uploadDocumentAction } from '@/lib/services/documents'
import { useLingui } from '@lingui/react'
import { msg } from '@lingui/core/macro'

interface DocumentUploadFormDialogProps {
	open: boolean
	onOpenChange: (open: boolean) => void
	employees: Array<{ id: string; label: string }>
	documentTypes: Array<{ type: string; display_name: string }>
}

export function DocumentUploadFormDialog({
	open,
	onOpenChange,
	employees,
	documentTypes
}: DocumentUploadFormDialogProps) {
	const router = useRouter()
	const toast = useToastHelpers()
	const { i18n } = useLingui()
	const fileInputRef = useRef<HTMLInputElement | null>(null)

	const [file, setFile] = useState<File | null>(null)
	const [employeeId, setEmployeeId] = useState('')
	const [docType, setDocType] = useState('')
	const [title, setTitle] = useState('')
	const [description, setDescription] = useState('')
	const [expiryDate, setExpiryDate] = useState('')
	const [confidential, setConfidential] = useState(false)
	const [uploading, setUploading] = useState(false)

	const resetForm = () => {
		setFile(null)
		setEmployeeId('')
		setDocType('')
		setTitle('')
		setDescription('')
		setExpiryDate('')
		setConfidential(false)
	}

	const handleClose = () => {
		resetForm()
		onOpenChange(false)
	}

	const openFilePicker = () => {
		fileInputRef.current?.click()
	}

	const handleUpload = async () => {
		if (!file || !employeeId || !docType) {
			toast.error(i18n._(msg`Employee, type, and file are required`))
			return
		}

		const form = new FormData()
		form.append('employee_id', employeeId)
		form.append('document_type', docType)
		if (title) form.append('title', title)
		if (description) form.append('description', description)
		if (expiryDate) form.append('expiry_date', expiryDate)
		if (confidential) form.append('is_confidential', 'true')
		form.append('file', file)

		setUploading(true)
		try {
			const result = await uploadDocumentAction(null, form)
			if ('errors' in result) {
				toast.error(result.errors._form?.[0] || i18n._(msg`Upload failed`))
			} else {
				toast.success(i18n._(msg`Uploaded`))
				handleClose()
				router.refresh()
			}
		} catch{
			toast.error(i18n._(msg`Upload failed`))
		} finally {
			setUploading(false)
		}
	}

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>{i18n._(msg`Upload Document`)}</DialogTitle>
				</DialogHeader>
				<div className='grid gap-3'>
					{/* Employee Selection */}
					<div className='flex flex-col gap-1'>
						<label className='text-sm font-medium'>{i18n._(msg`Employee`)}</label>
						<select
							className='w-full border rounded-md px-3 py-2 bg-background'
							value={employeeId}
							onChange={(e) => setEmployeeId(e.target.value)}
						>
							<option value=''>{i18n._(msg`Select employee`)}</option>
							{employees.map((e) => (
								<option key={e.id} value={e.id}>
									{e.label}
								</option>
							))}
						</select>
					</div>

					{/* Document Type */}
					<div className='flex flex-col gap-1'>
						<label className='text-sm font-medium'>{i18n._(msg`Document type`)}</label>
						<select
							className='w-full border rounded-md px-3 py-2 bg-background'
							value={docType}
							onChange={(e) => setDocType(e.target.value)}
						>
							<option value=''>{i18n._(msg`Select type`)}</option>
							{documentTypes.map((t) => (
								<option key={t.type} value={t.type}>
									{t.display_name}
								</option>
							))}
						</select>
					</div>

					{/* Title and Expiry Date */}
					<div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
						<div className='flex flex-col gap-1'>
							<label className='text-sm font-medium'>{i18n._(msg`Title`)}</label>
							<input
								className='w-full border rounded-md px-3 py-2 bg-background'
								value={title}
								onChange={(e) => setTitle(e.target.value)}
								placeholder={i18n._(msg`Optional`)}
							/>
						</div>
						<div className='flex flex-col gap-1'>
							<label className='text-sm font-medium'>{i18n._(msg`Expiry Date`)}</label>
							<input
								type='date'
								className='w-full border rounded-md px-3 py-2 bg-background'
								value={expiryDate}
								onChange={(e) => setExpiryDate(e.target.value)}
							/>
						</div>
					</div>

					{/* Description */}
					<div className='flex flex-col gap-1'>
						<label className='text-sm font-medium'>{i18n._(msg`Description`)}</label>
						<textarea
							className='w-full border rounded-md px-3 py-2 bg-background'
							rows={3}
							value={description}
							onChange={(e) => setDescription(e.target.value)}
							placeholder={i18n._(msg`Optional`)}
						/>
					</div>

					{/* File Upload */}
					<div className='flex flex-col gap-1'>
						<label className='text-sm font-medium'>{i18n._(msg`File`)}</label>
						<div
							className='w-full rounded-md border border-dashed border-[var(--border)] bg-muted/20 p-4 text-center cursor-pointer hover:bg-muted/30 transition-colors'
							onDragOver={(e) => {
								e.preventDefault()
							}}
							onDrop={(e) => {
								e.preventDefault()
								const f = e.dataTransfer?.files?.[0]
								if (f) setFile(f)
							}}
							onClick={() => openFilePicker()}
						>
							<div className='flex flex-col items-center gap-2'>
								<div className='text-sm text-muted-foreground'>
									{file ? (
										<span className='text-foreground'>{file.name}</span>
									) : (
										<>
											<span className='font-medium text-foreground'>
												{i18n._(msg`Click to upload`)}
											</span>
											<span> {i18n._(msg`or drag and drop`)}</span>
											<br />
											<span className='text-xs'>PDF, DOCX, PNG, JPG</span>
										</>
									)}
								</div>
								<Button
									type='button'
									variant='secondary'
									className='h-8'
									onClick={(e) => {
										e.stopPropagation()
										openFilePicker()
									}}
								>
									{i18n._(msg`Choose file`)}
								</Button>
							</div>
							<input
								id='doc-file-input'
								type='file'
								className='hidden'
								accept='.pdf,.doc,.docx,.png,.jpg,.jpeg'
								ref={fileInputRef}
								onChange={(e) => setFile(e.target.files?.[0] || null)}
							/>
						</div>
					</div>

					{/* Confidential Checkbox */}
					<div className='flex items-center gap-2'>
						<input
							id='doc-confidential'
							type='checkbox'
							checked={confidential}
							onChange={(e) => setConfidential(e.target.checked)}
							className='h-4 w-4'
						/>
						<label htmlFor='doc-confidential' className='text-sm'>
							{i18n._(msg`Confidential`)}
						</label>
					</div>

					{/* Actions */}
					<div className='flex justify-end gap-2 pt-2'>
						<Button variant='secondary' onClick={handleClose} disabled={uploading}>
							{i18n._(msg`Cancel`)}
						</Button>
						<Button onClick={handleUpload} disabled={uploading}>
							{uploading ? i18n._(msg`Uploading...`) : i18n._(msg`Upload`)}
						</Button>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	)
}

