'use client'

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'

export type ToastType = 'success' | 'error' | 'warning' | 'info'

export interface Toast {
	id: string
	type: ToastType
	title?: string
	message: string
	duration?: number
	action?: {
		label: string
		onClick: () => void
	}
}

interface ToastContextType {
	toasts: Toast[]
	showToast: (toast: Omit<Toast, 'id'>) => void
	hideToast: (id: string) => void
	clearToasts: () => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export function ToastProvider({ children }: { children: React.ReactNode }) {
	const [toasts, setToasts] = useState<Toast[]>([])

	const hideToast = useCallback((id: string) => {
		setToasts(prev => prev.filter(toast => toast.id !== id))
	}, [])

	const showToast = useCallback((toast: Omit<Toast, 'id'>) => {
		const id = Math.random().toString(36).substr(2, 9)
		const newToast: Toast = {
			id,
			duration: 5000, // 5 seconds default
			...toast
		}

		setToasts(prev => [...prev, newToast])

		// Auto-hide after duration
		if (newToast.duration && newToast.duration > 0) {
			setTimeout(() => {
				hideToast(id)
			}, newToast.duration)
		}
	}, [hideToast])

	const clearToasts = useCallback(() => {
		setToasts([])
	}, [])

	return (
		<ToastContext.Provider value={{ toasts, showToast, hideToast, clearToasts }}>
			{children}
			<ToastContainer toasts={toasts} onHide={hideToast} />
		</ToastContext.Provider>
	)
}

export function useToast() {
	const context = useContext(ToastContext)
	if (context === undefined) {
		throw new Error('useToast must be used within a ToastProvider')
	}
	return context
}

// Toast container component
function ToastContainer({ toasts, onHide }: { toasts: Toast[], onHide: (id: string) => void }) {
	return (
		<div className="fixed top-4 right-4 z-50 space-y-2">
			{toasts.map(toast => (
				<ToastItem key={toast.id} toast={toast} onHide={onHide} />
			))}
		</div>
	)
}

// Individual toast item
function ToastItem({ toast, onHide }: { toast: Toast, onHide: (id: string) => void }) {
	const [isVisible, setIsVisible] = useState(false)

	useEffect(() => {
		// Trigger animation
		setTimeout(() => setIsVisible(true), 100)
	}, [])

	const handleHide = () => {
		setIsVisible(false)
		setTimeout(() => onHide(toast.id), 300)
	}

	const getIcon = () => {
		switch (toast.type) {
			case 'success':
				return <CheckCircle className="h-5 w-5 text-green-400" />
			case 'error':
				return <AlertCircle className="h-5 w-5 text-red-400" />
			case 'warning':
				return <AlertTriangle className="h-5 w-5 text-yellow-400" />
			case 'info':
			default:
				return <Info className="h-5 w-5 text-blue-400" />
		}
	}

	const getBackgroundColor = () => {
		switch (toast.type) {
			case 'success':
				return 'bg-green-600/90 border-green-500'
			case 'error':
				return 'bg-red-600/90 border-red-500'
			case 'warning':
				return 'bg-yellow-600/90 border-yellow-500'
			case 'info':
			default:
				return 'bg-blue-600/90 border-blue-500'
		}
	}

	return (
		<div
			className={cn(
				'flex items-start gap-3 p-4 rounded-lg border shadow-lg backdrop-blur-sm',
				'text-white max-w-sm transform transition-all duration-300 ease-in-out',
				getBackgroundColor(),
				isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
			)}
		>
			{getIcon()}
			
			<div className="flex-1 min-w-0">
				{toast.title && (
					<h4 className="font-semibold text-sm mb-1">{toast.title}</h4>
				)}
				<p className="text-sm opacity-90">{toast.message}</p>
				
				{toast.action && (
					<button
						onClick={toast.action.onClick}
						className="mt-2 text-xs underline hover:no-underline"
					>
						{toast.action.label}
					</button>
				)}
			</div>

			<button
				onClick={handleHide}
				className="flex-shrink-0 p-1 hover:bg-white/10 rounded transition-colors"
				aria-label="Close notification"
			>
				<X className="h-4 w-4" />
			</button>
		</div>
	)
}

// Convenience hook for toast functions
export function useToastHelpers() {
	const { showToast } = useToast()
	
	return {
		success: (message: string, title?: string) => {
			showToast({ type: 'success', message, title })
		},
		error: (message: string, title?: string) => {
			showToast({ type: 'error', message, title })
		},
		warning: (message: string, title?: string) => {
			showToast({ type: 'warning', message, title })
		},
		info: (message: string, title?: string) => {
			showToast({ type: 'info', message, title })
		}
	}
}
