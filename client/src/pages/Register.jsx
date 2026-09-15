import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import PageTransition from '../components/PageTransition.jsx';
import Field from '../components/Field.jsx';
import Button from '../components/Button.jsx';
import SmartImage from '../components/SmartImage.jsx';
import Reveal from '../components/Reveal.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' });
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    setErrors((p) => ({ ...p, [name]: undefined }));
  };

  const validate = () => {
    const next = {};
    if (form.name.trim().length < 2) next.name = 'Tell us your name';
    if (!/^\S+@\S+\.\S+$/.test(form.email)) next.email = 'Enter a valid email address';
    if (form.password.length < 8) next.password = 'Use at least 8 characters';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setBusy(true);
    try {
      const user = await register(form);
      toast.success(`Welcome, ${user.name.split(' ')[0]}.`);
      navigate('/reserve');
    } catch (err) {
      if (err.details?.length) setErrors(Object.fromEntries(err.details.map((d) => [d.field, d.message])));
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <PageTransition>
      <section className="grid min-h-screen lg:grid-cols-[1fr_1fr]">
        <div className="relative order-2 hidden lg:order-1 lg:block">
          <SmartImage
            src="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&h=1600&q=80"
            alt=""
            className="absolute inset-0 h-full w-full"
          />
          <div className="absolute inset-0 bg-gradient-to-l from-char-950 via-char-950/40 to-transparent" />
        </div>

        <div className="order-1 flex items-center justify-center px-[var(--shell-x)] py-32 lg:order-2">
          <Reveal from="up" className="w-full max-w-sm">
            <span className="eyebrow">Create an account</span>
            <h1 className="display mt-5 text-5xl text-cream-50">Join the book.</h1>
            <p className="mt-5 text-sm leading-relaxed text-cream-400">
              Not a loyalty scheme. Just somewhere for your bookings and the things the kitchen ought
              to know about you.
            </p>

            <form onSubmit={submit} className="mt-11 space-y-8" noValidate>
              <Field label="Name" name="name" value={form.name} onChange={handleChange} error={errors.name} autoComplete="name" required />
              <Field label="Email" name="email" type="email" value={form.email} onChange={handleChange} error={errors.email} autoComplete="email" required />
              <Field label="Phone (optional)" name="phone" type="tel" value={form.phone} onChange={handleChange} autoComplete="tel" />
              <Field label="Password" name="password" type="password" value={form.password} onChange={handleChange} error={errors.password} autoComplete="new-password" hint="At least eight characters." required />
              <Button type="submit" size="lg" disabled={busy} className="w-full">
                {busy ? 'Creating account…' : 'Create account'}
              </Button>
            </form>

            <p className="mt-9 text-center text-sm text-cream-400">
              Already have one? <Link to="/login" className="text-brass underline underline-offset-4">Sign in</Link>
            </p>
          </Reveal>
        </div>
      </section>
    </PageTransition>
  );
}
