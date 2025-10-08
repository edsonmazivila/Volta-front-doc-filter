'use client'

import { useState } from 'react'
import { Button } from '@/components/ui'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
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
import { Download, Eye, Edit, Trash2, Upload, FileText } from 'lucide-react'
import { toast } from 'sonner'
import Image from 'next/image'

interface CompanyDocumentsSectionProps {
	documents: CompanyDocument[]
	total: number
}

export function CompanyDocumentsSection({ documents, total }: CompanyDocumentsSectionProps) {
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
				toast.success('Document uploaded successfully')
				setUploadOpen(false)
				window.location.reload()
			} else if (result.errors) {
				const errorMsg = result.errors._form?.[0] || 'Failed to upload document'
				toast.error(errorMsg)
			}
		} catch {
			toast.error('Failed to upload document')
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
				toast.success('Document updated successfully')
				setEditOpen(false)
				setSelectedDoc(null)
				window.location.reload()
			} else if (result.errors) {
				const errorMsg = result.errors._form?.[0] || 'Failed to update document'
				toast.error(errorMsg)
			}
		} catch {
			toast.error('Failed to update document')
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
			toast.success('Document deleted successfully')
			setDeleteOpen(false)
			setDeleteTarget(null)
			window.location.reload()
		} catch {
			toast.error('Failed to delete document')
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
			toast.success('Download started')
		} catch (error) {
			console.error('Download error:', error)
			toast.error('Failed to download document')
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

	return (
		<div className='space-y-4'>
			<div className='flex justify-between items-center'>
				<p className='text-sm text-muted-foreground'>
					{total} document{total !== 1 ? 's' : ''} total
				</p>
				<Button onClick={() => setUploadOpen(true)} size='sm'>
					<Upload className='h-4 w-4 mr-2' />
					Upload Document
				</Button>
			</div>

			{documents.length === 0 ? (
				<div className='text-center py-12 text-muted-foreground'>
					<FileText className='h-12 w-12 mx-auto mb-4 opacity-50' />
					<p>No company documents uploaded yet</p>
				</div>
			) : (
				<div className='border rounded-lg overflow-hidden'>
					<table className='w-full'>
						<thead className='bg-muted/50 border-b'>
							<tr>
								<th className='text-left px-4 py-3 text-sm font-medium'>Name</th>
								<th className='text-left px-4 py-3 text-sm font-medium'>Type</th>
								<th className='text-left px-4 py-3 text-sm font-medium'>Size</th>
								<th className='text-left px-4 py-3 text-sm font-medium'>Expiry Date</th>
								<th className='text-left px-4 py-3 text-sm font-medium'>Uploaded</th>
								<th className='text-right px-4 py-3 text-sm font-medium'>Actions</th>
							</tr>
						</thead>
						<tbody>
							{documents.map(doc => (
								<tr key={doc.id} className='border-b hover:bg-muted/30 transition-colors'>
									<td className='px-4 py-3'>
										<div>
											<div className='font-medium text-sm'>{doc.name}</div>
											{doc.description && (
												<div className='text-xs text-muted-foreground'>{doc.description}</div>
											)}
											<div className='text-xs text-muted-foreground mt-0.5'>{doc.original_filename}</div>
										</div>
									</td>
									<td className='px-4 py-3 text-sm'>
										<span className='inline-flex items-center px-2 py-1 rounded-md bg-blue-500/10 text-blue-500 text-xs'>
											{formatDocumentType(doc.document_type)}
										</span>
									</td>
									<td className='px-4 py-3 text-sm text-muted-foreground'>
										{formatFileSize(doc.file_size)}
									</td>
									<td className='px-4 py-3 text-sm text-muted-foreground'>
										{doc.expiry_date ? formatDate(doc.expiry_date) : '—'}
									</td>
									<td className='px-4 py-3 text-sm text-muted-foreground'>
										{formatDate(doc.created_at)}
									</td>
									<td className='px-4 py-3'>
										<div className='flex items-center justify-end gap-2'>
											<Button
												variant='ghost'
												size='sm'
												onClick={() => handlePreview(doc)}
												title='Preview'
											>
												<Eye className='h-4 w-4' />
											</Button>
											<Button
												variant='ghost'
												size='sm'
												onClick={() => handleDownload(doc)}
												title='Download'
											>
												<Download className='h-4 w-4' />
											</Button>
											<Button
												variant='ghost'
												size='sm'
												onClick={() => {
													setSelectedDoc(doc)
													setEditOpen(true)
												}}
												title='Edit'
											>
												<Edit className='h-4 w-4' />
											</Button>
									<Button
										variant='ghost'
										size='sm'
										onClick={() => openDeleteDialog(doc)}
										title='Delete'
										className='text-destructive hover:text-destructive'
									>
												<Trash2 className='h-4 w-4' />
											</Button>
										</div>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			)}

			{/* Upload Dialog */}
			<Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
				<DialogContent className='max-w-2xl'>
					<DialogHeader>
						<DialogTitle>Upload Company Document</DialogTitle>
					</DialogHeader>
					<form onSubmit={handleUpload} className='space-y-5'>
						<FormField label='Document Name' required>
							<Input 
								name='name' 
								placeholder='e.g., Business License 2025' 
								required 
								className='text-sm'
							/>
						</FormField>

						<FormField label='Document Type' required>
							<select
								name='document_type'
								required
								className='w-full px-3 py-2.5 text-sm border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors'
							>
								<option value=''>Select document type...</option>
								<option value='business_license'>Business License</option>
								<option value='tax_certificate'>Tax Certificate</option>
								<option value='insurance_policy'>Insurance Policy</option>
								<option value='contract'>Contract</option>
								<option value='certification'>Certification</option>
								<option value='other'>Other</option>
							</select>
						</FormField>

						<div className='space-y-2'>
							<FormField label='Description'>
								<textarea
									name='description'
									rows={3}
									placeholder='Add any relevant notes or description...'
									className='w-full px-3 py-2.5 text-sm border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors resize-none'
								/>
							</FormField>
							<p className='text-xs text-muted-foreground'>Optional description of the document</p>
						</div>

						<div className='space-y-2'>
							<FormField label='Expiry Date'>
								<Input 
									name='expiry_date' 
									type='date' 
									className='text-sm'
								/>
							</FormField>
							<p className='text-xs text-muted-foreground'>When does this document expire? (optional)</p>
						</div>

						<FormField label='Upload File' required>
							<div className='space-y-2'>
								<Input 
									name='file' 
									type='file' 
									required 
									accept='.pdf,.doc,.docx,.jpg,.jpeg,.png,.gif'
									className='text-sm file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-primary file:text-primary-foreground hover:file:bg-primary/90 file:cursor-pointer cursor-pointer'
								/>
								<p className='text-xs text-muted-foreground'>
									Supported formats: PDF, DOC, DOCX, JPG, PNG, GIF (Max 10MB)
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
								Cancel
							</Button>
							<Button 
								type='submit' 
								disabled={loading}
								className='min-w-[100px]'
							>
								{loading ? 'Uploading...' : 'Upload Document'}
							</Button>
						</div>
					</form>
				</DialogContent>
			</Dialog>

			{/* Edit Dialog */}
			<Dialog open={editOpen} onOpenChange={setEditOpen}>
				<DialogContent className='max-w-2xl'>
					<DialogHeader>
						<DialogTitle>Edit Document</DialogTitle>
					</DialogHeader>
					{selectedDoc && (
						<form onSubmit={handleEdit} className='space-y-5'>
							<FormField label='Document Name' required>
								<Input 
									name='name' 
									defaultValue={selectedDoc.name} 
									required 
									className='text-sm'
								/>
							</FormField>

							<FormField label='Document Type' required>
								<select
									name='document_type'
									defaultValue={selectedDoc.document_type}
									required
									className='w-full px-3 py-2.5 text-sm border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors'
								>
									<option value='business_license'>Business License</option>
									<option value='tax_certificate'>Tax Certificate</option>
									<option value='insurance_policy'>Insurance Policy</option>
									<option value='contract'>Contract</option>
									<option value='certification'>Certification</option>
									<option value='other'>Other</option>
								</select>
							</FormField>

							<div className='space-y-2'>
								<FormField label='Description'>
									<textarea
										name='description'
										rows={3}
										defaultValue={selectedDoc.description || ''}
										placeholder='Add any relevant notes or description...'
										className='w-full px-3 py-2.5 text-sm border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors resize-none'
									/>
								</FormField>
								<p className='text-xs text-muted-foreground'>Optional description of the document</p>
							</div>

							<div className='space-y-2'>
								<FormField label='Expiry Date'>
									<Input 
										name='expiry_date' 
										type='date' 
										defaultValue={selectedDoc.expiry_date ? selectedDoc.expiry_date.split('T')[0] : ''}
										className='text-sm'
									/>
								</FormField>
								<p className='text-xs text-muted-foreground'>When does this document expire? (optional)</p>
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
									Cancel
								</Button>
								<Button 
									type='submit' 
									disabled={loading}
									className='min-w-[100px]'
								>
									{loading ? 'Updating...' : 'Update Document'}
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
								Download
							</Button>
						</div>
					</DialogHeader>
					{selectedDoc && (
						<div className='flex-1 min-h-0'>
							{selectedDoc.mime_type === 'application/pdf' ? (
								<iframe
									src={`/api/company-documents/${selectedDoc.id}/preview#toolbar=0&navpanes=0&scrollbar=0`}
									className='w-full h-full'
									title='Document Preview'
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
											Preview not available for this file type
										</p>
										<Button onClick={() => handleDownload(selectedDoc)}>
											<Download className='h-4 w-4 mr-2' />
											Download to View
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
					<AlertDialogTitle>Delete document?</AlertDialogTitle>
					<AlertDialogDescription>
						This action cannot be undone. This will permanently delete {deleteTarget?.name} and remove the file from the system.
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
					<AlertDialogAction onClick={confirmDelete} disabled={deleting} className='bg-destructive text-destructive-foreground hover:bg-destructive/90'>
						{deleting ? 'Deleting…' : 'Delete'}
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
		</div>
	)
}

