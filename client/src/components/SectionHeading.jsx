import Reveal from './Reveal.jsx';
import SplitText from './SplitText.jsx';

export default function SectionHeading({ eyebrow, title, lead, align = 'left', className = '' }) {
  const alignment = align === 'center' ? 'items-center text-center' : 'items-start text-left';

  return (
    <div className={`flex flex-col ${alignment} gap-6 ${className}`}>
      {eyebrow && (
        <Reveal from="fade">
          <span className="eyebrow flex items-center gap-4">
            <span className="h-px w-10 bg-brass" aria-hidden="true" />
            {eyebrow}
          </span>
        </Reveal>
      )}

      <h2 className="display max-w-3xl text-[clamp(2.25rem,5.5vw,4.25rem)] text-cream-50">
        <SplitText text={title} stagger={0.04} />
      </h2>

      {lead && (
        <Reveal from="up" delay={0.15}>
          <p className="max-w-xl text-balance text-base leading-[1.85] text-cream-400">{lead}</p>
        </Reveal>
      )}
    </div>
  );
}
