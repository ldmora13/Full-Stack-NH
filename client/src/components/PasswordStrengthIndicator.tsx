import { clsx } from 'clsx';

interface PasswordStrengthIndicatorProps {
  password: string;
}

interface StrengthLevel {
  label: string;
  color: string;
  barColor: string;
  score: number;
}

const levels: StrengthLevel[] = [
  { score: 1, label: 'Muy débil', color: 'text-red-400', barColor: 'bg-red-500' },
  { score: 2, label: 'Débil', color: 'text-orange-400', barColor: 'bg-orange-500' },
  { score: 3, label: 'Buena', color: 'text-amber-400', barColor: 'bg-amber-500' },
  { score: 4, label: 'Fuerte', color: 'text-emerald-400', barColor: 'bg-emerald-500' },
];

const getStrength = (password: string): number => {
  if (!password) return 0;
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  return score;
};

const checks = [
  { label: 'Mínimo 8 caracteres', test: (p: string) => p.length >= 8 },
  { label: 'Una letra mayúscula', test: (p: string) => /[A-Z]/.test(p) },
  { label: 'Un número', test: (p: string) => /[0-9]/.test(p) },
  { label: 'Un carácter especial', test: (p: string) => /[^A-Za-z0-9]/.test(p) },
];

export default function PasswordStrengthIndicator({ password }: PasswordStrengthIndicatorProps) {
  const strength = getStrength(password);
  const level = strength > 0 ? levels[strength - 1] : null;

  if (!password) return null;

  return (
    <div className="mt-3 space-y-3">
      {/* Strength bars */}
      <div className="flex gap-1">
        {[1, 2, 3, 4].map((bar) => (
          <div
            key={bar}
            className={clsx(
              'h-1.5 flex-1 rounded-full transition-all duration-300',
              strength >= bar && level ? level.barColor : 'bg-slate-700'
            )}
          />
        ))}
      </div>

      {/* Label */}
      {level && (
        <p className={clsx('text-xs font-semibold', level.color)}>
          {level.label}
        </p>
      )}

      {/* Checklist */}
      <ul className="space-y-1">
        {checks.map((check) => {
          const passed = check.test(password);
          return (
            <li key={check.label} className="flex items-center gap-2 text-xs">
              <span className={clsx(
                'w-3.5 h-3.5 rounded-full flex items-center justify-center text-[10px] font-bold transition-colors',
                passed ? 'bg-emerald-500 text-white' : 'bg-slate-700 text-slate-500'
              )}>
                {passed ? '✓' : '·'}
              </span>
              <span className={passed ? 'text-slate-300' : 'text-slate-500'}>{check.label}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}