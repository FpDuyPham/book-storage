import Dexie, { type EntityTable } from 'dexie';

interface Book {
    id: string;
    title: string;
    author: string;
    cover: string | null;
    data?: ArrayBuffer;
    lastLocation: string | null;
    progress: number;
    addedAt: number;
    // New metadata
    status: 'Reading' | 'Completed' | 'To Read';
    genre: string;
    isFavorite: boolean;
    lastReadAt?: number;
    totalChapters?: number;
}

const db = new Dexie('StoryReaderDB') as Dexie & {
    books: EntityTable<Book, 'id'>;
};

db.version(1).stores({
    books: 'id, title, author, addedAt'
});

db.version(2).stores({
    books: 'id, title, author, addedAt, status, genre, isFavorite, lastReadAt'
}).upgrade(tx => {
    return tx.table('books').toCollection().modify(book => {
        book.status = 'To Read';
        book.genre = 'General';
        book.isFavorite = false;
        book.lastReadAt = undefined;
    });
});

db.version(3).stores({
    books: 'id, title, author, addedAt, status, genre, isFavorite, lastReadAt, totalChapters'
}).upgrade(tx => {
    return tx.table('books').toCollection().modify(book => {
        book.totalChapters = 0;
    });
});

// Migration helper
import { storageService } from './storage';

export async function migrateBooksToOPFS() {
    const books = await db.books.toArray();
    let migratedCount = 0;

    for (const book of books) {
        if (book.data) {
            try {
                // Save to OPFS
                await storageService.saveBookData(book.id, book.data);

                // Remove from Dexie (update record to have no data)
                await db.books.update(book.id, { data: undefined });

                migratedCount++;
            } catch (error) {
                console.error(`Failed to migrate book ${book.title} (${book.id})`, error);
            }
        }
    }

    if (migratedCount > 0) {
        console.log(`Successfully migrated ${migratedCount} books to OPFS`);
    }
}

export { db };
export type { Book };
