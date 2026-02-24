'use client';

import { Moon, Sun, LogOut, User, LogIn, Menu } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { NotificationBell } from '@/components/notification-bell';
import { useAuth } from '@/components/auth-provider';

export function Header({ onMenuClick }: { onMenuClick?: () => void }) {
    const { theme, setTheme } = useTheme();
    const { isLoggedIn, profile, isAdmin, signOut } = useAuth();
    const router = useRouter();

    const initials = profile?.display_name
        ? profile.display_name.split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 2)
        : profile?.email?.slice(0, 2).toUpperCase() || '?';

    const handleSignOut = async () => {
        await signOut();
        router.push('/login');
    };

    return (
        <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-border bg-card/90 backdrop-blur-sm px-3 lg:px-6 gap-2">
            {/* Left side */}
            <div className="flex items-center gap-2 min-w-0">
                {/* Mobile hamburger — only on small screens */}
                <Button
                    variant="ghost"
                    size="icon"
                    className="md:hidden shrink-0 text-foreground/70 hover:text-foreground"
                    onClick={onMenuClick}
                    aria-label="Mở menu điều hướng"
                >
                    <Menu className="h-5 w-5" />
                </Button>

                {/* Title — visible on mobile (sidebar is hidden) */}
                <span className="text-sm font-semibold text-foreground md:hidden truncate">
                    Gia phả họ Phạm
                </span>

                {/* Breadcrumb label — desktop only */}
                <span className="hidden md:block text-sm text-muted-foreground">
                    Dòng họ Phạm
                </span>
            </div>

            {/* Right side */}
            <div className="flex items-center gap-1 shrink-0">
                {/* Theme toggle */}
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                    aria-label="Chuyển giao diện"
                    className="text-foreground/70 hover:text-foreground"
                >
                    <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                    <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                </Button>

                {/* Notifications */}
                <NotificationBell />

                {isLoggedIn ? (
                    /* User menu (logged in) */
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="relative h-8 w-8 rounded-full ml-1">
                                <Avatar className="h-8 w-8">
                                    <AvatarFallback className="bg-primary text-primary-foreground text-xs font-semibold">
                                        {initials}
                                    </AvatarFallback>
                                </Avatar>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-56" align="end" forceMount>
                            <DropdownMenuLabel className="font-normal">
                                <div className="flex flex-col space-y-1">
                                    <p className="text-sm font-semibold leading-none">
                                        {profile?.display_name || 'Thành viên'}
                                    </p>
                                    <p className="text-xs leading-none text-muted-foreground mt-1">
                                        {profile?.email}
                                    </p>
                                    {isAdmin && (
                                        <span className="text-[10px] font-semibold text-primary-foreground bg-primary rounded-md px-1.5 py-0.5 w-fit mt-1.5">
                                            Quản trị viên
                                        </span>
                                    )}
                                </div>
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>
                                <User className="mr-2 h-4 w-4" />
                                Hồ sơ cá nhân
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                className="text-destructive focus:text-destructive"
                                onClick={handleSignOut}
                            >
                                <LogOut className="mr-2 h-4 w-4" />
                                Đăng xuất
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                ) : (
                    /* Login button (not logged in) */
                    <Button
                        variant="default"
                        size="sm"
                        onClick={() => router.push('/login')}
                        className="ml-1"
                    >
                        <LogIn className="h-4 w-4 mr-1.5" />
                        <span className="hidden sm:inline">Đăng nhập</span>
                    </Button>
                )}
            </div>
        </header>
    );
}
