import { Play, Trophy, ChevronRight, MoreHorizontal, BookOpen } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Progress } from '../components/ui/progress';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "../components/ui/card"
import { ScrollArea, ScrollBar } from "../components/ui/scroll-area"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "../components/ui/dropdown-menu"
import { ReadingActivityCard } from '../components/goals/ReadingActivityCard';
import { StreaksCard } from '../components/goals/StreaksCard';
import { AchievementsList } from '../components/goals/AchievementsList';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../services/db';
import { useNavigate } from 'react-router-dom';

export default function Home() {
    const navigate = useNavigate();

    const books = useLiveQuery(() => db.books.toArray());

    const sortedBooks = books?.sort((a, b) => {
        // Sort by lastReadAt descending, then addedAt descending
        const dateA = a.lastReadAt || 0;
        const dateB = b.lastReadAt || 0;
        if (dateA !== dateB) return dateB - dateA;
        return b.addedAt - a.addedAt;
    }) || [];

    const currentBook = sortedBooks.length > 0 ? sortedBooks[0] : null;
    // If we have a current book, exclude it from up next, otherwise up next is empty or all books?
    // Let's say Up Next is everything else.
    const upNextBooks = sortedBooks.slice(1);

    const handleReadClick = (bookId: string) => {
        navigate(`/read/${bookId}`);
    };

    return (
        <div className="max-w-6xl mx-auto py-8 px-6 space-y-12">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h1 className="text-4xl font-bold font-serif tracking-tight">Reading Now</h1>
                <Button variant="ghost" className="h-8 w-8 rounded-full">
                    <span className="sr-only">Account</span>
                    {/* Account Icon could go here if header needs it, but it's in sidebar now */}
                </Button>
            </div>

            {/* Hero Section - Currently Reading */}
            <section className="relative group">
                {currentBook ? (
                    <>
                        {/* Ambient Background */}
                        {currentBook.cover && (
                            <div
                                className="absolute inset-0 bg-cover bg-center blur-3xl opacity-20 dark:opacity-10 rounded-3xl -z-10 transition-opacity duration-500"
                                style={{ backgroundImage: `url(${currentBook.cover})` }}
                            />
                        )}

                        <div className="flex flex-col md:flex-row gap-8 bg-card/40 backdrop-blur-sm border border-white/10 p-6 md:p-8 rounded-3xl shadow-lg hover:shadow-xl transition-all duration-300">
                            {/* Book Cover */}
                            <div className="relative shrink-0 w-48 md:w-64 mx-auto md:mx-0 shadow-2xl rounded-lg overflow-hidden transition-transform duration-300 group-hover:-translate-y-2 bg-muted/20 flex items-center justify-center">
                                {currentBook.cover ? (
                                    <img
                                        src={currentBook.cover}
                                        alt={currentBook.title}
                                        className="w-full h-auto object-cover aspect-[2/3]"
                                    />
                                ) : (
                                    <div className="w-full h-full aspect-[2/3] flex items-center justify-center text-muted-foreground bg-muted">
                                        <BookOpen size={64} />
                                    </div>
                                )}
                                {/* Reflection Effect */}
                                <div className="absolute -bottom-full left-0 right-0 h-full bg-gradient-to-t from-white/20 to-transparent opacity-30 transform scale-y-[-1] pointer-events-none" />
                            </div>

                            {/* Book Details */}
                            <div className="flex flex-col justify-center flex-1 text-center md:text-left space-y-6">
                                <div className="space-y-2">
                                    <h2 className="text-3xl md:text-4xl font-serif font-bold leading-tight line-clamp-2">{currentBook.title}</h2>
                                    <p className="text-xl text-muted-foreground font-medium line-clamp-1">{currentBook.author}</p>
                                </div>

                                <div className="space-y-3 max-w-md mx-auto md:mx-0 w-full">
                                    <div className="flex justify-between text-sm font-medium">
                                        <span>Progress</span>
                                        <span>{currentBook.progress}% Read</span>
                                    </div>
                                    <Progress value={currentBook.progress} className="h-2" />
                                </div>

                                <div className="pt-2">
                                    <Button
                                        size="lg"
                                        className="rounded-full px-8 h-12 text-base font-semibold shadow-lg hover:shadow-primary/25 transition-all"
                                        onClick={() => handleReadClick(currentBook.id)}
                                    >
                                        <Play className="mr-2 h-5 w-5 fill-current" />
                                        Continue Reading
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </>
                ) : (
                    // Empty State
                    <div className="flex flex-col items-center justify-center p-12 bg-card/40 backdrop-blur-sm border border-dashed border-border rounded-3xl min-h-[400px]">
                        <div className="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-6">
                            <BookOpen size={48} />
                        </div>
                        <h2 className="text-2xl font-bold mb-2">Start Your Reading Journey</h2>
                        <p className="text-muted-foreground mb-8 text-center max-w-md">
                            Import your favorite books to get started. Track your progress, set goals, and build your digital library.
                        </p>
                        <Button
                            size="lg"
                            className="rounded-full"
                            onClick={() => navigate('/library')}
                        >
                            Go to Library
                        </Button>
                    </div>
                )}
            </section>

            {/* Reading Goals */}
            <section>
                <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
                    Reading Goals
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Activity Ring */}
                    <ReadingActivityCard />

                    {/* Streak */}
                    <StreaksCard />

                    {/* Yearly Challenge - Keep static for now or move to store later if needed */}
                    <Card className="bg-gradient-to-br from-card to-background border-none shadow-sm hover:shadow-md transition-shadow">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Yearly Challenge</CardTitle>
                        </CardHeader>
                        <CardContent className="flex items-center gap-4">
                            <div className="h-12 w-12 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500">
                                <Trophy className="h-6 w-6 fill-current" />
                            </div>
                            <div>
                                <div className="text-2xl font-bold">{sortedBooks.filter(b => b.status === 'Completed').length} <span className="text-base font-normal">Books</span></div>
                                <p className="text-xs text-muted-foreground">Read this year</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="mt-8">
                    <AchievementsList />
                </div>
            </section>

            {/* Up Next & Recent */}
            {upNextBooks.length > 0 && (
                <section>
                    <h3 className="text-xl font-semibold mb-6">Up Next</h3>
                    <ScrollArea className="w-full whitespace-nowrap pb-4">
                        <div className="flex w-max space-x-6">
                            {upNextBooks.map((book) => (
                                <div key={book.id} className="w-36 md:w-44 space-y-3 relative group">
                                    <div
                                        className="overflow-hidden rounded-lg shadow-md transition-all duration-300 group-hover:shadow-xl group-hover:-translate-y-1 cursor-pointer bg-muted/20"
                                        onClick={() => handleReadClick(book.id)}
                                    >
                                        {book.cover ? (
                                            <img
                                                src={book.cover}
                                                alt={book.title}
                                                className="h-auto w-full object-cover aspect-[2/3]"
                                            />
                                        ) : (
                                            <div className="w-full h-full aspect-[2/3] flex items-center justify-center text-muted-foreground">
                                                <BookOpen size={32} />
                                            </div>
                                        )}
                                    </div>
                                    <div className="space-y-1 text-sm">
                                        <h4 className="font-medium leading-none truncate" title={book.title}>{book.title}</h4>
                                        <p className="text-xs text-muted-foreground truncate">{book.author}</p>
                                    </div>

                                    {/* Menu Trigger */}
                                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="secondary" size="icon" className="h-8 w-8 rounded-full bg-black/60 hover:bg-black/80 text-white backdrop-blur-sm border-none">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={() => handleReadClick(book.id)}>Read Now</DropdownMenuItem>
                                                <DropdownMenuItem>Mark as Finished</DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <ScrollBar orientation="horizontal" className="hidden" />
                    </ScrollArea>
                </section>
            )}
        </div>
    );
}
