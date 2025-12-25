import { Sidebar } from '../components/Sidebar';
import { Outlet } from 'react-router-dom';
import { BottomNav } from '../components/BottomNav';

export const MainLayout: React.FC = () => {

    return (
        <div className="flex h-screen w-full bg-background overflow-hidden relative">
            {/* Desktop Sidebar */}
            <div className="hidden md:block h-full shrink-0 z-30 relative">
                <Sidebar />
            </div>

            <div className="flex-1 flex flex-col h-full overflow-hidden relative min-w-0">
                {/* Content Area */}

                <main className="flex-1 overflow-auto w-full relative pb-20 md:pb-0">
                    <Outlet />
                </main>
            </div>

            <div className="md:hidden">
                <BottomNav />
            </div>
        </div>
    );
};
