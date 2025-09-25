'use client'

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface ModalProps {
	id?: string
	title?: string
	children: React.ReactNode
	size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
	closable?: boolean
	onClose?: () => void
	className?: string
}

interface ModalContextType {
	modals: string[]
	showModal: (id: string) => void
	hideModal: (id: string) => void
	hideAllModals: () => void
}

const ModalContext = createContext<ModalContextType | undefined>(undefined)

export function ModalProvider({ children }: { children: React.ReactNode }) {
	const [modals, setModals] = useState<string[]>([])

	const showModal = useCallback((id: string) => {
		setModals(prev => {
			if (!prev.includes(id)) {
				return [...prev, id]
			}
			return prev
		})
		
		// Prevent body scroll
		document.body.style.overflow = 'hidden'
	}, [])

	const hideModal = useCallback((id: string) => {
		setModals(prev => prev.filter(modalId => modalId !== id))
		
		// Restore body scroll if no modals are open
		setTimeout(() => {
			if (modals.length <= 1) {
				document.body.style.overflow = 'auto'
			}
		}, 0)
	}, [modals.length])

	const hideAllModals = useCallback(() => {
		setModals([])
		document.body.style.overflow = 'auto'
	}, [])

	return (
		<ModalContext.Provider value={{ modals, showModal, hideModal, hideAllModals }}>
			{children}
		</ModalContext.Provider>
	)
}

export function useModal() {
	const context = useContext(ModalContext)
	if (context === undefined) {
		throw new Error('useModal must be used within a ModalProvider')
	}
	return context
}

// Main Modal component
export function Modal({
	id = 'default-modal',
	title,
	children,
	size = 'md',
	closable = true,
	onClose,
	className
}: ModalProps) {
	const { modals, hideModal } = useModal()
	const [isVisible, setIsVisible] = useState(false)

	const isOpen = modals.includes(id)

	useEffect(() => {
		if (isOpen) {
			setIsVisible(true)
		} else {
			setIsVisible(false)
		}
	}, [isOpen])

	const handleClose = useCallback(() => {
		if (closable) {
			hideModal(id)
			onClose?.()
		}
	}, [closable, hideModal, id, onClose])

	const handleBackdropClick = (e: React.MouseEvent) => {
		if (e.target === e.currentTarget && closable) {
			handleClose()
		}
	}

	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === 'Escape' && closable) {
			handleClose()
		}
	}

	if (!isOpen) return null

	const sizeClasses = {
		sm: 'max-w-md',
		md: 'max-w-lg',
		lg: 'max-w-2xl',
		xl: 'max-w-4xl',
		full: 'max-w-full mx-4'
	}

	return (
		<div
			className={cn(
				'fixed inset-0 z-50 flex items-center justify-center p-4',
				'bg-black/50 backdrop-blur-sm transition-opacity duration-300',
				isVisible ? 'opacity-100' : 'opacity-0'
			)}
			onClick={handleBackdropClick}
			onKeyDown={handleKeyDown}
			tabIndex={-1}
		>
			<div
				className={cn(
					'relative w-full rounded-xl border bg-white/10 backdrop-blur-md',
					'border-white/20 shadow-2xl transition-all duration-300',
					sizeClasses[size],
					isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0',
					className
				)}
			>
				{/* Header */}
				{(title || closable) && (
					<div className="flex items-center justify-between p-6 border-b border-white/10">
						{title && (
							<h2 className="text-xl font-semibold text-white">{title}</h2>
						)}
						{closable && (
							<button
								onClick={handleClose}
								className="p-2 hover:bg-white/10 rounded-lg transition-colors"
								aria-label="Close modal"
							>
								<X className="h-5 w-5 text-neutral-400" />
							</button>
						)}
					</div>
				)}

				{/* Content */}
				<div className="p-6">
					{children}
				</div>
			</div>
		</div>
	)
}

// Convenience hook for modal management
export function useModalState(id: string) {
	const { showModal, hideModal } = useModal()
	
	return {
		show: () => showModal(id),
		hide: () => hideModal(id)
	}
}

// Modal trigger component
interface ModalTriggerProps {
	modalId: string
	children: React.ReactNode
	className?: string
}

export function ModalTrigger({ modalId, children, className }: ModalTriggerProps) {
	const { showModal } = useModal()

	return (
		<button
			onClick={() => showModal(modalId)}
			className={className}
		>
			{children}
		</button>
	)
}

// Confirmation Modal
interface ConfirmModalProps {
	id?: string
	title?: string
	message: string
	confirmText?: string
	cancelText?: string
	onConfirm: () => void
	onCancel?: () => void
	variant?: 'danger' | 'warning' | 'info'
}

export function ConfirmModal({
	id = 'confirm-modal',
	title = 'Confirm Action',
	message,
	confirmText = 'Confirm',
	cancelText = 'Cancel',
	onConfirm,
	onCancel,
	variant = 'info'
}: ConfirmModalProps) {
	const { hideModal } = useModal()

	const handleConfirm = () => {
		onConfirm()
		hideModal(id)
	}

	const handleCancel = () => {
		onCancel?.()
		hideModal(id)
	}

	const getVariantStyles = () => {
		switch (variant) {
			case 'danger':
				return {
					confirmButton: 'bg-red-600 hover:bg-red-700 text-white',
					icon: 'text-red-400'
				}
			case 'warning':
				return {
					confirmButton: 'bg-yellow-600 hover:bg-yellow-700 text-white',
					icon: 'text-yellow-400'
				}
			case 'info':
			default:
				return {
					confirmButton: 'bg-blue-600 hover:bg-blue-700 text-white',
					icon: 'text-blue-400'
				}
		}
	}

	const styles = getVariantStyles()

	return (
		<Modal id={id} title={title} size="sm">
			<div className="space-y-4">
				<p className="text-neutral-300">{message}</p>
				
				<div className="flex gap-3 justify-end">
					<button
						onClick={handleCancel}
						className="px-4 py-2 rounded-lg border border-white/20 text-white hover:bg-white/10 transition-colors"
					>
						{cancelText}
					</button>
					<button
						onClick={handleConfirm}
						className={cn(
							'px-4 py-2 rounded-lg transition-colors',
							styles.confirmButton
						)}
					>
						{confirmText}
					</button>
				</div>
			</div>
		</Modal>
	)
}
