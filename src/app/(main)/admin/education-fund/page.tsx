'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
    GraduationCap,
    Plus,
    Trash2,
    Edit2,
    Search,
    RefreshCw,
    TrendingUp,
    TrendingDown,
    DollarSign,
    Users,
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
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/components/auth-provider';
import { supabase } from '@/lib/supabase';

interface FundTransaction {
    id: string;
    type: 'INCOME' | 'EXPENSE';
    amount: number;
    description: string;
    contributor_name: string | null;
    recipient_name: string | null;
    category: string;
    academic_year: string | null;
    receipt_note: string | null;
    transaction_date: string;
    created_at: string;
}

const categoryLabels: Record<string, { label: string; emoji: string }> = {
    DONATION: { label: 'Đóng góp', emoji: '💰' },
    SCHOLARSHIP: { label: 'Học bổng', emoji: '🎓' },
    AWARD: { label: 'Giải thưởng', emoji: '🏆' },
    SUPPLY: { label: 'Mua sắm vật tư', emoji: '📦' },
    EVENT: { label: 'Tổ chức sự kiện', emoji: '🎉' },
    OTHER: { label: 'Khác', emoji: '📋' },
};

function formatCurrency(amount: number) {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
}

function TransactionFormDialog({
    onSaved,
    existing,
}: {
    onSaved: () => void;
    existing?: FundTransaction | null;
}) {
    const [open, setOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [type, setType] = useState<'INCOME' | 'EXPENSE'>('INCOME');
    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('');
    const [contributorName, setContributorName] = useState('');
    const [recipientName, setRecipientName] = useState('');
    const [category, setCategory] = useState('DONATION');
    const [academicYear, setAcademicYear] = useState('');
    const [receiptNote, setReceiptNote] = useState('');
    const [transactionDate, setTransactionDate] = useState(new Date().toISOString().split('T')[0]);

    useEffect(() => {
        if (existing && open) {
            setType(existing.type);
            setAmount(String(existing.amount));
            setDescription(existing.description);
            setContributorName(existing.contributor_name || '');
            setRecipientName(existing.recipient_name || '');
            setCategory(existing.category);
            setAcademicYear(existing.academic_year || '');
            setReceiptNote(existing.receipt_note || '');
            setTransactionDate(existing.transaction_date?.split('T')[0] || '');
        }
    }, [existing, open]);

    const resetForm = () => {
        setType('INCOME'); setAmount(''); setDescription(''); setContributorName('');
        setRecipientName(''); setCategory('DONATION'); setAcademicYear(''); setReceiptNote('');
        setTransactionDate(new Date().toISOString().split('T')[0]);
    };

    const handleSubmit = async () => {
        if (!description.trim() || !amount || Number(amount) <= 0) return;
        setSubmitting(true);
        try {
            const payload = {
                type,
                amount: Number(amount),
                description: description.trim(),
                contributor_name: contributorName.trim() || null,
                recipient_name: recipientName.trim() || null,
                category,
                academic_year: academicYear.trim() || null,
                receipt_note: receiptNote.trim() || null,
                transaction_date: transactionDate,
            };

            if (existing) {
                await supabase.from('education_fund').update(payload).eq('id', existing.id);
            } else {
                await supabase.from('education_fund').insert(payload);
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
                    <Button><Plus className="mr-2 h-4 w-4" />Thêm giao dịch</Button>
                )}
            </DialogTrigger>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>{existing ? 'Sửa giao dịch' : 'Thêm giao dịch mới'}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                    <div className="flex gap-2">
                        <Button
                            type="button"
                            variant={type === 'INCOME' ? 'default' : 'outline'}
                            className="flex-1"
                            onClick={() => { setType('INCOME'); setCategory('DONATION'); }}
                        >
                            <TrendingUp className="h-4 w-4 mr-2" />Thu
                        </Button>
                        <Button
                            type="button"
                            variant={type === 'EXPENSE' ? 'default' : 'outline'}
                            className="flex-1"
                            onClick={() => { setType('EXPENSE'); setCategory('SCHOLARSHIP'); }}
                        >
                            <TrendingDown className="h-4 w-4 mr-2" />Chi
                        </Button>
                    </div>
                    <div>
                        <label className="text-sm font-medium">Số tiền (VNĐ) *</label>
                        <Input type="number" placeholder="500000" value={amount} onChange={e => setAmount(e.target.value)} min={0} />
                    </div>
                    <div>
                        <label className="text-sm font-medium">Danh mục</label>
                        <select className="w-full rounded-md border px-3 py-2 text-sm bg-background" value={category} onChange={e => setCategory(e.target.value)}>
                            {Object.entries(categoryLabels).map(([k, v]) => (
                                <option key={k} value={k}>{v.emoji} {v.label}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="text-sm font-medium">Mô tả *</label>
                        <Input placeholder="Nội dung giao dịch" value={description} onChange={e => setDescription(e.target.value)} />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-sm font-medium">{type === 'INCOME' ? 'Người đóng góp' : 'Người nhận'}</label>
                            <Input
                                placeholder="Họ tên"
                                value={type === 'INCOME' ? contributorName : recipientName}
                                onChange={e => type === 'INCOME' ? setContributorName(e.target.value) : setRecipientName(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium">Năm học</label>
                            <Input placeholder="2025-2026" value={academicYear} onChange={e => setAcademicYear(e.target.value)} />
                        </div>
                    </div>
                    <div>
                        <label className="text-sm font-medium">Ngày giao dịch</label>
                        <Input type="date" value={transactionDate} onChange={e => setTransactionDate(e.target.value)} />
                    </div>
                    <div>
                        <label className="text-sm font-medium">Ghi chú / Biên nhận</label>
                        <Textarea placeholder="Ghi chú thêm..." value={receiptNote} onChange={e => setReceiptNote(e.target.value)} rows={2} />
                    </div>
                    <Button className="w-full" onClick={handleSubmit} disabled={!description.trim() || !amount || Number(amount) <= 0 || submitting}>
                        {submitting ? 'Đang lưu...' : existing ? 'Cập nhật' : 'Thêm mới'}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}

export default function AdminEducationFundPage() {
    const { isAdmin, loading: authLoading } = useAuth();
    const router = useRouter();
    const [transactions, setTransactions] = useState<FundTransaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [tab, setTab] = useState('all');

    const fetchTransactions = useCallback(async () => {
        const { data } = await supabase
            .from('education_fund')
            .select('*')
            .order('transaction_date', { ascending: false });
        if (data) setTransactions(data as FundTransaction[]);
        setLoading(false);
    }, []);

    useEffect(() => {
        if (!authLoading && !isAdmin) {
            router.push('/');
        }
    }, [authLoading, isAdmin, router]);

    useEffect(() => { fetchTransactions(); }, [fetchTransactions]);

    const handleDelete = async (id: string) => {
        if (!confirm('Bạn có chắc muốn xóa giao dịch này?')) return;
        await supabase.from('education_fund').delete().eq('id', id);
        fetchTransactions();
    };

    const totalIncome = transactions.filter(t => t.type === 'INCOME').reduce((s, t) => s + t.amount, 0);
    const totalExpense = transactions.filter(t => t.type === 'EXPENSE').reduce((s, t) => s + t.amount, 0);
    const balance = totalIncome - totalExpense;

    const filtered = transactions
        .filter(t => tab === 'all' || t.type === tab)
        .filter(t =>
            t.description.toLowerCase().includes(search.toLowerCase()) ||
            (t.contributor_name || '').toLowerCase().includes(search.toLowerCase()) ||
            (t.recipient_name || '').toLowerCase().includes(search.toLowerCase())
        );

    const exportCSV = () => {
        const headers = ['Ngày', 'Loại', 'Danh mục', 'Mô tả', 'Số tiền', 'Người đóng góp', 'Người nhận', 'Năm học', 'Ghi chú'];
        const rows = transactions.map(t => [
            new Date(t.transaction_date).toLocaleDateString('vi-VN'),
            t.type === 'INCOME' ? 'Thu' : 'Chi',
            categoryLabels[t.category]?.label || t.category,
            t.description,
            String(t.amount),
            t.contributor_name || '',
            t.recipient_name || '',
            t.academic_year || '',
            t.receipt_note || '',
        ]);
        const csv = [headers, ...rows].map(r => r.map(v => `"${v.replace(/"/g, '""')}"`).join(',')).join('\n');
        const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `quy-khuyen-hoc-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    if (authLoading || !isAdmin) {
        return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                        <GraduationCap className="h-6 w-6" />Quỹ khuyến học
                    </h1>
                    <p className="text-muted-foreground">Quản lý thu chi quỹ khuyến học dòng họ</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={exportCSV}><Download className="h-4 w-4 mr-2" />Xuất CSV</Button>
                    <Button variant="outline" onClick={fetchTransactions}><RefreshCw className="h-4 w-4 mr-2" />Làm mới</Button>
                    <TransactionFormDialog onSaved={fetchTransactions} />
                </div>
            </div>

            {/* Summary cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                            <DollarSign className="h-4 w-4" />Số dư hiện tại
                        </div>
                        <p className={`text-2xl font-bold ${balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {formatCurrency(balance)}
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                            <TrendingUp className="h-4 w-4 text-green-600" />Tổng thu
                        </div>
                        <p className="text-2xl font-bold text-green-600">{formatCurrency(totalIncome)}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                            <TrendingDown className="h-4 w-4 text-red-600" />Tổng chi
                        </div>
                        <p className="text-2xl font-bold text-red-600">{formatCurrency(totalExpense)}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                            <Users className="h-4 w-4" />Giao dịch
                        </div>
                        <p className="text-2xl font-bold">{transactions.length}</p>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-4">
                <Tabs value={tab} onValueChange={setTab} className="flex-1">
                    <TabsList>
                        <TabsTrigger value="all">Tất cả</TabsTrigger>
                        <TabsTrigger value="INCOME">Thu</TabsTrigger>
                        <TabsTrigger value="EXPENSE">Chi</TabsTrigger>
                    </TabsList>
                </Tabs>
                <div className="relative max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Tìm giao dịch..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
                </div>
            </div>

            <Card>
                <CardContent className="p-0">
                    {loading ? (
                        <div className="flex items-center justify-center h-48"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Ngày</TableHead>
                                    <TableHead>Loại</TableHead>
                                    <TableHead>Danh mục</TableHead>
                                    <TableHead>Mô tả</TableHead>
                                    <TableHead>Người liên quan</TableHead>
                                    <TableHead className="text-right">Số tiền</TableHead>
                                    <TableHead className="text-right">Thao tác</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filtered.map(t => {
                                    const cl = categoryLabels[t.category] || categoryLabels.OTHER;
                                    return (
                                        <TableRow key={t.id}>
                                            <TableCell className="text-xs whitespace-nowrap">
                                                {new Date(t.transaction_date).toLocaleDateString('vi-VN')}
                                            </TableCell>
                                            <TableCell>
                                                {t.type === 'INCOME' ? (
                                                    <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 text-xs">
                                                        <TrendingUp className="h-3 w-3 mr-1" />Thu
                                                    </Badge>
                                                ) : (
                                                    <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300 text-xs">
                                                        <TrendingDown className="h-3 w-3 mr-1" />Chi
                                                    </Badge>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="secondary" className="text-xs">{cl.emoji} {cl.label}</Badge>
                                            </TableCell>
                                            <TableCell className="max-w-50 truncate">{t.description}</TableCell>
                                            <TableCell className="text-sm">
                                                {t.contributor_name || t.recipient_name || '—'}
                                            </TableCell>
                                            <TableCell className={`text-right font-mono font-medium ${t.type === 'INCOME' ? 'text-green-600' : 'text-red-600'}`}>
                                                {t.type === 'INCOME' ? '+' : '-'}{formatCurrency(t.amount)}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex items-center justify-end gap-1">
                                                    <TransactionFormDialog onSaved={fetchTransactions} existing={t} />
                                                    <Button variant="ghost" size="icon" onClick={() => handleDelete(t.id)}>
                                                        <Trash2 className="h-4 w-4 text-destructive" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                                {filtered.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                                            Chưa có giao dịch nào
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
