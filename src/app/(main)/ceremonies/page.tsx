'use client';

import { useEffect, useState, useCallback } from 'react';
import {
    CalendarDays,
    Search,
    Clock,
    MapPin,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
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
    person_name: string | null;
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

export default function CeremoniesPage() {
    const [ceremonies, setCeremonies] = useState<Ceremony[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filterType, setFilterType] = useState('all');

    const fetchCeremonies = useCallback(async () => {
        const { data } = await supabase
            .from('ceremonies')
            .select('*')
            .order('ceremony_date', { ascending: true });
        if (data) setCeremonies(data as Ceremony[]);
        setLoading(false);
    }, []);

    useEffect(() => { fetchCeremonies(); }, [fetchCeremonies]);

    const now = new Date();
    const upcoming = ceremonies.filter(c => new Date(c.ceremony_date) >= now);
    const past = ceremonies.filter(c => new Date(c.ceremony_date) < now);

    const filtered = (filterType === 'upcoming' ? upcoming : filterType === 'past' ? past : ceremonies)
        .filter(c =>
            c.title.toLowerCase().includes(search.toLowerCase()) ||
            (c.person_name || '').toLowerCase().includes(search.toLowerCase())
        );

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                    <CalendarDays className="h-6 w-6" />Lịch cúng lễ
                </h1>
                <p className="text-muted-foreground">Lịch cúng giỗ, lễ tết của dòng họ</p>
            </div>

            {/* Summary */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="cursor-pointer hover:ring-2 hover:ring-primary/50 transition-all" onClick={() => setFilterType('all')}>
                    <CardContent className="p-4 text-center">
                        <p className="text-2xl font-bold">{ceremonies.length}</p>
                        <p className="text-xs text-muted-foreground">Tổng số</p>
                    </CardContent>
                </Card>
                <Card className="cursor-pointer hover:ring-2 hover:ring-primary/50 transition-all" onClick={() => setFilterType('upcoming')}>
                    <CardContent className="p-4 text-center">
                        <p className="text-2xl font-bold text-primary">{upcoming.length}</p>
                        <p className="text-xs text-muted-foreground">Sắp tới</p>
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
                        <p className="text-2xl font-bold">
                            {ceremonies.filter(c => {
                                const d = new Date(c.ceremony_date);
                                return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
                            }).length}
                        </p>
                        <p className="text-xs text-muted-foreground">Trong tháng</p>
                    </CardContent>
                </Card>
            </div>

            {/* Search & filter */}
            <div className="flex items-center gap-3 flex-wrap">
                <div className="relative max-w-sm flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Tìm theo tên, người được cúng..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
                </div>
                <div className="flex gap-1">
                    {Object.entries(typeLabels).map(([k, v]) => (
                        <Badge
                            key={k}
                            variant="outline"
                            className={`cursor-pointer text-xs ${filterType === k ? 'ring-2 ring-primary' : ''}`}
                            onClick={() => setFilterType(filterType === k ? 'all' : k)}
                        >
                            {v.emoji} {v.label}
                        </Badge>
                    ))}
                </div>
            </div>

            {/* Ceremony cards */}
            {loading ? (
                <div className="flex items-center justify-center h-48"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>
            ) : filtered.length === 0 ? (
                <Card>
                    <CardContent className="py-12 text-center text-muted-foreground">
                        Chưa có lịch cúng lễ nào
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {(filterType !== 'all' && filterType !== 'upcoming' && filterType !== 'past'
                        ? filtered.filter(c => c.type === filterType)
                        : filtered
                    ).map(c => {
                        const tl = typeLabels[c.type] || typeLabels.OTHER;
                        const isUpcoming = new Date(c.ceremony_date) >= now;
                        return (
                            <Card key={c.id} className={`transition-all ${isUpcoming ? 'border-primary/30 shadow-sm' : ''}`}>
                                <CardContent className="p-4 space-y-3">
                                    <div className="flex items-start justify-between">
                                        <Badge variant="secondary" className="text-xs">{tl.emoji} {tl.label}</Badge>
                                        {c.is_recurring && <Badge variant="outline" className="text-xs">🔄 Hàng năm</Badge>}
                                    </div>
                                    <h3 className="font-semibold text-lg">{c.title}</h3>
                                    {c.person_name && (
                                        <p className="text-sm text-muted-foreground">Cúng cho: <span className="font-medium text-foreground">{c.person_name}</span></p>
                                    )}
                                    <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                                        <span className="flex items-center gap-1">
                                            <Clock className="h-3 w-3" />
                                            {new Date(c.ceremony_date).toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                                        </span>
                                        {c.lunar_date && <span>📅 {c.lunar_date}</span>}
                                        {c.location && (
                                            <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{c.location}</span>
                                        )}
                                    </div>
                                    {c.description && <p className="text-sm text-muted-foreground line-clamp-2">{c.description}</p>}
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
