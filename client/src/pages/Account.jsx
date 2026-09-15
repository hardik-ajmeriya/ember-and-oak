import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { CalendarDays, Users, MapPin, X, Utensils } from 'lucide-react';
import PageTransition from '../components/PageTransition.jsx';
import Button from '../components/Button.jsx';
import Reveal from '../components/Reveal.jsx';
import Loader from '../components/Loader.jsx';
import EmptyState from '../components/EmptyState.jsx';
import useFetch from '../hooks/useFetch.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import api from '../lib/api.js';

const longFmt = new Intl.DateTimeFormat('en-GB', { weekday: 'long', day: 'numeric', month: 'long' });
const timeFmt = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit' });

const statusTone = {
  confirmed: 'border-brass/50 text-brass',
  seated: 'border-brass/50 text-brass',
  completed: 'border-char-600 text-cream-400',
  cancelled: 'border-char-600 text-char-500',
  'no-show': 'border-clay/50 text-clay',
};

function Row({ reservation, onCancel, busy }) {
  return (
    <motion.article layout exit={{ opacity: 0, height: 0 }} className="card-surface flex flex-col gap-5 p-7 sm:flex-row sm:items-center">
      <div className="flex-1">
        <div className="flex flex-wrap items-center gap-3">
          <span className={`border px-2.5 py-0.5 font-sans text-[0.58rem] uppercase tracking-[0.18em] ${statusTone[reservation.status]}`}>
            {reservation.status}
          </span>
          <span className="font-sans text-[0.62rem] uppercase tracking-[0.18em] text-cream-600">
            Ref {reservation.reference}
          </span>
        </div>

        <h3 className="mt-3 font-display text-2xl font-light text-cream-50">
          {longFmt.format(new Date(reservation.startsAt))} at {timeFmt.format(new Date(reservation.startsAt))}
        </h3>

        <div className="mt-3 flex flex-wrap gap-x-7 gap-y-1.5 text-sm text-cream-400">
          <span className="flex items-center gap-2">
            <Users size={13} className="text-brass" /> Party of {reservation.partySize}
          </span>
          {reservation.table && (
            <span className="flex items-center gap-2">
              <MapPin size={13} className="text-brass" /> Table {reservation.table.label} &middot;{' '}
              {reservation.table.zone.replace(/-/g, ' ')}
            </span>
          )}
          {reservation.occasion && reservation.occasion !== 'none' && (
            <span className="capitalize">{reservation.occasion}</span>
          )}
        </div>

        {reservation.notes && <p className="mt-3 text-sm italic text-cream-600">“{reservation.notes}”</p>}
      </div>

      {onCancel && reservation.status === 'confirmed' && (
        <button
          type="button"
          onClick={() => onCancel(reservation._id)}
          disabled={busy === reservation._id}
          className="flex shrink-0 items-center gap-2 self-start border border-char-600 px-4 py-2 font-sans text-[0.62rem] uppercase tracking-[0.18em] text-cream-400 transition hover:border-clay hover:text-clay disabled:opacity-50 sm:self-center"
        >
          <X size={12} /> {busy === reservation._id ? 'Cancelling' : 'Cancel'}
        </button>
      )}
    </motion.article>
  );
}

export default function Account() {
  const { user } = useAuth();
  const toast = useToast();
  const { data, loading, error, refetch } = useFetch('/reservations/me');
  const [tab, setTab] = useState('upcoming');
  const [busy, setBusy] = useState(null);

  const cancel = async (id) => {
    setBusy(id);
    try {
      const res = await api.patch(`/reservations/${id}/cancel`);
      toast.success(res.data.message);
      refetch();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy(null);
    }
  };

  const upcoming = data?.upcoming ?? [];
  const past = data?.past ?? [];
  const rows = tab === 'upcoming' ? upcoming : past;

  return (
    <PageTransition>
      <section className="shell pb-24 pt-40 md:pt-48">
        <Reveal from="up">
          <div className="flex flex-wrap items-end justify-between gap-6 border-b border-char-800 pb-10">
            <div>
              <span className="eyebrow">Your account</span>
              <h1 className="display mt-5 text-[clamp(2.25rem,6vw,4rem)] text-cream-50">
                Good to see you, {user.name.split(' ')[0]}.
              </h1>
              <p className="mt-4 text-sm text-cream-400">
                {user.visits > 0 ? `${user.visits} visits on record.` : 'Your first booking is below.'}
              </p>
            </div>
            <Button to="/reserve">Book another table</Button>
          </div>
        </Reveal>

        <div className="mt-12 flex gap-1 border-b border-char-800">
          {[
            { key: 'upcoming', label: `Upcoming (${upcoming.length})` },
            { key: 'past', label: `Previous (${past.length})` },
          ].map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              className={`relative px-6 py-4 font-sans text-[0.66rem] uppercase tracking-[0.2em] transition-colors ${
                tab === t.key ? 'text-brass' : 'text-cream-600 hover:text-cream-200'
              }`}
            >
              {t.label}
              {tab === t.key && <motion.span layoutId="acct-tab" className="absolute inset-x-0 -bottom-px h-px bg-brass" />}
            </button>
          ))}
        </div>

        <div className="mt-10">
          {loading ? (
            <Loader label="Loading your reservations" />
          ) : error ? (
            <EmptyState title="Could not load reservations" message={error} />
          ) : rows.length === 0 ? (
            <EmptyState
              icon={Utensils}
              title={tab === 'upcoming' ? 'Nothing booked' : 'No history yet'}
              message={
                tab === 'upcoming'
                  ? 'The book opens three weeks ahead. Pick a night and we will hold you a table.'
                  : 'Tables you have taken will be listed here afterwards.'
              }
              action={tab === 'upcoming' ? <Button to="/reserve" className="mt-2">Reserve a table</Button> : null}
            />
          ) : (
            <div className="space-y-5">
              <AnimatePresence initial={false}>
                {rows.map((r) => (
                  <Row key={r._id} reservation={r} onCancel={tab === 'upcoming' ? cancel : null} busy={busy} />
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>

        <p className="mt-16 flex items-center justify-center gap-2 text-center text-xs text-cream-600">
          <CalendarDays size={13} />
          Need to change a booking rather than cancel it?{' '}
          <Link to="/visit" className="text-brass underline underline-offset-4">Write to us</Link>.
        </p>
      </section>
    </PageTransition>
  );
}
