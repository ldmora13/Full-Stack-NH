import { Scale } from 'lucide-react';

export default function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="mt-auto border-t border-slate-800 bg-slate-950/50 backdrop-blur-xl">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                <div className="flex flex-col md:flex-row justify-between items-center gap-3 text-sm">
                    {/* Company Info */}
                    <div className="flex items-center gap-2">
                        <div className="w-7 h-7 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-lg flex items-center justify-center">
                            <Scale className="w-4 h-4 text-white" />
                        </div>
                        <div>
                            <span className="text-white font-semibold">NewHorizons</span>
                            <span className="text-emerald-400 ml-1 text-xs">Immigrations Law</span>
                        </div>
                    </div>

                    {/* Copyright */}
                    <p className="text-slate-500 text-xs">
                        © {currentYear} NewHorizons Immigrations Law. Todos los derechos reservados.
                    </p>
                </div>
            </div>
        </footer>
    );
}
