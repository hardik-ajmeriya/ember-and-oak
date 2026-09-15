import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Users, ArrowLeft, ArrowRight, Check, CalendarX2, Sunrise, Moon } from 'lucide-react';
import PageTransition from '../components/PageTransition.jsx';
import PageHero from '../components/PageHero.jsx';
import Field from '../components/Field.jsx';
import Button from '../components/Button.jsx';
import Reveal from '../components/Reveal.jsx';
import useFetch from '../hooks/useFetch.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import api from '../lib/api.js';

const dayFmt = new Intl.DateTimeFormat('en-GB', { weekday: 'short' });
const monthFmt = new Intl.DateTimeFormat('en-GB', { month: 'short' });
const longFmt = new Intl.DateTimeFormat('en-GB', { weekday: 'long', day: 'numeric', month: 'long' });
const timeFmt = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit' });

const occasions = [
  { value: 'none', label: 'No special occasion' },
  { value: 'birthday', label: 'Birthday' },
  { value: 'anniversary', label: 'Anniversary' },
  { value: 'business', label: 'Business' },
  { value: 'celebration', label: 'Celebration' },
];

/** The next 21 days, as ISO keys plus display parts. */
function useDays() {
  return useMemo(
    () =>
      Array.from({ length: 21 }).map((_, i) => {
        const d = new Date();
        d.setDate(d.getDate() + i);
        d.setHours(0, 0, 0, 0);
        return {
          iso: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`,
          weekday: dayFmt.format(d),
          dayNum: d.getDate(),
          month: monthFmt.format(d),
          isToday: i === 0,
        };
      }),
    []
  );
}

function StepDots({ step }) {
  return (
    <ol className="mb-12 flex items-center gap-4" aria-label="Reservation progress">
      {['Party & date', 'Time', 'Details'].map((label, i) => (
        <li key={label} className="flex items-center gap-4">
          <span className="flex items-center gap-2.5">
            <span
              className={`grid h-7 w-7 place-items-center rounded-full border text-[0.65rem] transition-colors duration-500 ${
                i < step
                  ? 'border-brass bg-brass text-char-950'
                  : i === step
                    ? 'border-brass text-brass'
                    : 'border-char-600 text-cream-600'
              }`}
            >
              {i < step ? <Check size={13} /> : i + 1}
            </span>
            <span
              className={`hidden font-sans text-[0.62rem] uppercase tracking-[0.2em] sm:block ${
                i <= step ? 'text-cream-100' : 'text-cream-600'
              }`}
            >
              {label}
            </span>
          </span>
          {i < 2 && <span className={`h-px w-8 ${i < step ? 'bg-brass' : 'bg-char-600'}`} />}
        </li>
      ))}
    </ol>
  );
}

export default function Reserve() {
  const days = useDays();
  const { user } = useAuth();
  const toast = useToast();

  const [step, setStep] = useState(0);
  const [partySize, setPartySize] = useState(2);
  const [day, setDay] = useState(days[0].iso);
  const [slot, setSlot] = useState(null);
  const [details, setDetails] = useState({ name: '', email: '', phone: '', occasion: 'none', dietary: '', notes: '' });
  const [errors, setErrors] = useState({});
  const [sending, setSending] = useState(false);
  const [confirmed, setConfirmed] = useState(null);

  // Prefill from the signed-in account.
  useEffect(() => {
    if (user) setDetails((d) => ({ ...d, name: d.name || user.name, email: d.email || user.email, phone: d.phone || user.phone || '' }));
  }, [user]);

  const { data, loading } = useFetch(`/reservations/availability?date=${day}&partySize=${partySize}`);

  // A changed day or party size invalidates any time already chosen.
  useEffect(() => setSlot(null), [day, partySize]);

  const grouped = useMemo(() => {
    const slots = data?.slots ?? [];
    return {
      lunch: slots.filter((s) => s.service === 'lunch'),
      dinner: slots.filter((s) => s.service === 'dinner'),
    };
  }, [data]);

  const anyAvailable = (data?.slots ?? []).some((s) => s.available);

  const handleDetail = (e) => {
    const { name, value } = e.target;
    setDetails((d) => ({ ...d, [name]: value }));
    setErrors((p) => ({ ...p, [name]: undefined }));
  };

  const validateDetails = () => {
    const next = {};
    if (details.name.trim().length < 2) next.name = 'Tell us the name for the booking';
    if (!/^\S+@\S+\.\S+$/.test(details.email)) next.email = 'Enter a valid email address';
    if (details.phone.trim().length < 6) next.phone = 'We need a number in case the kitchen has a question';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!validateDetails()) return;

    setSending(true);
    try {
      const { data: res } = await api.post('/reservations', {
        ...details,
        partySize,
        startsAt: slot.startsAt,
      });
      setConfirmed(res.reservation);
      toast.success(res.message);
    } catch (err) {
      if (err.details?.length) setErrors(Object.fromEntries(err.details.map((d) => [d.field, d.message])));
      toast.error(err.message);
      // A 409 means the slot went while they were typing — send them back to pick again.
      if (err.status === 409) { setStep(1); setSlot(null); }
    } finally {
      setSending(false);
    }
  };

  if (confirmed) {
    return (
      <PageTransition>
        <section className="shell flex min-h-[80svh] flex-col items-center justify-center py-32 text-center">
          <Reveal from="scale">
            <span className="mx-auto grid h-16 w-16 place-items-center rounded-full border border-brass text-brass">
              <Check size={26} />
            </span>
          </Reveal>
          <Reveal from="up" delay={0.1}>
            <h1 className="display mt-9 text-[clamp(2.5rem,7vw,4.5rem)] text-cream-50">Your table is held.</h1>
          </Reveal>
          <Reveal from="up" delay={0.2}>
            <p className="mt-6 max-w-lg text-balance leading-relaxed text-cream-400">
              {longFmt.format(new Date(confirmed.startsAt))} at{' '}
              {timeFmt.format(new Date(confirmed.startsAt))}, for {confirmed.partySize}. Table{' '}
              {confirmed.table?.label} in the {confirmed.table?.zone.replace(/-/g, ' ')}.
            </p>
            <p className="mt-4 font-sans text-[0.7rem] uppercase tracking-[0.24em] text-brass">
              Reference {confirmed.reference}
            </p>
          </Reveal>
          <Reveal from="up" delay={0.3}>
            <div className="mt-11 flex flex-wrap justify-center gap-4">
              <Button to="/menu">Read the menu</Button>
              <Button to="/account" variant="outline">My reservations</Button>
            </div>
          </Reveal>
        </section>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <PageHero
        eyebrow="Live availability"
        title="Book a table."
        lead="The room seats thirty-eight. We hold a few places at the counter for walk-ins, but everything else is booked here."
        image="https://images.unsplash.com/photo-1544148103-0773bf10d330?auto=format&fit=crop&w=1800&h=900&q=80"
        crumbs={[{ label: 'Reservations' }]}
      />

      <section className="shell py-16 md:py-24">
        <div className="mx-auto max-w-3xl">
          <StepDots step={step} />

          <AnimatePresence mode="wait">
            {/* ------------------------------------------------ Step 1 */}
            {step === 0 && (
              <motion.div
                key="step-party"
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -24 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              >
                <h2 className="font-display text-3xl font-light text-cream-50">How many of you?</h2>
                <div className="mt-6 flex flex-wrap gap-2.5">
                  {Array.from({ length: 8 }).map((_, i) => {
                    const n = i + 1;
                    return (
                      <button
                        key={n}
                        type="button"
                        onClick={() => setPartySize(n)}
                        className={`h-12 w-12 border font-display text-lg transition-colors duration-300 ${
                          partySize === n
                            ? 'border-brass bg-brass text-char-950'
                            : 'border-char-600 text-cream-200 hover:border-brass'
                        }`}
                      >
                        {n}
                      </button>
                    );
                  })}
                  <button
                    type="button"
                    onClick={() => setPartySize(9)}
                    className={`h-12 border px-4 font-sans text-[0.68rem] uppercase tracking-[0.16em] transition-colors duration-300 ${
                      partySize > 8 ? 'border-brass bg-brass text-char-950' : 'border-char-600 text-cream-200 hover:border-brass'
                    }`}
                  >
                    9 +
                  </button>
                </div>
                {partySize > 8 && (
                  <p className="mt-4 text-sm text-cream-400">
                    For parties over eight we usually suggest the private room —{' '}
                    <Link to="/visit" className="text-brass underline underline-offset-4">enquire here</Link>.
                  </p>
                )}

                <h2 className="mt-14 font-display text-3xl font-light text-cream-50">Which day?</h2>
                <div className="mask-fade-r mt-6 flex gap-2.5 overflow-x-auto pb-3">
                  {days.map((d) => (
                    <button
                      key={d.iso}
                      type="button"
                      onClick={() => setDay(d.iso)}
                      className={`flex w-[4.5rem] shrink-0 flex-col items-center gap-0.5 border py-3 transition-colors duration-300 ${
                        day === d.iso
                          ? 'border-brass bg-brass text-char-950'
                          : 'border-char-600 text-cream-200 hover:border-brass'
                      }`}
                    >
                      <span className="font-sans text-[0.58rem] uppercase tracking-[0.16em]">
                        {d.isToday ? 'Today' : d.weekday}
                      </span>
                      <span className="font-display text-2xl leading-none">{d.dayNum}</span>
                      <span className="font-sans text-[0.55rem] uppercase tracking-[0.16em] opacity-70">{d.month}</span>
                    </button>
                  ))}
                </div>

                <div className="mt-12 flex justify-end">
                  <Button onClick={() => setStep(1)} size="lg">
                    Choose a time <ArrowRight size={15} />
                  </Button>
                </div>
              </motion.div>
            )}

            {/* ------------------------------------------------ Step 2 */}
            {step === 1 && (
              <motion.div
                key="step-time"
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -24 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              >
                <div className="flex flex-wrap items-baseline justify-between gap-3">
                  <h2 className="font-display text-3xl font-light text-cream-50">
                    {longFmt.format(new Date(`${day}T12:00:00`))}
                  </h2>
                  <span className="flex items-center gap-2 text-sm text-cream-400">
                    <Users size={14} className="text-brass" /> Party of {partySize}
                  </span>
                </div>

                {loading ? (
                  <div className="mt-10 grid grid-cols-3 gap-2.5 sm:grid-cols-5">
                    {Array.from({ length: 15 }).map((_, i) => (
                      <div key={i} className="h-11 animate-pulse border border-char-700 bg-char-800/60" />
                    ))}
                  </div>
                ) : !data?.open ? (
                  <div className="mt-10 flex flex-col items-center gap-4 border border-char-700 px-8 py-16 text-center">
                    <CalendarX2 size={22} className="text-brass" />
                    <p className="font-display text-2xl font-light text-cream-50">We are closed that day.</p>
                    <p className="max-w-sm text-sm text-cream-400">
                      The kitchen rests on Mondays. Pick another date and we will find you a table.
                    </p>
                  </div>
                ) : data?.oversized ? (
                  <div className="mt-10 flex flex-col items-center gap-4 border border-char-700 px-8 py-16 text-center">
                    <CalendarX2 size={22} className="text-brass" />
                    <p className="font-display text-2xl font-light text-cream-50">
                      That is a private-room party.
                    </p>
                    <p className="max-w-sm text-sm text-cream-400">
                      Our largest table in the dining room seats {data.largestTable}. For {partySize} we
                      would give you the private room and write a menu around you —{' '}
                      <Link to="/visit" className="text-brass underline underline-offset-4">tell us about it</Link>.
                    </p>
                  </div>
                ) : !anyAvailable ? (
                  <div className="mt-10 flex flex-col items-center gap-4 border border-char-700 px-8 py-16 text-center">
                    <CalendarX2 size={22} className="text-clay" />
                    <p className="font-display text-2xl font-light text-cream-50">Fully committed.</p>
                    <p className="max-w-sm text-sm text-cream-400">
                      Every table that seats {partySize} has gone for this day. Try the day either side, or
                      ask to go on the list.
                    </p>
                  </div>
                ) : (
                  <div className="mt-10 space-y-10">
                    {[
                      { key: 'lunch', label: 'Lunch', icon: Sunrise },
                      { key: 'dinner', label: 'Dinner', icon: Moon },
                    ].map(({ key, label, icon: Icon }) =>
                      grouped[key].length === 0 ? null : (
                        <div key={key}>
                          <h3 className="eyebrow mb-4 flex items-center gap-2.5">
                            <Icon size={13} /> {label}
                          </h3>
                          <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-5">
                            {grouped[key].map((s) => {
                              const selected = slot?.startsAt === s.startsAt;
                              return (
                                <button
                                  key={s.startsAt}
                                  type="button"
                                  disabled={!s.available}
                                  onClick={() => setSlot(s)}
                                  title={s.available ? `${s.tablesFree} table(s) free` : 'Not available'}
                                  className={`border py-3 font-sans text-sm transition-colors duration-300 ${
                                    selected
                                      ? 'border-brass bg-brass text-char-950'
                                      : s.available
                                        ? 'border-char-600 text-cream-100 hover:border-brass hover:text-brass'
                                        : 'cursor-not-allowed border-char-800 text-char-500 line-through'
                                  }`}
                                >
                                  {timeFmt.format(new Date(s.startsAt))}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )
                    )}

                    <p className="text-xs leading-relaxed text-cream-600">
                      Tables are held for {data.durationMins} minutes for a party of {partySize}. Times shown
                      are the ones we can seat you at without rushing the table before or after yours.
                    </p>
                  </div>
                )}

                <div className="mt-12 flex items-center justify-between">
                  <Button variant="ghost" onClick={() => setStep(0)}>
                    <ArrowLeft size={15} /> Back
                  </Button>
                  <Button size="lg" disabled={!slot} onClick={() => setStep(2)}>
                    Continue <ArrowRight size={15} />
                  </Button>
                </div>
              </motion.div>
            )}

            {/* ------------------------------------------------ Step 3 */}
            {step === 2 && (
              <motion.form
                key="step-details"
                onSubmit={submit}
                noValidate
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -24 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              >
                <div className="mb-10 border border-char-700 bg-char-900/60 p-6">
                  <p className="eyebrow mb-2">Your table</p>
                  <p className="font-display text-2xl font-light text-cream-50">
                    {longFmt.format(new Date(slot.startsAt))} at {timeFmt.format(new Date(slot.startsAt))}
                  </p>
                  <p className="mt-1 text-sm text-cream-400">
                    Party of {partySize} &middot; held for {data?.durationMins ?? 105} minutes
                  </p>
                </div>

                <div className="grid gap-7 sm:grid-cols-2">
                  <Field label="Name on the booking" name="name" value={details.name} onChange={handleDetail} error={errors.name} autoComplete="name" required />
                  <Field label="Email" name="email" type="email" value={details.email} onChange={handleDetail} error={errors.email} autoComplete="email" required />
                  <Field label="Phone" name="phone" type="tel" value={details.phone} onChange={handleDetail} error={errors.phone} autoComplete="tel" required />
                  <Field label="Occasion" name="occasion" as="select" value={details.occasion} onChange={handleDetail}>
                    {occasions.map((o) => (
                      <option key={o.value} value={o.value} className="bg-char-900">{o.label}</option>
                    ))}
                  </Field>
                </div>

                <Field
                  label="Allergies or dietary requirements"
                  name="dietary"
                  value={details.dietary}
                  onChange={handleDetail}
                  className="mt-7"
                  placeholder="Coeliac, shellfish allergy, vegetarian…"
                  hint="The kitchen reads every one of these before service."
                />

                <Field
                  label="Anything else?"
                  name="notes"
                  as="textarea"
                  value={details.notes}
                  onChange={handleDetail}
                  className="mt-7"
                  placeholder="Window table if one is free, celebrating something, arriving separately…"
                />

                <div className="mt-12 flex items-center justify-between">
                  <Button type="button" variant="ghost" onClick={() => setStep(1)}>
                    <ArrowLeft size={15} /> Back
                  </Button>
                  <Button type="submit" size="lg" disabled={sending}>
                    {sending ? 'Holding the table…' : 'Confirm reservation'}
                  </Button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </section>
    </PageTransition>
  );
}
