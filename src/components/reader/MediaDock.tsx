import { Play, Pause, RotateCcw, RotateCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../ui/button';
import { Slider } from '../ui/slider';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "../ui/popover";
import { TTSSettings, TTSState, TTSControls } from '../../types/tts';
import { cn } from '../../lib/utils';

interface MediaDockProps {
    settings: TTSSettings;
    state: TTSState;
    controls: TTSControls;
    availableVoices: SpeechSynthesisVoice[];
    chapterInfo: {
        title: string;
        currentTime: string;
        totalTime: string;
    };
    show: boolean;
}

export function MediaDock({ settings, state, controls, availableVoices, chapterInfo, show }: MediaDockProps) {
    const handlePlayPause = () => {
        if (state.isPlaying) {
            if (state.isPaused) controls.resume();
            else controls.pause();
        } else {
            controls.play();
        }
    };

    const handleSeek = (direction: 'rewind' | 'forward') => {
        // Since we are reading chunks/sentences, "seeking" 15s is hard with native synthesis.
        // We might need to restart with an offset or just jump chunks.
        // For now, let's skip implementation or jump 1 chunk for a simple effect.
        console.log(`Seeking ${direction} `);
    };

    return (
        <AnimatePresence>
            {show && (
                <motion.div
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 100, opacity: 0 }}
                    className="fixed bottom-0 left-0 right-0 z-50 bg-secondary/40 backdrop-blur-md border-t"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Progress Line (Top Edge) */}
                    <div className="absolute top-0 left-0 right-0 h-1 bg-muted/50 group">
                        <motion.div
                            className="h-full bg-[#5C5CFF]"
                            style={{ width: `${state.progress}%` }}
                        />
                        {/* Interactive Slider on top */}
                        <Slider
                            value={[state.progress]}
                            max={100}
                            step={0.1}
                            className="absolute inset-0 -top-2 h-5 opacity-0 hover:opacity-100 cursor-pointer"
                            onValueChange={([_val]) => {
                                // Seek logic
                            }}
                        />
                    </div>

                    <div className="max-w-5xl mx-auto h-20 flex items-center justify-between px-4 sm:px-6 gap-2 sm:gap-6">

                        {/* Left: Chapter & Time (Hidden on Mobile) */}
                        <div className="hidden sm:flex flex-col min-w-[120px]">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70">
                                {chapterInfo.title}
                            </span>
                            <div className="flex items-center gap-1 mt-0.5">
                                <span className="text-xs font-mono font-medium text-[#5C5CFF]">
                                    {chapterInfo.currentTime}
                                </span>
                                <span className="text-xs font-mono text-muted-foreground">
                                    / {chapterInfo.totalTime}
                                </span>
                            </div>
                        </div>

                        {/* Center: Playback Controls */}
                        <div className="flex-1 flex items-center justify-center gap-8">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-10 w-10 text-foreground hover:bg-black/5 rounded-full"
                                onClick={() => handleSeek('rewind')}
                            >
                                <span className="text-[10px] font-bold absolute mt-[1px]">10</span>
                                <RotateCcw className="h-5 w-5" />
                            </Button>

                            <Button
                                onClick={handlePlayPause}
                                className="h-14 w-14 rounded-full bg-[#5C5CFF] hover:bg-[#4B4BEE] text-white shadow-lg flex items-center justify-center hover:scale-105 transition-all active:scale-95"
                            >
                                {state.isPlaying && !state.isPaused ? (
                                    <Pause className="h-7 w-7 fill-current" />
                                ) : (
                                    <Play className="h-7 w-7 ml-1 fill-current" />
                                )}
                            </Button>

                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-10 w-10 text-foreground hover:bg-black/5 rounded-full"
                                onClick={() => handleSeek('forward')}
                            >
                                <span className="text-[10px] font-bold absolute mt-[1px]">10</span>
                                <RotateCw className="h-5 w-5" />
                            </Button>
                        </div>

                        {/* Right: Settings & Menu */}
                        <div className="flex items-center gap-3 min-w-[120px] justify-end">
                            {/* Speed */}
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" size="sm" className="h-8 px-3 font-mono text-xs border-muted-foreground/20 text-muted-foreground bg-transparent hover:bg-black/5 hover:text-foreground">
                                        {settings.speed}x
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    {[0.75, 1.0, 1.25, 1.5, 2.0].map(speed => (
                                        <DropdownMenuItem
                                            key={speed}
                                            onClick={() => controls.updateSettings({ speed })}
                                            className={cn(settings.speed === speed && "bg-accent")}
                                        >
                                            {speed.toFixed(2)}x
                                        </DropdownMenuItem>
                                    ))}
                                </DropdownMenuContent>
                            </DropdownMenu>

                            {/* Voice/Menu */}
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-muted-foreground hover:bg-black/5">
                                        <div className="flex gap-[2px] items-center justify-center">
                                            <div className="w-1 h-1 rounded-full bg-current" />
                                            <div className="w-1 h-1 rounded-full bg-current" />
                                            <div className="w-1 h-1 rounded-full bg-current" />
                                        </div>
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-64 p-2" align="end" side="top">
                                    <div className="space-y-1">
                                        <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">Voice</div>
                                        <div className="max-h-48 overflow-y-auto">
                                            {availableVoices.map(voice => (
                                                <Button
                                                    key={voice.name}
                                                    variant="ghost"
                                                    size="sm"
                                                    className={cn(
                                                        "w-full justify-start text-xs font-normal",
                                                        settings.voice === voice.name && "bg-accent text-accent-foreground"
                                                    )}
                                                    onClick={() => controls.updateSettings({ voice: voice.name })}
                                                >
                                                    <div className="flex flex-col items-start truncate">
                                                        <span>{voice.name}</span>
                                                        <span className="text-[10px] opacity-50">{voice.lang}</span>
                                                    </div>
                                                </Button>
                                            ))}
                                        </div>
                                    </div>
                                </PopoverContent>
                            </Popover>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
