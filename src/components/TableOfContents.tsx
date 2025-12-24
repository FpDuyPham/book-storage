
import { BookOpen } from 'lucide-react';
import {
    SheetContent,
    SheetHeader,
    SheetTitle,
} from "./ui/sheet"

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
    const renderChapter = (chapter: Chapter, depth = 0) => {
        const label = chapter.label.trim();
        const isActive = currentChapterHref && chapter.href && currentChapterHref.includes(chapter.href);

        return (
            <div key={chapter.id} className="w-full">
                <button
                    onClick={() => onSelectChapter(chapter.href)}
                    className={`w-full text-left py-3 px-4 hover:bg-muted/50 transition-colors border-b border-border/40 flex items-center justify-between group ${isActive ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:text-foreground'}`}
                    style={{ paddingLeft: `${depth * 1.5 + 1.5}rem` }}
                >
                    <span className="truncate pr-4 text-sm font-medium transition-transform group-hover:translate-x-1">{label}</span>
                    {isActive && <div className="w-1.5 h-1.5 rounded-full bg-primary shadow-sm" />}
                </button>
                {chapter.subitems && chapter.subitems.length > 0 && (
                    <div className="bg-muted/20">
                        {chapter.subitems.map(sub => renderChapter(sub, depth + 1))}
                    </div>
                )}
            </div>
        );
    };

    return (
        <SheetContent side="left" className="w-[300px] sm:w-[350px] p-0 flex flex-col">
            <SheetHeader className="p-6 border-b">
                <SheetTitle className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5" /> Contents
                </SheetTitle>
            </SheetHeader>

            <div className="flex-1 overflow-y-auto">
                {toc.length > 0 ? (
                    <div>
                        {toc.map(chapter => renderChapter(chapter))}
                    </div>
                ) : (
                    <div className="p-10 text-center text-muted-foreground flex flex-col items-center">
                        <BookOpen size={40} className="opacity-20 mb-4" />
                        <p className="italic">No table of contents found.</p>
                    </div>
                )}
            </div>
        </SheetContent>
    );
}
