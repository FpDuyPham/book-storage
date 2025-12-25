import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Achievement {
    id: string;
    title: string;
    description: string;
    icon: string; // Lucide icon name
    unlocked: boolean;
    unlockedAt?: string;
    progress: number;
    maxProgress: number;
}

interface GamificationState {
    dailyGoal: number; // in minutes
    streak: number;
    lastReadDate: string | null;
    totalMinutesRead: number;
    achievements: Achievement[];

    // Actions
    setDailyGoal: (minutes: number) => void;
    addReadingTime: (seconds: number) => void;
    unlockAchievement: (id: string) => void;
    checkStreak: () => void;
}

const INITIAL_ACHIEVEMENTS: Achievement[] = [
    { id: 'first_chapter', title: 'First Steps', description: 'Finished your first chapter', icon: 'BookOpen', unlocked: false, progress: 0, maxProgress: 1 },
    { id: 'bookworm', title: 'Bookworm', description: 'Read for 2 hours in one session', icon: 'Worm', unlocked: false, progress: 0, maxProgress: 120 },
    { id: 'night_owl', title: 'Night Owl', description: 'Read after 11 PM', icon: 'Moon', unlocked: false, progress: 0, maxProgress: 1 },
    { id: 'century', title: 'Century Club', description: 'Read 100 chapters', icon: 'Trophy', unlocked: false, progress: 0, maxProgress: 100 },
    { id: 'streak_7', title: 'Week Warrior', description: 'Reach a 7 day streak', icon: 'Flame', unlocked: false, progress: 0, maxProgress: 7 },
];

export const useGamificationStore = create<GamificationState>()(
    persist(
        (set, get) => ({
            dailyGoal: 30,
            streak: 0,
            lastReadDate: null,
            totalMinutesRead: 0,
            achievements: INITIAL_ACHIEVEMENTS,

            setDailyGoal: (minutes) => set({ dailyGoal: minutes }),

            addReadingTime: (_seconds) => {
                const { checkStreak } = get();
                // We don't update totalMinutesRead here directly for daily log, 
                // but we can track lifetime stats if needed. 
                // This action is mostly a trigger to check logic.
                checkStreak();
            },

            checkStreak: () => {
                const now = new Date();
                const today = now.toISOString().split('T')[0];
                const { lastReadDate, streak } = get();

                if (lastReadDate === today) return; // Already read today

                if (lastReadDate) {
                    const last = new Date(lastReadDate);
                    const diffTime = Math.abs(now.getTime() - last.getTime());
                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                    if (diffDays === 1) {
                        // Consecutive day
                        set({ streak: streak + 1, lastReadDate: today });
                    } else if (diffDays > 1) {
                        // Streak broken
                        set({ streak: 1, lastReadDate: today });
                    }
                } else {
                    // First time reading
                    set({ streak: 1, lastReadDate: today });
                }
            },

            unlockAchievement: (id) => {
                set((state) => ({
                    achievements: state.achievements.map((a) =>
                        a.id === id && !a.unlocked
                            ? { ...a, unlocked: true, unlockedAt: new Date().toISOString() }
                            : a
                    ),
                }));
            },
        }),
        {
            name: 'gamification-storage',
        }
    )
);
