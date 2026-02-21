import { useTranslation } from 'react-i18next';
import { Fragment } from 'react';
import { Menu, Transition } from '@headlessui/react';
import { Globe, Check, ChevronUp } from 'lucide-react';
import { clsx } from 'clsx';
import { AnimatePresence, motion } from 'framer-motion';

const languages = [
    { code: 'es', label: 'Español', flag: '🇪🇸' },
    { code: 'en', label: 'English', flag: '🇺🇸' },
    { code: 'fr', label: 'Français', flag: '🇫🇷' },
    { code: 'pt', label: 'Português', flag: '🇧🇷' },
];

interface LanguageSelectorProps {
    collapsed?: boolean;
}

export default function LanguageSelector({ collapsed = false }: LanguageSelectorProps) {
    const { i18n } = useTranslation();
    const currentLang = languages.find(l => l.code === i18n.language) || languages[0];

    return (
        <Menu as="div" className={clsx("relative inline-block text-left", collapsed ? "" : "w-full")}>
            <Menu.Button
                className={clsx(
                    "group flex items-center gap-3 rounded-xl transition-all duration-200 outline-none focus:ring-2 focus:ring-emerald-500/50",
                    collapsed
                        ? "p-2 text-slate-400 hover:text-white hover:bg-slate-800/50"
                        : "w-full px-0 py-2 text-slate-400 hover:text-slate-200"
                )}
            >
                <div className={clsx("p-2 rounded-lg transition-colors", collapsed ? "" : "bg-slate-800/50 group-hover:bg-slate-800 text-emerald-400")}>
                    <Globe className="w-5 h-5" />
                </div>
                {!collapsed && (
                    <div className="flex flex-1 items-center justify-between overflow-hidden">
                        <div className="flex flex-col items-start">
                            <span className="text-sm font-medium text-slate-200 group-hover:text-white transition-colors">{currentLang.label}</span>
                            <span className="text-[10px] text-slate-500 uppercase tracking-wider">Idioma</span>
                        </div>
                        <ChevronUp className="w-4 h-4 text-slate-600 group-hover:text-slate-400 transition-colors" />
                    </div>
                )}
            </Menu.Button>

            <AnimatePresence>
                <Transition
                    as={Fragment}
                    enter="transition ease-out duration-200"
                    enterFrom="transform opacity-0 scale-95 translate-y-2"
                    enterTo="transform opacity-100 scale-100 translate-y-0"
                    leave="transition ease-in duration-150"
                    leaveFrom="transform opacity-100 scale-100 translate-y-0"
                    leaveTo="transform opacity-0 scale-95 translate-y-2"
                >
                    <Menu.Items
                        className={clsx(
                            "absolute z-50 mb-2 w-56 origin-bottom-left divide-y divide-slate-700/50 rounded-2xl bg-slate-900/90 shadow-2xl ring-1 ring-slate-700 backdrop-blur-xl focus:outline-none border border-slate-700/50",
                            collapsed ? "left-12 bottom-0 ml-2" : "bottom-full left-0 mb-3 w-full"
                        )}
                    >
                        <div className="p-1.5 space-y-0.5">
                            {languages.map((lang) => (
                                <Menu.Item key={lang.code}>
                                    {({ active }) => (
                                        <button
                                            onClick={() => i18n.changeLanguage(lang.code)}
                                            className={clsx(
                                                active ? 'bg-slate-800/80 text-white' : 'text-slate-300 hover:bg-slate-800/50',
                                                'group flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-sm transition-all duration-200',
                                                i18n.language === lang.code && !active ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'border border-transparent'
                                            )}
                                        >
                                            <div className="flex items-center gap-3">
                                                <span className="text-lg leading-none">{lang.flag}</span>
                                                <span className="font-medium">{lang.label}</span>
                                            </div>
                                            {i18n.language === lang.code && (
                                                <motion.div layoutId="activeCheck">
                                                    <Check className="w-4 h-4 text-emerald-400" />
                                                </motion.div>
                                            )}
                                        </button>
                                    )}
                                </Menu.Item>
                            ))}
                        </div>
                    </Menu.Items>
                </Transition>
            </AnimatePresence>
        </Menu>
    );
}
