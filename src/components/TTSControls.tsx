import React from 'react';
import { Play, Pause, Square, Volume2, Mic, ChevronDown, Headphones, HelpCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from './ui/button';
import { Slider } from './ui/slider';
import { Label } from './ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from './ui/select';
import { TTSSettings, TTSState, TTSControls } from '../types/tts';
import { TTSHelpDialog } from './TTSHelpDialog';

interface TTSControlsProps {
    settings: TTSSettings;
    state: TTSState;
    controls: TTSControls;
    availableVoices: SpeechSynthesisVoice[];
}

export function TTSControlsPanel({ settings, state, controls, availableVoices }: TTSControlsProps) {
    const [isExpanded, setIsExpanded] = React.useState(false);
    const [isMinimized, setIsMinimized] = React.useState(false);
    const [showHelp, setShowHelp] = React.useState(false);

    const handlePlayPause = () => {
        if (state.isPlaying) {
            if (state.isPaused) {
                controls.resume();
            } else {
                controls.pause();
            }
        } else {
            // Use playFromSelection to support starting from selected text
            controls.playFromSelection();
        }
    };

    // Keyboard shortcuts: Space for play/pause, Esc for stop
    React.useEffect(() => {
        const handleKeyPress = (e: KeyboardEvent) => {
            // Don't trigger if user is typing in an input
            if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
                return;
            }

            if (e.code === 'Space') {
                e.preventDefault();
                handlePlayPause();
            } else if (e.code === 'Escape' && state.isPlaying) {
                e.preventDefault();
                controls.stop();
            }
        };

        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, [state.isPlaying, state.isPaused, controls]);

    return (
        <AnimatePresence mode="wait">
            {!isMinimized ? (
                <motion.div
                    key="full-controls"
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 100, opacity: 0 }}
                    transition={{ type: "spring", damping: 20, stiffness: 300 }}
                    className="fixed bottom-0 left-0 right-0 z-50 bg-gradient-to-t from-black via-black/95 to-black/80 backdrop-blur-lg border-t border-white/10"
                >
                    {/* Compact Controls */}
                    <div className="max-w-7xl mx-auto px-4 py-3">
                        <div className="flex items-center justify-between gap-4">
                            {/* Left: Playback Controls */}
                            <div className="flex items-center gap-2">
                                <Button
                                    size="icon"
                                    variant="ghost"
                                    onClick={handlePlayPause}
                                    className="h-10 w-10 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground"
                                >
                                    {state.isPlaying && !state.isPaused ? (
                                        <Pause className="h-5 w-5" />
                                    ) : (
                                        <Play className="h-5 w-5 ml-0.5" />
                                    )}
                                </Button>

                                <Button
                                    size="icon"
                                    variant="ghost"
                                    onClick={controls.stop}
                                    disabled={!state.isPlaying && !state.isPaused}
                                    className="h-10 w-10 rounded-full hover:bg-white/10"
                                >
                                    <Square className="h-4 w-4" />
                                </Button>

                                {/* Status Text */}
                                <div className="hidden sm:flex flex-col ml-2">
                                    <span className="text-sm font-medium text-white">
                                        {state.isSpeaking ? 'Speaking...' : state.isPaused ? 'Paused' : 'Ready'}
                                    </span>
                                    <span className="text-xs text-gray-400">
                                        {state.totalChunks > 0
                                            ? `${state.currentChunk + 1} of ${state.totalChunks} • ${settings.speed}x`
                                            : `${settings.speed}x speed`
                                        }
                                    </span>
                                </div>
                            </div>

                            {/* Center: Speed Control */}
                            <div className="hidden md:flex items-center gap-3 flex-1 max-w-xs">
                                <Label className="text-xs text-gray-400 whitespace-nowrap">Speed</Label>
                                <Slider
                                    value={[settings.speed]}
                                    onValueChange={([value]) => controls.updateSettings({ speed: value })}
                                    min={0.5}
                                    max={2.0}
                                    step={0.1}
                                    className="flex-1"
                                />
                                <span className="text-xs text-gray-400 w-10 text-right">{settings.speed.toFixed(1)}x</span>
                            </div>

                            {/* Right: Expand/Collapse & Voice */}
                            <div className="flex items-center gap-2">
                                <Button
                                    size="icon"
                                    variant="ghost"
                                    onClick={() => setShowHelp(true)}
                                    className="text-gray-400 hover:text-white hover:bg-white/10 h-8 w-8"
                                    title="Voice Setup Guide"
                                >
                                    <HelpCircle className="h-5 w-5" />
                                </Button>

                                <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => setIsExpanded(!isExpanded)}
                                    className="text-gray-400 hover:text-white hover:bg-white/10"
                                >
                                    <Mic className="h-4 w-4 mr-2" />
                                    <span className="hidden sm:inline">Settings</span>
                                </Button>

                                <div className="h-4 w-px bg-white/10 mx-1" />

                                <Button
                                    size="icon"
                                    variant="ghost"
                                    onClick={() => setIsMinimized(true)}
                                    className="text-gray-400 hover:text-white hover:bg-white/10 h-8 w-8"
                                    title="Minimize Player"
                                >
                                    <ChevronDown className="h-5 w-5" />
                                </Button>
                            </div>
                        </div>

                        {/* Expanded Controls */}
                        <AnimatePresence>
                            {isExpanded && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="overflow-hidden"
                                >
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 mt-4 border-t border-white/10">
                                        {/* Voice Selection */}
                                        <div className="space-y-2">
                                            <Label className="text-xs text-gray-400">Voice</Label>
                                            <Select
                                                value={settings.voice || ''}
                                                onValueChange={(value) => controls.updateSettings({ voice: value })}
                                            >
                                                <SelectTrigger className="bg-white/5 border-white/10 text-white">
                                                    <SelectValue placeholder="Select voice" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {availableVoices.map((voice) => (
                                                        <SelectItem key={voice.name} value={voice.name}>
                                                            {voice.name} ({voice.lang})
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        {/* Volume Control */}
                                        <div className="space-y-2">
                                            <Label className="text-xs text-gray-400 flex items-center justify-between">
                                                <span>Volume</span>
                                                <span>{Math.round(settings.volume * 100)}%</span>
                                            </Label>
                                            <div className="flex items-center gap-3">
                                                <Volume2 className="h-4 w-4 text-gray-400" />
                                                <Slider
                                                    value={[settings.volume]}
                                                    onValueChange={([value]) => controls.updateSettings({ volume: value })}
                                                    min={0}
                                                    max={1}
                                                    step={0.1}
                                                    className="flex-1"
                                                />
                                            </div>
                                        </div>

                                        {/* Pitch Control */}
                                        <div className="space-y-2">
                                            <Label className="text-xs text-gray-400 flex items-center justify-between">
                                                <span>Pitch</span>
                                                <span>{settings.pitch.toFixed(1)}</span>
                                            </Label>
                                            <Slider
                                                value={[settings.pitch]}
                                                onValueChange={([value]) => controls.updateSettings({ pitch: value })}
                                                min={0.5}
                                                max={2.0}
                                                step={0.1}
                                                className="flex-1"
                                            />
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                    <TTSHelpDialog open={showHelp} onOpenChange={setShowHelp} />
                </motion.div>
            ) : (
                <motion.div
                    key="minimized-button"
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="fixed bottom-6 right-6 z-50"
                >
                    <Button
                        size="icon"
                        onClick={() => setIsMinimized(false)}
                        className="h-14 w-14 rounded-full bg-primary shadow-lg hover:bg-primary/90 text-primary-foreground border-2 border-background"
                    >
                        {state.isPlaying && !state.isPaused ? (
                            <span className="relative flex h-full w-full items-center justify-center">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary/50 opacity-75"></span>
                                <Headphones className="relative h-6 w-6" />
                            </span>
                        ) : (
                            <Headphones className="h-6 w-6" />
                        )}
                    </Button>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
