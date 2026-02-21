import { InputHTMLAttributes, forwardRef } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ className, label, error, ...props }, ref) => {
        return (
            <div className="w-full">
                {label && (
                    <label className="block text-sm font-medium text-slate-300 mb-1">
                        {label}
                    </label>
                )}
                <input
                    ref={ref}
                    className={twMerge(
                        clsx(
                            'w-full px-4 py-2 bg-slate-800 border rounded-lg focus:outline-none focus:ring-2 transition-colors',
                            'text-white placeholder-slate-500',
                            error
                                ? 'border-red-500 focus:ring-red-500/50'
                                : 'border-slate-700 focus:border-emerald-500 focus:ring-emerald-500/50',
                            className
                        )
                    )}
                    {...props}
                />
                {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
            </div>
        );
    }
);
