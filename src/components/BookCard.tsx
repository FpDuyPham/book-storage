import React from 'react';
import { Book } from '../services/db';
import { storageService } from '../services/storage';
import { Link } from 'react-router-dom';
import { Book as BookIcon, MoreVertical, Trash2, Pencil, Download, Heart, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { cn } from '../lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { Progress } from './ui/progress';
import { toast } from 'sonner';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
} from "./ui/dropdown-menu";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "./ui/sheet";
import { useMobile } from '../hooks/use-mobile';

interface BookCardProps {
    book: Book;
    onDelete?: (id: string) => void;
    onToggleFavorite?: (id: string, isFavorite: boolean) => void;
    onEdit?: (book: Book) => void;
}

export function BookCard({ book, onDelete, onToggleFavorite, onEdit }: BookCardProps) {
    const isMobile = useMobile();
    const handleDelete = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        // UI usually handles the deletion via onDelete prop, but if we need deeper logic:
        if (onDelete) onDelete(book.id);
    };

    const handleToggleFavorite = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (onToggleFavorite) onToggleFavorite(book.id, !book.isFavorite);
    };

    const handleEdit = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (onEdit) onEdit(book);
    };

    // const handleMarkAsRead = (e: React.MouseEvent) => {
    //     e.preventDefault();
    //     e.stopPropagation();
    //     if (onEdit) {
    //         onEdit({ ...book, status: 'Completed', progress: 100 });
    //     }
    // };

    const handleExport = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        try {
            let data = book.data;
            if (!data) {
                // Fetch from OPFS if not in Dexie
                data = await storageService.getBookData(book.id);
            }

            const blob = new Blob([data], { type: 'application/epub+zip' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${book.title}.epub`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            toast.success("Book exported successfully");
        } catch (error) {
            console.error("Export failed", error);
            toast.error("Failed to export book");
        }
    };

    const getLastReadText = () => {
        if (!book.lastReadAt) return 'Not started';
        try {
            return formatDistanceToNow(book.lastReadAt, { addSuffix: true });
        } catch (e) {
            return 'Just now';
        }
    };

    return (
        <div className="relative group h-full">
            <Link to={`/read/${book.id}`} className="block h-full">
                <motion.div
                    whileHover={{ y: -5 }}
                    className="h-full"
                    transition={{ duration: 0.2 }}
                >
                    <Card className="h-full overflow-hidden border-border/40 bg-card hover:border-primary/50 transition-colors flex flex-col group-hover:shadow-lg">
                        {/* Cover Image Container - Strict 2:3 Aspect Ratio */}
                        <div className="aspect-[2/3] relative bg-muted overflow-hidden">
                            {book.cover ? (
                                <img
                                    src={book.cover}
                                    alt={book.title}
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                />
                            ) : (
                                <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground p-4 text-center bg-muted/30">
                                    <BookIcon size={48} className="mb-2 opacity-50" />
                                    <span className="text-xs font-medium">No Cover</span>
                                </div>
                            )}

                            {/* Gradient Overlay (Hover) */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

                            {/* Favorite Badge */}
                            {book.isFavorite && (
                                <div className="absolute top-2 left-2 z-10">
                                    <div className="w-8 h-8 rounded-full bg-background/80 backdrop-blur-sm shadow-sm flex items-center justify-center text-red-500">
                                        <Heart size={16} fill="currentColor" />
                                    </div>
                                </div>
                            )}

                            <div className="absolute top-2 right-2 z-10 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-200">
                                {isMobile ? (
                                    <Sheet>
                                        <SheetTrigger asChild>
                                            <Button variant="secondary" size="icon" className="h-8 w-8 rounded-full shadow-sm bg-background/80 backdrop-blur-sm hover:bg-background">
                                                <MoreVertical size={16} />
                                            </Button>
                                        </SheetTrigger>
                                        <SheetContent side="bottom" className="rounded-t-[20px] px-4 pb-8">
                                            <SheetHeader className="mb-4">
                                                <SheetTitle>{book.title}</SheetTitle>
                                                <SheetDescription>{book.author}</SheetDescription>
                                            </SheetHeader>
                                            <div className="flex flex-col gap-3">
                                                <Button variant="outline" size="lg" className="w-full justify-start gap-4 h-14 text-base" onClick={handleEdit}>
                                                    <Pencil className="h-5 w-5" /> Edit Details
                                                </Button>
                                                <Button variant="outline" size="lg" className="w-full justify-start gap-4 h-14 text-base" onClick={handleExport}>
                                                    <Download className="h-5 w-5" /> Export Book
                                                </Button>
                                                <Button variant="outline" size="lg" className="w-full justify-start gap-4 h-14 text-base" onClick={handleToggleFavorite}>
                                                    <Heart className={cn("h-5 w-5", book.isFavorite && "fill-current text-red-500")} />
                                                    {book.isFavorite ? 'Unfavorite' : 'Favorite'}
                                                </Button>
                                                <Button variant="destructive" size="lg" className="w-full justify-start gap-4 h-14 text-base mt-2" onClick={handleDelete}>
                                                    <Trash2 className="h-5 w-5" /> Delete Book
                                                </Button>
                                            </div>
                                        </SheetContent>
                                    </Sheet>
                                ) : (
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}>
                                            <Button variant="secondary" size="icon" className="h-8 w-8 rounded-full shadow-sm bg-background/80 backdrop-blur-sm hover:bg-background">
                                                <MoreVertical size={16} />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                                            <DropdownMenuItem onClick={handleEdit}>
                                                <Pencil className="mr-2 h-4 w-4" /> Edit Details
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={handleExport}>
                                                <Download className="mr-2 h-4 w-4" /> Export Book
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={handleToggleFavorite}>
                                                <Heart className={cn("mr-2 h-4 w-4", book.isFavorite && "fill-current text-red-500")} />
                                                {book.isFavorite ? 'Unfavorite' : 'Favorite'}
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem onClick={handleDelete} className="text-red-500 focus:text-red-500 focus:bg-red-50 dark:focus:bg-red-950/20">
                                                <Trash2 className="mr-2 h-4 w-4" /> Delete Book
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                )}
                            </div>
                        </div>

                        <CardContent className="p-4 flex-1 flex flex-col gap-3">
                            <div>
                                <h3 className="font-semibold text-base leading-tight mb-1 truncate text-foreground" title={book.title}>
                                    {book.title}
                                </h3>
                                <p className="text-sm text-muted-foreground truncate" title={book.author}>
                                    {book.author || "Unknown Author"}
                                </p>
                            </div>

                            <div className="mt-auto space-y-3">
                                {/* Progress Bar */}
                                <div className="space-y-1.5">
                                    <div className="flex justify-between text-xs text-muted-foreground">
                                        <span>Progress</span>
                                        <span>{Math.round(book.progress)}%</span>
                                    </div>
                                    <Progress value={book.progress} className="h-1.5" />
                                </div>

                                {/* Footer Info */}
                                <div className="flex items-center justify-between pt-2 border-t border-border/50 text-xs text-muted-foreground">
                                    <div className="flex items-center gap-1.5" title="Last read">
                                        <Clock size={12} />
                                        <span>{getLastReadText()}</span>
                                    </div>
                                    {book.status && (
                                        <span className={cn(
                                            "px-1.5 py-0.5 rounded-full text-[10px] font-medium uppercase tracking-wider",
                                            book.status === 'Reading' ? "bg-blue-500/10 text-blue-500" :
                                                book.status === 'Completed' ? "bg-green-500/10 text-green-500" :
                                                    "bg-muted text-muted-foreground"
                                        )}>
                                            {book.status}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            </Link>
        </div>
    );
}
