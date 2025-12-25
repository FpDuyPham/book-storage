import React from 'react';
import { LayoutDashboard, BookOpen, Settings, LogOut, CreditCard, User } from 'lucide-react';
import { Button } from './ui/button';
import { cn } from '../lib/utils';
import { useLocation, useNavigate } from 'react-router-dom';
import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from "./ui/avatar"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "./ui/dropdown-menu"

interface SidebarProps {
    className?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ className }) => {
    const location = useLocation();
    const navigate = useNavigate();

    const navItems = [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
        { icon: BookOpen, label: 'My Library', path: '/library' },
        { icon: Settings, label: 'Settings', path: '/settings' },
    ];

    return (
        <div className={cn(
            "w-64 h-full flex flex-col border-r border-border bg-background/80 backdrop-blur-xl",
            className
        )}>
            {/* Logo Section */}
            <div className="h-14 flex items-center px-6 border-b border-border/40">
                <span className="font-bold text-lg tracking-tight flex items-center gap-2">
                    <span className="w-6 h-6 rounded bg-primary text-primary-foreground flex items-center justify-center text-xs">SR</span>
                    StoryReader
                </span>
            </div>

            {/* Navigation */}
            <div className="flex-1 py-6 px-3 space-y-1">
                {navItems.map((item) => {
                    const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
                    return (
                        <Button
                            key={item.path}
                            variant="ghost"
                            className={cn(
                                "w-full justify-start gap-3 h-10 px-3 font-medium transition-all duration-200",
                                isActive
                                    ? "bg-blue-500/10 text-blue-600 hover:bg-blue-500/20 hover:text-blue-700"
                                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                            )}
                            onClick={() => navigate(item.path)}
                        >
                            <item.icon size={18} />
                            <span className="text-sm">{item.label}</span>
                        </Button>
                    );
                })}
            </div>

            {/* User Profile Section */}
            <div className="p-4 border-t border-border mt-auto">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="w-full h-auto p-2 flex items-center gap-3 hover:bg-accent/50 rounded-xl justify-start">
                            <Avatar className="h-9 w-9 border border-border">
                                <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
                                <AvatarFallback>CN</AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col items-start overflow-hidden">
                                <span className="text-sm font-semibold truncate w-full text-left">User Name</span>
                                <span className="text-xs text-muted-foreground truncate w-full text-left">Free Plan</span>
                            </div>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56 mb-2">
                        <DropdownMenuLabel>My Account</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                            <User className="mr-2 h-4 w-4" />
                            <span>Profile</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                            <CreditCard className="mr-2 h-4 w-4" />
                            <span>Billing</span>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-600 focus:text-red-600 focus:bg-red-50">
                            <LogOut className="mr-2 h-4 w-4" />
                            <span>Log out</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </div>
    );
};
