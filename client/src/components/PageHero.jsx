import { Link } from 'react-router-dom';
import Reveal from './Reveal.jsx';
import SplitText from './SplitText.jsx';
import SmartImage from './SmartImage.jsx';

export default function PageHero({ eyebrow, title, lead, image, crumbs = [] }) {
  return (
    <section className="relative overflow-hidden border-b border-char-800 pb-16 pt-40 md:pb-24 md:pt-48">
      {image && (
        <>
          <SmartImage src={image} alt="" className="absolute inset-0 h-full w-full" imgClassName="opacity-20" />
          <div className="absolute inset-0 bg-gradient-to-t from-char-950 via-char-950/85 to-char-950/60" />
        </>
      )}

      <div className="shell relative">
        {crumbs.length > 0 && (
          <Reveal from="fade">
            <nav aria-label="Breadcrumb" className="mb-8 flex flex-wrap items-center gap-3 text-[0.68rem] uppercase tracking-[0.2em] text-cream-600">
              <Link to="/" className="transition hover:text-brass">Home</Link>
              {crumbs.map((c) => (
                <span key={c.label} className="flex items-center gap-3">
                  <span className="text-char-500">&mdash;</span>
                  {c.to ? (
                    <Link to={c.to} className="transition hover:text-brass">{c.label}</Link>
                  ) : (
                    <span className="text-cream-200">{c.label}</span>
                  )}
                </span>
              ))}
            </nav>
          </Reveal>
        )}

        {eyebrow && (
          <Reveal from="fade">
            <span className="eyebrow flex items-center gap-4">
              <span className="h-px w-10 bg-brass" aria-hidden="true" />
              {eyebrow}
            </span>
          </Reveal>
        )}

        <h1 className="display mt-6 max-w-4xl text-[clamp(2.75rem,8vw,6.5rem)] text-cream-50">
          <SplitText text={title} stagger={0.045} />
        </h1>

        {lead && (
          <Reveal from="up" delay={0.2}>
            <p className="mt-7 max-w-2xl text-balance text-lg leading-[1.8] text-cream-400">{lead}</p>
          </Reveal>
        )}
      </div>
    </section>
  );
}
