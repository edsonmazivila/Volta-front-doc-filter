'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Plus, Edit, Trash2, UserCheck, UserX } from 'lucide-react'
import { Button } from '@/components/ui'
import { Modal, ConfirmModal, useModal } from '@/components/ui/modal'
import { useToast } from '@/components/ui/toast'
import { UsersService } from '@/lib/services/users'
import { ROLE_DISPLAY_NAMES, Role } from '@/lib/rbac/types'
import { useSession } from '@/components/auth/session-context'
import { hasAnyRole } from '@/lib/auth/utils'
import { UserForm } from './user-form'

export interface User {
	id: string
	first_name: string
	last_name: string
	email: string
	role: Role
	is_active: boolean
	created_at: string
	updated_at: string
}

export interface UserStats {
	totalUsers: number
	activeUsers: number
	adminUsers: number
	managerUsers: number
	employeeUsers: number
}

export function UserManagement() {
    const { user } = useSession()
	const [users, setUsers] = useState<User[]>([])
	const [stats, setStats] = useState<UserStats>({
		totalUsers: 0,
		activeUsers: 0,
		adminUsers: 0,
		managerUsers: 0,
		employeeUsers: 0
	})
	const [loading, setLoading] = useState(true)
	const [selectedUser, setSelectedUser] = useState<User | null>(null)
	const [userToDelete, setUserToDelete] = useState<User | null>(null)

	const { showToast } = useToast()
	const { showModal, hideModal } = useModal()

// Load users and stats on mount
const loadUsers = useCallback(async () => {
    try {
        setLoading(true)
        const data = await UsersService.list<User>()
        setUsers(data)
    } catch (error) {
        console.error('Error loading users:', error)
        showToast({
            type: 'error',
            message: 'Failed to load users',
            title: 'Error'
        })
    } finally {
        setLoading(false)
    }
}, [showToast])

const loadStats = useCallback(async () => {
    try {
        const data = await UsersService.stats<UserStats>()
        setStats(data)
    } catch (error) {
        console.error('Error loading user stats:', error)
    }
}, [])

useEffect(() => {
    loadUsers()
    loadStats()
}, [loadUsers, loadStats])

	const handleCreateUser = async (userData: unknown) => {
        try {
            await UsersService.create(userData)
			showToast({
				type: 'success',
				message: 'User created successfully!',
				title: 'Success'
			})
			// Modal will be handled by the modal system
			loadUsers()
			loadStats()
		} catch (error) {
			console.error('Error creating user:', error)
			showToast({
				type: 'error',
				message: 'Failed to create user',
				title: 'Error'
			})
		}
	}

	const handleEditUser = async (userData: unknown) => {
		if (!selectedUser) return

        try {
            await UsersService.update(selectedUser.id, userData)
			showToast({
				type: 'success',
				message: 'User updated successfully!',
				title: 'Success'
			})
			// Modal will be handled by the modal system
			setSelectedUser(null)
			loadUsers()
			loadStats()
		} catch (error) {
			console.error('Error updating user:', error)
			showToast({
				type: 'error',
				message: 'Failed to update user',
				title: 'Error'
			})
		}
	}

	const handleDeleteUser = async () => {
		if (!userToDelete) return

        try {
            await UsersService.remove(userToDelete.id)
			showToast({
				type: 'success',
				message: 'User deleted successfully!',
				title: 'Success'
			})
			// Modal will be handled by the modal system
			setUserToDelete(null)
			loadUsers()
			loadStats()
		} catch (error) {
			console.error('Error deleting user:', error)
			showToast({
				type: 'error',
				message: 'Failed to delete user',
				title: 'Error'
			})
		}
	}

	const handleToggleStatus = async (user: User) => {
        try {
            await UsersService.toggleStatus(user.id, !user.is_active)
			showToast({
				type: 'success',
				message: `User ${!user.is_active ? 'activated' : 'deactivated'} successfully!`,
				title: 'Success'
			})
			loadUsers()
			loadStats()
		} catch (error) {
			console.error('Error updating user status:', error)
			showToast({
				type: 'error',
				message: 'Failed to update user status',
				title: 'Error'
			})
		}
	}

	const openEditModal = (user: User) => {
		setSelectedUser(user)
		showModal('edit-user-modal')
	}

	const openDeleteModal = (user: User) => {
		setUserToDelete(user)
		showModal('delete-user-modal')
	}

    // Simple role-based UI gating: allow managers/admins to manage users
    const isManagerOrAdmin = hasAnyRole(user, ['admin','system_admin','hr','operational_manager','payroll_manager'])
    const canCreateUser = isManagerOrAdmin
    const canUpdateUser = isManagerOrAdmin
    const canDeleteUser = isManagerOrAdmin

	if (loading) {
		return (
			<div className="flex items-center justify-center p-8">
				<div className="text-neutral-400">Loading users...</div>
			</div>
		)
	}

	return (
		<div className="space-y-6">
			{/* Stats Cards */}
			<div className="grid grid-cols-1 md:grid-cols-5 gap-4">
				<StatCard title="Total Users" value={stats.totalUsers} />
				<StatCard title="Active Users" value={stats.activeUsers} />
				<StatCard title="Admins" value={stats.adminUsers} />
				<StatCard title="Managers" value={stats.managerUsers} />
				<StatCard title="Employees" value={stats.employeeUsers} />
			</div>

			{/* Header */}
			<div className="flex items-center justify-between">
				<h2 className="text-2xl font-bold text-white">User Management</h2>
				{canCreateUser && (
					<Button
						variant="default"
						onClick={() => showModal('create-user-modal')}
						className="flex items-center gap-2"
					>
						<Plus className="h-4 w-4" />
						Add User
					</Button>
				)}
			</div>

			{/* Users Table */}
			<div className="glass rounded-xl overflow-hidden">
				<div className="overflow-x-auto">
					<table className="w-full">
						<thead className="border-b border-white/10">
							<tr>
								<th className="text-left p-4 text-neutral-300 font-medium">Name</th>
								<th className="text-left p-4 text-neutral-300 font-medium">Email</th>
								<th className="text-left p-4 text-neutral-300 font-medium">Role</th>
								<th className="text-left p-4 text-neutral-300 font-medium">Status</th>
								<th className="text-left p-4 text-neutral-300 font-medium">Actions</th>
							</tr>
						</thead>
						<tbody>
							{users.map((user) => (
								<tr key={user.id} className="border-b border-white/5 hover:bg-white/5">
									<td className="p-4">
										<div className="font-medium text-white">
											{user.first_name} {user.last_name}
										</div>
									</td>
									<td className="p-4 text-neutral-300">{user.email}</td>
									<td className="p-4">
										<span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-500/20 text-blue-400">
											{ROLE_DISPLAY_NAMES[user.role as keyof typeof ROLE_DISPLAY_NAMES] || user.role}
										</span>
									</td>
									<td className="p-4">
										<span className={`px-2 py-1 rounded-full text-xs font-medium ${
											user.is_active 
												? 'bg-green-500/20 text-green-400' 
												: 'bg-red-500/20 text-red-400'
										}`}>
											{user.is_active ? 'Active' : 'Inactive'}
										</span>
									</td>
									<td className="p-4">
										<div className="flex items-center gap-2">
											{canUpdateUser && (
												<button
													onClick={() => openEditModal(user)}
													className="p-2 hover:bg-white/10 rounded-lg transition-colors"
													title="Edit user"
												>
													<Edit className="h-4 w-4 text-neutral-400" />
												</button>
											)}
											
											<button
												onClick={() => handleToggleStatus(user)}
												className="p-2 hover:bg-white/10 rounded-lg transition-colors"
												title={user.is_active ? 'Deactivate user' : 'Activate user'}
											>
												{user.is_active ? (
													<UserX className="h-4 w-4 text-yellow-400" />
												) : (
													<UserCheck className="h-4 w-4 text-green-400" />
												)}
											</button>

											{canDeleteUser && (
												<button
													onClick={() => openDeleteModal(user)}
													className="p-2 hover:bg-white/10 rounded-lg transition-colors"
													title="Delete user"
												>
													<Trash2 className="h-4 w-4 text-red-400" />
												</button>
											)}
										</div>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</div>

			{/* Modals */}
			<Modal
				id="create-user-modal"
				title="Add New User"
				size="md"
				closable={true}
			>
				<UserForm
					mode="create"
					onSubmit={handleCreateUser}
					onCancel={() => hideModal('create-user-modal')}
				/>
			</Modal>

			<Modal
				id="edit-user-modal"
				title="Edit User"
				size="md"
				closable={true}
			>
				<UserForm
					mode="edit"
					user={selectedUser}
					onSubmit={handleEditUser}
					onCancel={() => hideModal('edit-user-modal')}
				/>
			</Modal>

			<ConfirmModal
				id="delete-user-modal"
				title="Delete User"
				message={`Are you sure you want to delete ${userToDelete?.first_name} ${userToDelete?.last_name}? This action cannot be undone.`}
				confirmText="Delete"
				cancelText="Cancel"
				variant="danger"
				onConfirm={handleDeleteUser}
				onCancel={() => hideModal('delete-user-modal')}
			/>
		</div>
	)
}

// Stat Card Component
function StatCard({ title, value }: { title: string, value: number }) {
	return (
		<div className="glass rounded-lg p-4">
			<div className="text-2xl font-bold text-white">{value}</div>
			<div className="text-sm text-neutral-400">{title}</div>
		</div>
	)
}
