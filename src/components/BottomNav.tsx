import { NavLink } from 'react-router-dom';
import { Home, Library, History, Settings } from 'lucide-react';
import { cn } from '../lib/utils';
import { useLocation } from 'react-router-dom';

export function BottomNav() {
    const location = useLocation();

    const navItems = [
        { icon: Home, label: 'Home', path: '/' },
        { icon: Library, label: 'Library', path: '/library' },
        { icon: History, label: 'History', path: '/history' },
        { icon: Settings, label: 'Settings', path: '/settings' },
    ];

    return (
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-t border-border/50 pb-safe">
            <nav className="flex items-center justify-around h-16">
                {navItems.map((item) => {
                    const isActive = location.pathname === item.path;
                    return (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={cn(
                                "flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors relative min-h-[44px]",
                                isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            <item.icon size={20} className={cn("transition-all", isActive && "scale-110")} />
                            <span className="text-[10px] font-medium">{item.label}</span>
                            {isActive && (
                                <span className="absolute top-0 w-8 h-0.5 bg-primary rounded-b-md" />
                            )}
                        </NavLink>
                    );
                })}
            </nav>
        </div>
    );
}
