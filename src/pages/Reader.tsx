import { useEffect, useRef, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { db } from '../services/db';
import { storageService } from '../services/storage';
import ePub, { Book, Rendition } from 'epubjs';
import { Chapter } from '../components/TableOfContents';
import { TTSControlsPanel } from '../components/TTSControls';
import { useTTS } from '../hooks/useTTS';
import { useReaderStore, ReaderSettings } from '../hooks/useReaderStore';
import { ReaderLayout } from '../components/reader/ReaderLayout';

export default function Reader() {
    const { id } = useParams<{ id: string }>();
    const viewerRef = useRef<HTMLDivElement>(null);
    const bookRef = useRef<Book | null>(null);
    const renditionRef = useRef<Rendition | null>(null);

    const [isReady, setIsReady] = useState(false);
    const [showControls, setShowControls] = useState(false);
    const [toc, setToc] = useState<Chapter[]>([]);
    const [currentChapter, setCurrentChapter] = useState<string>('');
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState<string | null>(null);

    // Use Global Store
    const settings = useReaderStore();

    // Initialize TTS
    const tts = useTTS(renditionRef.current);

    const initBook = async (dbBook: any, mode: 'scrolled' | 'paginated') => {
        try {
            if (!viewerRef.current) return;

            if (renditionRef.current) {
                renditionRef.current.destroy();
                viewerRef.current.innerHTML = '';
            }

            if (!bookRef.current) {
                let bookData = dbBook.data;
                if (!bookData) {
                    try {
                        bookData = await storageService.getBookData(dbBook.id);
                    } catch (err) {
                        throw new Error('Book content not found.');
                    }
                }
                bookRef.current = ePub(bookData);

                const nav = await bookRef.current.loaded.navigation;
                setToc(nav.toc as Chapter[]);
            }

            const book = bookRef.current;
            let flow = mode === 'scrolled' ? 'scrolled-doc' : 'paginated';
            const manager = mode === 'scrolled' ? 'continuous' : 'default';

            const rendition = book.renderTo(viewerRef.current, {
                width: '100%',
                height: '100%',
                flow: flow,
                manager: manager,
            });
            renditionRef.current = rendition;

            await rendition.display(dbBook.lastLocation || undefined);
            setIsReady(true);
            setError(null);

            // Events
            rendition.on('relocated', (location: any) => {
                const percentage = location.start.percentage;
                db.books.update(id!, {
                    lastLocation: location.start.cfi,
                    progress: percentage * 100
                });
                setProgress(percentage * 100);
                setCurrentChapter(location.start.href);

                // Estimate chapter index
                // This is rough, ideally we map CFI to TOC item
            });

            // Tap Logic Integration for ePubJS
            // ePubJS captures clicks in its iframe. We need to listen to them.
            rendition.on('click', () => {
                setShowControls(prev => !prev);
            });

            // Key Navigation
            const handleKey = (e: KeyboardEvent) => {
                if (mode === 'scrolled') return;
                if (e.key === 'ArrowLeft') rendition.prev();
                if (e.key === 'ArrowRight') rendition.next();
            };

            rendition.on('keydown', handleKey);
            document.addEventListener('keydown', handleKey);

            applySettings(rendition, settings);

            return () => {
                document.removeEventListener('keydown', handleKey);
            }
        } catch (err) {
            console.error(err);
            setError(err instanceof Error ? err.message : 'Failed to load book');
            setIsReady(false);
        }
    };

    useEffect(() => {
        if (!id) return;
        const load = async () => {
            const dbBook = await db.books.get(id);
            if (!dbBook) return alert("Book not found");
            await initBook(dbBook, settings.viewMode);
        };
        load();
    }, [id, settings.viewMode]);

    // Apply Settings to Rendition
    useEffect(() => {
        if (renditionRef.current && isReady) {
            applySettings(renditionRef.current, settings);
        }
    }, [settings.theme, settings.fontSize, settings.fontFamily, settings.lineHeight, settings.customColors, isReady]);

    const applySettings = (rendition: Rendition, newSettings: ReaderSettings) => {
        const themes = {
            light: { body: { color: '#000000', background: 'transparent' } }, // Transparent to let Layout bg show? No, body in iframe needs color
            // Actually, if we want the "Immersive" seamless look, the iframe body should match the container.
            dark: { body: { color: '#cccccc', background: '#1a1a1a' } },
            sepia: { body: { color: '#5b4636', background: '#F5E6D3' } },
            oled: { body: { color: '#a0a0a0', background: '#000000' } },
            custom: {
                body: {
                    color: newSettings.customColors?.foreground || '#cccccc',
                    background: newSettings.customColors?.background || '#1a1a1a'
                }
            }
        };

        Object.entries(themes).forEach(([name, style]) => {
            rendition.themes.register(name, style);
        });

        rendition.themes.select(newSettings.theme);
        rendition.themes.fontSize(`${newSettings.fontSize}px`);
        rendition.themes.font(newSettings.fontFamily);
    };

    const handleProgressChange = async (val: number) => {
        if (!bookRef.current || !renditionRef.current) return;
        // ePubJS conversion from percentage to cfi is complex.
        // Simplified: use locations if generated, or just guessing.
        // Ideally we generate locations on load: await book.locations.generate(1000);
        // For now, let's skip strict progress seeking or implement if needed.
        // cfiFromPercentage is available if locations are generated.

        // This is a known expensive operation, maybe just skip for prototype
        // or try:
        // const cfi = book.locations.cfiFromPercentage(val / 100);
        // renditionRef.current.display(cfi);

        console.log("Seeking to", val);
        // Need to generate locations first to be accurate
    };

    if (error) {
        return (
            <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/90 text-white">
                <div className="text-center">
                    <h2 className="text-2xl mb-4">Error</h2>
                    <p>{error}</p>
                    <Link to="/" className="mt-4 inline-block underline">Back to Library</Link>
                </div>
            </div>
        );
    }

    return (
        <ReaderLayout
            showControls={showControls}
            setShowControls={setShowControls}
            toc={toc}
            currentChapter={currentChapter}
            progress={progress}
            totalChapters={toc.length}
            currentChapterIndex={0} // TODO: Calculate index
            onProgressChange={handleProgressChange}
            onNavigate={(href) => renditionRef.current?.display(href)}
        >
            <div
                ref={viewerRef}
                id="viewer"
                className="w-full h-full"
            />

            {/* TTS Integration */}
            {isReady && (
                <div className={`fixed bottom-20 right-4 z-50 transition-opacity ${showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                    <TTSControlsPanel
                        settings={tts.settings}
                        state={tts.state}
                        controls={tts.controls}
                        availableVoices={tts.availableVoices}
                    />
                </div>
            )}
        </ReaderLayout>
    );
}
