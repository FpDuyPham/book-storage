import React from 'react';
import { Sidebar } from '../components/Sidebar';
import { Outlet } from 'react-router-dom';

export const MainLayout: React.FC = () => {
    return (
        <div className="flex h-screen w-full bg-background overflow-hidden">
            <Sidebar />
            <main className="flex-1 overflow-auto w-full relative">
                <Outlet />
            </main>
        </div>
    );
};
