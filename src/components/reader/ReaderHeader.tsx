import { ArrowLeft, List, Bookmark } from 'lucide-react';
import { Button } from '../ui/button';
import { cn } from '@/lib/utils';
import { ReaderSettings } from './ReaderSettings';
import { Link } from 'react-router-dom';
import { useReaderStore } from '@/hooks/useReaderStore';

interface ReaderHeaderProps {
    showControls: boolean;
    onToggleTOC: () => void;
}

export function ReaderHeader({ showControls, onToggleTOC }: ReaderHeaderProps) {
    const { theme } = useReaderStore();

    return (
        <div
            className={cn(
                "fixed top-0 left-0 right-0 z-50 transition-transform duration-300 ease-in-out border-b h-16 flex items-center justify-between px-4",
                showControls ? "translate-y-0" : "-translate-y-full",
                theme === 'light' ? "bg-white/90 border-gray-200 text-gray-800" :
                    theme === 'sepia' ? "bg-[#F5E6D3]/90 border-[#E8D4B9] text-[#5b4636]" :
                        theme === 'dark' ? "bg-[#333]/90 border-[#444] text-[#DADADA]" :
                            "bg-black/90 border-gray-800 text-gray-400",
                "backdrop-blur-md"
            )}
            onClick={(e) => e.stopPropagation()}
        >
            <div className="flex items-center gap-2">
                <Link to="/">
                    <Button variant="ghost" size="icon" className="hover:bg-black/5">
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                </Link>
            </div>

            <div className="flex items-center gap-1">
                <ReaderSettings />

                <Button variant="ghost" size="icon" onClick={onToggleTOC} className="hover:bg-black/5">
                    <List className="w-5 h-5" />
                </Button>

                <Button variant="ghost" size="icon" className="hover:bg-black/5">
                    <Bookmark className="w-5 h-5" />
                </Button>
            </div>
        </div>
    );
}
