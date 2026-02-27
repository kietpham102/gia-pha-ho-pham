'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
    Contact,
    Plus,
    Trash2,
    Edit2,
    Search,
    RefreshCw,
    Phone,
    Mail,
    MapPin,
    Download,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { useAuth } from '@/components/auth-provider';
import { supabase } from '@/lib/supabase';

interface ContactEntry {
    id: string;
    full_name: string;
    relation: string | null;
    phone: string | null;
    email: string | null;
    address: string | null;
    group_name: string | null;
    notes: string | null;
    person_handle: string | null;
    created_at: string;
}

const groupColors: Record<string, string> = {
    'Ban trị sự': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
    'Chi 1': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
    'Chi 2': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    'Chi 3': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
    'Hội đồng gia tộc': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
};

function ContactFormDialog({
    onSaved,
    existing,
}: {
    onSaved: () => void;
    existing?: ContactEntry | null;
}) {
    const [open, setOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [fullName, setFullName] = useState('');
    const [relation, setRelation] = useState('');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const [address, setAddress] = useState('');
    const [groupName, setGroupName] = useState('');
    const [notes, setNotes] = useState('');

    useEffect(() => {
        if (existing && open) {
            setFullName(existing.full_name);
            setRelation(existing.relation || '');
            setPhone(existing.phone || '');
            setEmail(existing.email || '');
            setAddress(existing.address || '');
            setGroupName(existing.group_name || '');
            setNotes(existing.notes || '');
        }
    }, [existing, open]);

    const resetForm = () => {
        setFullName(''); setRelation(''); setPhone(''); setEmail('');
        setAddress(''); setGroupName(''); setNotes('');
    };

    const handleSubmit = async () => {
        if (!fullName.trim()) return;
        setSubmitting(true);
        try {
            const payload = {
                full_name: fullName.trim(),
                relation: relation.trim() || null,
                phone: phone.trim() || null,
                email: email.trim() || null,
                address: address.trim() || null,
                group_name: groupName.trim() || null,
                notes: notes.trim() || null,
            };

            if (existing) {
                await supabase.from('clan_contacts').update(payload).eq('id', existing.id);
            } else {
                await supabase.from('clan_contacts').insert(payload);
            }

            setOpen(false);
            resetForm();
            onSaved();
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) resetForm(); }}>
            <DialogTrigger asChild>
                {existing ? (
                    <Button variant="ghost" size="icon"><Edit2 className="h-4 w-4" /></Button>
                ) : (
                    <Button><Plus className="mr-2 h-4 w-4" />Thêm liên hệ</Button>
                )}
            </DialogTrigger>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>{existing ? 'Sửa thông tin liên hệ' : 'Thêm liên hệ mới'}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                    <div>
                        <label className="text-sm font-medium">Họ tên *</label>
                        <Input placeholder="Nguyễn Văn A" value={fullName} onChange={e => setFullName(e.target.value)} />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-sm font-medium">Quan hệ</label>
                            <Input placeholder="Trưởng chi, Thành viên..." value={relation} onChange={e => setRelation(e.target.value)} />
                        </div>
                        <div>
                            <label className="text-sm font-medium">Nhóm</label>
                            <Input placeholder="Ban trị sự, Chi 1..." value={groupName} onChange={e => setGroupName(e.target.value)} />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-sm font-medium">Số điện thoại</label>
                            <Input placeholder="0901234567" value={phone} onChange={e => setPhone(e.target.value)} />
                        </div>
                        <div>
                            <label className="text-sm font-medium">Email</label>
                            <Input placeholder="email@example.com" value={email} onChange={e => setEmail(e.target.value)} />
                        </div>
                    </div>
                    <div>
                        <label className="text-sm font-medium">Địa chỉ</label>
                        <Input placeholder="Địa chỉ liên hệ" value={address} onChange={e => setAddress(e.target.value)} />
                    </div>
                    <div>
                        <label className="text-sm font-medium">Ghi chú</label>
                        <Textarea placeholder="Ghi chú thêm..." value={notes} onChange={e => setNotes(e.target.value)} rows={2} />
                    </div>
                    <Button className="w-full" onClick={handleSubmit} disabled={!fullName.trim() || submitting}>
                        {submitting ? 'Đang lưu...' : existing ? 'Cập nhật' : 'Thêm mới'}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}

