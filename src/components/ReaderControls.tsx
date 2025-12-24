import { Settings, Moon, Sun, List, Palette, Type, Smartphone } from 'lucide-react';
import { Button } from './ui/button';
import { Slider } from './ui/slider';
import { Switch } from './ui/switch';
import { Input } from './ui/input';
import {
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
} from "./ui/sheet"
import { useReaderStore } from '../hooks/useReaderStore';

interface ReaderControlsProps {
    onToggleTOC: () => void;
}

export function ReaderControls({ onToggleTOC }: ReaderControlsProps) {
    const {
        theme, setTheme,
        fontSize, setFontSize,
        fontFamily, setFontFamily,
        lineHeight, setLineHeight,
        viewMode, setViewMode,
        autoScrollSpeed, setAutoScrollSpeed,
        isAutoScrolling, setIsAutoScrolling,
        customColors, setCustomColors
    } = useReaderStore();

    return (
        <SheetContent side="right" className="w-[320px] sm:w-[380px] overflow-y-auto">
            <SheetHeader className="mb-6">
                <SheetTitle className="flex items-center gap-2">
                    <Settings className="w-5 h-5" /> Settings
                </SheetTitle>
                <SheetDescription>
                    Customize your reading experience.
                </SheetDescription>
            </SheetHeader>

            <div className="space-y-8">
                {/* View Mode & TOC */}
                <div className="space-y-4">
                    <Button
                        onClick={onToggleTOC}
                        className="w-full gap-2"
                        variant="secondary"
                    >
                        <List size={18} /> Table of Contents
                    </Button>

                    <div className="grid grid-cols-2 gap-2 p-1 bg-muted rounded-lg">
                        <button
                            onClick={() => setViewMode('paginated')}
                            className={`py-2 rounded-md text-sm font-medium transition-all ${viewMode === 'paginated' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                        >
                            Book Mode
                        </button>
                        <button
                            onClick={() => setViewMode('scrolled')}
                            className={`py-2 rounded-md text-sm font-medium transition-all ${viewMode === 'scrolled' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                        >
                            Scroll Mode
                        </button>
                    </div>
                </div>

                {/* Theme */}
                <div className="space-y-3">
                    <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Theme</label>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setTheme('light')}
                            className={`flex-1 aspect-square rounded-xl border-2 flex items-center justify-center transition-all ${theme === 'light' ? 'border-primary bg-white text-black scale-105 shadow-md' : 'border-border bg-white text-black opacity-50'}`}
                            title="Light"
                        >
                            <Sun size={20} />
                        </button>
                        <button
                            onClick={() => setTheme('sepia')}
                            className={`flex-1 aspect-square rounded-xl border-2 flex items-center justify-center transition-all ${theme === 'sepia' ? 'border-primary bg-[#f4ecd8] text-[#5b4636] scale-105 shadow-md' : 'border-border bg-[#f4ecd8] text-[#5b4636] opacity-50'}`}
                            title="Sepia"
                        >
                            <Type size={20} />
                        </button>
                        <button
                            onClick={() => setTheme('dark')}
                            className={`flex-1 aspect-square rounded-xl border-2 flex items-center justify-center transition-all ${theme === 'dark' ? 'border-primary bg-zinc-950 text-white scale-105 shadow-md' : 'border-border bg-zinc-950 text-white opacity-50'}`}
                            title="Dark"
                        >
                            <Moon size={20} />
                        </button>
                        <button
                            onClick={() => setTheme('oled')}
                            className={`flex-1 aspect-square rounded-xl border-2 flex items-center justify-center transition-all ${theme === 'oled' ? 'border-primary bg-black text-gray-400 scale-105 shadow-md' : 'border-border bg-black text-gray-400 opacity-50'}`}
                            title="OLED"
                        >
                            <Smartphone size={20} />
                        </button>
                        <button
                            onClick={() => setTheme('custom')}
                            className={`flex-1 aspect-square rounded-xl border-2 flex items-center justify-center transition-all ${theme === 'custom' ? 'border-primary bg-gradient-to-br from-red-500 via-green-500 to-blue-500 scale-105 shadow-md' : 'border-border bg-gradient-to-br from-red-500 via-green-500 to-blue-500 opacity-50'}`}
                            title="Custom"
                        >
                            <Palette size={20} className="text-white" />
                        </button>
                    </div>

                    {theme === 'custom' && (
                        <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
                            <div className="space-y-2">
                                <label className="text-xs text-muted-foreground uppercase font-semibold">Background</label>
                                <div className="flex gap-2 items-center">
                                    <input
                                        type="color"
                                        value={customColors?.background || '#1a1a1a'}
                                        onChange={(e) => setCustomColors({ ...customColors!, background: e.target.value })}
                                        className="w-10 h-10 rounded cursor-pointer border-0 bg-transparent p-0"
                                    />
                                    <Input
                                        value={customColors?.background || '#1a1a1a'}
                                        onChange={(e) => setCustomColors({ ...customColors!, background: e.target.value })}
                                        className="h-8 text-xs font-mono"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs text-muted-foreground uppercase font-semibold">Text</label>
                                <div className="flex gap-2 items-center">
                                    <input
                                        type="color"
                                        value={customColors?.foreground || '#cccccc'}
                                        onChange={(e) => setCustomColors({ ...customColors!, foreground: e.target.value })}
                                        className="w-10 h-10 rounded cursor-pointer border-0 bg-transparent p-0"
                                    />
                                    <Input
                                        value={customColors?.foreground || '#cccccc'}
                                        onChange={(e) => setCustomColors({ ...customColors!, foreground: e.target.value })}
                                        className="h-8 text-xs font-mono"
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Font */}
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <label className="text-sm font-medium">Typography</label>
                        <span className="text-xs text-muted-foreground">{fontSize}px</span>
                    </div>

                    <Slider
                        value={[fontSize]}
                        max={32}
                        min={14}
                        step={1}
                        onValueChange={(vals) => setFontSize(vals[0])}
                        className="w-full"
                    />

                    <div className="grid grid-cols-3 gap-2">
                        <div className="col-span-3 grid grid-cols-2 gap-2 mb-2">
                            <Button
                                variant={fontFamily.includes('Inter') ? 'default' : 'outline'}
                                onClick={() => setFontFamily('Inter, sans-serif')}
                                className="font-sans text-xs"
                            >Sans-Serif</Button>
                            <Button
                                variant={fontFamily.includes('Merriweather') ? 'default' : 'outline'}
                                onClick={() => setFontFamily('Merriweather, serif')}
                                className="font-serif text-xs"
                            >Serif</Button>
                        </div>
                    </div>
                </div>

                {/* Line Height */}
                <div className="space-y-3">
                    <label className="text-sm font-medium">Line Height</label>
                    <div className="grid grid-cols-3 gap-2">
                        {[
                            { id: 'compact', label: 'Compact' },
                            { id: 'standard', label: 'Normal' },
                            { id: 'loose', label: 'Loose' },
                        ].map((lh) => (
                            <button
                                key={lh.id}
                                onClick={() => setLineHeight(lh.id as any)}
                                className={`py-1.5 px-2 rounded text-xs border transition-colors ${lineHeight === lh.id ? 'bg-primary text-primary-foreground border-primary' : 'bg-transparent border-border hover:bg-muted'}`}
                            >
                                {lh.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Auto Scroll */}
                <div className="space-y-4 rounded-lg border p-4">
                    <div className="flex items-center justify-between">
                        <label className="text-sm font-medium">Auto Scroll</label>
                        <Switch
                            checked={isAutoScrolling}
                            onCheckedChange={setIsAutoScrolling}
                        />
                    </div>

                    <div className={`transition-opacity duration-300 space-y-3 ${isAutoScrolling ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
                        <div className="flex justify-between text-xs text-muted-foreground">
                            <span>Slow</span>
                            <span>Fast</span>
                        </div>
                        <Slider
                            value={[autoScrollSpeed]}
                            max={100}
                            min={1}
                            step={1}
                            onValueChange={(vals) => setAutoScrollSpeed(vals[0])}
                            disabled={!isAutoScrolling}
                        />
                    </div>
                </div>
            </div>
        </SheetContent>
    );
}
