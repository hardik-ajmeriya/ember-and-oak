import { Utensils } from 'lucide-react';

export default function EmptyState({ icon: Icon = Utensils, title = 'Nothing here', message = '', action = null }) {
  return (
    <div className="card-surface flex flex-col items-center gap-4 px-8 py-20 text-center">
      <span className="grid h-12 w-12 place-items-center rounded-full border border-char-600 text-brass">
        <Icon size={20} />
      </span>
      <h3 className="font-display text-3xl font-light text-cream-50">{title}</h3>
      <p className="max-w-sm text-sm leading-relaxed text-cream-400">{message}</p>
      {action}
    </div>
  );
}
