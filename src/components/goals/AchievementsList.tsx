import React from 'react';
import { useGamificationStore, Achievement } from '../../hooks/useGamificationStore';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Lock, BookOpen, Scroll, Moon, Trophy, Flame } from 'lucide-react';
import { cn } from '../../lib/utils';

const iconMap: Record<string, any> = {
    BookOpen,
    Worm: Scroll, // Fallback for Worm
    Moon,
    Trophy,
    Flame
};

export const AchievementsList: React.FC = () => {
    const { achievements } = useGamificationStore();

    return (
        <Card className="border-none shadow-none bg-transparent">
            <CardHeader className="px-0 pt-0">
                <CardTitle className="text-xl font-semibold flex items-center gap-2">
                    Achievements
                    <Trophy className="h-4 w-4 text-muted-foreground" />
                </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4 px-0">
                {achievements.map((achievement) => (
                    <AchievementBadge key={achievement.id} achievement={achievement} />
                ))}
            </CardContent>
        </Card>
    );
};

const AchievementBadge = ({ achievement }: { achievement: Achievement }) => {
    const Icon = iconMap[achievement.icon] || Trophy;

    return (
        <Dialog>
            <DialogTrigger asChild>
                <div className={cn(
                    "aspect-square rounded-2xl flex flex-col items-center justify-center p-4 gap-2 cursor-pointer transition-all hover:scale-105 border",
                    achievement.unlocked
                        ? "bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20 shadow-sm"
                        : "bg-muted/50 border-transparent opacity-60 grayscale"
                )}>
                    <div className={cn(
                        "h-12 w-12 rounded-full flex items-center justify-center mb-1",
                        achievement.unlocked ? "bg-background shadow-inner text-primary" : "bg-muted text-muted-foreground"
                    )}>
                        {achievement.unlocked ? <Icon size={24} /> : <Lock size={20} />}
                    </div>
                    <span className="text-xs font-semibold text-center leading-tight">{achievement.title}</span>
                </div>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        {achievement.unlocked ? <Icon className="text-primary" /> : <Lock className="text-muted-foreground" />}
                        {achievement.title}
                    </DialogTitle>
                    <DialogDescription>
                        {achievement.description}
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                    <div className="text-sm font-medium">Status</div>
                    <div className={cn(
                        "mt-1 text-sm",
                        achievement.unlocked ? "text-green-600 font-bold" : "text-muted-foreground"
                    )}>
                        {achievement.unlocked ? `Unlocked on ${new Date(achievement.unlockedAt!).toLocaleDateString()}` : "Locked"}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};
