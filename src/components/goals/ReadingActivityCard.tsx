import React, { useEffect, useState } from 'react';
import { useGamificationStore } from '../../hooks/useGamificationStore';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';

export const ReadingActivityCard: React.FC = () => {
    const { dailyGoal } = useGamificationStore();
    const [minutesRead, setMinutesRead] = useState(0);

    // Load today's progress
    useEffect(() => {
        const loadProgress = () => {
            const today = new Date().toISOString().split('T')[0];
            const key = `reading_log_${today}`;
            try {
                const stored = localStorage.getItem(key);
                if (stored) {
                    const data = JSON.parse(stored);
                    // Sum all books
                    const totalSeconds = Object.values(data).reduce((a: any, b: any) => a + b, 0) as number;
                    setMinutesRead(Math.floor(totalSeconds / 60));
                }
            } catch (e) {
                console.error(e);
            }
        };

        loadProgress();
        // Poll every minute to update UI if dashboard is open
        const interval = setInterval(loadProgress, 60000);
        return () => clearInterval(interval);
    }, []);

    const percentage = Math.min(100, Math.round((minutesRead / dailyGoal) * 100));
    const radius = 50;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
        <Card className="bg-gradient-to-br from-card to-background border-none shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
            <CardHeader className="pb-2 z-10 relative">
                <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Daily Goal</CardTitle>
            </CardHeader>
            <CardContent className="z-10 relative">
                <div className="flex items-center gap-6">
                    <div className="relative h-24 w-24 shrink-0">
                        {/* Background Ring */}
                        <svg className="h-full w-full -rotate-90 transform" viewBox="0 0 120 120">
                            <circle
                                className="text-muted/20"
                                strokeWidth="12"
                                stroke="currentColor"
                                fill="transparent"
                                r={radius}
                                cx="60"
                                cy="60"
                            />
                            {/* Progress Ring */}
                            <circle
                                className="text-orange-500 transition-all duration-1000 ease-out"
                                strokeWidth="12"
                                strokeDasharray={circumference}
                                strokeDashoffset={strokeDashoffset}
                                strokeLinecap="round"
                                stroke="currentColor"
                                fill="transparent"
                                r={radius}
                                cx="60"
                                cy="60"
                            />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-2xl font-bold">{percentage}%</span>
                        </div>
                    </div>
                    <div className="flex flex-col">
                        <div className="text-3xl font-bold font-serif">
                            {minutesRead} <span className="text-lg font-normal text-muted-foreground">/ {dailyGoal} min</span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                            {minutesRead >= dailyGoal ? "Goal reached! Great job! 🎉" : `${dailyGoal - minutesRead} minutes to go`}
                        </p>
                    </div>
                </div>
            </CardContent>

            {/* Ambient Background Glow */}
            {percentage >= 100 && (
                <div className="absolute inset-0 bg-orange-500/10 blur-xl z-0 pointer-events-none" />
            )}
        </Card>
    );
};
