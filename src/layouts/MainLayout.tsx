import React, { useState } from 'react';
import { Sidebar } from '../components/Sidebar';
import { Outlet } from 'react-router-dom';
import { Menu } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '../components/ui/sheet';
import { BottomNav } from '../components/BottomNav';

export const MainLayout: React.FC = () => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    return (
        <div className="flex h-screen w-full bg-background overflow-hidden relative">
            {/* Desktop Sidebar */}
            <div className="hidden md:block h-full shrink-0 z-30 relative">
                <Sidebar />
            </div>

            <div className="flex-1 flex flex-col h-full overflow-hidden relative min-w-0">
                {/* Mobile Header */}
                <header className="md:hidden h-14 border-b border-border flex items-center px-4 bg-background/80 backdrop-blur-md sticky top-0 z-40">
                    <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                        <SheetTrigger asChild>
                            <Button variant="ghost" size="icon" className="-ml-2">
                                <Menu size={24} />
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="left" className="p-0 w-72 bg-transparent border-none shadow-none">
                            <div className="h-full w-full rounded-r-2xl overflow-hidden shadow-2xl">
                                <Sidebar className="w-full h-full border-r-0" />
                            </div>
                        </SheetContent>
                    </Sheet>
                    <span className="font-bold text-lg ml-2">StoryReader</span>
                </header>

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
