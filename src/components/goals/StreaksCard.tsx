import React from 'react';
import { useGamificationStore } from '../../hooks/useGamificationStore';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Flame } from 'lucide-react';
import { cn } from '../../lib/utils';

export const StreaksCard: React.FC = () => {
    const { streak, lastReadDate } = useGamificationStore();

    // Check if read today
    const today = new Date().toISOString().split('T')[0];
    const isReadToday = lastReadDate === today;

    // Generate dummy week history (mock for now, ideally strictly tracked)
    // In a real app, 'streak' would be calculated from a history array.
    // Here we just visualize 7 dots, highlighting the last 'streak' count days up to 7.
    const weekDots = Array.from({ length: 7 }).map((_, i) => {
        // Simple visualization: if streak is N, fill N dots from right? 
        // Or just random for now? Let's just show filled if i < streak (capped at 7)
        return i < Math.min(streak, 7);
    });

    return (
        <Card className="bg-gradient-to-br from-card to-background border-none shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Streak</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
                <div className="flex items-center gap-4">
                    <div className={cn(
                        "h-12 w-12 rounded-full flex items-center justify-center transition-colors",
                        isReadToday ? "bg-orange-500/10 text-orange-500" : "bg-muted text-muted-foreground"
                    )}>
                        <Flame className={cn("h-6 w-6 fill-current", isReadToday && "animate-pulse")} />
                    </div>
                    <div>
                        <div className="text-2xl font-bold">{streak} <span className="text-base font-normal">Days</span></div>
                        <p className="text-xs text-muted-foreground">
                            {isReadToday ? "Streak active!" : "Read today to keep it!"}
                        </p>
                    </div>
                </div>

                {/* Mini Week Visual */}
                <div className="flex gap-2 mt-2">
                    {weekDots.map((filled, i) => (
                        <div
                            key={i}
                            className={cn(
                                "h-2 w-2 rounded-full",
                                filled ? "bg-orange-500" : "bg-muted"
                            )}
                        />
                    ))}
                </div>
            </CardContent>
        </Card>
    );
};
