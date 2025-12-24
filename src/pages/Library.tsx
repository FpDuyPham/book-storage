import React, { useRef, useState, useMemo } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, Book } from '../services/db';
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
                    filterStatus === 'completed' ? book.status === 'Completed' :
                        filterStatus === 'toread' ? book.status === 'To Read' : true
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
                if (file.type !== 'application/epub+zip' && !file.name.endsWith('.epub')) continue;

                const arrayBuffer = await file.arrayBuffer();
                const metadata = await parseEpub(arrayBuffer);

                await db.books.add({
                    id: uuidv4(),
                    title: metadata.title || file.name.replace('.epub', ''),
                    author: metadata.author || 'Unknown',
                    cover: metadata.cover,
                    data: arrayBuffer,
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
        <div className="p-8 max-w-7xl mx-auto flex flex-col min-h-full">
            {/* Hidden File Input */}
            <Input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept=".epub"
                multiple
                className="hidden"
            />

            <header className="flex flex-col md:flex-row justify-between items-start md:items-end mb-6 gap-4">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <h1 className="text-4xl font-bold mb-2 tracking-tight bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
                        My Library
                    </h1>
                    <p className="text-muted-foreground text-lg">Your personal collection of stories.</p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                >
                    <Button
                        size="lg"
                        onClick={() => fileInputRef.current?.click()}
                        className="rounded-full gap-2 shadow-lg"
                    >
                        <Plus size={20} /> Import Book
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
                className="mb-6 sticky top-0 z-20"
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
                            className={`border-2 border-dashed h-40 flex flex-col items-center justify-center cursor-pointer transition-all duration-300 ${isDragging ? 'border-primary bg-primary/10 scale-[1.02]' : 'border-muted hover:border-primary/50 hover:bg-muted/50'}`}
                        >
                            {isImporting ? (
                                <div className="flex flex-col items-center gap-4 text-primary">
                                    <Loader2 className="animate-spin w-8 h-8" />
                                    <span className="text-lg font-medium">Processing your books...</span>
                                </div>
                            ) : (
                                <>
                                    <div className="p-3 bg-muted rounded-full mb-3">
                                        <Upload className="w-6 h-6 text-muted-foreground" />
                                    </div>
                                    <p className="text-muted-foreground font-medium">Drop EPUB files here to import</p>
                                </>
                            )}
                        </Card>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Book Grid/List */}
            <motion.div
                className={cn(
                    "grid gap-6 gap-y-10 pb-20",
                    viewMode === 'grid'
                        ? "grid-cols-[repeat(auto-fill,minmax(180px,1fr))]"
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
                                hidden: { opacity: 0, y: 20 },
                                show: { opacity: 1, y: 0 }
                            }}
                            layout
                            className={viewMode === 'list' ? "max-w-3xl mx-auto w-full" : undefined}
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
                        <Skeleton className="h-[250px] w-full rounded-xl" />
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-[90%]" />
                            <Skeleton className="h-3 w-[60%]" />
                        </div>
                    </div>
                ))}
            </motion.div>

            {/* Empty States */}
            {books && books.length === 0 && !isImporting && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="flex-1 flex flex-col items-center justify-center opacity-50 min-h-[40vh]"
                >
                    <BookOpen size={64} className="mb-6 text-muted-foreground" />
                    <p className="text-xl text-muted-foreground">Your library is empty.</p>
                </motion.div>
            )}

            {books && books.length > 0 && processedBooks?.length === 0 && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex-1 flex flex-col items-center justify-center opacity-50 min-h-[20vh]"
                >
                    <BookOpen size={48} className="mb-4 text-muted-foreground" />
                    <p className="text-lg text-muted-foreground">No books found matching criteria</p>
                </motion.div>
            )}

            {/* Dialogs */}
            <AlertDialog open={!!bookToDelete} onOpenChange={(open: boolean) => !open && setBookToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete this book from your library. This action cannot be undone.
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
