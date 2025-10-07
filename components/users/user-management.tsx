'use client'

import React, { useState } from 'react'
import { Plus, Edit, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui'
import { useToast } from '@/components/ui/toast'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { deleteUserAction, toggleUserStatusAction, type User, type UserStats } from '@/lib/services/users'
import { ROLE_DISPLAY_NAMES, Role } from '@/lib/rbac/types'
import { useSession } from '@/components/auth/session-context'
import { hasAnyRole } from '@/lib/auth/utils'
import { UserForm } from './user-form'

interface UserManagementProps {
	users: User[]
	stats: UserStats
}

export function UserManagement({ users, stats }: UserManagementProps) {
	const { user } = useSession()
	const [selectedUser, setSelectedUser] = useState<User | null>(null)
	const [userToDelete, setUserToDelete] = useState<User | null>(null)
	const { showToast } = useToast()
	const [createOpen, setCreateOpen] = useState(false)
	const [editOpen, setEditOpen] = useState(false)
	const [deleteOpen, setDeleteOpen] = useState(false)

	const canManageUsers = hasAnyRole(user, ['system_admin', 'hr_manager'])

	const handleDelete = async () => {
		if (!userToDelete) return

		try {
			await deleteUserAction(userToDelete.id)
			showToast({
				type: 'success',
				message: 'User deleted successfully',
				title: 'Success'
			})
			setDeleteOpen(false)
			setUserToDelete(null)
		} catch (error: unknown) {
			showToast({
				type: 'error',
				message: error instanceof Error ? error.message : 'Failed to delete user',
				title: 'Error'
			})
		}
	}

	const handleToggleStatus = async (userId: string, currentStatus: boolean) => {
		try {
			const newStatus = !currentStatus
			await toggleUserStatusAction(userId, newStatus)
			showToast({
				type: 'success',
				message: newStatus ? 'User activated successfully' : 'User deactivated successfully',
				title: 'Success'
			})
		} catch (error: unknown) {
			showToast({
				type: 'error',
				message: error instanceof Error ? error.message : 'Failed to update user status',
				title: 'Error'
			})
		}
	}

	return (
		<div className='space-y-4'>
			{/* Stats Cards */}
			<div className='grid grid-cols-1 md:grid-cols-5 gap-4'>
				<div className='p-4 rounded-lg bg-card border border-border'>
					<div className='text-sm text-muted-foreground'>Total Users</div>
					<div className='text-2xl font-bold text-foreground'>{stats.totalUsers}</div>
				</div>
				<div className='p-4 rounded-lg bg-card border border-border'>
					<div className='text-sm text-muted-foreground'>Active</div>
					<div className='text-2xl font-bold text-green-600'>{stats.activeUsers}</div>
				</div>
				<div className='p-4 rounded-lg bg-card border border-border'>
					<div className='text-sm text-muted-foreground'>Admins</div>
					<div className='text-2xl font-bold text-blue-600'>{stats.adminUsers}</div>
				</div>
				<div className='p-4 rounded-lg bg-card border border-border'>
					<div className='text-sm text-muted-foreground'>Managers</div>
					<div className='text-2xl font-bold text-purple-600'>{stats.managerUsers}</div>
				</div>
				<div className='p-4 rounded-lg bg-card border border-border'>
					<div className='text-sm text-muted-foreground'>Employees</div>
					<div className='text-2xl font-bold text-orange-600'>{stats.employeeUsers}</div>
				</div>
			</div>

			{/* Action Bar */}
			<div className='flex justify-between items-center'>
				<h3 className='text-lg font-semibold text-foreground'>Users List</h3>
				{canManageUsers && (
					<Button onClick={() => setCreateOpen(true)}>
						<Plus className='w-4 h-4 mr-2' />
						Add User
					</Button>
				)}
			</div>

			{/* Table */}
			{users.length === 0 ? (
				<div className='text-center py-12 border border-border rounded-lg bg-card'>
					<p className='text-sm text-muted-foreground'>No users found</p>
				</div>
			) : (
				<div className='overflow-x-auto border border-border rounded-lg'>
					<table className='min-w-full divide-y divide-border'>
						<thead className='bg-muted'>
							<tr>
								<th className='px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase'>Name</th>
								<th className='px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase'>Email</th>
								<th className='px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase'>Role</th>
								<th className='px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase'>Status</th>
								{canManageUsers && (
									<th className='px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase'>Actions</th>
								)}
							</tr>
						</thead>
						<tbody className='bg-card divide-y divide-border'>
							{users.map((usr) => (
								<tr key={usr.id} className='hover:bg-muted/50'>
									<td className='px-6 py-4 whitespace-nowrap'>
										<div className='text-sm font-medium text-foreground'>
											{usr.first_name} {usr.last_name}
										</div>
									</td>
									<td className='px-6 py-4 whitespace-nowrap'>
										<div className='text-sm text-muted-foreground'>{usr.email}</div>
									</td>
									<td className='px-6 py-4 whitespace-nowrap'>
										<div className='text-sm text-foreground'>{ROLE_DISPLAY_NAMES[usr.role as Role]}</div>
									</td>
									<td className='px-6 py-4 whitespace-nowrap'>
										<span
											className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full cursor-pointer ${
												usr.is_active
													? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
													: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
											}`}
											onClick={canManageUsers ? () => handleToggleStatus(usr.id, usr.is_active) : undefined}
										>
											{usr.is_active ? 'Active' : 'Inactive'}
										</span>
									</td>
									{canManageUsers && (
										<td className='px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2'>
											<Button
												variant='ghost'
												size='sm'
												onClick={() => {
													setSelectedUser(usr)
													setEditOpen(true)
												}}
											>
												<Edit className='w-4 h-4' />
											</Button>
											<Button
												variant='ghost'
												size='sm'
												onClick={() => {
													setUserToDelete(usr)
													setDeleteOpen(true)
												}}
											>
												<Trash2 className='w-4 h-4 text-red-600' />
											</Button>
										</td>
									)}
								</tr>
							))}
						</tbody>
					</table>
				</div>
			)}

			{/* Create Dialog */}
			<Dialog open={createOpen} onOpenChange={setCreateOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Create New User</DialogTitle>
					</DialogHeader>
					<UserForm mode="create" onCancel={() => setCreateOpen(false)} onSuccess={() => setCreateOpen(false)} />
				</DialogContent>
			</Dialog>

			{/* Edit Dialog */}
			<Dialog open={editOpen} onOpenChange={setEditOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Edit User</DialogTitle>
					</DialogHeader>
					{selectedUser && (
						<UserForm
							mode="edit"
							user={selectedUser}
							onCancel={() => {
								setEditOpen(false)
								setSelectedUser(null)
							}}
							onSuccess={() => {
								setEditOpen(false)
								setSelectedUser(null)
							}}
						/>
					)}
				</DialogContent>
			</Dialog>

			{/* Delete Confirmation */}
			<AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Are you sure?</AlertDialogTitle>
						<AlertDialogDescription>
							This will permanently delete the user &quot;{userToDelete?.first_name} {userToDelete?.last_name}&quot;. This action cannot be undone.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel onClick={() => setUserToDelete(null)}>Cancel</AlertDialogCancel>
						<AlertDialogAction onClick={handleDelete} className='bg-red-600 hover:bg-red-700'>
							Delete
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	)
}
