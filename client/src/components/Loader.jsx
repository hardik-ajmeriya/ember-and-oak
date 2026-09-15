export default function Loader({ label = 'One moment', className = '' }) {
  return (
    <div className={`flex flex-col items-center justify-center gap-5 py-24 ${className}`} role="status">
      <span className="h-px w-24 origin-left animate-pulse bg-brass" />
      <p className="eyebrow text-cream-400">{label}</p>
    </div>
  );
}

export function MenuSkeleton({ rows = 5 }) {
  return (
    <div className="space-y-6">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="animate-pulse space-y-2.5">
          <div className="h-4 w-1/3 bg-char-700" />
          <div className="h-3 w-2/3 bg-char-800" />
        </div>
      ))}
    </div>
  );
}
