export default function Field({ label, name, type = 'text', as = 'input', error, hint, children, className = '', ...rest }) {
  const Tag = as;
  const base =
    'w-full border-b bg-transparent px-0 py-3 font-sans text-sm text-cream-50 placeholder:text-cream-600 transition-colors duration-300 focus:outline-none';
  const tone = error ? 'border-clay focus:border-clay' : 'border-char-600 focus:border-brass';

  return (
    <label className={`block ${className}`}>
      <span className="mb-1 block font-sans text-[0.6rem] font-medium uppercase tracking-[0.24em] text-cream-400">
        {label}
      </span>

      {as === 'select' ? (
        <Tag name={name} className={`${base} ${tone} appearance-none`} {...rest}>{children}</Tag>
      ) : (
        <Tag
          name={name}
          type={as === 'textarea' ? undefined : type}
          className={`${base} ${tone} ${as === 'textarea' ? 'min-h-[7rem] resize-y' : ''}`}
          aria-invalid={Boolean(error)}
          {...rest}
        />
      )}

      {error ? (
        <span className="mt-1.5 block text-xs text-clay">{error}</span>
      ) : hint ? (
        <span className="mt-1.5 block text-xs text-cream-600">{hint}</span>
      ) : null}
    </label>
  );
}
