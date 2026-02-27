'use client';

import { useEffect, useState, useCallback } from 'react';
import {
    GraduationCap,
    Search,
    TrendingUp,
    TrendingDown,
    DollarSign,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
    transaction_date: string;
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

export default function EducationFundPage() {
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

    useEffect(() => { fetchTransactions(); }, [fetchTransactions]);

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

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                    <GraduationCap className="h-6 w-6" />Quỹ khuyến học
                </h1>
                <p className="text-muted-foreground">Thông tin thu chi quỹ khuyến học dòng họ</p>
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
                            <GraduationCap className="h-4 w-4" />Giao dịch
                        </div>
                        <p className="text-2xl font-bold">{transactions.length}</p>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-4 flex-wrap">
                <Tabs value={tab} onValueChange={setTab}>
                    <TabsList>
                        <TabsTrigger value="all">Tất cả</TabsTrigger>
                        <TabsTrigger value="INCOME">Thu</TabsTrigger>
                        <TabsTrigger value="EXPENSE">Chi</TabsTrigger>
                    </TabsList>
                </Tabs>
                <div className="relative max-w-sm flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Tìm giao dịch..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
                </div>
            </div>

            {/* Transaction table */}
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
                                        </TableRow>
                                    );
                                })}
                                {filtered.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
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
