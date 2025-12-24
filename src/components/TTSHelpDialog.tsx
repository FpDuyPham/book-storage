import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "./ui/dialog";
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "./ui/tabs";
import { ScrollArea } from "./ui/scroll-area";
import { Smartphone, Monitor } from "lucide-react";

interface TTSHelpDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function TTSHelpDialog({ open, onOpenChange }: TTSHelpDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Enable Vietnamese Voice</DialogTitle>
                    <DialogDescription>
                        Follow these steps to install Vietnamese text-to-speech voice data for your device.
                    </DialogDescription>
                </DialogHeader>

                <Tabs defaultValue="android" className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="android">Android</TabsTrigger>
                        <TabsTrigger value="ios">iOS</TabsTrigger>
                        <TabsTrigger value="windows">Windows</TabsTrigger>
                    </TabsList>
                    <div className="mt-4 border rounded-md p-4 bg-muted/30">
                        <ScrollArea className="h-[200px] pr-4">
                            <TabsContent value="android" className="mt-0 space-y-3">
                                <div className="flex items-center gap-2 font-medium text-primary">
                                    <Smartphone className="w-4 h-4" /> Android Setup
                                </div>
                                <ol className="list-decimal pl-4 space-y-2 text-sm text-muted-foreground">
                                    <li>Install <strong>Google Text-to-Speech</strong> from Play Store if missing.</li>
                                    <li>Go to <strong>Settings</strong> &gt; <strong>System</strong> &gt; <strong>Languages & input</strong>.</li>
                                    <li>Select <strong>Text-to-speech output</strong>.</li>
                                    <li>Tap the gear icon next to <strong>Preferred engine</strong>.</li>
                                    <li>Tap <strong>Install voice data</strong>.</li>
                                    <li>Find <strong>Vietnamese (Vietnam)</strong> and download it.</li>
                                </ol>
                            </TabsContent>

                            <TabsContent value="ios" className="mt-0 space-y-3">
                                <div className="flex items-center gap-2 font-medium text-primary">
                                    <Smartphone className="w-4 h-4" /> iOS Setup
                                </div>
                                <ol className="list-decimal pl-4 space-y-2 text-sm text-muted-foreground">
                                    <li>Go to <strong>Settings</strong> &gt; <strong>Accessibility</strong>.</li>
                                    <li>Select <strong>Spoken Content</strong> &gt; <strong>Voices</strong>.</li>
                                    <li>Find <strong>Vietnamese</strong>.</li>
                                    <li>Download <strong>Linh</strong> or <strong>Nam</strong> (Enhanced quality recommended).</li>
                                </ol>
                            </TabsContent>

                            <TabsContent value="windows" className="mt-0 space-y-3">
                                <div className="flex items-center gap-2 font-medium text-primary">
                                    <Monitor className="w-4 h-4" /> Windows Setup
                                </div>
                                <ol className="list-decimal pl-4 space-y-2 text-sm text-muted-foreground">
                                    <li>Open <strong>Settings</strong> &gt; <strong>Time & Language</strong>.</li>
                                    <li>Select <strong>Speech</strong>.</li>
                                    <li>Under <strong>Manage voices</strong>, click <strong>Add voices</strong>.</li>
                                    <li>Search for <strong>Vietnamese</strong> and click <strong>Add</strong>.</li>
                                    <li>Wait for installation to complete.</li>
                                </ol>
                            </TabsContent>
                        </ScrollArea>
                    </div>
                </Tabs>
            </DialogContent>
        </Dialog>
    );
}
