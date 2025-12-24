
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface ReaderSettings {
    theme: 'light' | 'dark' | 'sepia' | 'oled' | 'custom';
    fontSize: number;
    fontFamily: string;
    lineHeight: 'compact' | 'standard' | 'loose';
    autoScrollSpeed: number;
    isAutoScrolling: boolean;
    viewMode: 'scrolled' | 'paginated';
    customColors?: {
        background: string;
        foreground: string;
    };
}

interface ReaderState extends ReaderSettings {
    setTheme: (theme: ReaderSettings['theme']) => void;
    setFontSize: (size: number) => void;
    setFontFamily: (font: string) => void;
    setLineHeight: (height: ReaderSettings['lineHeight']) => void;
    setAutoScrollSpeed: (speed: number) => void;
    setIsAutoScrolling: (isScrolling: boolean) => void;
    setViewMode: (mode: ReaderSettings['viewMode']) => void;
    setCustomColors: (colors: ReaderSettings['customColors']) => void;
    updateSettings: (settings: Partial<ReaderSettings>) => void;
}

export const useReaderStore = create<ReaderState>()(
    persist(
        (set) => ({
            theme: 'dark',
            fontSize: 18,
            fontFamily: 'Inter, sans-serif',
            lineHeight: 'standard',
            autoScrollSpeed: 30,
            isAutoScrolling: false,
            viewMode: 'paginated',
            customColors: {
                background: '#1a1a1a',
                foreground: '#cccccc'
            },

            setTheme: (theme) => set({ theme }),
            setFontSize: (fontSize) => set({ fontSize }),
            setFontFamily: (fontFamily) => set({ fontFamily }),
            setLineHeight: (lineHeight) => set({ lineHeight }),
            setAutoScrollSpeed: (autoScrollSpeed) => set({ autoScrollSpeed }),
            setIsAutoScrolling: (isAutoScrolling) => set({ isAutoScrolling }),
            setViewMode: (viewMode) => set({ viewMode }),
            setCustomColors: (customColors) => set({ customColors }),
            updateSettings: (newSettings) => set((state) => ({ ...state, ...newSettings })),
        }),
        {
            name: 'reader-settings', // Keep same key for backward compatibility if possible
            storage: createJSONStorage(() => localStorage),
        }
    )
);
