'use client';

import { useState } from 'react';
import { Sidebar, MobileSidebar } from '@/components/layout/sidebar';
import { Header } from '@/components/layout/header';

export default function MainLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [mobileOpen, setMobileOpen] = useState(false);

    return (
        <div className="flex min-h-screen overflow-hidden">
            {/* Desktop sidebar — hidden on mobile */}
            <Sidebar />

            {/* Mobile sidebar drawer */}
            <MobileSidebar open={mobileOpen} onClose={() => setMobileOpen(false)} />

            {/* Main content area */}
            <div className="flex flex-1 min-w-0 flex-col">
                <Header onMenuClick={() => setMobileOpen(true)} />
                <main className="flex-1 min-w-0 overflow-auto p-4 lg:p-6">
                    {children}
                </main>
            </div>
        </div>
    );
}
