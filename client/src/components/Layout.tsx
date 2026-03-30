import { useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Scale,
  LayoutDashboard,
  Ticket,
  LogOut,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  Users,
  MessageSquare,
  User,
} from 'lucide-react';
import { clsx } from 'clsx';
import Footer from './Footer';
import LanguageSelector from './LanguageSelector';
import UserAvatar from './UserAvatar';
import { Menu as HMenu, Transition } from '@headlessui/react';
import { Fragment } from 'react';

export default function Layout({ children }: { children: ReactNode }) {
  const { logout, user } = useAuth();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
    // Default to closed on mobile, open on desktop
    return typeof window !== 'undefined' ? window.innerWidth >= 1024 : true;
  });
  const { t } = useTranslation();

  useEffect(() => {
    // Close sidebar on navigation if on mobile
    if (window.innerWidth < 1024) {
      setIsSidebarOpen(false);
    }
  }, [location.pathname]);

  const baseNavItems = [
    { label: t('nav.dashboard'), icon: LayoutDashboard, path: '/dashboard' },
    { label: t('nav.tickets'), icon: Ticket, path: '/tickets' },
    { label: t('nav.messages', 'Messages'), icon: MessageSquare, path: '/messages' },
    { label: t('nav.profile'), icon: User, path: '/profile' },
  ];

  const navItems = user?.role === 'ADMIN'
    ? [...baseNavItems, { label: t('nav.users'), icon: Users, path: '/users' }]
    : baseNavItems;

  return (
    <div className="min-h-screen text-white flex">
      {/* Sidebar */}
      <aside
        className={clsx(
          "fixed lg:static inset-y-0 left-0 z-50 transition-all duration-300 ease-in-out flex flex-col",
          "border-r border-white/10 bg-black/20 backdrop-blur-xl",
          isSidebarOpen ? "w-64 translate-x-0" : "-translate-x-full lg:translate-x-0 lg:w-20"
        )}
      >
        {/* Header */}
        <div className="p-6 flex items-center justify-between h-20 relative">
          <div className={clsx("flex items-center gap-3 transition-opacity duration-300", !isSidebarOpen ? "w-0 opacity-0 lg:w-auto lg:opacity-100 lg:absolute lg:left-1/2 lg:-translate-x-1/2" : "opacity-100")}>
            <div className="w-8 h-8 rounded-xl bg-linear-to-br from-blue-400 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Scale className="w-4 h-4 text-white" />
            </div>
            {isSidebarOpen && (
              <h1 className="font-bold text-white text-lg overflow-hidden whitespace-nowrap tracking-tight">
                New Horizons
              </h1>
            )}
          </div>

          <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden text-blue-400">
            <X className="w-6 h-6" />
          </button>

          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="hidden lg:flex items-center justify-center p-1.5 rounded-lg text-blue-400 hover:text-white hover:bg-blue-500/10 transition-colors absolute -right-3 top-8 border border-blue-500/20 bg-blue-500/10 shadow-xl"
          >
            {isSidebarOpen ? <ChevronLeft className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 space-y-1 mt-6">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={clsx(
                "flex items-center gap-3 px-3 py-3 rounded-xl transition-all overflow-hidden whitespace-nowrap group relative",
                location.pathname.startsWith(item.path)
                  ? "text-white"
                  : "text-slate-400 hover:text-slate-100"
              )}
              title={!isSidebarOpen ? item.label : undefined}
            >
              {location.pathname.startsWith(item.path) && (
                <div className="absolute inset-0 bg-blue-500/10 rounded-xl border border-blue-500/20" />
              )}
              <item.icon className={clsx(
                "w-5 h-5 min-w-5 relative z-10 transition-colors",
                location.pathname.startsWith(item.path) ? "text-blue-400" : "text-slate-500 group-hover:text-slate-300"
              )} />
              <span className={clsx("relative z-10 transition-all duration-300", !isSidebarOpen && "lg:opacity-0 lg:w-0")}>
                {item.label}
              </span>
            </Link>
          ))}
        </nav>

        {/* Bottom: Language + User card */}
        <div className="p-4 border-t border-white/10/50 space-y-2">
          <div className={clsx("flex items-center transition-all duration-300", isSidebarOpen ? "justify-start px-5" : "justify-center")}>
            <LanguageSelector collapsed={!isSidebarOpen} />
          </div>

          {/* User Card / Logout */}
          {user && (
            <HMenu as="div" className="relative w-full">
              <HMenu.Button className={clsx(
                "flex items-center w-full rounded-xl p-2 hover:bg-slate-800/50 transition-all gap-3 group",
                isSidebarOpen ? "m-5" : "justify-center ml-0"
              )}>
                <UserAvatar name={user.name} role={user.role as any} size="sm" showBadge />
                {isSidebarOpen && (
                  <div className="flex flex-col items-start min-w-0 ml-2">
                    <span className="text-sm font-medium text-slate-200 truncate max-w-30">{user.name}</span>
                    <span className="text-xs text-slate-500">{user.role}</span>
                  </div>
                )}
              </HMenu.Button>

              <Transition
                as={Fragment}
                enter="transition ease-out duration-100"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
              >
                <HMenu.Items className={clsx(isSidebarOpen ? "absolute bottom-38 left-4 w-48 rounded-xl bg-[#1d2532] border border-slate-700 shadow-xl focus:outline-none" 
                  : "absolute w-48 bottom-14 left-17 rounded-xl bg-[#1d2532] border border-slate-700 shadow-xl focus:outline-none")}>
                  <div className="p-1">
                    <HMenu.Item>
                      {({ active }) => (
                        <Link
                          to="/profile"
                          className={clsx(
                            'flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors',
                            active ? 'bg-slate-700 text-white' : 'text-slate-300'
                          )}
                        >
                          <User className="w-4 h-4" />
                           <span>{t('nav.profile')}</span>
                        </Link>
                      )}
                    </HMenu.Item>
                    <HMenu.Item>
                      {({ active }) => (
                        <button
                          onClick={() => logout()}
                          className={clsx(
                            'flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm transition-colors',
                            active ? 'bg-red-500/10 text-red-400' : 'text-slate-300'
                          )}
                        >
                          <LogOut className="w-4 h-4" />
                          {t('nav.logout')}
                        </button>
                      )}
                    </HMenu.Item>
                  </div>
                </HMenu.Items>
              </Transition>
            </HMenu>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-w-0 h-screen overflow-auto flex flex-col">
        <header className="h-16 border-b border-white/10 bg-white/5 backdrop-blur-xl flex items-center py-4 px-6 lg:hidden flex top-0 z-40">
          <button onClick={() => setIsSidebarOpen(true)}>
            <Menu className="w-6 h-6 text-slate-300" />
          </button>
          {user && (
            <div className="ml-auto flex items-center gap-2">
              <UserAvatar name={user.name} role={user.role as any} size="sm" />
              <span className="text-sm text-slate-300">{user.name}</span>
            </div>
          )}
        </header>
        <div className="flex-1 p-6 lg:p-8 max-w-7xl mx-auto w-full">
          {children}
        </div>
        <Footer />
      </main>
    </div>
  );
}