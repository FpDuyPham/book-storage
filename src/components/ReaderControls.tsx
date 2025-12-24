import { Settings, Moon, Sun, List, Palette } from 'lucide-react';
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
import { ReaderSettings } from '../lib/settings';

interface ReaderControlsProps {
    settings: ReaderSettings;
    onUpdateSettings: (settings: Partial<ReaderSettings>) => void;
    onToggleTOC: () => void;
}

export function ReaderControls({ settings, onUpdateSettings, onToggleTOC }: ReaderControlsProps) {

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
                            onClick={() => onUpdateSettings({ viewMode: 'paginated' })}
                            className={`py-2 rounded-md text-sm font-medium transition-all ${settings.viewMode === 'paginated' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                        >
                            Book Mode
                        </button>
                        <button
                            onClick={() => onUpdateSettings({ viewMode: 'scrolled' })}
                            className={`py-2 rounded-md text-sm font-medium transition-all ${settings.viewMode === 'scrolled' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                        >
                            Scroll Mode
                        </button>
                    </div>
                </div>

                {/* Theme */}
                <div className="space-y-3">
                    <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Theme</label>
                    <div className="flex gap-3">
                        <button
                            onClick={() => onUpdateSettings({ theme: 'light' })}
                            className={`flex-1 aspect-square rounded-xl border-2 flex items-center justify-center transition-all ${settings.theme === 'light' ? 'border-primary bg-white text-black scale-105 shadow-md' : 'border-border bg-white text-black opacity-50'}`}
                            title="Light"
                        >
                            <Sun size={24} />
                        </button>
                        <button
                            onClick={() => onUpdateSettings({ theme: 'dark' })}
                            className={`flex-1 aspect-square rounded-xl border-2 flex items-center justify-center transition-all ${settings.theme === 'dark' ? 'border-primary bg-zinc-950 text-white scale-105 shadow-md' : 'border-border bg-zinc-950 text-white opacity-50'}`}
                            title="Dark"
                        >
                            <Moon size={24} />
                        </button>
                        <button
                            onClick={() => onUpdateSettings({ theme: 'sepia' })}
                            className={`flex-1 aspect-square rounded-xl border-2 flex items-center justify-center transition-all ${settings.theme === 'sepia' ? 'border-primary bg-[#f4ecd8] text-[#5b4636] scale-105 shadow-md' : 'border-border bg-[#f4ecd8] text-[#5b4636] opacity-50'}`}
                            title="Sepia"
                        >
                            <span className="font-serif text-xl font-bold">T</span>
                        </button>
                        <button
                            onClick={() => onUpdateSettings({ theme: 'custom' })}
                            className={`flex-1 aspect-square rounded-xl border-2 flex items-center justify-center transition-all ${settings.theme === 'custom' ? 'border-primary bg-gradient-to-br from-red-500 via-green-500 to-blue-500 scale-105 shadow-md' : 'border-border bg-gradient-to-br from-red-500 via-green-500 to-blue-500 opacity-50'}`}
                            title="Custom"
                        >
                            <Palette size={24} className="text-white" />
                        </button>
                    </div>

                    {settings.theme === 'custom' && (
                        <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
                            <div className="space-y-2">
                                <label className="text-xs text-muted-foreground uppercase font-semibold">Background</label>
                                <div className="flex gap-2 items-center">
                                    <input
                                        type="color"
                                        value={settings.customColors?.background || '#1a1a1a'}
                                        onChange={(e) => onUpdateSettings({
                                            customColors: { ...settings.customColors!, background: e.target.value }
                                        })}
                                        className="w-10 h-10 rounded cursor-pointer border-0 bg-transparent p-0"
                                    />
                                    <Input
                                        value={settings.customColors?.background || '#1a1a1a'}
                                        onChange={(e) => onUpdateSettings({
                                            customColors: { ...settings.customColors!, background: e.target.value }
                                        })}
                                        className="h-8 text-xs font-mono"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs text-muted-foreground uppercase font-semibold">Text</label>
                                <div className="flex gap-2 items-center">
                                    <input
                                        type="color"
                                        value={settings.customColors?.foreground || '#cccccc'}
                                        onChange={(e) => onUpdateSettings({
                                            customColors: { ...settings.customColors!, foreground: e.target.value }
                                        })}
                                        className="w-10 h-10 rounded cursor-pointer border-0 bg-transparent p-0"
                                    />
                                    <Input
                                        value={settings.customColors?.foreground || '#cccccc'}
                                        onChange={(e) => onUpdateSettings({
                                            customColors: { ...settings.customColors!, foreground: e.target.value }
                                        })}
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
                        <span className="text-xs text-muted-foreground">{settings.fontSize}px</span>
                    </div>

                    <Slider
                        value={[settings.fontSize]}
                        max={32}
                        min={14}
                        step={1}
                        onValueChange={(vals) => onUpdateSettings({ fontSize: vals[0] })}
                        className="w-full"
                    />

                    <div className="grid grid-cols-2 gap-3">
                        <Button
                            variant={settings.fontFamily.includes('Inter') ? 'default' : 'outline'}
                            onClick={() => onUpdateSettings({ fontFamily: 'Inter, sans-serif' })}
                            className="font-sans"
                        >Sans-Serif</Button>
                        <Button
                            variant={settings.fontFamily.includes('Merriweather') ? 'default' : 'outline'}
                            onClick={() => onUpdateSettings({ fontFamily: 'Merriweather, serif' })}
                            className="font-serif"
                        >Serif</Button>
                    </div>
                </div>

                {/* Auto Scroll */}
                <div className="space-y-4 rounded-lg border p-4">
                    <div className="flex items-center justify-between">
                        <label className="text-sm font-medium">Auto Scroll</label>
                        <Switch
                            checked={settings.isAutoScrolling}
                            onCheckedChange={(checked) => onUpdateSettings({ isAutoScrolling: checked })}
                        />
                    </div>

                    <div className={`transition-opacity duration-300 space-y-3 ${settings.isAutoScrolling ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
                        <div className="flex justify-between text-xs text-muted-foreground">
                            <span>Slow</span>
                            <span>Fast</span>
                        </div>
                        <Slider
                            value={[settings.autoScrollSpeed]}
                            max={100}
                            min={1}
                            step={1}
                            onValueChange={(vals) => onUpdateSettings({ autoScrollSpeed: vals[0] })}
                            disabled={!settings.isAutoScrolling}
                        />
                    </div>
                </div>
            </div>
        </SheetContent>
    );
}
