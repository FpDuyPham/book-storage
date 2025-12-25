import { ReactNode, useState } from 'react';
import { useReaderStore } from '@/hooks/useReaderStore';
import { cn } from '@/lib/utils';
import { ReaderHeader } from './ReaderHeader';
import { ReaderFooter } from './ReaderFooter';
import { Sheet, SheetContent } from '../ui/sheet';
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
}: ReaderLayoutProps) {
    const { theme } = useReaderStore();
    const [tocOpen, setTocOpen] = useState(false);

    // Theme Styles
    const themeStyles = {
        light: "bg-white text-black",
        sepia: "bg-[#F5E6D3] text-[#433422]",
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
        >
            <Sheet open={tocOpen} onOpenChange={setTocOpen}>
                <ReaderHeader
                    showControls={showControls}
                    onToggleTOC={() => setTocOpen(true)}
                />
                <SheetContent side="left" className="w-[300px] sm:w-[400px] overflow-y-auto">
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

            {/* Click Overlay (Center 30%) - Interactions */}
            <div
                className="absolute inset-0 z-10 pointer-events-none"
            >
                <div className="flex h-full w-full">
                    {/* Left/Right allow clicks to pass through to epub (for page turns if implemented there) */}
                    <div className="w-[35%] h-full pointer-events-none" />

                    {/* Center captures clicks for menu */}
                    <div
                        className="w-[30%] h-full pointer-events-auto cursor-pointer"
                        onClick={() => setShowControls(!showControls)}
                        title="Toggle Controls"
                    />

                    <div className="w-[35%] h-full pointer-events-none" />
                </div>
            </div>

            {/* Content Container */}
            <div className="h-full w-full flex flex-col justify-center items-center">
                <div className={cn(
                    "flex-1 w-full relative",
                    "transition-all duration-300 ease-in-out",
                    // Desktop Centered View
                    "xl:max-w-3xl xl:mx-auto",
                    "xl:py-8 xl:px-12",
                    // On desktop we might want to show paper edges in some themes?
                    // For now just keep it clean.
                )}>
                    {children}
                </div>
            </div>

            <ReaderFooter
                showControls={showControls}
                currentChapter={currentChapter}
                progress={progress}
                totalChapters={totalChapters}
                currentChapterIndex={currentChapterIndex}
                onProgressChange={onProgressChange}
            />
        </div>
    );
}
