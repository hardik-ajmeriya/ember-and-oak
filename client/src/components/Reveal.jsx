import { motion } from 'framer-motion';

const variants = {
  up: { y: 32, opacity: 0 },
  down: { y: -28, opacity: 0 },
  left: { x: 40, opacity: 0 },
  right: { x: -40, opacity: 0 },
  fade: { opacity: 0 },
  scale: { scale: 0.94, opacity: 0 },
};

/**
 * Scroll-triggered entrance. Animates once, respects reduced motion
 * (framer-motion honours the OS setting through `useReducedMotion` internally
 * when transitions are spring/tween based on transform + opacity only).
 */
export default function Reveal({
  children,
  from = 'up',
  delay = 0,
  duration = 0.7,
  amount = 0.25,
  className = '',
  as = 'div',
}) {
  const MotionTag = motion[as] ?? motion.div;

  return (
    <MotionTag
      className={className}
      initial={variants[from]}
      whileInView={{ x: 0, y: 0, opacity: 1, scale: 1 }}
      viewport={{ once: true, amount }}
      transition={{ duration, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </MotionTag>
  );
}

/** Staggers direct children of a list. Pair with <Reveal.Item>. */
export function RevealGroup({ children, className = '', stagger = 0.08, amount = 0.15 }) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount }}
      variants={{ hidden: {}, show: { transition: { staggerChildren: stagger } } }}
    >
      {children}
    </motion.div>
  );
}

export function RevealItem({ children, className = '' }) {
  return (
    <motion.div
      className={className}
      variants={{
        hidden: { opacity: 0, y: 28 },
        show: { opacity: 1, y: 0, transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] } },
      }}
    >
      {children}
    </motion.div>
  );
}
