import { ReactNode, useState } from 'react';
import { useReaderStore } from '@/hooks/useReaderStore';
import { cn } from '@/lib/utils';
import { ReaderHeader } from './ReaderHeader';
import { ReaderFooter } from './ReaderFooter';
import { Sheet, SheetContent, SheetTitle } from '../ui/sheet';
import { VisuallyHidden } from '../ui/visually-hidden';
import { TableOfContents, Chapter } from '../TableOfContents';

interface ReaderLayoutProps {
    children: ReactNode;
    showControls: boolean;
    setShowControls: (show: boolean) => void;
    toc: Chapter[];
    currentChapter: string;
    progress: number;
    totalChapters?: number;
    currentChapterIndex?: number;
    onProgressChange: (val: number) => void;
    onNavigate: (href: string) => void;
    isPlaying?: boolean;
    hideFooter?: boolean;
}

export function ReaderLayout({
    children,
    showControls,
    setShowControls,
    toc,
    currentChapter,
    progress,
    totalChapters,
    currentChapterIndex,
    onProgressChange,
    onNavigate,
    isPlaying = false,
    hideFooter = false
}: ReaderLayoutProps) {
    const { theme } = useReaderStore();
    const [tocOpen, setTocOpen] = useState(false);

    // Theme Styles
    const themeStyles = {
        light: "bg-white text-black",
        sepia: "bg-[#FAF4E8] text-[#5b4636]",
        dark: "bg-[#333333] text-[#DADADA]",
        oled: "bg-black text-gray-400",
        custom: "bg-background text-foreground"
    };

    return (
        <div
            className={cn(
                "h-screen w-screen relative overflow-hidden transition-colors duration-300 selection:bg-primary/30",
                themeStyles[theme] || themeStyles.light
            )}
            onClick={() => setShowControls(!showControls)}
        >
            <Sheet open={tocOpen} onOpenChange={setTocOpen}>
                <ReaderHeader
                    showControls={showControls}
                    onToggleTOC={() => setTocOpen(true)}
                />
                <SheetContent side="left" className="w-[300px] sm:w-[400px] p-0 border-none bg-transparent">
                    <VisuallyHidden>
                        <SheetTitle>Table of Contents</SheetTitle>
                    </VisuallyHidden>
                    <TableOfContents
                        toc={toc}
                        currentChapterHref={currentChapter}
                        onSelectChapter={(href) => {
                            onNavigate(href);
                            setTocOpen(false);
                            setShowControls(false);
                        }}
                    />
                </SheetContent>
            </Sheet>

            {/* Click Overlay Removed - Using Global Click Handler */}

            {/* Content Container */}
            <div className="h-full w-full flex flex-col justify-center items-center pb-24 sm:pb-32">
                <div className={cn(
                    "flex-1 w-full relative",
                    "transition-all duration-500 ease-in-out", // Smooth transition
                    "pt-24 pb-12 px-4 sm:px-12", // Mobile optimized padding
                    "leading-loose", // Increased leading

                    // Smart Layout Switching
                    // If Playing: Single Column Focused (Karaoke Mode)
                    // If Not Playing: Standard Book Layout (Two Columns on Desktop if Sepia/Standard)
                    isPlaying
                        ? "max-w-2xl mx-auto"
                        : "max-w-screen-lg mx-auto",

                    "text-justify"
                )}>
                    {children}
                </div>
            </div>

            {!hideFooter && (
                <ReaderFooter
                    showControls={showControls}
                    currentChapter={currentChapter}
                    progress={progress}
                    totalChapters={totalChapters}
                    currentChapterIndex={currentChapterIndex}
                    onProgressChange={onProgressChange}
                />
            )}
        </div>
    );
}
