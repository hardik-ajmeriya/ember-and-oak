import { useState } from 'react';
import { MapPin, Phone, Mail, Train, Send } from 'lucide-react';
import PageTransition from '../components/PageTransition.jsx';
import PageHero from '../components/PageHero.jsx';
import Field from '../components/Field.jsx';
import Button from '../components/Button.jsx';
import Reveal from '../components/Reveal.jsx';
import Loader from '../components/Loader.jsx';
import useFetch from '../hooks/useFetch.js';
import { useToast } from '../context/ToastContext.jsx';
import api from '../lib/api.js';

const kinds = [
  { value: 'general', label: 'General enquiry' },
  { value: 'private-dining', label: 'Private dining' },
  { value: 'large-party', label: 'A party of nine or more' },
  { value: 'press', label: 'Press' },
  { value: 'careers', label: 'Careers' },
];

const blank = { name: '', email: '', phone: '', kind: 'general', message: '' };

export default function Visit() {
  const [form, setForm] = useState(blank);
  const [errors, setErrors] = useState({});
  const [sending, setSending] = useState(false);
  const toast = useToast();
  const { data: hoursData, loading: loadingHours } = useFetch('/reservations/hours');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    setErrors((p) => ({ ...p, [name]: undefined }));
  };

  const validate = () => {
    const next = {};
    if (form.name.trim().length < 2) next.name = 'Tell us your name';
    if (!/^\S+@\S+\.\S+$/.test(form.email)) next.email = 'Enter a valid email address';
    if (form.message.trim().length < 10) next.message = 'A sentence or two helps us reply properly';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSending(true);
    try {
      const { data } = await api.post('/enquiries', form);
      toast.success(data.message);
      setForm(blank);
    } catch (err) {
      if (err.details?.length) setErrors(Object.fromEntries(err.details.map((d) => [d.field, d.message])));
      toast.error(err.message);
    } finally {
      setSending(false);
    }
  };

  const formatWindow = (w) => (w ? `${w[0]} – ${w[1]}` : null);

  return (
    <PageTransition>
      <PageHero
        eyebrow="Bermondsey"
        title="14 Wharf Lane."
        lead="Five minutes from Bermondsey station, down the alley beside the old print works. There is no sign — look for the light."
        image="https://images.unsplash.com/photo-1481833761820-0509d3217039?auto=format&fit=crop&w=1800&h=900&q=80"
        crumbs={[{ label: 'Visit' }]}
      />

      <section className="shell grid gap-16 py-16 lg:grid-cols-[0.9fr_1.1fr] lg:gap-24 lg:py-24">
        <div className="space-y-12">
          <Reveal from="up">
            <div>
              <h2 className="eyebrow mb-7">Where and when</h2>
              <ul className="space-y-6">
                {[
                  { icon: MapPin, label: 'Address', value: '14 Wharf Lane\nBermondsey, London SE1 2NX' },
                  { icon: Train, label: 'Getting here', value: 'Bermondsey (Jubilee), 5 min walk\nLondon Bridge, 14 min walk' },
                  { icon: Phone, label: 'Telephone', value: '+44 20 7946 0102', href: 'tel:+442079460102' },
                  { icon: Mail, label: 'Email', value: 'hello@emberandoak.com', href: 'mailto:hello@emberandoak.com' },
                ].map((item) => (
                  <li key={item.label} className="flex gap-5">
                    <item.icon size={17} className="mt-1 shrink-0 text-brass" />
                    <div>
                      <p className="font-sans text-[0.6rem] uppercase tracking-[0.24em] text-cream-600">{item.label}</p>
                      {item.href ? (
                        <a href={item.href} className="mt-1.5 block text-cream-100 transition hover:text-brass">{item.value}</a>
                      ) : (
                        <p className="mt-1.5 whitespace-pre-line leading-relaxed text-cream-100">{item.value}</p>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>

          <Reveal from="up" delay={0.12}>
            <div>
              <h2 className="eyebrow mb-7">Service times</h2>
              {loadingHours ? (
                <Loader label="Loading hours" className="py-8" />
              ) : (
                <ul className="divide-y divide-char-800 border-y border-char-800">
                  {(hoursData?.hours ?? []).map((h) => (
                    <li key={h.day} className="flex items-baseline justify-between gap-6 py-3.5 text-sm">
                      <span className="text-cream-400">{h.day}</span>
                      <span className={h.closed ? 'text-char-500' : 'text-cream-100'}>
                        {h.closed
                          ? 'Closed'
                          : [formatWindow(h.lunch), formatWindow(h.dinner)].filter(Boolean).join('  ·  ')}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </Reveal>

          <Reveal from="up" delay={0.2}>
            <div className="border border-char-700">
              <iframe
                title="Map showing Wharf Lane, Bermondsey"
                src="https://www.openstreetmap.org/export/embed.html?bbox=-0.0870%2C51.4950%2C-0.0740%2C51.5010&layer=mapnik"
                className="h-72 w-full border-0 grayscale"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </Reveal>
        </div>

        <Reveal from="left" delay={0.1}>
          <form onSubmit={submit} noValidate className="border border-char-700 bg-char-900/50 p-8 md:p-11">
            <h2 className="font-display text-4xl font-light text-cream-50">Write to us</h2>
            <p className="mt-4 text-sm leading-relaxed text-cream-400">
              For a table of eight or fewer, the booking page is quicker. For anything else, this
              reaches Nour directly.
            </p>

            <div className="mt-10 grid gap-7 sm:grid-cols-2">
              <Field label="Name" name="name" value={form.name} onChange={handleChange} error={errors.name} autoComplete="name" required />
              <Field label="Email" name="email" type="email" value={form.email} onChange={handleChange} error={errors.email} autoComplete="email" required />
              <Field label="Phone (optional)" name="phone" type="tel" value={form.phone} onChange={handleChange} autoComplete="tel" />
              <Field label="Regarding" name="kind" as="select" value={form.kind} onChange={handleChange}>
                {kinds.map((k) => (
                  <option key={k.value} value={k.value} className="bg-char-900">{k.label}</option>
                ))}
              </Field>
            </div>

            <Field
              label="Message"
              name="message"
              as="textarea"
              value={form.message}
              onChange={handleChange}
              error={errors.message}
              className="mt-7"
              placeholder="Dates, numbers, and anything that would help us answer properly."
              required
            />

            <Button type="submit" size="lg" disabled={sending} className="mt-9 w-full sm:w-auto">
              <Send size={14} /> {sending ? 'Sending…' : 'Send enquiry'}
            </Button>
          </form>
        </Reveal>
      </section>
    </PageTransition>
  );
}
