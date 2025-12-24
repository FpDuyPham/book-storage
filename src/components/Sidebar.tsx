import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Home, Heart, Clock, Settings, ChevronLeft, ChevronRight, Book } from 'lucide-react';
import { Button } from './ui/button';
import { cn } from '../lib/utils';
import { useLocation, useNavigate } from 'react-router-dom';

interface SidebarProps {
    className?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ className }) => {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();

    const navItems = [
        { icon: Home, label: 'Home', path: '/' },
        { icon: Heart, label: 'Favorites', path: '/favorites' },
        { icon: Clock, label: 'History', path: '/history' },
        { icon: Settings, label: 'Settings', path: '/settings' },
    ];

    return (
        <motion.div
            initial={{ width: 240 }}
            animate={{ width: isCollapsed ? 80 : 240 }}
            className={cn(
                "h-screen bg-card border-r border-border flex flex-col relative z-20 transition-all duration-300",
                className
            )}
        >
            {/* Header */}
            <div className="p-6 flex items-center gap-3 overflow-hidden whitespace-nowrap">
                <div className="min-w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                    <Book size={20} />
                </div>
                {!isCollapsed && (
                    <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="font-bold text-lg tracking-tight"
                    >
                        StoryReader
                    </motion.span>
                )}
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 space-y-2 py-4">
                {navItems.map((item) => {
                    const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
                    return (
                        <Button
                            key={item.path}
                            variant={isActive ? "secondary" : "ghost"}
                            className={cn(
                                "w-full justify-start gap-3 h-12 mb-1",
                                isCollapsed ? "px-2 justify-center" : "px-4"
                            )}
                            onClick={() => navigate(item.path)}
                        >
                            <item.icon size={20} className={cn(isActive ? "text-primary" : "text-muted-foreground")} />
                            {!isCollapsed && (
                                <span className={cn("text-base", isActive && "font-medium")}>
                                    {item.label}
                                </span>
                            )}
                        </Button>
                    );
                })}
            </nav>

            {/* Collapse Toggle */}
            <div className="p-4 border-t border-border">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="w-full h-10 flex items-center justify-center hover:bg-muted"
                >
                    {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
                </Button>
            </div>
        </motion.div>
    );
};
