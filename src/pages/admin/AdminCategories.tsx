import { useState } from 'react';
import { AdminLayout } from '@/layouts/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminAPI } from '@/lib/api';
import { toast } from '@/hooks/use-toast';
import { Plus, Layers, Trash2 } from 'lucide-react';

export default function AdminCategories() {
  const queryClient = useQueryClient();
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const { data: categories = [], isLoading } = useQuery({
    queryKey: ['admin-categories'],
    queryFn: () => adminAPI.getCategories(),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => adminAPI.createCategory(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
      toast({ title: 'Category created' });
      setIsCreateOpen(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminAPI.deleteCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
      toast({ title: 'Category deleted' });
    },
  });

  const handleCreate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    createMutation.mutate({ name: fd.get('name'), description: fd.get('description') });
  };

  return (
    <AdminLayout title="Categories" subtitle="Manage menu categories for sellers">
      <div className="flex justify-end mb-6">
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button variant="gradient" className="gap-2"><Plus size={18} /> Add Category</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle className="font-display">New Category</DialogTitle></DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4 mt-4">
              <div className="space-y-2"><Label>Name</Label><Input name="name" placeholder="e.g., North Indian" required /></div>
              <div className="space-y-2"><Label>Description</Label><Textarea name="description" placeholder="Optional description" rows={2} /></div>
              <Button type="submit" variant="gradient" className="w-full" disabled={createMutation.isPending}>
                {createMutation.isPending ? 'Creating...' : 'Create Category'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? <LoadingSpinner /> : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((cat: any) => (
            <Card key={cat._id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Layers size={20} className="text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">{cat.name}</h3>
                      {cat.description && <p className="text-sm text-muted-foreground">{cat.description}</p>}
                      <p className="text-xs text-muted-foreground mt-1">{new Date(cat.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon-sm" className="text-destructive" onClick={() => {
                    if (confirm('Delete this category?')) deleteMutation.mutate(cat._id);
                  }}>
                    <Trash2 size={14} />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
          {categories.length === 0 && (
            <div className="col-span-full text-center py-12"><p className="text-muted-foreground">No categories yet</p></div>
          )}
        </div>
      )}
    </AdminLayout>
  );
}
