import { Link } from 'react-router-dom';
import { Instagram, MapPin, Phone, Mail } from 'lucide-react';
import Reveal from './Reveal.jsx';

export default function Footer() {
  return (
    <footer className="border-t border-char-800 bg-char-950">
      <div className="shell py-20">
        <Reveal from="up">
          <div className="grid gap-14 md:grid-cols-2 lg:grid-cols-4">
            <div className="lg:col-span-1">
              <p className="font-display text-3xl font-light text-cream-50">
                Ember <span className="text-brass">&amp;</span> Oak
              </p>
              <p className="mt-5 max-w-xs text-sm leading-relaxed text-cream-400">
                Thirty-eight covers built around a single wood oven. The menu changes when the
                produce does, which is more often than we would like.
              </p>
              <span
                title="Instagram — demo site, not wired to an account"
                className="mt-7 inline-grid h-10 w-10 place-items-center border border-char-700 text-cream-500"
              >
                <Instagram size={16} aria-hidden="true" />
              </span>
            </div>

            <div>
              <h3 className="eyebrow mb-6">Find us</h3>
              <ul className="space-y-4 text-sm text-cream-400">
                <li className="flex gap-3">
                  <MapPin size={15} className="mt-0.5 shrink-0 text-brass" />
                  <span>14 Wharf Lane<br />Bermondsey, London SE1 2NX</span>
                </li>
                <li className="flex gap-3">
                  <Phone size={15} className="mt-0.5 shrink-0 text-brass" />
                  <a href="tel:+442079460102" className="transition hover:text-brass">+44 20 7946 0102</a>
                </li>
                <li className="flex gap-3">
                  <Mail size={15} className="mt-0.5 shrink-0 text-brass" />
                  <a href="mailto:hello@emberandoak.com" className="transition hover:text-brass">
                    hello@emberandoak.com
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="eyebrow mb-6">Hours</h3>
              <ul className="space-y-2.5 text-sm text-cream-400">
                {[
                  ['Monday', 'Closed'],
                  ['Tuesday – Wednesday', 'Dinner only'],
                  ['Thursday – Friday', 'Lunch &amp; dinner'],
                  ['Saturday', 'Lunch &amp; dinner'],
                  ['Sunday', 'Lunch only'],
                ].map(([day, val]) => (
                  <li key={day} className="flex justify-between gap-4">
                    <span>{day}</span>
                    <span className="text-cream-200" dangerouslySetInnerHTML={{ __html: val }} />
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="eyebrow mb-6">Elsewhere</h3>
              <ul className="space-y-3 text-sm">
                {[
                  { to: '/menu', label: 'The menu' },
                  { to: '/events', label: 'Events & wine dinners' },
                  { to: '/story', label: 'The room' },
                  { to: '/reserve', label: 'Reserve a table' },
                  { to: '/visit', label: 'Private dining' },
                ].map((l) => (
                  <li key={l.to}>
                    <Link to={l.to} className="text-cream-400 transition hover:text-brass">{l.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Reveal>

        <div className="rule my-12" />

        <div className="flex flex-col items-center justify-between gap-3 text-xs text-cream-600 sm:flex-row">
          <p>&copy; {new Date().getFullYear()} Ember &amp; Oak. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
