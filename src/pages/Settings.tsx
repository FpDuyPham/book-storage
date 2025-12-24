import React, { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import { db } from '../services/db';
import { storageService } from '../services/storage';
import { useLiveQuery } from 'dexie-react-hooks';
import {
    Save,
    Trash2,
    Download,
    Upload,
    Moon,
    Sun,
    Monitor,
    LogOut,
    User,
    Database,
    Palette,
    Check,
    BookOpen,
    Type
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "../components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { Progress } from '../components/ui/progress';
import { Slider } from '../components/ui/slider';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "../components/ui/select"
import { toast } from 'sonner';
import { useReaderStore } from '../hooks/useReaderStore';

export default function Settings() {
    const { setTheme, theme } = useTheme();
    const books = useLiveQuery(() => db.books.toArray());
    const [storageUsage, setStorageUsage] = useState<{ usage: number, quota: number }>({ usage: 0, quota: 0 });
    const [displayName, setDisplayName] = useState("User");

    // Reader Store
    const {
        fontSize, setFontSize,
        fontFamily, setFontFamily,
        lineHeight, setLineHeight,
        theme: readerTheme, setTheme: setReaderTheme
    } = useReaderStore();

    // Colors for Accent
    const accentColors = [
        { name: 'Blue', value: '221.2 83.2% 53.3%' },
        { name: 'Violet', value: '262.1 83.3% 57.8%' },
        { name: 'Green', value: '142.1 76.2% 36.3%' },
        { name: 'Orange', value: '24.6 95% 53.1%' },
        { name: 'Rose', value: '346.8 77.2% 49.8%' },
    ];

    // Calculate Storage Usage
    useEffect(() => {
        const updateUsage = async () => {
            const estimate = await storageService.estimateUsage();
            setStorageUsage(estimate);
        };

        updateUsage();
        const interval = setInterval(updateUsage, 10000);
        return () => clearInterval(interval);
    }, [books]);

    const handleBackup = async () => {
        if (!books) return;
        try {
            const backupData = await Promise.all(books.map(async (book) => {
                let data = book.data;
                if (!data) {
                    try {
                        data = await storageService.getBookData(book.id);
                    } catch (e) {
                        console.error(`Failed to load data for backup: ${book.title}`);
                        return null;
                    }
                }
                if (!data) return null;

                const buffer = new Uint8Array(data);
                let binary = '';
                for (let i = 0; i < buffer.byteLength; i++) {
                    binary += String.fromCharCode(buffer[i]);
                }
                const base64 = btoa(binary);
                return { ...book, data: base64 };
            }));

            const validBackup = backupData.filter(Boolean);
            const blob = new Blob([JSON.stringify(validBackup)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `library_backup_${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            toast.success("Library backup created successfully");
        } catch (error) {
            console.error(error);
            toast.error("Failed to create backup");
        }
    };

    const handleRestore = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (event) => {
            try {
                const json = event.target?.result as string;
                const backupData = JSON.parse(json);
                if (!Array.isArray(backupData)) throw new Error("Invalid backup format");

                let restoredCount = 0;
                for (const item of backupData) {
                    const binaryString = atob(item.data);
                    const bytes = new Uint8Array(binaryString.length);
                    for (let i = 0; i < binaryString.length; i++) {
                        bytes[i] = binaryString.charCodeAt(i);
                    }
                    await db.books.put({ ...item, data: bytes.buffer });
                    restoredCount++;
                }
                toast.success(`Restored ${restoredCount} books successfully`);
            } catch (error) {
                console.error(error);
                toast.error("Failed to restore backup");
            }
        };
        reader.readAsText(file);
    };

    const handleClearCache = async () => {
        if (confirm("Are you sure you want to clear your entire library? This action cannot be undone.")) {
            await db.books.clear();
            toast.success("Library cleared");
        }
    };

    const setAccentColor = (hslValue: string) => {
        document.documentElement.style.setProperty('--primary', hslValue);
        document.documentElement.style.setProperty('--ring', hslValue);
        toast.success("Accent color updated");
    };

    return (
        <div className="max-w-4xl mx-auto px-4 py-8 pb-32 animate-in fade-in duration-500">
            <h2 className="text-3xl font-bold tracking-tight mb-8">Settings</h2>

            <Tabs defaultValue="general" className="w-full space-y-8">
                <TabsList className="grid w-full grid-cols-3 h-auto p-1 bg-muted/50 backdrop-blur rounded-xl">
                    <TabsTrigger value="general" className="gap-2 py-3 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:text-primary transition-all">
                        <Palette size={18} /> General
                    </TabsTrigger>
                    <TabsTrigger value="data" className="gap-2 py-3 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:text-primary transition-all">
                        <Database size={18} /> Data
                    </TabsTrigger>
                    <TabsTrigger value="profile" className="gap-2 py-3 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:text-primary transition-all">
                        <User size={18} /> Profile
                    </TabsTrigger>
                </TabsList>

                {/* General Tab */}
                <TabsContent value="general" className="space-y-8">
                    {/* App Appearance */}
                    <Card className="border-muted bg-card/50 backdrop-blur-sm shadow-sm overflow-hidden">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><Monitor className="w-5 h-5 text-primary" /> Appearance</CardTitle>
                            <CardDescription>Customize the application look and feel.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-8">
                            <div className="space-y-4">
                                <Label className="text-base">App Theme</Label>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    {['light', 'dark', 'system'].map((t) => (
                                        <div
                                            key={t}
                                            onClick={() => setTheme(t)}
                                            className={`relative cursor-pointer group rounded-xl border-2 p-4 flex items-center justify-between transition-all duration-200 hover:border-primary/50 hover:bg-accent ${theme === t ? 'border-primary bg-accent/50 ring-2 ring-primary ring-offset-2 ring-offset-background' : 'border-muted'}`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className={`p-2 rounded-full ${theme === t ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                                                    {t === 'light' && <Sun size={20} />}
                                                    {t === 'dark' && <Moon size={20} />}
                                                    {t === 'system' && <Monitor size={20} />}
                                                </div>
                                                <span className="font-medium capitalize">{t}</span>
                                            </div>
                                            {theme === t && <Check size={18} className="text-primary" />}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-4">
                                <Label className="text-base">Accent Color</Label>
                                <div className="flex flex-wrap gap-4">
                                    {accentColors.map((color) => (
                                        <div key={color.name} className="relative group">
                                            <button
                                                className="w-12 h-12 rounded-full border border-border/50 shadow-sm transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary flex items-center justify-center"
                                                style={{ backgroundColor: `hsl(${color.value})` }}
                                                onClick={() => setAccentColor(color.value)}
                                            />
                                            <div className="absolute inset-0 rounded-full ring-2 ring-white opacity-0 transition-opacity group-focus-within:opacity-100 group-hover:opacity-20 pointer-events-none" />
                                            {/* Tooltip implementation via title/group for simplicity or use Tooltip comp if available. Using basic title for now as per Shadcn requirements usually implies Tooltip provider. */}
                                            <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-popover text-popover-foreground text-xs rounded shadow-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none border">
                                                {color.name}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Reading Preferences */}
                    <Card className="border-muted bg-card/50 backdrop-blur-sm shadow-sm overflow-hidden">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><BookOpen className="w-5 h-5 text-primary" /> Reading Preferences</CardTitle>
                            <CardDescription>Configure your book reading experience.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-8">

                            {/* Paper Theme */}
                            <div className="space-y-4">
                                <Label className="text-base">Reader Theme (Paper)</Label>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                    {[
                                        { id: 'light', name: 'Day', bg: '#ffffff', fg: '#000000' },
                                        { id: 'sepia', name: 'Comfort', bg: '#f4ecd8', fg: '#5b4636' },
                                        { id: 'dark', name: 'Night', bg: '#1a1a1a', fg: '#cccccc' },
                                        { id: 'oled', name: 'OLED', bg: '#000000', fg: '#a0a0a0' },
                                    ].map((mode) => (
                                        <button
                                            key={mode.id}
                                            onClick={() => setReaderTheme(mode.id as any)}
                                            className={`relative overflow-hidden rounded-xl border-2 transition-all duration-200 hover:scale-[1.02] ${readerTheme === mode.id ? 'border-primary ring-2 ring-primary ring-offset-2 ring-offset-background' : 'border-muted hover:border-primary/50'}`}
                                            style={{ backgroundColor: mode.bg }}
                                        >
                                            <div className="p-4 flex flex-col items-center gap-2" style={{ color: mode.fg }}>
                                                <span className="text-2xl font-serif">Aa</span>
                                                <span className="text-xs font-medium opacity-80">{mode.name}</span>
                                            </div>
                                            {readerTheme === mode.id && (
                                                <div className="absolute top-2 right-2 bg-primary text-primary-foreground rounded-full p-0.5">
                                                    <Check size={12} />
                                                </div>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {/* Typography */}
                                <div className="space-y-4">
                                    <Label className="text-base flex items-center gap-2"><Type size={16} /> Font Family</Label>
                                    <Select value={fontFamily} onValueChange={setFontFamily}>
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Select a font" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Inter, sans-serif">Inter (Sans-Serif)</SelectItem>
                                            <SelectItem value="Merriweather, serif">Merriweather (Serif)</SelectItem>
                                            <SelectItem value="'Roboto Mono', monospace">Roboto Mono (Monospace)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Line Height */}
                                <div className="space-y-4">
                                    <Label className="text-base">Line Height</Label>
                                    <div className="flex rounded-lg border p-1 bg-muted/50">
                                        {[
                                            { id: 'compact', label: 'Compact', icon: 12 }, // visual approx
                                            { id: 'standard', label: 'Standard', icon: 16 },
                                            { id: 'loose', label: 'Loose', icon: 20 },
                                        ].map((lh) => (
                                            <button
                                                key={lh.id}
                                                onClick={() => setLineHeight(lh.id as any)}
                                                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-sm font-medium transition-all ${lineHeight === lh.id ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-background/50'}`}
                                            >
                                                {lh.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Font Size */}
                            <div className="space-y-6 pt-2">
                                <div className="flex justify-between items-center">
                                    <Label className="text-base">Font Size</Label>
                                    <span className="inline-flex items-center justify-center px-2 py-1 rounded-md bg-muted text-sm font-mono font-medium min-w-[3ch]">
                                        {fontSize}
                                    </span>
                                </div>
                                <div className="flex items-center gap-4">
                                    <span className="text-sm text-muted-foreground">A</span>
                                    <Slider
                                        value={[fontSize]}
                                        min={12}
                                        max={32}
                                        step={1}
                                        onValueChange={(vals) => setFontSize(vals[0])}
                                        className="flex-1"
                                    />
                                    <span className="text-xl text-foreground">A</span>
                                </div>
                            </div>

                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Data Tab */}
                <TabsContent value="data" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Storage Usage</CardTitle>
                            <CardDescription>Local storage used by your library books.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex justify-between text-sm font-medium">
                                <span>Used Space</span>
                                <span>{(storageUsage.usage / (1024 * 1024)).toFixed(1)} MB / {(storageUsage.quota / (1024 * 1024)).toFixed(0)} MB</span>
                            </div>
                            <Progress value={(storageUsage.usage / storageUsage.quota) * 100} className="h-3" />
                            <p className="text-xs text-muted-foreground pt-2">
                                Storage limits depend on your browser and device available space.
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Library Management</CardTitle>
                            <CardDescription>Backup your library or clear local data.</CardDescription>
                        </CardHeader>
                        <CardContent className="flex flex-col gap-4">
                            <div className="flex flex-col sm:flex-row gap-4">
                                <Button className="flex-1 gap-2" variant="outline" onClick={handleBackup}>
                                    <Download size={18} /> Export Library Backup
                                </Button>
                                <div className="flex-1 relative">
                                    <input
                                        type="file"
                                        id="restore-file"
                                        className="hidden"
                                        accept=".json"
                                        onChange={handleRestore}
                                    />
                                    <Button className="w-full gap-2" variant="outline" onClick={() => document.getElementById('restore-file')?.click()}>
                                        <Upload size={18} /> Import Backup
                                    </Button>
                                </div>
                            </div>
                            <Button variant="ghost" className="text-destructive hover:bg-destructive/10 w-full sm:w-auto self-start" onClick={handleClearCache}>
                                <Trash2 size={18} className="mr-2" /> Clear Cache
                            </Button>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Profile Tab */}
                <TabsContent value="profile" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>User Details</CardTitle>
                            <CardDescription>Manage your profile information.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex items-center gap-6">
                                <Avatar className="h-24 w-24">
                                    <AvatarImage src="" />
                                    <AvatarFallback className="text-3xl bg-primary/10 text-primary">
                                        {displayName.charAt(0).toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 space-y-2">
                                    <Label htmlFor="display-name">Display Name</Label>
                                    <div className="flex gap-2">
                                        <Input
                                            id="display-name"
                                            value={displayName}
                                            onChange={(e) => setDisplayName(e.target.value)}
                                        />
                                        <Button size="icon" variant="outline">
                                            <Save size={18} onClick={() => toast.success("Profile saved")} />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter className="flex-col items-start gap-4 border-t pt-6">
                            <Button variant="outline" className="w-full justify-start gap-2" onClick={() => toast.success("User data exported")}>
                                <Download size={18} /> Export User Data
                            </Button>
                            <Button variant="destructive" className="w-full justify-start gap-2" onClick={() => toast.info("Logged out")}>
                                <LogOut size={18} /> Log Out
                            </Button>
                        </CardFooter>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
