import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { KeyRound } from 'lucide-react';
import PageTransition from '../components/PageTransition.jsx';
import Field from '../components/Field.jsx';
import Button from '../components/Button.jsx';
import SmartImage from '../components/SmartImage.jsx';
import Reveal from '../components/Reveal.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    setErrors((p) => ({ ...p, [name]: undefined }));
  };

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const user = await login(form);
      toast.success(`Welcome back, ${user.name.split(' ')[0]}.`);
      navigate(location.state?.from || '/account', { replace: true });
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
        <div className="flex items-center justify-center px-[var(--shell-x)] py-32">
          <Reveal from="up" className="w-full max-w-sm">
            <span className="eyebrow">Guests</span>
            <h1 className="display mt-5 text-5xl text-cream-50">Sign in.</h1>
            <p className="mt-5 text-sm leading-relaxed text-cream-400">
              An account keeps your bookings, your dietary notes and the table you usually ask for.
            </p>

            <form onSubmit={submit} className="mt-11 space-y-8" noValidate>
              <Field label="Email" name="email" type="email" value={form.email} onChange={handleChange} error={errors.email} autoComplete="email" required />
              <Field label="Password" name="password" type="password" value={form.password} onChange={handleChange} error={errors.password} autoComplete="current-password" required />
              <Button type="submit" size="lg" disabled={busy} className="w-full">
                {busy ? 'Signing in…' : 'Sign in'}
              </Button>
            </form>

            <button
              type="button"
              onClick={() => setForm({ email: 'guest@emberandoak.com', password: 'ember1234' })}
              className="mt-6 flex w-full items-center justify-center gap-2 border border-dashed border-char-600 py-3 font-sans text-[0.62rem] uppercase tracking-[0.2em] text-cream-600 transition hover:border-brass hover:text-brass"
            >
              <KeyRound size={12} /> Use demo credentials
            </button>

            <p className="mt-9 text-center text-sm text-cream-400">
              New here? <Link to="/register" className="text-brass underline underline-offset-4">Create an account</Link>
            </p>
          </Reveal>
        </div>

        <div className="relative hidden lg:block">
          <SmartImage
            src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&h=1600&q=80"
            alt=""
            className="absolute inset-0 h-full w-full"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-char-950 via-char-950/35 to-transparent" />
          <div className="absolute bottom-16 left-12 right-12">
            <p className="display text-4xl text-cream-50">
              “Constraints, it turns out, are a reasonable substitute for talent.”
            </p>
            <p className="mt-6 font-sans text-[0.6rem] uppercase tracking-[0.28em] text-cream-400">
              Ines Duarte &middot; Head Chef
            </p>
          </div>
        </div>
      </section>
    </PageTransition>
  );
}
