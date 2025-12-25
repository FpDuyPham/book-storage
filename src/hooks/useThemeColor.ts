import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useTheme } from 'next-themes';
import { useReaderStore } from './useReaderStore';

export function useThemeColor() {
    const location = useLocation();
    const { theme: globalTheme, resolvedTheme } = useTheme();
    const { theme: readerTheme } = useReaderStore();

    useEffect(() => {
        let color = '#ffffff'; // Default Light

        // Check if we are in Reader Mode
        const isReader = location.pathname.startsWith('/read/');

        if (isReader) {
            // Apply Reader Theme Colors
            switch (readerTheme) {
                case 'sepia':
                    color = '#F5E6D3';
                    break;
                case 'dark':
                    color = '#333333'; // Zinc-800/900 approximation for Reader Dark
                    break;
                case 'oled':
                    color = '#000000';
                    break;
                case 'custom':
                    // Fallback to app theme or specific custom color if we want to support it deeper
                    // For now, let's treat custom same as Dark if resolvedTheme is dark, else Light
                    color = resolvedTheme === 'dark' ? '#09090b' : '#ffffff';
                    break;
                case 'light':
                default:
                    color = '#ffffff';
                    break;
            }
        } else {
            // Apply Global App Theme Colors
            // Matches Shadcn UI zinc-950 for dark mode
            color = resolvedTheme === 'dark' ? '#09090b' : '#ffffff';
        }

        // Update Meta Tag
        const metaThemeColor = document.querySelector("meta[name='theme-color']");
        if (metaThemeColor) {
            metaThemeColor.setAttribute('content', color);
        }

    }, [location.pathname, readerTheme, globalTheme, resolvedTheme]);
}
