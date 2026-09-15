import { CalendarDays, Users } from 'lucide-react';
import SmartImage from './SmartImage.jsx';
import Button from './Button.jsx';

const dateFmt = new Intl.DateTimeFormat('en-GB', { weekday: 'long', day: 'numeric', month: 'long' });
const timeFmt = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit' });
const money = (n) => new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP', maximumFractionDigits: 0 }).format(n);

export default function EventCard({ event }) {
  const seatsLeft = Math.max(event.seats - event.seatsTaken, 0);

  return (
    <article className="card-surface group grid h-full gap-0 md:grid-cols-[0.85fr_1.15fr]">
      <SmartImage
        src={event.image}
        alt={event.title}
        className="h-56 w-full md:h-full"
        imgClassName="transition-transform duration-[1200ms] ease-smooth group-hover:scale-105"
      />

      <div className="flex flex-col p-8">
        <span className="eyebrow">{event.kind.replace(/-/g, ' ')}</span>
        <h3 className="mt-3 font-display text-3xl font-light text-cream-50">{event.title}</h3>
        <p className="mt-3 text-sm leading-relaxed text-cream-400">{event.summary}</p>

        <dl className="mt-6 space-y-2.5 text-sm">
          <div className="flex items-center gap-3 text-cream-200">
            <CalendarDays size={14} className="shrink-0 text-brass" />
            <dd>{dateFmt.format(new Date(event.startsAt))} &middot; {timeFmt.format(new Date(event.startsAt))}</dd>
          </div>
          <div className="flex items-center gap-3 text-cream-200">
            <Users size={14} className="shrink-0 text-brass" />
            <dd>
              {seatsLeft > 0 ? `${seatsLeft} of ${event.seats} seats left` : 'Fully booked'}
              {event.host ? ` · hosted by ${event.host}` : ''}
            </dd>
          </div>
        </dl>

        <div className="mt-auto flex flex-wrap items-center justify-between gap-4 border-t border-char-700 pt-6">
          <span className="font-display text-2xl font-light text-brass">
            {money(event.pricePerHead)}
            <span className="ml-2 font-sans text-[0.6rem] uppercase tracking-[0.2em] text-cream-600">per head</span>
          </span>
          <Button to="/visit" variant="outline" size="sm" disabled={seatsLeft === 0}>
            {seatsLeft === 0 ? 'Join the list' : 'Enquire'}
          </Button>
        </div>
      </div>
    </article>
  );
}
