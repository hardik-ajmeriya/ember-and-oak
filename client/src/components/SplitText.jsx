import { motion } from 'framer-motion';

/**
 * Word-by-word masked reveal for headlines. Each word sits in an
 * overflow-hidden span so it slides up from behind its own baseline.
 */
export default function SplitText({ text, className = '', delay = 0, stagger = 0.05 }) {
  const words = text.split(' ');

  return (
    <motion.span
      className={`inline-block ${className}`}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.4 }}
      variants={{ hidden: {}, show: { transition: { delayChildren: delay, staggerChildren: stagger } } }}
      aria-label={text}
    >
      {words.map((word, i) => (
        <span key={`${word}-${i}`} className="inline-block overflow-hidden pb-[0.08em] align-bottom">
          <motion.span
            aria-hidden="true"
            className="inline-block"
            variants={{
              hidden: { y: '110%' },
              show: { y: 0, transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] } },
            }}
          >
            {word}
            {i < words.length - 1 ? ' ' : ''}
          </motion.span>
        </span>
      ))}
    </motion.span>
  );
}
