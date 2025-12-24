import React from 'react';
import { Search, Grid, List, Filter, ArrowUpDown } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "./ui/select";
import { cn } from '../lib/utils';

export type ViewMode = 'grid' | 'list';
export type SortOption = 'title' | 'author' | 'recent' | 'lastRead';
export type FilterOption = 'all' | 'reading' | 'completed' | 'toread';

interface LibraryToolbarProps {
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    viewMode: ViewMode;
    setViewMode: (mode: ViewMode) => void;
    sortBy: SortOption;
    setSortBy: (sort: SortOption) => void;
    filterStatus: FilterOption;
    setFilterStatus: (status: FilterOption) => void;
    className?: string;
}

export const LibraryToolbar: React.FC<LibraryToolbarProps> = ({
    searchQuery,
    setSearchQuery,
    viewMode,
    setViewMode,
    sortBy,
    setSortBy,
    filterStatus,
    setFilterStatus,
    className
}) => {
    return (
        <div className={cn("flex flex-col md:flex-row gap-4 items-center justify-between p-4 px-0 bg-background/95 backdrop-blur sticky top-0 z-10 py-6", className)}>
            {/* Search */}
            <div className="relative w-full md:w-72">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                    placeholder="Search library..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 bg-muted/40 border-border/50 focus:bg-background transition-all"
                />
            </div>

            {/* Controls */}
            <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 scrollbar-hide">

                {/* Filter */}
                <div className="flex items-center gap-2">
                    <Select value={filterStatus} onValueChange={(val) => setFilterStatus(val as FilterOption)}>
                        <SelectTrigger className="w-[140px] bg-background border-border/50">
                            <Filter className="w-4 h-4 mr-2" />
                            <SelectValue placeholder="Filter" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Books</SelectItem>
                            <SelectItem value="reading">Reading</SelectItem>
                            <SelectItem value="toread">To Read</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Sort */}
                <div className="flex items-center gap-2">
                    <Select value={sortBy} onValueChange={(val) => setSortBy(val as SortOption)}>
                        <SelectTrigger className="w-[150px] bg-background border-border/50">
                            <ArrowUpDown className="w-4 h-4 mr-2" />
                            <SelectValue placeholder="Sort by" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="recent">Recently Added</SelectItem>
                            <SelectItem value="title">Title</SelectItem>
                            <SelectItem value="author">Author</SelectItem>
                            <SelectItem value="lastRead">Last Read</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* View Toggle */}
                <div className="flex items-center bg-muted/50 p-1 rounded-lg border border-border/50">
                    <Button
                        variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => setViewMode('grid')}
                    >
                        <Grid size={16} />
                    </Button>
                    <Button
                        variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => setViewMode('list')}
                    >
                        <List size={16} />
                    </Button>
                </div>
            </div>
        </div>
    );
};
