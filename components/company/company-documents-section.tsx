'use client'

import { useState } from 'react'
import { Button } from '@/components/ui'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
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
import { FormField, Input } from '@/components/auth/form-field'
import {
	uploadCompanyDocumentAction,
	updateCompanyDocumentAction,
	deleteCompanyDocumentAction,

	type CompanyDocument
} from '@/lib/services/company'
import { Download, Eye, Edit, Trash2, Upload, FileText, MoreHorizontal } from 'lucide-react'
import { toast } from 'sonner'
import Image from 'next/image'
import { useLingui } from '@lingui/react'
import { msg } from '@lingui/core/macro'

interface CompanyDocumentsSectionProps {
	documents: CompanyDocument[]
	total: number
}

export function CompanyDocumentsSection({ documents, total }: CompanyDocumentsSectionProps) {
	const { i18n } = useLingui()
	const [uploadOpen, setUploadOpen] = useState(false)
	const [editOpen, setEditOpen] = useState(false)
	const [previewOpen, setPreviewOpen] = useState(false)
	const [selectedDoc, setSelectedDoc] = useState<CompanyDocument | null>(null)
	const [loading, setLoading] = useState(false)
	const [deleteOpen, setDeleteOpen] = useState(false)
	const [deleteTarget, setDeleteTarget] = useState<CompanyDocument | null>(null)
	const [deleting, setDeleting] = useState(false)

	const handleUpload = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault()
		setLoading(true)

		const formData = new FormData(e.currentTarget)
		
		try {
			const result = await uploadCompanyDocumentAction(null, formData)

			if (result.success) {
				toast.success(i18n._(msg`Document uploaded successfully`))
				setUploadOpen(false)
				window.location.reload()
			} else if (result.errors) {
				const errorMsg = result.errors._form?.[0] || i18n._(msg`Failed to upload document`)
				toast.error(errorMsg)
			}
		} catch {
			toast.error(i18n._(msg`Failed to upload document`))
		} finally {
			setLoading(false)
		}
	}

	const handleEdit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault()
		if (!selectedDoc) return
		
		setLoading(true)
		const formData = new FormData(e.currentTarget)
		
		try {
			const result = await updateCompanyDocumentAction(selectedDoc.id, null, formData)

			if (result.success) {
				toast.success(i18n._(msg`Document updated successfully`))
				setEditOpen(false)
				setSelectedDoc(null)
				window.location.reload()
			} else if (result.errors) {
				const errorMsg = result.errors._form?.[0] || JSON.stringify(result.errors)
				toast.error(errorMsg.length > 200 ? errorMsg.slice(0, 200) + '…' : errorMsg)
			}
		} catch {
			toast.error(i18n._(msg`Failed to update document`))
		} finally {
			setLoading(false)
		}
	}

	const openDeleteDialog = (doc: CompanyDocument) => {
		setDeleteTarget(doc)
		setDeleteOpen(true)
	}

	const confirmDelete = async () => {
		if (!deleteTarget) return
		setDeleting(true)
		try {
			await deleteCompanyDocumentAction(deleteTarget.id)
			toast.success(i18n._(msg`Document deleted successfully`))
			setDeleteOpen(false)
			setDeleteTarget(null)
			window.location.reload()
		} catch {
			toast.error(i18n._(msg`Failed to delete document`))
		} finally {
			setDeleting(false)
		}
	}

	const handlePreview = (doc: CompanyDocument) => {
		setSelectedDoc(doc)
		setPreviewOpen(true)
	}

	const handleDownload = async (doc: CompanyDocument) => {
		try {
			const link = document.createElement('a')
			link.href = `/api/company-documents/${doc.id}/download`
			link.download = doc.original_filename || `document-${doc.id}`
			document.body.appendChild(link)
			link.click()
			document.body.removeChild(link)
			toast.success(i18n._(msg`Download started`))
		} catch (error) {
			console.error('Download error:', error)
			toast.error(i18n._(msg`Failed to download document`))
		}
	}

	const formatFileSize = (bytes: number) => {
		if (bytes < 1024) return `${bytes} B`
		if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
		return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
	}

	const formatDate = (dateStr: string) => {
		return new Date(dateStr).toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'short',
			day: 'numeric'
		})
	}

	const formatDocumentType = (type: string) => {
		return type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
	}

	const handleRowClick = (doc: CompanyDocument, event: React.MouseEvent) => {
		// Don't open dialog if clicking on buttons or other interactive elements
		const target = event.target as HTMLElement
		if (
			target.closest('button') ||
			target.closest('input') ||
			target.closest('[role="button"]')
		) {
			return
		}
		handlePreview(doc)
	}

	return (
		<div className='space-y-4'>
			<div className='flex justify-between items-center'>
				<p className='text-sm text-muted-foreground'>
					{total === 1 ? i18n._(msg`1 document total`) : i18n._(msg`${total} documents total`)}
				</p>
				<Button onClick={() => setUploadOpen(true)} size='sm'>
					<Upload className='h-4 w-4 mr-2' />
					{i18n._(msg`Upload Document`)}
				</Button>
			</div>

			{documents.length === 0 ? (
				<div className='text-center py-12 text-muted-foreground'>
					<FileText className='h-12 w-12 mx-auto mb-4 opacity-50' />
					<p>{i18n._(msg`No company documents uploaded yet`)}</p>
				</div>
			) : (
				<div className="glass rounded-xl overflow-hidden">
					<div className="overflow-x-auto">
						<table className="w-full text-sm min-w-[800px]">
							<thead className="border-b border-[var(--border)] text-neutral-400 sticky top-0 bg-background z-10 shadow-sm">
								<tr>
									<th className="text-left p-3 min-w-[200px]">{i18n._(msg`Name`)}</th>
									<th className="text-left p-3 min-w-[120px]">{i18n._(msg`Type`)}</th>
									<th className="text-left p-3 min-w-[80px]">{i18n._(msg`Size`)}</th>
									<th className="text-left p-3 min-w-[120px]">{i18n._(msg`Expiry Date`)}</th>
									<th className="text-left p-3 min-w-[120px]">{i18n._(msg`Uploaded`)}</th>
									<th className="text-left p-3 min-w-[120px]">{i18n._(msg`Actions`)}</th>
								</tr>
							</thead>
							<tbody>
								{documents.map(doc => (
									<tr 
										key={doc.id} 
										className="border-b border-[var(--border)] hover:bg-muted/50 cursor-pointer transition-colors"
										onClick={(event) => handleRowClick(doc, event)}
									>
										<td className="p-3">
											<div>
												<div className='font-medium text-sm'>{doc.name}</div>
												{doc.description && (
													<div className='text-xs text-muted-foreground'>{doc.description}</div>
												)}
												<div className='text-xs text-muted-foreground mt-0.5'>{doc.original_filename}</div>
											</div>
										</td>
										<td className="p-3 text-sm">
											<span className='inline-flex items-center px-2 py-1 rounded-md bg-blue-500/10 text-blue-500 text-xs'>
												{formatDocumentType(doc.document_type)}
											</span>
										</td>
										<td className="p-3 text-sm text-muted-foreground">
											{formatFileSize(doc.file_size)}
										</td>
										<td className="p-3 text-sm text-muted-foreground">
											{doc.expiry_date ? formatDate(doc.expiry_date) : '—'}
										</td>
										<td className="p-3 text-sm text-muted-foreground">
											{formatDate(doc.created_at)}
										</td>
										<td className="p-3">
											<DropdownMenu>
												<DropdownMenuTrigger asChild>
													<Button
														size="sm"
														variant="ghost"
														onClick={(event) => event.stopPropagation()}
														className="h-8 w-8 p-0"
													>
														<MoreHorizontal className="h-4 w-4" />
													</Button>
												</DropdownMenuTrigger>
												<DropdownMenuContent align="end">
													<DropdownMenuItem
														onClick={(event) => {
															event.stopPropagation()
															handlePreview(doc)
														}}
													>
														<Eye className="mr-2 h-4 w-4" />
														{i18n._(msg`View Details`)}
													</DropdownMenuItem>
													<DropdownMenuItem
														onClick={(event) => {
															event.stopPropagation()
															handleDownload(doc)
														}}
													>
														<Download className="mr-2 h-4 w-4" />
														{i18n._(msg`Download`)}
													</DropdownMenuItem>
													<DropdownMenuItem
														onClick={(event) => {
															event.stopPropagation()
															setSelectedDoc(doc)
															setEditOpen(true)
														}}
													>
														<Edit className="mr-2 h-4 w-4" />
														{i18n._(msg`Edit`)}
													</DropdownMenuItem>
													<DropdownMenuItem
														onClick={(event) => {
															event.stopPropagation()
															openDeleteDialog(doc)
														}}
														className="text-red-400 focus:text-red-400"
													>
														<Trash2 className="mr-2 h-4 w-4" />
														{i18n._(msg`Delete`)}
													</DropdownMenuItem>
												</DropdownMenuContent>
											</DropdownMenu>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</div>
			)}

			{/* Upload Dialog */}
			<Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
				<DialogContent className='max-w-2xl'>
					<DialogHeader>
						<DialogTitle>{i18n._(msg`Upload Company Document`)}</DialogTitle>
					</DialogHeader>
					<form onSubmit={handleUpload} className='space-y-5'>
						<FormField label={i18n._(msg`Document Name`)} required>
							<Input
								name='name'
								placeholder={i18n._(msg`e.g., Business License 2025`)}
								required
								className='text-sm'
							/>
						</FormField>

						<FormField label={i18n._(msg`Document Type`)} required>
							<select
								name='document_type'
								required
								className='w-full px-3 py-2.5 text-sm border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors'
							>
								<option value=''>{i18n._(msg`Select document type...`)}</option>
								<option value='business_license'>{i18n._(msg`Business License`)}</option>
								<option value='tax_certificate'>{i18n._(msg`Tax Certificate`)}</option>
								<option value='insurance_policy'>{i18n._(msg`Insurance Policy`)}</option>
								<option value='contract'>{i18n._(msg`Contract`)}</option>
								<option value='certification'>{i18n._(msg`Certification`)}</option>
								<option value='other'>{i18n._(msg`Other`)}</option>
							</select>
						</FormField>

						<div className='space-y-2'>
							<FormField label={i18n._(msg`Description`)}>
								<textarea
									name='description'
									rows={3}
									placeholder={i18n._(msg`Add any relevant notes or description...`)}
									className='w-full px-3 py-2.5 text-sm border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors resize-none'
								/>
							</FormField>
							<p className='text-xs text-muted-foreground'>{i18n._(msg`Optional description of the document`)}</p>
						</div>

						<div className='space-y-2'>
							<FormField label={i18n._(msg`Expiry Date`)}>
								<Input
									name='expiry_date'
									type='date'
									className='text-sm'
								/>
							</FormField>
							<p className='text-xs text-muted-foreground'>{i18n._(msg`When does this document expire? (optional)`)}</p>
						</div>

						<FormField label={i18n._(msg`Upload File`)} required>
							<div className='space-y-2'>
								<Input
									name='file'
									type='file'
									required
									accept='.pdf,.doc,.docx,.jpg,.jpeg,.png,.gif'
									className='text-sm file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-primary file:text-primary-foreground hover:file:bg-primary/90 file:cursor-pointer cursor-pointer'
								/>
								<p className='text-xs text-muted-foreground'>
									{i18n._(msg`Supported formats: PDF, DOC, DOCX, JPG, PNG, GIF (Max 10MB)`)}
								</p>
							</div>
						</FormField>

						<div className='flex justify-end gap-3 pt-4 border-t'>
							<Button
								type='button'
								variant='outline'
								onClick={() => setUploadOpen(false)}
								disabled={loading}
								className='min-w-[100px]'
							>
								{i18n._(msg`Cancel`)}
							</Button>
							<Button
								type='submit'
								disabled={loading}
								className='min-w-[100px]'
							>
								{loading ? i18n._(msg`Uploading...`) : i18n._(msg`Upload Document`)}
							</Button>
						</div>
					</form>
				</DialogContent>
			</Dialog>

			{/* Edit Dialog */}
			<Dialog open={editOpen} onOpenChange={setEditOpen}>
				<DialogContent className='max-w-2xl'>
					<DialogHeader>
						<DialogTitle>{i18n._(msg`Edit Document`)}</DialogTitle>
					</DialogHeader>
					{selectedDoc && (
						<form onSubmit={handleEdit} className='space-y-5'>
							<FormField label={i18n._(msg`Document Name`)} required>
								<Input
									name='name'
									defaultValue={selectedDoc.name}
									required
									className='text-sm'
								/>
							</FormField>

							<FormField label={i18n._(msg`Document Type`)} required>
								<select
									name='document_type'
									defaultValue={selectedDoc.document_type}
									required
									className='w-full px-3 py-2.5 text-sm border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors'
								>
									<option value='business_license'>{i18n._(msg`Business License`)}</option>
									<option value='tax_certificate'>{i18n._(msg`Tax Certificate`)}</option>
									<option value='insurance_policy'>{i18n._(msg`Insurance Policy`)}</option>
									<option value='contract'>{i18n._(msg`Contract`)}</option>
									<option value='certification'>{i18n._(msg`Certification`)}</option>
									<option value='other'>{i18n._(msg`Other`)}</option>
								</select>
							</FormField>

							<div className='space-y-2'>
								<FormField label={i18n._(msg`Description`)}>
									<textarea
										name='description'
										rows={3}
										defaultValue={selectedDoc.description || ''}
										placeholder={i18n._(msg`Add any relevant notes or description...`)}
										className='w-full px-3 py-2.5 text-sm border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors resize-none'
									/>
								</FormField>
								<p className='text-xs text-muted-foreground'>{i18n._(msg`Optional description of the document`)}</p>
							</div>

							<div className='space-y-2'>
								<FormField label={i18n._(msg`Expiry Date`)}>
									<Input
										name='expiry_date'
										type='date'
										defaultValue={selectedDoc.expiry_date ? selectedDoc.expiry_date.split('T')[0] : ''}
										className='text-sm'
									/>
								</FormField>
								<p className='text-xs text-muted-foreground'>{i18n._(msg`When does this document expire? (optional)`)}</p>
							</div>

							<div className='flex justify-end gap-3 pt-4 border-t'>
								<Button
									type='button'
									variant='outline'
									onClick={() => {
										setEditOpen(false)
										setSelectedDoc(null)
									}}
									disabled={loading}
									className='min-w-[100px]'
								>
									{i18n._(msg`Cancel`)}
								</Button>
								<Button
									type='submit'
									disabled={loading}
									className='min-w-[100px]'
								>
									{loading ? i18n._(msg`Updating...`) : i18n._(msg`Update Document`)}
								</Button>
							</div>
						</form>
					)}
				</DialogContent>
			</Dialog>

			{/* Preview Dialog */}
			<Dialog open={previewOpen} onOpenChange={(open) => {
				setPreviewOpen(open)
				if (!open) setSelectedDoc(null)
			}}>
				<DialogContent className='max-w-5xl h-[83vh] flex flex-col p-0'>
					<DialogHeader className='px-6 pt-10 shrink-0'>
						<div className='flex items-center justify-between gap-4'>
							<div className='min-w-0'>
								<DialogTitle className='text-base truncate'>{selectedDoc?.name}</DialogTitle>
								<p className='text-xs text-muted-foreground truncate'>{selectedDoc?.original_filename}</p>
							</div>
							<Button size='sm' onClick={() => selectedDoc && handleDownload(selectedDoc)} className='shrink-0'>
								<Download className='h-4 w-4 mr-2' />
								{i18n._(msg`Download`)}
							</Button>
						</div>
					</DialogHeader>
					{selectedDoc && (
						<div className='flex-1 min-h-0'>
							{selectedDoc.mime_type === 'application/pdf' ? (
								<iframe
									src={`/api/company-documents/${selectedDoc.id}/preview#toolbar=0&navpanes=0&scrollbar=0`}
									className='w-full h-full'
									title={i18n._(msg`Document Preview`)}
								/>
							) : selectedDoc.mime_type?.startsWith('image/') ? (
								<div className='w-full h-full flex items-center justify-center bg-muted/50'>
									<Image
										src={`/api/company-documents/${selectedDoc.id}/preview`}
										alt={selectedDoc.name}
										className='max-w-full max-h-full object-contain'
										width={400}
										height={400}
									/>
								</div>
							) : (
								<div className='w-full h-full flex items-center justify-center bg-muted/50'>
									<div className='text-center'>
										<FileText className='h-16 w-16 mx-auto mb-4 text-muted-foreground' />
										<p className='text-sm text-muted-foreground mb-4'>
											{i18n._(msg`Preview not available for this file type`)}
										</p>
										<Button onClick={() => handleDownload(selectedDoc)}>
											<Download className='h-4 w-4 mr-2' />
											{i18n._(msg`Download to View`)}
										</Button>
									</div>
								</div>
							)}
						</div>
					)}
				</DialogContent>
			</Dialog>

		{/* Delete Confirmation Dialog */}
		<AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>{i18n._(msg`Delete document?`)}</AlertDialogTitle>
					<AlertDialogDescription>
						{i18n._(msg`This action cannot be undone. This will permanently delete ${deleteTarget?.name} and remove the file from the system.`)}
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel disabled={deleting}>{i18n._(msg`Cancel`)}</AlertDialogCancel>
					<AlertDialogAction onClick={confirmDelete} disabled={deleting} className='bg-destructive text-destructive-foreground hover:bg-destructive/90'>
						{deleting ? i18n._(msg`Deleting…`) : i18n._(msg`Delete`)}
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
		</div>
	)
}

