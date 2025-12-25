
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Library from './pages/Library';
import Settings from './pages/Settings';
import Reader from './pages/Reader';
import { Toaster } from './components/ui/sonner';
import { MainLayout } from './layouts/MainLayout';

import { useThemeColor } from './hooks/useThemeColor';

function ThemeWatcher() {
    useThemeColor();
    return null;
}

function App() {
    return (
        <Router>
            <ThemeWatcher />
            <div className="w-full h-full bg-background text-foreground transition-colors duration-300">
                <Routes>
                    <Route element={<MainLayout />}>
                        <Route path="/" element={<Home />} />
                        <Route path="/library" element={<Library />} />
                        {/* Placeholder routes for Sidebar links to prevent 404, pointing to Library for now or handled client-side */}
                        <Route path="/favorites" element={<Library />} />
                        <Route path="/history" element={<Library />} />
                        <Route path="/settings" element={<Settings />} />
                    </Route>
                    <Route path="/read/:id" element={<Reader />} />
                </Routes>
                <Toaster />
            </div>
        </Router>
    );
}

export default App;
