'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
    CalendarDays,
    Plus,
    Trash2,
    Edit2,
    Search,
    RefreshCw,
    Clock,
    MapPin,
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

interface Ceremony {
    id: string;
    title: string;
    description: string | null;
    ceremony_date: string;
    lunar_date: string | null;
    location: string | null;
    type: string;
    is_recurring: boolean;
    person_handle: string | null;
    person_name: string | null;
    created_at: string;
}

const typeLabels: Record<string, { label: string; emoji: string }> = {
    GIO: { label: 'Giỗ', emoji: '🕯️' },
    TET: { label: 'Tết', emoji: '🧧' },
    THANH_MINH: { label: 'Thanh Minh', emoji: '🌿' },
    VU_LAN: { label: 'Vu Lan', emoji: '🪷' },
    CUNG_RAM: { label: 'Cúng Rằm', emoji: '🌕' },
    CUNG_MUNG_1: { label: 'Cúng Mùng 1', emoji: '🌑' },
    OTHER: { label: 'Khác', emoji: '📅' },
};

function CeremonyFormDialog({
    onSaved,
    existing,
}: {
    onSaved: () => void;
    existing?: Ceremony | null;
}) {
    const [open, setOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [ceremonyDate, setCeremonyDate] = useState('');
    const [lunarDate, setLunarDate] = useState('');
    const [location, setLocation] = useState('');
    const [type, setType] = useState('GIO');
    const [isRecurring, setIsRecurring] = useState(true);
    const [personName, setPersonName] = useState('');

    useEffect(() => {
        if (existing && open) {
            setTitle(existing.title);
            setDescription(existing.description || '');
            setCeremonyDate(existing.ceremony_date?.split('T')[0] || '');
            setLunarDate(existing.lunar_date || '');
            setLocation(existing.location || '');
            setType(existing.type);
            setIsRecurring(existing.is_recurring);
            setPersonName(existing.person_name || '');
        }
    }, [existing, open]);

    const resetForm = () => {
        setTitle('');
        setDescription('');
        setCeremonyDate('');
        setLunarDate('');
        setLocation('');
        setType('GIO');
        setIsRecurring(true);
        setPersonName('');
    };

    const handleSubmit = async () => {
        if (!title.trim() || !ceremonyDate) return;
        setSubmitting(true);
        try {
            const payload = {
                title: title.trim(),
                description: description.trim() || null,
                ceremony_date: ceremonyDate,
                lunar_date: lunarDate.trim() || null,
                location: location.trim() || null,
                type,
                is_recurring: isRecurring,
                person_name: personName.trim() || null,
            };

            if (existing) {
                await supabase.from('ceremonies').update(payload).eq('id', existing.id);
            } else {
                await supabase.from('ceremonies').insert(payload);
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
                    <Button><Plus className="mr-2 h-4 w-4" />Thêm lịch cúng</Button>
                )}
            </DialogTrigger>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>{existing ? 'Sửa lịch cúng lễ' : 'Thêm lịch cúng lễ'}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                    <div>
                        <label className="text-sm font-medium">Tiêu đề *</label>
                        <Input placeholder="VD: Giỗ Ông Nội" value={title} onChange={e => setTitle(e.target.value)} />
                    </div>
                    <div>
                        <label className="text-sm font-medium">Loại</label>
                        <select className="w-full rounded-md border px-3 py-2 text-sm bg-background" value={type} onChange={e => setType(e.target.value)}>
                            {Object.entries(typeLabels).map(([k, v]) => (
                                <option key={k} value={k}>{v.emoji} {v.label}</option>
                            ))}
                        </select>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-sm font-medium">Ngày dương lịch *</label>
                            <Input type="date" value={ceremonyDate} onChange={e => setCeremonyDate(e.target.value)} />
                        </div>
                        <div>
                            <label className="text-sm font-medium">Ngày âm lịch</label>
                            <Input placeholder="VD: 15/7 ÂL" value={lunarDate} onChange={e => setLunarDate(e.target.value)} />
                        </div>
                    </div>
                    <div>
                        <label className="text-sm font-medium">Cúng cho ai (tên người)</label>
                        <Input placeholder="VD: Phạm Văn A" value={personName} onChange={e => setPersonName(e.target.value)} />
                    </div>
                    <div>
                        <label className="text-sm font-medium">Địa điểm</label>
                        <Input placeholder="Nhà thờ họ, ..." value={location} onChange={e => setLocation(e.target.value)} />
                    </div>
                    <div>
                        <label className="text-sm font-medium">Mô tả</label>
                        <Textarea placeholder="Ghi chú thêm..." value={description} onChange={e => setDescription(e.target.value)} rows={3} />
                    </div>
                    <label className="flex items-center gap-2 text-sm">
                        <input type="checkbox" checked={isRecurring} onChange={e => setIsRecurring(e.target.checked)} className="rounded" />
                        Lặp lại hàng năm
                    </label>
                    <Button className="w-full" onClick={handleSubmit} disabled={!title.trim() || !ceremonyDate || submitting}>
                        {submitting ? 'Đang lưu...' : existing ? 'Cập nhật' : 'Thêm mới'}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}

export default function AdminCeremoniesPage() {
    const { isAdmin, loading: authLoading } = useAuth();
    const router = useRouter();
    const [ceremonies, setCeremonies] = useState<Ceremony[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    const fetchCeremonies = useCallback(async () => {
        const { data } = await supabase
            .from('ceremonies')
            .select('*')
            .order('ceremony_date', { ascending: true });
        if (data) setCeremonies(data as Ceremony[]);
        setLoading(false);
    }, []);

    useEffect(() => {
        if (!authLoading && !isAdmin) {
            router.push('/');
        }
    }, [authLoading, isAdmin, router]);

    useEffect(() => { fetchCeremonies(); }, [fetchCeremonies]);

    const handleDelete = async (id: string) => {
        if (!confirm('Bạn có chắc muốn xóa lịch cúng này?')) return;
        await supabase.from('ceremonies').delete().eq('id', id);
        fetchCeremonies();
    };

    const filtered = ceremonies.filter(c =>
        c.title.toLowerCase().includes(search.toLowerCase()) ||
        (c.person_name || '').toLowerCase().includes(search.toLowerCase()) ||
        (c.type || '').toLowerCase().includes(search.toLowerCase())
    );

    if (authLoading || !isAdmin) {
        return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                        <CalendarDays className="h-6 w-6" />Lịch cúng lễ
                    </h1>
                    <p className="text-muted-foreground">Quản lý lịch cúng giỗ, lễ tết của dòng họ</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={fetchCeremonies}><RefreshCw className="h-4 w-4 mr-2" />Làm mới</Button>
                    <CeremonyFormDialog onSaved={fetchCeremonies} />
                </div>
            </div>

            <div className="relative max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Tìm theo tên, loại..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
            </div>

            {/* Summary cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="p-4 text-center">
                        <p className="text-2xl font-bold">{ceremonies.length}</p>
                        <p className="text-xs text-muted-foreground">Tổng số</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4 text-center">
                        <p className="text-2xl font-bold">{ceremonies.filter(c => c.type === 'GIO').length}</p>
                        <p className="text-xs text-muted-foreground">Ngày giỗ</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4 text-center">
                        <p className="text-2xl font-bold">{ceremonies.filter(c => c.is_recurring).length}</p>
                        <p className="text-xs text-muted-foreground">Lặp hàng năm</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4 text-center">
                        <p className="text-2xl font-bold">
                            {ceremonies.filter(c => {
                                const d = new Date(c.ceremony_date);
                                const now = new Date();
                                return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
                            }).length}
                        </p>
                        <p className="text-xs text-muted-foreground">Trong tháng này</p>
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
                                    <TableHead>Loại</TableHead>
                                    <TableHead>Tiêu đề</TableHead>
                                    <TableHead>Ngày</TableHead>
                                    <TableHead>Âm lịch</TableHead>
                                    <TableHead>Cúng cho</TableHead>
                                    <TableHead>Địa điểm</TableHead>
                                    <TableHead>Lặp lại</TableHead>
                                    <TableHead className="text-right">Thao tác</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filtered.map(c => {
                                    const tl = typeLabels[c.type] || typeLabels.OTHER;
                                    return (
                                        <TableRow key={c.id}>
                                            <TableCell>
                                                <Badge variant="secondary" className="text-xs">{tl.emoji} {tl.label}</Badge>
                                            </TableCell>
                                            <TableCell className="font-medium">{c.title}</TableCell>
                                            <TableCell className="text-xs whitespace-nowrap">
                                                <span className="flex items-center gap-1">
                                                    <Clock className="h-3 w-3" />
                                                    {new Date(c.ceremony_date).toLocaleDateString('vi-VN')}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-xs">{c.lunar_date || '—'}</TableCell>
                                            <TableCell className="text-sm">{c.person_name || '—'}</TableCell>
                                            <TableCell className="text-xs">
                                                {c.location ? (
                                                    <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{c.location}</span>
                                                ) : '—'}
                                            </TableCell>
                                            <TableCell>
                                                {c.is_recurring ? (
                                                    <Badge variant="outline" className="text-xs">Hàng năm</Badge>
                                                ) : (
                                                    <span className="text-xs text-muted-foreground">Một lần</span>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex items-center justify-end gap-1">
                                                    <CeremonyFormDialog onSaved={fetchCeremonies} existing={c} />
                                                    <Button variant="ghost" size="icon" onClick={() => handleDelete(c.id)}>
                                                        <Trash2 className="h-4 w-4 text-destructive" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                                {filtered.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                                            Chưa có lịch cúng lễ nào
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
