import { useState, useEffect, useCallback, useRef } from 'react';
import { Rendition } from 'epubjs';
import { TTSSettings, TTSState, TTSControls } from '../types/tts';

const DEFAULT_SETTINGS: TTSSettings = {
    voice: null,
    speed: 1.0,
    pitch: 1.0,
    volume: 1.0,
    autoPlay: false,
    readingScope: 'page'
};

const STORAGE_KEY = 'tts-settings';

export function useTTS(rendition: Rendition | null) {
    const [settings, setSettings] = useState<TTSSettings>(() => {
        const stored = localStorage.getItem(STORAGE_KEY);
        return stored ? { ...DEFAULT_SETTINGS, ...JSON.parse(stored) } : DEFAULT_SETTINGS;
    });

    const [state, setState] = useState<TTSState>({
        isPlaying: false,
        isPaused: false,
        isSpeaking: false,
        currentText: '',
        progress: 0,
        currentChunk: 0,
        totalChunks: 0
    });

    const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
    const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
    const textQueueRef = useRef<string[]>([]);
    const currentIndexRef = useRef(0);

    // Load available voices
    useEffect(() => {
        const loadVoices = () => {
            const voices = window.speechSynthesis.getVoices();
            setAvailableVoices(voices);

            // Set default voice if not set
            if (!settings.voice && voices.length > 0) {
                const defaultVoice = voices.find(v => v.default) || voices[0];
                setSettings(prev => ({ ...prev, voice: defaultVoice.name }));
            }
        };

        loadVoices();
        window.speechSynthesis.onvoiceschanged = loadVoices;

        return () => {
            window.speechSynthesis.onvoiceschanged = null;
        };
    }, []);

    // Persist settings
    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    }, [settings]);

    // Extract text from current page
    const extractPageText = useCallback((): string => {
        if (!rendition) return '';

        try {
            const iframe = document.querySelector('#viewer iframe') as HTMLIFrameElement;
            if (!iframe?.contentDocument) return '';

            const body = iframe.contentDocument.body;
            const text = body.innerText || body.textContent || '';
            return text.trim();
        } catch (error) {
            console.error('[TTS] Error extracting text:', error);
            return '';
        }
    }, [rendition]);

    // Extract selected text or get text from selection point
    const extractSelectedText = useCallback((): { text: string; startFromSelection: boolean } => {
        if (!rendition) return { text: '', startFromSelection: false };

        try {
            const iframe = document.querySelector('#viewer iframe') as HTMLIFrameElement;
            if (!iframe?.contentDocument) return { text: '', startFromSelection: false };

            const selection = iframe.contentWindow?.getSelection();
            const selectedText = selection?.toString().trim();

            if (selectedText) {
                // User has selected text - read from selection
                console.log('[TTS] Reading from selected text:', selectedText.substring(0, 50) + '...');
                return { text: selectedText, startFromSelection: true };
            }

            // No selection - read entire page
            const body = iframe.contentDocument.body;
            const text = body.innerText || body.textContent || '';
            return { text: text.trim(), startFromSelection: false };
        } catch (error) {
            console.error('[TTS] Error extracting text:', error);
            return { text: '', startFromSelection: false };
        }
    }, [rendition]);

    // Create and configure utterance
    const createUtterance = useCallback((text: string): SpeechSynthesisUtterance => {
        const utterance = new SpeechSynthesisUtterance(text);

        // Apply settings
        utterance.rate = settings.speed;
        utterance.pitch = settings.pitch;
        utterance.volume = settings.volume;

        // Set voice
        if (settings.voice) {
            const voice = availableVoices.find(v => v.name === settings.voice);
            if (voice) utterance.voice = voice;
        }

        // Event handlers
        utterance.onstart = () => {
            console.log('[TTS] Started speaking');
            setState(prev => ({ ...prev, isSpeaking: true, isPlaying: true, isPaused: false }));
        };

        utterance.onend = () => {
            console.log('[TTS] Finished speaking');
            setState(prev => ({ ...prev, isSpeaking: false }));

            // Move to next chunk if available
            currentIndexRef.current++;
            if (currentIndexRef.current < textQueueRef.current.length) {
                const nextText = textQueueRef.current[currentIndexRef.current];
                const nextUtterance = createUtterance(nextText);
                utteranceRef.current = nextUtterance;

                // Update progress
                const progress = Math.round((currentIndexRef.current / textQueueRef.current.length) * 100);
                setState(prev => ({
                    ...prev,
                    progress,
                    currentChunk: currentIndexRef.current,
                    totalChunks: textQueueRef.current.length
                }));

                window.speechSynthesis.speak(nextUtterance);
            } else {
                // All done
                setState(prev => ({
                    ...prev,
                    isPlaying: false,
                    progress: 100,
                    currentChunk: textQueueRef.current.length,
                    totalChunks: textQueueRef.current.length
                }));
            }
        };

        utterance.onerror = (event) => {
            // Ignore 'interrupted' and 'canceled' errors as they're expected when stopping
            if (event.error === 'interrupted' || event.error === 'canceled') {
                console.log('[TTS] Speech cancelled');
                return;
            }
            console.error('[TTS] Speech error:', event.error);
            setState(prev => ({ ...prev, isPlaying: false, isSpeaking: false, isPaused: false }));
        };

        utterance.onpause = () => {
            console.log('[TTS] Paused');
            setState(prev => ({ ...prev, isPaused: true, isSpeaking: false }));
        };

        utterance.onresume = () => {
            console.log('[TTS] Resumed');
            setState(prev => ({ ...prev, isPaused: false, isSpeaking: true }));
        };

        return utterance;
    }, [settings, availableVoices]);

    // Play
    const play = useCallback(() => {
        console.log('[TTS] Play requested');

        // Stop any current speech
        window.speechSynthesis.cancel();

        const text = extractPageText();
        if (!text) {
            console.warn('[TTS] No text to read');
            return;
        }

        // Split text into chunks (by sentences for better control)
        const chunks = text.match(/[^.!?]+[.!?]+/g) || [text];
        textQueueRef.current = chunks;
        currentIndexRef.current = 0;

        const utterance = createUtterance(chunks[0]);
        utteranceRef.current = utterance;

        setState(prev => ({ ...prev, currentText: text, progress: 0 }));
        window.speechSynthesis.speak(utterance);
    }, [extractPageText, createUtterance]);

    // Play from selected text
    const playFromSelection = useCallback(() => {
        console.log('[TTS] Play from selection requested');

        // Stop any current speech
        window.speechSynthesis.cancel();

        const { text, startFromSelection } = extractSelectedText();
        if (!text) {
            console.warn('[TTS] No text to read');
            return;
        }

        // Split text into chunks (by sentences for better control)
        const chunks = text.match(/[^.!?]+[.!?]+/g) || [text];
        textQueueRef.current = chunks;
        currentIndexRef.current = 0;

        const utterance = createUtterance(chunks[0]);
        utteranceRef.current = utterance;

        setState(prev => ({
            ...prev,
            currentText: text,
            progress: 0,
            currentChunk: 0,
            totalChunks: chunks.length
        }));
        window.speechSynthesis.speak(utterance);

        if (startFromSelection) {
            console.log('[TTS] Started reading from selected text');
        }
    }, [extractSelectedText, createUtterance]);

    // Pause
    const pause = useCallback(() => {
        console.log('[TTS] Pause requested');
        if (window.speechSynthesis.speaking && !window.speechSynthesis.paused) {
            window.speechSynthesis.pause();
        }
    }, []);

    // Resume
    const resume = useCallback(() => {
        console.log('[TTS] Resume requested');
        if (window.speechSynthesis.paused) {
            window.speechSynthesis.resume();
        }
    }, []);

    // Stop
    const stop = useCallback(() => {
        console.log('[TTS] Stop requested');
        window.speechSynthesis.cancel();
        textQueueRef.current = [];
        currentIndexRef.current = 0;
        setState({
            isPlaying: false,
            isPaused: false,
            isSpeaking: false,
            currentText: '',
            progress: 0,
            currentChunk: 0,
            totalChunks: 0
        });
    }, []);

    // Update settings
    const updateSettings = useCallback((newSettings: Partial<TTSSettings>) => {
        setSettings(prev => ({ ...prev, ...newSettings }));

        // If currently speaking, apply new settings
        if (state.isSpeaking && utteranceRef.current) {
            // Need to restart with new settings
            const wasPlaying = state.isPlaying;
            stop();
            if (wasPlaying) {
                setTimeout(play, 100);
            }
        }
    }, [state.isSpeaking, state.isPlaying, stop, play]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            window.speechSynthesis.cancel();
        };
    }, []);

    // Media Session Integration
    useEffect(() => {
        if ('mediaSession' in navigator) {
            navigator.mediaSession.metadata = new MediaMetadata({
                title: 'Audiobook',
                artist: 'DocTruyen Reader',
            });

            navigator.mediaSession.setActionHandler('play', () => {
                if (state.isPaused) resume();
            });
            navigator.mediaSession.setActionHandler('pause', () => {
                pause();
            });
            navigator.mediaSession.setActionHandler('stop', () => {
                stop();
            });
        }
    }, [resume, pause, stop, state.isPaused]);

    useEffect(() => {
        if ('mediaSession' in navigator) {
            navigator.mediaSession.playbackState = (state.isPlaying && !state.isPaused) ? 'playing' : 'paused';
        }
    }, [state.isPlaying, state.isPaused]);

    // Auto-stop TTS when page navigation occurs (FIX: Navigation Queue Leak)
    useEffect(() => {
        if (!rendition) return;

        const handleRelocated = () => {
            if (state.isPlaying) {
                console.log('[TTS] Page changed, stopping playback');
                stop();
            }
        };

        rendition.on('relocated', handleRelocated);
        return () => {
            rendition.off('relocated', handleRelocated);
        };
    }, [rendition, state.isPlaying, stop]);

    const controls: TTSControls = {
        play,
        playFromSelection,
        pause,
        resume,
        stop,
        updateSettings
    };

    return {
        settings,
        state,
        controls,
        availableVoices
    };
}
