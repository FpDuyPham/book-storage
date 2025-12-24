
export interface ReaderSettings {
    theme: 'light' | 'dark' | 'sepia' | 'custom';
    fontSize: number;
    fontFamily: string;
    autoScrollSpeed: number;
    isAutoScrolling: boolean;
    viewMode: 'scrolled' | 'paginated';
    customColors?: {
        background: string;
        foreground: string;
    };
}

const SETTINGS_KEY = 'reader-settings';

const DEFAULT_SETTINGS: ReaderSettings = {
    theme: 'dark',
    fontSize: 18,
    fontFamily: 'Inter, sans-serif',
    autoScrollSpeed: 30,
    isAutoScrolling: false,
    viewMode: 'paginated',
    customColors: {
        background: '#1a1a1a',
        foreground: '#cccccc'
    }
};

export const loadSettings = (): ReaderSettings => {
    try {
        const stored = localStorage.getItem(SETTINGS_KEY);
        if (!stored) return DEFAULT_SETTINGS;
        return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
    } catch (e) {
        console.error('Failed to load settings', e);
        return DEFAULT_SETTINGS;
    }
};

export const saveSettings = (settings: ReaderSettings) => {
    try {
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch (e) {
        console.error('Failed to save settings', e);
    }
};
