import React from 'react';
import { Search, Grid, List, ArrowUpDown, BookOpen, CheckCircle, Layers } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "./ui/select";
import { Tabs, TabsList, TabsTrigger } from "./ui/tabs";
import { cn } from '../lib/utils';

export type ViewMode = 'grid' | 'list';
export type SortOption = 'title' | 'author' | 'recent' | 'lastRead';
export type FilterOption = 'all' | 'reading' | 'completed';

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
        <div className={cn("flex flex-col gap-4 py-4 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-30 w-full border-b border-border/40 shadow-sm", className)}>
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                {/* Search */}
                <div className="relative w-full md:w-[300px]">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                        placeholder="Search library..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9 bg-background"
                    />
                </div>

                {/* Tabs for Filter */}
                <Tabs
                    defaultValue="all"
                    value={filterStatus}
                    onValueChange={(val) => setFilterStatus(val as FilterOption)}
                    className="w-full md:w-auto"
                >
                    <TabsList className="grid w-full md:w-auto grid-cols-3 h-11">
                        <TabsTrigger value="all" className="h-9">
                            <Layers className="w-4 h-4 md:hidden" />
                            <span className="hidden md:inline">All</span>
                        </TabsTrigger>
                        <TabsTrigger value="reading" className="h-9">
                            <BookOpen className="w-4 h-4 md:hidden" />
                            <span className="hidden md:inline">Reading</span>
                        </TabsTrigger>
                        <TabsTrigger value="completed" className="h-9">
                            <CheckCircle className="w-4 h-4 md:hidden" />
                            <span className="hidden md:inline">Finished</span>
                        </TabsTrigger>
                    </TabsList>
                </Tabs>

                {/* Right Side Controls */}
                <div className="flex items-center gap-3 w-full md:w-auto">
                    {/* Sort */}
                    <Select value={sortBy} onValueChange={(val) => setSortBy(val as SortOption)}>
                        <SelectTrigger className="w-[50px] md:w-[160px] px-2 md:px-3 bg-background h-11 transition-all">
                            <ArrowUpDown className="w-4 h-4 mx-auto md:mx-0 md:mr-2" />
                            <span className="hidden md:inline overflow-hidden text-ellipsis whitespace-nowrap">
                                <SelectValue placeholder="Sort by" />
                            </span>
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="recent">Newest</SelectItem>
                            <SelectItem value="title">Alphabetical</SelectItem>
                            <SelectItem value="author">Author</SelectItem>
                            <SelectItem value="lastRead">Last Read</SelectItem>
                        </SelectContent>
                    </Select>

                    {/* View Toggle */}
                    <div className="flex items-center bg-muted/50 p-1 rounded-lg border border-border/50 shrink-0">
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
        </div>
    );
};
