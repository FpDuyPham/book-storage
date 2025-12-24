import React, { useState } from 'react';
import { Book } from '../services/db';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "./ui/dialog";
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Input } from './ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "./ui/select";

interface EditBookDialogProps {
    book: Book | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSave: (id: string, updates: Partial<Book>) => Promise<void>;
}

export const EditBookDialog: React.FC<EditBookDialogProps> = ({ book, open, onOpenChange, onSave }) => {
    const [title, setTitle] = useState(book?.title || '');
    const [author, setAuthor] = useState(book?.author || '');
    const [genre, setGenre] = useState(book?.genre || 'General');
    const [status, setStatus] = useState<Book['status']>('To Read');
    const [isSaving, setIsSaving] = useState(false);

    // Sync state when book changes
    React.useEffect(() => {
        if (book) {
            setTitle(book.title);
            setAuthor(book.author);
            setGenre(book.genre || 'General');
            setStatus(book.status || 'To Read');
        }
    }, [book]);

    const handleSave = async () => {
        if (!book) return;
        setIsSaving(true);
        try {
            await onSave(book.id, {
                title,
                author,
                genre,
                status
            });
            onOpenChange(false);
        } catch (error) {
            console.error("Failed to save book", error);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Edit Book Details</DialogTitle>
                    <DialogDescription>
                        Make changes to your book here. Click save when you're done.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="title" className="text-right">
                            Title
                        </Label>
                        <Input
                            id="title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="col-span-3"
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="author" className="text-right">
                            Author
                        </Label>
                        <Input
                            id="author"
                            value={author}
                            onChange={(e) => setAuthor(e.target.value)}
                            className="col-span-3"
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="genre" className="text-right">
                            Genre
                        </Label>
                        <Input
                            id="genre"
                            value={genre}
                            onChange={(e) => setGenre(e.target.value)}
                            className="col-span-3"
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="status" className="text-right">
                            Status
                        </Label>
                        <Select value={status} onValueChange={(val: any) => setStatus(val)}>
                            <SelectTrigger className="col-span-3">
                                <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="To Read">To Read</SelectItem>
                                <SelectItem value="Reading">Reading</SelectItem>
                                <SelectItem value="Completed">Completed</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <DialogFooter>
                    <Button type="submit" onClick={handleSave} disabled={isSaving}>
                        {isSaving ? "Saving..." : "Save changes"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
