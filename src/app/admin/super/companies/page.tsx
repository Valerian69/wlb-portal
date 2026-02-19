'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { getClients, createClient, updateClient, deleteClient } from '@/lib/api-client';
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

export default function SuperAdminCompaniesPage() {
  const { user, logout, isSuperAdmin } = useAuth();
  const router = useRouter();
  const [companies, setCompanies] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<any | null>(null);
  const [formData, setFormData] = useState({ name: '', slug: '', primaryColor: '#3b82f6' });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isSuperAdmin) {
      router.push('/admin/login');
      return;
    }
    loadCompanies();
  }, [isSuperAdmin, router]);

  const loadCompanies = async () => {
    setIsLoading(true);
    const result = await getClients();
    if (result.data) {
      setCompanies(result.data);
    }
    setIsLoading(false);
  };

  const filteredCompanies = companies.filter(
    (company) =>
      company.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      company.slug.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreate = async () => {
    const result = await createClient({
      name: formData.name,
      slug: formData.slug.toLowerCase().replace(/\s+/g, '-'),
      primaryColor: formData.primaryColor,
    });

    if (result.error) {
      alert(`Failed to create: ${result.error}`);
      return;
    }

    if (result.data) {
      setCompanies([...companies, result.data]);
      setIsCreateDialogOpen(false);
      setFormData({ name: '', slug: '', primaryColor: '#3b82f6' });
    }
  };

  const handleEdit = async () => {
    if (!selectedCompany) return;
    
    const result = await updateClient(selectedCompany.id, {
      name: formData.name,
      slug: formData.slug,
      primaryColor: formData.primaryColor,
    });

    if (result.error) {
      alert(`Failed to update: ${result.error}`);
      return;
    }

    if (result.data) {
      setCompanies(companies.map((c) => c.id === selectedCompany.id ? result.data : c));
      setIsEditDialogOpen(false);
      setSelectedCompany(null);
      setFormData({ name: '', slug: '', primaryColor: '#3b82f6' });
    }
  };

  const handleDelete = async () => {
    if (!selectedCompany) return;
    
    const result = await deleteClient(selectedCompany.id);

    if (result.error) {
      alert(`Failed to delete: ${result.error}`);
      return;
    }

    setCompanies(companies.filter((c) => c.id !== selectedCompany.id));
    setIsDeleteDialogOpen(false);
    setSelectedCompany(null);
  };

  const openEditDialog = (company: any) => {
    setSelectedCompany(company);
    setFormData({
      name: company.name,
      slug: company.slug,
      primaryColor: company.primaryColor || '#3b82f6',
    });
    setIsEditDialogOpen(true);
  };

  const toggleCompanyStatus = async (company: any) => {
    const result = await updateClient(company.id, { isActive: !company.isActive });
    if (result.data) {
      setCompanies(companies.map((c) => c.id === company.id ? result.data : c));
    }
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
              <div>
                <p className="font-semibold text-lg">Whistleblower Portal</p>
                <p className="text-xs text-gray-500">Super Admin Panel</p>
              </div>
            </div>
            <nav className="hidden md:flex items-center gap-6 ml-8">
              <a href="/admin/super/companies" className="text-sm font-medium text-primary">Companies</a>
              <a href="/admin/super/users" className="text-sm font-medium text-gray-500 hover:text-primary">All Users</a>
              <a href="/admin/super/settings" className="text-sm font-medium text-gray-500 hover:text-primary">Settings</a>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="default" className="hidden sm:flex">Super Admin</Badge>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-medium text-sm">
                {user?.avatar || 'SA'}
              </div>
              <span className="text-sm font-medium hidden sm:block">{user?.name || 'Admin'}</span>
            </div>
            <Button variant="outline" size="sm" onClick={logout}>Sign Out</Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Companies Management</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Manage all organizations using the whistleblower platform</p>
          </div>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            Add Company
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card><CardHeader className="pb-2"><CardDescription>Total Companies</CardDescription><CardTitle className="text-3xl">{companies.length}</CardTitle></CardHeader></Card>
          <Card><CardHeader className="pb-2"><CardDescription>Active</CardDescription><CardTitle className="text-3xl text-green-600">{companies.filter((c) => c.isActive).length}</CardTitle></CardHeader></Card>
          <Card><CardHeader className="pb-2"><CardDescription>Inactive</CardDescription><CardTitle className="text-3xl text-red-600">{companies.filter((c) => !c.isActive).length}</CardTitle></CardHeader></Card>
          <Card><CardHeader className="pb-2"><CardDescription>This Month</CardDescription><CardTitle className="text-3xl">{companies.filter((c) => { const now = new Date(); const created = new Date(c.createdAt); return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear(); }).length}</CardTitle></CardHeader></Card>
        </div>

        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <Input placeholder="Search companies..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="max-w-sm" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Company</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Last Updated</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCompanies.map((company) => (
                  <TableRow key={company.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm" style={{ backgroundColor: company.primaryColor }}>{company.name.charAt(0)}</div>
                        <div><p className="font-medium">{company.name}</p></div>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-sm">{company.slug}</TableCell>
                    <TableCell><Badge variant={company.isActive ? 'default' : 'secondary'}>{company.isActive ? 'Active' : 'Inactive'}</Badge></TableCell>
                    <TableCell className="text-sm text-gray-500">{new Date(company.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell className="text-sm text-gray-500">{new Date(company.updatedAt).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild><Button variant="ghost" size="sm"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" /></svg></Button></DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => openEditDialog(company)}>Edit Company</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => toggleCompanyStatus(company)}>{company.isActive ? 'Deactivate' : 'Activate'}</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => { setSelectedCompany(company); setIsDeleteDialogOpen(true); }} className="text-red-600">Delete Company</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {filteredCompanies.length === 0 && <div className="text-center py-8 text-gray-500 dark:text-gray-400">No companies found</div>}
          </CardContent>
        </Card>
      </main>

      {/* Create Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Create New Company</DialogTitle><DialogDescription>Add a new organization to the whistleblower platform.</DialogDescription></DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2"><Label htmlFor="name">Company Name</Label><Input id="name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Acme Corporation" /></div>
            <div className="space-y-2"><Label htmlFor="slug">Slug (URL identifier)</Label><Input id="slug" value={formData.slug} onChange={(e) => setFormData({ ...formData, slug: e.target.value })} placeholder="acme-corp" /></div>
            <div className="space-y-2"><Label htmlFor="color">Brand Color</Label><div className="flex gap-2"><Input id="color" type="color" value={formData.primaryColor} onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })} className="w-20 h-10" /><div className="w-20 h-10 rounded" style={{ backgroundColor: formData.primaryColor }} /></div></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>Cancel</Button><Button onClick={handleCreate} disabled={!formData.name || !formData.slug}>Create Company</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit Company</DialogTitle><DialogDescription>Update company information.</DialogDescription></DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2"><Label htmlFor="edit-name">Company Name</Label><Input id="edit-name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} /></div>
            <div className="space-y-2"><Label htmlFor="edit-slug">Slug</Label><Input id="edit-slug" value={formData.slug} onChange={(e) => setFormData({ ...formData, slug: e.target.value })} /></div>
            <div className="space-y-2"><Label htmlFor="edit-color">Brand Color</Label><div className="flex gap-2"><Input id="edit-color" type="color" value={formData.primaryColor} onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })} className="w-20 h-10" /><div className="w-20 h-10 rounded" style={{ backgroundColor: formData.primaryColor }} /></div></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button><Button onClick={handleEdit} disabled={!formData.name || !formData.slug}>Save Changes</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Delete Company</DialogTitle><DialogDescription>Are you sure you want to delete &quot;{selectedCompany?.name}&quot;? This action cannot be undone.</DialogDescription></DialogHeader>
          <DialogFooter><Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Cancel</Button><Button variant="destructive" onClick={handleDelete}>Delete</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
