import React from 'react';
import { Book } from '../services/db';
import { Link } from 'react-router-dom';
import { Book as BookIcon, Trash2, Heart, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { cn } from '../lib/utils';
import { formatDistanceToNow } from 'date-fns';

interface BookCardProps {
    book: Book;
    onDelete?: (id: string) => void;
    onToggleFavorite?: (id: string, isFavorite: boolean) => void;
    onEdit?: (book: Book) => void;
}

export function BookCard({ book, onDelete, onToggleFavorite, onEdit }: BookCardProps) {
    const handleDelete = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (onDelete) onDelete(book.id);
    };

    const handleToggleFavorite = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (onToggleFavorite) onToggleFavorite(book.id, !book.isFavorite);
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
                    whileHover={{ y: -5, scale: 1.02 }}
                    className="h-full"
                >
                    <Card className="h-full overflow-hidden border-border/40 bg-card/50 hover:bg-card/80 transition-colors flex flex-col">
                        <div className="aspect-[2/3] relative bg-muted overflow-hidden">
                            {book.cover ? (
                                <img src={book.cover} alt={book.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                                    <BookIcon size={48} />
                                </div>
                            )}

                            {/* Progress Bar overlay */}
                            <div className="absolute bottom-0 left-0 w-full h-1 bg-muted/20">
                                <div
                                    className="h-full bg-primary"
                                    style={{ width: `${book.progress}%` }}
                                />
                            </div>

                            {/* Hover Overlay */}
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />

                            {/* Favorite Button (Visible on hover or if favorite) */}
                            <div className="absolute top-2 left-2 z-10">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className={cn(
                                        "w-8 h-8 rounded-full bg-background/50 backdrop-blur-sm hover:bg-background/80 transition-all",
                                        book.isFavorite ? "text-red-500 opacity-100" : "text-muted-foreground opacity-0 group-hover:opacity-100"
                                    )}
                                    onClick={handleToggleFavorite}
                                >
                                    <Heart size={16} fill={book.isFavorite ? "currentColor" : "none"} />
                                </Button>
                            </div>
                        </div>
                        <CardContent className="p-4 flex-1 flex flex-col">
                            <h3 className="font-bold text-lg leading-tight mb-1 text-card-foreground truncate" title={book.title}>{book.title}</h3>
                            <p className="text-sm text-muted-foreground truncate mb-2">{book.author || "Unknown Author"}</p>

                            <div className="mt-auto pt-3 border-t border-border/50 flex flex-col gap-1">
                                <div className="flex justify-between items-center text-xs text-muted-foreground/80">
                                    <span>{Math.round(book.progress)}%</span>
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
                                <div className="flex items-center gap-1.5 text-xs text-muted-foreground/60">
                                    <Clock size={12} />
                                    <span>{getLastReadText()}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            </Link>

            {/* Action Buttons */}
            <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
                {onEdit && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        whileHover={{ scale: 1.1 }}
                    >
                        <Button
                            variant="secondary"
                            size="icon"
                            className="h-8 w-8 rounded-full shadow-md bg-background/80 hover:bg-background"
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                onEdit(book);
                            }}
                            title="Edit Book"
                        >
                            <Trash2 size={14} className="rotate-0 scale-100 transition-all hidden" /> {/* Dummy to keep import for now if needed, effectively replacing content with Edit Icon */}
                            {/* Wait, I need an Edit icon. I'll import Pencil */}
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-pencil"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" /><path d="m15 5 4 4" /></svg>
                        </Button>
                    </motion.div>
                )}
                {onDelete && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        whileHover={{ scale: 1.1 }}
                    >
                        <Button
                            variant="destructive"
                            size="icon"
                            className="h-8 w-8 rounded-full shadow-md"
                            onClick={handleDelete}
                            title="Delete Book"
                        >
                            <Trash2 size={14} />
                        </Button>
                    </motion.div>
                )}
            </div>
        </div>
    );
}
