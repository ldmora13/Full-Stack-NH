import { useState } from 'react';
import type { ReactNode } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
    LayoutDashboard,
    Ticket,
    LogOut,
    Menu,
    X,
    ChevronLeft,
    ChevronRight,
    Users,
} from 'lucide-react';
import { clsx } from 'clsx';
import Footer from './Footer';
import LanguageSelector from './LanguageSelector';

export default function Layout({ children }: { children: ReactNode }) {
    const { logout, user } = useAuth();
    const location = useLocation();
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const { t } = useTranslation();

    const baseNavItems = [
        { label: t('nav.dashboard'), icon: LayoutDashboard, path: '/dashboard' },
        { label: t('nav.tickets'), icon: Ticket, path: '/tickets' },
    ];

    // Add Users menu item only for admins
    const navItems = user?.role === 'ADMIN'
        ? [...baseNavItems, { label: t('nav.users'), icon: Users, path: '/users' }]
        : baseNavItems;

    return (
        <div className="min-h-screen bg-slate-950 text-white flex">
            {/* Sidebar */}
            <aside
                className={clsx(
                    "fixed lg:static inset-y-0 left-0 z-50 transition-all duration-300 ease-in-out flex flex-col",
                    "border-r border-slate-800/50 bg-slate-900/60 backdrop-blur-xl",
                    isSidebarOpen ? "w-64 translate-x-0" : "-translate-x-full lg:translate-x-0 lg:w-20"
                )}
            >
                <div className="p-6 flex items-center justify-between h-20 relative">
                    {/* Logo/Title with transition */}
                    <div className={clsx("flex items-center gap-3 transition-opacity duration-300", !isSidebarOpen ? "w-0 opacity-0 lg:w-auto lg:opacity-100 lg:absolute lg:left-1/2 lg:-translate-x-1/2" : "opacity-100")}>
                        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                            <span className="font-bold text-slate-900">NH</span>
                        </div>
                        {isSidebarOpen && (
                            <h1 className="font-bold text-white text-lg overflow-hidden whitespace-nowrap tracking-tight">
                                New Horizons
                            </h1>
                        )}
                    </div>

                    <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden text-slate-400">
                        <X className="w-6 h-6" />
                    </button>

                    {/* Desktop Toggle Button */}
                    <button
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        className={clsx(
                            "hidden lg:flex items-center justify-center p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors absolute -right-3 top-8 border border-slate-700 bg-slate-900 shadow-xl"
                        )}
                    >
                        {isSidebarOpen ? <ChevronLeft className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                    </button>
                </div>

                <nav className="flex-1 px-3 space-y-1 mt-6">
                    {navItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={clsx(
                                "flex items-center gap-3 px-3 py-3 rounded-xl transition-all overflow-hidden whitespace-nowrap group relative",
                                location.pathname.startsWith(item.path)
                                    ? "text-emerald-400 font-medium"
                                    : "text-slate-400 hover:text-slate-100"
                            )}
                            title={!isSidebarOpen ? item.label : undefined}
                        >
                            {location.pathname.startsWith(item.path) && (
                                <div className="absolute inset-0 bg-emerald-500/10 rounded-xl border border-emerald-500/20" />
                            )}
                            <item.icon className={clsx("w-5 h-5 min-w-[1.25rem] relative z-10 transition-colors", location.pathname.startsWith(item.path) ? "text-emerald-400" : "text-slate-500 group-hover:text-slate-300")} />
                            <span className={clsx("relative z-10 transition-all duration-300", !isSidebarOpen && "lg:opacity-0 lg:w-0")}>
                                {item.label}
                            </span>
                        </Link>
                    ))}
                </nav>

                <div className="p-4 border-t border-slate-800/50 space-y-2">
                    <div className={clsx("flex items-center transition-all duration-300", isSidebarOpen ? "justify-start px-4" : "justify-center")}>
                        <LanguageSelector collapsed={!isSidebarOpen} />
                    </div>

                    <button
                        onClick={() => logout()}
                        className="flex items-center gap-3 w-full px-4 py-3 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all overflow-hidden whitespace-nowrap group"
                        title={!isSidebarOpen ? t('nav.logout') : undefined}
                    >
                        <LogOut className="w-5 h-5 min-w-[1.25rem] group-hover:translate-x-1 transition-transform" />
                        <span className={clsx("transition-all duration-300", !isSidebarOpen && "lg:opacity-0 lg:w-0")}>
                            {t('nav.logout')}
                        </span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 min-w-0 h-screen overflow-auto flex flex-col">
                <header className="h-16 border-b border-slate-800 bg-slate-900/50 backdrop-blur-xl flex items-center px-6 lg:hidden sticky top-0 z-40">
                    <button onClick={() => setIsSidebarOpen(true)}>
                        <Menu className="w-6 h-6 text-slate-300" />
                    </button>
                </header>
                <div className="flex-1 p-6 lg:p-8 max-w-7xl mx-auto w-full">
                    {children}
                </div>
                <Footer />
            </main>
        </div>
    );
}
