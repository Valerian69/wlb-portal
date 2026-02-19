'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { getUsers, createUser, updateUser, deleteUser } from '@/lib/api-client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const roleLabels: Record<string, string> = {
  super_admin: 'Super Admin',
  company_admin: 'Company Admin',
  external_admin: 'External Admin',
  internal_admin: 'Internal Admin',
  reporter: 'Reporter',
};

const roleColors: Record<string, string> = {
  super_admin: 'bg-red-500',
  company_admin: 'bg-blue-500',
  external_admin: 'bg-purple-500',
  internal_admin: 'bg-green-500',
  reporter: 'bg-gray-500',
};

export default function SuperAdminUsersPage() {
  const { user, logout, isSuperAdmin } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'internal_admin' as string, clientId: '' });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isSuperAdmin) {
      router.push('/admin/login');
      return;
    }
    loadUsers();
  }, [isSuperAdmin, router]);

  const loadUsers = async () => {
    setIsLoading(true);
    const result = await getUsers();
    if (result.data) {
      setUsers(result.data);
    }
    setIsLoading(false);
  };

  const filteredUsers = users.filter((u) => {
    const matchesSearch = u.name.toLowerCase().includes(searchQuery.toLowerCase()) || u.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const handleCreate = async () => {
    const result = await createUser({
      email: formData.email,
      password: formData.password,
      name: formData.name,
      role: formData.role as any,
      clientId: formData.clientId || undefined,
    });

    if (result.error) {
      alert(`Failed to create: ${result.error}`);
      return;
    }

    if (result.data) {
      setUsers([...users, result.data]);
      setIsCreateDialogOpen(false);
      setFormData({ name: '', email: '', password: '', role: 'internal_admin', clientId: '' });
    }
  };

  const handleEdit = async () => {
    if (!selectedUser) return;
    
    const result = await updateUser(selectedUser.id, {
      name: formData.name,
      email: formData.email,
      role: formData.role as any,
    });

    if (result.error) {
      alert(`Failed to update: ${result.error}`);
      return;
    }

    if (result.data) {
      setUsers(users.map((u) => u.id === selectedUser.id ? result.data : u));
      setIsEditDialogOpen(false);
      setSelectedUser(null);
      setFormData({ name: '', email: '', password: '', role: 'internal_admin', clientId: '' });
    }
  };

  const handleDelete = async () => {
    if (!selectedUser) return;
    
    const result = await deleteUser(selectedUser.id);

    if (result.error) {
      alert(`Failed to delete: ${result.error}`);
      return;
    }

    setUsers(users.filter((u) => u.id !== selectedUser.id));
    setIsDeleteDialogOpen(false);
    setSelectedUser(null);
  };

  const openEditDialog = (userData: any) => {
    setSelectedUser(userData);
    setFormData({
      name: userData.name,
      email: userData.email,
      role: userData.role,
      clientId: userData.clientId || '',
      password: '',
    });
    setIsEditDialogOpen(true);
  };

  if (!isSuperAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-gray-500">Redirecting...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-4 mx-auto">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold">W</div>
              <div><p className="font-semibold text-lg">Whistleblower Portal</p><p className="text-xs text-gray-500">Super Admin Panel</p></div>
            </div>
            <nav className="hidden md:flex items-center gap-6 ml-8">
              <a href="/admin/super/companies" className="text-sm font-medium text-gray-500 hover:text-primary">Companies</a>
              <a href="/admin/super/users" className="text-sm font-medium text-primary">All Users</a>
              <a href="/admin/super/settings" className="text-sm font-medium text-gray-500 hover:text-primary">Settings</a>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="default" className="hidden sm:flex">Super Admin</Badge>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-medium text-sm">{user?.avatar || 'SA'}</div>
              <span className="text-sm font-medium hidden sm:block">{user?.name || 'Admin'}</span>
            </div>
            <Button variant="outline" size="sm" onClick={logout}>Sign Out</Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Manage all users across all organizations</p>
          </div>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            Add User
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card><CardHeader className="pb-2"><CardDescription>Total Users</CardDescription><CardTitle className="text-3xl">{users.length}</CardTitle></CardHeader></Card>
          <Card><CardHeader className="pb-2"><CardDescription>Super Admins</CardDescription><CardTitle className="text-3xl">{users.filter((u) => u.role === 'super_admin').length}</CardTitle></CardHeader></Card>
          <Card><CardHeader className="pb-2"><CardDescription>Company Admins</CardDescription><CardTitle className="text-3xl">{users.filter((u) => u.role === 'company_admin').length}</CardTitle></CardHeader></Card>
          <Card><CardHeader className="pb-2"><CardDescription>Internal Admins</CardDescription><CardTitle className="text-3xl">{users.filter((u) => u.role === 'internal_admin').length}</CardTitle></CardHeader></Card>
        </div>

        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <Input placeholder="Search users..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="max-w-sm" />
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-[200px]"><SelectValue placeholder="Filter by role" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="super_admin">Super Admin</SelectItem>
                  <SelectItem value="company_admin">Company Admin</SelectItem>
                  <SelectItem value="external_admin">External Admin</SelectItem>
                  <SelectItem value="internal_admin">Internal Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Organization</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((userData) => (
                  <TableRow key={userData.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-medium text-sm">{userData.avatar || userData.name.charAt(0)}</div>
                        <div><p className="font-medium">{userData.name}</p><p className="text-sm text-gray-500">{userData.email}</p></div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="flex items-center gap-1 w-fit">
                        <span className={`w-2 h-2 rounded-full ${roleColors[userData.role]}`} />
                        {roleLabels[userData.role]}
                      </Badge>
                    </TableCell>
                    <TableCell>{userData.clientName ? <span className="text-sm">{userData.clientName}</span> : <span className="text-sm text-gray-400">-</span>}</TableCell>
                    <TableCell><Badge variant="default">Active</Badge></TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild><Button variant="ghost" size="sm"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" /></svg></Button></DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => openEditDialog(userData)}>Edit User</DropdownMenuItem>
                          <DropdownMenuItem>Reset Password</DropdownMenuItem>
                          <DropdownMenuItem>Suspend User</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => { setSelectedUser(userData); setIsDeleteDialogOpen(true); }} className="text-red-600">Delete User</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {filteredUsers.length === 0 && <div className="text-center py-8 text-gray-500 dark:text-gray-400">No users found</div>}
          </CardContent>
        </Card>
      </main>

      {/* Create Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add New User</DialogTitle><DialogDescription>Create a new user account with appropriate role and permissions.</DialogDescription></DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2"><Label htmlFor="name">Full Name</Label><Input id="name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="John Doe" /></div>
            <div className="space-y-2"><Label htmlFor="email">Email Address</Label><Input id="email" type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} placeholder="john@example.com" /></div>
            <div className="space-y-2"><Label htmlFor="password">Temporary Password</Label><Input id="password" type="password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} placeholder="••••••••" /></div>
            <div className="space-y-2"><Label htmlFor="role">Role</Label><Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="super_admin">Super Admin</SelectItem><SelectItem value="company_admin">Company Admin</SelectItem><SelectItem value="external_admin">External Admin</SelectItem><SelectItem value="internal_admin">Internal Admin</SelectItem></SelectContent></Select></div>
            {(formData.role === 'company_admin' || formData.role === 'internal_admin') && (
              <div className="space-y-2"><Label htmlFor="clientId">Organization</Label><Input id="clientId" value={formData.clientId} onChange={(e) => setFormData({ ...formData, clientId: e.target.value })} placeholder="acme-corp" /></div>
            )}
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>Cancel</Button><Button onClick={handleCreate} disabled={!formData.name || !formData.email || !formData.password}>Create User</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit User</DialogTitle><DialogDescription>Update user information and role.</DialogDescription></DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2"><Label htmlFor="edit-name">Full Name</Label><Input id="edit-name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} /></div>
            <div className="space-y-2"><Label htmlFor="edit-email">Email Address</Label><Input id="edit-email" type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} /></div>
            <div className="space-y-2"><Label htmlFor="edit-role">Role</Label><Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="super_admin">Super Admin</SelectItem><SelectItem value="company_admin">Company Admin</SelectItem><SelectItem value="external_admin">External Admin</SelectItem><SelectItem value="internal_admin">Internal Admin</SelectItem></SelectContent></Select></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button><Button onClick={handleEdit} disabled={!formData.name || !formData.email}>Save Changes</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Delete User</DialogTitle><DialogDescription>Are you sure you want to delete &quot;{selectedUser?.name}&quot;? This action cannot be undone.</DialogDescription></DialogHeader>
          <DialogFooter><Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Cancel</Button><Button variant="destructive" onClick={handleDelete}>Delete</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
