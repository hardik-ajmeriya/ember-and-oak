import { useState } from 'react';

/** Shimmer while loading, warm fallback panel if the asset never arrives. */
export default function SmartImage({ src, alt, className = '', imgClassName = '', ...rest }) {
  const [status, setStatus] = useState('loading');

  return (
    <div className={`relative overflow-hidden bg-char-800 ${className}`}>
      {status !== 'loaded' && (
        <div aria-hidden="true" className="absolute inset-0 animate-pulse bg-gradient-to-br from-char-700 via-char-800 to-char-900" />
      )}

      {status === 'error' ? (
        <div aria-hidden="true" className="absolute inset-0 grid place-items-center bg-gradient-to-br from-char-700 to-char-900">
          <span className="font-display text-3xl font-light italic text-char-500">Ember &amp; Oak</span>
        </div>
      ) : (
        <img
          src={src}
          alt={alt}
          loading="lazy"
          decoding="async"
          onLoad={() => setStatus('loaded')}
          onError={() => setStatus('error')}
          className={`h-full w-full object-cover transition-[opacity,transform] duration-[1100ms] ease-smooth ${
            status === 'loaded' ? 'scale-100 opacity-100' : 'scale-105 opacity-0'
          } ${imgClassName}`}
          {...rest}
        />
      )}
    </div>
  );
}
