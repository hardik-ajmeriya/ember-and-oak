import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const base =
  'group relative inline-flex items-center justify-center gap-2.5 font-sans text-[0.72rem] font-medium uppercase tracking-[0.2em] transition-colors duration-500 disabled:cursor-not-allowed disabled:opacity-50';

const variants = {
  primary: 'bg-brass text-char-950 hover:bg-brass-light',
  outline: 'border border-char-500 text-cream-100 hover:border-brass hover:text-brass',
  ghost: 'text-cream-200 hover:text-brass',
  light: 'bg-cream-50 text-char-950 hover:bg-cream-100',
};

const sizes = {
  sm: 'px-5 py-2.5 text-[0.65rem]',
  md: 'px-8 py-3.5',
  lg: 'px-10 py-4',
};

export default function Button({ as = 'button', to, href, variant = 'primary', size = 'md', className = '', children, ...rest }) {
  const classes = `${base} ${variants[variant]} ${sizes[size]} ${className}`;
  const motionProps = {
    whileHover: { y: -1 },
    whileTap: { scale: 0.985 },
    transition: { type: 'spring', stiffness: 400, damping: 26 },
  };

  if (to) {
    return (
      <motion.div {...motionProps} className="inline-flex">
        <Link to={to} className={classes} {...rest}>{children}</Link>
      </motion.div>
    );
  }
  if (href) {
    return <motion.a href={href} className={classes} {...motionProps} {...rest}>{children}</motion.a>;
  }

  const Tag = motion[as] ?? motion.button;
  return <Tag className={classes} {...motionProps} {...rest}>{children}</Tag>;
}
