'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui'
import { Download } from 'lucide-react'
import type { Document } from '@/lib/services/documents'

interface DocumentViewDialogProps {
	open: boolean
	onOpenChange: (open: boolean) => void
	document: Document | null
	documentId: string | null
}

export function DocumentViewDialog({
	open,
	onOpenChange,
	document: doc,
	documentId
}: DocumentViewDialogProps) {

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className='max-w-4xl max-h-[90vh] flex flex-col'>
				<DialogHeader>
					<DialogTitle>Document Details</DialogTitle>
					<DialogDescription>
						View and download the document.
					</DialogDescription>
				</DialogHeader>
				{doc ? (
					<div className='flex flex-col gap-4 flex-1 min-h-0'>
						{/* Document Info */}
						<div className='grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm'>
							<div>
								<span className='text-muted-foreground'>Title:</span>{' '}
								<span className='font-medium'>{doc.title || '-'}</span>
							</div>
							<div>
								<span className='text-muted-foreground'>Type:</span>{' '}
								<span className='font-medium uppercase'>{doc.document_type}</span>
							</div>
							<div>
								<span className='text-muted-foreground'>Status:</span>{' '}
								<span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
									doc.document_status === 'approved' ? 'bg-green-500/20 text-green-400' :
									doc.document_status === 'rejected' ? 'bg-red-500/20 text-red-400' :
									doc.document_status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
									'bg-blue-500/20 text-blue-400'
								}`}>
									{doc.document_status}
								</span>
							</div>
							<div>
								<span className='text-muted-foreground'>Uploaded:</span>{' '}
								<span className='font-medium'>{doc.created_at?.slice(0, 10) || '-'}</span>
							</div>
							{doc.access_level && (
								<div>
									<span className='text-muted-foreground'>Access level:</span>{' '}
									<span className='font-medium'>{doc.access_level}</span>
								</div>
							)}
							{(doc.is_confidential !== undefined) && (
								<div>
									<span className='text-muted-foreground'>Confidential:</span>{' '}
									<span className='font-medium'>{doc.is_confidential ? 'Yes' : 'No'}</span>
								</div>
							)}

							{doc.approved_by_full_name && (
								<div>
									<span className='text-muted-foreground'>Approved by:</span>{' '}
									<span className='font-medium'>{doc.approved_by_full_name}</span>
								</div>
							)}
							{doc.approved_at && (
								<div>
									<span className='text-muted-foreground'>Approved at:</span>{' '}
									<span className='font-medium'>{doc.approved_at.slice(0, 19).replace('T', ' ')}</span>
								</div>
							)}

						</div>

						{/* Document Preview */}
						<div className='border rounded-lg overflow-hidden flex-1 min-h-0'>
							<iframe
								className='w-full h-full min-h-[400px]'
								src={`/api/documents/${documentId}/preview`}
								title='Document preview'
							/>
						</div>

						{/* Actions */}
						<div className='flex justify-end gap-2 pt-2'>
							<Button
								variant='outline'
								onClick={() => onOpenChange(false)}
							>
								Close
							</Button>
							<Button
								onClick={() => {
									const link = document.createElement('a')
									link.href = `/api/documents/${documentId}/download`
									link.download = doc.original_filename || 'document'
									document.body.appendChild(link)
									link.click()
									document.body.removeChild(link)
								}}
							>
								<Download className='h-4 w-4 mr-2' />
								Download
							</Button>
						</div>
					</div>
				) : (
					<div className='text-sm text-muted-foreground text-center py-8'>Loading…</div>
				)}
			</DialogContent>
		</Dialog>
	)
}
