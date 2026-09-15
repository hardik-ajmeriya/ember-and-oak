import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import Button from './Button.jsx';

const links = [
  { to: '/menu', label: 'Menu' },
  { to: '/story', label: 'The Room' },
  { to: '/events', label: 'Events' },
  { to: '/visit', label: 'Visit' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { user, isAuthed, logout } = useAuth();
  const { pathname } = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-700 ease-smooth ${
          scrolled ? 'border-b border-char-700/80 bg-char-950/85 py-4 backdrop-blur-md' : 'py-8'
        }`}
      >
        <nav className="shell flex items-center justify-between gap-8" aria-label="Primary">
          <Link to="/" className="group" aria-label="Ember and Oak home">
            <span className="block font-display text-2xl font-light leading-none tracking-[0.02em] text-cream-50">
              Ember <span className="text-brass">&amp;</span> Oak
            </span>
            <span className="mt-1 block font-sans text-[0.52rem] uppercase tracking-[0.34em] text-cream-400">
              Wood-fired &middot; est. 2016
            </span>
          </Link>

          <ul className="hidden items-center gap-10 lg:flex">
            {links.map((link) => (
              <li key={link.to}>
                <NavLink
                  to={link.to}
                  className={({ isActive }) =>
                    `group relative font-sans text-[0.68rem] font-medium uppercase tracking-[0.22em] transition-colors duration-300 ${
                      isActive ? 'text-brass' : 'text-cream-200 hover:text-cream-50'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      {link.label}
                      <span
                        className={`absolute -bottom-2 left-0 h-px bg-brass transition-all duration-500 ease-smooth ${
                          isActive ? 'w-full' : 'w-0 group-hover:w-full'
                        }`}
                      />
                    </>
                  )}
                </NavLink>
              </li>
            ))}
          </ul>

          <div className="hidden items-center gap-6 lg:flex">
            {isAuthed ? (
              <>
                <Link
                  to="/account"
                  className="font-sans text-[0.68rem] uppercase tracking-[0.22em] text-cream-200 transition hover:text-brass"
                >
                  {user.name.split(' ')[0]}
                </Link>
                <button
                  type="button"
                  onClick={() => { logout(); navigate('/'); }}
                  className="font-sans text-[0.68rem] uppercase tracking-[0.22em] text-cream-400 transition hover:text-clay"
                >
                  Sign out
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className="font-sans text-[0.68rem] uppercase tracking-[0.22em] text-cream-200 transition hover:text-brass"
              >
                Sign in
              </Link>
            )}
            <Button to="/reserve" size="sm">Reserve a table</Button>
          </div>

          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
            className="text-cream-100 lg:hidden"
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </nav>
      </header>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-40 bg-char-950/98 backdrop-blur-lg lg:hidden"
          >
            <div className="shell flex h-full flex-col justify-center gap-1 pt-24">
              {links.map((link, i) => (
                <motion.div
                  key={link.to}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.07 * i + 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                >
                  <NavLink
                    to={link.to}
                    className="block border-b border-char-800 py-6 font-display text-5xl font-light text-cream-50"
                  >
                    {link.label}
                  </NavLink>
                </motion.div>
              ))}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.6 }}
                className="mt-10 flex flex-col gap-4"
              >
                <Button to="/reserve" size="lg">Reserve a table</Button>
                {isAuthed ? (
                  <Button to="/account" variant="outline" size="lg">My reservations</Button>
                ) : (
                  <Button to="/login" variant="outline" size="lg">Sign in</Button>
                )}
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
