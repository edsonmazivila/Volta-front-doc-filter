'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
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
	document,
	documentId
}: DocumentViewDialogProps) {
	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className='max-w-4xl'>
				<DialogHeader>
					<DialogTitle>Document</DialogTitle>
					<DialogDescription>
						Preview and download the document.
					</DialogDescription>
				</DialogHeader>
				{document ? (
					<div className='grid gap-4'>
						<div className='grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm'>
							<div>
								<span className='text-muted-foreground'>Title:</span>{' '}
								{document.title || '-'}
							</div>
							<div>
								<span className='text-muted-foreground'>Type:</span>{' '}
								{document.document_type}
							</div>
							<div>
								<span className='text-muted-foreground'>Status:</span>{' '}
								{document.document_status}
							</div>
							<div>
								<span className='text-muted-foreground'>Uploaded:</span>{' '}
								{document.created_at?.slice(0, 10)}
							</div>
						</div>
						<div className='border rounded'>
							<iframe
								className='w-full h-[70vh]'
								src={`/api/documents/${documentId}/preview`}
								title='Document preview'
							/>
						</div>
						<div className='flex justify-end gap-2'>
							<a
								href={`/api/documents/${documentId}/preview`}
								target='_blank'
								rel='noopener noreferrer'
								className='px-3 py-2 border rounded hover:bg-muted transition-colors'
							>
								Preview
							</a>
							<a
								href={`/api/documents/${documentId}/download`}
								target='_blank'
								rel='noopener noreferrer'
								className='px-3 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors'
							>
								Download
							</a>
						</div>
					</div>
				) : (
					<div className='text-sm text-muted-foreground'>Loading…</div>
				)}
			</DialogContent>
		</Dialog>
	)
}
