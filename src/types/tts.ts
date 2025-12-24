export interface TTSSettings {
    voice: string | null;
    speed: number;
    pitch: number;
    volume: number;
    autoPlay: boolean;
    readingScope: 'page' | 'chapter' | 'book';
}

export interface TTSState {
    isPlaying: boolean;
    isPaused: boolean;
    isSpeaking: boolean;
    currentText: string;
    progress: number;
    currentChunk: number;
    totalChunks: number;
}

export interface TTSControls {
    play: () => void;
    playFromSelection: () => void;
    pause: () => void;
    resume: () => void;
    stop: () => void;
    updateSettings: (settings: Partial<TTSSettings>) => void;
}
