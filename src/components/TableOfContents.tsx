
import { useState, useMemo, useEffect } from 'react';
import { BookOpen, Search, Play, Check, AudioLines } from 'lucide-react';
import {
    SheetContent,
    SheetHeader,
    SheetTitle,
} from "./ui/sheet"
import { Input } from "./ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "./ui/select";
import { ScrollArea } from "./ui/scroll-area";

export interface Chapter {
    id: string;
    href: string;
    label: string;
    subitems?: Chapter[];
}

interface TableOfContentsProps {
    toc: Chapter[];
    currentChapterHref?: string;
    onSelectChapter: (href: string) => void;
}

export function TableOfContents({ toc, currentChapterHref, onSelectChapter }: TableOfContentsProps) {
    const [searchQuery, setSearchQuery] = useState("");
    const [range, setRange] = useState<string>("0-50");

    // Flatten logic
    const flattenedChapters = useMemo(() => {
        const flat: Chapter[] = [];
        const traverse = (items: Chapter[]) => {
            for (const item of items) {
                flat.push(item);
                if (item.subitems) traverse(item.subitems);
            }
        };
        traverse(toc);
        return flat;
    }, [toc]);

    // Current Chapter Index logic
    const currentIndex = useMemo(() => {
        return flattenedChapters.findIndex(c => currentChapterHref && c.href && currentChapterHref.includes(c.href));
    }, [flattenedChapters, currentChapterHref]);

    // Range Options
    const ranges = useMemo(() => {
        const opts = [];
        const total = flattenedChapters.length;
        const step = 50;
        for (let i = 0; i < total; i += step) {
            opts.push(`${i}-${Math.min(i + step, total)}`);
        }
        return opts;
    }, [flattenedChapters.length]);

    // Filter Logic
    const filteredChapters = useMemo(() => {
        // If searching, ignore range
        if (searchQuery.trim()) {
            return flattenedChapters.filter(c =>
                c.label.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        // Otherwise use range
        const [start, end] = range.split('-').map(Number);
        return flattenedChapters.slice(start, end);

    }, [flattenedChapters, searchQuery, range]);

    // Auto-update range to show current chapter on load
    useEffect(() => {
        if (currentIndex !== -1 && !searchQuery) {
            // Find which range contains currentIndex
            const step = 50;
            const start = Math.floor(currentIndex / step) * step;
            const end = Math.min(start + step, flattenedChapters.length);
            setRange(`${start}-${end}`);
        }
    }, [currentIndex, flattenedChapters.length]); // Only run when currentIndex changes significantly or first load


    return (
        <SheetContent side="left" className="w-[350px] sm:w-[500px] p-0 flex flex-col border-r-0 bg-transparent shadow-none">
            {/* Main Container - The "Glass" Card */}
            <div className="h-full w-full bg-background/80 backdrop-blur-md flex flex-col border-r">

                {/* Header */}
                <div className="sticky top-0 z-10 p-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 space-y-4">
                    <SheetHeader>
                        <SheetTitle className="flex items-center gap-2">
                            <BookOpen className="w-5 h-5 text-primary" />
                            <span>Playlist</span>
                            <span className="text-xs font-normal text-muted-foreground ml-auto">
                                {flattenedChapters.length} Chapters
                            </span>
                        </SheetTitle>
                    </SheetHeader>

                    <div className="flex gap-2">
                        <div className="relative flex-1">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search chapters..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-8 h-9"
                            />
                        </div>
                        {!searchQuery && ranges.length > 1 && (
                            <Select value={range} onValueChange={setRange}>
                                <SelectTrigger className="w-[110px] h-9">
                                    <SelectValue placeholder="Range" />
                                </SelectTrigger>
                                <SelectContent>
                                    {ranges.map(r => (
                                        <SelectItem key={r} value={r}>
                                            Ch. {r.replace('-', ' - ')}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
                    </div>
                </div>

                {/* List Container */}
                <ScrollArea className="flex-1 pb-36"> {/* pb-36 for player clearance */}
                    <div className="p-4 max-w-3xl mx-auto">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {filteredChapters.map((chapter) => {
                                // Calculate actual index in full list for read status check
                                const realIndex = flattenedChapters.indexOf(chapter);
                                const isCurrent = realIndex === currentIndex;
                                const isRead = realIndex < currentIndex;

                                return (
                                    <div
                                        key={chapter.id}
                                        onClick={() => onSelectChapter(chapter.href)}
                                        className={`
                                            group relative flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all duration-200
                                            ${isCurrent
                                                ? 'bg-primary/10 border-primary shadow-sm'
                                                : 'border-transparent hover:bg-accent hover:border-border/50'
                                            }
                                        `}
                                    >
                                        {/* Icon State */}
                                        <div className="w-8 h-8 flex items-center justify-center shrink-0 text-muted-foreground">
                                            {/* Play button on hover */}
                                            <div className="absolute opacity-0 group-hover:opacity-100 transition-opacity scale-90 group-hover:scale-100 text-primary">
                                                <Play fill="currentColor" size={20} />
                                            </div>

                                            {/* Default State Icons (hidden on hover) */}
                                            <div className="group-hover:opacity-0 transition-opacity">
                                                {isCurrent ? (
                                                    <AudioLines className="w-5 h-5 text-primary animate-pulse" />
                                                ) : isRead ? (
                                                    <Check className="w-4 h-4 text-green-500/70" />
                                                ) : (
                                                    <span className="text-xs font-mono opacity-50">#</span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Text Info */}
                                        <div className="flex-1 min-w-0">
                                            <p className={`text-sm font-medium truncate ${isRead && !isCurrent ? 'opacity-70' : ''}`}>
                                                {chapter.label.trim()}
                                            </p>
                                            <p className="text-xs text-muted-foreground truncate">
                                                Chapter {realIndex + 1}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {filteredChapters.length === 0 && (
                            <div className="text-center py-10 text-muted-foreground">
                                <p>No chapters found</p>
                            </div>
                        )}
                    </div>
                </ScrollArea>
            </div>
        </SheetContent>
    );
}
