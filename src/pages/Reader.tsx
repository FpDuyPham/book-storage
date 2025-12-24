import { useEffect, useRef, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { db } from '../services/db';
import { storageService } from '../services/storage';
import ePub, { Book, Rendition } from 'epubjs';
import { ArrowLeft, Settings as SettingsIcon } from 'lucide-react';
import { ReaderControls } from '../components/ReaderControls';
import { TableOfContents, Chapter } from '../components/TableOfContents';
import { TTSControlsPanel } from '../components/TTSControls';
import { Sheet } from '../components/ui/sheet';
import { Button } from '../components/ui/button';
import { useTTS } from '../hooks/useTTS';
import { useReaderStore, ReaderSettings } from '../hooks/useReaderStore';

export default function Reader() {
    const { id } = useParams<{ id: string }>();
    const viewerRef = useRef<HTMLDivElement>(null);
    const bookRef = useRef<Book | null>(null);
    const renditionRef = useRef<Rendition | null>(null);

    const [isReady, setIsReady] = useState(false);
    const [showControls, setShowControls] = useState(false);
    const [showTOC, setShowTOC] = useState(false);
    const [toc, setToc] = useState<Chapter[]>([]);
    const [currentChapter, setCurrentChapter] = useState<string>('');
    const [error, setError] = useState<string | null>(null);

    // Use Global Store
    const settings = useReaderStore();

    // Initialize TTS
    const tts = useTTS(renditionRef.current);

    const initBook = async (dbBook: any, mode: 'scrolled' | 'paginated') => {
        try {
            console.log('[Reader] Initializing book...', { bookId: dbBook.id, mode });

            if (!viewerRef.current) {
                console.error('[Reader] Viewer ref not available');
                return;
            }

            // Cleanup previous rendition if exists
            if (renditionRef.current) {
                console.log('[Reader] Cleaning up previous rendition');
                renditionRef.current.destroy();
                viewerRef.current.innerHTML = '';
            }

            // Initialize ePub if fresh
            if (!bookRef.current) {
                console.log('[Reader] Creating new ePub instance');

                let bookData = dbBook.data;
                if (!bookData) {
                    try {
                        console.log('[Reader] Fetching book data from OPFS...');
                        bookData = await storageService.getBookData(dbBook.id);
                    } catch (err) {
                        console.error('[Reader] Failed to load book data from storage:', err);
                        throw new Error('Book content not found.');
                    }
                }

                bookRef.current = ePub(bookData);

                // Load navigation
                console.log('[Reader] Loading navigation...');
                const nav = await bookRef.current.loaded.navigation;
                console.log('[Reader] Navigation loaded:', nav.toc);
                setToc(nav.toc as Chapter[]);
            }

            const book = bookRef.current;

            let flow = mode === 'scrolled' ? 'scrolled-doc' : 'paginated';
            const manager = mode === 'scrolled' ? 'continuous' : 'default';
            console.log('[Reader] Rendering with flow:', flow, 'manager:', manager);

            const rendition = book.renderTo(viewerRef.current, {
                width: '100%',
                height: '100%',
                flow: flow,
                manager: manager,
            });
            renditionRef.current = rendition;

            // Display at saved location or start
            console.log('[Reader] Displaying book at location:', dbBook.lastLocation || 'start');
            const displayed = await rendition.display(dbBook.lastLocation || undefined);
            console.log('[Reader] Book displayed successfully:', displayed);
            setIsReady(true);
            setError(null);

            // Events
            rendition.on('relocated', (location: any) => {
                console.log('[Reader] Relocated to:', location.start.cfi);
                db.books.update(id!, {
                    lastLocation: location.start.cfi,
                    progress: location.start.percentage * 100
                });
                setCurrentChapter(location.start.href);
            });

            // Key Navigation (Only for Paginated)
            const handleKey = (e: KeyboardEvent) => {
                if (mode === 'scrolled') return;
                if (e.key === 'ArrowLeft') rendition.prev();
                if (e.key === 'ArrowRight') rendition.next();
            };

            rendition.on('keydown', handleKey);
            document.addEventListener('keydown', handleKey);

            applySettings(rendition, settings);

            // Cleanup event listener on re-render
            return () => {
                document.removeEventListener('keydown', handleKey);
            }
        } catch (err) {
            console.error('[Reader] Error initializing book:', err);
            setError(err instanceof Error ? err.message : 'Failed to load book');
            setIsReady(false);
        }
    };

    // Initial Load & Mode Switch
    useEffect(() => {
        if (!id) return;

        const load = async () => {
            const dbBook = await db.books.get(id);
            if (!dbBook) return alert("Book not found");

            await initBook(dbBook, settings.viewMode);
        };
        load();

    }, [id, settings.viewMode]);


    // Sync theme with global UI (for bars etc)
    useEffect(() => {
        // Note: We might NOT want to override global .dark class here if it conflicts with ThemeProvider
        // But for Reader View, usually we want the Chrome to match the Page.
        // If theme is 'sepia' or 'custom', we need to decide what the UI looks like.
        // For simplicity, let's keep the logic but be careful not to break the App settings when leaving.
        // In a real app we might want 'Reader Mode' to be full screen without UI chrome.

    }, [settings.theme]);

    // Apply Settings to Rendition
    useEffect(() => {
        if (renditionRef.current && isReady) {
            applySettings(renditionRef.current, settings);
        }
    }, [settings.theme, settings.fontSize, settings.fontFamily, settings.lineHeight, settings.customColors, isReady]);

    const applySettings = (rendition: Rendition, newSettings: ReaderSettings) => {
        const themes = {
            light: {
                body: { color: '#000000', background: '#ffffff' }
            },
            dark: {
                body: { color: '#cccccc', background: '#1a1a1a' }
            },
            sepia: {
                body: { color: '#5b4636', background: '#f4ecd8' }
            },
            oled: {
                body: { color: '#a0a0a0', background: '#000000' }
            },
            custom: {
                body: {
                    color: newSettings.customColors?.foreground || '#cccccc',
                    background: newSettings.customColors?.background || '#1a1a1a'
                }
            }
        };

        // Register all themes
        Object.entries(themes).forEach(([name, style]) => {
            rendition.themes.register(name, style);
        });

        rendition.themes.select(newSettings.theme);
        rendition.themes.fontSize(`${newSettings.fontSize}px`);
        rendition.themes.font(newSettings.fontFamily);

        // Line Height logic
        const lineHeightMap = {
            compact: '1.2',
            standard: '1.5',
            loose: '1.8'
        };
        // We set this on paragraph globally for the rendition
        rendition.themes.default({
            p: {
                "line-height": `${lineHeightMap[newSettings.lineHeight]} !important`,
                "font-family": `${newSettings.fontFamily} !important`
            }
        });
    };

    return (
        <div className="h-screen w-screen relative overflow-hidden bg-background transition-colors duration-300">
            {/* Click Zones for Page Turning (Paginated Mode Only) */}
            {settings.viewMode === 'paginated' && (
                <>
                    <div className="absolute top-0 left-0 w-1/6 h-full z-30 cursor-pointer" onClick={() => renditionRef.current?.prev()} title="Previous Page"></div>
                    <div className="absolute top-0 right-0 w-1/6 h-full z-30 cursor-pointer" onClick={() => renditionRef.current?.next()} title="Next Page"></div>
                </>
            )}

            {/* Header / Nav */}
            <div className="absolute top-0 left-0 w-full p-4 flex justify-between items-start z-40 bg-gradient-to-b from-black/50 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                <div className="pointer-events-auto flex gap-2">
                    <Link to="/">
                        <Button variant="secondary" size="icon" className="rounded-full bg-black/50 hover:bg-black/80 text-white border-0 backdrop-blur">
                            <ArrowLeft className="w-5 h-5" />
                        </Button>
                    </Link>
                </div>
                <Button
                    variant="secondary"
                    size="icon"
                    onClick={() => setShowControls(true)}
                    className="pointer-events-auto rounded-full bg-black/50 hover:bg-black/80 text-white border-0 backdrop-blur"
                >
                    <SettingsIcon className="w-5 h-5" />
                </Button>
            </div>

            <Sheet open={showControls} onOpenChange={setShowControls}>
                <ReaderControls
                    onToggleTOC={() => {
                        setShowControls(false); // Close Settings
                        setShowTOC(true); // Open TOC
                    }}
                />
            </Sheet>

            <Sheet open={showTOC} onOpenChange={setShowTOC}>
                <TableOfContents
                    toc={toc}
                    currentChapterHref={currentChapter}
                    onSelectChapter={(href) => {
                        renditionRef.current?.display(href);
                        setShowTOC(false);
                    }}
                />
            </Sheet>

            {/* Error Display */}
            {error && (
                <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/90">
                    <div className="text-center p-8 max-w-md">
                        <div className="text-red-500 text-6xl mb-4">⚠️</div>
                        <h2 className="text-2xl font-bold text-white mb-4">Failed to Load Book</h2>
                        <p className="text-gray-300 mb-6">{error}</p>
                        <Link to="/">
                            <Button variant="secondary" size="lg">
                                <ArrowLeft className="w-5 h-5 mr-2" />
                                Back to Library
                            </Button>
                        </Link>
                    </div>
                </div>
            )}

            <div
                ref={viewerRef}
                id="viewer"
                className="w-full h-full"
                style={{
                    background:
                        settings.theme === 'light' ? '#fff' :
                            settings.theme === 'sepia' ? '#f4ecd8' :
                                settings.theme === 'oled' ? '#000000' :
                                    '#1a1a1a'
                }}
            ></div>

            {/* TTS Controls */}
            {isReady && (
                <TTSControlsPanel
                    settings={tts.settings}
                    state={tts.state}
                    controls={tts.controls}
                    availableVoices={tts.availableVoices}
                />
            )}
        </div>
    );
}
