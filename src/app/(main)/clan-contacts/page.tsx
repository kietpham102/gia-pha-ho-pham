'use client';

import { useEffect, useState, useCallback } from 'react';
import {
    Contact,
    Search,
    Phone,
    Mail,
    MapPin,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { supabase } from '@/lib/supabase';

interface ContactEntry {
    id: string;
    full_name: string;
    relation: string | null;
    phone: string | null;
    email: string | null;
    address: string | null;
    group_name: string | null;
}

const groupColors: Record<string, string> = {
    'Ban trị sự': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
    'Chi 1': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
    'Chi 2': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    'Chi 3': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
    'Hội đồng gia tộc': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
};

export default function ClanContactsPage() {
    const [contacts, setContacts] = useState<ContactEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [selectedGroup, setSelectedGroup] = useState<string | null>(null);

    const fetchContacts = useCallback(async () => {
        const { data } = await supabase
            .from('clan_contacts')
            .select('*')
            .order('full_name', { ascending: true });
        if (data) setContacts(data as ContactEntry[]);
        setLoading(false);
    }, []);

    useEffect(() => { fetchContacts(); }, [fetchContacts]);

    const groups = [...new Set(contacts.map(c => c.group_name).filter(Boolean))] as string[];

    const filtered = contacts
        .filter(c => selectedGroup ? c.group_name === selectedGroup : true)
        .filter(c =>
            c.full_name.toLowerCase().includes(search.toLowerCase()) ||
            (c.phone || '').includes(search) ||
            (c.relation || '').toLowerCase().includes(search.toLowerCase())
        );

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                    <Contact className="h-6 w-6" />Danh bạ dòng họ
                </h1>
                <p className="text-muted-foreground">Thông tin liên hệ thành viên dòng họ</p>
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

            {/* Search & group filter */}
            <div className="flex items-center gap-3 flex-wrap">
                <div className="relative max-w-sm flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Tìm theo tên, SĐT, chức vụ..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
                </div>
                <div className="flex gap-1 flex-wrap">
                    <Badge
                        variant="outline"
                        className={`cursor-pointer text-xs ${!selectedGroup ? 'ring-2 ring-primary' : ''}`}
                        onClick={() => setSelectedGroup(null)}
                    >
                        Tất cả
                    </Badge>
                    {groups.map(g => (
                        <Badge
                            key={g}
                            variant="outline"
                            className={`cursor-pointer text-xs ${selectedGroup === g ? 'ring-2 ring-primary' : ''} ${groupColors[g] || ''}`}
                            onClick={() => setSelectedGroup(selectedGroup === g ? null : g)}
                        >
                            {g}
                        </Badge>
                    ))}
                </div>
            </div>

            {/* Contact cards */}
            {loading ? (
                <div className="flex items-center justify-center h-48"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>
            ) : filtered.length === 0 ? (
                <Card>
                    <CardContent className="py-12 text-center text-muted-foreground">
                        Chưa có liên hệ nào
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {filtered.map(c => (
                        <Card key={c.id} className="hover:shadow-md transition-shadow">
                            <CardContent className="p-4 space-y-3">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <h3 className="font-semibold">{c.full_name}</h3>
                                        {c.relation && <p className="text-sm text-muted-foreground">{c.relation}</p>}
                                    </div>
                                    {c.group_name && (
                                        <Badge variant="secondary" className={`text-xs ${groupColors[c.group_name] || ''}`}>
                                            {c.group_name}
                                        </Badge>
                                    )}
                                </div>
                                <div className="space-y-1.5 text-sm">
                                    {c.phone && (
                                        <a href={`tel:${c.phone}`} className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
                                            <Phone className="h-3.5 w-3.5" />{c.phone}
                                        </a>
                                    )}
                                    {c.email && (
                                        <a href={`mailto:${c.email}`} className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
                                            <Mail className="h-3.5 w-3.5" />{c.email}
                                        </a>
                                    )}
                                    {c.address && (
                                        <p className="flex items-center gap-2 text-muted-foreground">
                                            <MapPin className="h-3.5 w-3.5 shrink-0" /><span className="line-clamp-1">{c.address}</span>
                                        </p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
