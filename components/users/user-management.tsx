'use client'

import React, { useState } from 'react'
import { Plus, Edit, Trash2, MoreHorizontal, UserCheck, UserX } from 'lucide-react'
import { Button } from '@/components/ui'
import { useToast } from '@/components/ui/toast'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
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
		<div className='space-y-6'>
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

			{/* Users Table Section */}
			<div className='space-y-4'>
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
				<div className='overflow-x-auto border-t border-[var(--border)]'>
					<table className='w-full text-sm min-w-[800px]'>
						<thead className='border-b border-[var(--border)] text-neutral-400 sticky top-0 bg-background z-10 shadow-sm'>
							<tr>
								<th className='text-left p-3 min-w-[200px]'>Name</th>
								<th className='text-left p-3 min-w-[200px]'>Email</th>
								<th className='text-left p-3 min-w-[150px]'>Role</th>
								<th className='text-left p-3 min-w-[100px]'>Status</th>
								{canManageUsers && (
									<th className='text-left p-3 min-w-[100px]'>Actions</th>
								)}
							</tr>
						</thead>
						<tbody>
							{users.map((usr) => (
								<tr key={usr.id} className='border-b border-[var(--border)] hover:bg-muted/50'>
									<td className='p-3 min-w-[200px]'>
										<div className='text-sm font-medium'>
											{usr.first_name} {usr.last_name}
										</div>
									</td>
									<td className='p-3 min-w-[200px]'>
										<div className='text-sm text-muted-foreground'>{usr.email}</div>
									</td>
									<td className='p-3 min-w-[150px]'>
										<div className='text-sm'>{ROLE_DISPLAY_NAMES[usr.role as Role]}</div>
									</td>
									<td className='p-3 min-w-[100px]'>
										<span
											className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
												usr.is_active
													? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
													: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
											}`}
										>
											{usr.is_active ? 'Active' : 'Inactive'}
										</span>
									</td>
									{canManageUsers && (
										<td className='p-3 min-w-[100px]'>
											<DropdownMenu>
												<DropdownMenuTrigger asChild>
													<Button
														variant='ghost'
														size='sm'
														className='h-8 w-8 p-0'
													>
														<MoreHorizontal className='h-4 w-4' />
													</Button>
												</DropdownMenuTrigger>
												<DropdownMenuContent align='end'>
													<DropdownMenuItem
														onClick={() => {
															setSelectedUser(usr)
															setEditOpen(true)
														}}
													>
														<Edit className='mr-2 h-4 w-4' />
														Edit
													</DropdownMenuItem>
													<DropdownMenuItem
														onClick={() => handleToggleStatus(usr.id, usr.is_active)}
													>
														{usr.is_active ? (
															<>
																<UserX className='mr-2 h-4 w-4' />
																Deactivate
															</>
														) : (
															<>
																<UserCheck className='mr-2 h-4 w-4' />
																Activate
															</>
														)}
													</DropdownMenuItem>
													<DropdownMenuItem
														onClick={() => {
															setUserToDelete(usr)
															setDeleteOpen(true)
														}}
														className='text-red-400 focus:text-red-400'
													>
														<Trash2 className='mr-2 h-4 w-4' />
														Delete
													</DropdownMenuItem>
												</DropdownMenuContent>
											</DropdownMenu>
										</td>
									)}
								</tr>
							))}
						</tbody>
					</table>
				</div>
			)}
			</div>

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