export default function AdminContactsPage() {
    const { isAdmin, loading: authLoading } = useAuth();
    const router = useRouter();
    const [contacts, setContacts] = useState<ContactEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    const fetchContacts = useCallback(async () => {
        const { data } = await supabase
            .from('clan_contacts')
            .select('*')
            .order('full_name', { ascending: true });
        if (data) setContacts(data as ContactEntry[]);
        setLoading(false);
    }, []);

    useEffect(() => {
        if (!authLoading && !isAdmin) {
            router.push('/');
        }
    }, [authLoading, isAdmin, router]);

    useEffect(() => { fetchContacts(); }, [fetchContacts]);

    const handleDelete = async (id: string) => {
        if (!confirm('Bạn có chắc muốn xóa liên hệ này?')) return;
        await supabase.from('clan_contacts').delete().eq('id', id);
        fetchContacts();
    };

    const exportCSV = () => {
        const headers = ['Họ tên', 'Quan hệ', 'Nhóm', 'Số điện thoại', 'Email', 'Địa chỉ', 'Ghi chú'];
        const rows = contacts.map(c => [
            c.full_name, c.relation || '', c.group_name || '',
            c.phone || '', c.email || '', c.address || '', c.notes || '',
        ]);
        const csv = [headers, ...rows].map(r => r.map(v => `"${v.replace(/"/g, '""')}"`).join(',')).join('\n');
        const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `danh-ba-dong-ho-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const filtered = contacts.filter(c =>
        c.full_name.toLowerCase().includes(search.toLowerCase()) ||
        (c.phone || '').includes(search) ||
        (c.group_name || '').toLowerCase().includes(search.toLowerCase())
    );

    const groups = [...new Set(contacts.map(c => c.group_name).filter(Boolean))];

    if (authLoading || !isAdmin) {
        return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                        <Contact className="h-6 w-6" />Danh bạ dòng họ
                    </h1>
                    <p className="text-muted-foreground">Quản lý thông tin liên hệ thành viên dòng họ</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={exportCSV}><Download className="h-4 w-4 mr-2" />Xuất CSV</Button>
                    <Button variant="outline" onClick={fetchContacts}><RefreshCw className="h-4 w-4 mr-2" />Làm mới</Button>
                    <ContactFormDialog onSaved={fetchContacts} />
                </div>
            </div>

            <div className="flex items-center gap-4">
                <div className="relative max-w-sm flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Tìm theo tên, SĐT, nhóm..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
                </div>
                <div className="flex gap-1 flex-wrap">
                    {groups.map(g => (
                        <Badge
                            key={g}
                            variant="outline"
                            className={`cursor-pointer text-xs ${search === g ? 'ring-2 ring-primary' : ''}`}
                            onClick={() => setSearch(search === g ? '' : g!)}
                        >
                            {g}
                        </Badge>
                    ))}
                </div>
            </div>

            {/* Summary */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="p-4 text-center">
                        <p className="text-2xl font-bold">{contacts.length}</p>
                        <p className="text-xs text-muted-foreground">Tổng liên hệ</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4 text-center">
                        <p className="text-2xl font-bold">{contacts.filter(c => c.phone).length}</p>
                        <p className="text-xs text-muted-foreground">Có SĐT</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4 text-center">
                        <p className="text-2xl font-bold">{contacts.filter(c => c.email).length}</p>
                        <p className="text-xs text-muted-foreground">Có email</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4 text-center">
                        <p className="text-2xl font-bold">{groups.length}</p>
                        <p className="text-xs text-muted-foreground">Nhóm</p>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardContent className="p-0">
                    {loading ? (
                        <div className="flex items-center justify-center h-48"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Họ tên</TableHead>
                                    <TableHead>Quan hệ</TableHead>
                                    <TableHead>Nhóm</TableHead>
                                    <TableHead>Số điện thoại</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Địa chỉ</TableHead>
                                    <TableHead className="text-right">Thao tác</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filtered.map(c => (
                                    <TableRow key={c.id}>
                                        <TableCell className="font-medium">{c.full_name}</TableCell>
                                        <TableCell className="text-sm">{c.relation || '—'}</TableCell>
                                        <TableCell>
                                            {c.group_name ? (
                                                <Badge variant="secondary" className={`text-xs ${groupColors[c.group_name] || ''}`}>
                                                    {c.group_name}
                                                </Badge>
                                            ) : '—'}
                                        </TableCell>
                                        <TableCell className="text-sm">
                                            {c.phone ? (
                                                <span className="flex items-center gap-1"><Phone className="h-3 w-3" />{c.phone}</span>
                                            ) : '—'}
                                        </TableCell>
                                        <TableCell className="text-sm">
                                            {c.email ? (
                                                <span className="flex items-center gap-1"><Mail className="h-3 w-3" />{c.email}</span>
                                            ) : '—'}
                                        </TableCell>
                                        <TableCell className="text-sm max-w-50 truncate">
                                            {c.address ? (
                                                <span className="flex items-center gap-1"><MapPin className="h-3 w-3 shrink-0" />{c.address}</span>
                                            ) : '—'}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                <ContactFormDialog onSaved={fetchContacts} existing={c} />
                                                <Button variant="ghost" size="icon" onClick={() => handleDelete(c.id)}>
                                                    <Trash2 className="h-4 w-4 text-destructive" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {filtered.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                                            Chưa có liên hệ nào
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
