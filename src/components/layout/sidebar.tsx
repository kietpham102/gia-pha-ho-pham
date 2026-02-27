'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    Home,
    TreePine,
    Users,
    Image,
    Shield,
    FileText,
    Database,
    ChevronLeft,
    ChevronRight,
    BookOpen,
    ClipboardCheck,
    Contact,
    Newspaper,
    CalendarDays,
    GraduationCap,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet';
import { useState } from 'react';
import { useAuth } from '@/components/auth-provider';

const navItems = [
    { href: '/', label: 'Trang chủ', icon: Home },
    { href: '/feed', label: 'Bảng tin', icon: Newspaper },
    { href: '/directory', label: 'Danh bạ', icon: Contact },
    { href: '/events', label: 'Sự kiện', icon: CalendarDays },
    { href: '/ceremonies', label: 'Lịch cúng lễ', icon: CalendarDays },
    { href: '/clan-contacts', label: 'Danh bạ dòng họ', icon: Contact },
    { href: '/education-fund', label: 'Quỹ khuyến học', icon: GraduationCap },
    { href: '/tree', label: 'Cây gia phả', icon: TreePine },
    { href: '/book', label: 'Sách gia phả', icon: BookOpen },
    { href: '/people', label: 'Thành viên', icon: Users },
    { href: '/media', label: 'Thư viện', icon: Image },
];

const adminItems = [
    { href: '/admin/users', label: 'Quản lý Users', icon: Shield },
    { href: '/admin/edits', label: 'Kiểm duyệt', icon: ClipboardCheck },
    { href: '/admin/ceremonies', label: 'Lịch cúng lễ', icon: CalendarDays },
    { href: '/admin/contacts', label: 'Danh bạ dòng họ', icon: Contact },
    { href: '/admin/education-fund', label: 'Quỹ khuyến học', icon: GraduationCap },
    { href: '/admin/audit', label: 'Audit Log', icon: FileText },
    { href: '/admin/backup', label: 'Backup', icon: Database },
];

function NavList({
    pathname,
    isAdmin,
    collapsed = false,
    onItemClick,
}: {
    pathname: string;
    isAdmin: boolean;
    collapsed?: boolean;
    onItemClick?: () => void;
}) {
    return (
        <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
            {navItems.map((item) => {
                const isActive =
                    pathname === item.href ||
                    (item.href !== '/' && pathname.startsWith(item.href));
                return (
                    <Link key={item.href} href={item.href} onClick={onItemClick}>
                        <span
                            className={cn(
                                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150',
                                collapsed && 'justify-center px-2',
                                isActive
                                    ? 'bg-primary text-primary-foreground shadow-sm'
                                    : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                            )}
                        >
                            <item.icon className={cn('shrink-0', collapsed ? 'h-5 w-5' : 'h-4 w-4')} />
                            {!collapsed && item.label}
                        </span>
                    </Link>
                );
            })}

            {/* Admin section */}
            {isAdmin && (
                <>
                    {!collapsed && (
                        <div className="pt-4 pb-1">
                            <span className="px-3 text-[10px] font-bold uppercase text-sidebar-foreground/40 tracking-widest">
                                Quản trị
                            </span>
                        </div>
                    )}
                    {collapsed && <div className="border-t border-sidebar-border my-2" />}
                    {adminItems.map((item) => {
                        const isActive = pathname.startsWith(item.href);
                        return (
                            <Link key={item.href} href={item.href} onClick={onItemClick}>
                                <span
                                    className={cn(
                                        'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150',
                                        collapsed && 'justify-center px-2',
                                        isActive
                                            ? 'bg-primary text-primary-foreground shadow-sm'
                                            : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                                    )}
                                >
                                    <item.icon className={cn('shrink-0', collapsed ? 'h-5 w-5' : 'h-4 w-4')} />
                                    {!collapsed && item.label}
                                </span>
                            </Link>
                        );
                    })}
                </>
            )}
        </nav>
    );
}

function SidebarLogo({ collapsed }: { collapsed?: boolean }) {
    return (
        <div
            className={cn(
                'flex items-center gap-3 px-4 py-4 border-b border-sidebar-border',
                collapsed && 'justify-center px-2',
            )}
        >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary shrink-0 shadow-sm">
                <TreePine className="h-5 w-5 text-primary-foreground" />
            </div>
            {!collapsed && (
                <div className="min-w-0">
                    <p className="font-bold text-sm text-sidebar-foreground leading-tight">
                        Gia phả họ Phạm
                    </p>
                    <p className="text-[10px] text-sidebar-foreground/50 mt-0.5">
                        Cổng thông tin dòng họ
                    </p>
                </div>
            )}
        </div>
    );
}

function ContactInfo() {
    return (
        <div className="border-t border-sidebar-border px-4 py-3 space-y-2">
            <a
                href="https://www.facebook.com/groups/688832236255310"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-[11px] font-medium text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
            >
                <svg className="h-4 w-4 shrink-0 fill-[#1877F2]" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                <span>Nhóm Facebook</span>
            </a>
            <p className="text-[11px] text-sidebar-foreground/50 px-2">
                <span className="font-semibold text-sidebar-foreground/70">📞 Hotline Support: 0985 0011 63</span>
            </p>
        </div>
    );
}

/* ─── Mobile sidebar (Sheet drawer) ─────────────────────────── */
export function MobileSidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
    const pathname = usePathname();
    const { isAdmin } = useAuth();

    return (
        <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
            <SheetContent
                side="left"
                className="p-0 w-72 flex flex-col bg-sidebar text-sidebar-foreground border-r border-sidebar-border gap-0"
                showCloseButton={false}
            >
                <SheetTitle className="sr-only">Menu điều hướng</SheetTitle>
                <SidebarLogo />
                <NavList pathname={pathname} isAdmin={isAdmin} onItemClick={onClose} />
                <ContactInfo />
            </SheetContent>
        </Sheet>
    );
}

/* ─── Desktop sidebar (collapsible) ─────────────────────────── */
export function Sidebar() {
    const pathname = usePathname();
    const [collapsed, setCollapsed] = useState(false);
    const { isAdmin } = useAuth();

    return (
        <aside
            className={cn(
                'hidden md:flex flex-col border-r border-sidebar-border bg-sidebar transition-all duration-300 h-screen sticky top-0 shrink-0',
                collapsed ? 'w-16' : 'w-64',
            )}
        >
            <SidebarLogo collapsed={collapsed} />

            <NavList pathname={pathname} isAdmin={isAdmin} collapsed={collapsed} />

            {!collapsed && <ContactInfo />}

            {/* Collapse toggle */}
            <div className="border-t border-sidebar-border p-2">
                <Button
                    variant="ghost"
                    size="sm"
                    className="w-full text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent"
                    onClick={() => setCollapsed(!collapsed)}
                >
                    {collapsed ? (
                        <ChevronRight className="h-4 w-4" />
                    ) : (
                        <>
                            <ChevronLeft className="h-4 w-4" />
                            <span className="ml-2 text-xs">Thu gọn</span>
                        </>
                    )}
                </Button>
            </div>
        </aside>
    );
}
