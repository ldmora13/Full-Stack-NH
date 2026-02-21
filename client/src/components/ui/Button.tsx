import { ButtonHTMLAttributes, forwardRef } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'outline' | 'danger';
    isLoading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = 'primary', isLoading, children, ...props }, ref) => {
        const variants = {
            primary: 'bg-emerald-600 hover:bg-emerald-500 text-white',
            secondary: 'bg-slate-700 hover:bg-slate-600 text-white',
            outline: 'border border-slate-600 hover:bg-slate-800 text-slate-300',
            danger: 'bg-red-600 hover:bg-red-500 text-white',
        };

        return (
            <button
                ref={ref}
                disabled={isLoading || props.disabled}
                className={twMerge(
                    clsx(
                        'w-full py-2.5 px-4 rounded-lg font-medium transition-all duration-200',
                        'flex items-center justify-center gap-2',
                        'disabled:opacity-50 disabled:cursor-not-allowed',
                        variants[variant],
                        className
                    )
                )}
                {...props}
            >
                {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                    children
                )}
            </button>
        );
    }
);
