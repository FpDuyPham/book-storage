import { Type, Check } from 'lucide-react';
import { Button } from '../ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Slider } from '../ui/slider';
import { useReaderStore } from '@/hooks/useReaderStore';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';

export function ReaderSettings() {
    const {
        theme, setTheme,
        fontSize, setFontSize,
        fontFamily, setFontFamily
    } = useReaderStore();

    // Prevent hydration mismatch
    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);
    if (!mounted) return null;

    const themes = [
        { id: 'light', bg: 'bg-white', border: 'border-gray-200', text: 'text-black', label: 'White' },
        { id: 'sepia', bg: 'bg-[#F5E6D3]', border: 'border-[#E8D4B9]', text: 'text-[#433422]', label: 'Sepia' },
        { id: 'dark', bg: 'bg-[#333333]', border: 'border-[#444]', text: 'text-[#DADADA]', label: 'Grey' },
        { id: 'oled', bg: 'bg-black', border: 'border-gray-800', text: 'text-gray-400', label: 'Black' }
    ] as const;

    const fonts = [
        { id: 'Iowan Old Style, serif', label: 'Iowan' },
        { id: 'Charter, serif', label: 'Charter' },
        { id: 'Georgia, serif', label: 'Georgia' },
        { id: 'San Francisco, Inter, sans-serif', label: 'San Francisco' },
    ];

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="text-foreground/80 hover:text-foreground">
                    <Type className="h-5 w-5" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-5 bg-background/95 backdrop-blur-xl border-border/50 shadow-2xl rounded-xl" align="end" sideOffset={12}>
                <div className="space-y-6">
                    {/* Brightness (Stub) */}
                    {/* <div className="flex items-center gap-3 text-muted-foreground">
                        <Sun className="h-4 w-4" />
                        <Slider defaultValue={[75]} max={100} step={1} className="flex-1" />
                        <Sun className="h-6 w-6" />
                    </div> */}

                    {/* Themes */}
                    <div className="flex justify-between px-2">
                        {themes.map((t) => (
                            <button
                                key={t.id}
                                onClick={() => setTheme(t.id as any)}
                                className={cn(
                                    "w-12 h-12 rounded-full border-2 transition-all duration-200 hover:scale-110",
                                    t.bg, t.border,
                                    theme === t.id ? "ring-2 ring-primary ring-offset-2 scale-110" : ""
                                )}
                                aria-label={t.label}
                                title={t.label}
                            >
                                {theme === t.id && (
                                    <Check className={cn("w-5 h-5 mx-auto", t.id === 'light' || t.id === 'sepia' ? 'text-black' : 'text-white')} />
                                )}
                            </button>
                        ))}
                    </div>

                    {/* Font Size */}
                    <div className="bg-muted/30 rounded-lg p-1 flex items-center justify-between border">
                        <Button
                            variant="ghost"
                            className="h-10 w-12 text-sm font-serif"
                            onClick={() => setFontSize(Math.max(14, fontSize - 1))}
                        >
                            A
                        </Button>
                        <div className="flex-1 px-2">
                            <Slider
                                value={[fontSize]}
                                min={14}
                                max={32}
                                step={1}
                                onValueChange={(val) => setFontSize(val[0])}
                                className="[&_.bg-primary]:bg-foreground/50 [&_.border-primary]:border-foreground/50"
                            />
                        </div>
                        <Button
                            variant="ghost"
                            className="h-10 w-12 text-xl font-serif"
                            onClick={() => setFontSize(Math.min(32, fontSize + 1))}
                        >
                            A
                        </Button>
                    </div>

                    {/* Font Family */}
                    <div className="space-y-2">
                        <div className="grid grid-cols-1 gap-1 bg-muted/30 p-1 rounded-lg border">
                            {fonts.map(font => (
                                <button
                                    key={font.id}
                                    onClick={() => setFontFamily(font.id)}
                                    className={cn(
                                        "px-3 py-2 text-sm text-left rounded-md transition-colors flex justify-between items-center",
                                        fontFamily === font.id ? "bg-background shadow-sm text-primary font-medium" : "hover:bg-muted/50 text-muted-foreground"
                                    )}
                                    style={{ fontFamily: font.id.split(',')[0] }}
                                >
                                    {font.label}
                                    {fontFamily === font.id && <Check className="w-4 h-4 ml-2" />}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    );
}
