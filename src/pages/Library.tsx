import React, { useRef, useState, useMemo } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, Book, migrateBooksToOPFS } from '../services/db';
import { storageService } from '../services/storage';
import { parseEpub } from '../services/epubUtils';
import { BookCard } from '../components/BookCard';
import { Upload, Loader2, BookOpen, Plus } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { toast } from 'sonner';
import { Skeleton } from '../components/ui/skeleton';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "../components/ui/alert-dialog";
import { LibraryToolbar, FilterOption, SortOption, ViewMode } from '../components/LibraryToolbar';
import { EditBookDialog } from '../components/EditBookDialog';
import { cn } from '../lib/utils';

export default function Library() {
    const books = useLiveQuery(() => db.books.toArray());

    // Trigger migration on mount
    React.useEffect(() => {
        migrateBooksToOPFS().catch(console.error);
    }, []);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isImporting, setIsImporting] = useState(false);
    const [isDragging, setIsDragging] = useState(false);

    // Toolbar State
    const [searchQuery, setSearchQuery] = useState('');
    const [viewMode, setViewMode] = useState<ViewMode>('grid');
    const [sortBy, setSortBy] = useState<SortOption>('recent');
    const [filterStatus, setFilterStatus] = useState<FilterOption>('all');

    // Dialog State
    const [bookToDelete, setBookToDelete] = useState<string | null>(null);
    const [bookToEdit, setBookToEdit] = useState<Book | null>(null);

    // Filter & Sort Logic
    const processedBooks = useMemo(() => {
        if (!books) return [];

        let result = [...books];

        // Filter
        if (filterStatus !== 'all') {
            result = result.filter(book =>
                filterStatus === 'reading' ? book.status === 'Reading' :
                    filterStatus === 'completed' ? book.status === 'Completed' : true
            );
        }

        // Search
        if (searchQuery) {
            const lowerQuery = searchQuery.toLowerCase();
            result = result.filter(book =>
                book.title.toLowerCase().includes(lowerQuery) ||
                book.author.toLowerCase().includes(lowerQuery)
            );
        }

        // Sort
        result.sort((a, b) => {
            switch (sortBy) {
                case 'title':
                    return a.title.localeCompare(b.title);
                case 'author':
                    return a.author.localeCompare(b.author);
                case 'lastRead':
                    return (b.lastReadAt || 0) - (a.lastReadAt || 0);
                case 'recent':
                default:
                    return b.addedAt - a.addedAt;
            }
        });

        return result;
    }, [books, filterStatus, searchQuery, sortBy]);


    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;
        await processFiles(files);
    };

    const processFiles = async (files: FileList) => {
        setIsImporting(true);
        let successCount = 0;
        let failCount = 0;

        try {
            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                // Relaxed type check: Allow if name ends with .epub OR type is correct
                // Safari sometimes reports empty type for EPUBs
                if (file.type !== 'application/epub+zip' && !file.name.toLowerCase().endsWith('.epub')) {
                    console.warn(`[Import] Skipped file: ${file.name} (Type: ${file.type})`);
                    continue;
                }

                const arrayBuffer = await file.arrayBuffer();
                const metadata = await parseEpub(arrayBuffer);

                const id = uuidv4();

                // Save binary to OPFS
                await storageService.saveBookData(id, arrayBuffer);

                await db.books.add({
                    id,
                    title: metadata.title || file.name.replace('.epub', ''),
                    author: metadata.author || 'Unknown',
                    cover: metadata.cover,
                    // data: arrayBuffer, // Don't save to Dexie
                    lastLocation: null,
                    progress: 0,
                    addedAt: Date.now(),
                    status: 'To Read',
                    genre: 'General',
                    isFavorite: false
                });
                successCount++;
            }
        } catch (error) {
            console.error("Import failed", error);
            failCount++;
        } finally {
            setIsImporting(false);
            if (fileInputRef.current) fileInputRef.current.value = '';

            if (successCount > 0) {
                toast.success(`Successfully added ${successCount} book${successCount > 1 ? 's' : ''}`);
            }
            if (failCount > 0) {
                toast.error(`Failed to import ${failCount} file${failCount > 1 ? 's' : ''}`);
            }
        }
    };

    const handleDeleteBook = async () => {
        if (!bookToDelete) return;
        try {
            await storageService.deleteBookData(bookToDelete);
            await db.books.delete(bookToDelete);
            toast.success("Book deleted");
        } catch (error) {
            toast.error("Failed to delete book");
        } finally {
            setBookToDelete(null);
        }
    };

    const handleUpdateBook = async (id: string, updates: Partial<Book>) => {
        try {
            await db.books.update(id, updates);
            toast.success("Book updated");
        } catch (error) {
            toast.error("Failed to update book");
        }
    };

    const handleToggleFavorite = async (id: string, isFavorite: boolean) => {
        try {
            await db.books.update(id, { isFavorite });
            toast.success(isFavorite ? "Added to favorites" : "Removed from favorites");
        } catch (e) {
            toast.error("Failed to update favorite status");
        }
    }

    const onDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const onDragLeave = () => {
        setIsDragging(false);
    };

    const onDrop = async (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            await processFiles(e.dataTransfer.files);
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 py-8 flex flex-col min-h-full">
            {/* Hidden File Input */}
            <Input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept=".epub,application/epub+zip"
                multiple
                className="hidden"
            />

            <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <h2 className="text-3xl font-bold tracking-tight">My Library</h2>
                    <p className="text-muted-foreground mt-1">
                        Manage your collection and track your reading.
                    </p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                >
                    <Button
                        onClick={() => fileInputRef.current?.click()}
                        className="gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md transition-all hover:scale-105"
                    >
                        <Plus size={18} /> Import Book
                    </Button>
                </motion.div>
            </header>

            {/* Toolbar */}
            <LibraryToolbar
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                viewMode={viewMode}
                setViewMode={setViewMode}
                sortBy={sortBy}
                setSortBy={setSortBy}
                filterStatus={filterStatus}
                setFilterStatus={setFilterStatus}
                className="mb-8"
            />

            {/* Import Area - Drag & Drop */}
            <AnimatePresence>
                {(!books?.length || isDragging) && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mb-8 overflow-hidden"
                    >
                        <Card
                            onClick={() => fileInputRef.current?.click()}
                            onDragOver={onDragOver}
                            onDragLeave={onDragLeave}
                            onDrop={onDrop}
                            className={`border-2 border-dashed h-32 flex flex-col items-center justify-center cursor-pointer transition-all duration-300 ${isDragging ? 'border-primary bg-primary/10' : 'border-muted hover:border-primary/50 hover:bg-muted/50'}`}
                        >
                            {isImporting ? (
                                <div className="flex flex-col items-center gap-2 text-primary">
                                    <Loader2 className="animate-spin w-6 h-6" />
                                    <span className="text-sm font-medium">Processing...</span>
                                </div>
                            ) : (
                                <>
                                    <Upload className="w-8 h-8 text-muted-foreground mb-2" />
                                    <p className="text-sm text-muted-foreground font-medium">Drop EPUB files here or click to import</p>
                                </>
                            )}
                        </Card>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Book Grid/List */}
            <motion.div
                className={cn(
                    "grid gap-6",
                    viewMode === 'grid'
                        ? "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5"
                        : "grid-cols-1"
                )}
                initial="hidden"
                animate={books ? "show" : "hidden"}
                variants={{
                    hidden: { opacity: 0 },
                    show: {
                        opacity: 1,
                        transition: {
                            staggerChildren: 0.05
                        }
                    }
                }}
            >
                <AnimatePresence>
                    {processedBooks?.map(book => (
                        <motion.div
                            key={book.id}
                            variants={{
                                hidden: { opacity: 0, y: 10 },
                                show: { opacity: 1, y: 0 }
                            }}
                            layout
                            className={viewMode === 'list' ? "max-w-4xl mx-auto w-full" : undefined}
                        >
                            <BookCard
                                book={book}
                                onDelete={(id) => setBookToDelete(id)}
                                onToggleFavorite={handleToggleFavorite}
                                onEdit={(b) => setBookToEdit(b)}
                            />
                        </motion.div>
                    ))}
                </AnimatePresence>

                {/* Loading Skeletons */}
                {!books && Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="space-y-3">
                        <Skeleton className="aspect-[2/3] w-full rounded-md" />
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-[90%]" />
                            <Skeleton className="h-3 w-[60%]" />
                        </div>
                    </div>
                ))}
            </motion.div>

            {/* Empty States */}
            {books && books.length === 0 && !isImporting && (
                <div className="flex-1 flex flex-col items-center justify-center opacity-50 min-h-[40vh]">
                    <BookOpen size={64} className="mb-4 text-muted-foreground" />
                    <h3 className="text-xl font-semibold mb-2">No books found</h3>
                    <p className="text-muted-foreground">Import your first book to get started.</p>
                </div>
            )}

            {books && books.length > 0 && processedBooks?.length === 0 && (
                <div className="flex-1 flex flex-col items-center justify-center opacity-50 min-h-[20vh]">
                    <BookOpen size={48} className="mb-4 text-muted-foreground" />
                    <p className="text-lg text-muted-foreground">No books match your search.</p>
                </div>
            )}

            {/* Dialogs */}
            <AlertDialog open={!!bookToDelete} onOpenChange={(open: boolean) => !open && setBookToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete this book from your library.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteBook} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <EditBookDialog
                book={bookToEdit}
                open={!!bookToEdit}
                onOpenChange={(open) => !open && setBookToEdit(null)}
                onSave={handleUpdateBook}
            />
        </div>
    );
}
