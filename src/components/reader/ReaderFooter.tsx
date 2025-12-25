import { Slider } from '../ui/slider';
import { cn } from '@/lib/utils';
import { useReaderStore } from '@/hooks/useReaderStore';

interface ReaderFooterProps {
    showControls: boolean;
    currentChapter: string;
    progress: number;
    totalChapters?: number;
    currentChapterIndex?: number;
    onProgressChange: (val: number) => void;
}

export function ReaderFooter({
    showControls,
    currentChapter,
    progress,
    totalChapters = 0,
    currentChapterIndex = 0,
    onProgressChange
}: ReaderFooterProps) {
    const { theme } = useReaderStore();

    return (
        <div
            className={cn(
                "fixed bottom-0 left-0 right-0 z-50 transition-transform duration-300 ease-in-out border-t",
                showControls ? "translate-y-0" : "translate-y-full",
                // Theme Adaptability
                theme === 'light' ? "bg-white/90 border-gray-200 text-gray-800" :
                    theme === 'sepia' ? "bg-[#FAF4E8]/95 border-[#E6DBB2] text-[#5b4636]" : // Match ReaderBG
                        theme === 'dark' ? "bg-[#333]/90 border-[#444] text-[#DADADA]" :
                            "bg-black/90 border-gray-800 text-gray-400",
                "backdrop-blur-md"
            )}
            onClick={(e) => e.stopPropagation()} // Prevent closing controls when clicking footer
        >
            <div className="max-w-3xl mx-auto px-6 py-6 space-y-2">

                <div className="flex justify-between text-xs font-medium opacity-70 mb-2">
                    <span>
                        {totalChapters > 0 ? `Chapter ${currentChapterIndex + 1} of ${totalChapters}` : currentChapter || 'Chapter'}
                    </span>
                    <span>
                        {Math.round(progress)}%
                        {/* Future: "5 mins left" */}
                    </span>
                </div>

                <Slider
                    value={[progress]}
                    max={100}
                    step={0.1}
                    onValueChange={(val) => onProgressChange(val[0])}
                    className="cursor-pointer"
                />

                <div className="h-4" /> {/* Spacer for safe area */}
            </div>
        </div>
    );
}
