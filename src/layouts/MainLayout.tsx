import React from 'react';
import { Sidebar } from '../components/Sidebar';
import { Outlet } from 'react-router-dom';

import { BottomNav } from '../components/BottomNav';

export const MainLayout: React.FC = () => {
    return (
        <div className="flex h-screen w-full bg-background overflow-hidden flex-col md:flex-row">
            <div className="hidden md:block h-full">
                <Sidebar />
            </div>
            <main className="flex-1 overflow-auto w-full relative pb-20 md:pb-0">
                <Outlet />
            </main>
            <BottomNav />
        </div>
    );
};
