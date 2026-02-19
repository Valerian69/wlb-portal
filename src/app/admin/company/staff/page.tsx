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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { mockClients } from '@/lib/mock-data';

const roleLabels: Record<string, string> = {
  company_admin: 'Company Admin',
  internal_admin: 'Internal Admin',
};

const roleColors: Record<string, string> = {
  company_admin: 'bg-blue-500',
  internal_admin: 'bg-green-500',
};

export default function CompanyAdminStaffPage() {
  const { user, logout, isCompanyAdmin, isSuperAdmin } = useAuth();
  const router = useRouter();
  const [staffUsers, setStaffUsers] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [formData, setFormData] = useState({ name: '', email: '', role: 'internal_admin' as string });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isCompanyAdmin && !isSuperAdmin) {
      router.push('/admin/login');
      return;
    }
    loadStaff();
  }, [isCompanyAdmin, isSuperAdmin, router, user?.clientId]);

  const loadStaff = async () => {
    setIsLoading(true);
    const result = await getUsers(undefined, undefined, user?.clientId);
    if (result.data) {
      // Filter to only company_admin and internal_admin roles
      const filtered = result.data.filter((u) => 
        ['company_admin', 'internal_admin'].includes(u.role)
      );
      setStaffUsers(filtered);
    }
    setIsLoading(false);
  };

  const filteredUsers = staffUsers.filter(
    (staff) =>
      staff.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      staff.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreate = async () => {
    const result = await createUser({
      email: formData.email,
      password: 'temp123', // In production, generate secure password
      name: formData.name,
      role: formData.role as any,
      clientId: user?.clientId,
    });

    if (result.error) {
      alert(`Failed to create: ${result.error}`);
      return;
    }

    if (result.data) {
      setStaffUsers([...staffUsers, result.data]);
      setIsCreateDialogOpen(false);
      setFormData({ name: '', email: '', role: 'internal_admin' });
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
      setStaffUsers(staffUsers.map((s) => s.id === selectedUser.id ? result.data : s));
      setIsEditDialogOpen(false);
      setSelectedUser(null);
      setFormData({ name: '', email: '', role: 'internal_admin' });
    }
  };

  const handleDelete = async () => {
    if (!selectedUser) return;
    
    const result = await deleteUser(selectedUser.id);

    if (result.error) {
      alert(`Failed to delete: ${result.error}`);
      return;
    }

    setStaffUsers(staffUsers.filter((s) => s.id !== selectedUser.id));
    setIsDeleteDialogOpen(false);
    setSelectedUser(null);
  };

  const openEditDialog = (staff: any) => {
    setSelectedUser(staff);
    setFormData({
      name: staff.name,
      email: staff.email,
      role: staff.role,
    });
    setIsEditDialogOpen(true);
  };

  const toggleUserStatus = async (staff: any) => {
    // In production, implement status update API
    alert('Status toggle - implement API endpoint');
  };

  const client = mockClients.find((c) => c.slug === user?.clientId) || mockClients[0];

  if (!isCompanyAdmin && !isSuperAdmin) {
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
              <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold" style={{ backgroundColor: client.primaryColor }}>{client.name.charAt(0)}</div>
              <div><p className="font-semibold text-lg">{client.name}</p><p className="text-xs text-gray-500">Company Admin Panel</p></div>
            </div>
            <nav className="hidden md:flex items-center gap-6 ml-8">
              <a href="/admin/company/staff" className="text-sm font-medium text-primary">Staff Management</a>
              <a href="/admin/company/settings" className="text-sm font-medium text-gray-500 hover:text-primary">Settings</a>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="default" className="hidden sm:flex">Company Admin</Badge>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-medium text-sm">{user?.avatar || 'CA'}</div>
              <span className="text-sm font-medium hidden sm:block">{user?.name || 'Admin'}</span>
            </div>
            <Button variant="outline" size="sm" onClick={logout}>Sign Out</Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Staff Management</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Manage your organization's internal team members</p>
          </div>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            Add Staff Member
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card><CardHeader className="pb-2"><CardDescription>Total Staff</CardDescription><CardTitle className="text-3xl">{staffUsers.length}</CardTitle></CardHeader></Card>
          <Card><CardHeader className="pb-2"><CardDescription>Active</CardDescription><CardTitle className="text-3xl text-green-600">{staffUsers.filter((s) => s.status === 'ACTIVE').length}</CardTitle></CardHeader></Card>
          <Card><CardHeader className="pb-2"><CardDescription>Company Admins</CardDescription><CardTitle className="text-3xl">{staffUsers.filter((s) => s.role === 'company_admin').length}</CardTitle></CardHeader></Card>
          <Card><CardHeader className="pb-2"><CardDescription>Internal Admins</CardDescription><CardTitle className="text-3xl">{staffUsers.filter((s) => s.role === 'internal_admin').length}</CardTitle></CardHeader></Card>
        </div>

        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <Input placeholder="Search staff..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="max-w-sm" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Member</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Login</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((staff) => (
                  <TableRow key={staff.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-medium text-sm">{staff.name.split(' ').map((n: string) => n[0]).join('')}</div>
                        <div><p className="font-medium">{staff.name}</p><p className="text-sm text-gray-500">{staff.email}</p></div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="flex items-center gap-1 w-fit">
                        <span className={`w-2 h-2 rounded-full ${roleColors[staff.role]}`} />
                        {roleLabels[staff.role]}
                      </Badge>
                    </TableCell>
                    <TableCell><Badge variant={staff.status === 'ACTIVE' ? 'default' : 'secondary'}>{staff.status === 'ACTIVE' ? 'Active' : 'Inactive'}</Badge></TableCell>
                    <TableCell className="text-sm text-gray-500">{staff.lastLoginAt ? new Date(staff.lastLoginAt).toLocaleDateString() : 'Never'}</TableCell>
                    <TableCell className="text-sm text-gray-500">{new Date(staff.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild><Button variant="ghost" size="sm"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" /></svg></Button></DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => openEditDialog(staff)}>Edit Member</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => toggleUserStatus(staff)}>{staff.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => { setSelectedUser(staff); setIsDeleteDialogOpen(true); }} className="text-red-600">Remove Member</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {filteredUsers.length === 0 && <div className="text-center py-8 text-gray-500 dark:text-gray-400">No staff members found</div>}
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Role Permissions</CardTitle>
            <CardDescription>Understanding staff roles and their access levels</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-4 border rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`w-3 h-3 rounded-full ${roleColors.company_admin}`} />
                  <h4 className="font-medium">Company Admin</h4>
                </div>
                <p className="text-sm text-gray-500">Can manage staff members, view all company reports, and configure company settings.</p>
              </div>
              <div className="p-4 border rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`w-3 h-3 rounded-full ${roleColors.internal_admin}`} />
                  <h4 className="font-medium">Internal Admin</h4>
                </div>
                <p className="text-sm text-gray-500">Can view validated reports and communicate with external admin team.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Create Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add Staff Member</DialogTitle><DialogDescription>Invite a new team member to your organization.</DialogDescription></DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2"><Label htmlFor="name">Full Name</Label><Input id="name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="John Doe" /></div>
            <div className="space-y-2"><Label htmlFor="email">Email Address</Label><Input id="email" type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} placeholder="john@company.com" /></div>
            <div className="space-y-2"><Label htmlFor="role">Role</Label><Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="company_admin">Company Admin</SelectItem><SelectItem value="internal_admin">Internal Admin</SelectItem></SelectContent></Select></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>Cancel</Button><Button onClick={handleCreate} disabled={!formData.name || !formData.email}>Add Member</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit Staff Member</DialogTitle><DialogDescription>Update member information and role.</DialogDescription></DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2"><Label htmlFor="edit-name">Full Name</Label><Input id="edit-name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} /></div>
            <div className="space-y-2"><Label htmlFor="edit-email">Email Address</Label><Input id="edit-email" type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} /></div>
            <div className="space-y-2"><Label htmlFor="edit-role">Role</Label><Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="company_admin">Company Admin</SelectItem><SelectItem value="internal_admin">Internal Admin</SelectItem></SelectContent></Select></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button><Button onClick={handleEdit} disabled={!formData.name || !formData.email}>Save Changes</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Remove Staff Member</DialogTitle><DialogDescription>Are you sure you want to remove &quot;{selectedUser?.name}&quot;? They will lose access to the platform.</DialogDescription></DialogHeader>
          <DialogFooter><Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Cancel</Button><Button variant="destructive" onClick={handleDelete}>Remove</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
