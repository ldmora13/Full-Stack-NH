import { clsx } from 'clsx';

interface UserAvatarProps {
  name: string;
  role?: 'CLIENT' | 'ADMIN' | 'ADVISOR';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showBadge?: boolean;
  className?: string;
}

const sizeClasses = {
  sm: 'w-6 h-6 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-16 h-16 text-xl',
  xl: 'w-24 h-24 text-3xl',
};

const gradients = [
  'from-blue-500 to-blue-700',
  'from-violet-500 to-violet-700',
  'from-emerald-500 to-emerald-700',
  'from-amber-500 to-orange-600',
  'from-pink-500 to-rose-600',
  'from-cyan-500 to-sky-600',
  'from-indigo-500 to-purple-700',
  'from-teal-500 to-cyan-700',
];

const getGradient = (name: string) => {
  const idx = name.charCodeAt(0) % gradients.length;
  return gradients[idx];
};

const getInitials = (name: string) => {
  const parts = name.trim().split(' ');
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
};

const roleBadgeColors = {
  CLIENT: 'bg-blue-500',
  ADVISOR: 'bg-emerald-500',
  ADMIN: 'bg-purple-500',
};

export default function UserAvatar({ name, role, size = 'md', showBadge = false, className }: UserAvatarProps) {
  const gradient = getGradient(name);
  const initials = getInitials(name);

  return (
    <div className={clsx('relative inline-flex shrink-0', className)}>
      <div
        className={clsx(
          'rounded-full flex items-center justify-center font-bold text-white bg-linear-to-br shadow-lg',
          sizeClasses[size],
          gradient
        )}
      >
        {initials}
      </div>
      {showBadge && role && (
        <div
          className={clsx(
            'absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-slate-900',
            roleBadgeColors[role]
          )}
        />
      )}
    </div>
  );
}